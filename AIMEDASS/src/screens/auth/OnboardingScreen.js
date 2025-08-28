/**
 * MediAssist App - OnboardingScreen
 * Interactive onboarding with medical feature introduction and permissions setup
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import PagerView from 'react-native-pager-view';
import LinearGradient from 'react-native-linear-gradient';

// Components
import Button from '../../src/components/common/Button';
import FadeInView from '../../src/components/animations/FadeInView';
import SlideInCard from '../../src/components/animations/SlideInCard';
import PulseAnimation from '../../src/components/animations/PulseAnimation';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';

// Permissions
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import PushNotification from 'react-native-push-notification';

// Styles
import { COLORS } from '../../styles/colors';
import { TYPOGRAPHY } from '../../styles/typography';
import { SPACING, BORDER_RADIUS } from '../../styles/spacing';
import { SHADOWS } from '../../styles/shadows';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

// Onboarding slides data
const ONBOARDING_SLIDES = [
  {
    id: 'welcome',
    icon: '👋',
    title: 'Welcome to MediAssist',
    subtitle: 'Your personal health companion',
    description: 'Take control of your health journey with personalized medication tracking, appointment scheduling, and vital sign monitoring.',
    backgroundColor: COLORS.primary.main,
    gradient: COLORS.gradients.primary,
    features: [
      { icon: '💊', text: 'Smart medication reminders' },
      { icon: '📅', text: 'Easy appointment management' },
      { icon: '📊', text: 'Health insights & trends' },
    ],
  },
  {
    id: 'medications',
    icon: '💊',
    title: 'Smart Medication Management',
    subtitle: 'Never miss a dose again',
    description: 'Set up personalized medication schedules, get timely reminders, and track your adherence with our intelligent system.',
    backgroundColor: COLORS.medical.medication.prescription,
    gradient: [COLORS.medical.medication.prescription, COLORS.medical.medication.supplement],
    features: [
      { icon: '⏰', text: 'Custom reminder schedules' },
      { icon: '📱', text: 'One-tap dose logging' },
      { icon: '🔍', text: 'Drug interaction alerts' },
    ],
    animation: 'pulse',
  },
  {
    id: 'health_tracking',
    icon: '📊',
    title: 'Comprehensive Health Tracking',
    subtitle: 'Monitor your vital signs',
    description: 'Track blood pressure, heart rate, weight, and other vital signs. Visualize trends and share data with your healthcare team.',
    backgroundColor: COLORS.medical.vital.heartRate,
    gradient: [COLORS.medical.vital.heartRate, COLORS.medical.vital.oxygen],
    features: [
      { icon: '❤️', text: 'Vital signs monitoring' },
      { icon: '📈', text: 'Trend analysis' },
      { icon: '👩‍⚕️', text: 'Share with doctors' },
    ],
    animation: 'heartbeat',
  },
  {
    id: 'ai_assistant',
    icon: '🤖',
    title: 'AI Health Assistant',
    subtitle: 'Smart health guidance',
    description: 'Get personalized health insights, medication reminders, and answers to your health questions from our offline AI assistant.',
    backgroundColor: COLORS.secondary.main,
    gradient: COLORS.gradients.secondary,
    features: [
      { icon: '💬', text: 'Health Q&A chatbot' },
      { icon: '📋', text: 'Personalized insights' },
      { icon: '🔒', text: 'Offline & private' },
    ],
    animation: 'gentle',
  },
  {
    id: 'permissions',
    icon: '🔐',
    title: 'Setup & Permissions',
    subtitle: 'Enable key features',
    description: 'Grant permissions for notifications, camera access, and health data to unlock the full potential of MediAssist.',
    backgroundColor: COLORS.status.info.main,
    gradient: [COLORS.status.info.main, COLORS.primary.light],
    features: [
      { icon: '🔔', text: 'Medication reminders' },
      { icon: '📷', text: 'Pill identification' },
      { icon: '📍', text: 'Location services' },
    ],
    isPermissionSlide: true,
  },
];

const OnboardingScreen = () => {
  // Navigation
  const navigation = useNavigation();
  
  // State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [permissionsGranted, setPermissionsGranted] = useState({});
  const [isSettingUpPermissions, setIsSettingUpPermissions] = useState(false);
  
  // Animation values
  const scrollX = useSharedValue(0);
  const pagerRef = useRef(null);
  
  // Check initial permissions
  useEffect(() => {
    checkExistingPermissions();
  }, []);
  
  // Check existing permissions
  const checkExistingPermissions = async () => {
    const permissions = {
      notifications: false,
      camera: false,
      location: false,
    };
    
    try {
      // Check notification permission
      if (Platform.OS === 'ios') {
        const notificationStatus = await check(PERMISSIONS.IOS.NOTIFICATION);
        permissions.notifications = notificationStatus === RESULTS.GRANTED;
      } else {
        // Android doesn't need explicit check for notifications
        permissions.notifications = true;
      }
      
      // Check camera permission
      const cameraPermission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;
      const cameraStatus = await check(cameraPermission);
      permissions.camera = cameraStatus === RESULTS.GRANTED;
      
      // Check location permission
      const locationPermission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      const locationStatus = await check(locationPermission);
      permissions.location = locationStatus === RESULTS.GRANTED;
      
      setPermissionsGranted(permissions);
    } catch (error) {
      console.warn('Error checking permissions:', error);
    }
  };
  
  // Handle page change
  const handlePageChange = (event) => {
    const { position } = event.nativeEvent;
    setCurrentSlide(position);
  };
  
  // Handle scroll
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });
  
  // Navigate to next slide
  const nextSlide = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentSlide + 1;
      pagerRef.current?.setPage(nextIndex);
      setCurrentSlide(nextIndex);
    } else {
      finishOnboarding();
    }
  };
  
  // Navigate to previous slide
  const prevSlide = () => {
    if (currentSlide > 0) {
      const prevIndex = currentSlide - 1;
      pagerRef.current?.setPage(prevIndex);
      setCurrentSlide(prevIndex);
    }
  };
  
  // Skip onboarding
  const skipOnboarding = () => {
    Alert.alert(
      'Skip Setup',
      'You can enable permissions and features later in the app settings.',
      [
        { text: 'Continue Setup', style: 'cancel' },
        { text: 'Skip', onPress: finishOnboarding },
      ]
    );
  };
  
  // Request specific permission
  const requestPermission = async (permissionType) => {
    setIsSettingUpPermissions(true);
    
    try {
      let permission;
      let result;
      
      switch (permissionType) {
        case 'notifications':
          if (Platform.OS === 'ios') {
            permission = PERMISSIONS.IOS.NOTIFICATION;
            result = await request(permission);
          } else {
            // Setup Android notifications
            PushNotification.requestPermissions();
            result = RESULTS.GRANTED;
          }
          break;
          
        case 'camera':
          permission = Platform.OS === 'ios' 
            ? PERMISSIONS.IOS.CAMERA 
            : PERMISSIONS.ANDROID.CAMERA;
          result = await request(permission);
          break;
          
        case 'location':
          permission = Platform.OS === 'ios'
            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
            : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
          result = await request(permission);
          break;
          
        default:
          result = RESULTS.DENIED;
      }
      
      const isGranted = result === RESULTS.GRANTED;
      setPermissionsGranted(prev => ({
        ...prev,
        [permissionType]: isGranted,
      }));
      
      if (isGranted) {
        Alert.alert(
          'Permission Granted',
          `${permissionType.charAt(0).toUpperCase() + permissionType.slice(1)} access has been enabled.`
        );
      } else {
        Alert.alert(
          'Permission Denied',
          `You can enable ${permissionType} access later in device settings.`
        );
      }
    } catch (error) {
      console.warn(`Error requesting ${permissionType} permission:`, error);
    } finally {
      setIsSettingUpPermissions(false);
    }
  };
  
  // Request all permissions
  const requestAllPermissions = async () => {
    setIsSettingUpPermissions(true);
    
    await requestPermission('notifications');
    await requestPermission('camera');
    await requestPermission('location');
    
    setIsSettingUpPermissions(false);
  };
  
  // Finish onboarding
  const finishOnboarding = () => {
    // Store onboarding completion
    // In real app, this would be saved to AsyncStorage or Redux
    navigation.navigate('Main');
  };
  
  // Render slide content
  const renderSlide = (slide, index) => {
    return (
      <View key={slide.id} style={[styles.slide, { backgroundColor: slide.backgroundColor }]}>
        <LinearGradient
          colors={slide.gradient}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <SafeAreaView style={styles.slideContent}>
          {/* Icon Section */}
          <FadeInView
            delay={index * 200}
            style={styles.iconContainer}
          >
            {slide.animation ? (
              <PulseAnimation
                pulseType={slide.animation}
                showRipple={slide.animation === 'heartbeat'}
                showGlow={slide.animation === 'pulse'}
              >
                <View style={styles.iconBackground}>
                  <Text style={styles.slideIcon}>{slide.icon}</Text>
                </View>
              </PulseAnimation>
            ) : (
              <View style={styles.iconBackground}>
                <Text style={styles.slideIcon}>{slide.icon}</Text>
              </View>
            )}
          </FadeInView>
          
          {/* Content Section */}
          <FadeInView
            delay={index * 200 + 300}
            style={styles.contentContainer}
          >
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
            <Text style={styles.slideDescription}>{slide.description}</Text>
          </FadeInView>
          
          {/* Features List */}
          <View style={styles.featuresContainer}>
            {slide.features.map((feature, featureIndex) => (
              <SlideInCard
                key={featureIndex}
                direction="left"
                delay={index * 200 + 600 + (featureIndex * 100)}
                style={styles.featureCard}
              >
                <View style={styles.featureContent}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              </SlideInCard>
            ))}
          </View>
          
          {/* Permission Controls */}
          {slide.isPermissionSlide && (
            <FadeInView
              delay={index * 200 + 800}
              style={styles.permissionControls}
            >
              <View style={styles.permissionList}>
                {Object.entries(permissionsGranted).map(([key, granted]) => (
                  <View key={key} style={styles.permissionItem}>
                    <View style={styles.permissionInfo}>
                      <Text style={styles.permissionIcon}>
                        {key === 'notifications' ? '🔔' : key === 'camera' ? '📷' : '📍'}
                      </Text>
                      <Text style={styles.permissionName}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                    </View>
                    
                    <View style={styles.permissionStatus}>
                      {granted ? (
                        <Text style={styles.permissionGranted}>✅ Enabled</Text>
                      ) : (
                        <Button
                          title="Enable"
                          size="small"
                          variant="outline"
                          style={styles.enableButton}
                          textStyle={{ color: COLORS.text.inverse }}
                          onPress={() => requestPermission(key)}
                          loading={isSettingUpPermissions}
                        />
                      )}
                    </View>
                  </View>
                ))}
              </View>
              
              <Button
                title="Enable All Permissions"
                variant="secondary"
                style={styles.enableAllButton}
                onPress={requestAllPermissions}
                loading={isSettingUpPermissions}
              />
            </FadeInView>
          )}
        </SafeAreaView>
      </View>
    );
  };
  
  // Render pagination dots
  const renderPaginationDots = () => (
    <View style={styles.pagination}>
      {ONBOARDING_SLIDES.map((_, index) => {
        const dotAnimatedStyle = useAnimatedStyle(() => {
          const isActive = index === currentSlide;
          return {
            width: withSpring(isActive ? 24 : 8),
            opacity: withSpring(isActive ? 1 : 0.5),
            backgroundColor: isActive ? COLORS.text.inverse : COLORS.text.inverse + '80',
          };
        });
        
        return (
          <AnimatedView
            key={index}
            style={[styles.paginationDot, dotAnimatedStyle]}
          />
        );
      })}
    </View>
  );
  
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      {/* Slides */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={handlePageChange}
      >
        {ONBOARDING_SLIDES.map((slide, index) => renderSlide(slide, index))}
      </PagerView>
      
      {/* Navigation Controls */}
      <SafeAreaView style={styles.navigationContainer}>
        {/* Pagination Dots */}
        {renderPaginationDots()}
        
        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <Button
            title="Skip"
            variant="ghost"
            size="small"
            textStyle={{ color: COLORS.text.inverse }}
            onPress={skipOnboarding}
            style={styles.skipButton}
          />
          
          <View style={styles.navButtonsRight}>
            {currentSlide > 0 && (
              <Button
                title="Back"
                variant="outline"
                size="small"
                onPress={prevSlide}
                style={[styles.navButton, { borderColor: COLORS.text.inverse }]}
                textStyle={{ color: COLORS.text.inverse }}
              />
            )}
            
            <Button
              title={currentSlide === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next'}
              variant="secondary"
              size="small"
              onPress={nextSlide}
              style={styles.navButton}
            />
          </View>
        </View>
      </SafeAreaView>
      
      {/* Loading Overlay */}
      {isSettingUpPermissions && (
        <LoadingSpinner
          variant="overlay"
          message="Setting up permissions..."
          overlay
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary.main,
  },
  
  pager: {
    flex: 1,
  },
  
  slide: {
    flex: 1,
    justifyContent: 'center',
  },
  
  slideContent: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  slideIcon: {
    fontSize: 60,
  },
  
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  slideTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.inverse,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontWeight: 'bold',
  },
  
  slideSubtitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.text.inverse,
    textAlign: 'center',
    marginBottom: SPACING.md,
    opacity: 0.9,
  },
  
  slideDescription: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.inverse,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    maxWidth: 320,
  },
  
  featuresContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: SPACING.xl,
  },
  
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  
  featureIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  
  featureText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.inverse,
    fontWeight: '500',
    flex: 1,
  },
  
  permissionControls: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: SPACING.lg,
  },
  
  permissionList: {
    marginBottom: SPACING.xl,
  },
  
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  permissionIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  
  permissionName: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.inverse,
    fontWeight: '500',
  },
  
  permissionStatus: {
    alignItems: 'center',
  },
  
  permissionGranted: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.inverse,
    fontWeight: '600',
  },
  
  enableButton: {
    borderColor: COLORS.text.inverse,
    paddingHorizontal: SPACING.md,
  },
  
  enableAllButton: {
    alignSelf: 'center',
  },
  
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    height: 20,
  },
  
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  skipButton: {
    paddingHorizontal: 0,
  },
  
  navButtonsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  
  navButton: {
    minWidth: 80,
  },
});

export default OnboardingScreen;