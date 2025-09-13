import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/input';
import { User } from '../../types';
import { StorageService } from '../../utils/storage';

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Mock login - in real app would validate credentials
      const user: User = {
        name: 'John Doe',
        email: loginForm.email,
        phone: '+1 (555) 123-4567'
      };
      
      await StorageService.saveUser(user);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const user: User = {
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone
      };
      
      await StorageService.saveUser(user);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="location" size={32} color="#ffffff" />
          </View>
          <Text style={styles.appTitle}>CivicReport</Text>
          <Text style={styles.appSubtitle}>Making our communities better, together</Text>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons name="alert-circle-outline" size={24} color="#f59e0b" />
            <Text style={styles.featureText}>Report Issues</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="location-outline" size={24} color="#3b82f6" />
            <Text style={styles.featureText}>Track Location</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="people-outline" size={24} color="#10b981" />
            <Text style={styles.featureText}>Community</Text>
          </View>
        </View>

        {/* Login/Register Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to report civic issues in your community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tab Selection */}
            <View style={styles.tabContainer}>
              <Button
                title="Sign In"
                onPress={() => setActiveTab('login')}
                variant={activeTab === 'login' ? 'default' : 'outline'}
                style={styles.tab}
              />
              <Button
                title="Sign Up"
                onPress={() => setActiveTab('register')}
                variant={activeTab === 'register' ? 'default' : 'outline'}
                style={styles.tab}
              />
            </View>

            {activeTab === 'login' ? (
              <View style={styles.form}>
                <Input
                  label="Email"
                  value={loginForm.email}
                  onChangeText={(text) => setLoginForm({ ...loginForm, email: text })}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  required
                />
                <Input
                  label="Password"
                  value={loginForm.password}
                  onChangeText={(text) => setLoginForm({ ...loginForm, password: text })}
                  placeholder="Enter your password"
                  secureTextEntry
                  required
                />
                <Button
                  title={loading ? "Signing In..." : "Sign In"}
                  onPress={handleLogin}
                  disabled={loading || !loginForm.email || !loginForm.password}
                  style={styles.submitButton}
                />
              </View>
            ) : (
              <View style={styles.form}>
                <Input
                  label="Full Name"
                  value={registerForm.name}
                  onChangeText={(text) => setRegisterForm({ ...registerForm, name: text })}
                  placeholder="Enter your full name"
                  required
                />
                <Input
                  label="Email"
                  value={registerForm.email}
                  onChangeText={(text) => setRegisterForm({ ...registerForm, email: text })}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  required
                />
                <Input
                  label="Phone Number"
                  value={registerForm.phone}
                  onChangeText={(text) => setRegisterForm({ ...registerForm, phone: text })}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  required
                />
                <Input
                  label="Password"
                  value={registerForm.password}
                  onChangeText={(text) => setRegisterForm({ ...registerForm, password: text })}
                  placeholder="Create a password"
                  secureTextEntry
                  required
                />
                <Input
                  label="Confirm Password"
                  value={registerForm.confirmPassword}
                  onChangeText={(text) => setRegisterForm({ ...registerForm, confirmPassword: text })}
                  placeholder="Confirm your password"
                  secureTextEntry
                  required
                />
                <Button
                  title={loading ? "Creating Account..." : "Create Account"}
                  onPress={handleRegister}
                  disabled={loading || !registerForm.name || !registerForm.email || !registerForm.password}
                  style={styles.submitButton}
                />
              </View>
            )}
          </CardContent>
        </Card>

        <Text style={styles.footerText}>
          By continuing, you agree to help improve your community
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dbeafe',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#3b82f6',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#030213',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  feature: {
    alignItems: 'center',
    padding: 12,
  },
  featureText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  tab: {
    flex: 1,
  },
  form: {
    gap: 8,
  },
  submitButton: {
    marginTop: 8,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7280',
    marginTop: 16,
  },
});