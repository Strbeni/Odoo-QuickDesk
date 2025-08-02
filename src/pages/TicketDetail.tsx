import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/context/TicketContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Send, ArrowUp, ArrowDown, User, Clock, Tag, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTicketById, addReply, updateTicket, voteTicket } = useTickets();
  const { toast } = useToast();
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const ticket = getTicketById(id!);

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ticket not found. <Link to="/dashboard" className="underline">Go back to dashboard</Link>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddReply = async () => {
    if (!replyMessage.trim()) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    addReply(ticket.id, replyMessage);
    setReplyMessage('');
    setLoading(false);
    toast({
      title: "Reply added",
      description: "Your reply has been posted successfully.",
    });
  };

  const handleStatusChange = (newStatus: string) => {
    updateTicket(ticket.id, { status: newStatus as any });
    toast({
      title: "Status updated",
      description: `Ticket status changed to ${newStatus.replace('_', ' ')}.`,
    });
  };

  const handleAssignToMe = () => {
    updateTicket(ticket.id, { assignedTo: user?.uid });
    toast({
      title: "Ticket assigned",
      description: "Ticket has been assigned to you.",
    });
  };

  const handleVote = () => {
    if (!user) return;
    voteTicket(ticket.id, user.uid);
  };

  const canManageTicket = user?.role === 'support_agent' || user?.role === 'admin';
  const canVote = user?.role === 'end_user';
  const hasVoted = user ? ticket.votedBy.includes(user.uid) : false;
  const canReply = ticket.status !== 'closed';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Ticket Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority} priority
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {ticket.category}
                  </Badge>
                </div>
                <CardTitle className="text-2xl mb-2">{ticket.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Created by User #{ticket.createdBy}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {ticket.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {/* Vote Section */}
              {canVote && (
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant={hasVoted ? "default" : "outline"}
                    size="sm"
                    onClick={handleVote}
                    className="flex items-center gap-1"
                  >
                    <ArrowUp className="h-4 w-4" />
                    {hasVoted ? 'Voted' : 'Vote'}
                  </Button>
                  <span className="text-sm font-medium">{ticket.votes}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
          </CardContent>
        </Card>

        {/* Agent/Admin Controls */}
        {canManageTicket && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Ticket Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-48">
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={ticket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {!ticket.assignedTo && (
                  <div className="flex items-end">
                    <Button onClick={handleAssignToMe}>
                      Assign to Me
                    </Button>
                  </div>
                )}
                
                {ticket.assignedTo && (
                  <div className="flex-1 min-w-48">
                    <label className="text-sm font-medium mb-2 block">Assigned To</label>
                    <p className="text-sm text-muted-foreground">
                      {ticket.assignedTo === user?.uid ? 'You' : `Agent #${ticket.assignedTo}`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Replies Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              Replies ({ticket.replies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ticket.replies.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No replies yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-4">
                {ticket.replies.map((reply, index) => (
                  <div key={reply.id}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{reply.authorName}</span>
                          <span className="text-xs text-muted-foreground">
                            {reply.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    </div>
                    {index < ticket.replies.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Reply */}
        {canReply && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your reply here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleAddReply} disabled={loading || !replyMessage.trim()}>
                  {loading ? (
                    'Posting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post Reply
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!canReply && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This ticket is closed. No new replies can be added.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;