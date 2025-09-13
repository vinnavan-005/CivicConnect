import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/input';
import { Report } from '../../types';
import { StorageService } from '../../utils/storage';

const categories = [
  'Road & Traffic',
  'Water & Drainage',
  'Electricity',
  'Waste Management',
  'Public Safety',
  'Parks & Recreation',
  'Street Lighting',
  'Public Transport',
  'Other'
];

export default function ReportIssueScreen() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    useGPS: false
  });
  const [media, setMedia] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    // Camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    // Location permissions
    const locationPermission = await Location.requestForegroundPermissionsAsync();
    
    // Audio permissions
    const audioPermission = await Audio.requestPermissionsAsync();
    
    if (cameraPermission.status !== 'granted' || 
        mediaLibraryPermission.status !== 'granted' ||
        locationPermission.status !== 'granted' ||
        audioPermission.status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'This app needs camera, location, and microphone permissions to function properly.'
      );
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setMedia([...media, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        const newMedia = result.assets.map(asset => asset.uri);
        setMedia([...media, ...newMedia]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const showMediaOptions = () => {
    Alert.alert(
      'Add Media',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const getGPSLocation = async () => {
    try {
      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Reverse geocoding to get address
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address = addresses[0];
      
      const locationString = address 
        ? `${address.street}, ${address.city}` 
        : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
      setFormData({
        ...formData,
        location: locationString,
        useGPS: true
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to get location. Please enter manually.');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 30000);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const report: Report = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        useGPS: formData.useGPS,
        media,
        audioMessage: audioUri || undefined,
        timestamp: new Date().toISOString(),
        status: 'pending',
        upvotes: 0,
        progress: 0,
        submittedAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        updates: [
          {
            date: new Date().toISOString(),
            message: 'Report submitted and under review.',
            author: 'System'
          }
        ]
      };

      await StorageService.addReport(report);
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          title: '',
          description: '',
          category: '',
          location: '',
          useGPS: false
        });
        setMedia([]);
        setAudioUri(null);
        router.push('/my-reports');
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Card style={styles.successCard}>
            <CardContent style={styles.successContent}>
              <Ionicons name="checkmark-circle" size={64} color="#10b981" />
              <Text style={styles.successTitle}>Report Submitted!</Text>
              <Text style={styles.successMessage}>
                Thank you for helping improve our community. Your report is being reviewed.
              </Text>
              <Text style={styles.successNote}>
                You'll receive updates on the progress.
              </Text>
            </CardContent>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <CardHeader>
            <CardTitle style={styles.title}>
              <Ionicons name="camera" size={20} color="#030213" />
              <Text style={styles.titleText}>Report a Civic Issue</Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Issue Title */}
            <Input
              label="Issue Title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Brief title describing the issue"
              required
            />

            {/* Category */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Category <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text style={[
                  styles.categoryText,
                  !formData.category && styles.placeholderText
                ]}>
                  {formData.category || "Select category"}
                </Text>
                <Ionicons name={showCategoryPicker ? "chevron-up" : "chevron-down"} size={16} color="#030213" />
              </TouchableOpacity>
              {showCategoryPicker && (
                <View style={styles.categoryDropdown}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.categoryOption}
                      onPress={() => {
                        setFormData({ ...formData, category: cat });
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text style={styles.categoryOptionText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Media Upload */}
            <View style={styles.mediaUpload}>
              <Ionicons name="image" size={32} color="#6b7280" />
              <Text style={styles.mediaUploadText}>
                Add photos or videos to help describe the issue.
              </Text>
              <Button
                title="Add Media"
                variant="outline"
                onPress={showMediaOptions}
                style={styles.chooseFilesButton}
                icon={<Ionicons name="add" size={16} color="#030213" />}
              />
              {/* Media Preview */}
              {media.length > 0 && (
                <View style={styles.mediaPreview}>
                  {media.map((uri, index) => (
                    <View key={index} style={styles.mediaItem}>
                      <Image source={{ uri }} style={styles.mediaImage} />
                      <TouchableOpacity
                        style={styles.removeMediaButton}
                        onPress={() => removeMedia(index)}
                      >
                        <Ionicons name="close" size={16} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Description */}
            <Input
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Describe the issue in detail..."
              multiline
              numberOfLines={4}
            />

            {/* Audio Recording */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Audio Message (Optional)</Text>
              <View style={styles.audioContainer}>
                <Button
                  title={isRecording ? "Stop Recording" : "Record Audio"}
                  variant={isRecording ? "destructive" : "outline"}
                  onPress={isRecording ? stopRecording : startRecording}
                  icon={<Ionicons name="mic" size={16} color={isRecording ? "#ffffff" : "#030213"} />}
                />
                {audioUri && (
                  <View style={styles.audioBadge}>
                    <Ionicons name="musical-notes" size={16} color="#10b981" />
                    <Text style={styles.audioBadgeText}>Audio message recorded</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Location */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Location <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.locationContainer}>
                <Input
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                  placeholder="Enter location or address"
                  style={styles.locationInput}
                />
                <Button
                  title={loading ? "..." : "GPS"}
                  variant="outline"
                  onPress={getGPSLocation}
                  disabled={loading}
                  icon={<Ionicons name="location" size={16} color="#030213" />}
                  style={styles.gpsButton}
                />
              </View>
              {formData.useGPS && (
                <View style={styles.gpsBadge}>
                  <Ionicons name="checkmark" size={16} color="#10b981" />
                  <Text style={styles.gpsBadgeText}>Location detected via GPS</Text>
                </View>
              )}
            </View>

            <Button
              title={loading ? "Submitting..." : "Submit Report"}
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
            />
          </CardContent>
        </Card>
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
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#030213',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#030213',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  categoryText: {
    fontSize: 14,
    color: '#030213',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  categoryDropdown: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginTop: 4,
    maxHeight: 200,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#030213',
  },
  mediaUpload: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  mediaUploadText: {
    fontSize: 14,
    color: '#6b7280',
    marginVertical: 8,
    textAlign: 'center',
  },
  chooseFilesButton: {
    marginTop: 8,
  },
  mediaPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  mediaItem: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioContainer: {
    alignItems: 'center',
    gap: 12,
  },
  audioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  audioBadgeText: {
    fontSize: 12,
    color: '#166534',
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  locationInput: {
    flex: 1,
    marginBottom: 0,
  },
  gpsButton: {
    paddingHorizontal: 12,
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  gpsBadgeText: {
    fontSize: 12,
    color: '#166534',
  },
  submitButton: {
    marginTop: 8,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  successCard: {
    width: '100%',
    maxWidth: 400,
  },
  successContent: {
    alignItems: 'center',
    padding: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#030213',
    marginVertical: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  successNote: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
})
              