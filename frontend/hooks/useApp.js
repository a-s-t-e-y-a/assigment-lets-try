import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantApi, orderApi, deliveryApi } from '@/lib/api';

export function useRestaurants(params) {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: async () => {
      const response = await restaurantApi.getAll(params);
      return response.data;
    },
  });
}

export function useRestaurant(id) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const response = await restaurantApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useRestaurantMenu(id, params) {
  return useQuery({
    queryKey: ['restaurant', id, 'menu', params],
    queryFn: async () => {
      const response = await restaurantApi.getMenu(id, params);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useUserOrders(userId, params) {
  return useQuery({
    queryKey: ['user', userId, 'orders', params],
    queryFn: async () => {
      const response = await orderApi.getUserOrders(userId, params);
      return response.data;
    },
    enabled: !!userId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => orderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => orderApi.cancel(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Error cancelling order:', error);
    },
  });
}

export function useRestaurantPendingOrders(restaurantId) {
  return useQuery({
    queryKey: ['restaurant', restaurantId, 'pending'],
    queryFn: async () => {
      const response = await restaurantApi.getPendingOrders(restaurantId);
      return response.data;
    },
    enabled: !!restaurantId,
  });
}

export function useRestaurantOrders(params) {
  return useQuery({
    queryKey: ['restaurant', 'orders', params],
    queryFn: async () => {
      const response = await restaurantApi.getOrders(params);
      return response.data;
    },
  });
}

export function useAcceptOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => restaurantApi.acceptOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function usePrepareOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => restaurantApi.prepareOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery'] });
    },
  });
}

export function useDeliveryOrders(params) {
  return useQuery({
    queryKey: ['delivery', 'orders', params],
    queryFn: async () => {
      const response = await deliveryApi.getAll(params);
      return response.data;
    },
  });
}

export function usePreparedOrders() {
  return useQuery({
    queryKey: ['delivery', 'prepared'],
    queryFn: async () => {
      const response = await deliveryApi.getPreparedOrders();
      return response.data;
    },
  });
}

export function usePickupOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, driverId }) => deliveryApi.pickup(orderId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useDeliverOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => deliveryApi.deliver(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
