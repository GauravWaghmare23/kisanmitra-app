import React from 'react';
import Link from 'next/link';

interface CropJourneyStep {
  step: string;
  handler: string;
  handlerName: string;
  timestamp: string;
  location: string;
  notes: string;
}

interface CropData {
  cropId: string;
  name: string;
  variety?: string;
  quantity: number;
  unit: string;
  harvestDate: string;
  farmer: {
    name: string;
    phone: string;
    address?: {
      village: string;
      district: string;
      state: string;
    };
  };
  journey: CropJourneyStep[];
  photos?: string[];
  certifications?: string[];
  qualityScore?: number;
  farmLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

// Mock data for demonstration
const mockCropData: CropData = {
  cropId: 'CROP_1703123456789',
  name: 'Organic Tomatoes',
  variety: 'Roma',
  quantity: 100,
  unit: 'kg',
  harvestDate: '2024-12-20',
  farmer: {
    name: 'Rajesh Kumar',
    phone: '+91-9876543210',
    address: {
      village: 'Green Valley',
      district: 'Amritsar',
      state: 'Punjab'
    }
  },
  journey: [
    {
      step: 'Harvested',
      handler: 'farmer_001',
      handlerName: 'Rajesh Kumar',
      timestamp: '2024-12-20T10:00:00Z',
      location: 'Green Valley Farm, Punjab',
      notes: 'Freshly harvested organic tomatoes'
    },
    {
      step: 'Quality Check',
      handler: 'inspector_001',
      handlerName: 'Quality Inspector',
      timestamp: '2024-12-20T14:00:00Z',
      location: 'Farm Gate Inspection Center',
      notes: 'Passed all quality parameters'
    },
    {
      step: 'With Distributor',
      handler: 'distributor_001',
      handlerName: 'ABC Distributors',
      timestamp: '2024-12-21T09:00:00Z',
      location: 'Distribution Center, Amritsar',
      notes: 'Received and stored in cold storage'
    },
    {
      step: 'With Retailer',
      handler: 'retailer_001',
      handlerName: 'Fresh Mart',
      timestamp: '2024-12-22T11:00:00Z',
      location: 'Fresh Mart Store, Delhi',
      notes: 'Ready for consumer purchase'
    }
  ],
  photos: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
  certifications: ['Organic Certified', 'GAP Certified'],
  qualityScore: 4.5,
  farmLocation: {
    latitude: 31.6340,
    longitude: 74.8723,
    address: 'Green Valley Farm, Punjab'
  }
};

export default function CropDetailPage({ params }: { params: { cropId: string } }) {
  // In a real app, you would fetch data based on params.cropId
  const cropData = mockCropData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {cropData.name}
                </h1>
                <p className="text-lg text-gray-600">
                  Crop ID: <span className="font-mono">{cropData.cropId}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {cropData.quantity} {cropData.unit}
                </div>
                <div className="text-sm text-gray-500">Quantity</div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Variety</div>
                <div className="font-semibold">{cropData.variety || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Harvest Date</div>
                <div className="font-semibold">
                  {new Date(cropData.harvestDate).toLocaleDateString()}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Quality Score</div>
                <div className="font-semibold flex items-center">
                  {cropData.qualityScore}/5
                  <div className="ml-2 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(cropData.qualityScore || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Farmer Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Farmer Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Farmer Name</div>
                <div className="font-semibold">{cropData.farmer.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Contact</div>
                <div className="font-semibold">{cropData.farmer.phone}</div>
              </div>
              {cropData.farmer.address && (
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500">Farm Location</div>
                  <div className="font-semibold">
                    {cropData.farmer.address.village}, {cropData.farmer.address.district}, {cropData.farmer.address.state}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Journey Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-6">Crop Journey</h2>
            <div className="space-y-6">
              {cropData.journey.map((step, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{step.step}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(step.timestamp).toLocaleDateString()} {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{step.notes}</p>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{step.handlerName}</span> • {step.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {cropData.certifications && cropData.certifications.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Certifications</h2>
              <div className="flex flex-wrap gap-2">
                {cropData.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {cropData.photos && cropData.photos.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Crop Photos</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {cropData.photos.map((photo, index) => (
                  <div key={index} className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Photo {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blockchain Verification */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-green-900">Blockchain Verified</h3>
            </div>
            <p className="text-green-800 mb-4">
              This crop's journey is recorded on the blockchain for complete transparency and immutability.
            </p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition">
              View Blockchain Details
            </button>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link
              href="/scan"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Back to Scanner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
