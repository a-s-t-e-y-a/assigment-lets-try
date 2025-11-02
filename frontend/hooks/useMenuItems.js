import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuItemApi } from '@/lib/api';

export function useMenuItems() {
  return useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const response = await menuItemApi.getAll();
      return response.data;
    },
  });
}

export function useMenuItem(id) {
  return useQuery({
    queryKey: ['menuItem', id],
    queryFn: async () => {
      const response = await menuItemApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => menuItemApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => menuItemApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      queryClient.invalidateQueries({ queryKey: ['menuItem', variables.id] });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => menuItemApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}
