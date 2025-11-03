'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import UserView from '@/components/UserView';
import RestaurantView from '@/components/RestaurantView';
import DeliveryView from '@/components/DeliveryView';
import { ThemeToggle } from '@/components/ThemeToggle';
import { User, Store, Truck } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('user');

  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (value) => {
    setActiveTab(value);
    localStorage.setItem('activeTab', value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-auto">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 pb-20">
        <Card className="mb-6 p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-xl sm:text-xl font-medium">
                Food Order Lifecycle System
              </h1>
              <p className="text-muted-foreground text-sm">
                Simulator Dashboard - Switch between User, Restaurant, and Delivery Partner views
              </p>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
            <TabsTrigger value="user" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <User className="h-5 w-5" />
              <span className="text-xs sm:text-sm">User</span>
            </TabsTrigger>
            <TabsTrigger value="restaurant" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Store className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Restaurant</span>
            </TabsTrigger>
            <TabsTrigger value="delivery" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Truck className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Delivery</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="mt-0">
            <UserView />
          </TabsContent>

          <TabsContent value="restaurant" className="mt-0">
            <RestaurantView />
          </TabsContent>

          <TabsContent value="delivery" className="mt-0">
            <DeliveryView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
