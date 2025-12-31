'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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

type RoleWithPermissions = Role & {
  permissions: Permission[];
};

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();

 
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, router]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, permsRes] = await Promise.all([
          fetch('/api/roles', { cache: 'no-store' }),
          fetch('/api/permissions', { cache: 'no-store' }), 
        ]);

        if (!rolesRes.ok || !permsRes.ok) throw new Error('Failed to load data');

        const rolesData: Role[] = await rolesRes.json();
        const permsData: Permission[] = await permsRes.json();

        setRoles(rolesData);
        setAllPermissions(permsData);

        // Auto-select first role
        if (rolesData.length > 0) {
          setSelectedRole(rolesData[0]);
        }
      } catch (err) {
        toast.error('Failed to load roles or permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    if (!selectedRole) {
      setRolePermissions(new Set());
      return;
    }

    const fetchRolePermissions = async () => {
      try {
        const res = await fetch(`/api/roles/${selectedRole.id}/permissions`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const perms: Permission[] = await res.json();
          setRolePermissions(new Set(perms.map(p => p.id)));
        }
      } catch (err) {
        toast.error('Failed to load permissions for this role');
      }
    };

    fetchRolePermissions();
  }, [selectedRole]);

  const togglePermission = (permId: number) => {
    setRolePermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permId)) {
        newSet.delete(permId);
      } else {
        newSet.add(permId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/roles/${selectedRole.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds: Array.from(rolePermissions) }),
      });

      if (res.ok) {
        toast.success('Permissions updated successfully!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update permissions');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg">Loading roles and permissions...</p>
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
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle>Roles & Permissions Management</CardTitle>
              <CardDescription>
                Manage what each role can do in the system. Changes apply to all users with that role.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="flex flex-wrap gap-4">
                {roles.map((role) => (
                  <Button
                    key={role.id}
                    variant={selectedRole?.id === role.id ? 'default' : 'outline'}
                    onClick={() => setSelectedRole(role)}
                  >
                    <Badge variant="secondary" className="mr-2">
                      {role.name}
                    </Badge>
                    {role.name}
                  </Button>
                ))}
              </div>

              {selectedRole ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">
                        Permissions for <span className="text-primary">{selectedRole.name}</span>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Toggle permissions below and save changes.
                      </p>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Permission</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-center">Enabled</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allPermissions.map((perm) => (
                          <TableRow key={perm.id}>
                            <TableCell className="font-medium">
                              {perm.name.replace(/_/g, ' ')}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {perm.description || 'No description'}
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={rolePermissions.has(perm.id)}
                                onCheckedChange={() => togglePermission(perm.id)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No roles available. Create roles first.
                </p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}