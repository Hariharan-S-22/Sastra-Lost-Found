
export enum ItemType {
  LOST = 'LOST',
  FOUND = 'FOUND'
}

export enum ItemStatus {
  NEW = 'NEW',
  PENDING_CLAIM = 'PENDING_CLAIM',
  CLAIMED = 'CLAIMED',
  RESOLVED = 'RESOLVED'
}

export enum ClaimStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  profilePicture?: string;
  trustScore: number;
  resolvedCount: number;
  branch?: string;
  yearOfStudy?: string;
  residency?: 'Hosteller' | 'Day Scholar' | 'Unspecified';
  onboarded: boolean;
  theme: 'light' | 'dark';
}

export interface Item {
  id: string;
  title: string;
  category: string;
  type: ItemType;
  description: string;
  location: string;
  imagePaths: string[];
  reporterId: string;
  reporterName: string;
  date: string;
  status: ItemStatus;
  messages?: ChatMessage[];
  reports?: string[]; 
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  image?: string;
  images?: string[]; 
  timestamp: string;
}
