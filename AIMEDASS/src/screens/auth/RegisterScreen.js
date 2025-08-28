/**
 * MediAssist App - RegisterScreen
 * Comprehensive registration screen with multi-step form and medical profile setup
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Dimensions,
  BackHandler,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

// Components
import RegisterForm from '../../src/components/forms/RegisterForm';
import LoadingSpinner, { FullScreenLoader } from '../../src/components/common/LoadingSpinner';
import FadeInView from '../../src/components/animations/FadeInView';
import SlideInCard from '../../src/components/animations/SlideInCard';
import Button from '../../src/components/common/Button';
import AnimatedHeader from '../../src/components/common/AnimatedHeader';

// Redux actions (these would be imported from actual slice files)
// import { registerUser, clearAuthError } from '../../store/slices/authSlice';

// Styles
import { COLORS } from '../../styles/colors';
import { TYPOGRAPHY } from '../../styles/typography';
import { SPACING, BORDER_RADIUS } from '../../styles/spacing';
import { SHADOWS } from '../../styles/shadows';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const RegisterScreen = () => {
  // Navigation
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Redux state (commented out since we don't have actual slices yet)
  // const { loading, error, user, registrationStep } = useSelector(state => state.auth);
  
  // Local state for demonstration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrationStep, setRegistrationStep] = useState(0);
  const user = null;
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);
  const backgroundOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);
  const progressOpacity = useSharedValue(0);
  
  // Refs
  const isInitialMount = useRef(true);
  const backHandlerRef = useRef(null);
  
  // Handle successful registration redirect
  useEffect(() => {
    if (user) {
      // Show success message and navigate
      Alert.alert(
        'Welcome to MediAssist!',
        'Your account has been created successfully. Let\'s get you started on your health journey.',
        [
          {
            text: 'Get Started',
            onPress: () => navigation.navigate('Onboarding'),
          },
        ],
        { cancelable: false }
      );
    }
  }, [user, navigation]);
  
  // Handle Android back button
  useEffect(() => {
    if (Platform.OS === 'android') {
      const handleBackPress = () => {
        if (registrationStep > 0) {
          // If in multi-step form, go back to previous step
          // In real implementation, this would be handled by the form component
          return true; // Prevent default back behavior
        }
        return false; // Allow default back behavior
      };
      
      backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      
      return () => {
        if (backHandlerRef.current) {
          backHandlerRef.current.remove();
        }
      };
    }
  }, [registrationStep]);
  
  // Entrance animations
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Staggered entrance animation
      backgroundOpacity.value = withSpring(1, { duration: 800, dampingRatio: 0.8 });
      
      headerOpacity.value = withDelay(200, withSpring(1, { duration: 600 }));
      headerTranslateY.value = withDelay(200, withSpring(0, { duration: 800, dampingRatio: 0.8 }));
      
      progressOpacity.value = withDelay(400, withSpring(1, { duration: 600 }));
      
      formOpacity.value = withDelay(600, withSpring(1, { duration: 600 }));
      formTranslateY.value = withDelay(600, withSpring(0, { duration: 800, dampingRatio: 0.8 }));
    }
  }, []);
  
  // Handle registration submission
  const handleRegister = async (registrationData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call with medical data processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In real implementation, this would dispatch the register action:
      // await dispatch(registerUser(registrationData)).unwrap();
      
      // For demo purposes, simulate success
      console.log('Registration data:', registrationData);
      
      // Simulate successful registration
      // In real app, this would come from Redux store
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('Onboarding');
      }, 1000);
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
      
      // Shake animation on error
      formTranslateY.value = withSequence(
        withSpring(-10, { duration: 100 }),
        withSpring(10, { duration: 100 }),
        withSpring(-5, { duration: 100 }),
        withSpring(0, { duration: 200 })
      );
    }
  };
  
  // Handle sign in navigation
  const handleSignIn = () => {
    navigation.navigate('Login');
  };
  
  // Handle form cancellation
  const handleCancel = () => {
    Alert.alert(
      'Cancel Registration',
      'Are you sure you want to cancel? Your progress will be lost.',
      [
        { text: 'Continue Registration', style: 'cancel' },
        { 
          text: 'Cancel Registration', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        },
      ]
    );
  };
  
  // Clear error when user interacts
  const handleClearError = () => {
    setError(null);
  };
  
  // Animated styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));
  
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));
  
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
  }));
  
  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));
  
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <View style={styles.container}>
        {/* Background Gradient */}
        <AnimatedLinearGradient
          colors={COLORS.gradients.medical}
          style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Safe Area Content */}
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <AnimatedView style={[styles.headerSection, headerAnimatedStyle]}>
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <View style={styles.logoBackground}>
                  <Text style={styles.logoIcon}>🏥</Text>
                </View>
                <Text style={styles.appName}>MediAssist</Text>
              </View>
              
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Join MediAssist</Text>
                <Text style={styles.headerSubtitle}>
                  Create your account and take control of your health journey
                </Text>
              </View>
            </View>
          </AnimatedView>
          
          {/* Progress Indicator */}
          <AnimatedView style={[styles.progressSection, progressAnimatedStyle]}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((registrationStep + 1) / 4) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                Step {registrationStep + 1} of 4
              </Text>
            </View>
          </AnimatedView>
          
          {/* Form Section */}
          <KeyboardAvoidingView
            style={styles.formContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <AnimatedView style={[styles.formSection, formAnimatedStyle]}>
              <SlideInCard
                direction="up"
                delay={800}
                variant="elevated"
                style={styles.formCard}
              >
                <RegisterForm
                  onRegister={handleRegister}
                  onSignIn={handleSignIn}
                  onCancel={handleCancel}
                  loading={loading}
                  error={error}
                  animateOnMount={false} // We're handling animations at screen level
                />
              </SlideInCard>
            </AnimatedView>
          </KeyboardAvoidingView>
          
          {/* Footer Section */}
          <FadeInView
            delay={1000}
            style={styles.footerSection}
          >
            <View style={styles.privacyNote}>
              <Text style={styles.privacyIcon}>🔐</Text>
              <Text style={styles.privacyText}>
                Your personal health information is protected by industry-standard encryption
              </Text>
            </View>
            
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text 
                  style={styles.termsLink}
                  onPress={() => navigation.navigate('Terms')}
                >
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text 
                  style={styles.termsLink}
                  onPress={() => navigation.navigate('Privacy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
            
            <View style={styles.complianceInfo}>
              <Text style={styles.complianceText}>
                🏥 HIPAA Compliant • 🛡️ SOC 2 Certified • 🔒 ISO 27001
              </Text>
            </View>
          </FadeInView>
        </SafeAreaView>
        
        {/* Loading Overlay */}
        <FullScreenLoader
          visible={loading}
          message="Creating your account..."
          variant="medical"
          backdrop={true}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary.main,
  },
  
  safeArea: {
    flex: 1,
  },
  
  headerSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  
  headerContent: {
    alignItems: 'center',
  },
  
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  logoBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.text.inverse,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.small,
  },
  
  logoIcon: {
    fontSize: 20,
  },
  
  appName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.inverse,
    fontWeight: 'bold',
  },
  
  headerText: {
    alignItems: 'center',
  },
  
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.inverse,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  
  headerSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  
  progressSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  
  progressContainer: {
    alignItems: 'center',
  },
  
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.text.inverse,
    borderRadius: 3,
  },
  
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
    opacity: 0.8,
    fontWeight: '500',
  },
  
  formContainer: {
    flex: 1,
  },
  
  formSection: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  
  formCard: {
    backgroundColor: COLORS.background.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    flex: 1,
    overflow: 'hidden',
    ...SHADOWS.modal,
  },
  
  footerSection: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    alignItems: 'center',
  },
  
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxWidth: '90%',
  },
  
  privacyIcon: {
    fontSize: 14,
    marginRight: SPACING.sm,
  },
  
  privacyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
    opacity: 0.9,
    flex: 1,
    textAlign: 'center',
  },
  
  termsContainer: {
    marginBottom: SPACING.sm,
    maxWidth: '90%',
  },
  
  termsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 16,
  },
  
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  
  complianceInfo: {
    alignItems: 'center',
  },
  
  complianceText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
    opacity: 0.7,
    textAlign: 'center',
    fontSize: 11,
  },
});

export default RegisterScreen;