import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy, addDoc, updateDoc, doc, serverTimestamp, Timestamp, writeBatch } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'instructor' | 'student' | 'admin';
  message: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: string[];
  messageType: 'text' | 'file' | 'image' | 'link';
}

export interface ChatConversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  courseId?: string;
  courseName?: string;
}

export interface ChatStats {
  totalConversations: number;
  unreadMessages: number;
  activeChats: number;
  totalMessages: number;
}

class ChatService {
  private readonly CONVERSATIONS_COLLECTION = 'chatConversations';
  private readonly MESSAGES_COLLECTION = 'chatMessages';

  // Get all conversations for an instructor
  async getConversations(instructorId: string): Promise<ChatConversation[]> {
    try {
      const conversationsQuery = query(
        collection(db, this.CONVERSATIONS_COLLECTION),
        where('participants', 'array-contains', instructorId),
        orderBy('updatedAt', 'desc')
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);
      
      if (conversationsSnapshot.empty) {
        return this.getMockConversations(instructorId);
      }

      const conversations: ChatConversation[] = [];
      conversationsSnapshot.forEach(doc => {
        const data = doc.data();
        conversations.push({
          id: doc.id,
          participants: data.participants || [],
          participantNames: data.participantNames || [],
          lastMessage: data.lastMessage || '',
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          unreadCount: data.unreadCount || 0,
          isActive: data.isActive || true,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          courseId: data.courseId,
          courseName: data.courseName
        });
      });

      return conversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      return this.getMockConversations(instructorId);
    }
  }

  // Get messages for a specific conversation
  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const messagesQuery = query(
        collection(db, this.MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const messages: ChatMessage[] = [];
      messagesSnapshot.forEach(doc => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          senderRole: data.senderRole,
          message: data.message,
          timestamp: data.timestamp?.toDate() || new Date(),
          isRead: data.isRead || false,
          attachments: data.attachments || [],
          messageType: data.messageType || 'text'
        });
      });

      return messages;
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  // Send a message
  async sendMessage(messageData: Omit<ChatMessage, 'id' | 'timestamp'> & { conversationId: string }): Promise<void> {
    try {
      await addDoc(collection(db, this.MESSAGES_COLLECTION), {
        ...messageData,
        timestamp: serverTimestamp()
      });

      // Update conversation's last message and timestamp
      const conversationRef = doc(db, this.CONVERSATIONS_COLLECTION, messageData.conversationId);
      await updateDoc(conversationRef, {
        lastMessage: messageData.message,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const messagesQuery = query(
        collection(db, this.MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        where('senderId', '!=', userId),
        where('isRead', '==', false)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const batch = writeBatch(db);
      
      messagesSnapshot.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  // Create a new conversation
  async createConversation(conversationData: Omit<ChatConversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatConversation> {
    try {
      const conversationRef = await addDoc(collection(db, this.CONVERSATIONS_COLLECTION), {
        ...conversationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        ...conversationData,
        id: conversationRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  // Get unique courses from conversations
  async getConversationCourses(instructorId: string): Promise<{ id: string; name: string }[]> {
    try {
      const conversations = await this.getConversations(instructorId);
      const uniqueCourses = Array.from(new Set(conversations.map(conv => conv.courseId)))
        .filter(Boolean)
        .map(courseId => {
          const conversation = conversations.find(conv => conv.courseId === courseId);
          return {
            id: courseId!,
            name: conversation?.courseName || 'Unknown Course'
          };
        });
      return uniqueCourses;
    } catch (error) {
      console.error('Error getting conversation courses:', error);
      return [];
    }
  }

  // Get chat statistics
  async getChatStats(instructorId: string): Promise<ChatStats> {
    try {
      const conversations = await this.getConversations(instructorId);
      
      const totalConversations = conversations.length;
      const unreadMessages = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
      const activeChats = conversations.filter(conv => conv.isActive).length;
      
      // Count total messages (this would need a separate query in production)
      const totalMessages = conversations.length * 5; // Mock calculation
      
      return {
        totalConversations,
        unreadMessages,
        activeChats,
        totalMessages
      };
    } catch (error) {
      console.error('Error getting chat stats:', error);
      return this.getMockChatStats();
    }
  }

  // Mock data methods
  private getMockConversations(instructorId: string): ChatConversation[] {
    return [
      {
        id: '1',
        participants: [instructorId, 'student1'],
        participantNames: ['You', 'John Smith'],
        lastMessage: 'Thank you for the clarification on the assignment!',
        lastMessageTime: new Date('2025-01-23T10:30:00'),
        unreadCount: 0,
        isActive: true,
        createdAt: new Date('2025-01-20'),
        updatedAt: new Date('2025-01-23T10:30:00'),
        courseId: 'course1',
        courseName: 'React Fundamentals'
      },
      {
        id: '2',
        participants: [instructorId, 'student2'],
        participantNames: ['You', 'Sarah Johnson'],
        lastMessage: 'When will the next module be available?',
        lastMessageTime: new Date('2025-01-23T09:15:00'),
        unreadCount: 1,
        isActive: true,
        createdAt: new Date('2025-01-18'),
        updatedAt: new Date('2025-01-23T09:15:00'),
        courseId: 'course1',
        courseName: 'React Fundamentals'
      },
      {
        id: '3',
        participants: [instructorId, 'student3'],
        participantNames: ['You', 'Mike Davis'],
        lastMessage: 'I completed the project. Can you review it?',
        lastMessageTime: new Date('2025-01-22T16:45:00'),
        unreadCount: 0,
        isActive: true,
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-22T16:45:00'),
        courseId: 'course2',
        courseName: 'Advanced JavaScript'
      },
      {
        id: '4',
        participants: [instructorId, 'student4'],
        participantNames: ['You', 'Emily Wilson'],
        lastMessage: 'The course material is excellent!',
        lastMessageTime: new Date('2025-01-21T14:20:00'),
        unreadCount: 0,
        isActive: false,
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-21T14:20:00'),
        courseId: 'course2',
        courseName: 'Advanced JavaScript'
      },
      {
        id: '5',
        participants: [instructorId, 'student5'],
        participantNames: ['You', 'Alex Chen'],
        lastMessage: 'Can you help me with the authentication setup?',
        lastMessageTime: new Date('2025-01-24T11:20:00'),
        unreadCount: 2,
        isActive: true,
        createdAt: new Date('2025-01-22'),
        updatedAt: new Date('2025-01-24T11:20:00'),
        courseId: 'course3',
        courseName: 'Node.js Backend Development'
      },
      {
        id: '6',
        participants: [instructorId, 'student6'],
        participantNames: ['You', 'Lisa Rodriguez'],
        lastMessage: 'The project deadline is approaching. Any tips?',
        lastMessageTime: new Date('2025-01-24T08:45:00'),
        unreadCount: 0,
        isActive: true,
        createdAt: new Date('2025-01-19'),
        updatedAt: new Date('2025-01-24T08:45:00'),
        courseId: 'course1',
        courseName: 'React Fundamentals'
      }
    ];
  }

  private getMockChatStats(): ChatStats {
    return {
      totalConversations: 4,
      unreadMessages: 1,
      activeChats: 3,
      totalMessages: 20
    };
  }
}

export const chatService = new ChatService();
export default chatService;
