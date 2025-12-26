import React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import {
    User, Settings, LogOut, Shield,
    Menu, Bell, Search,
    Moon, Sun
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
const Header = () => {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const { data: session } = useSession();
    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/signin');
    };

 
    // console.log("the session q "+session?.user.profileImage);

    return (
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    />
                    <Moon className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Notifications Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-96 overflow-y-auto">
                            {[
                                { id: 1, message: 'Olivia Martin just signed up', type: 'user', is_read: false, time: '2 min ago' },
                                { id: 2, message: 'New report generated – Sales Q4', type: 'report', is_read: false, time: '1 hr ago' },
                                { id: 3, message: 'Password changed successfully', type: 'security', is_read: true, time: '3 hrs ago' },
                                { id: 4, message: 'Subscription renewed', type: 'billing', is_read: true, time: 'Yesterday' },
                            ].map((notif) => (
                                <DropdownMenuItem key={notif.id} className="flex flex-col items-start py-3">
                                    <div className="flex w-full justify-between">
                                        <p className="font-medium">{notif.message}</p>
                                        {!notif.is_read && <Badge variant="default" className="ml-2">New</Badge>}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                                </DropdownMenuItem>
                            ))}
                        </div>
                        <DropdownMenuSeparator />
                        <Link href={'/dashboard/notifications'}>
                            <DropdownMenuItem className="justify-center font-medium">
                                View all notifications
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                {session?.user?.profileImage ? (
                                    <Image
                                        src={session.user.profileImage}
                                        alt={session.user.name ?? 'User avatar'}
                                        width={40}
                                        height={40}
                                        className="rounded-full object-cover"
                                    />
                                ) : (
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {session?.user?.name
                                            ? session.user.name
                                                .split(' ')
                                                .map(n => n[0]?.toUpperCase())
                                                .join('')
                                                .slice(0, 2)
                                            : session?.user?.email?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                        </Button>

                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <p>{session?.user?.name}</p>
                                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/profile">
                                <User className="mr-2 h-4 w-4" />
                                My Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Security
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            <Button onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

export default Header