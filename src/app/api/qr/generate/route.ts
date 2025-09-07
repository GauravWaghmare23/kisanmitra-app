import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const { cropId, data } = await request.json();

    if (!cropId) {
      return NextResponse.json(
        { success: false, message: 'Crop ID is required' },
        { status: 400 }
      );
    }

    // Create QR code data
    const qrData = {
      cropId,
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/crop/${cropId}`,
      ...data,
    };

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        qrCode: qrCodeDataURL,
        qrData,
      },
    });

  } catch (error: any) {
    console.error('Generate QR code error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to generate QR code',
        error: error.message,
      },
      { status: 500 }
    );
  }
}