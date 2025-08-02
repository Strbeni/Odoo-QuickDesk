import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { createUserProfile } from './initializeData';

export const createTestUser = async () => {
  try {
    const testEmail = 'test@quickdesk.com';
    const testPassword = 'testpassword123';
    
    console.log('Creating test user...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    
    console.log('Test user created:', user.uid);
    
    // Create user profile in Firestore
    await createUserProfile(user.uid, testEmail, 'Test User', 'end_user');
    
    console.log('Test user profile created successfully');
    return user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Test user already exists, signing in...');
      try {
        const userCredential = await signInWithEmailAndPassword(auth, 'test@quickdesk.com', 'testpassword123');
        console.log('Signed in as test user:', userCredential.user.uid);
        return userCredential.user;
      } catch (signInError) {
        console.error('Error signing in test user:', signInError);
        throw signInError;
      }
    } else {
      console.error('Error creating test user:', error);
      throw error;
    }
  }
};

export const createTestAgent = async () => {
  const agentEmail = 'agent@quickdesk.com';
  const agentPassword = 'agentpassword123';
  
  try {
    console.log('Creating test agent...');
    const userCredential = await createUserWithEmailAndPassword(auth, agentEmail, agentPassword);
    const user = userCredential.user;
    
    console.log('Test agent created:', user.uid);
    
    // Create agent profile in Firestore
    await createUserProfile(user.uid, agentEmail, 'Support Agent', 'support_agent');
    
    console.log('Test agent profile created successfully');
    return user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Test agent already exists, signing in...');
      try {
        const userCredential = await signInWithEmailAndPassword(auth, agentEmail, agentPassword);
        console.log('Signed in as test agent:', userCredential.user.uid);
        return userCredential.user;
      } catch (signInError) {
        console.error('Error signing in test agent:', signInError);
        throw signInError;
      }
    } else {
      console.error('Error creating test agent:', error);
      throw error;
    }
  }
};

export const createTestAdmin = async () => {
  const adminEmail = 'admin@quickdesk.com';
  const adminPassword = 'adminpassword123';
  
  try {
    console.log('Creating test admin...');
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('Test admin created:', user.uid);
    
    // Create admin profile in Firestore
    await createUserProfile(user.uid, adminEmail, 'System Admin', 'admin');
    
    console.log('Test admin profile created successfully');
    return user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Test admin already exists, signing in...');
      try {
        const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log('Signed in as test admin:', userCredential.user.uid);
        return userCredential.user;
      } catch (signInError) {
        console.error('Error signing in test admin:', signInError);
        throw signInError;
      }
    } else {
      console.error('Error creating test admin:', error);
      throw error;
    }
  }
};

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test authentication
    const user = await createTestUser();
    console.log('✅ Firebase Auth working');
    
    // Test will be completed when the user logs in and the dashboard loads
    console.log('✅ Firebase connection test completed');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};
