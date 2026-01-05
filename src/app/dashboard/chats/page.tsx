'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Plus, Users } from 'lucide-react';
import Sidebar from '@/components/Global/Sidebar';
import Header from '@/components/Global/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { Session } from 'inspector/promises';

type User = {
  id: number;
  name: string | null;
  email: string;
};

type Thread = {
  id: number;
  title?: string | null;
  creator?: { id: number; name: string | null; email: string } | null;
  participants: User[];
  lastMessage?: { content: string; createdAt: string } | null;
  createdAt: string;
  unreadCount: number;
};

export default function ChatsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [groupTitle, setGroupTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = Number(session?.user.id);
  const isAdmin = session?.user.role === 'ADMIN';

  useEffect(() => {
    if (!session) {
      router.push('/signin');
    }
  }, [session, router]);

  // Fetch threads
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await fetch('/api/chats', { cache: 'no-store' });
        if (res.ok) {
          const data: Thread[] = await res.json();

          // Sort by last message or creation time (most recent first)
          const sorted = data.sort((a, b) => {
            const aTime = a.lastMessage?.createdAt || a.createdAt;
            const bTime = b.lastMessage?.createdAt || b.createdAt;
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          });

          setThreads(sorted);
        }
      } catch (err) {
        console.error('Failed to fetch threads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
    const interval = setInterval(fetchThreads, 8000);
    return () => clearInterval(interval);
  }, []);

  // Fetch users (admin only)
  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.filter((u: User) => u.id !== currentUserId));
        }
      } catch {
        toast.error('Failed to load users');
      }
    };

    fetchUsers();
  }, [isAdmin, currentUserId]);

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateThread = async () => {
    if (selectedUserIds.length === 0) {
      toast.error('Select at least one user');
      return;
    }

    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIds: selectedUserIds,
          title: selectedUserIds.length > 1 && groupTitle.trim() ? groupTitle.trim() : undefined,
        }),
      });

      if (res.ok) {
        const newThread = await res.json();
        setThreads(prev => [newThread, ...prev]);
        setDialogOpen(false);
        setSelectedUserIds([]);
        setGroupTitle('');
        toast.success(selectedUserIds.length > 1 ? 'Group chat created!' : 'Chat started!');
        router.push(`/dashboard/chats/${newThread.id}`);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create chat');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const getDisplayName = (thread: Thread): string => {

    if (thread.title?.trim()) {
      return thread.title.trim();
    }

    const others = thread.participants.filter(p => p.id !== currentUserId);

        if (session?.user.role === 'USER' || session?.user.role === 'CUSTOMER') {
      if (others.length >= 1 && thread.title == null) {
        const names =  `${others.length+1} members`;
        return names 
      }
    }
    console.log('Calculating display name for thread:', thread.id, 'with participants:', thread.participants, 'and others:', others);
    if (others.length === 0) {
      if (thread.creator && thread.creator.id !== currentUserId) {
        return thread.creator.name || thread.creator.email || 'Admin';
      }
      return 'Chat';
    }



    return `${others.length} members`;

    // const names = others
    //   .map(p => p.name?.trim() || p.email.split('@')[0])
    //   .slice(0, 3)
    //   .join(', ');
    // return names + (others.length > 3 ? '...' : '');
  };


  const getAvatarLetter = (thread: Thread): string => {
    const name = getDisplayName(thread);
    return name[0]?.toUpperCase() || 'C';
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg">Loading chats...</p>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  Chats
                </CardTitle>
                <CardDescription>Your conversations</CardDescription>
              </div>

              {isAdmin && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Chat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Start New Chat
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      {selectedUserIds.length > 1 && (
                        <div className="space-y-2">
                          <Label htmlFor="group-title">Group Name (optional)</Label>
                          <Input
                            id="group-title"
                            placeholder="e.g., Support Team, Family"
                            value={groupTitle}
                            onChange={(e) => setGroupTitle(e.target.value)}
                          />
                        </div>
                      )}

                      <div className="space-y-3">
                        <Label>Select Participants</Label>
                        <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
                          {users.length === 0 ? (
                            <p className="text-center text-muted-foreground text-sm">
                              No users available
                            </p>
                          ) : (
                            users.map((user) => (
                              <div
                                key={user.id}
                                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedUserIds.includes(user.id)
                                    ? 'bg-accent'
                                    : 'hover:bg-accent/50'
                                  }`}
                                onClick={() => toggleUserSelection(user.id)}
                              >
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback>
                                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    {user.name || user.email}
                                  </p>
                                  {user.name && (
                                    <p className="text-xs text-muted-foreground">
                                      {user.email}
                                    </p>
                                  )}
                                </div>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedUserIds.includes(user.id)
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground'
                                  }`}>
                                  {selectedUserIds.includes(user.id) && (
                                    <div className="w-3 h-3 bg-primary-foreground rounded-full" />
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedUserIds.length} selected
                        </p>
                      </div>

                      <Button
                        onClick={handleCreateThread}
                        className="w-full"
                        disabled={selectedUserIds.length === 0}
                      >
                        {selectedUserIds.length > 1 ? 'Create Group Chat' : 'Start Chat'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {threads.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      No conversations yet.
                      {isAdmin ? ' Create one to get started!' : ' Wait for admin to message you.'}
                    </p>
                  </div>
                ) : (
                  threads.map((thread) => {
                    const displayName = getDisplayName(thread);
                    const avatarLetter = getAvatarLetter(thread);
                    // console.log('Rendering thread:', thread.id, displayName, thread);
                    return (
                      <Link key={thread.id} href={`/dashboard/chats/${thread.id}`}>
                        <Card className="hover:bg-accent/70 transition-all cursor-pointer border-0 shadow-sm">
                          <CardContent className="flex items-center gap-4 p-4">
                            <Avatar className="h-12 w-12 ring-2 ring-background">
                              <AvatarFallback className="text-lg font-medium">
                                {avatarLetter}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-base truncate">
                                  {displayName}
                                </p>
                                {thread.unreadCount > 0 && (
                                  <Badge variant="destructive" className="ml-2">
                                    {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {thread.lastMessage?.content || 'No messages yet'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}