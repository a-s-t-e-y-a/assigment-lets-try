'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRestaurantPendingOrders, useRestaurantOrders, useAcceptOrder, usePrepareOrder } from '@/hooks/useApp';
import { DEFAULT_RESTAURANT, ORDER_STATUS, STATUS_COLORS, RESTAURANTS } from '@/lib/constants';
import { Loader2, RefreshCw, CheckCircle, ChefHat } from 'lucide-react';

export default function RestaurantView() {
  const { data: pendingOrders, isLoading: pendingLoading, refetch: refetchPending } = useRestaurantPendingOrders(DEFAULT_RESTAURANT);
  const { data: allOrdersData, isLoading: allLoading, refetch: refetchAll } = useRestaurantOrders({ page: 1, limit: 20 });
  
  const acceptOrder = useAcceptOrder();
  const prepareOrder = usePrepareOrder();

  const handleAccept = (orderId) => {
    acceptOrder.mutate(orderId, {
      onSuccess: () => {
        refetchPending();
        refetchAll();
      },
    });
  };

  const handlePrepare = (orderId) => {
    prepareOrder.mutate(orderId, {
      onSuccess: () => {
        refetchPending();
        refetchAll();
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">{RESTAURANTS[DEFAULT_RESTAURANT].name}</h2>
          <p className="text-muted-foreground">Restaurant Dashboard - Manage incoming orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Orders</CardTitle>
              <CardDescription>New orders waiting for acceptance</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => refetchPending()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : (pendingOrders?.orders?.length > 0 || pendingOrders?.data?.orders?.length > 0 || pendingOrders?.data?.length > 0) ? (
              <div className="space-y-3">
                {(pendingOrders.orders || pendingOrders.data?.orders || pendingOrders.data || []).map(order => (
                  <div key={order._id || order.orderId || order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">Order #{order.orderId || order.id}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <Badge className={STATUS_COLORS[order.status]}>{order.status}</Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Customer:</strong> {order.userId}</p>
                      <p><strong>Items:</strong> {order.items?.length} items</p>
                      {order.items?.map((item, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground ml-4">
                          • {item.name || item.itemId} x {item.quantity} {item.price ? `@ ₹${item.price.toFixed(2)}` : ''}
                        </p>
                      ))}
                      <p><strong>Total:</strong> ₹{order.totalAmount?.toFixed(2)}</p>
                      <p className="text-muted-foreground">{order.deliveryAddress}</p>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleAccept(order.orderId || order.id)}
                      disabled={acceptOrder.isPending}
                    >
                      {acceptOrder.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Order
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No pending orders</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Order history and status</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => refetchAll()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {allLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (allOrdersData?.orders?.length > 0 || allOrdersData?.data?.orders?.length > 0 || allOrdersData?.data?.length > 0) ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {(allOrdersData.orders || allOrdersData.data?.orders || allOrdersData.data || []).map(order => (
                  <div key={order._id || order.orderId || order.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">Order #{order.orderId || order.id}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <Badge className={STATUS_COLORS[order.status]}>{order.status}</Badge>
                    </div>
                    <div className="text-sm">
                      <p><strong>Items:</strong> {order.items?.length} items</p>
                      <p><strong>Total:</strong> ₹{order.totalAmount?.toFixed(2)}</p>
                    </div>
                    {order.status === ORDER_STATUS.ACCEPTED && (
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handlePrepare(order.orderId || order.id)}
                        disabled={prepareOrder.isPending}
                      >
                        {prepareOrder.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Preparing...
                          </>
                        ) : (
                          <>
                            <ChefHat className="h-4 w-4 mr-2" />
                            Mark as Prepared
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No orders</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
