'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import QRScanner from '@/components/QRScanner';

const ScanPage: React.FC = () => {
  const router = useRouter();
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleQRScan = (data: string) => {
    setIsScanning(false);
    router.push(`/crop/${data}`);
  };

  const handleScanError = (error: string) => {
    console.error('QR Scan error:', error);
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      router.push(`/crop/${manualInput.trim()}`);
    }
  };

  const startScanning = () => {
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Scan Crop QR Code
            </h1>
            <p className="text-lg text-gray-600">
              Scan a QR code to track a crop's journey or enter a Crop ID manually
            </p>
          </div>

          {/* QR Scanner Section */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="text-center">
              <div className="max-w-md mx-auto mb-6">
                <QRScanner
                  onScan={handleQRScan}
                  onError={handleScanError}
                  isActive={isScanning}
                />
              </div>

              <button
                onClick={() => setIsScanning(!isScanning)}
                disabled={isScanning}
                className={`px-8 py-3 rounded-lg font-medium transition ${
                  isScanning
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isScanning ? 'Stop Scanning' : 'Start Camera Scan'}
              </button>
            </div>
          </div>

          {/* Manual Input Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Or Enter Crop ID Manually
            </h2>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="cropId" className="block text-sm font-medium text-gray-700 mb-2">
                  Crop ID
                </label>
                <input
                  id="cropId"
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter Crop ID (e.g., CROP_1234567890)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
              >
                Track Crop
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Crop IDs are generated when farmers add crops to the system.
                You can find them on QR codes attached to crop packages.
              </p>
            </div>
          </div>

          {/* Demo Section */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Demo Mode
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Try entering: <code className="bg-yellow-100 px-2 py-1 rounded">CROP_1703123456789</code></p>
                  <p>This will show you a sample crop journey with all tracking details.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              How to Use This Scanner
            </h3>
            <ul className="text-blue-800 space-y-1">
              <li>• Point your camera at a QR code on a crop package</li>
              <li>• Or manually enter the Crop ID printed on the package</li>
              <li>• View the complete journey from farm to your table</li>
              <li>• See quality certifications and blockchain verification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanPage;