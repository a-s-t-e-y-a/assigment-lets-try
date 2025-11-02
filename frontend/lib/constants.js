export const USERS = {
  user_001: { id: 'user_001', name: 'John Doe', role: 'user' },
  user_002: { id: 'user_002', name: 'Jane Smith', role: 'user' },
};

export const RESTAURANTS = {
  rest_001: { id: 'rest_001', name: 'Pizza Paradise', cuisine: 'Italian' },
  rest_002: { id: 'rest_002', name: 'Burger House', cuisine: 'American' },
};

export const DRIVERS = {
  driver_001: { id: 'driver_001', name: 'Mike Driver', vehicle: 'Bike' },
  driver_002: { id: 'driver_002', name: 'Sarah Delivery', vehicle: 'Car' },
};

export const DEFAULT_USER = 'user_001';
export const DEFAULT_RESTAURANT = 'rest_001';
export const DEFAULT_DRIVER = 'driver_001';

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PREPARED: 'PREPARED',
  PICKED_UP: 'PICKED_UP',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  PREPARED: 'bg-purple-100 text-purple-800',
  PICKED_UP: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};
