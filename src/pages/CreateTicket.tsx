import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/context/TicketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreateTicket = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { createTicket, categories } = useTickets();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (title.length < 5) {
      setError('Title must be at least 5 characters long');
      return;
    }

    if (description.length < 20) {
      setError('Description must be at least 20 characters long');
      return;
    }

    if (!category) {
      setError('Please select a category');
      return;
    }

    setLoading(true);

    try {
      await createTicket({
        title,
        description,
        category,
        priority: priority as 'low' | 'medium' | 'high',
        status: 'open',
        createdBy: user!.uid,
        createdAt: Date.now(),
        replies: [],
        votes: 0,
        votedBy: [],
        assignedTo: null,
      });

      toast({
        title: "Ticket created successfully!",
        description: "Your support ticket has been submitted.",
      });

      navigate('/dashboard');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Ask a Question</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Ticket</CardTitle>
            <CardDescription>
              Describe your issue or question in detail.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of your issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Minimum 5 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(cat => cat.name && cat.name.trim() !== '')
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    {categories.filter(cat => cat.name && cat.name.trim() !== '').length === 0 && (
                      <SelectItem value="general" key="fallback">
                        General Inquiry
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                />
                <p className="text-xs text-muted-foreground">Minimum 20 characters</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  'Creating Ticket...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTicket;
