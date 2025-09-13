import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/input';
import { IssueMarker } from '../../types';

// Mock data for nearby issues
const mockIssues: IssueMarker[] = [
  {
    id: '1',
    title: 'Broken Street Light',
    category: 'Street Lighting',
    location: 'Main St & 5th Ave',
    distance: '0.2 miles',
    upvotes: 12,
    status: 'in-progress',
    timestamp: '2 hours ago',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: '2',
    title: 'Pothole on Oak Street',
    category: 'Road & Traffic',
    location: 'Oak St near Park',
    distance: '0.5 miles',
    upvotes: 8,
    status: 'pending',
    timestamp: '5 hours ago',
    coordinates: { lat: 40.7130, lng: -74.0065 }
  },
  {
    id: '3',
    title: 'Overflowing Trash Bin',
    category: 'Waste Management',
    location: 'Central Park Entrance',
    distance: '0.8 miles',
    upvotes: 15,
    status: 'resolved',
    timestamp: '1 day ago',
    coordinates: { lat: 40.7125, lng: -74.0055 }
  },
  {
    id: '4',
    title: 'Water Leak',
    category: 'Water & Drainage',
    location: 'Elm St & 3rd Ave',
    distance: '1.2 miles',
    upvotes: 6,
    status: 'pending',
    timestamp: '3 hours ago',
    coordinates: { lat: 40.7135, lng: -74.0070 }
  },
  {
    id: '5',
    title: 'Graffiti on Public Building',
    category: 'Public Safety',
    location: 'City Hall',
    distance: '1.5 miles',
    upvotes: 4,
    status: 'in-progress',
    timestamp: '6 hours ago',
    coordinates: { lat: 40.7120, lng: -74.0050 }
  }
];

const categoryColors: { [key: string]: string } = {
  'Road & Traffic': '#fca5a5',
  'Water & Drainage': '#93c5fd',
  'Electricity': '#fde68a',
  'Waste Management': '#86efac',
  'Public Safety': '#fdba74',
  'Street Lighting': '#c4b5fd',
  'Parks & Recreation': '#6ee7b7',
  'Public Transport': '#a5b4fc',
  'Other': '#d1d5db'
};

const categories = Object.keys(categoryColors);

