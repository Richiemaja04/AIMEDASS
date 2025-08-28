/**
 * MediAssist App - LoginScreen
 * Professional login screen with biometric authentication and medical theming
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
import LoginForm from '../../src/components/forms/LoginForm';
import LoadingSpinner, { FullScreenLoader } from '../../src/components/common/LoadingSpinner';
import FadeInView from '../../src/components/animations/FadeInView';
import SlideInCard from '../../src/components/animations/SlideInCard';
import AnimatedHeader from '../../src/components/common/AnimatedHeader';

// Redux actions (these would be imported from actual slice files)
// import { loginUser, clearAuthError } from '../../store/slices/authSlice';

// Styles
import { COLORS } from '../../styles/colors';
import { TYPOGRAPHY } from '../../styles/typography';
import { SPACING, BORDER_RADIUS } from '../../styles/spacing';
import { SHADOWS } from '../../styles/shadows';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const LoginScreen = () => {
  // Navigation
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Redux state (commented out since we don't have actual slices yet)
  // const { loading, error, user } = useSelector(state => state.auth);
  
  // Local state for demonstration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = null;
  
  // Animation values
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);
  
  // Refs
  const isInitialMount = useRef(true);
  
  // Handle user authentication redirect
  useEffect(() => {
    if (user) {
      navigation.navigate('Main');
    }
  }, [user, navigation]);
  
  // Entrance animations
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Staggered entrance animation
      backgroundOpacity.value = withSpring(1, { duration: 800, dampingRatio: 0.8 });
      
      logoOpacity.value = withDelay(300, withSpring(1, { duration: 600 }));
      logoScale.value = withDelay(300, withSpring(1, { duration: 800, dampingRatio: 0.7 }));
      
      formOpacity.value = withDelay(600, withSpring(1, { duration: 600 }));
      formTranslateY.value = withDelay(600, withSpring(0, { duration: 800, dampingRatio: 0.8 }));
    }
  }, []);
  
  // Handle login submission
  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would dispatch the login action:
      // await dispatch(loginUser(credentials)).unwrap();
      
      // For demo purposes, simulate success
      console.log('Login attempt:', credentials);
      
      // Navigate to main app
      navigation.navigate('Main');
      
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      
      // Shake animation on error
      logoScale.value = withSequence(
        withSpring(1.05, { duration: 100 }),
        withSpring(0.95, { duration: 100 }),
        withSpring(1, { duration: 200 })
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Handle forgot password
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };
  
  // Handle sign up navigation
  const handleSignUp = () => {
    navigation.navigate('Register');
  };
  
  // Clear error when user starts typing
  const handleClearError = () => {
    setError(null);
  };
  
  // Animated styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));
  
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
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
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              {/* App Logo */}
              <AnimatedView style={[styles.logoContainer, logoAnimatedStyle]}>
                <View style={styles.logoBackground}>
                  <Text style={styles.logoIcon}>🏥</Text>
                </View>
                <Text style={styles.appName}>MediAssist</Text>
                <Text style={styles.appTagline}>Your Health, Our Priority</Text>
              </AnimatedView>
              
              {/* Welcome Message */}
              <FadeInView
                delay={800}
                medicalContext="gentle"
                style={styles.welcomeContainer}
              >
                <Text style={styles.welcomeTitle}>Welcome Back</Text>
                <Text style={styles.welcomeSubtitle}>
                  Sign in to access your personalized health dashboard
                </Text>
              </FadeInView>
            </View>
            
            {/* Form Section */}
            <AnimatedView style={[styles.formSection, formAnimatedStyle]}>
              <SlideInCard
                direction="up"
                delay={1000}
                variant="elevated"
                style={styles.formCard}
              >
                <LoginForm
                  onLogin={handleLogin}
                  onForgotPassword={handleForgotPassword}
                  onSignUp={handleSignUp}
                  loading={loading}
                  error={error}
                  biometricEnabled={true}
                  rememberMe={true}
                  socialLogin={true}
                  animateOnMount={false} // We're handling animations at screen level
                />
              </SlideInCard>
            </AnimatedView>
            
            {/* Footer Section */}
            <FadeInView
              delay={1200}
              style={styles.footerSection}
            >
              <View style={styles.securityNote}>
                <Text style={styles.securityIcon}>🔒</Text>
                <Text style={styles.securityText}>
                  Your health data is encrypted and secure
                </Text>
              </View>
              
              <View style={styles.complianceInfo}>
                <Text style={styles.complianceText}>
                  HIPAA Compliant • SOC 2 Certified
                </Text>
              </View>
            </FadeInView>
          </KeyboardAvoidingView>
        </SafeAreaView>
        
        {/* Loading Overlay */}
        <FullScreenLoader
          visible={loading}
          message="Signing you in..."
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
    backgroundColor: COLORS.primary.main,
  },
  
  safeArea: {
    flex: 1,
  },
  
  keyboardAvoidingView: {
    flex: 1,
  },
  
  headerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.text.inverse,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.large,
    shadowColor: COLORS.primary.dark,
  },
  
  logoIcon: {
    fontSize: 48,
  },
  
  appName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.inverse,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  
  appTagline: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
  },
  
  welcomeContainer: {
    alignItems: 'center',
  },
  
  welcomeTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.inverse,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  
  welcomeSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.inverse,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  
  formSection: {
    flex: 2,
    justifyContent: 'flex-start',
    paddingHorizontal: SPACING.lg,
  },
  
  formCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.modal,
  },
  
  footerSection: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  securityIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  
  securityText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  
  complianceInfo: {
    alignItems: 'center',
  },
  
  complianceText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default LoginScreen;