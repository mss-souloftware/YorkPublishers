'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '@/components/Global/Header';
import Sidebar from '@/components/Global/Sidebar';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

type Role = {
  id: number;
  name: string;
};

type Permission = {
  id: number;
  name: string;
  description: string | null;
};

export default function AddUserPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Pending'>('Active');

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { data: session } = useSession();

  // Redirect non-admins
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/roles', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch roles');
        const data = await res.json();
        setRoles(data);
        // Optional: default to first role (e.g., USER)
        if (data.length > 0 && !roleId) {
          setRoleId(data[0].id.toString());
        }
      } catch (err) {
        setError('Failed to load roles');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Fetch permissions whenever role changes
  useEffect(() => {
    if (!roleId) {
      setPermissions([]);
      return;
    }

    const fetchPermissions = async () => {
      try {
        const res = await fetch(`/api/roles/${roleId}/permissions`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const perms = await res.json();
          setPermissions(perms);
        } else {
          setPermissions([]);
        }
      } catch (err) {
        console.error('Failed to load permissions for role:', roleId);
        setPermissions([]);
      }
    };

    fetchPermissions();
  }, [roleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!name || !email || !password || !roleId) {
      setError('All fields are required');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || null,
          email: email.trim(),
          password,
          roleId: Number(roleId),
          status,
        }),
      });

      if (res.ok) {
        toast.success('User created successfully!');
        router.push('/dashboard/users');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create user');
        toast.error(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>
                Add a new user and assign them a role. Permissions are managed per role.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
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
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="olivia@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={roleId} onValueChange={setRoleId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
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

                {/* Live Permissions Preview */}
                <div className="space-y-4">
                  <Label>Permissions for Selected Role ({roles.find(r => r.id.toString() === roleId)?.name || 'None'})</Label>
                  <div className="rounded-lg border bg-card p-6">
                    {permissions.length === 0 ? (
                      <p className="text-muted-foreground">
                        {roleId ? 'No permissions assigned to this role.' : 'Select a role to see permissions.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {permissions.map((perm) => (
                          <div key={perm.id} className="flex items-center space-x-3">
                            <Checkbox checked disabled />
                            <div>
                              <p className="font-medium">{perm.name.replace(/_/g, ' ')}</p>
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
                    Permissions are managed globally per role. Go to <strong>Roles Management</strong> to edit them.
                  </p>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting || !roleId}>
                    {submitting ? 'Creating...' : 'Create User'}
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