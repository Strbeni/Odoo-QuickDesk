import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

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

interface TicketContextType {
  tickets: Ticket[];
  categories: Category[];
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'votes' | 'votedBy'>) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  addReply: (ticketId: string, message: string) => void;
  voteTicket: (ticketId: string, userId: string) => void;
  getTicketById: (id: string) => Ticket | undefined;
  createCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

// Default categories
const defaultCategories: Category[] = [
  { id: '1', name: 'Technical', description: 'Technical issues and bugs' },
  { id: '2', name: 'Account', description: 'Account related questions' },
  { id: '3', name: 'Billing', description: 'Billing and payment issues' },
  { id: '4', name: 'Feature Request', description: 'New feature requests' },
  { id: '5', name: 'Other', description: 'Other questions and issues' },
];

// Dummy tickets for demonstration
const dummyTickets: Ticket[] = [
  {
    id: '1',
    title: 'Login issues with mobile app',
    description: 'Cannot log in to the mobile application using my credentials. The app keeps showing "Invalid credentials" even though I\'m sure the email and password are correct.',
    status: 'open',
    category: 'Technical',
    priority: 'high',
    createdBy: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    replies: [
      {
        id: '1',
        message: 'Hi! I\'m looking into this issue. Can you tell me which device you\'re using?',
        authorId: '2',
        authorName: 'Agent Smith',
        timestamp: new Date('2024-01-15T10:30:00')
      }
    ],
    votes: 3,
    votedBy: ['4', '5', '6']
  },
  {
    id: '2',
    title: 'Password reset not working',
    description: 'I requested a password reset email but haven\'t received it yet. Checked spam folder as well.',
    status: 'in_progress',
    category: 'Account',
    priority: 'medium',
    createdBy: '1',
    assignedTo: '2',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    replies: [],
    votes: 1,
    votedBy: ['7']
  },
  {
    id: '3',
    title: 'Billing question about subscription',
    description: 'Need clarification on billing cycle and when the next payment will be charged.',
    status: 'resolved',
    category: 'Billing',
    priority: 'low',
    createdBy: '1',
    assignedTo: '2',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    replies: [
      {
        id: '2',
        message: 'Your billing cycle is monthly, and the next payment will be on January 28th.',
        authorId: '2',
        authorName: 'Agent Smith',
        timestamp: new Date('2024-01-13T14:20:00')
      }
    ],
    votes: 5,
    votedBy: ['8', '9', '10', '11', '12']
  }
];

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(dummyTickets);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const { user } = useAuth();

  const createTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'votes' | 'votedBy'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: (tickets.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
      votes: 0,
      votedBy: []
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === id 
        ? { ...ticket, ...updates, updatedAt: new Date() }
        : ticket
    ));
  };

  const addReply = (ticketId: string, message: string) => {
    if (!user) return;
    
    const newReply: Reply = {
      id: Date.now().toString(),
      message,
      authorId: user.uid,
      authorName: user.name,
      timestamp: new Date()
    };

    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId
        ? { 
            ...ticket, 
            replies: [...ticket.replies, newReply],
            updatedAt: new Date()
          }
        : ticket
    ));
  };

  const voteTicket = (ticketId: string, userId: string) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        const hasVoted = ticket.votedBy.includes(userId);
        if (hasVoted) {
          return {
            ...ticket,
            votes: ticket.votes - 1,
            votedBy: ticket.votedBy.filter(id => id !== userId)
          };
        } else {
          return {
            ...ticket,
            votes: ticket.votes + 1,
            votedBy: [...ticket.votedBy, userId]
          };
        }
      }
      return ticket;
    }));
  };

  const getTicketById = (id: string) => {
    return tickets.find(ticket => ticket.id === id);
  };

  const createCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: (categories.length + 1).toString()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(category =>
      category.id === id ? { ...category, ...updates } : category
    ));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  return (
    <TicketContext.Provider value={{
      tickets,
      categories,
      createTicket,
      updateTicket,
      addReply,
      voteTicket,
      getTicketById,
      createCategory,
      updateCategory,
      deleteCategory
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