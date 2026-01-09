'use client';

import { useState, useEffect, useRef, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MoreVertical, Edit2, Trash2, Check, X, Paperclip, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Sidebar from '@/components/Global/Sidebar';
import Header from '@/components/Global/Header';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { format, isToday, isYesterday, differenceInMinutes } from 'date-fns';

type Attachment = {
  url: string;
  name: string;
  type: string;
  size: number;
};

type Message = {
  id: number;
  content: string | null;
  attachments?: Attachment[] | null;
  createdAt: string;
  editedAt?: string | null;
  sender: { id: number; name: string | null };
};

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const firstLoadRef = useRef(true);

  const router = useRouter();
  const { data: session, status } = useSession();
  const currentUserId = Number(session?.user?.id);

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

  // First load scroll
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

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<Attachment[] | null> => {
    if (selectedFiles.length === 0) return null;

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('files', file));

    try {
      const res = await fetch(`/api/chats/${id}/messages/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      return data.files;
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload files');
      return null;
    } finally {
      setUploading(false);
      setSelectedFiles([]);
    }
  };

  // Send message with optional attachments
  const handleSend = async () => {
    const hasText = newMessage.trim().length > 0;
    const hasFiles = selectedFiles.length > 0;

    if ((!hasText && !hasFiles) || isSending || uploading) return;

    const uploadedAttachments = hasFiles ? await uploadFiles() : null;
    if (hasFiles && !uploadedAttachments) return; // Upload failed

    const optimisticId = Date.now();
    const optimisticMessage: Message = {
      id: optimisticId,
      content: hasText ? newMessage.trim() : null,
      attachments: uploadedAttachments || null,
      createdAt: new Date().toISOString(),
      sender: { id: currentUserId, name: session?.user?.name || null },
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
        body: JSON.stringify({
          content: hasText ? newMessage.trim() : null,
          attachments: uploadedAttachments,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setMessages(prev => prev.map(m => (m.id === optimisticId ? saved : m)));
      } else {
        throw new Error('Failed to send');
      }
    } catch {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
    } finally {
      setIsSending(false);
    }
  };

  // Edit & Delete (unchanged from your working version)
  const startEdit = (msg: Message) => {
    const sentAt = new Date(msg.createdAt);
    const minutesAgo = differenceInMinutes(new Date(), sentAt);
    if (minutesAgo > 30) {
      toast.error('You can only edit messages within 30 minutes');
      return;
    }
    setEditingId(msg.id);
    setEditContent(msg.content || '');
  };

  const saveEdit = async () => {
    if (!editContent.trim() || !editingId) return;

    const original = messages.find(m => m.id === editingId);
    if (!original) return;

    setMessages(prev =>
      prev.map(m =>
        m.id === editingId
          ? { ...m, content: editContent.trim(), editedAt: new Date().toISOString() }
          : m
      )
    );
    setEditingId(null);

    try {
      const res = await fetch(`/api/chats/${id}/messages/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Failed to update message');
      }

      const updatedMessage = await res.json();
      setMessages(prev =>
        prev.map(m => (m.id === editingId ? updatedMessage : m))
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to update message');
      setMessages(prev =>
        prev.map(m => (m.id === editingId ? original : m))
      );
    }
  };

  const handleDelete = async (messageId: number) => {
    const messageToDelete = messages.find(m => m.id === messageId);
    if (!messageToDelete) return;

    setMessages(prev => prev.filter(m => m.id !== messageId));

    try {
      const res = await fetch(`/api/chats/${id}/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Failed to delete message');
      }
      toast.success('Message deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete message');
      try {
        const res = await fetch(`/api/chats/${id}`, { cache: 'no-store' });
        if (res.ok) {
          const data: Message[] = await res.json();
          const sorted = data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setMessages(sorted);
        }
      } catch {
        setMessages(prev => [...prev, messageToDelete].sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ));
      }
    }
  };

  // Render attachment
  const renderAttachment = (att: Attachment) => {
    if (att.type.startsWith('image/')) {
      return <img src={att.url} alt={att.name} className="max-w-sm rounded-lg mt-3 shadow-md" />;
    }
    if (att.type.startsWith('video/')) {
      return (
        <video controls className="max-w-sm rounded-lg mt-3 shadow-md">
          <source src={att.url} type={att.type} />
          Your browser does not support video.
        </video>
      );
    }
    return (
      <a
        href={att.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 mt-3 text-blue-600 dark:text-blue-400 hover:underline"
      >
        <Paperclip className="h-5 w-5" />
        <span>{att.name}</span>
        <span className="text-sm opacity-70">
          ({(att.size / 1024 / 1024).toFixed(2)} MB)
        </span>
      </a>
    );
  };

  // Date grouping
  const formatDateSeparator = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.createdAt);
    const dateKey = format(date, 'yyyy-MM-dd');
    if (!groups[dateKey]) groups[dateKey] = { date, messages: [] };
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
                  <div className="flex items-center justify-center my-6">
                    <div className="px-4 py-1.5 bg-muted/80 text-muted-foreground text-sm rounded-full backdrop-blur">
                      {formatDateSeparator(group.date)}
                    </div>
                  </div>

                  {group.messages.map((msg) => {
                    const isOwn = msg.sender.id === currentUserId;
                    const canEdit = isOwn && differenceInMinutes(new Date(), new Date(msg.createdAt)) <= 30;
                    const isEdited = !!msg.editedAt;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                      >
                        <div
                          className={`max-w-2xl px-5 py-3 rounded-2xl shadow-md flex flex-col relative ${
                            isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {editingId === msg.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                                className="flex-1"
                                autoFocus
                              />
                              <Button size="icon" variant="ghost" onClick={saveEdit}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-sm">
                                      {msg.sender.name?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className="text-sm font-semibold">
                                    {msg.sender.name || 'User'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs opacity-70">
                                  <span>{format(new Date(msg.createdAt), 'h:mm a')}</span>
                                  {isEdited && <span className="italic">(edited)</span>}
                                </div>
                              </div>

                              {msg.content && (
                                <p className="text-base break-words pr-8">{msg.content}</p>
                              )}

                              {msg.attachments?.map((att, i) => (
                                <div key={i}>{renderAttachment(att)}</div>
                              ))}

                              {(isOwn || canEdit) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {canEdit && (
                                      <DropdownMenuItem onClick={() => startEdit(msg)}>
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDelete(msg.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
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

          {/* Input Area */}
          <div className="mt-4 pb-6 flex gap-3 items-end">
            <div className="flex-1 flex flex-col gap-3">
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
                className="py-6 text-base"
                disabled={isSending || uploading}
              />

              {/* Selected files preview */}
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm"
                    >
                      <span className="max-w-32 truncate">{file.name}</span>
                      <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Attach button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || uploading}
            >
              <Paperclip className="h-6 w-6" />
            </Button>

            {/* Send button */}
            <Button
              onClick={handleSend}
              disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSending || uploading}
              size="icon"
              className="h-14 w-14 rounded-xl"
            >
              {uploading ? 'Uploading...' : <Send className="h-6 w-6" />}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}