import React from 'react';
import ProfileDetails from '@/components/ProfileDetails';

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <ProfileDetails />
      </div>
    </div>
  );
};

export default Profile;
