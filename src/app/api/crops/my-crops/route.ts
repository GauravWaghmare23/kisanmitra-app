import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');

    if (!userId || !userType) {
      return NextResponse.json(
        { success: false, message: 'User ID and user type are required' },
        { status: 400 }
      );
    }

    let queries: string[] = [];

    // Build queries based on user type
    switch (userType) {
      case 'farmer':
        queries = [
          Query.equal('farmerId', userId),
          Query.orderDesc('$createdAt')
        ];
        break;
      case 'distributor':
        queries = [
          Query.equal('currentHolderId', userId),
          Query.equal('status', 'with_distributor'),
          Query.orderDesc('$createdAt')
        ];
        break;
      case 'retailer':
        queries = [
          Query.equal('currentHolderId', userId),
          Query.equal('status', 'with_retailer'),
          Query.orderDesc('$createdAt')
        ];
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid user type' },
          { status: 400 }
        );
    }

    // Get crops for the user
    const crops = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CROPS,
      queries
    );

    return NextResponse.json({
      success: true,
      data: crops.documents,
    });

  } catch (error: any) {
    console.error('Get my crops error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to get crops',
        error: error.message,
      },
      { status: 500 }
    );
  }
}