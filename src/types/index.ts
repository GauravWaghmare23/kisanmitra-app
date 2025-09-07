export interface User {
  $id: string;
  name: string;
  phone: string;
  email?: string;
  userType: 'farmer' | 'distributor' | 'retailer';
  verified: boolean;
  walletAddress?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  farmSize?: string;
  cropTypes?: string; // JSON string
  bankAccountNumber?: string;
  bankIFSC?: string;
  bankName?: string;
  preferredLanguage: 'english' | 'hindi' | 'punjabi';
  companyName?: string;
  gstNumber?: string;
  licenseNumber?: string;
  stripeAccountId?: string;
  storeName?: string;
  storeType?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Crop {
  $id: string;
  cropId: string;
  name: string;
  variety?: string;
  quantity: number;
  unit: string;
  harvestDate: string;
  expiryDate?: string;
  pricePerUnit: number;
  currency: string;
  status: 'harvested' | 'with_distributor' | 'with_retailer' | 'sold';
  farmerId: string;
  currentHolderId?: string;
  farmLatitude?: number;
  farmLongitude?: number;
  farmAddress?: string;
  qrCodeData: string;
  stripePaymentQR?: string;
  blockchainTxHash?: string;
  blockchainId?: string;
  photos?: string; // JSON string
  certifications?: string; // JSON string
  qualityScore?: number;
  notes?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface JourneyStep {
  $id: string;
  cropId: string;
  step: string;
  handlerId: string;
  handlerName: string;
  handlerType: 'farmer' | 'distributor' | 'retailer' | 'inspector';
  location: string;
  notes?: string;
  photos?: string; // JSON string
  verified: boolean;
  timestamp: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Transaction {
  $id: string;
  cropId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  blockchainTxHash?: string;
  gasUsed?: string;
  status: 'pending' | 'completed' | 'failed';
  quantity?: number;
  pricePerUnit?: number;
  notes?: string;
  completedAt?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}