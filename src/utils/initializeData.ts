import { collection, addDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const initializeSampleData = async () => {
  try {
    // Check if categories already exist
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    if (categoriesSnapshot.empty) {
      // Create sample categories
      const sampleCategories = [
        { name: 'Technical Support', description: 'Hardware and software issues' },
        { name: 'Account Issues', description: 'Login and account related problems' },
        { name: 'Billing', description: 'Payment and subscription questions' },
        { name: 'Feature Request', description: 'Suggestions for new features' },
        { name: 'General Inquiry', description: 'General questions and information' }
      ];

      for (const category of sampleCategories) {
        await addDoc(collection(db, 'categories'), category);
      }
      console.log('Sample categories created');
    }

    // Check if tickets already exist
    const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
    if (ticketsSnapshot.empty) {
      // Create sample tickets
      const sampleTickets = [
        {
          title: 'Login Issues',
          description: 'I cannot log into my account. Getting authentication error.',
          status: 'open',
          category: 'Account Issues',
          priority: 'high',
          createdBy: 'sample-user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          replies: [],
          votes: 3,
          votedBy: []
        },
        {
          title: 'Feature Request: Dark Mode',
          description: 'Would love to have a dark mode option for better user experience.',
          status: 'in_progress',
          category: 'Feature Request',
          priority: 'medium',
          createdBy: 'sample-user-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          replies: [],
          votes: 8,
          votedBy: []
        },
        {
          title: 'Billing Question',
          description: 'I was charged twice this month. Can someone help me understand why?',
          status: 'resolved',
          category: 'Billing',
          priority: 'medium',
          createdBy: 'sample-user-3',
          createdAt: new Date(),
          updatedAt: new Date(),
          replies: [
            {
              id: '1',
              message: 'We have reviewed your account and issued a refund for the duplicate charge.',
              authorId: 'support-agent-1',
              authorName: 'Support Team',
              timestamp: new Date()
            }
          ],
          votes: 1,
          votedBy: []
        }
      ];

      for (const ticket of sampleTickets) {
        await addDoc(collection(db, 'tickets'), ticket);
      }
      console.log('Sample tickets created');
    }

    console.log('Sample data initialization completed');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

export const createUserProfile = async (uid: string, email: string, name: string, role: 'end_user' | 'support_agent' | 'admin' = 'end_user') => {
  try {
    await setDoc(doc(db, 'users', uid), {
      email,
      name,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('User profile created');
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};
