import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/context/TicketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Users, TicketIcon, TrendingUp, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user } = useAuth();
  const {
    tickets,
    categories,
    createCategory,
    updateCategory,
    deleteCategory
  } = useTickets();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (user?.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive"
      });
      return;
    }

    await createCategory(newCategory);
    setNewCategory({ name: '', description: '' });
    setCategoryDialogOpen(false);
    toast({
      title: "Category created",
      description: `Category "${newCategory.name}" added.`,
    });
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory?.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive"
      });
      return;
    }

    await updateCategory(editingCategory.id, {
      name: editingCategory.name,
      description: editingCategory.description
    });
    setEditingCategory(null);
    setEditDialogOpen(false);
    toast({
      title: "Category updated",
      description: `Category "${editingCategory.name}" updated.`,
    });
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (window.confirm(`Delete "${categoryName}"? This can't be undone.`)) {
      await deleteCategory(categoryId);
      toast({
        title: "Category deleted",
        description: `Category "${categoryName}" was removed.`,
      });
    }
  };

  const startEditCategory = (category: any) => {
    setEditingCategory({ ...category });
    setEditDialogOpen(true);
  };

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  const categoryStats = categories.map(category => ({
    name: category.name,
    count: tickets.filter(t => t.category === category.name).length
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Admin Panel
            </h1>
          </div>
          <Badge variant="secondary">Administrator</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Total Tickets', value: totalTickets, icon: <TicketIcon className="h-4 w-4 text-muted-foreground" />, color: '' },
                { title: 'Open Tickets', value: openTickets, icon: <div className="h-4 w-4 bg-red-500 rounded-full" />, color: '' },
                { title: 'In Progress', value: inProgressTickets, icon: <div className="h-4 w-4 bg-yellow-500 rounded-full" />, color: '' },
                { title: 'Resolved', value: resolvedTickets, icon: <div className="h-4 w-4 bg-green-500 rounded-full" />, color: '' },
              ].map((item, idx) => (
                <Card key={idx}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                    {item.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{item.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tickets by Category</CardTitle>
                <CardDescription>How tickets are distributed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryStats.map((stat, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm">{stat.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${totalTickets ? (stat.count / totalTickets) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {stat.count}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Ticket Categories</h2>
                <p className="text-muted-foreground">Organize your tickets</p>
              </div>
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Category</DialogTitle>
                    <DialogDescription>
                      Name and describe a new category.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category-name">Name *</Label>
                      <Input
                        id="category-name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category-description">Description</Label>
                      <Textarea
                        id="category-description"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateCategory}>Create</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <Card key={cat.id}>
                  <CardHeader className="flex justify-between">
                    <div>
                      <CardTitle>{cat.name}</CardTitle>
                      <CardDescription>{cat.description}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEditCategory(cat)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat.id, cat.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm text-muted-foreground">Tickets</span>
                    <Badge variant="secondary">
                      {tickets.filter(t => t.category === cat.name).length}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Category</DialogTitle>
                  <DialogDescription>Modify name/description</DialogDescription>
                </DialogHeader>
                {editingCategory && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Name *</Label>
                      <Input
                        id="edit-name"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editingCategory.description || ''}
                        onChange={(e) => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleUpdateCategory}>Update</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                User management will be implemented when backend is fully integrated.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
