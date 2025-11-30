import { Tracking, TrackingFormData, Admin } from '@/types';
import { generateTrackingId } from './utils';

// Mock data storage (in a real app, this would be a database)
let trackings: Tracking[] = [
  {
    id: 'TRK123456789',
    name: 'Electronics Package',
    startLocation: {
      id: '1',
      name: 'New York Warehouse',
      address: '123 Industrial Blvd, New York, NY 10001',
    },
    endLocation: {
      id: '4',
      name: 'Customer Address',
      address: '456 Main St, Los Angeles, CA 90001',
    },
    stopovers: [
      {
        id: '2',
        name: 'Chicago Distribution Center',
        address: '789 Logistics Ave, Chicago, IL 60601',
      },
      {
        id: '3',
        name: 'Denver Hub',
        address: '321 Transit Way, Denver, CO 80201',
      },
    ],
    user: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
    },
    status: 'in-progress',
    currentLocationIndex: 1,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-02'),
    estimatedDelivery: new Date('2024-12-05'),
  },
];

// Mock admin credentials
const admin: Admin = {
  username: 'admin',
  password: 'admin123',
};

// Data access functions
export function getTrackingById(id: string): Tracking | undefined {
  return trackings.find(tracking => tracking.id === id);
}

export function getAllTrackings(): Tracking[] {
  return trackings;
}

export function createTracking(data: TrackingFormData): Tracking {
  const newTracking: Tracking = {
    id: generateTrackingId(),
    name: data.name,
    startLocation: {
      id: generateTrackingId(),
      name: data.startLocation,
      address: data.startLocation,
    },
    endLocation: {
      id: generateTrackingId(),
      name: data.endLocation,
      address: data.endLocation,
    },
    stopovers: data.stopovers.map(stopover => ({
      id: generateTrackingId(),
      name: stopover,
      address: stopover,
    })),
    user: {
      name: data.userName,
      email: data.userEmail,
      phone: data.userPhone,
    },
    status: 'pending',
    currentLocationIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  };

  trackings.push(newTracking);
  return newTracking;
}

export function updateTrackingStatus(id: string, status: Tracking['status'], currentLocationIndex?: number): boolean {
  const tracking = trackings.find(t => t.id === id);
  if (tracking) {
    tracking.status = status;
    tracking.updatedAt = new Date();
    if (currentLocationIndex !== undefined) {
      tracking.currentLocationIndex = currentLocationIndex;
    }
    return true;
  }
  return false;
}

export function validateAdmin(username: string, password: string): boolean {
  return admin.username === username && admin.password === password;
}
