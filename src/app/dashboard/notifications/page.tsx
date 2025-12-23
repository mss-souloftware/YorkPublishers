'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Trash2 } from 'lucide-react';
import React from 'react';
import Header from '@/components/Global/Header';
import Sidebar from '@/components/Global/Sidebar';

const notifications = [
  { id: 1, message: 'Olivia Martin just signed up', type: 'user', is_read: false, time: '2 min ago' },
  { id: 2, message: 'New report generated – Sales Q4', type: 'report', is_read: false, time: '1 hr ago' },
];

export default function NotificationsPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <CardTitle>All Notifications</CardTitle>
              <Button variant="outline" size="sm">
                <Check className="mr-2 h-4 w-4" /> Mark all as read
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-start justify-between border-b border-border pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{notif.message}</p>
                    <p className="text-sm text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {!notif.is_read && <Badge>New</Badge>}
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}