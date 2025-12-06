import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface ContactMessage {
  name: string;
  subject: string;
  message: string;
  userId: string;
  userEmail: string;
}

export async function submitContactMessage(data: ContactMessage): Promise<void> {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const messagesRef = collection(db, 'contact_messages');
    await addDoc(messagesRef, {
      ...data,
      timestamp: serverTimestamp(),
      status: 'new', // Status: new, read, resolved
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    throw new Error('Failed to submit message. Please try again later.');
  }
}
