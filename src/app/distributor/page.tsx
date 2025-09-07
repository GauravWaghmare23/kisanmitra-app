'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface User {
  userId: string;
  name: string;
  phone: string;
  userType: string;
}

interface Crop {
  $id: string;
  cropId: string;
  name: string;
  quantity: number;
  unit: string;
  status: string;
  harvestDate: string;
  pricePerUnit: number;
  farmerId: string;
  currentHolderId?: string;
}

const DistributorDashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [availableCrops, setAvailableCrops] = useState<Crop[]>([]);
  const [myCrops, setMyCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.userType !== 'distributor') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchCrops(parsedUser);
  }, [router]);

  const fetchCrops = async (userData: User) => {
    try {
      setLoading(true);
      
      // Fetch available crops (from farmers)
      const availableResponse = await fetch('/api/crops/available?userType=distributor');
      if (availableResponse.ok) {
        const availableData = await availableResponse.json();
        if (availableData.success) {
          setAvailableCrops(availableData.data);
        }
      }

      // Fetch crops currently with this distributor
      const myResponse = await fetch(`/api/crops/my-crops?userId=${userData.userId}&userType=distributor`);
      if (myResponse.ok) {
        const myData = await myResponse.json();
        if (myData.success) {
          setMyCrops(myData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching crops:', error);
      toast.error('Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveCrop = async (cropId: string) => {
    if (!user) return;

    setTransferring(cropId);

    try {
      const response = await fetch(`/api/crops/${cropId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toUserId: user.userId,
          toUserName: user.name,
          toUserType: 'distributor',
          status: 'with_distributor',
          location: 'Distribution Center',
          notes: 'Received by distributor for processing and distribution',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Crop received successfully!');
        fetchCrops(user);
      } else {
        toast.error(data.message || 'Failed to receive crop');
      }
    } catch (error) {
      console.error('Error receiving crop:', error);
      toast.error('Failed to receive crop');
    } finally {
      setTransferring(null);
    }
  };

  const handleTransferToRetailer = async (cropId: string) => {
    const retailerInfo = prompt('Enter retailer information (Name|Location):');
    if (!retailerInfo) return;

    const [retailerName, location] = retailerInfo.split('|');
    if (!retailerName || !location) {
      toast.error('Please provide retailer name and location separated by |');
      return;
    }

    setTransferring(cropId);

    try {
      const response = await fetch(`/api/crops/${cropId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toUserId: 'retailer_temp', // In real app, you'd select from registered retailers
          toUserName: retailerName.trim(),
          toUserType: 'retailer',
          status: 'with_retailer',
          location: location.trim(),
          notes: `Transferred to retailer: ${retailerName.trim()}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Crop transferred to retailer successfully!');
        fetchCrops(user);
      } else {
        toast.error(data.message || 'Failed to transfer crop');
      }
    } catch (error) {
      console.error('Error transferring crop:', error);
      toast.error('Failed to transfer crop');
    } finally {
      setTransferring(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Distributor Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome, {user.name}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Main Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Crops</p>
                <p className="text-2xl font-semibold text-gray-900">{availableCrops.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Inventory</p>
                <p className="text-2xl font-semibold text-gray-900">{myCrops.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${myCrops.reduce((sum, crop) => sum + (crop.pricePerUnit * crop.quantity), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Crops from Farmers */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Available Crops from Farmers</h2>
          
          {availableCrops.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No crops available for distribution</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harvest Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availableCrops.map((crop) => (
                    <tr key={crop.$id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{crop.name}</div>
                        <div className="text-sm text-gray-500">{crop.cropId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {crop.quantity} {crop.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${crop.pricePerUnit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(crop.harvestDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleReceiveCrop(crop.cropId)}
                          disabled={transferring === crop.cropId}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                          {transferring === crop.cropId ? 'Receiving...' : 'Receive Crop'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* My Inventory */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">My Inventory</h2>
          
          {myCrops.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No crops in inventory</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myCrops.map((crop) => (
                    <tr key={crop.$id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{crop.name}</div>
                        <div className="text-sm text-gray-500">{crop.cropId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {crop.quantity} {crop.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {crop.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(crop.pricePerUnit * crop.quantity).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/crop/${crop.cropId}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleTransferToRetailer(crop.cropId)}
                          disabled={transferring === crop.cropId}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50"
                        >
                          {transferring === crop.cropId ? 'Transferring...' : 'Transfer to Retailer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistributorDashboard;