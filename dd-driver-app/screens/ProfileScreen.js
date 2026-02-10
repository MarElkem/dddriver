import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  // Mock user data
  const userData = {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    memberSince: 'January 2024',
    totalRides: 47,
    rating: 4.8,
    savedAddresses: 3,
  };

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const StatCard = ({ icon, label, value, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <View style={styles.infoIconContainer}>
          <Ionicons name={icon} size={20} color="#5ABAEA" />
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <Animated.View 
          style={[
            styles.profileCard,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#5ABAEA', '#4AA9D8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileGradient}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userData.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
            </View>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileMember}>Member since {userData.memberSince}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Stats Section */}
        <Animated.View 
          style={[
            styles.statsContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <StatCard 
            icon="car-sport" 
            label="Total Rides" 
            value={userData.totalRides} 
            color="#5ABAEA"
          />
          <StatCard 
            icon="star" 
            label="Rating" 
            value={userData.rating.toFixed(1)} 
            color="#FFA500"
          />
          <StatCard 
            icon="location" 
            label="Saved Places" 
            value={userData.savedAddresses} 
            color="#10B981"
          />
        </Animated.View>

        {/* Account Information */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="mail" label="Email" value={userData.email} />
            <View style={styles.infoDivider} />
            <InfoRow icon="call" label="Phone" value={userData.phone} />
            <View style={styles.infoDivider} />
            <InfoRow icon="shield-checkmark" label="Verification" value="Verified" />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionLeft}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="time-outline" size={22} color="#5ABAEA" />
              </View>
              <Text style={styles.actionText}>Ride History</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionLeft}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="card-outline" size={22} color="#5ABAEA" />
              </View>
              <Text style={styles.actionText}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionLeft}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="bookmarks-outline" size={22} color="#5ABAEA" />
              </View>
              <Text style={styles.actionText}>Saved Locations</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionLeft}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="help-circle-outline" size={22} color="#5ABAEA" />
              </View>
              <Text style={styles.actionText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D7DEED',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 28,
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  profileGradient: {
    padding: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 32,
    color: '#5ABAEA',
  },
  profileName: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  profileMember: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 15,
    color: '#1F2937',
  },
});
