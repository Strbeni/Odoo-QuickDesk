import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { collection, addDoc, updateDoc, doc, getDocs, getDoc, deleteDoc, onSnapshot, arrayUnion, arrayRemove, setDoc } from "firebase/firestore";
import { db } from '../firebase';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  replies: Reply[];
  votes: number;
  votedBy: string[];
}

export interface Reply {
  id: string;
  message: string;
  authorId: string;
  authorName: string;
  timestamp: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'end_user' | 'support_agent' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

interface TicketContextType {
  tickets: Ticket[];
  categories: Category[];
  users: UserProfile[];
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'votes' | 'votedBy'>) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  addReply: (ticketId: string, message: string) => Promise<void>;
  voteTicket: (ticketId: string, userId: string) => Promise<void>;
  getTicketById: (id: string) => Ticket | undefined;
  createCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateUserRole: (userId: string, role: 'end_user' | 'support_agent' | 'admin') => Promise<void>;
  assignTicket: (ticketId: string, agentId: string) => Promise<void>;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const { user } = useAuth();

  // Listen for tickets
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "tickets"), 
      async (snapshot) => {
        try {
          const ticketData = await Promise.all(snapshot.docs.map(async docSnap => {
            const data = docSnap.data();
            // Convert Firestore timestamps to JS Date
            return {
              ...data,
              id: docSnap.id,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
              replies: (data.replies || []).map((r: any) => ({
                ...r,
                timestamp: r.timestamp?.toDate ? r.timestamp.toDate() : new Date()
              }))
            } as Ticket;
          }));
          setTickets(ticketData);
        } catch (error) {
          console.error('Error fetching tickets:', error);
          setTickets([]);
        }
      },
      (error) => {
        console.error('Error listening to tickets:', error);
        setTickets([]);
      }
    );
    return () => unsub();
  }, []);

  // Listen for categories
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "categories"), 
      (snapshot) => {
        try {
          setCategories(snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as Category)));
        } catch (error) {
          console.error('Error fetching categories:', error);
          setCategories([]);
        }
      },
      (error) => {
        console.error('Error listening to categories:', error);
        setCategories([]);
      }
    );
    return () => unsub();
  }, []);

  // Listen for users (admin only)
  useEffect(() => {
    if (user?.role !== 'admin') return;
    
    const unsub = onSnapshot(
      collection(db, "users"), 
      (snapshot) => {
        try {
          const userData = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
            } as UserProfile;
          });
          setUsers(userData);
        } catch (error) {
          console.error('Error fetching users:', error);
          setUsers([]);
        }
      },
      (error) => {
        console.error('Error listening to users:', error);
        setUsers([]);
      }
    );
    return () => unsub();
  }, [user?.role]);

  const createTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'votes' | 'votedBy'>) => {
    await addDoc(collection(db, "tickets"), {
      ...ticketData,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
      votes: 0,
      votedBy: []
    });
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    await updateDoc(doc(db, "tickets", id), {
      ...updates,
      updatedAt: new Date()
    });
  };

  const addReply = async (ticketId: string, message: string) => {
    if (!user) return;
    const ticketRef = doc(db, "tickets", ticketId);
    const ticketSnap = await getDoc(ticketRef);
    const ticket = ticketSnap.data();
    const newReply: Reply = {
      id: Date.now().toString(),
      message,
      authorId: user.uid,
      authorName: user.name,
      timestamp: new Date()
    };
    await updateDoc(ticketRef, {
      replies: arrayUnion(newReply),
      updatedAt: new Date()
    });
  };

  const voteTicket = async (ticketId: string, userId: string) => {
    const ticketRef = doc(db, "tickets", ticketId);
    const ticketSnap = await getDoc(ticketRef);
    const ticket = ticketSnap.data();
    const hasVoted = ticket?.votedBy?.includes(userId);
    await updateDoc(ticketRef, {
      votes: hasVoted ? ticket.votes - 1 : ticket.votes + 1,
      votedBy: hasVoted ? arrayRemove(userId) : arrayUnion(userId)
    });
  };

  const getTicketById = (id: string) => {
    return tickets.find(ticket => ticket.id === id);
  };

  const createCategory = async (categoryData: Omit<Category, 'id'>) => {
    await addDoc(collection(db, "categories"), categoryData);
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    await updateDoc(doc(db, "categories", id), updates);
  };

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
  };

  const updateUserRole = async (userId: string, role: 'end_user' | 'support_agent' | 'admin') => {
    await updateDoc(doc(db, "users", userId), {
      role,
      updatedAt: new Date()
    });
  };

  const assignTicket = async (ticketId: string, agentId: string) => {
    await updateDoc(doc(db, "tickets", ticketId), {
      assignedTo: agentId,
      updatedAt: new Date()
    });
  };

  return (
    <TicketContext.Provider value={{
      tickets,
      categories,
      users,
      createTicket,
      updateTicket,
      addReply,
      voteTicket,
      getTicketById,
      createCategory,
      updateCategory,
      deleteCategory,
      updateUserRole,
      assignTicket
    }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};