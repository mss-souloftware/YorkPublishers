'use client';

import { useState, useEffect, useRef, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import Sidebar from '@/components/Global/Sidebar';
import Header from '@/components/Global/Header';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import {format, isToday, isYesterday, formatDistanceToNow} from "date-fns";

type Message = {
  id: number;
  content: string;
  createdAt: string;
  sender: { id: number; name: string | null };
};

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const firstLoadRef = useRef(true);

  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  // Scroll tracking
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop - clientHeight < 50;
      isAtBottomRef.current = atBottom;
      setIsAtBottom(atBottom);
      if (atBottom) setHasNewMessages(false);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // First load: scroll to bottom
  useEffect(() => {
    if (firstLoadRef.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      firstLoadRef.current = false;
    }
  }, [messages]);

  // Fetch messages
  useEffect(() => {
    if (!session) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chats/${id}`, { cache: 'no-store' });
        if (!res.ok) {
          setError('Failed to load chat');
          toast.error('Failed to load messages');
          return;
        }

        const data: Message[] = await res.json();
        const sorted = data.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setMessages(prev => {
          if (prev.length === 0) return sorted;

          const existingIds = new Set(prev.map(m => m.id));
          const newOnes = sorted.filter(m => !existingIds.has(m.id));

          if (newOnes.length && !isAtBottomRef.current) {
            setHasNewMessages(true);
          }

          return newOnes.length ? [...prev, ...newOnes] : prev;
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [id, session]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    const optimisticId = Date.now();
    const optimisticMessage: Message = {
      id: optimisticId,
      content: newMessage,
      createdAt: new Date().toISOString(),
      sender: { id: Number(session?.user.id), name: session?.user?.name || null },
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setIsSending(true);

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    try {
      const res = await fetch(`/api/chats/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        const saved = await res.json();
        setMessages(prev => prev.map(m => m.id === optimisticId ? saved : m));
      } else {
        throw new Error();
      }
    } catch {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
    } finally {
      setIsSending(false);
    }
  };

  // Format date for separator
  const formatDateSeparator = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.createdAt);
    const dateKey = format(date, 'yyyy-MM-dd');

    if (!groups[dateKey]) {
      groups[dateKey] = { date, messages: [] };
    }
    groups[dateKey].messages.push(msg);
    return groups;
  }, {} as Record<string, { date: Date; messages: Message[] }>);

  const sortedGroups = Object.values(groupedMessages).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Button onClick={() => router.push('/chats')}>Back to Chats</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-scroll">
        <Header />
        <main className="flex-1 flex flex-col p-6 pb-0">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar scrollbar-w-3 scrollbar-thumb-rounded-full scrollbar-thumb-muted-foreground/50 hover:scrollbar-thumb-muted-foreground/70"
            >
              {sortedGroups.map((group) => (
                <div key={group.date.toISOString()} className="space-y-4">
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="px-4 py-1 bg-muted/80 text-muted-foreground text-sm rounded-full backdrop-blur">
                      {formatDateSeparator(group.date)}
                    </div>
                  </div>

                  {/* Messages in this group */}
                  {group.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender.id === Number(session?.user.id) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-lg px-5 py-3 rounded-2xl shadow-md flex flex-col ${
                          msg.sender.id === Number(session?.user.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={`text-sm font-medium ${
                          msg.sender.id === Number(session?.user.id) ? 'text-primary-foreground bg-muted/40' : 'text-muted-foreground  bg-primary/20 ' }`}>
                              {msg.sender.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">
                              {msg.sender.name || 'User'}
                            </p>
                          </div>
                          <p className="text-xs opacity-70">
                            {format(new Date(msg.createdAt), 'h:mm a')}
                          </p>
                        </div>
                        <p className="text-base break-words">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* New Messages Indicator */}
            {hasNewMessages && !isAtBottom && (
              <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    setHasNewMessages(false);
                  }}
                  className="shadow-xl rounded-full px-6"
                >
                  New messages ↓
                </Button>
              </div>
            )}
          </Card>

          {/* Input */}
          <div className="mt-4 pb-6 flex gap-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 py-6 text-base"
              disabled={isSending}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
              size="icon"
              className="h-14 w-14 rounded-xl"
            >
              <Send className="h-6 w-6" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}