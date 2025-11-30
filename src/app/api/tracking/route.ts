import { NextRequest, NextResponse } from 'next/server';
import { getAllTrackingsFromDB, createTrackingInDB } from '@/lib/db-service';
import { TrackingFormData } from '@/types';

export async function GET() {
  try {
    const trackings = await getAllTrackingsFromDB();
    
    // Ensure dates are properly serialized
    const serializedTrackings = trackings.map(tracking => ({
      ...tracking,
      createdAt: tracking.createdAt instanceof Date ? tracking.createdAt.toISOString() : tracking.createdAt,
      updatedAt: tracking.updatedAt instanceof Date ? tracking.updatedAt.toISOString() : tracking.updatedAt,
      estimatedDelivery: tracking.estimatedDelivery 
        ? (tracking.estimatedDelivery instanceof Date ? tracking.estimatedDelivery.toISOString() : tracking.estimatedDelivery)
        : null,
    }));

    return NextResponse.json(serializedTrackings);
  } catch (error) {
    console.error('Error fetching trackings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Request body received:', body); // Debug log
    console.log('Image URL in request:', body.imageUrl); // Debug log
    
    // Validate required fields
    const requiredFields = ['name', 'startLocation', 'endLocation', 'userName', 'userEmail', 'userPhone'];
    for (const field of requiredFields) {
      if (!body[field]?.trim()) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.userEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const trackingData: TrackingFormData = {
      name: body.name.trim(),
      startLocation: body.startLocation.trim(),
      endLocation: body.endLocation.trim(),
      stopovers: Array.isArray(body.stopovers) 
        ? body.stopovers.filter((s: string) => s.trim()).map((s: string) => s.trim())
        : [],
      userName: body.userName.trim(),
      userEmail: body.userEmail.trim(),
      userPhone: body.userPhone.trim(),
      imageUrl: body.imageUrl || undefined,
    };

    const newTracking = await createTrackingInDB(trackingData);
    
    // Serialize dates
    const serializedTracking = {
      ...newTracking,
      createdAt: newTracking.createdAt instanceof Date ? newTracking.createdAt.toISOString() : newTracking.createdAt,
      updatedAt: newTracking.updatedAt instanceof Date ? newTracking.updatedAt.toISOString() : newTracking.updatedAt,
      estimatedDelivery: newTracking.estimatedDelivery 
        ? (newTracking.estimatedDelivery instanceof Date ? newTracking.estimatedDelivery.toISOString() : newTracking.estimatedDelivery)
        : null,
    };
    
    return NextResponse.json(serializedTracking, { status: 201 });
  } catch (error) {
    console.error('Error creating tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
