import { db } from '@/db';
import { users, locations, trackings, trackingStopovers, admins } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { generateTrackingId } from './utils';
import { TrackingFormData } from '@/types';

// User operations
export async function createUser(data: { name: string; email: string; phone: string }) {
  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      phone: data.phone,
    })
    .returning();
  
  return user;
}

export async function getUserByEmail(email: string) {
  return await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
}

// Location operations
export async function createLocation(data: { name: string; address: string; latitude?: string; longitude?: string }) {
  const [location] = await db
    .insert(locations)
    .values({
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
    })
    .returning();
  
  return location;
}

// Tracking operations
export async function getAllTrackingsFromDB() {
  const result = await db
    .select({
      id: trackings.id,
      name: trackings.name,
      status: trackings.status,
      currentLocationIndex: trackings.currentLocationIndex,
      estimatedDelivery: trackings.estimatedDelivery,
      imageUrl: trackings.imageUrl,
      createdAt: trackings.createdAt,
      updatedAt: trackings.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
      },
      startLocation: {
        id: locations.id,
        name: locations.name,
        address: locations.address,
        latitude: locations.latitude,
        longitude: locations.longitude,
      },
    })
    .from(trackings)
    .leftJoin(users, eq(trackings.userId, users.id))
    .leftJoin(locations, eq(trackings.startLocationId, locations.id))
    .orderBy(desc(trackings.createdAt));

  // Get end locations and stopovers for each tracking
  const trackingsWithDetails = await Promise.all(
    result.map(async (tracking) => {
      // Get end location
      const endLocationResult = await db
        .select({
          id: locations.id,
          name: locations.name,
          address: locations.address,
          latitude: locations.latitude,
          longitude: locations.longitude,
        })
        .from(locations)
        .leftJoin(trackings, eq(trackings.endLocationId, locations.id))
        .where(eq(trackings.id, tracking.id))
        .limit(1);

      // Get stopovers
      const stopoverResults = await db
        .select({
          id: locations.id,
          name: locations.name,
          address: locations.address,
          latitude: locations.latitude,
          longitude: locations.longitude,
          order: trackingStopovers.order,
        })
        .from(trackingStopovers)
        .leftJoin(locations, eq(trackingStopovers.locationId, locations.id))
        .where(eq(trackingStopovers.trackingId, tracking.id))
        .orderBy(trackingStopovers.order);

      return {
        ...tracking,
        endLocation: endLocationResult[0] || null,
        stopovers: stopoverResults.map(s => ({
          id: s.id!,
          name: s.name!,
          address: s.address!,
          coordinates: s.latitude && s.longitude ? {
            lat: parseFloat(s.latitude),
            lng: parseFloat(s.longitude)
          } : undefined,
        })),
      };
    })
  );

  return trackingsWithDetails;
}

export async function getTrackingByIdFromDB(trackingId: string) {
  // Get main tracking data
  const trackingResult = await db
    .select({
      id: trackings.id,
      name: trackings.name,
      status: trackings.status,
      currentLocationIndex: trackings.currentLocationIndex,
      estimatedDelivery: trackings.estimatedDelivery,
      imageUrl: trackings.imageUrl,
      createdAt: trackings.createdAt,
      updatedAt: trackings.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
      },
      startLocation: {
        id: locations.id,
        name: locations.name,
        address: locations.address,
        latitude: locations.latitude,
        longitude: locations.longitude,
      },
    })
    .from(trackings)
    .leftJoin(users, eq(trackings.userId, users.id))
    .leftJoin(locations, eq(trackings.startLocationId, locations.id))
    .where(eq(trackings.id, trackingId))
    .limit(1);

  if (!trackingResult.length) {
    return null;
  }

  const tracking = trackingResult[0];
  console.log('Raw tracking data from DB:', tracking); // Debug log
  console.log('Image URL from DB:', tracking.imageUrl); // Debug log

  // Get end location
  const endLocationResult = await db
    .select({
      id: locations.id,
      name: locations.name,
      address: locations.address,
      latitude: locations.latitude,
      longitude: locations.longitude,
    })
    .from(locations)
    .leftJoin(trackings, eq(trackings.endLocationId, locations.id))
    .where(eq(trackings.id, trackingId))
    .limit(1);

  // Get stopovers
  const stopoverResults = await db
    .select({
      id: locations.id,
      name: locations.name,
      address: locations.address,
      latitude: locations.latitude,
      longitude: locations.longitude,
      order: trackingStopovers.order,
    })
    .from(trackingStopovers)
    .leftJoin(locations, eq(trackingStopovers.locationId, locations.id))
    .where(eq(trackingStopovers.trackingId, trackingId))
    .orderBy(trackingStopovers.order);

  return {
    ...tracking,
    endLocation: endLocationResult[0] || null,
    stopovers: stopoverResults.map(s => ({
      id: s.id!,
      name: s.name!,
      address: s.address!,
      coordinates: s.latitude && s.longitude ? {
        lat: parseFloat(s.latitude),
        lng: parseFloat(s.longitude)
      } : undefined,
    })),
  };
}

