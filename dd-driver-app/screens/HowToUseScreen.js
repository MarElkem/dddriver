import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HowToUseScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

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

  const StepCard = ({ number, icon, title, description, color }) => (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <LinearGradient
          colors={[color, color + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.stepIconContainer}
        >
          <Ionicons name={icon} size={28} color="#FFFFFF" />
        </LinearGradient>
        <View style={styles.stepHeaderText}>
          <Text style={styles.stepNumber}>Step {number}</Text>
          <Text style={styles.stepTitle}>{title}</Text>
        </View>
      </View>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  );

  const FeatureItem = ({ icon, text }) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={20} color="#5ABAEA" />
      </View>
      <Text style={styles.featureText}>{text}</Text>
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
          <Text style={styles.headerTitle}>How to Use</Text>
        </View>

        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroCard,
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
            style={styles.heroGradient}
          >
            <View style={styles.heroIconContainer}>
              <Text style={styles.heroBikeIcon}>🚲</Text>
            </View>
            <Text style={styles.heroTitle}>Get Home Safe</Text>
            <Text style={styles.heroDescription}>
              We are here to get you home safe. Our service provides a door-to-door solution to drunk driving. 
              Simply request a DD Driver who will arrive on an e-bike to your car's location, they will fold 
              their ebike into the trunk of your car, pick you up and drive your car to your home location, 
              then retrieve their ebike and head home.
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* How It Works Section */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <StepCard
            number={1}
            icon="location"
            title="Enter Your Location"
            description="Tell us where your car is parked and where you'd like to go."
            color="#5ABAEA"
          />

          <StepCard
            number={2}
            icon="bicycle"
            title="Driver Arrives on E-Bike"
            description="A verified DD Driver will arrive at your location on a foldable e-bike."
            color="#10B981"
          />

          <StepCard
            number={3}
            icon="car"
            title="Driver Folds & Stores Bike"
            description="The driver will fold their e-bike and place it in your trunk."
            color="#F59E0B"
          />

          <StepCard
            number={4}
            icon="navigate"
            title="Safe Drive Home"
            description="Your driver will safely drive you and your car to your destination."
            color="#8B5CF6"
          />

          <StepCard
            number={5}
            icon="home"
            title="Arrive Safely"
            description="You're home! The driver retrieves their e-bike and heads out."
            color="#EF4444"
          />
        </Animated.View>

        {/* Features Section */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Why DD Driver?</Text>
          <View style={styles.featuresCard}>
            <FeatureItem icon="shield-checkmark" text="Verified & background-checked drivers" />
            <FeatureItem icon="time" text="Available 24/7 for your convenience" />
            <FeatureItem icon="star" text="Highly rated professional service" />
            <FeatureItem icon="lock-closed" text="Secure and insured rides" />
            <FeatureItem icon="leaf" text="Eco-friendly e-bike solution" />
            <FeatureItem icon="cash" text="Transparent, upfront pricing" />
          </View>
        </Animated.View>

        {/* Safety Tips */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          <View style={styles.safetyCard}>
            <View style={styles.safetyIconContainer}>
              <Ionicons name="information-circle" size={24} color="#5ABAEA" />
            </View>
            <View style={styles.safetyContent}>
              <Text style={styles.safetyText}>
                • Always verify driver identity before getting in{'\n'}
                • Track your ride in real-time{'\n'}
                • Share your trip details with friends/family{'\n'}
                • Contact support anytime for assistance{'\n'}
                • Rate your driver to maintain quality service
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Contact Section */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactText}>
              Our support team is available 24/7 to assist you.
            </Text>
            <View style={styles.contactButtons}>
              <View style={styles.contactButton}>
                <Ionicons name="call" size={20} color="#5ABAEA" />
                <Text style={styles.contactButtonText}>Call Support</Text>
              </View>
              <View style={styles.contactButton}>
                <Ionicons name="chatbubbles" size={20} color="#5ABAEA" />
                <Text style={styles.contactButtonText}>Live Chat</Text>
              </View>
            </View>
          </View>
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
  heroCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  heroGradient: {
    padding: 28,
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroBikeIcon: {
    fontSize: 40,
  },
  heroTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 26,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroDescription: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 16,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepHeaderText: {
    flex: 1,
  },
  stepNumber: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  stepTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 16,
    color: '#1F2937',
  },
  stepDescription: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginLeft: 70,
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  safetyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  safetyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  safetyContent: {
    flex: 1,
  },
  safetyText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 24,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  contactText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  contactButtonText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 14,
    color: '#5ABAEA',
    marginLeft: 8,
  },
});
