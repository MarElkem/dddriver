import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
} from '@expo-google-fonts/lexend';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type TabKey = 'request' | 'howTo' | 'profile';

type RideOption = {
  id: string;
  title: string;
  detail: string;
  eta: string;
  fare: string;
};

const COLORS = {
  primary: '#5ABAEA',
  pageBackground: '#D7DEED',
  cardBackground: '#EFF3FB',
  white: '#FFFFFF',
  text: '#1F2B3A',
  mutedText: '#5D6979',
  success: '#2D9B65',
};

const TAB_ITEMS = [
  { key: 'request', label: 'Request Ride', icon: 'bike-fast' },
  { key: 'howTo', label: 'How to Use', icon: 'information-outline' },
  { key: 'profile', label: 'Profile', icon: 'account-circle-outline' },
] as const;

const RIDE_OPTIONS: RideOption[] = [
  {
    id: 'classic',
    title: 'DD Classic',
    detail: 'Fast pickup with one designated driver',
    eta: '8 min',
    fare: '$22',
  },
  {
    id: 'priority',
    title: 'DD Priority',
    detail: 'Closest available driver dispatched first',
    eta: '5 min',
    fare: '$29',
  },
  {
    id: 'comfort',
    title: 'DD Comfort',
    detail: 'Extra assistance and premium support',
    eta: '10 min',
    fare: '$34',
  },
];

const MAP_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.04,
};

const PICKUP_COORDINATE = {
  latitude: 37.7728,
  longitude: -122.423,
};

const DROPOFF_COORDINATE = {
  latitude: 37.7812,
  longitude: -122.4094,
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });
  const [activeTab, setActiveTab] = useState<TabKey>('request');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [selectedRideId, setSelectedRideId] = useState(RIDE_OPTIONS[0].id);
  const [statusMessage, setStatusMessage] = useState('');

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslate = useRef(new Animated.Value(0)).current;
  const requestButtonScale = useRef(new Animated.Value(1)).current;
  const statusOpacity = useRef(new Animated.Value(0)).current;

  const selectedRide = useMemo(
    () => RIDE_OPTIONS.find((option) => option.id === selectedRideId),
    [selectedRideId]
  );

  useEffect(() => {
    contentOpacity.setValue(0);
    contentTranslate.setValue(18);

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab, contentOpacity, contentTranslate]);

  useEffect(() => {
    if (!statusMessage) {
      Animated.timing(statusOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      return;
    }

    statusOpacity.setValue(0);
    Animated.timing(statusOpacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      setStatusMessage('');
    }, 3200);

    return () => clearTimeout(timeout);
  }, [statusMessage, statusOpacity]);

  if (!fontsLoaded) {
    return null;
  }

  const onRequestPressIn = () => {
    Animated.spring(requestButtonScale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 30,
      bounciness: 5,
    }).start();
  };

  const onRequestPressOut = () => {
    Animated.spring(requestButtonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  const handleRequestDriver = () => {
    if (!pickup.trim() || !dropoff.trim()) {
      setStatusMessage('Add both pickup and drop-off locations.');
      return;
    }

    setStatusMessage(
      `DD Driver requested. ETA ${selectedRide?.eta ?? '8 min'} • ${selectedRide?.title ?? 'DD Classic'}`
    );
  };

  const renderRequestSection = () => (
    <ScrollView
      style={styles.sectionScroll}
      contentContainerStyle={styles.sectionContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroIconWrapper}>
          <MaterialCommunityIcons name="bike-fast" size={34} color={COLORS.primary} />
        </View>
        <Text style={styles.heroTitle}>Request a DD Driver</Text>
        <Text style={styles.heroSubtitle}>
          We bring a trusted designated driver to your location.
        </Text>
      </View>

      <View style={styles.mapCard}>
        <MapView style={styles.map} initialRegion={MAP_REGION}>
          <Marker
            coordinate={PICKUP_COORDINATE}
            title="Your Car"
            description="Pickup location"
            pinColor={COLORS.primary}
          />
          <Marker
            coordinate={DROPOFF_COORDINATE}
            title="Drop-off"
            description="Your destination"
            pinColor="#35557F"
          />
        </MapView>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.fieldLabel}>Where is your car?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter pickup address"
          placeholderTextColor="#8390A2"
          value={pickup}
          onChangeText={setPickup}
        />

        <Pressable onPress={() => setPickup('Current location')} style={styles.currentLocationChip}>
          <MaterialCommunityIcons name="crosshairs-gps" size={16} color={COLORS.primary} />
          <Text style={styles.currentLocationText}>Use current location</Text>
        </Pressable>

        <Text style={[styles.fieldLabel, styles.secondFieldLabel]}>
          Where would you like to be dropped off?
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter destination address"
          placeholderTextColor="#8390A2"
          value={dropoff}
          onChangeText={setDropoff}
        />
      </View>

      <View style={styles.optionsCard}>
        <Text style={styles.optionsTitle}>Choose your service</Text>
        {RIDE_OPTIONS.map((option) => {
          const isSelected = option.id === selectedRideId;
          return (
            <Pressable
              key={option.id}
              onPress={() => setSelectedRideId(option.id)}
              style={[styles.rideOption, isSelected && styles.rideOptionSelected]}
            >
              <View style={styles.rideOptionLeft}>
                <Text style={styles.rideOptionTitle}>{option.title}</Text>
                <Text style={styles.rideOptionDetail}>{option.detail}</Text>
              </View>
              <View style={styles.rideOptionRight}>
                <Text style={styles.rideOptionEta}>{option.eta}</Text>
                <Text style={styles.rideOptionFare}>{option.fare}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.miniMetaRow}>
        <View style={styles.metaPill}>
          <MaterialCommunityIcons name="shield-check-outline" size={16} color={COLORS.primary} />
          <Text style={styles.metaPillText}>Verified DD Drivers</Text>
        </View>
        <View style={styles.metaPill}>
          <MaterialCommunityIcons name="cash-multiple" size={16} color={COLORS.primary} />
          <Text style={styles.metaPillText}>Cashless Payment</Text>
        </View>
      </View>

      <Animated.View style={{ transform: [{ scale: requestButtonScale }] }}>
        <Pressable
          style={styles.requestButton}
          onPressIn={onRequestPressIn}
          onPressOut={onRequestPressOut}
          onPress={handleRequestDriver}
        >
          <Text style={styles.requestButtonText}>Request DD Driver</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );

  const renderHowToSection = () => (
    <ScrollView
      style={styles.sectionScroll}
      contentContainerStyle={styles.sectionContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.infoCard}>
        <View style={styles.infoIconWrap}>
          <MaterialCommunityIcons name="home-heart" size={28} color={COLORS.primary} />
        </View>
        <Text style={styles.infoTitle}>How to use DD DRIVER</Text>
        <Text style={styles.infoBody}>
          We are here to get you home safe. Our service provides a door-to-door solution to drunk
          driving. Simply request a DD Driver who will arrive on an e-bike to your car&apos;s
          location, they will fold their ebike into the trunk of your car, pick you up and drive
          your car to your home location, then retrieve their ebike and head home.
        </Text>
      </View>

      <View style={styles.stepsCard}>
        <Text style={styles.stepsTitle}>Quick steps</Text>
        <View style={styles.stepRow}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.stepText}>Set your car location and destination.</Text>
        </View>
        <View style={styles.stepRow}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.stepText}>Confirm your DD service and request a driver.</Text>
        </View>
        <View style={styles.stepRow}>
          <Text style={styles.stepNumber}>3</Text>
          <Text style={styles.stepText}>Track arrival, get home safely, and rate your ride.</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderProfileSection = () => (
    <ScrollView
      style={styles.sectionScroll}
      contentContainerStyle={styles.sectionContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>DD</Text>
        </View>
        <Text style={styles.profileName}>DD Driver User</Text>
        <Text style={styles.profileSubtitle}>Safe trips first, always.</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>26</Text>
          <Text style={styles.statLabel}>Rides Taken</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>4.9</Text>
          <Text style={styles.statLabel}>Average Rating</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>This Year</Text>
        </View>
      </View>

      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>Recent rides</Text>
        <View style={styles.historyRow}>
          <Text style={styles.historyPlace}>Downtown Garage → West Ave</Text>
          <Text style={styles.historyMeta}>5.0 • Jan 28</Text>
        </View>
        <View style={styles.historyRow}>
          <Text style={styles.historyPlace}>Market Street → Hill Crest</Text>
          <Text style={styles.historyMeta}>4.8 • Jan 20</Text>
        </View>
        <View style={styles.historyRow}>
          <Text style={styles.historyPlace}>North Pier → Oak Ridge</Text>
          <Text style={styles.historyMeta}>5.0 • Jan 12</Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.brand}>DD DRIVER</Text>
          <Text style={styles.subtitle}>Your designated driver, one tap away.</Text>
        </View>

        <Animated.View
          style={[
            styles.contentFrame,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslate }],
            },
          ]}
        >
          {activeTab === 'request' && renderRequestSection()}
          {activeTab === 'howTo' && renderHowToSection()}
          {activeTab === 'profile' && renderProfileSection()}
        </Animated.View>

        {statusMessage ? (
          <Animated.View style={[styles.statusToast, { opacity: statusOpacity }]}>
            <MaterialCommunityIcons name="check-circle-outline" size={18} color={COLORS.success} />
            <Text style={styles.statusText}>{statusMessage}</Text>
          </Animated.View>
        ) : null}

        <View style={styles.tabBar}>
          {TAB_ITEMS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={20}
                  color={isActive ? COLORS.white : COLORS.mutedText}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.pageBackground,
  },
  root: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 8,
  },
  header: {
    marginBottom: 10,
  },
  brand: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 28,
    letterSpacing: 1,
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: COLORS.mutedText,
  },
  contentFrame: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D2DAEA',
    overflow: 'hidden',
  },
  sectionScroll: {
    flex: 1,
  },
  sectionContent: {
    padding: 14,
    gap: 12,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E8F3',
  },
  heroIconWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EAF8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: COLORS.text,
    textAlign: 'center',
  },
  heroSubtitle: {
    marginTop: 4,
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: COLORS.mutedText,
    textAlign: 'center',
  },
  mapCard: {
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D9E1EE',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1E8F3',
    padding: 14,
  },
  fieldLabel: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 8,
  },
  secondFieldLabel: {
    marginTop: 12,
  },
  input: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F4F7FC',
    borderWidth: 1,
    borderColor: '#D6DEEB',
    paddingHorizontal: 12,
    fontFamily: 'Lexend_500Medium',
    color: COLORS.text,
    fontSize: 13,
  },
  currentLocationChip: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF8FF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  currentLocationText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 12,
    color: COLORS.primary,
  },
  optionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1E8F3',
    padding: 14,
    gap: 8,
  },
  optionsTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  rideOption: {
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor: '#DCE4F0',
    backgroundColor: '#F8FAFD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rideOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EDF9FF',
  },
  rideOptionLeft: {
    flex: 1,
  },
  rideOptionTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: COLORS.text,
  },
  rideOptionDetail: {
    marginTop: 2,
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: COLORS.mutedText,
  },
  rideOptionRight: {
    alignItems: 'flex-end',
  },
  rideOptionEta: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: COLORS.primary,
  },
  rideOptionFare: {
    marginTop: 2,
    fontFamily: 'Lexend_500Medium',
    fontSize: 12,
    color: COLORS.text,
  },
  miniMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaPill: {
    flex: 1,
    backgroundColor: '#EAF8FF',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  metaPillText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 11,
    color: COLORS.primary,
  },
  requestButton: {
    marginTop: 2,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2B8DBB',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  requestButtonText: {
    fontFamily: 'Lexend_700Bold',
    color: COLORS.white,
    fontSize: 15,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E8F3',
  },
  infoIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF8FF',
    marginBottom: 8,
  },
  infoTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 19,
    color: COLORS.text,
    marginBottom: 10,
  },
  infoBody: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: COLORS.mutedText,
    lineHeight: 24,
  },
  stepsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E8F3',
    gap: 10,
  },
  stepsTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'Lexend_700Bold',
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
    fontSize: 12,
    lineHeight: 25,
  },
  stepText: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    color: COLORS.mutedText,
    fontSize: 13,
  },
  profileHeaderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1E8F3',
    padding: 16,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 24,
    color: COLORS.white,
  },
  profileName: {
    marginTop: 10,
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: COLORS.text,
  },
  profileSubtitle: {
    marginTop: 2,
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: COLORS.mutedText,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1E8F3',
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: COLORS.primary,
  },
  statLabel: {
    marginTop: 2,
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: COLORS.mutedText,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1E8F3',
    padding: 14,
  },
  historyTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 10,
  },
  historyRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#EDF1F8',
  },
  historyPlace: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
    color: COLORS.text,
  },
  historyMeta: {
    marginTop: 4,
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: COLORS.mutedText,
  },
  tabBar: {
    marginTop: 10,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: '#DCE4F1',
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 11,
    color: COLORS.mutedText,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: COLORS.white,
  },
  statusToast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 78,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE4F1',
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#1B2B3B',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  statusText: {
    flex: 1,
    fontFamily: 'Lexend_500Medium',
    fontSize: 12,
    color: COLORS.text,
  },
});
