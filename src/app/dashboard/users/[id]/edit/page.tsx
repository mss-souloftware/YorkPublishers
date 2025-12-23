'use client';

import { useState, useEffect, use } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Sidebar from '@/components/Global/Sidebar';
import Header from '@/components/Global/Header';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type Role = {
  id: number;
  name: 'ADMIN' | 'USER' | 'CUSTOMER';
};

type Permission = {
  id: number;
  name: string;
  description: string | null;
};

type UserData = {
  id: number;
  name: string | null;
  email: string;
  role:Role;
  status: string;
  createdAt: string;
};

type Props = {
  params: Promise<{ id: string }>; 
};

export default function UserDetailEditPage({ params }: Props) {
  const { id } = use(params);
  const [user, setUser] = useState<UserData | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState<number | null>(null);
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Pending'>('Active');

  const router = useRouter();
  const { data: session } = useSession();

  // Admin-only access
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Fetch user + roles + permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const userRes = await fetch(`/api/users/${id}`);
        if (!userRes.ok) throw new Error('Failed to load user');

        const userData: UserData = await userRes.json();
        setUser(userData);
        setName(userData.name || '');
        setEmail(userData.email);
        setRoleId(userData.role.id);
        setStatus(userData.status as any);

        // Fetch all roles
        const rolesRes = await fetch('/api/roles'); // You'll need this endpoint
        if (rolesRes.ok) {
          const rolesData = await rolesRes.json();
          setRoles(rolesData);
        }

        // Fetch permissions for current role
        await fetchPermissionsForRole(userData.role.id);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    const fetchPermissionsForRole = async (rId: number) => {
      try {
        const permRes = await fetch(`/api/roles/${rId}/permissions`);
        if (permRes.ok) {
          const perms = await permRes.json();
          setPermissions(perms);
        }
      } catch (err) {
        console.error('Failed to load permissions');
      }
    };

    if (id) fetchData();
  }, [id]);

  // Update permissions preview when role changes
  useEffect(() => {
    if (roleId) {
      const fetchPermissions = async () => {
        try {
          const res = await fetch(`/api/roles/${roleId}/permissions`);
          if (res.ok) {
            const perms = await res.json();
            setPermissions(perms);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchPermissions();
    }
  }, [roleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!roleId) {
      setError('Please select a role');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || null,
          email,
          roleId,
          status,
        }),
      });

      if (res.ok) {
        setSuccess('User updated successfully!');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-destructive mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

const initials =
  user?.name && user.name.trim().length > 0
    ? user.name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2)
    : user?.email.charAt(0).toUpperCase();


  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{name || 'Unnamed User'}</CardTitle>
                  <CardDescription>User ID: {user?.id}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {success && (
                <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg">
                  {success}
                </div>
              )}
              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Olivia Martin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="olivia.martin@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={roleId?.toString()} onValueChange={(v) => setRoleId(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={r.id.toString()}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Permissions Preview */}
                <div className="space-y-4">
                  <Label>Current Permissions (based on role)</Label>
                  <div className="rounded-lg border bg-card p-6">
                    {permissions.length === 0 ? (
                      <p className="text-muted-foreground">No permissions assigned to this role.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {permissions.map((perm) => (
                          <div key={perm.id} className="flex items-center space-x-3">
                            <Checkbox checked disabled />
                            <div>
                              <p className="font-medium">{perm.name.replace('_', ' ')}</p>
                              {perm.description && (
                                <p className="text-sm text-muted-foreground">{perm.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Changing the role will update permissions automatically.
                  </p>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving || !roleId}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}