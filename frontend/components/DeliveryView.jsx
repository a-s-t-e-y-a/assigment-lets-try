'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePreparedOrders, useDeliveryOrders, usePickupOrder, useDeliverOrder } from '@/hooks/useApp';
import { DEFAULT_DRIVER, ORDER_STATUS, STATUS_COLORS, DRIVERS } from '@/lib/constants';
import { Loader2, RefreshCw, Package, CheckCircle } from 'lucide-react';

export default function DeliveryView() {
  const { data: preparedOrders, isLoading: preparedLoading, refetch: refetchPrepared } = usePreparedOrders();
  const { data: allOrdersData, isLoading: allLoading, refetch: refetchAll } = useDeliveryOrders({ page: 1, limit: 20 });
  
  const pickupOrder = usePickupOrder();
  const deliverOrder = useDeliverOrder();

  const handlePickup = (orderId) => {
    pickupOrder.mutate({ orderId, driverId: DEFAULT_DRIVER }, {
      onSuccess: () => {
        refetchPrepared();
        refetchAll();
      },
    });
  };

  const handleDeliver = (orderId) => {
    deliverOrder.mutate(orderId, {
      onSuccess: () => {
        refetchPrepared();
        refetchAll();
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Driver: {DRIVERS[DEFAULT_DRIVER].name}</h2>
          <p className="text-muted-foreground">Delivery Dashboard - Manage deliveries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Available for Pickup</CardTitle>
              <CardDescription>Orders ready to be picked up</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => refetchPrepared()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {preparedLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : (preparedOrders?.orders?.length > 0 || preparedOrders?.data?.orders?.length > 0 || preparedOrders?.data?.length > 0) ? (
              <div className="space-y-3">
                {(preparedOrders.orders || preparedOrders.data?.orders || preparedOrders.data || []).map(order => (
                  <div key={order._id || order.orderId || order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">Order #{order.orderId || order.id}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <Badge className={STATUS_COLORS[order.status]}>{order.status}</Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Restaurant:</strong> {order.restaurantId}</p>
                      <p><strong>Customer:</strong> {order.userId}</p>
                      <p><strong>Items:</strong> {order.items?.length} items</p>
                      <p><strong>Total:</strong> ₹{order.totalAmount?.toFixed(2)}</p>
                      <p className="text-muted-foreground"><strong>Delivery to:</strong> {order.deliveryAddress}</p>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handlePickup(order.orderId || order.id)}
                      disabled={pickupOrder.isPending}
                    >
                      {pickupOrder.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Picking up...
                        </>
                      ) : (
                        <>
                          <Package className="h-4 w-4 mr-2" />
                          Pick Up Order
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No orders ready for pickup</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Deliveries</CardTitle>
              <CardDescription>Delivery history and status</CardDescription>
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
                      <p><strong>Customer:</strong> {order.userId}</p>
                      <p className="text-muted-foreground">{order.deliveryAddress}</p>
                      <p><strong>Total:</strong> ₹{order.totalAmount?.toFixed(2)}</p>
                    </div>
                    {order.status === ORDER_STATUS.PICKED_UP && (
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleDeliver(order.orderId || order.id)}
                        disabled={deliverOrder.isPending}
                      >
                        {deliverOrder.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Delivering...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Delivered
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No deliveries</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
