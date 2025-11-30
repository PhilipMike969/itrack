import { NextRequest, NextResponse } from 'next/server';
import { getTrackingByIdFromDB, updateTrackingInDB, deleteTrackingFromDB } from '@/lib/db-service';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const tracking = await getTrackingByIdFromDB(id);
    
    if (!tracking) {
      return NextResponse.json(
        { error: 'Tracking not found' },
        { status: 404 }
      );
    }

    // Ensure dates are properly serialized
    const serializeDate = (value: any) => {
      if (!value) return null;
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'string') return value; // Already a string
      return null;
    };

    const serializedTracking = {
      ...tracking,
      createdAt: serializeDate(tracking.createdAt),
      updatedAt: serializeDate(tracking.updatedAt),
      estimatedDelivery: serializeDate(tracking.estimatedDelivery),
    };
    
    console.log('Returning tracking data:', serializedTracking); // Debug log
    console.log('Image URL in response:', serializedTracking.imageUrl); // Debug log
    
    return NextResponse.json(serializedTracking);
  } catch (error) {
    console.error('Error fetching tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // Process the update data to ensure proper types
    const updateData: any = {};
    
    if (body.name !== undefined) {
      updateData.name = body.name;
    }
    
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    
    if (body.currentLocationIndex !== undefined) {
      updateData.currentLocationIndex = body.currentLocationIndex;
    }
    
    if (body.estimatedDelivery !== undefined && body.estimatedDelivery !== '') {
      // Convert ISO string to Date object
      updateData.estimatedDelivery = new Date(body.estimatedDelivery);
    }
    
    const updatedTracking = await updateTrackingInDB(id, updateData);
    
    if (!updatedTracking) {
      return NextResponse.json(
        { error: 'Tracking not found' },
        { status: 404 }
      );
    }

    // Ensure dates are properly serialized
    const serializeDate = (value: any) => {
      if (!value) return null;
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'string') return value; // Already a string
      return null;
    };

    const serializedTracking = {
      ...updatedTracking,
      createdAt: serializeDate(updatedTracking.createdAt),
      updatedAt: serializeDate(updatedTracking.updatedAt),
      estimatedDelivery: serializeDate(updatedTracking.estimatedDelivery),
    };
    
    return NextResponse.json(serializedTracking);
  } catch (error) {
    console.error('Error updating tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const success = await deleteTrackingFromDB(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Tracking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Tracking deleted successfully' });
  } catch (error) {
    console.error('Error deleting tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
