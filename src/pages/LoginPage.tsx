import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { createTestUser, createTestAgent, createTestAdmin } from '@/utils/testFirebase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    }
  };

  const handleTestLogin = async () => {
    setError('');
    try {
      await createTestUser();
      setEmail('test@quickdesk.com');
      setPassword('testpassword123');
      await login('test@quickdesk.com', 'testpassword123');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Test login error:', err);
      setError('Failed to create/login test user: ' + (err.message || 'Unknown error'));
    }
  };

  const handleAgentLogin = async () => {
    setError('');
    try {
      await createTestAgent();
      setEmail('agent@quickdesk.com');
      setPassword('agentpassword123');
      await login('agent@quickdesk.com', 'agentpassword123');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Agent login error:', err);
      setError('Failed to create/login test agent: ' + (err.message || 'Unknown error'));
    }
  };

  const handleAdminLogin = async () => {
    setError('');
    try {
      await createTestAdmin();
      setEmail('admin@quickdesk.com');
      setPassword('adminpassword123');
      await login('admin@quickdesk.com', 'adminpassword123');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError('Failed to create/login test admin: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">QuickDesk</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-4 space-y-2">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleTestLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Login as End User'
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleAgentLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Login as Support Agent'
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleAdminLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Login as Admin'
              )}
            </Button>
          </div>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="font-medium mb-2">Test Accounts:</p>
            <div className="space-y-1 text-xs">
              <p><strong>End User:</strong> test@quickdesk.com / testpassword123</p>
              <p><strong>Support Agent:</strong> agent@quickdesk.com / agentpassword123</p>
              <p><strong>Admin:</strong> admin@quickdesk.com / adminpassword123</p>
            </div>
            <p className="mt-3 text-xs">Click the buttons above to automatically create and login</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
