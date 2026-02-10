import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
} from '@expo-google-fonts/lexend';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { LatLng, Marker, Polyline } from 'react-native-maps';

type TabKey = 'request' | 'howTo' | 'profile';
type LocationField = 'pickup' | 'dropoff';

type RideTemplate = {
  id: string;
  title: string;
  detail: string;
  baseFare: number;
  perKmFare: number;
  speedKph: number;
  dispatchMins: number;
};

type RideOption = {
  id: string;
  title: string;
  detail: string;
  eta: string;
  fare: string;
  etaMinutes: number;
  fareAmount: number;
};

type LocationSuggestion = {
  id: string;
  displayName: string;
  latitude: number;
  longitude: number;
};

type QuickPlace = {
  id: string;
  label: string;
  address: string;
  coordinate: LatLng;
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

const RIDE_TEMPLATES: RideTemplate[] = [
  {
    id: 'classic',
    title: 'DD Classic',
    detail: 'Fast pickup with one designated driver',
    baseFare: 12,
    perKmFare: 2.3,
    speedKph: 28,
    dispatchMins: 5,
  },
  {
    id: 'priority',
    title: 'DD Priority',
    detail: 'Closest available driver dispatched first',
    baseFare: 16,
    perKmFare: 2.8,
    speedKph: 34,
    dispatchMins: 3,
  },
  {
    id: 'comfort',
    title: 'DD Comfort',
    detail: 'Extra assistance and premium support',
    baseFare: 18,
    perKmFare: 3.2,
    speedKph: 26,
    dispatchMins: 6,
  },
];

const MAP_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.04,
};

const PICKUP_COORDINATE: LatLng = {
  latitude: 37.7728,
  longitude: -122.423,
};

const DROPOFF_COORDINATE: LatLng = {
  latitude: 37.7812,
  longitude: -122.4094,
};

const SAVED_PLACES: QuickPlace[] = [
  {
    id: 'home',
    label: 'Home',
    address: '150 Oak Ridge, San Francisco',
    coordinate: { latitude: 37.7892, longitude: -122.4039 },
  },
  {
    id: 'work',
    label: 'Work',
    address: '90 Market Street, San Francisco',
    coordinate: { latitude: 37.7936, longitude: -122.3965 },
  },
  {
    id: 'garage',
    label: 'Garage',
    address: '44 Pine Lot, San Francisco',
    coordinate: { latitude: 37.7897, longitude: -122.4011 },
  },
];

const BICYCLE_HERO = require('./assets/bicycle-hero.jpg');

const toRadians = (value: number) => (value * Math.PI) / 180;

const calculateDistanceKm = (start: LatLng, end: LatLng): number => {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(end.latitude - start.latitude);
  const lonDelta = toRadians(end.longitude - start.longitude);
  const startLat = toRadians(start.latitude);
  const endLat = toRadians(end.latitude);

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2) * Math.cos(startLat) * Math.cos(endLat);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const compactAddress = (displayName: string) => {
  const parts = displayName
    .split(',')
    .map((piece) => piece.trim())
    .filter(Boolean);

  return parts.slice(0, 3).join(', ');
};

const shortLabel = (displayName: string) => displayName.split(',')[0].trim();

const fetchLocationSuggestions = async (query: string): Promise<LocationSuggestion[]> => {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '5',
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
      'User-Agent': 'DD-DRIVER-Mobile/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('Unable to load address suggestions.');
  }

  const data: Array<{ place_id: number; display_name: string; lat: string; lon: string }> =
    await response.json();

  return data
    .map((place) => ({
      id: String(place.place_id),
      displayName: place.display_name,
      latitude: Number(place.lat),
      longitude: Number(place.lon),
    }))
    .filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude));
};

