import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  sellerId: string;
  sellerUsername: string;
  createdAt: string;
  isAvailable: boolean;
}

export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  timestamp: string;
  rating?: number;
  review?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface DataContextType {
  listings: Listing[];
  transactions: Transaction[];
  messages: Message[];
  addListing: (listing: Omit<Listing, 'id' | 'sellerId' | 'sellerUsername' | 'createdAt'>) => void;
  purchaseItem: (listingId: string) => boolean;
  addRating: (transactionId: string, rating: number, review?: string) => void;
  sendMessage: (receiverId: string, content: string, listingId?: string) => void;
  markMessageAsRead: (messageId: string) => void;
  getUserTransactions: (userId: string) => Transaction[];
  getUserMessages: (userId: string) => Message[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Sample data
const sampleListings: Listing[] = [
  {
    id: '1',
    title: 'REV Robotics 15mm Building System Kit',
    description: 'Complete building system with extrusions, brackets, and hardware. Perfect for FTC robot chassis construction.',
    price: 35,
    category: 'Building Systems',
    image: 'https://images.pexels.com/photos/2881232/pexels-photo-2881232.jpeg?auto=compress&cs=tinysrgb&w=500',
    sellerId: 'seller1',
    sellerUsername: 'RoboticsTeam5234',
    createdAt: '2025-01-15T10:00:00Z',
    isAvailable: true
  },
  {
    id: '2',
    title: 'Tetrix Max Motor Mount Kit',
    description: 'Durable motor mounts compatible with Tetrix building system. Includes all necessary hardware.',
    price: 15,
    category: 'Drivetrain',
    image: 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=500',
    sellerId: 'seller2',
    sellerUsername: 'MechWarriors',
    createdAt: '2025-01-14T15:30:00Z',
    isAvailable: true
  },
  {
    id: '3',
    title: 'Custom 3D Printed Intake System',
    description: 'High-performance intake mechanism designed for game piece collection. Printed with PETG for durability.',
    price: 25,
    category: 'Game Elements',
    image: 'https://images.pexels.com/photos/1370022/pexels-photo-1370022.jpeg?auto=compress&cs=tinysrgb&w=500',
    sellerId: 'seller3',
    sellerUsername: 'PrintedRobotics',
    createdAt: '2025-01-13T09:15:00Z',
    isAvailable: true
  },
  {
    id: '4',
    title: 'Servo Programming Workshop',
    description: 'One-hour virtual workshop on advanced servo control techniques for FTC robots. Includes sample code.',
    price: 20,
    category: 'Services',
    image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=500',
    sellerId: 'seller4',
    sellerUsername: 'CodeMentors',
    createdAt: '2025-01-12T14:00:00Z',
    isAvailable: true
  },
  {
    id: '5',
    title: 'REV Control Hub Protective Case',
    description: 'Lightweight aluminum case to protect your Control Hub from impacts during competition.',
    price: 30,
    category: 'Electronics',
    image: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=500',
    sellerId: 'seller1',
    sellerUsername: 'RoboticsTeam5234',
    createdAt: '2025-01-11T11:45:00Z',
    isAvailable: true
  },
  {
    id: '6',
    title: 'Competition-Grade Odometry Wheels',
    description: 'Precision-manufactured wheels for accurate robot positioning. Set of 3 wheels with encoders.',
    price: 45,
    category: 'Sensors',
    image: 'https://images.pexels.com/photos/190574/pexels-photo-190574.jpeg?auto=compress&cs=tinysrgb&w=500',
    sellerId: 'seller5',
    sellerUsername: 'PrecisionParts',
    createdAt: '2025-01-10T16:20:00Z',
    isAvailable: true
  }
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Initialize with sample data if localStorage is empty
    const savedListings = localStorage.getItem('listings');
    if (!savedListings) {
      setListings(sampleListings);
      localStorage.setItem('listings', JSON.stringify(sampleListings));
    } else {
      setListings(JSON.parse(savedListings));
    }

    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }

    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  const addListing = (newListing: Omit<Listing, 'id' | 'sellerId' | 'sellerUsername' | 'createdAt'>) => {
    if (!user) return;

    const listing: Listing = {
      ...newListing,
      id: Date.now().toString(),
      sellerId: user.id,
      sellerUsername: user.username,
      createdAt: new Date().toISOString(),
      isAvailable: true
    };

    const updatedListings = [...listings, listing];
    setListings(updatedListings);
    localStorage.setItem('listings', JSON.stringify(updatedListings));
  };

  const purchaseItem = (listingId: string): boolean => {
    if (!user) return false;

    const listing = listings.find(l => l.id === listingId);
    if (!listing || !listing.isAvailable || user.credits < listing.price) {
      return false;
    }

    // Create transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      listingId: listing.id,
      buyerId: user.id,
      sellerId: listing.sellerId,
      amount: listing.price,
      timestamp: new Date().toISOString()
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

    // Mark listing as unavailable
    const updatedListings = listings.map(l =>
      l.id === listingId ? { ...l, isAvailable: false } : l
    );
    setListings(updatedListings);
    localStorage.setItem('listings', JSON.stringify(updatedListings));

    return true;
  };

  const addRating = (transactionId: string, rating: number, review?: string) => {
    const updatedTransactions = transactions.map(t =>
      t.id === transactionId ? { ...t, rating, review } : t
    );
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

  const sendMessage = (receiverId: string, content: string, listingId?: string) => {
    if (!user) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId,
      listingId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
  };

  const markMessageAsRead = (messageId: string) => {
    const updatedMessages = messages.map(m =>
      m.id === messageId ? { ...m, isRead: true } : m
    );
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
  };

  const getUserTransactions = (userId: string) => {
    return transactions.filter(t => t.buyerId === userId || t.sellerId === userId);
  };

  const getUserMessages = (userId: string) => {
    return messages.filter(m => m.senderId === userId || m.receiverId === userId);
  };

  return (
    <DataContext.Provider value={{
      listings,
      transactions,
      messages,
      addListing,
      purchaseItem,
      addRating,
      sendMessage,
      markMessageAsRead,
      getUserTransactions,
      getUserMessages
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}