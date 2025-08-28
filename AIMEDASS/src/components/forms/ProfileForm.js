/**
 * MediAssist App - ProfileForm Component
 * Comprehensive profile management with medical information
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Formik } from 'formik';
import * as Yup from 'yup';
import ImagePicker from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';

// Components
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import StatusPill from '../common/StatusPill';
import LoadingSpinner from '../common/LoadingSpinner';

// Styles
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING, BORDER_RADIUS, DIMENSIONS } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Validation schema
const profileSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[+]?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  address: Yup.string().max(200, 'Address must be less than 200 characters'),
  city: Yup.string().max(50, 'City must be less than 50 characters'),
  zipCode: Yup.string()
    .matches(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
  emergencyContact: Yup.string()
    .matches(/^[+]?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid phone number')
    .required('Emergency contact is required'),
  emergencyContactName: Yup.string()
    .min(2, 'Emergency contact name must be at least 2 characters')
    .required('Emergency contact name is required'),
  emergencyContactRelation: Yup.string()
    .required('Please specify relationship to emergency contact'),
  height: Yup.number()
    .min(24, 'Height must be realistic')
    .max(120, 'Height must be realistic'),
  weight: Yup.number()
    .min(20, 'Weight must be realistic')
    .max(1000, 'Weight must be realistic'),
  allergies: Yup.string().max(500, 'Allergies description must be less than 500 characters'),
  currentMedications: Yup.string().max(1000, 'Current medications must be less than 1000 characters'),
  medicalConditions: Yup.string().max(1000, 'Medical conditions must be less than 1000 characters'),
  insuranceProvider: Yup.string().max(100, 'Insurance provider must be less than 100 characters'),
  insurancePolicyNumber: Yup.string().max(50, 'Policy number must be less than 50 characters'),
});

// Constants
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const EMERGENCY_RELATIONS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'];
const PROFILE_SECTIONS = [
  { key: 'personal', title: 'Personal Information', icon: '👤' },
  { key: 'contact', title: 'Contact & Address', icon: '📍' },
  { key: 'emergency', title: 'Emergency Contact', icon: '🚨' },
  { key: 'medical', title: 'Medical Information', icon: '🏥' },
  { key: 'insurance', title: 'Insurance Details', icon: '🛡️' },
];

const ProfileForm = ({
  // Profile data
  initialValues = {},
  onSave,
  onCancel,
  
  // State props
  loading = false,
  saving = false,
  error,
  
  // Mode props
  editMode = false,
  
  // Feature props
  allowImageUpload = true,
  showInsuranceSection = true,
  
  // Animation props
  animateOnMount = true,
  
  // Custom styles
  style,
  containerStyle,
  
  // Test props
  testID,
}) => {
  // State
  const [profileImage, setProfileImage] = useState(initialValues.profileImage || null);
  const [selectedBloodType, setSelectedBloodType] = useState(initialValues.bloodType || '');
  const [selectedGender, setSelectedGender] = useState(initialValues.gender || '');
  const [selectedEmergencyRelation, setSelectedEmergencyRelation] = useState(initialValues.emergencyContactRelation || '');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState('personal');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Animation values
  const containerOpacity = useSharedValue(animateOnMount ? 0 : 1);
  const containerTranslateY = useSharedValue(animateOnMount ? 30 : 0);
  const imageScale = useSharedValue(1);
  
  // Refs
  const formikRef = useRef(null);
  const scrollViewRef = useRef(null);
  
  // Mount animation
  useEffect(() => {
    if (animateOnMount) {
      containerOpacity.value = withSpring(1, { duration: 600, dampingRatio: 0.8 });
      containerTranslateY.value = withSpring(0, { duration: 600, dampingRatio: 0.7 });
    }
  }, []);
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setSubmitting(true);
      
      const profileData = {
        ...values,
        profileImage,
        bloodType: selectedBloodType,
        gender: selectedGender,
        emergencyContactRelation: selectedEmergencyRelation,
        updatedAt: new Date().toISOString(),
      };
      
      await onSave?.(profileData);
      setHasUnsavedChanges(false);
      
    } catch (error) {
      if (error.field) {
        setFieldError(error.field, error.message);
      } else {
        Alert.alert('Save Failed', error.message || 'Unable to save profile. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle image selection
  const handleImagePicker = () => {
    const options = {
      title: 'Select Profile Picture',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 400,
      maxHeight: 400,
    };
    
    Alert.alert(
      'Update Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openCamera(options) },
        { text: 'Gallery', onPress: () => openGallery(options) },
        { text: 'Remove', onPress: () => removeImage(), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };
  
  const openCamera = (options) => {
    ImagePicker.launchCamera({ ...options, mediaType: 'photo' }, handleImageResponse);
  };
  
  const openGallery = (options) => {
    ImagePicker.launchImageLibrary(options, handleImageResponse);
  };
  
  const handleImageResponse = (response) => {
    if (response.didCancel || response.error) return;
    
    if (response.assets && response.assets[0]) {
      imageScale.value = withSpring(1.1, { duration: 200 }, () => {
        imageScale.value = withSpring(1, { duration: 300 });
      });
      
      setProfileImage(response.assets[0].uri);
      setHasUnsavedChanges(true);
    }
  };
  
  const removeImage = () => {
    setProfileImage(null);
    setHasUnsavedChanges(true);
  };
  
  // Handle section expansion
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));
  
  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));
  
  // Render functions
  const renderProfileImage = () => {
    if (!allowImageUpload) return null;
    
    return (
      <View style={{
        alignItems: 'center',
        marginBottom: SPACING.xl,
      }}>
        <AnimatedView style={imageAnimatedStyle}>
          <TouchableOpacity
            onPress={handleImagePicker}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: COLORS.neutral.gray[100],
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              ...SHADOWS.medium,
            }}
            accessibilityLabel="Change profile picture"
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                resizeMode="cover"
              />
            ) : (
              <View style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 40, marginBottom: 4 }}>📷</Text>
                <Text style={{
                  ...TYPOGRAPHY.caption,
                  color: COLORS.text.tertiary,
                  textAlign: 'center',
                }}>
                  Add Photo
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </AnimatedView>
        
        <Text style={{
          ...TYPOGRAPHY.bodySmall,
          color: COLORS.text.secondary,
          marginTop: SPACING.sm,
          textAlign: 'center',
        }}>
          Tap to update profile picture
        </Text>
      </View>
    );
  };
  
  const renderSectionHeader = (section, isExpanded) => (
    <TouchableOpacity
      onPress={() => toggleSection(section.key)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        backgroundColor: COLORS.primary.100,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: isExpanded ? SPACING.md : SPACING.sm,
      }}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: 20,
          marginRight: SPACING.sm,
        }}>
          {section.icon}
        </Text>
        <Text style={{
          ...TYPOGRAPHY.h6,
          color: COLORS.primary.dark,
        }}>
          {section.title}
        </Text>
      </View>
      
      <Text style={{
        fontSize: 16,
        color: COLORS.primary.main,
        transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
      }}>
        ▶
      </Text>
    </TouchableOpacity>
  );
  
  const renderPersonalSection = (values, handleChange, handleBlur, errors, touched) => {
    const isExpanded = expandedSection === 'personal';
    
    return (
      <View style={{ marginBottom: SPACING.md }}>
        {renderSectionHeader(PROFILE_SECTIONS[0], isExpanded)}
        
        {isExpanded && (
          <View>
            <View style={{
              flexDirection: 'row',
              gap: SPACING.sm,
            }}>
              <Input
                label="First Name"
                placeholder="John"
                value={values.firstName}
                onChangeText={(text) => {
                  handleChange('firstName')(text);
                  setHasUnsavedChanges(true);
                }}
                onBlur={handleBlur('firstName')}
                errorMessage={touched.firstName ? errors.firstName : null}
                style={{ flex: 1 }}
              />
              
              <Input
                label="Last Name"
                placeholder="Doe"
                value={values.lastName}
                onChangeText={(text) => {
                  handleChange('lastName')(text);
                  setHasUnsavedChanges(true);
                }}
                onBlur={handleBlur('lastName')}
                errorMessage={touched.lastName ? errors.lastName : null}
                style={{ flex: 1 }}
              />
            </View>
            
            <Button
              title={`Date of Birth: ${values.dateOfBirth ? new Date(values.dateOfBirth).toLocaleDateString() : 'Select Date'}`}
              onPress={() => setDatePickerOpen(true)}
              variant="outline"
              style={{
                justifyContent: 'flex-start',
                marginBottom: SPACING.md,
              }}
              leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>📅</Text>}
            />
            
            <Text style={{
              ...TYPOGRAPHY.label,
              marginBottom: SPACING.sm,
            }}>
              Gender
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: SPACING.sm,
              marginBottom: SPACING.md,
            }}>
              {GENDERS.map((gender) => (
                <Button
                  key={gender}
                  title={gender}
                  variant={selectedGender === gender ? 'primary' : 'outline'}
                  size="small"
                  onPress={() => {
                    setSelectedGender(gender);
                    setHasUnsavedChanges(true);
                  }}
                />
              ))}
            </View>
            
            <Text style={{
              ...TYPOGRAPHY.label,
              marginBottom: SPACING.sm,
            }}>
              Blood Type
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
                  onPress={() => {
                    setSelectedBloodType(type);
                    setHasUnsavedChanges(true);
                  }}
                  style={{ minWidth: 60 }}
                />
              ))}
            </View>
            
            <View style={{
              flexDirection: 'row',
              gap: SPACING.sm,
            }}>
              <Input
                label="Height (inches)"
                placeholder="70"
                value={values.height?.toString()}
                onChangeText={(text) => {
                  handleChange('height')(parseFloat(text) || '');
                  setHasUnsavedChanges(true);
                }}
                onBlur={handleBlur('height')}
                keyboardType="numeric"
                errorMessage={touched.height ? errors.height : null}
                style={{ flex: 1 }}
              />
              
              <Input
                label="Weight (lbs)"
                placeholder="150"
                value={values.weight?.toString()}
                onChangeText={(text) => {
                  handleChange('weight')(parseFloat(text) || '');
                  setHasUnsavedChanges(true);
                }}
                onBlur={handleBlur('weight')}
                keyboardType="numeric"
                errorMessage={touched.weight ? errors.weight : null}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </View>
    );
  };
  
  const renderContactSection = (values, handleChange, handleBlur, errors, touched) => {
    const isExpanded = expandedSection === 'contact';
    
    return (
      <View style={{ marginBottom: SPACING.md }}>
        {renderSectionHeader(PROFILE_SECTIONS[1], isExpanded)}
        
        {isExpanded && (
          <View>
            <Input
              label="Email Address"
              placeholder="john.doe@example.com"
              value={values.email}
              onChangeText={(text) => {
                handleChange('email')(text);
                setHasUnsavedChanges(true);
              }}
              onBlur={handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              errorMessage={touched.email ? errors.email : null}
              leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>✉️</Text>}
            />
            
            <Input
              label="Phone Number"
              placeholder="+1 (555) 123-4567"
              value={values.phone}
              onChangeText={(text) => {
                handleChange('phone')(text);
                setHasUnsavedChanges(true);
              }}
              onBlur={handleBlur('phone')}
              keyboardType="phone-pad"
              errorMessage={touched.phone ? errors.phone : null}
              leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>📞</Text>}
            />
            
            <Input
              label="Address"
              placeholder="123 Main Street"
              value={values.address}
              onChangeText={(text) => {
                handleChange('address')(text);
                setHasUnsavedChanges(true);
              }}
              onBlur={handleBlur('address')}
              errorMessage={touched.address ? errors.address : null}
              leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>🏠</Text>}
            />
            
            <View style={{
              flexDirection: 'row',
              gap: SPACING.sm,
            }}>
              <Input
                label="City"
                placeholder="New York"
                value={values.city}
                onChangeText={(text) => {
                  handleChange('city')(text);
                  setHasUnsavedChanges(true);
                }}
                onBlur={handleBlur('city')}
                errorMessage={touched.city ? errors.city : null}
                style={{ flex: 2 }}
              />
              
              <Input
                label="ZIP Code"
                placeholder="10001"
                value={values.zipCode}
                onChangeText={(text) => {
                  handleChange('zipCode')(text);
                  setHasUnsavedChanges(true);
                }}
                onBlur={handleBlur('zipCode')}
                keyboardType="numeric"
                errorMessage={touched.zipCode ? errors.zipCode : null}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </View>
    );
  };
  
  const renderEmergencySection = (values, handleChange, handleBlur, errors, touched) => {
    const isExpanded = expandedSection === 'emergency';
    
    return (
      <View style={{ marginBottom: SPACING.md }}>
        {renderSectionHeader(PROFILE_SECTIONS[2], isExpanded)}
        
        {isExpanded && (
          <View>
            <Input
              label="Emergency Contact Name"
              placeholder="Jane Doe"
              value={values.emergencyContactName}
              onChangeText={(text) => {
                handleChange('emergencyContactName')(text);
                setHasUnsavedChanges(true);
              }}
              onBlur={handleBlur('emergencyContactName')}
              errorMessage={touched.emergencyContactName ? errors.emergencyContactName : null}
              leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>👤</Text>}
            />
            
            <Input
              label="Emergency Contact Phone"
              placeholder="+1 (555) 987-6543"
              value={values.emergencyContact}
              onChangeText={(text) => {
                handleChange('emergencyContact')(text);
                setHasUnsavedChanges(true);
              }}
              onBlur={handleBlur('emergencyContact')}
              keyboardType="phone-pad"
              errorMessage={touched.emergencyContact ? errors.emergencyContact : null}
              leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>🚨</Text>}
            />
            
            <Text style={{
              ...TYPOGRAPHY.label,
              marginBottom: SPACING.sm,
            }}>
              Relationship
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: SPACING.sm,
              marginBottom: SPACING.md,
            }}>
              {EMERGENCY_RELATIONS.map((relation) => (
                <Button
                  key={relation}
                  title={relation}
                  variant={selectedEmergencyRelation === relation ? 'primary' : 'outline'}
                  size="small"
                  onPress={() => {
                    setSelectedEmergencyRelation(relation);
                    setHasUnsavedChanges(true);
                  }}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };
  
  const renderMedicalSection = (values, handleChange, handleBlur, errors, touched) => {
    const isExpanded = expandedSection === 'medical';
    
    return (
      <View style={{ marginBottom: SPACING.md }}>
        {renderSectionHeader(PROFILE_SECTIONS[3], isExpanded)}
        
        {isExpanded && (
          <View>
            <Input
              label="Allergies"
              placeholder="List any known allergies..."
              value={values.allergies}
              onChangeText={(text) => {
                handleChange('allergies')(text);
                setHasUnsavedChanges(true);
              }}
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
              onChangeText={(text) => {
                handleChange('currentMedications')(text);
                setHasUnsavedChanges(true);
              }}
              onBlur={handleBlur('currentMedications')}
              multiline
              numberOfLines={4}
              errorMessage={touched.currentMedications ? errors.currentMedications : null}
              helper="Include prescription and over-the-counter medications"
            />
            
            <Input
              label="Medical Conditions"
              placeholder="List any chronic conditions or medical history..."
              value={values.medicalConditions}
              onChangeText={(text) => {
                handleChange('medicalConditions')(text);
                setHasUnsavedChanges(true);
              }}
              onBlur={handleBlur('medicalConditions')}
              multiline
              numberOfLines={4}
              errorMessage={touched.medicalConditions ? errors.medicalConditions : null}
              helper="Include diagnoses, surgeries, and relevant medical history"
            />
          </View>
        )}
      </View>
    );
  };
  
  const renderInsuranceSection = (values, handleChange, handleBlur, errors, touched) => {
    if (!showInsuranceSection) return null;
    
    const isExpanded = expandedSection === 'insurance';
    
    return (
      <View style={{ marginBottom: SPACING.md }}>
        {renderSectionHeader(PROFILE_SECTIONS[4], isExpanded)}
        
        {isExpanded && (
          <View>
            <Input
              label="Insurance Provider"
              placeholder="Blue Cross Blue Shield"
              value={values.insuranceProvider}
              onChangeText={(text) => {
                handleChange('insuranceProvider')(text);
                setHasUnsavedChanges(true);
              }}
              onBlur={handleBlur('insuranceProvider')}
              errorMessage={touched.insuranceProvider ? errors.insuranceProvider : null}
              leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>🛡️</Text>}
            />
            
            <Input
              label="Policy Number"
              placeholder="Enter your policy number"
              value={values.insurancePolicyNumber}
              onChangeText={(text) => {
                handleChange('insurancePolicyNumber')(text);
                setHasUnsavedChanges(true);
              }}
              onBlur={handleBlur('insurancePolicyNumber')}
              errorMessage={touched.insurancePolicyNumber ? errors.insurancePolicyNumber : null}
              leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>🆔</Text>}
            />
          </View>
        )}
      </View>
    );
  };
  
  // Default values with proper initialization
  const getInitialValues = () => ({
    firstName: initialValues.firstName || '',
    lastName: initialValues.lastName || '',
    email: initialValues.email || '',
    phone: initialValues.phone || '',
    dateOfBirth: initialValues.dateOfBirth || null,
    address: initialValues.address || '',
    city: initialValues.city || '',
    zipCode: initialValues.zipCode || '',
    emergencyContact: initialValues.emergencyContact || '',
    emergencyContactName: initialValues.emergencyContactName || '',
    emergencyContactRelation: initialValues.emergencyContactRelation || '',
    height: initialValues.height || '',
    weight: initialValues.weight || '',
    allergies: initialValues.allergies || '',
    currentMedications: initialValues.currentMedications || '',
    medicalConditions: initialValues.medicalConditions || '',
    insuranceProvider: initialValues.insuranceProvider || '',
    insurancePolicyNumber: initialValues.insurancePolicyNumber || '',
  });
  
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
    },
    style,
  ];
  
  return (
    <AnimatedView style={[containerStyleComputed, containerAnimatedStyle]} testID={testID}>
      <AnimatedScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={formStyleComputed}>
          {/* Header */}
          <View style={{
            alignItems: 'center',
            marginBottom: SPACING.xl,
          }}>
            <Text style={{
              ...TYPOGRAPHY.h2,
              textAlign: 'center',
              marginBottom: SPACING.sm,
            }}>
              {editMode ? 'Edit Profile' : 'Profile'}
            </Text>
            
            <Text style={{
              ...TYPOGRAPHY.bodyMedium,
              color: COLORS.text.secondary,
              textAlign: 'center',
              maxWidth: 280,
            }}>
              {editMode ? 'Update your personal and medical information' : 'Your health profile information'}
            </Text>
          </View>
          
          {/* Profile Image */}
          {renderProfileImage()}
          
          {/* Unsaved Changes Indicator */}
          {hasUnsavedChanges && (
            <StatusPill
              status="warning"
              text="Unsaved Changes"
              size="small"
              style={{
                alignSelf: 'center',
                marginBottom: SPACING.lg,
              }}
            />
          )}
          
          {/* Profile Form */}
          <Formik
            ref={formikRef}
            initialValues={getInitialValues()}
            validationSchema={profileSchema}
            onSubmit={handleSubmit}
            enableReinitialize
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
                {/* Form Sections */}
                {renderPersonalSection(values, handleChange, handleBlur, errors, touched)}
                {renderContactSection(values, handleChange, handleBlur, errors, touched)}
                {renderEmergencySection(values, handleChange, handleBlur, errors, touched)}
                {renderMedicalSection(values, handleChange, handleBlur, errors, touched)}
                {renderInsuranceSection(values, handleChange, handleBlur, errors, touched)}
                
                {/* Action Buttons */}
                {editMode && (
                  <View style={{
                    flexDirection: 'row',
                    gap: SPACING.sm,
                    marginTop: SPACING.xl,
                    marginBottom: SPACING.lg,
                  }}>
                    <Button
                      title="Cancel"
                      onPress={() => {
                        if (hasUnsavedChanges) {
                          Alert.alert(
                            'Unsaved Changes',
                            'You have unsaved changes. Are you sure you want to cancel?',
                            [
                              { text: 'Keep Editing', style: 'cancel' },
                              { text: 'Discard Changes', onPress: onCancel, style: 'destructive' },
                            ]
                          );
                        } else {
                          onCancel?.();
                        }
                      }}
                      variant="outline"
                      style={{ flex: 1 }}
                    />
                    
                    <Button
                      title="Save Changes"
                      onPress={formikSubmit}
                      loading={isSubmitting || saving}
                      disabled={isSubmitting || saving}
                      variant="primary"
                      style={{ flex: 1 }}
                    />
                  </View>
                )}
                
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
        </View>
      </AnimatedScrollView>
      
      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={datePickerOpen}
        date={initialValues.dateOfBirth ? new Date(initialValues.dateOfBirth) : new Date()}
        mode="date"
        maximumDate={new Date()}
        minimumDate={new Date('1900-01-01')}
        onConfirm={(date) => {
          setDatePickerOpen(false);
          if (formikRef.current) {
            formikRef.current.setFieldValue('dateOfBirth', date);
            setHasUnsavedChanges(true);
          }
        }}
        onCancel={() => setDatePickerOpen(false)}
      />
      
      {/* Loading Overlay */}
      {(loading || saving) && (
        <LoadingSpinner
          variant="overlay"
          message={loading ? "Loading profile..." : "Saving changes..."}
          overlay
        />
      )}
    </AnimatedView>
  );
};

export default ProfileForm;