const formatFare = (value: number) => `$${value.toFixed(2)}`;

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
  const [selectedRideId, setSelectedRideId] = useState(RIDE_TEMPLATES[0].id);
  const [statusMessage, setStatusMessage] = useState('');
  const [pickupCoordinate, setPickupCoordinate] = useState<LatLng>(PICKUP_COORDINATE);
  const [dropoffCoordinate, setDropoffCoordinate] = useState<LatLng>(DROPOFF_COORDINATE);
  const [activeField, setActiveField] = useState<LocationField | null>(null);
  const [quickAssignField, setQuickAssignField] = useState<LocationField>('dropoff');
  const [pickupSuggestions, setPickupSuggestions] = useState<LocationSuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<LocationSuggestion[]>([]);
  const [recentPlaces, setRecentPlaces] = useState<QuickPlace[]>([]);
  const [isPickupSearching, setIsPickupSearching] = useState(false);
  const [isDropoffSearching, setIsDropoffSearching] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const mapRef = useRef<MapView>(null);
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslate = useRef(new Animated.Value(0)).current;
  const requestButtonScale = useRef(new Animated.Value(1)).current;
  const statusOpacity = useRef(new Animated.Value(0)).current;

  const distanceKm = useMemo(
    () => calculateDistanceKm(pickupCoordinate, dropoffCoordinate),
    [pickupCoordinate, dropoffCoordinate]
  );

  const rideOptions = useMemo<RideOption[]>(
    () =>
      RIDE_TEMPLATES.map((template) => {
        const travelMinutes = (distanceKm / template.speedKph) * 60;
        const etaMinutes = Math.max(4, Math.round(template.dispatchMins + travelMinutes));
        const fareAmount = template.baseFare + distanceKm * template.perKmFare;

        return {
          id: template.id,
          title: template.title,
          detail: template.detail,
          eta: `${etaMinutes} min`,
          fare: formatFare(fareAmount),
          etaMinutes,
          fareAmount,
        };
      }),
    [distanceKm]
  );

  const selectedRide = useMemo(
    () => rideOptions.find((option) => option.id === selectedRideId),
    [rideOptions, selectedRideId]
  );

  const rememberRecentPlace = (place: QuickPlace) => {
    setRecentPlaces((current) => {
      const deduped = current.filter(
        (entry) => entry.id !== place.id && entry.address.toLowerCase() !== place.address.toLowerCase()
      );
      return [place, ...deduped].slice(0, 6);
    });
  };

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

  useEffect(() => {
    if (!isMapReady || !mapRef.current) {
      return;
    }

    mapRef.current.fitToCoordinates([pickupCoordinate, dropoffCoordinate], {
      animated: true,
      edgePadding: {
        top: 70,
        right: 70,
        bottom: 70,
        left: 70,
      },
    });
  }, [pickupCoordinate, dropoffCoordinate, isMapReady]);

  useEffect(() => {
    if (activeField !== 'pickup') {
      setIsPickupSearching(false);
      return;
    }

    const query = pickup.trim();
    if (query.length < 3) {
      setPickupSuggestions([]);
      setIsPickupSearching(false);
      return;
    }

    let cancelled = false;
    setIsPickupSearching(true);

    const timeout = setTimeout(async () => {
      try {
        const results = await fetchLocationSuggestions(query);
        if (!cancelled) {
          setPickupSuggestions(results);
        }
      } catch {
        if (!cancelled) {
          setPickupSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsPickupSearching(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [pickup, activeField]);

  useEffect(() => {
    if (activeField !== 'dropoff') {
      setIsDropoffSearching(false);
      return;
    }

    const query = dropoff.trim();
    if (query.length < 3) {
      setDropoffSuggestions([]);
      setIsDropoffSearching(false);
      return;
    }

    let cancelled = false;
    setIsDropoffSearching(true);

    const timeout = setTimeout(async () => {
      try {
        const results = await fetchLocationSuggestions(query);
        if (!cancelled) {
          setDropoffSuggestions(results);
        }
      } catch {
        if (!cancelled) {
          setDropoffSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsDropoffSearching(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [dropoff, activeField]);

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

  const animateMapToCoordinate = (coordinate: LatLng) => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.animateToRegion(
      {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      320
    );
  };

  const applyLocation = (
    field: LocationField,
    place: QuickPlace,
    options?: {
      showToast?: boolean;
      remember?: boolean;
      toastLabel?: string;
    }
  ) => {
    const shouldRemember = options?.remember ?? true;
    const shouldToast = options?.showToast ?? false;
    const toastLabel = options?.toastLabel ?? place.label;

    if (field === 'pickup') {
      setPickup(place.address);
      setPickupCoordinate(place.coordinate);
      setPickupSuggestions([]);
    } else {
      setDropoff(place.address);
      setDropoffCoordinate(place.coordinate);
      setDropoffSuggestions([]);
    }

    if (shouldRemember) {
      rememberRecentPlace(place);
    }

    setActiveField(null);
    animateMapToCoordinate(place.coordinate);

    if (shouldToast) {
      setStatusMessage(`${toastLabel} set as ${field === 'pickup' ? 'pickup' : 'drop-off'}.`);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setStatusMessage('Enable location access to use your current pickup.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coordinate = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      const reversedAddresses = await Location.reverseGeocodeAsync(coordinate);
      const bestMatch = reversedAddresses[0];

      const lineOne = [bestMatch?.name, bestMatch?.street].filter(Boolean).join(' ');
      const lineTwo = [bestMatch?.city, bestMatch?.region].filter(Boolean).join(', ');
      const formattedAddress = [lineOne.trim(), lineTwo].filter(Boolean).join(', ');

      const place: QuickPlace = {
        id: 'current-location',
        label: 'Current location',
        address: formattedAddress || 'Current location',
        coordinate,
      };

      applyLocation('pickup', place, {
        remember: true,
        showToast: true,
        toastLabel: 'Current location',
      });
    } catch {
      setStatusMessage('Unable to get your current location right now.');
    }
  };

  const handleSelectSuggestion = (field: LocationField, suggestion: LocationSuggestion) => {
    const place: QuickPlace = {
      id: suggestion.id,
      label: shortLabel(suggestion.displayName),
      address: compactAddress(suggestion.displayName),
      coordinate: {
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      },
    };

    applyLocation(field, place, {
      remember: true,
      showToast: false,
    });
  };

  const handleSavedPlacePress = (place: QuickPlace) => {
    applyLocation(quickAssignField, place, {
      remember: true,
      showToast: true,
    });
  };

  const handleRecentPlacePress = (place: QuickPlace) => {
    applyLocation(quickAssignField, place, {
      remember: true,
      showToast: true,
      toastLabel: 'Recent location',
    });
  };

  const handleRequestDriver = () => {
    if (!pickup.trim() || !dropoff.trim()) {
      setStatusMessage('Add both pickup and drop-off locations.');
      return;
    }

    setStatusMessage(
      `DD Driver requested. ETA ${selectedRide?.eta ?? '8 min'} - ${selectedRide?.title ?? 'DD Classic'}`
    );
  };

  const renderSuggestions = (field: LocationField) => {
    const query = field === 'pickup' ? pickup.trim() : dropoff.trim();
    const isSearching = field === 'pickup' ? isPickupSearching : isDropoffSearching;
    const suggestions = field === 'pickup' ? pickupSuggestions : dropoffSuggestions;

    if (activeField !== field || query.length < 1) {
      return null;
    }

    if (query.length < 3) {
      return (
        <Text style={styles.suggestionHint}>Type at least 3 characters to search addresses.</Text>
      );
    }

    return (
      <View style={styles.suggestionsBox}>
        {isSearching ? (
          <View style={styles.suggestionLoadingRow}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.suggestionLoadingText}>Finding locations...</Text>
          </View>
        ) : null}

        {!isSearching && suggestions.length === 0 ? (
          <Text style={styles.suggestionEmptyText}>No matching addresses found.</Text>
        ) : null}

        {!isSearching &&
          suggestions.map((suggestion, index) => (
            <Pressable
              key={suggestion.id}
              onPress={() => handleSelectSuggestion(field, suggestion)}
              style={[
                styles.suggestionRow,
                index === suggestions.length - 1 && styles.suggestionRowLast,
              ]}
            >
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.primary} />
              <Text style={styles.suggestionText} numberOfLines={2}>
                {suggestion.displayName}
              </Text>
            </Pressable>
          ))}
      </View>
    );
  };

  const renderRequestSection = () => (
    <ScrollView
      style={styles.sectionScroll}
      contentContainerStyle={styles.sectionContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heroCard}>
        <Image source={BICYCLE_HERO} style={styles.heroImage} resizeMode="cover" />
        <Text style={styles.heroTitle}>Request a DD Driver</Text>
        <Text style={styles.heroSubtitle}>
          We bring a trusted designated driver to your location.
        </Text>
      </View>

      <View style={styles.mapCard}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={MAP_REGION}
          onMapReady={() => setIsMapReady(true)}
        >
          <Polyline
            coordinates={[pickupCoordinate, dropoffCoordinate]}
            strokeWidth={4}
            strokeColor={COLORS.primary}
          />
          <Marker
            coordinate={pickupCoordinate}
            title="Your Car"
            description={pickup || 'Pickup location'}
            pinColor={COLORS.primary}
          />
          <Marker
            coordinate={dropoffCoordinate}
            title="Drop-off"
            description={dropoff || 'Your destination'}
            pinColor="#35557F"
          />
        </MapView>
      </View>

      <View style={styles.tripMetaCard}>
        <View style={styles.tripMetaPill}>
          <MaterialCommunityIcons name="map-marker-distance" size={16} color={COLORS.primary} />
          <Text style={styles.tripMetaText}>{distanceKm.toFixed(1)} km trip</Text>
        </View>
        <View style={styles.tripMetaPill}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.primary} />
          <Text style={styles.tripMetaText}>ETA {selectedRide?.eta ?? '--'}</Text>
        </View>
        <View style={styles.tripMetaPill}>
          <MaterialCommunityIcons name="cash-multiple" size={16} color={COLORS.primary} />
          <Text style={styles.tripMetaText}>{selectedRide?.fare ?? '--'}</Text>
        </View>
      </View>
      <Text style={styles.openSourceHint}>Search powered by OpenStreetMap Nominatim.</Text>

      <View style={styles.formCard}>
        <Text style={styles.fieldLabel}>Where is your car?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter pickup address"
          placeholderTextColor="#8390A2"
          value={pickup}
          onFocus={() => {
            setActiveField('pickup');
            setQuickAssignField('pickup');
          }}
          onChangeText={(text) => {
            setPickup(text);
            setActiveField('pickup');
            setQuickAssignField('pickup');
          }}
        />
        {renderSuggestions('pickup')}

        <Pressable onPress={handleUseCurrentLocation} style={styles.currentLocationChip}>
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
          onFocus={() => {
            setActiveField('dropoff');
            setQuickAssignField('dropoff');
          }}
          onChangeText={(text) => {
            setDropoff(text);
            setActiveField('dropoff');
            setQuickAssignField('dropoff');
          }}
        />
        {renderSuggestions('dropoff')}
      </View>

      <View style={styles.quickPlacesCard}>
        <View style={styles.quickHeader}>
          <Text style={styles.quickTitle}>Saved places</Text>
          <View style={styles.quickFieldToggle}>
            <Pressable
              style={[
                styles.quickFieldButton,
                quickAssignField === 'pickup' && styles.quickFieldButtonActive,
              ]}
              onPress={() => setQuickAssignField('pickup')}
            >
              <Text
                style={[
                  styles.quickFieldButtonText,
                  quickAssignField === 'pickup' && styles.quickFieldButtonTextActive,
                ]}
              >
                Set Pickup
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.quickFieldButton,
                quickAssignField === 'dropoff' && styles.quickFieldButtonActive,
              ]}
              onPress={() => setQuickAssignField('dropoff')}
            >
              <Text
                style={[
                  styles.quickFieldButtonText,
                  quickAssignField === 'dropoff' && styles.quickFieldButtonTextActive,
                ]}
              >
                Set Drop-off
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.savedPlacesGrid}>
          {SAVED_PLACES.map((place) => (
            <Pressable
              key={place.id}
              style={styles.savedPlaceChip}
              onPress={() => handleSavedPlacePress(place)}
            >
              <Text style={styles.savedPlaceLabel}>{place.label}</Text>
              <Text style={styles.savedPlaceAddress} numberOfLines={1}>
                {place.address}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.recentTitle}>Recent locations</Text>
        {recentPlaces.length === 0 ? (
          <Text style={styles.recentEmptyText}>No recent locations yet.</Text>
        ) : (
          recentPlaces.map((place, index) => (
            <Pressable
              key={`${place.id}-${index}`}
              style={[styles.recentRow, index === recentPlaces.length - 1 && styles.recentRowLast]}
              onPress={() => handleRecentPlacePress(place)}
            >
              <MaterialCommunityIcons name="history" size={16} color={COLORS.primary} />
              <View style={styles.recentTextWrap}>
                <Text style={styles.recentLabel}>{place.label}</Text>
                <Text style={styles.recentAddress} numberOfLines={1}>
                  {place.address}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.optionsCard}>
        <Text style={styles.optionsTitle}>Choose your service</Text>
        {rideOptions.map((option) => {
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
          <Text style={styles.historyPlace}>Downtown Garage - West Ave</Text>
          <Text style={styles.historyMeta}>5.0 - Jan 28</Text>
        </View>
        <View style={styles.historyRow}>
          <Text style={styles.historyPlace}>Market Street - Hill Crest</Text>
          <Text style={styles.historyMeta}>4.8 - Jan 20</Text>
        </View>
        <View style={styles.historyRow}>
          <Text style={styles.historyPlace}>North Pier - Oak Ridge</Text>
          <Text style={styles.historyMeta}>5.0 - Jan 12</Text>
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
    borderWidth: 1,
    borderColor: '#E1E8F3',
  },
  heroImage: {
    width: '100%',
    height: 132,
    borderRadius: 14,
    marginBottom: 10,
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
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D9E1EE',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  tripMetaCard: {
    flexDirection: 'row',
    gap: 8,
  },
  tripMetaPill: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#EAF8FF',
    borderWidth: 1,
    borderColor: '#D7EEF9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  tripMetaText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 11,
    color: COLORS.primary,
  },
  openSourceHint: {
    marginTop: -4,
    fontFamily: 'Lexend_400Regular',
    fontSize: 10,
    color: COLORS.mutedText,
    textAlign: 'center',
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
  suggestionsBox: {
    marginTop: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D6DEEB',
    backgroundColor: '#F9FBFF',
    overflow: 'hidden',
  },
  suggestionHint: {
    marginTop: 8,
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: COLORS.mutedText,
  },
  suggestionLoadingRow: {
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestionLoadingText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: COLORS.mutedText,
  },
  suggestionEmptyText: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: COLORS.mutedText,
  },
  suggestionRow: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderColor: '#E4EBF6',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  suggestionRowLast: {
    borderBottomWidth: 0,
  },
  suggestionText: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
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
  quickPlacesCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1E8F3',
    padding: 14,
  },
  quickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  quickTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
  },
  quickFieldToggle: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D7E0EE',
    backgroundColor: '#F4F7FC',
    padding: 2,
  },
  quickFieldButton: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  quickFieldButtonActive: {
    backgroundColor: COLORS.primary,
  },
  quickFieldButtonText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 11,
    color: COLORS.mutedText,
  },
  quickFieldButtonTextActive: {
    color: COLORS.white,
  },
  savedPlacesGrid: {
    marginTop: 10,
    gap: 8,
  },
  savedPlaceChip: {
    borderWidth: 1,
    borderColor: '#DAE3F2',
    backgroundColor: '#F8FAFD',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 11,
  },
  savedPlaceLabel: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: COLORS.text,
  },
  savedPlaceAddress: {
    marginTop: 2,
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: COLORS.mutedText,
  },
  recentTitle: {
    marginTop: 12,
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: COLORS.text,
  },
  recentEmptyText: {
    marginTop: 6,
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: COLORS.mutedText,
  },
  recentRow: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E3EAF5',
    borderRadius: 11,
    paddingVertical: 9,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentRowLast: {
    marginBottom: 0,
  },
  recentTextWrap: {
    flex: 1,
  },
  recentLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 12,
    color: COLORS.text,
  },
  recentAddress: {
    marginTop: 1,
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: COLORS.mutedText,
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