export async function createTrackingInDB(data: TrackingFormData) {
  const trackingId = generateTrackingId();
  console.log('Creating tracking with data:', data); // Debug log
  console.log('Image URL in createTrackingInDB:', data.imageUrl); // Debug log

  try {
    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Create or find user
      let user = await tx
        .select()
        .from(users)
        .where(eq(users.email, data.userEmail))
        .limit(1);

      if (!user.length) {
        const [newUser] = await tx
          .insert(users)
          .values({
            name: data.userName,
            email: data.userEmail,
            phone: data.userPhone,
          })
          .returning();
        user = [newUser];
      }

      // Create start location
      const [startLocation] = await tx
        .insert(locations)
        .values({
          name: data.startLocation,
          address: data.startLocation,
        })
        .returning();

      // Create end location
      const [endLocation] = await tx
        .insert(locations)
        .values({
          name: data.endLocation,
          address: data.endLocation,
        })
        .returning();

      // Create tracking
      const [newTracking] = await tx
        .insert(trackings)
        .values({
          id: trackingId,
          name: data.name,
          userId: user[0].id,
          startLocationId: startLocation.id,
          endLocationId: endLocation.id,
          status: 'pending',
          currentLocationIndex: 0,
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          imageUrl: data.imageUrl,
        })
        .returning();

      // Create stopovers if any
      const stopoverLocations = [];
      if (data.stopovers && data.stopovers.length > 0) {
        for (let i = 0; i < data.stopovers.length; i++) {
          if (data.stopovers[i].trim()) {
            const [stopoverLocation] = await tx
              .insert(locations)
              .values({
                name: data.stopovers[i],
                address: data.stopovers[i],
              })
              .returning();

            await tx
              .insert(trackingStopovers)
              .values({
                trackingId: newTracking.id,
                locationId: stopoverLocation.id,
                order: i,
              });

            stopoverLocations.push(stopoverLocation);
          }
        }
      }

      return {
        ...newTracking,
        user: user[0],
        startLocation,
        endLocation,
        stopovers: stopoverLocations,
      };
    });

    return result;
  } catch (error) {
    console.error('Error creating tracking:', error);
    throw error;
  }
}

export async function updateTrackingStatusInDB(
  trackingId: string,
  status: string,
  currentLocationIndex?: number
) {
  try {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (currentLocationIndex !== undefined) {
      updateData.currentLocationIndex = currentLocationIndex;
    }

    const [updatedTracking] = await db
      .update(trackings)
      .set(updateData)
      .where(eq(trackings.id, trackingId))
      .returning();

    return updatedTracking;
  } catch (error) {
    console.error('Error updating tracking status:', error);
    throw error;
  }
}

export async function updateTrackingInDB(
  trackingId: string,
  updateData: Partial<{
    name: string;
    status: string;
    currentLocationIndex: number;
    estimatedDelivery: Date;
  }>
) {
  try {
    const data = {
      ...updateData,
      updatedAt: new Date(),
    };

    const [updatedTracking] = await db
      .update(trackings)
      .set(data)
      .where(eq(trackings.id, trackingId))
      .returning();

    if (!updatedTracking) {
      return null;
    }

    // Return full tracking data
    return await getTrackingByIdFromDB(trackingId);
  } catch (error) {
    console.error('Error updating tracking:', error);
    throw error;
  }
}

export async function deleteTrackingFromDB(trackingId: string) {
  try {
    return await db.transaction(async (tx) => {
      // Delete stopovers first
      await tx
        .delete(trackingStopovers)
        .where(eq(trackingStopovers.trackingId, trackingId));

      // Delete the tracking
      const result = await tx
        .delete(trackings)
        .where(eq(trackings.id, trackingId))
        .returning();

      return result.length > 0;
    });
  } catch (error) {
    console.error('Error deleting tracking:', error);
    throw error;
  }
}

// Admin operations
export async function validateAdminInDB(username: string, password: string) {
  try {
    const adminResult = await db
      .select()
      .from(admins)
      .where(and(eq(admins.username, username), eq(admins.password, password)))
      .limit(1);

    return adminResult.length > 0;
  } catch (error) {
    console.error('Error validating admin:', error);
    return false;
  }
}

export async function createAdmin(username: string, password: string) {
  try {
    const [admin] = await db
      .insert(admins)
      .values({
        username,
        password, // In production, hash this password
      })
      .returning();

    return admin;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
}
