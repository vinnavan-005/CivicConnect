// src/screens/CameraReportScreen.js
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import IssueService from '../../services/issueService';

const categories = [
  { label: 'Roads & Infrastructure', value: 'roads' },
  { label: 'Waste Management', value: 'waste' },
  { label: 'Water & Utilities', value: 'water' },
  { label: 'Street Lighting', value: 'streetlight' },
  { label: 'Other Issues', value: 'other' },
];

export default function CameraReportScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [capturedImage, setCapturedImage] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('roads');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  async function getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to automatically detect your location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      
      // Automatically set coordinates as default location
      if (location) {
        setLocation(`${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setCapturedImage(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  }

  function retakePicture() {
    setCapturedImage(null);
  }

  async function submitReport() {
    if (!capturedImage) {
      Alert.alert('Error', 'Please take a photo before submitting.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description of the issue.');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Error', 'Please provide the location.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse coordinates from location string if it's in lat,lng format
      let latitude;
      let longitude;
      
      if (currentLocation) {
        latitude = currentLocation.coords.latitude;
        longitude = currentLocation.coords.longitude;
      } else {
        // Try to parse coordinates from location string
        const coordPattern = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
        const match = location.match(coordPattern);
        if (match) {
          latitude = parseFloat(match[1]);
          longitude = parseFloat(match[2]);
        }
      }

      // Create the issue with image
      const issueData = {
        title: `${IssueService.getCategoryDisplayName(category)} Issue`,
        description: description.trim(),
        category: category,
        latitude,
        longitude,
        imageUri: capturedImage,
      };

      const response = await IssueService.createIssueWithImage(issueData);

      Alert.alert(
        'Success!', 
        'Your report has been submitted successfully. You will receive updates on its progress.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setCapturedImage(null);
              setDescription('');
              // Keep location as it might be the same
              router.back();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error submitting report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit report. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Placeholder function for future audio recording
  function recordAudio() {
    Alert.alert(
      'Audio Recording',
      'Audio recording feature will be implemented here. This will allow users to add voice notes to provide additional context.',
      [{ text: 'OK' }]
    );
  }

  // Placeholder function for GPS location fetching
  function useCurrentLocation() {
    if (currentLocation) {
      Alert.alert(
        'Use GPS Location',
        'Use your current GPS coordinates as the location?',
        [
          {
            text: 'Use Coordinates',
            onPress: () => {
              setLocation(`${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}`);
            }
          },
          { text: 'Cancel' }
        ]
      );
    } else {
      Alert.alert('GPS Not Available', 'Location services are not available. Please enter the location manually.');
    }
  }

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.formContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Complete Report</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Image Preview */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
            <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.retakeButtonText}>Retake Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* Category Selection */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Category *</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text style={styles.categoryText}>
                  {categories.find(cat => cat.value === category)?.label}
                </Text>
                <Ionicons name={showCategoryPicker ? "chevron-up" : "chevron-down"} size={20} color="#666" />
              </TouchableOpacity>
              
              {showCategoryPicker && (
                <View style={styles.categoryPicker}>
                  <Picker
                    selectedValue={category}
                    onValueChange={(itemValue) => {
                      setCategory(itemValue);
                      setShowCategoryPicker(false);
                    }}
                    style={styles.picker}
                  >
                    {categories.map((cat) => (
                      <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Description *</Text>
              <TextInput
                style={styles.textAreaInput}
                placeholder="Describe the issue in detail..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Audio Recording Placeholder */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Voice Note (Optional)</Text>
              <TouchableOpacity style={styles.audioButton} onPress={recordAudio}>
                <Ionicons name="mic" size={20} color="#007AFF" />
                <Text style={styles.audioButtonText}>Add Voice Note</Text>
              </TouchableOpacity>
              <Text style={styles.placeholderText}>
                🎤 Voice recording feature will be added here for additional context
              </Text>
            </View>

            {/* Location */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Location *</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.textInput, styles.locationInput]}
                  placeholder="Enter location or address"
                  value={location}
                  onChangeText={setLocation}
                />
                <TouchableOpacity style={styles.gpsButton} onPress={useCurrentLocation}>
                  <Ionicons name="location" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.placeholderText}>
                📍 GPS location: {currentLocation ? 'Available' : 'Not available'}
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
              onPress={submitReport}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.submitButtonContent}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                </View>
              ) : (
                <View style={styles.submitButtonContent}>
                  <Ionicons name="send" size={20} color="white" />
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Camera View
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Header with back button */}
        <View style={styles.cameraHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.cameraHeaderTitle}>Take Photo</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Camera Controls */}
        <View style={styles.cameraControls}>
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <View style={styles.placeholder} />
          </View>
          
          <Text style={styles.instructionText}>Position the civic issue in the frame and tap to capture</Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#333',
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cameraHeaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingBottom: 40,
    paddingTop: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 50,
    marginBottom: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
  },
  instructionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 20,
  },
  placeholder: {
    width: 50,
  },
  // Form styles
  formContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 5,
  },
  imageContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  capturedImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    gap: 8,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  categoryPicker: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 5,
  },
  picker: {
    height: 150,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textAreaInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  locationInput: {
    flex: 1,
  },
  gpsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  audioButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  placeholderText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});