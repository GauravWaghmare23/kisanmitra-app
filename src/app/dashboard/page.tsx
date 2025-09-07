'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface User {
  userId: string;
  name: string;
  phone: string;
  userType: 'farmer' | 'distributor' | 'retailer';
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
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCrops: 0,
    activeCrops: 0,
    totalRevenue: 0,
    pendingTransactions: 0,
  });

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchUserData(parsedUser);
  }, [router]);

  const fetchUserData = async (userData: User) => {
    try {
      setLoading(true);

      if (userData.userType === 'farmer') {
        // Fetch farmer's crops
        const response = await fetch(`/api/crops?farmerId=${userData.userId}`);
        const data = await response.json();

        if (data.success) {
          setCrops(data.data);
          setStats({
            totalCrops: data.data.length,
            activeCrops: data.data.filter((crop: Crop) => crop.status !== 'sold').length,
            totalRevenue: data.data.reduce((sum: number, crop: Crop) => sum + (crop.pricePerUnit * crop.quantity), 0),
            pendingTransactions: data.data.filter((crop: Crop) => crop.status === 'harvested').length,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
                Welcome, {user.name}
              </h1>
              <p className="text-gray-600 capitalize">
                {user.userType} Dashboard
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Crops</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCrops}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Crops</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeCrops}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {user.userType === 'farmer' && (
              <Link
                href="/farmer/add-crop"
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center font-medium transition"
              >
                Add New Crop
              </Link>
            )}
            <Link
              href="/scan"
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center font-medium transition"
            >
              Scan QR Code
            </Link>
            <Link
              href="/profile"
              className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center font-medium transition"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Recent Crops */}
        {user.userType === 'farmer' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Your Crops</h2>
              <Link
                href="/farmer/crops"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                View All
              </Link>
            </div>

            {crops.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No crops added yet</p>
                <Link
                  href="/farmer/add-crop"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Add Your First Crop
                </Link>
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
                        Price/Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {crops.slice(0, 5).map((crop) => (
                      <tr key={crop.$id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{crop.name}</div>
                          <div className="text-sm text-gray-500">{crop.cropId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {crop.quantity} {crop.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            crop.status === 'harvested' ? 'bg-green-100 text-green-800' :
                            crop.status === 'with_distributor' ? 'bg-yellow-100 text-yellow-800' :
                            crop.status === 'with_retailer' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {crop.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${crop.pricePerUnit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/crop/${crop.cropId}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;