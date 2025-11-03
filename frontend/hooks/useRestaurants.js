import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantApi } from '@/lib/api';
import { DEFAULT_USER } from '@/lib/constants';

export function useRestaurants(userId = DEFAULT_USER) {
  return useQuery({
    queryKey: ['restaurants', userId],
    queryFn: async () => {
      const response = await restaurantApi.getAll(userId);
      return response.data;
    },
  });
}

export function useRestaurant(id, userId = DEFAULT_USER) {
  return useQuery({
    queryKey: ['restaurant', id, userId],
    queryFn: async () => {
      const response = await restaurantApi.getById(userId, id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useRestaurantMenu(id, userId = DEFAULT_USER) {
  return useQuery({
    queryKey: ['restaurant', id, 'menu', userId],
    queryFn: async () => {
      const response = await restaurantApi.getMenu(userId, id);
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
