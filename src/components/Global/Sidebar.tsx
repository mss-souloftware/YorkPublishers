'use client';

import React, { useState } from 'react';
import {
  Home,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Activity,
  DollarSign,
  Book,
  UserLock 
} from 'lucide-react';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('Overview');
  const { data: session } = useSession();

  const menuItems = [
    { icon: Home, label: 'Overview', link: 'overview' },
    { icon: Users, label: 'Users', link: 'users', adminOnly: true },
    { icon: UserLock , label: 'Permission Management', link: 'roles', adminOnly: true },
    { icon: Activity, label: 'Analytics', link: 'analytics' },
    { icon: DollarSign, label: 'Revenue', link: 'revenue' },
    { icon: Book, label: 'Books', link: 'books/add' },
    { icon: Settings, label: 'Settings', link: 'settings' },
  ];

  return (
    <aside
      className={`${
        sidebarOpen ? 'w-64' : 'w-16'
      } transition-all duration-300 bg-card border-r border-border flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {sidebarOpen && <h1 className="font-bold text-xl invert w-50"><Image src="/favicon.png" alt="Logo" width={170} height={70}></Image></h1>}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft
            className={`h-5 w-5 transition-transform ${
              sidebarOpen ? '' : 'rotate-180'
            }`}
          />
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems
          .filter(
            (item) =>
              !item.adminOnly || session?.user?.role === 'ADMIN'
          )
          .map((item) => (
            <Link
              key={item.label}
              href={`/dashboard/${item.link}`}
            >
              <Button
                variant={
                  activeItem === item.label ? 'secondary' : 'ghost'
                }
                className="w-full justify-start"
                onClick={() => setActiveItem(item.label)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {sidebarOpen && item.label}
              </Button>
            </Link>
          ))}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="mr-3 h-5 w-5" />
          {sidebarOpen && 'Logout'}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
