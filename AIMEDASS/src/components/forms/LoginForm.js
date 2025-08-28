/**
 * MediAssist App - LoginForm Component
 * Secure login form with biometric authentication and validation
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Vibration,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { Formik } from 'formik';
import * as Yup from 'yup';
import TouchID from 'react-native-touch-id';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
import Input from '../common/Input';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

// Styles
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING, BORDER_RADIUS } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Validation schema
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .matches(
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      'Invalid email format'
    ),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
});

const LoginForm = ({
  // Auth props
  onLogin,
  onForgotPassword,
  onSignUp,
  
  // State props
  loading = false,
  error,
  
  // Feature props
  biometricEnabled = true,
  rememberMe = true,
  socialLogin = true,
  
  // Animation props
  animateOnMount = true,
  
  // Custom styles
  style,
  containerStyle,
  
  // Test props
  testID,
}) => {
  // State
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUser, setRememberUser] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [savedCredentials, setSavedCredentials] = useState(null);
  
  // Animation values
  const containerOpacity = useSharedValue(animateOnMount ? 0 : 1);
  const containerTranslateY = useSharedValue(animateOnMount ? 50 : 0);
  const shakeAnimation = useSharedValue(0);
  const biometricPulse = useSharedValue(1);
  
  // Refs
  const formikRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  
  // Check biometric availability on mount
  useEffect(() => {
    checkBiometricAvailability();
    loadSavedCredentials();
    
    if (animateOnMount) {
      // Stagger form field animations
      setTimeout(() => {
        containerOpacity.value = withSpring(1, { duration: 800, dampingRatio: 0.8 });
        containerTranslateY.value = withSpring(0, { duration: 800, dampingRatio: 0.7 });
      }, 100);
    }
  }, []);
  
  // Biometric authentication setup
  const checkBiometricAvailability = async () => {
    try {
      const biometryType = await TouchID.isSupported();
      if (biometryType) {
        setBiometricAvailable(true);
        setBiometricType(biometryType);
        
        // Pulse animation for biometric button
        biometricPulse.value = withSequence(
          withTiming(1.1, { duration: 600 }),
          withTiming(1, { duration: 600 })
        );
      }
    } catch (error) {
      console.log('Biometric not available:', error);
      setBiometricAvailable(false);
    }
  };
  
  // Load saved credentials
  const loadSavedCredentials = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedCredentials');
      if (saved) {
        const credentials = JSON.parse(saved);
        setSavedCredentials(credentials);
        setRememberUser(true);
        
        // Pre-fill form if credentials exist
        if (formikRef.current) {
          formikRef.current.setValues({
            email: credentials.email || '',
            password: '', // Never pre-fill password for security
          });
        }
      }
    } catch (error) {
      console.log('Error loading credentials:', error);
    }
  };
  
  // Save credentials
  const saveCredentials = async (email) => {
    try {
      if (rememberUser) {
        await AsyncStorage.setItem('savedCredentials', JSON.stringify({ email }));
      } else {
        await AsyncStorage.removeItem('savedCredentials');
      }
    } catch (error) {
      console.log('Error saving credentials:', error);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setSubmitting(true);
      
      // Save credentials if remember me is checked
      await saveCredentials(values.email);
      
      // Call login function
      await onLogin?.(values);
      
    } catch (error) {
      // Shake animation on error
      shakeAnimation.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      
      // Vibrate on error
      Vibration.vibrate([0, 100, 50, 100]);
      
      // Set field errors based on error type
      if (error.field) {
        setFieldError(error.field, error.message);
      } else {
        Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    if (!biometricAvailable || !savedCredentials) return;
    
    const optionalConfigObject = {
      title: 'MediAssist Authentication',
      subtitle: 'Use your biometric to sign in',
      description: 'Place your finger on the sensor or look at the camera',
      fallbackLabel: 'Use Password',
      cancelLabel: 'Cancel',
    };
    
    try {
      biometricPulse.value = withTiming(1.2, { duration: 100 });
      
      const biometryResult = await TouchID.authenticate(
        'Sign in to MediAssist',
        optionalConfigObject
      );
      
      if (biometryResult) {
        // Auto-login with saved credentials
        await onLogin?.(savedCredentials);
      }
    } catch (error) {
      console.log('Biometric authentication failed:', error);
      
      if (error.name !== 'UserCancel' && error.name !== 'UserFallback') {
        Alert.alert(
          'Authentication Failed',
          'Biometric authentication failed. Please try again or use your password.'
        );
      }
    } finally {
      biometricPulse.value = withTiming(1, { duration: 200 });
    }
  };
  
  // Handle social login
  const handleSocialLogin = async (provider) => {
    try {
      // Social login implementation would go here
      console.log(`Login with ${provider}`);
    } catch (error) {
      Alert.alert('Social Login Failed', `Unable to sign in with ${provider}`);
    }
  };
  
  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [
      { translateY: containerTranslateY.value },
      { translateX: shakeAnimation.value },
    ],
  }));
  
  const biometricAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: biometricPulse.value }],
  }));
  
  // Render functions
  const renderBiometricButton = () => {
    if (!biometricEnabled || !biometricAvailable || !savedCredentials) return null;
    
    return (
      <AnimatedView style={[{ alignItems: 'center', marginBottom: SPACING.lg }, biometricAnimatedStyle]}>
        <Button
          onPress={handleBiometricAuth}
          variant="outline"
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            borderColor: COLORS.primary.main,
            backgroundColor: COLORS.primary.100,
          }}
          accessibilityLabel={`Sign in with ${biometricType}`}
        >
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: COLORS.primary.main,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{
              color: COLORS.text.inverse,
              fontSize: 20,
            }}>
              {biometricType === 'FaceID' ? '👤' : '👆'}
            </Text>
          </View>
        </Button>
        
        <Text style={{
          ...TYPOGRAPHY.caption,
          color: COLORS.text.secondary,
          marginTop: SPACING.sm,
          textAlign: 'center',
        }}>
          Sign in with {biometricType}
        </Text>
      </AnimatedView>
    );
  };
  
  const renderSocialLogin = () => {
    if (!socialLogin) return null;
    
    return (
      <View style={{ marginBottom: SPACING.lg }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: SPACING.md,
        }}>
          <View style={{
            flex: 1,
            height: 1,
            backgroundColor: COLORS.border.light,
          }} />
          <Text style={{
            ...TYPOGRAPHY.caption,
            color: COLORS.text.tertiary,
            paddingHorizontal: SPACING.md,
          }}>
            OR CONTINUE WITH
          </Text>
          <View style={{
            flex: 1,
            height: 1,
            backgroundColor: COLORS.border.light,
          }} />
        </View>
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: SPACING.sm,
        }}>
          <Button
            onPress={() => handleSocialLogin('Google')}
            variant="outline"
            style={{ flex: 1 }}
            leftIcon={<Text style={{ fontSize: 18 }}>🔍</Text>}
          >
            Google
          </Button>
          
          <Button
            onPress={() => handleSocialLogin('Apple')}
            variant="outline"
            style={{ flex: 1 }}
            leftIcon={<Text style={{ fontSize: 18 }}>🍎</Text>}
          >
            Apple
          </Button>
        </View>
      </View>
    );
  };
  
  const renderRememberMe = () => {
    if (!rememberMe) return null;
    
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
      }}>
        <Button
          onPress={() => setRememberUser(!rememberUser)}
          variant="ghost"
          size="small"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 0,
          }}
        >
          <View style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: rememberUser ? COLORS.primary.main : COLORS.border.medium,
            backgroundColor: rememberUser ? COLORS.primary.main : 'transparent',
            marginRight: SPACING.sm,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {rememberUser && (
              <Text style={{
                color: COLORS.text.inverse,
                fontSize: 12,
                fontWeight: 'bold',
              }}>
                ✓
              </Text>
            )}
          </View>
          <Text style={{
            ...TYPOGRAPHY.bodySmall,
            color: COLORS.text.secondary,
          }}>
            Remember me
          </Text>
        </Button>
        
        <Button
          onPress={onForgotPassword}
          variant="ghost"
          size="small"
        >
          <Text style={{
            ...TYPOGRAPHY.bodySmall,
            color: COLORS.primary.main,
            fontWeight: '600',
          }}>
            Forgot password?
          </Text>
        </Button>
      </View>
    );
  };
  
  // Styles
  const containerStyleComputed = [
    {
      flex: 1,
      backgroundColor: COLORS.background.primary,
    },
    containerStyle,
  ];
  
  const formStyleComputed = [
    {
      padding: SPACING.lg,
      paddingTop: SPACING.xl,
    },
    style,
  ];
  
  return (
    <KeyboardAvoidingView
      style={containerStyleComputed}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      testID={testID}
    >
      <AnimatedScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AnimatedView style={[formStyleComputed, containerAnimatedStyle]}>
          {/* Header */}
          <View style={{
            alignItems: 'center',
            marginBottom: SPACING.xl,
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: COLORS.primary.100,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: SPACING.lg,
              ...SHADOWS.small,
            }}>
              <Text style={{ fontSize: 32 }}>🏥</Text>
            </View>
            
            <Text style={{
              ...TYPOGRAPHY.h2,
              textAlign: 'center',
              marginBottom: SPACING.sm,
            }}>
              Welcome Back
            </Text>
            
            <Text style={{
              ...TYPOGRAPHY.bodyMedium,
              color: COLORS.text.secondary,
              textAlign: 'center',
              maxWidth: 280,
            }}>
              Sign in to access your health dashboard and manage your care
            </Text>
          </View>
          
          {/* Biometric Authentication */}
          {renderBiometricButton()}
          
          {/* Login Form */}
          <Formik
            ref={formikRef}
            initialValues={{
              email: savedCredentials?.email || '',
              password: '',
            }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
            validateOnChange={false}
            validateOnBlur={true}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit: formikSubmit,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <View>
                {/* Email Input */}
                <Input
                  ref={emailInputRef}
                  label="Email Address"
                  placeholder="Enter your email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  errorMessage={touched.email ? errors.email : null}
                  leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>✉️</Text>}
                  testID="login-email-input"
                />
                
                {/* Password Input */}
                <Input
                  ref={passwordInputRef}
                  label="Password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={formikSubmit}
                  errorMessage={touched.password ? errors.password : null}
                  leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>🔐</Text>}
                  rightAction={{
                    icon: (
                      <Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>
                        {showPassword ? '👁️' : '🙈'}
                      </Text>
                    ),
                    onPress: () => setShowPassword(!showPassword),
                    accessibilityLabel: showPassword ? 'Hide password' : 'Show password',
                  }}
                  testID="login-password-input"
                />
                
                {/* Remember Me & Forgot Password */}
                {renderRememberMe()}
                
                {/* Login Button */}
                <Button
                  title="Sign In"
                  onPress={formikSubmit}
                  loading={isSubmitting || loading}
                  disabled={isSubmitting || loading}
                  variant="primary"
                  size="large"
                  fullWidth
                  style={{ marginBottom: SPACING.lg }}
                  testID="login-submit-button"
                />
                
                {/* Error Message */}
                {error && (
                  <View style={{
                    backgroundColor: COLORS.status.error.background,
                    borderRadius: BORDER_RADIUS.md,
                    padding: SPACING.md,
                    marginBottom: SPACING.lg,
                    borderLeftWidth: 4,
                    borderLeftColor: COLORS.status.error.main,
                  }}>
                    <Text style={{
                      ...TYPOGRAPHY.bodySmall,
                      color: COLORS.status.error.main,
                    }}>
                      {error}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Formik>
          
          {/* Social Login */}
          {renderSocialLogin()}
          
          {/* Sign Up Link */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: SPACING.xl,
          }}>
            <Text style={{
              ...TYPOGRAPHY.bodyMedium,
              color: COLORS.text.secondary,
            }}>
              Don't have an account?{' '}
            </Text>
            <Button
              onPress={onSignUp}
              variant="ghost"
              size="small"
              style={{ paddingHorizontal: 0 }}
            >
              <Text style={{
                ...TYPOGRAPHY.bodyMedium,
                color: COLORS.primary.main,
                fontWeight: '600',
              }}>
                Sign Up
              </Text>
            </Button>
          </View>
        </AnimatedView>
      </AnimatedScrollView>
      
      {/* Loading Overlay */}
      {loading && (
        <LoadingSpinner
          variant="overlay"
          message="Signing you in..."
          overlay
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default LoginForm;