import { NextRequest, NextResponse } from 'next/server';
import { account, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { ID } from 'appwrite';

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, password, userType, address, roleData } = await request.json();

    // Validate required fields
    if (!name || !phone || !email || !password || !userType) {
      return NextResponse.json(
        { success: false, message: 'Name, phone, email, password, and userType are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Create user account in Appwrite
    const userId = ID.unique();

    // Create account with email and password
    await account.create(userId, email, password, name);

    // Prepare user data for database
    const userData: any = {
      name,
      phone,
      email,
      userType,
      verified: false,
      preferredLanguage: 'english',
    };

    // Add address if provided
    if (address) {
      userData.village = address.village;
      userData.district = address.district;
      userData.state = address.state;
      userData.pincode = address.pincode;
    }

    // Add role-specific data
    if (userType === 'farmer' && roleData) {
      userData.farmSize = roleData.farmSize;
      userData.cropTypes = roleData.cropTypes ? JSON.stringify(roleData.cropTypes) : null;
      if (roleData.bankAccount) {
        userData.bankAccountNumber = roleData.bankAccount.accountNumber;
        userData.bankIFSC = roleData.bankAccount.ifscCode;
        userData.bankName = roleData.bankAccount.bankName;
      }
    } else if (userType === 'distributor' && roleData) {
      userData.companyName = roleData.companyName;
      userData.gstNumber = roleData.gstNumber;
      userData.licenseNumber = roleData.licenseNumber;
    } else if (userType === 'retailer' && roleData) {
      userData.storeName = roleData.storeName;
      userData.storeType = roleData.storeType;
      userData.licenseNumber = roleData.licenseNumber;
    }

    // Create user document in database
    const userDoc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId,
      userData
    );

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: userDoc.$id,
        name: userDoc.name,
        phone: userDoc.phone,
        email: userDoc.email,
        userType: userDoc.userType,
      },
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Registration failed',
        error: error.message,
      },
      { status: 500 }
