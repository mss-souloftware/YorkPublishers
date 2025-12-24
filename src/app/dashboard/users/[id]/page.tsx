'use client';

import { useState, useEffect, use } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, Calendar, Edit, Shield, Activity, CheckCircle2 } from 'lucide-react';
import Sidebar from '@/components/Global/Sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Global/Header';

type Props = {
  params: Promise<{ id: string }>;
};

type Role = {
  id: number;
  name: 'ADMIN' | 'USER' | 'CUSTOMER';
};

type Permission = {
  id: number;
  name: string;
  description: string | null;
};

type User = {
  id: number;
  name: string | null;
  email: string;
  role: Role;
  status: string;
  createdAt: string;
};

export default function UserDetailPage({ params }: Props) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { data: session } = useSession();

  // Admin-only access
  useEffect(() => {
    if (!session) return;
    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${id}`, { cache: 'no-store' });

        if (!res.ok) {
          if (res.status === 404) setError('User not found');
          else if (res.status === 401) setError('Unauthorized');
          else setError('Failed to load user');
          return;
        }

        const data: User = await res.json();
        setUser(data);
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  // Fetch permissions for user's role
  useEffect(() => {
    if (!user?.role?.id) {
      setPermissions([]);
      return;
    }

    const fetchPermissions = async () => {
      setPermissionsLoading(true);
      try {
        const res = await fetch(`/api/roles/${user.role.id}/permissions`, {
          cache: 'no-store',
        });

        if (res.ok) {
          const perms: Permission[] = await res.json();
          setPermissions(perms);
        } else {
          setPermissions([]);
        }
      } catch (err) {
        console.error('Failed to load permissions');
        setPermissions([]);
      } finally {
        setPermissionsLoading(false);
      }
    };

    fetchPermissions();
  }, [user?.role?.id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg">Loading user...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-destructive mb-4">{error || 'User not found'}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const initials = user.name
    ? user.name.split(' ').map(n => n[0].toUpperCase()).join('').slice(0, 2)
    : user.email[0].toUpperCase();
    

  // Mock activity (replace with real audit log later)
  const activity = [
    { action: 'Logged in', time: '2 hours ago' },
    { action: 'Updated profile settings', time: '5 hours ago' },
    { action: 'Exported monthly report', time: '1 day ago' },
    { action: 'Added new team member', time: '3 days ago' },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header/>
        <div className=" border-b border-border px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <Link href={`/dashboard/users/${user.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Button>
          </Link>
        </div>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-2xl font-bold">{user.name || 'No Name'}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                    <Badge variant={user.role.name === 'ADMIN' ? 'destructive' : 'default'}>
                      {user.role.name}
                    </Badge>
                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm space-y-2 text-right">
                  <div className="flex items-center justify-end gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Joined {joinedDate}
                  </div>
                  <div className="flex items-center justify-end gap-2 text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    Last active: Recently
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>Not provided</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Role & Access</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{user.role.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Has {permissions.length} active permission{permissions.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>No detailed activity log available yet.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activity.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <p className="text-sm">{item.action}</p>
                        <p className="text-sm text-muted-foreground">{item.time}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Permissions</CardTitle>
                  <CardDescription>
                    This user has the following permissions through their <strong>{user.role.name}</strong> role.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {permissionsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading permissions...</p>
                  ) : permissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No permissions assigned to this role.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {permissions.map((perm) => (
                        <li key={perm.id} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{perm.name.replace(/_/g, ' ')}</p>
                            {perm.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {perm.description}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}