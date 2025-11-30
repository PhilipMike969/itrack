export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface User {
  name: string;
  email: string;
  phone: string;
}

export interface Tracking {
  id: string;
  name: string;
  startLocation: Location;
  endLocation: Location;
  stopovers: Location[];
  user: User;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  currentLocationIndex: number; // Which location the package is currently at
  createdAt: Date | string;
  updatedAt: Date | string;
  estimatedDelivery?: Date | string;
  imageUrl?: string; // Cloudinary URL to the product image
}

export interface Admin {
  username: string;
  password: string;
}

export interface TrackingFormData {
  name: string;
  startLocation: string;
  endLocation: string;
  stopovers: string[];
  userName: string;
  userEmail: string;
  userPhone: string;
  imageUrl?: string; // Cloudinary URL to the uploaded product image
}
