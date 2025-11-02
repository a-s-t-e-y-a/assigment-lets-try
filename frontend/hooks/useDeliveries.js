import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryApi } from '@/lib/api';

export function useDeliveries() {
  return useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => {
      const response = await deliveryApi.getAll();
      return response.data;
    },
  });
}

export function useDelivery(id) {
  return useQuery({
    queryKey: ['delivery', id],
    queryFn: async () => {
      const response = await deliveryApi.getById(id);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 5000,
  });
}

export function useUpdateDeliveryLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, location }) => deliveryApi.updateLocation(id, location),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['delivery', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });
}

export function useUpdateDeliveryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => deliveryApi.updateStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['delivery', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });
}
