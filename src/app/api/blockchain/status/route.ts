import { NextRequest, NextResponse } from 'next/server';
import { blockchainService } from '@/lib/blockchain';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cropId = searchParams.get('cropId');

    if (!cropId) {
      return NextResponse.json(
        { success: false, message: 'Crop ID is required' },
        { status: 400 }
      );
    }

    // Check if blockchain service is available
    if (!blockchainService.isAvailable()) {
      return NextResponse.json({
        success: true,
        message: 'Blockchain service not available (demo mode)',
        data: {
          available: false,
          contractAddress: blockchainService.getContractAddress(),
          network: 'Shardeum Testnet',
        },
      });
    }

    // Get crop data from blockchain
    const cropData = await blockchainService.getCrop(cropId);
    const journey = await blockchainService.getCropJourney(cropId);

    return NextResponse.json({
      success: true,
      data: {
        available: true,
        crop: cropData,
        journey: journey,
        contractAddress: blockchainService.getContractAddress(),
        network: 'Shardeum Testnet',
      },
    });

  } catch (error: any) {
    console.error('Blockchain status error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to get blockchain status',
        error: error.message,
      },
      { status: 500 }
    );
  }
}