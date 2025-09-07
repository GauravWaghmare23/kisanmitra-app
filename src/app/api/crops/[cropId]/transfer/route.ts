import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { blockchainService } from '@/lib/blockchain';

export async function POST(
  request: NextRequest,
  { params }: { params: { cropId: string } }
) {
  try {
    const { cropId } = params;
    const { toUserId, toUserName, toUserType, status, location, notes, amount, pricePerUnit } = await request.json();

    // Get current crop
    const crop = await DatabaseService.getCropByCropId(cropId);
    if (!crop) {
      return NextResponse.json(
        { success: false, message: 'Crop not found' },
        { status: 404 }
      );
    }

    // Update crop status and current holder
    await DatabaseService.updateCrop(cropId, {
      status,
      currentHolderId: toUserId,
    });

    // Add journey step
    await DatabaseService.addJourneyStep({
      cropId,
      step: status,
      handlerId: toUserId,
      handlerName: toUserName,
      handlerType: toUserType,
      location,
      notes: notes || `Transferred to ${toUserName}`,
      verified: true,
    });

    // Create transaction record if amount is provided
    if (amount && pricePerUnit) {
      await DatabaseService.createTransaction({
        cropId,
        fromUserId: crop.currentHolderId || crop.farmerId,
        toUserId,
        amount,
        currency: 'USD',
        status: 'completed',
        quantity: crop.quantity,
        pricePerUnit,
        notes: `Transfer from ${crop.farmerId} to ${toUserId}`,
        completedAt: new Date().toISOString(),
      });
    }

    // Update blockchain (optional)
    try {
      await blockchainService.updateCropStatus(cropId, status, location, notes || '');
    } catch (blockchainError) {
      console.log('Blockchain update failed, continuing without it');
    }

    return NextResponse.json({
      success: true,
      message: 'Crop transferred successfully',
    });

  } catch (error: any) {
    console.error('Transfer crop error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to transfer crop',
        error: error.message,
      },
      { status: 500 }
    );
  }
}