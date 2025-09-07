import { databases, DATABASE_ID, COLLECTIONS } from './appwrite-server';
import { User, Crop, JourneyStep, Transaction } from '../types/index';
import { ID, Query } from 'node-appwrite';

export class DatabaseService {
  // User operations
  static async createUser(userData: Partial<User>): Promise<User> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        ID.unique(),
        userData
      );
      return response as User;
    } catch (error) {ll not 
      console.error('Create user error:', error);
      throw error;
    }
  }

  static async getUserByPhone(phone: string): Promise<User | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('phone', phone)]
      );
      return response.documents.length > 0 ? (response.documents[0] as unknown as User) : null;
    } catch (error) {
      console.error('Get user by phone error:', error);
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId
      );
      return response as User;
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        updates
      );
      return response as User;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  // Crop operations
  static async createCrop(cropData: Partial<Crop>): Promise<Crop> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CROPS,
        ID.unique(),
        {
          ...cropData,
          harvestDate: cropData.harvestDate || new Date().toISOString(),
        }
      );
      return response as Crop;
    } catch (error) {
      console.error('Create crop error:', error);
      throw error;
    }
  }

  static async getCropByCropId(cropId: string): Promise<Crop | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CROPS,
        [Query.equal('cropId', cropId)]
      );
      return response.documents.length > 0 ? (response.documents[0] as unknown as Crop) : null;
    } catch (error) {
      console.error('Get crop by cropId error:', error);
      return null;
    }
  }

  static async getCropsByFarmer(farmerId: string): Promise<Crop[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CROPS,
        [
          Query.equal('farmerId', farmerId),
          Query.orderDesc('$createdAt')
        ]
      );
      return response.documents as unknown as Crop[];
    } catch (error) {
      console.error('Get crops by farmer error:', error);
      throw error;
    }
  }

  static async updateCrop(cropId: string, updates: Partial<Crop>): Promise<Crop> {
    try {
      // First get the crop by cropId
      const crop = await this.getCropByCropId(cropId);
      if (!crop) throw new Error('Crop not found');

      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CROPS,
        crop.$id,
        updates
      );
      return response as Crop;
    } catch (error) {
      console.error('Update crop error:', error);
      throw error;
    }
  }

  // Journey operations
  static async addJourneyStep(stepData: Partial<JourneyStep>): Promise<JourneyStep> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.JOURNEY,
        ID.unique(),
        {
          ...stepData,
          timestamp: stepData.timestamp || new Date().toISOString(),
        }
      );
      return response as unknown as JourneyStep;
    } catch (error) {
      console.error('Add journey step error:', error);
      throw error;
    }
  }

  static async getCropJourney(cropId: string): Promise<JourneyStep[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.JOURNEY,
        [
          Query.equal('cropId', cropId),
          Query.orderAsc('timestamp')
        ]
      );
      return response.documents as unknown as JourneyStep[];
    } catch (error) {
      console.error('Get crop journey error:', error);
      throw error;
    }
  }

  // Transaction operations
  static async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        ID.unique(),
        transactionData
      );
      return response as Transaction;
    } catch (error) {
      console.error('Create transaction error:', error);
      throw error;
    }
  }

  static async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<Transaction> {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        transactionId,
        updates
      );
      return response as Transaction;
    } catch (error) {
      console.error('Update transaction error:', error);
      throw error;
    }
  }

  static async getTransactionsByCrop(cropId: string): Promise<Transaction[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        [
          Query.equal('cropId', cropId),
          Query.orderDesc('$createdAt')
        ]
      );
      return response.documents as unknown as Transaction[];
    } catch (error) {
      console.error('Get transactions by crop error:', error);
      throw error;
    }
  }
}