import { NextRequest, NextResponse } from 'next/server';
import { updateTrackingStatusInDB, getTrackingByIdFromDB } from '@/lib/db-service';
import { sendTrackingLocationUpdatedEmail } from '@/lib/email';

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

    // Fetch full details to send email
    try {
      const fullTracking = await getTrackingByIdFromDB(id);
      if (fullTracking && fullTracking.user) {
        // Determine location name based on index
        let locationName = '';
        const idx = fullTracking.currentLocationIndex;
        
        if (idx === 0) {
          locationName = fullTracking.startLocation?.name || 'Start Location';
        } else if (idx <= fullTracking.stopovers.length) {
          locationName = fullTracking.stopovers[idx - 1]?.name || 'Transit Location';
        } else {
          locationName = fullTracking.endLocation?.name || 'Destination';
        }

        // Determine message context
        let message = '';
        if (status === 'completed') {
          message = 'Package has been delivered successfully.';
        } else if (status === 'cancelled') {
          message = 'Delivery has been cancelled.';
        } else if (idx === 0) {
          message = 'Package has been picked up.';
        } else if (idx > fullTracking.stopovers.length) {
          message = 'Package has arrived at destination city.';
        } else {
          message = 'Package has arrived at a transit facility.';
        }

        await sendTrackingLocationUpdatedEmail({
          userEmail: fullTracking.user.email,
          userName: fullTracking.user.name,
          trackingId: fullTracking.id,
          packageName: fullTracking.name,
          newLocation: locationName,
          status: fullTracking.status,
          message: message
        });
      }
    } catch (emailError) {
      console.error('Failed to send location update email:', emailError);
      // Continue anyway
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
