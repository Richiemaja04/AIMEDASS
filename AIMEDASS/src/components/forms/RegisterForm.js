/**
 * MediAssist App - RegisterForm Component
 * Comprehensive registration form with medical profile setup
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
import DatePicker from 'react-native-date-picker';

// Components
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import StatusPill from '../common/StatusPill';

// Styles
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING, BORDER_RADIUS } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Multi-step form validation schemas
const personalInfoSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required')
    .matches(/^[a-zA-Z\s]*$/, 'Only letters are allowed'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required')
    .matches(/^[a-zA-Z\s]*$/, 'Only letters are allowed'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .matches(
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      'Invalid email format'
    ),
  phone: Yup.string()
    .matches(/^[+]?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  dateOfBirth: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .min(new Date('1900-01-01'), 'Please enter a valid date of birth')
    .required('Date of birth is required'),
});

const accountInfoSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

const medicalInfoSchema = Yup.object().shape({
  emergencyContact: Yup.string()
    .matches(/^[+]?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid phone number')
    .required('Emergency contact is required'),
  emergencyContactName: Yup.string()
    .min(2, 'Emergency contact name must be at least 2 characters')
    .required('Emergency contact name is required'),
  bloodType: Yup.string()
    .oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 'Please select a valid blood type')
    .required('Blood type is required'),
  allergies: Yup.string().max(500, 'Allergies description must be less than 500 characters'),
  currentMedications: Yup.string().max(500, 'Current medications must be less than 500 characters'),
  medicalConditions: Yup.string().max(500, 'Medical conditions must be less than 500 characters'),
});

// Form steps
const FORM_STEPS = [
  { key: 'personal', title: 'Personal Info', icon: '👤' },
  { key: 'account', title: 'Account Setup', icon: '🔐' },
  { key: 'medical', title: 'Medical Profile', icon: '🏥' },
  { key: 'review', title: 'Review & Submit', icon: '✓' },
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const RegisterForm = ({
  // Auth props
  onRegister,
  onSignIn,
  
  // State props
  loading = false,
  error,
  
  // Animation props
  animateOnMount = true,
  
  // Custom styles
  style,
  containerStyle,
  
  // Test props
  testID,
}) => {
  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Animation values
  const containerOpacity = useSharedValue(animateOnMount ? 0 : 1);
  const containerTranslateY = useSharedValue(animateOnMount ? 50 : 0);
  const stepProgress = useSharedValue(0);
  const shakeAnimation = useSharedValue(0);
  
  // Refs
  const formikRef = useRef(null);
  const scrollViewRef = useRef(null);
  
  // Mount animation
  useEffect(() => {
    if (animateOnMount) {
      containerOpacity.value = withSpring(1, { duration: 800, dampingRatio: 0.8 });
      containerTranslateY.value = withSpring(0, { duration: 800, dampingRatio: 0.7 });
    }
  }, []);
  
  // Update progress animation
  useEffect(() => {
    stepProgress.value = withSpring(currentStep / (FORM_STEPS.length - 1), {
      duration: 500,
      dampingRatio: 0.7,
    });
  }, [currentStep]);
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setSubmitting(true);
      
      // Prepare registration data
      const registrationData = {
        ...values,
        bloodType: selectedBloodType,
        agreedToTerms,
        registeredAt: new Date().toISOString(),
      };
      
      await onRegister?.(registrationData);
      
    } catch (error) {
      // Shake animation on error
      shakeAnimation.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      
      Vibration.vibrate([0, 100, 50, 100]);
      
      if (error.field) {
        setFieldError(error.field, error.message);
      } else {
        Alert.alert('Registration Failed', error.message || 'Please check your information and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Navigation helpers
  const nextStep = () => {
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };
  
  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };
  
  // Validation helper
  const validateCurrentStep = (values) => {
    switch (currentStep) {
      case 0:
        return personalInfoSchema.isValidSync(values);
      case 1:
        return accountInfoSchema.isValidSync(values);
      case 2:
        return medicalInfoSchema.isValidSync(values) && selectedBloodType;
      case 3:
        return agreedToTerms;
      default:
        return true;
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
  
  const progressAnimatedStyle = useAnimatedStyle(() => {
    const width = interpolate(stepProgress.value, [0, 1], [0, 100]);
    return {
      width: `${width}%`,
    };
  });
  
  // Render functions
  const renderProgressBar = () => (
    <View style={{
      marginBottom: SPACING.xl,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
      }}>
        {FORM_STEPS.map((step, index) => (
          <View
            key={step.key}
            style={{
              alignItems: 'center',
              opacity: index <= currentStep ? 1 : 0.5,
            }}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: index <= currentStep ? COLORS.primary.main : COLORS.neutral.gray[300],
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: SPACING.xs,
            }}>
              <Text style={{
                fontSize: 16,
                color: index <= currentStep ? COLORS.text.inverse : COLORS.text.disabled,
              }}>
                {step.icon}
              </Text>
            </View>
            <Text style={{
              ...TYPOGRAPHY.caption,
              color: index <= currentStep ? COLORS.text.primary : COLORS.text.disabled,
              textAlign: 'center',
              maxWidth: 60,
            }}>
              {step.title}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={{
        height: 4,
        backgroundColor: COLORS.neutral.gray[200],
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <AnimatedView style={[
          {
            height: '100%',
            backgroundColor: COLORS.primary.main,
            borderRadius: 2,
          },
          progressAnimatedStyle,
        ]} />
      </View>
    </View>
  );
  
  const renderPersonalInfoStep = (values, handleChange, handleBlur, errors, touched) => (
    <View>
      <Text style={{
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.md,
        textAlign: 'center',
      }}>
        Personal Information
      </Text>
      
      <View style={{
        flexDirection: 'row',
        gap: SPACING.sm,
      }}>
        <Input
          label="First Name"
          placeholder="John"
          value={values.firstName}
          onChangeText={handleChange('firstName')}
          onBlur={handleBlur('firstName')}
          errorMessage={touched.firstName ? errors.firstName : null}
          style={{ flex: 1 }}
          testID="register-firstName-input"
        />
        
        <Input
          label="Last Name"
          placeholder="Doe"
          value={values.lastName}
          onChangeText={handleChange('lastName')}
          onBlur={handleBlur('lastName')}
          errorMessage={touched.lastName ? errors.lastName : null}
          style={{ flex: 1 }}
          testID="register-lastName-input"
        />
      </View>
      
      <Input
        label="Email Address"
        placeholder="john.doe@example.com"
        value={values.email}
        onChangeText={handleChange('email')}
        onBlur={handleBlur('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        errorMessage={touched.email ? errors.email : null}
        leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>✉️</Text>}
        testID="register-email-input"
      />
      
      <Input
        label="Phone Number"
        placeholder="+1 (555) 123-4567"
        value={values.phone}
        onChangeText={handleChange('phone')}
        onBlur={handleBlur('phone')}
        keyboardType="phone-pad"
        errorMessage={touched.phone ? errors.phone : null}
        leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>📞</Text>}
        testID="register-phone-input"
      />
      
      <Button
        title={`Date of Birth: ${values.dateOfBirth ? values.dateOfBirth.toLocaleDateString() : 'Select Date'}`}
        onPress={() => setDatePickerOpen(true)}
        variant="outline"
        style={{
          justifyContent: 'flex-start',
          marginBottom: SPACING.md,
        }}
        leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>📅</Text>}
      />
      
      <DatePicker
        modal
        open={datePickerOpen}
        date={values.dateOfBirth || new Date()}
        mode="date"
        maximumDate={new Date()}
        minimumDate={new Date('1900-01-01')}
        onConfirm={(date) => {
          setDatePickerOpen(false);
          handleChange('dateOfBirth')(date);
        }}
        onCancel={() => setDatePickerOpen(false)}
      />
    </View>
  );
  
  const renderAccountInfoStep = (values, handleChange, handleBlur, errors, touched) => (
    <View>
      <Text style={{
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.md,
        textAlign: 'center',
      }}>
        Account Security
      </Text>
      
      <Input
        label="Password"
        placeholder="Create a strong password"
        value={values.password}
        onChangeText={handleChange('password')}
        onBlur={handleBlur('password')}
        secureTextEntry={!showPassword}
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
        helper="Password must contain uppercase, lowercase, number and special character"
        testID="register-password-input"
      />
      
      <Input
        label="Confirm Password"
        placeholder="Confirm your password"
        value={values.confirmPassword}
        onChangeText={handleChange('confirmPassword')}
        onBlur={handleBlur('confirmPassword')}
        secureTextEntry={!showConfirmPassword}
        errorMessage={touched.confirmPassword ? errors.confirmPassword : null}
        leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>🔐</Text>}
        rightAction={{
          icon: (
            <Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>
              {showConfirmPassword ? '👁️' : '🙈'}
            </Text>
          ),
          onPress: () => setShowConfirmPassword(!showConfirmPassword),
          accessibilityLabel: showConfirmPassword ? 'Hide password' : 'Show password',
        }}
        testID="register-confirmPassword-input"
      />
      
      {/* Password Strength Indicator */}
      <View style={{
        flexDirection: 'row',
        gap: SPACING.xs,
        marginBottom: SPACING.md,
      }}>
        <StatusPill
          status={values.password?.length >= 8 ? 'success' : 'neutral'}
          text="Length"
          size="small"
        />
        <StatusPill
          status={/[A-Z]/.test(values.password) ? 'success' : 'neutral'}
          text="Uppercase"
          size="small"
        />
        <StatusPill
          status={/[a-z]/.test(values.password) ? 'success' : 'neutral'}
          text="Lowercase"
          size="small"
        />
        <StatusPill
          status={/\d/.test(values.password) ? 'success' : 'neutral'}
          text="Number"
          size="small"
        />
        <StatusPill
          status={/[@$!%*?&]/.test(values.password) ? 'success' : 'neutral'}
          text="Special"
          size="small"
        />
      </View>
    </View>
  );
  
  const renderMedicalInfoStep = (values, handleChange, handleBlur, errors, touched) => (
    <View>
      <Text style={{
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.md,
        textAlign: 'center',
      }}>
        Medical Profile
      </Text>
      
      {/* Emergency Contact */}
      <Input
        label="Emergency Contact Name"
        placeholder="Emergency contact full name"
        value={values.emergencyContactName}
        onChangeText={handleChange('emergencyContactName')}
        onBlur={handleBlur('emergencyContactName')}
        errorMessage={touched.emergencyContactName ? errors.emergencyContactName : null}
        leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>👤</Text>}
      />
      
      <Input
        label="Emergency Contact Phone"
        placeholder="+1 (555) 987-6543"
        value={values.emergencyContact}
        onChangeText={handleChange('emergencyContact')}
        onBlur={handleBlur('emergencyContact')}
        keyboardType="phone-pad"
        errorMessage={touched.emergencyContact ? errors.emergencyContact : null}
        leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>🚨</Text>}
      />
      
      {/* Blood Type Selection */}
      <Text style={{
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.sm,
        marginTop: SPACING.md,
      }}>
        Blood Type *
      </Text>
      
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
      }}>
        {BLOOD_TYPES.map((type) => (
          <Button
            key={type}
            title={type}
            variant={selectedBloodType === type ? 'primary' : 'outline'}
            size="small"
            onPress={() => setSelectedBloodType(type)}
            style={{ minWidth: 60 }}
          />
        ))}
      </View>
      
      {/* Medical History */}
      <Input
        label="Allergies"
        placeholder="List any known allergies..."
        value={values.allergies}
        onChangeText={handleChange('allergies')}
        onBlur={handleBlur('allergies')}
        multiline
        numberOfLines={3}
        errorMessage={touched.allergies ? errors.allergies : null}
        helper="Include food, medication, and environmental allergies"
      />
      
      <Input
        label="Current Medications"
        placeholder="List current medications and dosages..."
        value={values.currentMedications}
        onChangeText={handleChange('currentMedications')}
        onBlur={handleBlur('currentMedications')}
        multiline
        numberOfLines={3}
        errorMessage={touched.currentMedications ? errors.currentMedications : null}
      />
      
      <Input
        label="Medical Conditions"
        placeholder="List any chronic conditions or medical history..."
        value={values.medicalConditions}
        onChangeText={handleChange('medicalConditions')}
        onBlur={handleBlur('medicalConditions')}
        multiline
        numberOfLines={3}
        errorMessage={touched.medicalConditions ? errors.medicalConditions : null}
      />
    </View>
  );
  
  const renderReviewStep = (values) => (
    <View>
      <Text style={{
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.md,
        textAlign: 'center',
      }}>
        Review Your Information
      </Text>
      
      <Card variant="outlined" style={{ marginBottom: SPACING.md }}>
        <Text style={{ ...TYPOGRAPHY.h6, marginBottom: SPACING.sm }}>Personal Information</Text>
        <Text style={TYPOGRAPHY.bodyMedium}>
          {values.firstName} {values.lastName}
        </Text>
        <Text style={TYPOGRAPHY.bodySmall}>{values.email}</Text>
        <Text style={TYPOGRAPHY.bodySmall}>{values.phone}</Text>
        <Text style={TYPOGRAPHY.bodySmall}>
          Born: {values.dateOfBirth?.toLocaleDateString()}
        </Text>
      </Card>
      
      <Card variant="outlined" style={{ marginBottom: SPACING.md }}>
        <Text style={{ ...TYPOGRAPHY.h6, marginBottom: SPACING.sm }}>Medical Profile</Text>
        <Text style={TYPOGRAPHY.bodyMedium}>Blood Type: {selectedBloodType}</Text>
        <Text style={TYPOGRAPHY.bodySmall}>
          Emergency Contact: {values.emergencyContactName} ({values.emergencyContact})
        </Text>
        {values.allergies && (
          <Text style={TYPOGRAPHY.bodySmall}>Allergies: {values.allergies}</Text>
        )}
      </Card>
      
      {/* Terms and Conditions */}
      <Button
        onPress={() => setAgreedToTerms(!agreedToTerms)}
        variant="ghost"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingHorizontal: 0,
          marginBottom: SPACING.md,
        }}
      >
        <View style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: agreedToTerms ? COLORS.primary.main : COLORS.border.medium,
          backgroundColor: agreedToTerms ? COLORS.primary.main : 'transparent',
          marginRight: SPACING.sm,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {agreedToTerms && (
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
          flex: 1,
        }}>
          I agree to the Terms of Service and Privacy Policy
        </Text>
      </Button>
    </View>
  );
  
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
        ref={scrollViewRef}
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
              backgroundColor: COLORS.secondary.100,
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
              Create Account
            </Text>
            
            <Text style={{
              ...TYPOGRAPHY.bodyMedium,
              color: COLORS.text.secondary,
              textAlign: 'center',
              maxWidth: 280,
            }}>
              Join MediAssist to manage your health and wellness journey
            </Text>
          </View>
          
          {/* Progress Bar */}
          {renderProgressBar()}
          
          {/* Registration Form */}
          <Formik
            ref={formikRef}
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              dateOfBirth: null,
              password: '',
              confirmPassword: '',
              emergencyContact: '',
              emergencyContactName: '',
              allergies: '',
              currentMedications: '',
              medicalConditions: '',
            }}
            validationSchema={
              currentStep === 0 ? personalInfoSchema :
              currentStep === 1 ? accountInfoSchema :
              currentStep === 2 ? medicalInfoSchema : null
            }
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
                {/* Step Content */}
                {currentStep === 0 && renderPersonalInfoStep(values, handleChange, handleBlur, errors, touched)}
                {currentStep === 1 && renderAccountInfoStep(values, handleChange, handleBlur, errors, touched)}
                {currentStep === 2 && renderMedicalInfoStep(values, handleChange, handleBlur, errors, touched)}
                {currentStep === 3 && renderReviewStep(values)}
                
                {/* Navigation Buttons */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: SPACING.xl,
                  gap: SPACING.sm,
                }}>
                  {currentStep > 0 && (
                    <Button
                      title="Previous"
                      onPress={previousStep}
                      variant="outline"
                      style={{ flex: 1 }}
                    />
                  )}
                  
                  <Button
                    title={currentStep === FORM_STEPS.length - 1 ? 'Create Account' : 'Next'}
                    onPress={currentStep === FORM_STEPS.length - 1 ? formikSubmit : () => {
                      if (validateCurrentStep(values)) {
                        nextStep();
                      } else {
                        Alert.alert('Incomplete Information', 'Please fill in all required fields before continuing.');
                      }
                    }}
                    loading={isSubmitting || loading}
                    disabled={
                      isSubmitting || loading || 
                      (currentStep === FORM_STEPS.length - 1 && !agreedToTerms)
                    }
                    variant="primary"
                    style={{ flex: currentStep === 0 ? 2 : 1 }}
                  />
                </View>
                
                {/* Error Message */}
                {error && (
                  <View style={{
                    backgroundColor: COLORS.status.error.background,
                    borderRadius: BORDER_RADIUS.md,
                    padding: SPACING.md,
                    marginTop: SPACING.md,
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
          
          {/* Sign In Link */}
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
              Already have an account?{' '}
            </Text>
            <Button
              onPress={onSignIn}
              variant="ghost"
              size="small"
              style={{ paddingHorizontal: 0 }}
            >
              <Text style={{
                ...TYPOGRAPHY.bodyMedium,
                color: COLORS.primary.main,
                fontWeight: '600',
              }}>
                Sign In
              </Text>
            </Button>
          </View>
        </AnimatedView>
      </AnimatedScrollView>
      
      {/* Loading Overlay */}
      {loading && (
        <LoadingSpinner
          variant="overlay"
          message="Creating your account..."
          overlay
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default RegisterForm;