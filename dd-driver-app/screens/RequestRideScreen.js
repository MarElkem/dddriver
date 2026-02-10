import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function RequestRideScreen() {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRequestRide = () => {
    // Handle ride request logic
    console.log('Requesting ride...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DD DRIVER</Text>
        </View>

        {/* Map Section */}
        <Animated.View 
          style={[
            styles.mapContainer,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: 37.78825,
                longitude: -122.4324,
              }}
            />
          </MapView>
        </Animated.View>

        {/* Request Card */}
        <Animated.View 
          style={[
            styles.requestCard,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Bicycle Icon */}
          <View style={styles.bikeIconContainer}>
            <View style={styles.bikeIconCircle}>
              <Text style={styles.bikeIcon}>🚲</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.requestTitle}>Request a DD Driver</Text>

          {/* Pickup Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="location" size={20} color="#5ABAEA" />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Where is your car?</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter pickup location"
                placeholderTextColor="#9CA3AF"
                value={pickupLocation}
                onChangeText={setPickupLocation}
              />
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Dropoff Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="flag" size={20} color="#5ABAEA" />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Where do you want to be dropped off?</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter destination"
                placeholderTextColor="#9CA3AF"
                value={dropoffLocation}
                onChangeText={setDropoffLocation}
              />
            </View>
          </View>

          {/* Estimated Time and Price */}
          <View style={styles.estimateContainer}>
            <View style={styles.estimateItem}>
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <Text style={styles.estimateText}>~15 min</Text>
            </View>
            <View style={styles.estimateItem}>
              <Ionicons name="cash-outline" size={18} color="#6B7280" />
              <Text style={styles.estimateText}>$25-30</Text>
            </View>
          </View>

          {/* Request Button */}
          <TouchableOpacity 
            style={styles.requestButton}
            onPress={handleRequestRide}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#5ABAEA', '#4AA9D8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.requestButtonGradient}
            >
              <Text style={styles.requestButtonText}>Request DD Driver</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
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
  mapContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  map: {
    width: '100%',
    height: 250,
  },
  requestCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  bikeIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bikeIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5ABAEA',
  },
  bikeIcon: {
    fontSize: 36,
  },
  requestTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 22,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  inputWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  inputLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
    marginHorizontal: 12,
  },
  estimateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  estimateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimateText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  requestButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  requestButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  requestButtonText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
  },
});