export default function IssueMapScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const filteredIssues = mockIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpvote = (issueId: string) => {
    console.log('Upvoted issue:', issueId);
    // In real app, this would update the backend and local state
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Ionicons name="time" size={16} color="#f59e0b" />;
      case 'in-progress':
        return <Ionicons name="trending-up" size={16} color="#3b82f6" />;
      case 'resolved':
        return <Ionicons name="checkmark-circle" size={16} color="#10b981" />;
      default:
        return <Ionicons name="help-circle" size={16} color="#6b7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#dc2626';
      case 'in-progress':
        return '#3b82f6';
      case 'resolved':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const renderMapMarker = (issue: IssueMarker, index: number) => {
    const isSelected = selectedIssue === issue.id;
    return (
      <TouchableOpacity
        key={issue.id}
        style={[
          styles.mapMarker,
          {
            backgroundColor: getStatusColor(issue.status),
            transform: [{ scale: isSelected ? 1.2 : 1 }],
            top: `${20 + (index * 15)}%`,
            left: `${25 + (index * 12)}%`,
          }
        ]}
        onPress={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
      >
        <Text style={styles.markerText}>{issue.upvotes}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Community Issues Map</Text>
          <Text style={styles.subtitle}>
            View and support civic issues in your area
          </Text>
        </View>

        {/* Search and Filters */}
        <Card>
          <CardContent>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={16} color="#6b7280" style={styles.searchIcon} />
                <Input
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Search issues or locations..."
                  style={styles.searchInput}
                />
              </View>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowCategoryFilter(!showCategoryFilter)}
              >
                <Ionicons name="filter" size={16} color="#030213" />
                <Text style={styles.filterButtonText}>Filter</Text>
              </TouchableOpacity>
            </View>

            {showCategoryFilter && (
              <View style={styles.categoryFilter}>
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    selectedCategory === 'all' && styles.categoryChipActive
                  ]}
                  onPress={() => setSelectedCategory('all')}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === 'all' && styles.categoryChipTextActive
                  ]}>
                    All Categories
                  </Text>
                </TouchableOpacity>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category && styles.categoryChipActive
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategory === category && styles.categoryChipTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Map and Issues List */}
        <View style={styles.mapContainer}>
          {/* Mock Map */}
          <Card style={styles.mapCard}>
            <CardHeader>
              <CardTitle style={styles.mapTitle}>
                <Ionicons name="location" size={20} color="#030213" />
                <Text style={styles.mapTitleText}>Issues Heatmap</Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.mapView}>
                {filteredIssues.map((issue, index) => renderMapMarker(issue, index))}
                
                {/* Map Legend */}
                <View style={styles.mapLegend}>
                  <Text style={styles.legendTitle}>Legend</Text>
                  <View style={styles.legendItems}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
                      <Text style={styles.legendText}>Pending</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
                      <Text style={styles.legendText}>In Progress</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                      <Text style={styles.legendText}>Resolved</Text>
                    </View>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Issues List */}
          <Card>
            <CardHeader>
              <CardTitle>Nearby Issues ({filteredIssues.length})</CardTitle>
            </CardHeader>
            <CardContent style={styles.issuesListContent}>
              <ScrollView style={styles.issuesList} nestedScrollEnabled>
                {filteredIssues.map((issue) => (
                  <TouchableOpacity
                    key={issue.id}
                    style={[
                      styles.issueItem,
                      selectedIssue === issue.id && styles.issueItemSelected
                    ]}
                    onPress={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                  >
                    <View style={styles.issueHeader}>
                      <View style={styles.issueInfo}>
                        <Text style={styles.issueTitle}>{issue.title}</Text>
                        <View style={styles.issueMeta}>
                          <View style={[
                            styles.categoryBadge,
                            { backgroundColor: categoryColors[issue.category] }
                          ]}>
                            <Text style={styles.categoryBadgeText}>{issue.category}</Text>
                          </View>
                          <View style={styles.statusContainer}>
                            {getStatusIcon(issue.status)}
                            <Text style={[styles.statusText, { color: getStatusColor(issue.status) }]}>
                              {issue.status.replace('-', ' ').toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Button
                        title={`↑ ${issue.upvotes}`}
                        variant="outline"
                        size="sm"
                        onPress={() => handleUpvote(issue.id)}
                        style={styles.upvoteButton}
                      />
                    </View>
                    
                    <View style={styles.issueFooter}>
                      <View style={styles.locationInfo}>
                        <Ionicons name="location-outline" size={12} color="#6b7280" />
                        <Text style={styles.locationText}>{issue.location}</Text>
                      </View>
                      <View style={styles.timeInfo}>
                        <Text style={styles.distanceText}>{issue.distance}</Text>
                        <Text style={styles.separatorText}>•</Text>
                        <Text style={styles.timeText}>{issue.timestamp}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </CardContent>
          </Card>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={styles.statNumber}>{mockIssues.length}</Text>
              <Text style={styles.statLabel}>Total Issues</Text>
            </CardContent>
          </Card>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#10b981' }]}>
                {mockIssues.filter(i => i.status === 'resolved').length}
              </Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </CardContent>
          </Card>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#3b82f6' }]}>
                {mockIssues.filter(i => i.status === 'in-progress').length}
              </Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </CardContent>
          </Card>
        </View>
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
    alignItems: 'center',
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
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 18,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 36,
    marginBottom: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    gap: 4,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#030213',
  },
  categoryFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#374151',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  mapContainer: {
    gap: 16,
  },
  mapCard: {
    height: 300,
  },
  mapTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#030213',
  },
  mapView: {
    flex: 1,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  mapMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  mapLegend: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#030213',
    marginBottom: 8,
  },
  legendItems: {
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 10,
    color: '#6b7280',
  },
  issuesListContent: {
    maxHeight: 400,
    padding: 0,
  },
  issuesList: {
    maxHeight: 400,
  },
  issueItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  issueItemSelected: {
    backgroundColor: '#f9fafb',
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueInfo: {
    flex: 1,
    marginRight: 12,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#030213',
    marginBottom: 8,
  },
  issueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#030213',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  upvoteButton: {
    minWidth: 60,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#6b7280',
  },
  separatorText: {
    fontSize: 12,
    color: '#6b7280',
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    marginBottom: 0,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#030213',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
});