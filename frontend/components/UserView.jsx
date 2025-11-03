'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRestaurantMenu, useCreateOrder, useUserOrders, useCancelOrder } from '@/hooks/useApp';
import { DEFAULT_USER, DEFAULT_RESTAURANT, ORDER_STATUS, STATUS_COLORS, USERS } from '@/lib/constants';
import { useState, useEffect } from 'react';
import { ShoppingCart, Loader2, RefreshCw, XCircle } from 'lucide-react';

export default function UserView() {
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('123 Main Street, Apt 4B, Downtown');
  const [activeSection, setActiveSection] = useState('menu');

  useEffect(() => {
    const savedSection = localStorage.getItem('userActiveSection');
    if (savedSection) {
      setActiveSection(savedSection);
    }

    const savedCart = localStorage.getItem('userCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }

    const savedAddress = localStorage.getItem('deliveryAddress');
    if (savedAddress) {
      setDeliveryAddress(savedAddress);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('deliveryAddress', deliveryAddress);
  }, [deliveryAddress]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    localStorage.setItem('userActiveSection', section);
  };
  
  const { data: menuData, isLoading: menuLoading, refetch: refetchMenu } = useRestaurantMenu(
    DEFAULT_RESTAURANT,
    { page: 1, limit: 20 }
  );
  
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useUserOrders(
    DEFAULT_USER,
    { page: 1, limit: 10 }
  );

  const createOrder = useCreateOrder();
  const cancelOrder = useCancelOrder();

  const addToCart = (item) => {
    const existing = cart.find(i => i.itemId === item.id);
    if (existing) {
      setCart(cart.map(i => i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { itemId: item.id, quantity: 1, name: item.name, price: item.price }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(i => i.itemId !== itemId));
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(i => {
      if (i.itemId === itemId) {
        const newQuantity = i.quantity + change;
        return newQuantity > 0 ? { ...i, quantity: newQuantity } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    const orderData = {
      userId: DEFAULT_USER,
      restaurantId: DEFAULT_RESTAURANT,
      items: cart.map(({ itemId, quantity }) => ({ itemId, quantity })),
      deliveryAddress,
    };

    createOrder.mutate(orderData, {
      onSuccess: () => {
        setCart([]);
        localStorage.removeItem('userCart');
        refetchOrders();
        handleSectionChange('orders');
      },
    });
  };

  const handleCancelOrder = (orderId) => {
    cancelOrder.mutate(orderId, {
      onSuccess: () => {
        refetchOrders();
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || 'Failed to cancel order. Only pending orders can be cancelled.';
        alert(errorMessage);
      }
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium">Welcome, {USERS[DEFAULT_USER].name}</h2>
          <p className="text-muted-foreground text-sm">Browse menu and place orders</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={activeSection === 'menu' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSectionChange('menu')}
          >
            Menu
          </Button>
          <Button
            variant={activeSection === 'cart' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSectionChange('cart')}
            className="relative"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Cart
            {cart.length > 0 && (
              <Badge className="ml-2 px-1.5 py-0.5 h-5 min-w-5 text-xs">{cart.length}</Badge>
            )}
          </Button>
          <Button
            variant={activeSection === 'orders' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSectionChange('orders')}
          >
            My Orders
          </Button>
        </div>
      </div>

      {activeSection === 'menu' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>Select items to add to your cart</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => refetchMenu()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              {menuLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-10 w-24" />
                    </div>
                  ))}
                </div>
              ) : menuData?.data?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuData.data.map(item => (
                    <div key={item.id} className="flex flex-col p-4 border rounded-lg gap-3 hover:shadow-md transition-shadow">
                      <div className="flex-1 space-y-2">
                        <h4 className="font-medium text-lg">{item.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.vegetarian && (
                            <Badge variant="outline" className="text-xs border-green-600 text-green-700 dark:text-green-400 dark:border-green-500">
                              🌱 Veg
                            </Badge>
                          )}
                          {item.spiceLevel && item.spiceLevel !== 'None' && (
                            <Badge variant="secondary" className="text-xs">🌶️ {item.spiceLevel}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t">
                        <p className="text-xl font-medium">₹{item.price.toFixed(2)}</p>
                        <Button 
                          onClick={() => addToCart(item)} 
                          size="sm"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No menu items available</p>
              )}
            </CardContent>
          </Card>
      )}

      {activeSection === 'cart' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart
            </CardTitle>
            <CardDescription>Review your items and proceed to checkout</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button onClick={() => handleSectionChange('menu')}>Browse Menu</Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {cart.map(item => (
                    <div key={item.itemId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-lg">{item.name}</p>
                        <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateQuantity(item.itemId, -1)}>-</Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button size="sm" variant="outline" onClick={() => updateQuantity(item.itemId, 1)}>+</Button>
                        </div>
                        <div className="text-right min-w-24">
                          <p className="font-medium text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.itemId)}>
                          <XCircle className="h-5 w-5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-4">
                  <div className="flex justify-between items-center text-xl font-medium">
                    <span>Total:</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Delivery Address</label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full p-3 border rounded-lg text-sm"
                      rows={3}
                      placeholder="Enter your delivery address..."
                      style={{ WebkitOverflowScrolling: 'touch' }}
                    />
                  </div>
                  
                  <Button 
                    className="w-full h-12 text-base" 
                    onClick={handlePlaceOrder}
                    disabled={createOrder.isPending || cart.length === 0}
                  >
                    {createOrder.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Placing Order...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'orders' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Orders</CardTitle>
              <CardDescription>Track your order status and history</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => refetchOrders()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : (ordersData?.orders?.length > 0 || ordersData?.data?.length > 0) ? (
              <div className="space-y-4">
                {(ordersData.orders || ordersData.data?.orders || ordersData.data || []).map(order => (
                  <div key={order._id || order.orderId || order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-lg">Order #{order.orderId || order.id}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <Badge className={STATUS_COLORS[order.status]}>{order.status}</Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Items:</strong> {order.items?.length} items</p>
                      {order.items?.map((item, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground ml-4">
                          • {item.name || item.itemId} x {item.quantity}
                        </p>
                      ))}
                      <p><strong>Total Amount:</strong> ₹{order.totalAmount?.toFixed(2)}</p>
                      <p><strong>Delivery Address:</strong></p>
                      <p className="text-muted-foreground ml-4">{order.deliveryAddress}</p>
                    </div>
                    {order.status !== ORDER_STATUS.PENDING && order.status !== ORDER_STATUS.CANCELLED && order.status !== ORDER_STATUS.DELIVERED && (
                      <p className="text-xs text-muted-foreground italic">Order cannot be cancelled after restaurant acceptance</p>
                    )}
                    {order.status === ORDER_STATUS.PENDING && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleCancelOrder(order.orderId || order.id)}
                        disabled={cancelOrder.isPending}
                        className="w-full sm:w-auto"
                      >
                        {cancelOrder.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Order
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button onClick={() => handleSectionChange('menu')}>Start Ordering</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
