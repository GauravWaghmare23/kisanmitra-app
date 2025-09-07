'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Input from '@/components/Input';

interface User {
  userId: string;
  name: string;
  phone: string;
  userType: string;
}

interface CropFormData {
  name: string;
  variety: string;
  quantity: number;
  unit: string;
  harvestDate: string;
  expiryDate: string;
  pricePerUnit: number;
  farmAddress: string;
  farmLatitude: string;
  farmLongitude: string;
  notes: string;
  certifications: string[];
  photos: string[];
}

const AddCropPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [formData, setFormData] = useState<CropFormData>({
    name: '',
    variety: '',
    quantity: 0,
    unit: 'kg',
    harvestDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    pricePerUnit: 0,
    farmAddress: '',
    farmLatitude: '',
    farmLongitude: '',
    notes: '',
    certifications: [],
    photos: [],
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.userType !== 'farmer') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCertificationChange = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(certification)
        ? prev.certifications.filter(c => c !== certification)
        : [...prev.certifications, certification],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setLoading(true);

    try {
      // Create crop
      const cropResponse = await fetch('/api/crops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          farmerId: user.userId,
          farmerName: user.name,
          currency: 'USD',
          certifications: JSON.stringify(formData.certifications),
          photos: JSON.stringify(formData.photos),
        }),
      });

      const cropData = await cropResponse.json();

      if (cropData.success) {
        // Generate QR code
        const qrResponse = await fetch('/api/qr/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cropId: cropData.data.cropId,
            data: {
              name: formData.name,
              farmer: user.name,
              harvestDate: formData.harvestDate,
            },
          }),
        });

        const qrData = await qrResponse.json();

        if (qrData.success) {
          setQrCode(qrData.data.qrCode);
          toast.success('Crop added successfully!');
        } else {
          toast.success('Crop added successfully! (QR generation failed)');
        }
      } else {
        toast.error(cropData.message || 'Failed to add crop');
      }
    } catch (error) {
      console.error('Error adding crop:', error);
      toast.error('Failed to add crop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (qrCode) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mb-6">
                <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Crop Added Successfully!
                </h1>
                <p className="text-gray-600">
                  Your crop has been added to the blockchain and is ready for tracking.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">QR Code for Your Crop</h2>
                <div className="bg-gray-50 p-6 rounded-lg inline-block">
                  <img src={qrCode} alt="Crop QR Code" className="mx-auto" />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Print this QR code and attach it to your crop packaging
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `crop-qr-${Date.now()}.png`;
                    link.href = qrCode;
                    link.click();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Download QR Code
                </button>
                <button
                  onClick={() => {
                    setQrCode('');
                    setFormData({
                      name: '',
                      variety: '',
                      quantity: 0,
                      unit: 'kg',
                      harvestDate: new Date().toISOString().split('T')[0],
                      expiryDate: '',
                      pricePerUnit: 0,
                      farmAddress: '',
                      farmLatitude: '',
                      farmLongitude: '',
                      notes: '',
                      certifications: [],
                      photos: [],
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Add Another Crop
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Add New Crop
              </h1>
              <p className="text-gray-600">
                Add your harvested crop to the tracking system
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Crop Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Tomatoes, Rice, Wheat"
                    required
                  />

                  <Input
                    label="Variety"
                    type="text"
                    name="variety"
                    value={formData.variety}
                    onChange={handleInputChange}
                    placeholder="e.g., Roma, Basmati"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    label="Quantity"
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />

                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">Unit</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="tons">Tons</option>
                      <option value="lbs">Pounds (lbs)</option>
                      <option value="pieces">Pieces</option>
                      <option value="boxes">Boxes</option>
                    </select>
                  </div>

                  <Input
                    label="Price per Unit ($)"
                    type="number"
                    name="pricePerUnit"
                    value={formData.pricePerUnit}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Harvest Date"
                    type="date"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleInputChange}
                    required
                  />

                  <Input
                    label="Expiry Date (Optional)"
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Farm Location */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Farm Location</h2>
                
                <Input
                  label="Farm Address"
                  type="text"
                  name="farmAddress"
                  value={formData.farmAddress}
                  onChange={handleInputChange}
                  placeholder="Complete farm address"
                  required
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Latitude (Optional)"
                    type="text"
                    name="farmLatitude"
                    value={formData.farmLatitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 31.6340"
                  />

                  <Input
                    label="Longitude (Optional)"
                    type="text"
                    name="farmLongitude"
                    value={formData.farmLongitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 74.8723"
                  />
                </div>
              </div>

              {/* Certifications */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Organic Certified',
                    'GAP Certified',
                    'Fair Trade',
                    'Non-GMO',
                    'Pesticide Free',
                    'Sustainable Farming',
                  ].map((cert) => (
                    <label key={cert} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.certifications.includes(cert)}
                        onChange={() => handleCertificationChange(cert)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                  placeholder="Any additional information about the crop..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Crop...
                    </div>
                  ) : (
                    'Add Crop & Generate QR'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCropPage;