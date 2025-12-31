// app/admin/submissions/[id]/page.tsx

'use client';

import { notFound } from 'next/navigation';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Sidebar from '@/components/Global/Sidebar';
import Header from '@/components/Global/Header';
import { ArrowLeft, BookOpen, User, Mail, Calendar, Image as ImageIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type SubmissionDetail = {
    id: number;
    title: string | null;
    subtitle: string | null;
    fullName: string | null;
    penName: string | null;
    email: string | null;
    mobilePhone: string | null;
    address: string | null;
    aboutAuthor: string | null;
    backCoverBlurb: string | null;
    coverIdea: string | null;
    coverNotes: string | null;
    profileImage: string | null;
    coverImage: string | null;
    categories: string[];
    status: string;
    createdAt: string;
    updatedAt: string;
    user: {
        name: string | null;
        email: string;
    } | null;
};

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { data: session } = useSession();
    // Admin only
    useEffect(() => {
        if (session && session.user.role !== 'ADMIN') {
            router.push('/dashboard');
        }
    }, [session, router]);
    const { id } = use(params);
    const { data: submission, error, isLoading } = useSWR<SubmissionDetail>(
        `/api/books/admin/${id}`,
        fetcher
    );
    if (isLoading) {
        return (
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 p-8">
                    <Skeleton className="h-12 w-64 mb-6" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    if (error || !submission) {
        notFound();
    }

    return (
        <div className="flex h-screen bg-background text-foreground">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" asChild>
                                <Link href="/dashboard/books/submissions">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Submissions
                                </Link>
                            </Button>
                            <Badge variant={submission.status === 'Submitted' ? 'default' : 'secondary'}>
                                {submission.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Images */}
                            <div className="space-y-6">
                                {submission.profileImage && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Author Photo</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <img
                                                src={submission.profileImage}
                                                alt="Author"
                                                className="w-full rounded-lg object-cover aspect-square"
                                            />
                                        </CardContent>
                                    </Card>
                                )}

                                {submission.coverImage && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Cover Image</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <img
                                                src={submission.coverImage}
                                                alt="Book Cover"
                                                className="w-full rounded-lg object-contain bg-muted"
                                            />
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Details */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-2xl flex items-center gap-3">
                                            <BookOpen className="h-7 w-7" />
                                            {submission.title || 'Untitled Book'}
                                        </CardTitle>
                                        {submission.subtitle && (
                                            <CardDescription className="text-lg mt-2">
                                                {submission.subtitle}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Author Name</p>
                                                <p className="font-medium">{submission.fullName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Pen Name</p>
                                                <p className="font-medium">{submission.penName || 'None'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    {submission.email || submission.user?.email}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Phone</p>
                                                <p className="font-medium">{submission.mobilePhone || 'Not provided'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">Categories</p>
                                            <div className="flex flex-wrap gap-2">
                                                {submission.categories?.length > 0 ? (
                                                    submission.categories.map((cat) => (
                                                        <Badge key={cat} variant="outline">
                                                            {cat}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground">None</span>
                                                )}
                                            </div>
                                        </div>

                                        {submission.aboutAuthor && (
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-2">About the Author</p>
                                                <p className="whitespace-pre-wrap">{submission.aboutAuthor}</p>
                                            </div>
                                        )}

                                        {submission.backCoverBlurb && (
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-2">Back Cover Blurb</p>
                                                <p className="whitespace-pre-wrap">{submission.backCoverBlurb}</p>
                                            </div>
                                        )}

                                        {submission.coverIdea && (
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-2">Cover Design Idea</p>
                                                <p className="whitespace-pre-wrap">{submission.coverIdea}</p>
                                            </div>
                                        )}

                                        {submission.coverNotes && (
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-2">Additional Cover Notes</p>
                                                <p className="whitespace-pre-wrap">{submission.coverNotes}</p>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t">
                                            <p className="text-sm text-muted-foreground">
                                                Last updated: {new Date(submission.updatedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}