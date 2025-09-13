import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StorageService } from '../../utils/storage';
import { Report } from '../../types';

// Mock user reports data with progress tracking
const mockUserReports: Report[] = [
  {
    id: '1',
    title: 'Broken Street Light on Main St',
    category: 'Street Lighting',
    location: 'Main St & 5th Ave',
    description: 'Street light has been flickering for days and now completely out',
    status: 'in-progress',
    progress: 60,
    upvotes: 12,
    submittedAt: '2024-01-15T10:30:00Z',
    lastUpdate: '2024-01-16T14:20:00Z',
    useGPS: true,
    timestamp: '2024-01-15T10:30:00Z',
    updates: [
      {
        date: '2024-01-16T14:20:00Z',
        message: 'Repair crew has been assigned and will fix the light tomorrow morning.',
        author: 'Municipal Works Dept'
      },
      {
        date: '2024-01-15T16:45:00Z',
        message: 'Report received and forwarded to the electrical department.',
        author: 'Admin'
      }
    ],
    departmentAssigned: 'Electrical Department'
  },
  {
    id: '2',
    title: 'Large Pothole on Oak Street',
    category: 'Road & Traffic',
    location: 'Oak St near Central Park',
    description: 'Deep pothole causing damage to vehicles',
    status: 'pending',
    progress: 25,
    upvotes: 8,
    submittedAt: '2024-01-14T09:15:00Z',
    lastUpdate: '2024-01-14T11:30:00Z',
    useGPS: false,
    timestamp: '2024-01-14T09:15:00Z',
    updates: [
      {
        date: '2024-01-14T11:30:00Z',
        message: 'Report under review by the road maintenance team.',
        author: 'Admin'
      }
    ],
    departmentAssigned: 'Road Maintenance'
  },
  {
    id: '3',
    title: 'Overflowing Trash Bin',
    category: 'Waste Management',
    location: 'Central Park Entrance',
    description: 'Trash bin has been overflowing for several days',
    status: 'resolved',
    progress: 100,
    upvotes: 15,
    submittedAt: '2024-01-10T08:00:00Z',
    lastUpdate: '2024-01-12T10:15:00Z',
    useGPS: true,
    timestamp: '2024-01-10T08:00:00Z',
    updates: [
      {
        date: '2024-01-12T10:15:00Z',
        message: 'Issue resolved. Trash bin has been emptied and pickup schedule adjusted.',
        author: 'Waste Management Dept'
      },
      {
        date: '2024-01-11T13:20:00Z',
        message: 'Cleanup crew dispatched to address the overflow.',
        author: 'Waste Management Dept'
      },
      {
        date: '2024-01-10T10:45:00Z',
        message: 'Report received and assigned to waste management team.',
        author: 'Admin'
      }
    ],
    departmentAssigned: 'Waste Management'
  }
];

