import React, { useState } from 'react';
import { useTickets } from '@/context/TicketContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, MessageSquare, AlertCircle, UserPlus, Ticket } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const { notifications, markNotificationAsRead } = useTickets();
  const [isOpen, setIsOpen] = useState(false);

  // Filter notifications based on user role
  const userNotifications = notifications.filter(notification => {
    if (user?.role === 'end_user') {
      // End users see ticket updates, replies, status changes
      return ['ticket_reply', 'ticket_status_change', 'ticket_assigned'].includes(notification.type);
    } else if (user?.role === 'support_agent' || user?.role === 'admin') {
      // Agents and admins see new tickets and role upgrade requests
      return ['new_ticket', 'role_upgrade_request'].includes(notification.type);
    }
    return true;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ticket_reply':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'ticket_status_change':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'ticket_assigned':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'new_ticket':
        return <Ticket className="h-4 w-4 text-purple-500" />;
      case 'role_upgrade_request':
        return <UserPlus className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    setIsOpen(false);
    
    // Navigate to relevant page if needed
    if (notification.ticketId) {
      window.location.href = `/ticket/${notification.ticketId}`;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {userNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {userNotifications
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .slice(0, 10)
              .map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-950' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
          </div>
        )}
        
        {userNotifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-muted-foreground">
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
