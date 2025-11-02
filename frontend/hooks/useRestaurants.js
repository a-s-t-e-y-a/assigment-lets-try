import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantApi } from '@/lib/api';

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const response = await restaurantApi.getAll();
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

export function useRestaurantMenu(id) {
  return useQuery({
    queryKey: ['restaurant', id, 'menu'],
    queryFn: async () => {
      const response = await restaurantApi.getMenu(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useUpdateRestaurantAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, available }) => restaurantApi.updateAvailability(id, { available }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', variables.id] });
    },
  });
}
