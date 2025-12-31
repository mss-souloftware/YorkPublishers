// app/admin/submissions/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Sidebar from '@/components/Global/Sidebar';
import Header from '@/components/Global/Header';
import { BookOpen, Mail, User, Clock, Eye } from 'lucide-react';
import Link from 'next/link';



type Submission = {
  id: number;
  title: string | null;
  fullName: string | null;
  email: string | null;
  status: string;
  createdAt: string;
  user: {
    email: string;
    name: string | null;
  } | null;
};

export default function AdminSubmissionsPage() {


  const router = useRouter();
  const { data: session } = useSession();
  // Admin only
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, router]);

    const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch');
  }

  return res.json();
};
  const { data, error, isLoading } = useSWR<Submission[]>('/api/books/admin', fetcher);

  const submissions = Array.isArray(data) ? data : [];

  const submitted = submissions.filter((s) => s.status === 'Submitted');
  const drafts = submissions.filter((s) => s.status === 'Draft');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const SubmissionTable = ({ items }: { items: Submission[] }) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Book Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Submitted On</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell className="font-medium">
                {submission.title || <span className="text-muted-foreground">Untitled</span>}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {submission.fullName || submission.user?.name || 'Unknown'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {submission.email || submission.user?.email}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDate(submission.createdAt)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/books/submissions/${submission.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BookOpen className="h-8 w-8" />
                Book Submissions
              </h1>
              <p className="text-muted-foreground mt-2">
                Review and manage all author submissions
              </p>
            </div>

            {isLoading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load submissions. Please refresh the page.
                </AlertDescription>
              </Alert>
            )}

            {!isLoading && !error && data && data.length === 0 && (
              <Card>
                <CardContent className="text-center py-16">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">No submissions found.</p>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && data && data.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Submissions Overview</CardTitle>
                  <CardDescription>
                    {submitted.length} submitted • {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="submitted" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                      <TabsTrigger value="submitted">
                        Submitted ({submitted.length})
                      </TabsTrigger>
                      <TabsTrigger value="drafts">
                        Drafts ({drafts.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="submitted" className="mt-6">
                      {submitted.length > 0 ? (
                        <SubmissionTable items={submitted} />
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No submitted books yet.
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="drafts" className="mt-6">
                      {drafts.length > 0 ? (
                        <SubmissionTable items={drafts} />
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No active drafts.
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}