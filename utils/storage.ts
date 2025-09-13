import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Report } from '../types';

const USER_KEY = 'civicreport_user';
const REPORTS_KEY = 'civicreport_reports';

export const StorageService = {
  // User methods
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

  // Reports methods
  async saveReports(reports: Report[]): Promise<void> {
    try {
      await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving reports:', error);
    }
  },

  async getReports(): Promise<Report[]> {
    try {
      const reportsData = await AsyncStorage.getItem(REPORTS_KEY);
      return reportsData ? JSON.parse(reportsData) : [];
    } catch (error) {
      console.error('Error getting reports:', error);
      return [];
    }
  },

  async addReport(report: Report): Promise<void> {
    try {
      const existingReports = await this.getReports();
      const updatedReports = [...existingReports, report];
      await this.saveReports(updatedReports);
    } catch (error) {
      console.error('Error adding report:', error);
    }
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([USER_KEY, REPORTS_KEY]);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
};