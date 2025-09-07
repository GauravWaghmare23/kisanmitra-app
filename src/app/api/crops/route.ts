import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { DatabaseService } from '@/lib/database';
import { blockchainService } from '@/lib/blockchain';
import { ID } from 'node-appwrite';

export async function POST(request: NextRequest) {
  try {
    const cropData = await request.json();
    
    // Generate unique crop ID
    const cropId = `CROP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create crop in database
    const crop = await DatabaseService.createCrop({
      ...cropData,
      cropId,
      status: 'harvested',
      qrCodeData: JSON.stringify({
        cropId,
        name: cropData.name,
        farmerId: cropData.farmerId,
        harvestDate: cropData.harvestDate,
      }),
    });

    // Add to blockchain (optional, can fail gracefully)
    try {
      const blockchainResult = await blockchainService.addCrop(cropId, JSON.stringify({
        name: cropData.name,
        quantity: cropData.quantity,
        farmerId: cropData.farmerId,
      }));
      
      // Update crop with blockchain info
      await DatabaseService.updateCrop(cropId, {
        blockchainTxHash: blockchainResult.txHash,
        blockchainId: cropId,
      });
    } catch (blockchainError) {
      console.log('Blockchain operation failed, continuing without it');
    }

    // Add initial journey step
    await DatabaseService.addJourneyStep({
      cropId,
      step: 'Harvested',
      handlerId: cropData.farmerId,
      handlerName: cropData.farmerName || 'Farmer',
      handlerType: 'farmer',
      location: cropData.farmAddress || 'Farm Location',
      notes: 'Crop harvested and added to system',
      verified: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Crop added successfully',
      data: crop,
    });

  } catch (error: any) {
    console.error('Add crop error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to add crop',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId');
    const cropId = searchParams.get('cropId');

    if (cropId) {
      // Get specific crop
      const crop = await DatabaseService.getCropByCropId(cropId);
      if (!crop) {
        return NextResponse.json(
          { success: false, message: 'Crop not found' },
          { status: 404 }
        );
      }

      // Get crop journey
      const journey = await DatabaseService.getCropJourney(cropId);

      return NextResponse.json({
        success: true,
        data: {
          ...crop,
          journey,
        },
      });
    }

    if (farmerId) {
      // Get crops by farmer
      const crops = await DatabaseService.getCropsByFarmer(farmerId);
      return NextResponse.json({
        success: true,
        data: crops,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Missing required parameters' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Get crops error:', error);
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