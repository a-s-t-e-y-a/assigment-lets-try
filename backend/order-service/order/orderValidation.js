import { z } from 'zod';

export const placeOrderSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    restaurantId: z.string().min(1, 'Restaurant ID is required'),
    items: z.array(
      z.object({
        itemId: z.string().min(1, 'Item ID is required'),
        quantity: z.number().int().positive().default(1)
      })
    ).min(1, 'At least one item is required'),
    deliveryAddress: z.string().optional()
  })
});

export const getOrderByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required')
  })
});

export const cancelOrderSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required')
  })
});

export const getUserOrdersSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required')
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(['PENDING', 'ACCEPTED', 'CANCELLED']).optional(),
    sortBy: z.enum(['createdAt', 'status', 'totalAmount']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  })
});

export const getAllOrdersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(['PENDING', 'ACCEPTED', 'CANCELLED']).optional(),
    sortBy: z.enum(['createdAt', 'status', 'totalAmount']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  })
});
