import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType');

    if (!userType) {
      return NextResponse.json(
        { success: false, message: 'User type is required' },
        { status: 400 }
      );
    }

    let statusFilter: string;
    
    // Determine which crops are available based on user type
    switch (userType) {
      case 'distributor':
        statusFilter = 'harvested'; // Distributors can receive crops from farmers
        break;
      case 'retailer':
        statusFilter = 'with_distributor'; // Retailers can receive crops from distributors
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid user type' },
          { status: 400 }
        );
    }

    // Get crops with the appropriate status
    const crops = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CROPS,
      [
        Query.equal('status', statusFilter),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]
    );

    return NextResponse.json({
      success: true,
      data: crops.documents,
    });

  } catch (error: any) {
    console.error('Get available crops error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to get available crops',
        error: error.message,
      },
      { status: 500 }
    );
  }
}