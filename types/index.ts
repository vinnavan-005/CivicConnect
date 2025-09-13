export interface User {
  name: string;
  email: string;
  phone: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  useGPS: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  media?: string[];
  audioMessage?: string;
  timestamp: string;
  status: 'pending' | 'in-progress' | 'resolved';
  upvotes: number;
  progress: number;
  submittedAt: string;
  lastUpdate: string;
  updates: Update[];
  departmentAssigned?: string;
}

export interface Update {
  date: string;
  message: string;
  author: string;
}

export interface IssueMarker {
  id: string;
  title: string;
  category: string;
  location: string;
  distance: string;
  upvotes: number;
  status: 'pending' | 'in-progress' | 'resolved';
  timestamp: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface ActivityItem {
  id: string;
  title: string;
  location: string;
  type: 'resolved' | 'new' | 'in-progress';
  time: string;
}

export interface QuickStats {
  totalIssues: number;
  resolved: number;
  inProgress: number;
  pending: number;
  userReports: number;
  communityRank: string;
}

export type TabParamList = {
  index: undefined;
  report: undefined;
  map: undefined;
  'my-reports': undefined;
};