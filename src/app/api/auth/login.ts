import { NextRequest, NextResponse } from 'next/server';
import { account, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'appwrite';

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    // Validate required fields
    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    // For demo purposes, use phone as password if not provided
    const loginPassword = password || phone;

    // Find user by phone in database
    const users = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal('phone', phone)]
    );

    if (users.documents.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const user = users.documents[0];

    // Create session with Appwrite
    const emailForAppwrite = user.email || `${phone}@example.com`;
    const session = await account.createSession(user.$id, loginPassword);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.$id,
        name: user.name,
        phone: user.phone,
        userType: user.userType,
        sessionId: session.$id,
      },
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Login failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
