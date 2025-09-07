'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface BlockchainStatus {
  available: boolean;
  contractAddress?: string;
  network?: string;
  crop?: any;
  journey?: any[];
}

const BlockchainPage: React.FC = () => {
  const [status, setStatus] = useState<BlockchainStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [cropId, setCropId] = useState('');
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null);

  const checkBlockchainStatus = async (testCropId?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blockchain/status?cropId=${testCropId || 'CROP_1703123456789'}`);
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
      } else {
        toast.error(data.message || 'Failed to check blockchain status');
      }
    } catch (error) {
      console.error('Error checking blockchain status:', error);
      toast.error('Failed to connect to blockchain');
    } finally {
      setLoading(false);
    }
  };

  const deployContract = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blockchain/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDeploymentStatus(data.data);
        toast.success('Contract deployed successfully!');
      } else {
        toast.error(data.message || 'Contract deployment failed');
      }
    } catch (error) {
      console.error('Error deploying contract:', error);
      toast.error('Contract deployment failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBlockchainStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Blockchain Integration
            </h1>
            <p className="text-lg text-gray-600">
              Monitor and manage blockchain operations for crop tracking
            </p>
          </div>

          {/* Blockchain Status */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Blockchain Status</h2>
              <button
                onClick={() => checkBlockchainStatus(cropId)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Refresh Status'}
              </button>
            </div>

            {status ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      status.available ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="font-medium">
                      Status: {status.available ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Network: </span>
                    <span className="text-gray-600">{status.network || 'Unknown'}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Contract Address: </span>
                    <span className="text-gray-600 font-mono text-sm break-all">
                      {status.contractAddress || 'Not deployed'}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Network Information</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Shardeum Testnet</p>
                    <p>• High scalability, low transaction costs</p>
                    <p>• Ideal for high-volume crop tracking</p>
                    <p>• Decentralized and transparent</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading blockchain status...</p>
              </div>
            )}
          </div>

          {/* Contract Deployment */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Smart Contract Management</h2>
            
            {deploymentStatus ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-green-900">Contract Deployed Successfully</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Contract Address:</span>
                    <p className="font-mono text-green-800 break-all">{deploymentStatus.contractAddress}</p>
                  </div>
                  <div>
                    <span className="font-medium">Transaction Hash:</span>
                    <p className="font-mono text-green-800 break-all">{deploymentStatus.transactionHash}</p>
                  </div>
                  <div>
                    <span className="font-medium">Block Number:</span>
                    <p className="text-green-800">{deploymentStatus.blockNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium">Gas Used:</span>
                    <p className="text-green-800">{deploymentStatus.gasUsed}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Deploy the CropTracking smart contract to the blockchain</p>
                <button
                  onClick={deployContract}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Deploying...' : 'Deploy Contract'}
                </button>
              </div>
            )}
          </div>

          {/* Crop Lookup */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Blockchain Crop Lookup</h2>
            
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                value={cropId}
                onChange={(e) => setCropId(e.target.value)}
                placeholder="Enter Crop ID (e.g., CROP_1703123456789)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => checkBlockchainStatus(cropId)}
                disabled={loading || !cropId}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
              >
                Lookup
              </button>
            </div>

            {status?.crop && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Blockchain Data</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Crop ID:</span>
                    <p className="text-blue-800">{status.crop.cropId}</p>
                  </div>
                  <div>
                    <span className="font-medium">Farmer:</span>
                    <p className="font-mono text-blue-800 break-all">{status.crop.farmer}</p>
                  </div>
                  <div>
                    <span className="font-medium">Current Handler:</span>
                    <p className="font-mono text-blue-800 break-all">{status.crop.currentHandler}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <p className="text-blue-800">{status.crop.status}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Blockchain Features</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Immutable Records</h3>
                    <p className="text-gray-600 text-sm">All crop data is permanently recorded on the blockchain</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Secure Transfers</h3>
                    <p className="text-gray-600 text-sm">Cryptographically secure crop ownership transfers</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Transparent Journey</h3>
                    <p className="text-gray-600 text-sm">Complete traceability from farm to consumer</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Low Cost Transactions</h3>
                    <p className="text-gray-600 text-sm">Shardeum's efficient consensus for minimal fees</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Fraud Prevention</h3>
                    <p className="text-gray-600 text-sm">Eliminates counterfeit products and false claims</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Multi-Party Trust</h3>
                    <p className="text-gray-600 text-sm">Trustless interactions between all stakeholders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainPage;