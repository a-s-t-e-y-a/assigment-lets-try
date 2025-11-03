import axiosInstance from './axios';

export const restaurantApi = {
  getAll: (userId, params) => axiosInstance.get('/orders/menu-item/restaurants', { params: { ...params, userId } }),
  getById: (userId, id) => axiosInstance.get(`/orders/menu-item/restaurants/${id}`, { params: { userId } }),
  getMenu: (userId, id, params) => axiosInstance.get(`/orders/menu-item/restaurants/${id}/menu`, { params: { ...params, userId } }),
  getMenuItem: (userId, restaurantId, itemId) => axiosInstance.get(`/orders/menu-item/restaurants/${restaurantId}/menu/${itemId}`, { params: { userId } }),
  search: (userId, params) => axiosInstance.get('/orders/menu-item/search', { params: { ...params, userId } }),
  getPendingOrders: (restaurantId) => axiosInstance.get(`/restaurant/restaurants/${restaurantId}/orders/pending`, { params: { restaurantId } }),
  getOrders: (restaurantId, params) => axiosInstance.get('/restaurant/orders', { params: { ...params, restaurantId } }),
  getOrderById: (restaurantId, orderId) => axiosInstance.get(`/restaurant/orders/${orderId}`, { params: { restaurantId } }),
  acceptOrder: (restaurantId, orderId) => axiosInstance.put(`/restaurant/orders/${orderId}/accept`, { restaurantId }),
  prepareOrder: (restaurantId, orderId) => axiosInstance.put(`/restaurant/orders/${orderId}/prepare`, { restaurantId }),
};

export const orderApi = {
  create: (data) => axiosInstance.post('/orders/orders', data),
  getAll: (userId, params) => axiosInstance.get('/orders/orders', { params: { ...params, userId } }),
  getById: (userId, orderId) => axiosInstance.get(`/orders/orders/${orderId}`, { params: { userId } }),
  getUserOrders: (userId, params) => axiosInstance.get(`/orders/users/${userId}/orders`, { params: { ...params, userId } }),
  cancel: (userId, orderId) => axiosInstance.put(`/orders/orders/${orderId}/cancel`, { userId }),
};

export const deliveryApi = {
  getAll: (driverId, params) => axiosInstance.get('/delivery/orders', { params: { ...params, driverId } }),
  getById: (driverId, orderId) => axiosInstance.get(`/delivery/orders/${orderId}`, { params: { driverId } }),
  getPreparedOrders: (driverId) => axiosInstance.get('/delivery/orders/prepared', { params: { driverId } }),
  pickup: (orderId, driverId) => axiosInstance.put(`/delivery/orders/${orderId}/pickup`, { driverId }),
  deliver: (orderId, driverId) => axiosInstance.put(`/delivery/orders/${orderId}/deliver`, { driverId }),
};

export const healthApi = {
  gateway: () => axiosInstance.get('/health'),
  status: () => axiosInstance.get('/status'),
};
