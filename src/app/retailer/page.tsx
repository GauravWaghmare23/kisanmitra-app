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

const RetailerDashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [availableCrops, setAvailableCrops] = useState<Crop[]>([]);
  const [myCrops, setMyCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.userType !== 'retailer') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchCrops(parsedUser);
  }, [router]);

  const fetchCrops = async (userData: User) => {
    try {
      setLoading(true);
      
      // Fetch available crops (from distributors)
      const availableResponse = await fetch('/api/crops/available?userType=retailer');
      if (availableResponse.ok) {
        const availableData = await availableResponse.json();
        if (availableData.success) {
          setAvailableCrops(availableData.data);
        }
      }

      // Fetch crops currently with this retailer
      const myResponse = await fetch(`/api/crops/my-crops?userId=${userData.userId}&userType=retailer`);
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

    setProcessing(cropId);

    try {
      const response = await fetch(`/api/crops/${cropId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toUserId: user.userId,
          toUserName: user.name,
          toUserType: 'retailer',
          status: 'with_retailer',
          location: 'Retail Store',
          notes: 'Received by retailer for consumer sale',
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
      setProcessing(null);
    }
  };

  const handleSellCrop = async (cropId: string) => {
    const customerInfo = prompt('Enter customer information (Name|Contact):');
    if (!customerInfo) return;

    const [customerName, contact] = customerInfo.split('|');
    if (!customerName) {
      toast.error('Please provide customer name');
      return;
    }

    setProcessing(cropId);

    try {
      const response = await fetch(`/api/crops/${cropId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toUserId: 'consumer_temp',
          toUserName: customerName.trim(),
          toUserType: 'consumer',
          status: 'sold',
          location: 'Consumer',
          notes: `Sold to customer: ${customerName.trim()}${contact ? ` (${contact.trim()})` : ''}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Crop sold successfully!');
        fetchCrops(user);
      } else {
        toast.error(data.message || 'Failed to sell crop');
      }
    } catch (error) {
      console.error('Error selling crop:', error);
      toast.error('Failed to sell crop');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                Retailer Dashboard
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Products</p>
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
                <p className="text-sm font-medium text-gray-600">In Store</p>
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
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${myCrops.reduce((sum, crop) => sum + (crop.pricePerUnit * crop.quantity), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Products from Distributors */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Available Products from Distributors</h2>
          
          {availableCrops.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No products available from distributors</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Value
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
                        ${(crop.pricePerUnit * crop.quantity).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleReceiveCrop(crop.cropId)}
                          disabled={processing === crop.cropId}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                          {processing === crop.cropId ? 'Receiving...' : 'Receive Product'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* My Store Inventory */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Store Inventory</h2>
          
          {myCrops.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No products in store inventory</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
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
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
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
                          onClick={() => handleSellCrop(crop.cropId)}
                          disabled={processing === crop.cropId}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50"
                        >
                          {processing === crop.cropId ? 'Selling...' : 'Sell to Customer'}
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

export default RetailerDashboard;