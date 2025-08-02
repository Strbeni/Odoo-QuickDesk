import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/context/TicketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MessageSquare, User, LogOut, Settings, ArrowUp, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { initializeSampleData } from '@/utils/initializeData';
import NotificationDropdown from '@/components/NotificationDropdown';
import { ThemeToggle } from '@/components/ThemeToggle';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { tickets } = useTickets();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize sample data on first load if no tickets exist
  useEffect(() => {
    const initializeIfEmpty = async () => {
      if (tickets.length === 0 && !isInitializing) {
        setIsInitializing(true);
        try {
          await initializeSampleData();
        } catch (error) {
          console.error('Failed to initialize sample data:', error);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    // Only run after a short delay to ensure tickets have been loaded
    const timer = setTimeout(initializeIfEmpty, 2000);
    return () => clearTimeout(timer);
  }, [tickets.length, isInitializing]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (ticket.category && ticket.category.toLowerCase() === categoryFilter);
    
    // Assignment filtering for agents and admins
    let matchesAssignment = true;
    if (user?.role === 'support_agent' || user?.role === 'admin') {
      if (assignmentFilter === 'assigned_to_me') {
        matchesAssignment = ticket.assignedTo === user.uid;
      } else if (assignmentFilter === 'unassigned') {
        matchesAssignment = !ticket.assignedTo;
      } else if (assignmentFilter === 'assigned') {
        matchesAssignment = !!ticket.assignedTo;
      }
      // 'all' shows all tickets for agents/admins
    }
    
    // No role-based filtering needed anymore, all users can see all tickets
    return matchesSearch && matchesStatus && matchesCategory && matchesAssignment;
  });

  const uniqueCategories = [...new Set(tickets.map(ticket => ticket.category).filter(category => category && typeof category === 'string'))];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">QuickDesk</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.name}
            </span>
            <Badge variant="secondary">{user?.role.replace('_', ' ')}</Badge>
            <NotificationDropdown />
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            {user?.role === 'admin' && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                <Settings className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(user?.role === 'support_agent' || user?.role === 'admin') && (
            <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tickets</SelectItem>
                <SelectItem value="assigned_to_me">Assigned to Me</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="assigned">Assigned to Others</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Link to="/create-ticket">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ask Question
            </Button>
          </Link>
        </div>

        {/* Tickets Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <Link to={`/ticket/${ticket.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      {ticket.priority && (
                        <Badge variant="outline" className={
                          ticket.priority === 'high' ? 'border-red-200 text-red-700' :
                          ticket.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                          'border-blue-200 text-blue-700'
                        }>
                          {ticket.priority}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {ticket.createdAt ? ticket.createdAt.toLocaleDateString() : 'Unknown date'}
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{ticket.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-3 mb-4">
                    {ticket.description}
                  </CardDescription>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <Badge variant="outline">{ticket.category || 'Uncategorized'}</Badge>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {ticket.replies?.length || 0}
                      </div>
                      {user?.role === 'end_user' && (
                        <div className="flex items-center gap-1">
                          <ArrowUp className="h-4 w-4" />
                          {ticket.votes || 0}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {isInitializing && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Initializing dashboard data...</p>
          </div>
        )}

        {!isInitializing && filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tickets found</p>
            <Link to="/create-ticket">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Ticket
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;