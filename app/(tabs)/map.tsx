import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/input';
import { IssueMarker } from '../../types';

// Mock data for nearby issues - your original data
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
    coordinates: { lat: 12.9716, lng: 77.6413 }
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
    coordinates: { lat: 12.9730, lng: 77.6420 }
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
    coordinates: { lat: 12.9700, lng: 77.6400 }
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
    coordinates: { lat: 12.9750, lng: 77.6450 }
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
    coordinates: { lat: 12.9680, lng: 77.6380 }
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Civic Issues Map</Text>
          <Text style={styles.subtitle}>
            Explore and track civic issues in your area
          </Text>
        </View>

        {/* Search and Filter */}
        <Card style={{ marginBottom: 16 }}>
          <CardContent>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                <Input
                  style={styles.searchInput}
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
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

            {/* Category Filter */}
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

        {/* Map Section - Fixed Height */}
        <Card style={styles.mapCard}>
          <CardHeader>
            <CardTitle style={styles.mapTitle}>
              <Ionicons name="location" size={20} color="#030213" />
              <Text style={styles.mapTitleText}>Issues Map</Text>
            </CardTitle>
          </CardHeader>
          <CardContent style={styles.mapCardContent}>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: 12.9716,
                  longitude: 77.6413,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={true}
                rotateEnabled={true}
              >
                {/* Individual Markers with Custom Colors */}
                {filteredIssues.map((issue) => (
                  <Marker
                    key={issue.id}
                    coordinate={{
                      latitude: issue.coordinates.lat,
                      longitude: issue.coordinates.lng,
                    }}
                    title={issue.title}
                    description={`${issue.category} • ${issue.status} • ${issue.upvotes} upvotes`}
                    pinColor={
                      issue.status === 'pending' ? 'red' :
                      issue.status === 'in-progress' ? 'orange' : 'green'
                    }
                    onPress={() => setSelectedIssue(issue.id)}
                  />
                ))}
              </MapView>

              {/* Map Legend */}
              <View style={styles.mapLegend}>
                <Text style={styles.legendTitle}>Legend</Text>
                <View style={styles.legendItems}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
                    <Text style={styles.legendText}>Pending</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FF8C00' }]} />
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
        <Card style={{ marginTop: 16 }}>
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
                    <View style={styles.issueTitleContainer}>
                      <Text style={styles.issueTitle}>{issue.title}</Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: categoryColors[issue.category] }
                      ]}>
                        <Text style={styles.statusText}>{issue.category}</Text>
                      </View>
                    </View>
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: 
                        issue.status === 'pending' ? '#dc2626' :
                        issue.status === 'in-progress' ? '#3b82f6' : '#10b981'
                      }
                    ]} />
                  </View>

                  <Text style={styles.issueLocation}>
                    <Ionicons name="location-outline" size={14} color="#6b7280" />
                    {' '}{issue.location}
                  </Text>

                  <View style={styles.issueFooter}>
                    <Text style={styles.issueDistance}>{issue.distance}</Text>
                    <View style={styles.issueStats}>
                      <Ionicons name="arrow-up" size={14} color="#10b981" />
                      <Text style={styles.upvotes}>{issue.upvotes}</Text>
                    </View>
                    <Text style={styles.timestamp}>{issue.timestamp}</Text>
                  </View>

                  {selectedIssue === issue.id && (
                    <View style={styles.issueDetails}>
                      <Text style={styles.detailLabel}>Status: {issue.status}</Text>
                      <Text style={styles.detailLabel}>Category: {issue.category}</Text>
                      <Button 
                        title="View Details"
                        onPress={() => {
                          console.log(`View details for issue: ${issue.id}`);
                        }}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </CardContent>
        </Card>

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
  mapCard: {
    height: 350, // Fixed height for the map card
  },
  mapCardContent: {
    flex: 1,
    padding: 0, // Remove default padding for map
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
  mapContainer: {
    flex: 1,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb', // Fallback color while map loads
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapLegend: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
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
    color: '#030213',
  },
  issuesListContent: {
    paddingVertical: 0,
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
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#030213',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#ffffff',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  issueLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issueDistance: {
    fontSize: 12,
    color: '#9ca3af',
  },
  issueStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upvotes: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  issueDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#030213',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});