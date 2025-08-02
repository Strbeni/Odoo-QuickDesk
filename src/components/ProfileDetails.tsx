import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/context/TicketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { User, Edit, ArrowUp, Save, X, Camera, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProfileDetails = () => {
  const { user } = useAuth();
  const { updateUserProfile, createRoleUpgradeRequest, createNotification, categories } = useTickets();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    categoryInterest: user?.categoryInterest || '',
    language: user?.language || 'English'
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      await updateUserProfile(user.uid, {
        name: formData.name,
        categoryInterest: formData.categoryInterest,
        language: formData.language,
        profileImage: profileImage
      });
      
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRoleUpgradeRequest = async () => {
    if (!user) return;
    
    try {
      // Create role upgrade request
      await createRoleUpgradeRequest({
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        currentRole: 'end_user',
        requestedRole: 'support_agent',
        message: upgradeMessage,
        status: 'pending'
      });

      // Notify all admins about the new role upgrade request
      await createNotification({
        userId: 'admin', // This will be handled differently to notify all admins
        title: 'New Role Upgrade Request',
        message: `${user.name} has requested to be upgraded from End User to Support Agent`,
        type: 'role_upgrade_request',
        read: false
      });

      setUpgradeDialogOpen(false);
      setUpgradeMessage('');
      
      toast({
        title: "Request submitted",
        description: "Your role upgrade request has been sent to administrators for review.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit role upgrade request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      categoryInterest: user?.categoryInterest || '',
      language: user?.language || 'English'
    });
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between p-8">
        <div className="flex items-center gap-4">
          <User className="h-8 w-8" />
          <div>
            <CardTitle className="text-2xl">Profile Details</CardTitle>
            <CardDescription className="text-base">Manage your account information and preferences</CardDescription>
          </div>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-8 space-y-8">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileImage || undefined} alt={user?.name} />
              <AvatarFallback className="text-2xl">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
          {isEditing && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-muted-foreground"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Profile Picture
              </Button>
              <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
            ) : (
              <p className="text-sm font-medium">{user.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              Role
              {user.role === 'end_user' && (
                <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      Upgrade
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Role Upgrade</DialogTitle>
                      <DialogDescription>
                        Request to upgrade your role from End User to Support Agent. 
                        This will allow you to help other users by responding to their tickets.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="message">Message to Administrators (Optional)</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us why you'd like to become a support agent..."
                          value={upgradeMessage}
                          onChange={(e) => setUpgradeMessage(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleRoleUpgradeRequest}>
                          Submit Request
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </Label>
            <Badge variant="secondary" className="w-fit">
              {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            {isEditing ? (
              <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                  <SelectItem value="Italian">Italian</SelectItem>
                  <SelectItem value="Portuguese">Portuguese</SelectItem>
                  <SelectItem value="Chinese">Chinese</SelectItem>
                  <SelectItem value="Japanese">Japanese</SelectItem>
                  <SelectItem value="Korean">Korean</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium">{user.language || 'English'}</p>
            )}
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="categoryInterest">Category of Interest</Label>
            {isEditing ? (
              <Select value={formData.categoryInterest} onValueChange={(value) => setFormData({ ...formData, categoryInterest: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your area of interest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific interest</SelectItem>
                  {categories
                    .filter(cat => cat.name && cat.name.trim() !== '')
                    .map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium">{user.categoryInterest || 'No specific interest'}</p>
            )}
          </div>
        </div>
        
        {isEditing && (
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileDetails;
