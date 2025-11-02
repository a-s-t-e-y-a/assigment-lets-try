import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/lib/api';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await orderApi.getAll();
      return response.data;
    },
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await orderApi.getById(id);
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

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => orderApi.cancel(id),
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
  });
}
