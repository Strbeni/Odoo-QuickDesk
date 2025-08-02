import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-6xl font-bold mb-4 text-destructive">404</h1>
        <p className="text-xl font-semibold mb-2">Page Not Found</p>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn’t exist or has been moved.
        </p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    </div>
  );
};

export default NotFound;
