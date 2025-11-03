import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryApi } from '@/lib/api';
import { DEFAULT_DRIVER } from '@/lib/constants';

export function useDeliveries(driverId = DEFAULT_DRIVER) {
  return useQuery({
    queryKey: ['deliveries', driverId],
    queryFn: async () => {
      const response = await deliveryApi.getAll(driverId);
      return response.data;
    },
  });
}

export function useDelivery(id, driverId = DEFAULT_DRIVER) {
  return useQuery({
    queryKey: ['delivery', id, driverId],
    queryFn: async () => {
      const response = await deliveryApi.getById(driverId, id);
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
