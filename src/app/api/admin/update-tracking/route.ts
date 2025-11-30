import { NextRequest, NextResponse } from 'next/server';
import { updateTrackingStatusInDB } from '@/lib/db-service';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, currentLocationIndex } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updated = await updateTrackingStatusInDB(id, status, currentLocationIndex);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Tracking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
