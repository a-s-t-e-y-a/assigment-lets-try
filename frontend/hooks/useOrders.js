import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/lib/api';
import { DEFAULT_USER } from '@/lib/constants';

export function useOrders(userId = DEFAULT_USER) {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      const response = await orderApi.getAll(userId);
      return response.data;
    },
  });
}

export function useOrder(id, userId = DEFAULT_USER) {
  return useQuery({
    queryKey: ['order', id, userId],
    queryFn: async () => {
      const response = await orderApi.getById(userId, id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => orderApi.create(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Error creating order:', error);
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => orderApi.updateStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCancelOrder(userId = DEFAULT_USER) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => orderApi.cancel(userId, id),
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
  });
}
