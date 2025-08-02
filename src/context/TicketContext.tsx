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
  categoryInterest?: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ticket_reply' | 'ticket_status_change' | 'ticket_assigned' | 'new_ticket' | 'role_upgrade_request';
  ticketId?: string;
  read: boolean;
  createdAt: Date;
}

export interface RoleUpgradeRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  currentRole: 'end_user';
  requestedRole: 'support_agent';
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  processedAt?: Date;
  processedBy?: string;
}

interface TicketContextType {
  tickets: Ticket[];
  categories: Category[];
  users: UserProfile[];
  notifications: Notification[];
  roleUpgradeRequests: RoleUpgradeRequest[];
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
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  createRoleUpgradeRequest: (request: Omit<RoleUpgradeRequest, 'id' | 'createdAt'>) => Promise<void>;
  processRoleUpgradeRequest: (requestId: string, status: 'approved' | 'rejected', processedBy: string) => Promise<void>;
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [roleUpgradeRequests, setRoleUpgradeRequests] = useState<RoleUpgradeRequest[]>([]);
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

  // Listen for notifications
  useEffect(() => {
    if (!user) return;
    
    const unsub = onSnapshot(
      collection(db, "notifications"), 
      (snapshot) => {
        try {
          const notificationData = snapshot.docs
            .map(docSnap => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              } as Notification;
            })
            .filter(notification => notification.userId === user.uid);
          setNotifications(notificationData);
        } catch (error) {
          console.error('Error fetching notifications:', error);
          setNotifications([]);
        }
      },
      (error) => {
        console.error('Error listening to notifications:', error);
        setNotifications([]);
      }
    );
    return () => unsub();
  }, [user?.uid]);

  // Listen for role upgrade requests (admin only)
  useEffect(() => {
    if (user?.role !== 'admin') return;
    
    const unsub = onSnapshot(
      collection(db, "roleUpgradeRequests"), 
      (snapshot) => {
        try {
          const requestData = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              processedAt: data.processedAt?.toDate ? data.processedAt.toDate() : undefined,
            } as RoleUpgradeRequest;
          });
          setRoleUpgradeRequests(requestData);
        } catch (error) {
          console.error('Error fetching role upgrade requests:', error);
          setRoleUpgradeRequests([]);
        }
      },
      (error) => {
        console.error('Error listening to role upgrade requests:', error);
        setRoleUpgradeRequests([]);
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

  const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, "notifications"), {
      ...notificationData,
      createdAt: new Date()
    });
  };

  const markNotificationAsRead = async (notificationId: string) => {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true
    });
  };

  const createRoleUpgradeRequest = async (requestData: Omit<RoleUpgradeRequest, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, "roleUpgradeRequests"), {
      ...requestData,
      createdAt: new Date()
    });
  };

  const processRoleUpgradeRequest = async (requestId: string, status: 'approved' | 'rejected', processedBy: string) => {
    await updateDoc(doc(db, "roleUpgradeRequests", requestId), {
      status,
      processedBy,
      processedAt: new Date()
    });
  };

  const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    await updateDoc(doc(db, "users", userId), {
      ...updates,
      updatedAt: new Date()
    });
  };

  return (
    <TicketContext.Provider value={{
      tickets,
      categories,
      users,
      notifications,
      roleUpgradeRequests,
      createTicket,
      updateTicket,
      addReply,
      voteTicket,
      getTicketById,
      createCategory,
      updateCategory,
      deleteCategory,
      updateUserRole,
      assignTicket,
      createNotification,
      markNotificationAsRead,
      createRoleUpgradeRequest,
      processRoleUpgradeRequest,
      updateUserProfile
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