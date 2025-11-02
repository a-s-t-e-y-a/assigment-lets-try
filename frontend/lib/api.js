import axiosInstance from './axios';

export const restaurantApi = {
  getAll: (params) => axiosInstance.get('/orders/menu-item/restaurants', { params }),
  getById: (id) => axiosInstance.get(`/orders/menu-item/restaurants/${id}`),
  getMenu: (id, params) => axiosInstance.get(`/orders/menu-item/restaurants/${id}/menu`, { params }),
  getMenuItem: (restaurantId, itemId) => axiosInstance.get(`/orders/menu-item/restaurants/${restaurantId}/menu/${itemId}`),
  search: (params) => axiosInstance.get('/orders/menu-item/search', { params }),
  getPendingOrders: (restaurantId) => axiosInstance.get(`/restaurant/restaurants/${restaurantId}/orders/pending`),
  getOrders: (params) => axiosInstance.get('/restaurant/orders', { params }),
  getOrderById: (orderId) => axiosInstance.get(`/restaurant/orders/${orderId}`),
  acceptOrder: (orderId) => axiosInstance.put(`/restaurant/orders/${orderId}/accept`),
  prepareOrder: (orderId) => axiosInstance.put(`/restaurant/orders/${orderId}/prepare`),
};

export const orderApi = {
  create: (data) => axiosInstance.post('/orders/orders', data),
  getAll: (params) => axiosInstance.get('/orders/orders', { params }),
  getById: (orderId) => axiosInstance.get(`/orders/orders/${orderId}`),
  getUserOrders: (userId, params) => axiosInstance.get(`/orders/users/${userId}/orders`, { params }),
  cancel: (orderId) => axiosInstance.put(`/orders/orders/${orderId}/cancel`),
};

export const deliveryApi = {
  getAll: (params) => axiosInstance.get('/delivery/orders', { params }),
  getById: (orderId) => axiosInstance.get(`/delivery/orders/${orderId}`),
  getPreparedOrders: () => axiosInstance.get('/delivery/orders/prepared'),
  pickup: (orderId, driverId) => axiosInstance.put(`/delivery/orders/${orderId}/pickup`, { driverId }),
  deliver: (orderId) => axiosInstance.put(`/delivery/orders/${orderId}/deliver`),
};

export const healthApi = {
  gateway: () => axiosInstance.get('/health'),
  status: () => axiosInstance.get('/status'),
};