export default function MyReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const userReports = await StorageService.getReports();
    // Combine user reports with mock data for demo
    setReports([...userReports, ...mockUserReports]);
  };

  const filteredReports = reports.filter(report => 
    filter === 'all' || report.status === filter
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#10b981';
    if (progress >= 60) return '#3b82f6';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Ionicons name="time" size={16} color="#f59e0b" />,
          color: '#f59e0b',
          bgColor: '#fef3c7',
          label: 'Pending Review'
        };
      case 'in-progress':
        return {
          icon: <Ionicons name="trending-up" size={16} color="#3b82f6" />,
          color: '#3b82f6',
          bgColor: '#dbeafe',
          label: 'In Progress'
        };
      case 'resolved':
        return {
          icon: <Ionicons name="checkmark-circle" size={16} color="#10b981" />,
          color: '#10b981',
          bgColor: '#dcfce7',
          label: 'Resolved'
        };
      default:
        return {
          icon: <Ionicons name="help-circle" size={16} color="#6b7280" />,
          color: '#6b7280',
          bgColor: '#f3f4f6',
          label: 'Unknown'
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Reports</Text>
            <Text style={styles.subtitle}>
              Track the progress of your civic issue reports
            </Text>
          </View>
          
          {/* Filter buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {(['all', 'pending', 'in-progress', 'resolved'] as const).map((status) => (
              <Button
                key={status}
                title={status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onPress={() => setFilter(status)}
                style={styles.filterButton}
              />
            ))}
          </ScrollView>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <CardContent style={styles.summaryContent}>
              <Text style={styles.summaryNumber}>{reports.length}</Text>
              <Text style={styles.summaryLabel}>Total Reports</Text>
            </CardContent>
          </Card>
          <Card style={styles.summaryCard}>
            <CardContent style={styles.summaryContent}>
              <Text style={[styles.summaryNumber, { color: '#f59e0b' }]}>
                {reports.filter(r => r.status === 'pending').length}
              </Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </CardContent>
          </Card>
          <Card style={styles.summaryCard}>
            <CardContent style={styles.summaryContent}>
              <Text style={[styles.summaryNumber, { color: '#3b82f6' }]}>
                {reports.filter(r => r.status === 'in-progress').length}
              </Text>
              <Text style={styles.summaryLabel}>In Progress</Text>
            </CardContent>
          </Card>
          <Card style={styles.summaryCard}>
            <CardContent style={styles.summaryContent}>
              <Text style={[styles.summaryNumber, { color: '#10b981' }]}>
                {reports.filter(r => r.status === 'resolved').length}
              </Text>
              <Text style={styles.summaryLabel}>Resolved</Text>
            </CardContent>
          </Card>
        </View>

        {/* Reports List */}
        <View style={styles.reportsList}>
          {filteredReports.map((report) => {
            const statusConfig = getStatusConfig(report.status);
            const isExpanded = selectedReport === report.id;
            
            return (
              <Card key={report.id}>
                <TouchableOpacity
                  onPress={() => setSelectedReport(isExpanded ? null : report.id)}
                >
                  <CardHeader style={styles.reportHeader}>
                    <View style={styles.reportTitleRow}>
                      <Text style={styles.reportTitle}>{report.title}</Text>
                      <TouchableOpacity style={styles.expandButton}>
                        <Ionicons 
                          name={isExpanded ? "chevron-up" : "chevron-down"} 
                          size={20} 
                          color="#6b7280" 
                        />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.reportMeta}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{report.category}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                        {statusConfig.icon}
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                          {statusConfig.label}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressPercent}>{report.progress}%</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill,
                            { 
                              width: `${report.progress}%`,
                              backgroundColor: getProgressColor(report.progress)
                            }
                          ]}
                        />
                      </View>
                    </View>

                    <View style={styles.reportFooter}>
                      <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={12} color="#6b7280" />
                        <Text style={styles.locationText}>{report.location}</Text>
                      </View>
                      <View style={styles.timeContainer}>
                        <Ionicons name="calendar-outline" size={12} color="#6b7280" />
                        <Text style={styles.timeText}>Submitted {formatDate(report.submittedAt)}</Text>
                      </View>
                      <View style={styles.engagementContainer}>
                        <Text style={styles.upvoteText}>↑ {report.upvotes}</Text>
                        <Ionicons name="chatbubble-outline" size={12} color="#6b7280" />
                        <Text style={styles.updateCount}>{report.updates.length}</Text>
                      </View>
                    </View>
                  </CardHeader>
                </TouchableOpacity>

                {/* Expanded Details */}
                {isExpanded && (
                  <CardContent style={styles.expandedContent}>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Description</Text>
                      <Text style={styles.detailText}>{report.description}</Text>
                    </View>

                    {report.departmentAssigned && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Assigned Department</Text>
                        <View style={styles.departmentBadge}>
                          <Text style={styles.departmentText}>{report.departmentAssigned}</Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Updates Timeline</Text>
                      <View style={styles.timeline}>
                        {report.updates.map((update, index) => (
                          <View key={index} style={styles.timelineItem}>
                            <View style={styles.timelineDot} />
                            <View style={styles.timelineContent}>
                              <View style={styles.updateHeader}>
                                <Text style={styles.updateAuthor}>{update.author}</Text>
                                <Text style={styles.updateDate}>{formatDate(update.date)}</Text>
                              </View>
                              <Text style={styles.updateMessage}>{update.message}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </View>

        {filteredReports.length === 0 && (
          <Card>
            <CardContent style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No reports found</Text>
              <Text style={styles.emptyMessage}>
                {filter === 'all' 
                  ? "You haven't submitted any reports yet." 
                  : `No ${filter.replace('-', ' ')} reports found.`}
              </Text>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#030213',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  filterContainer: {
    flexGrow: 0,
  },
  filterButton: {
    marginRight: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    marginBottom: 0,
  },
  summaryContent: {
    alignItems: 'center',
    padding: 16,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#030213',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  reportsList: {
    gap: 16,
  },
  reportHeader: {
    padding: 16,
  },
  reportTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#030213',
    flex: 1,
  },
  expandButton: {
    padding: 4,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#374151',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#374151',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#030213',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  engagementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upvoteText: {
    fontSize: 12,
    color: '#6b7280',
  },
  updateCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fafafa',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#030213',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  departmentBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  departmentText: {
    fontSize: 12,
    color: '#1d4ed8',
  },
  timeline: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineDot: {
    width: 8,
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  updateAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#030213',
  },
  updateDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  updateMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#030213',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});