/**
 * MediAssist App - AppointmentForm Component
 * Comprehensive appointment scheduling and management form
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Formik } from 'formik';
import * as Yup from 'yup';
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
import { SPACING, BORDER_RADIUS } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Validation schema
const appointmentSchema = Yup.object().shape({
  doctorName: Yup.string()
    .min(2, 'Doctor name must be at least 2 characters')
    .max(100, 'Doctor name must be less than 100 characters')
    .required('Doctor name is required'),
  specialty: Yup.string()
    .max(100, 'Specialty must be less than 100 characters'),
  clinic: Yup.string()
    .max(100, 'Clinic/Hospital name must be less than 100 characters'),
  address: Yup.string()
    .max(200, 'Address must be less than 200 characters'),
  phone: Yup.string()
    .matches(/^[+]?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid phone number'),
  reasonForVisit: Yup.string()
    .min(5, 'Reason for visit must be at least 5 characters')
    .max(300, 'Reason for visit must be less than 300 characters')
    .required('Reason for visit is required'),
  notes: Yup.string()
    .max(500, 'Notes must be less than 500 characters'),
  insuranceProvider: Yup.string()
    .max(100, 'Insurance provider must be less than 100 characters'),
  copayAmount: Yup.number()
    .min(0, 'Copay cannot be negative')
    .max(10000, 'Copay amount seems too high'),
});

// Constants
const APPOINTMENT_TYPES = [
  { value: 'routine_checkup', label: 'Routine Checkup', icon: '👩‍⚕️' },
  { value: 'follow_up', label: 'Follow-up', icon: '🔄' },
  { value: 'consultation', label: 'Consultation', icon: '💬' },
  { value: 'procedure', label: 'Procedure', icon: '🏥' },
  { value: 'lab_work', label: 'Lab Work', icon: '🧪' },
  { value: 'imaging', label: 'Imaging', icon: '📷' },
  { value: 'emergency', label: 'Emergency', icon: '🚨' },
  { value: 'telehealth', label: 'Telehealth', icon: '💻' },
];

const MEDICAL_SPECIALTIES = [
  'General Practice', 'Cardiology', 'Dermatology', 'Endocrinology',
  'Gastroenterology', 'Neurology', 'Oncology', 'Orthopedics',
  'Psychiatry', 'Pulmonology', 'Urology', 'Gynecology',
  'Ophthalmology', 'ENT', 'Pediatrics', 'Dentistry',
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

const REMINDER_OPTIONS = [
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
  { value: 2880, label: '2 days before' },
  { value: 10080, label: '1 week before' },
];

const AppointmentForm = ({
  // Appointment data
  initialValues = {},
  onSave,
  onCancel,
  onDelete,
  
  // State props
  loading = false,
  saving = false,
  error,
  
  // Mode props
  editMode = false,
  
  // Feature props
  enableReminders = true,
  enableInsurance = true,
  enableTelehealth = true,
  
  // Animation props
  animateOnMount = true,
  
  // Custom styles
  style,
  containerStyle,
  
  // Test props
  testID,
}) => {
  // State
  const [selectedType, setSelectedType] = useState(initialValues.type || 'routine_checkup');
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialValues.specialty || '');
  const [selectedDuration, setSelectedDuration] = useState(initialValues.duration || 30);
  const [selectedReminder, setSelectedReminder] = useState(initialValues.reminderMinutes || 60);
  const [reminderEnabled, setReminderEnabled] = useState(initialValues.reminderEnabled !== false);
  const [dateTimePickerOpen, setDateTimePickerOpen] = useState(false);
  const [isRecurring, setIsRecurring] = useState(initialValues.isRecurring || false);
  const [transportationNeeded, setTransportationNeeded] = useState(initialValues.transportationNeeded || false);
  const [fastingRequired, setFastingRequired] = useState(initialValues.fastingRequired || false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Animation values
  const containerOpacity = useSharedValue(animateOnMount ? 0 : 1);
  const containerTranslateY = useSharedValue(animateOnMount ? 30 : 0);
  
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
      
      const appointmentData = {
        ...values,
        type: selectedType,
        specialty: selectedSpecialty,
        duration: selectedDuration,
        reminderMinutes: reminderEnabled ? selectedReminder : null,
        reminderEnabled,
        isRecurring,
        transportationNeeded,
        fastingRequired,
        status: editMode ? values.status : 'scheduled',
        updatedAt: new Date().toISOString(),
        ...(editMode ? {} : { createdAt: new Date().toISOString() }),
      };
      
      await onSave?.(appointmentData);
      setHasUnsavedChanges(false);
      
    } catch (error) {
      if (error.field) {
        setFieldError(error.field, error.message);
      } else {
        Alert.alert('Save Failed', error.message || 'Unable to save appointment. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle appointment deletion
  const handleDelete = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment? This action cannot be undone.',
      [
        { text: 'Keep Appointment', style: 'cancel' },
        {
          text: 'Cancel Appointment',
          style: 'destructive',
          onPress: () => onDelete?.(),
        },
      ]
    );
  };
  
  // Calculate appointment end time
  const getEndTime = (startDateTime) => {
    if (!startDateTime) return null;
    const endTime = new Date(startDateTime);
    endTime.setMinutes(endTime.getMinutes() + selectedDuration);
    return endTime;
  };
  
  // Check for appointment conflicts
  const checkForConflicts = (dateTime) => {
    // This would typically check against existing appointments
    // For now, just show a warning for past dates
    if (dateTime < new Date()) {
      Alert.alert(
        'Past Date Selected',
        'You\'ve selected a date and time in the past. Please choose a future appointment time.'
      );
      return false;
    }
    return true;
  };
  
  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));
  
  // Render functions
  const renderAppointmentTypeSelector = () => (
    <View style={{ marginBottom: SPACING.lg }}>
      <Text style={{
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.sm,
      }}>
        Appointment Type
      </Text>
      
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
      }}>
        {APPOINTMENT_TYPES.map((type) => (
          <Button
            key={type.value}
            title={`${type.icon} ${type.label}`}
            variant={selectedType === type.value ? 'primary' : 'outline'}
            size="small"
            onPress={() => {
              setSelectedType(type.value);
              setHasUnsavedChanges(true);
            }}
            style={{ 
              minWidth: 120,
              ...(type.value === 'emergency' && { borderColor: COLORS.status.error.main }),
            }}
          />
        ))}
      </View>
    </View>
  );
  
  const renderDoctorSection = (values, handleChange, handleBlur, errors, touched) => (
    <Card variant="outlined" style={{ marginBottom: SPACING.lg }}>
      <Text style={{
        ...TYPOGRAPHY.h6,
        marginBottom: SPACING.md,
        color: COLORS.medical.appointment.scheduled,
      }}>
        👨‍⚕️ Healthcare Provider
      </Text>
      
      <Input
        label="Doctor/Provider Name"
        placeholder="Dr. Sarah Johnson"
        value={values.doctorName}
        onChangeText={(text) => {
          handleChange('doctorName')(text);
          setHasUnsavedChanges(true);
        }}
        onBlur={handleBlur('doctorName')}
        errorMessage={touched.doctorName ? errors.doctorName : null}
        leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>👨‍⚕️</Text>}
      />
      
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            'Select Specialty',
            'Choose the medical specialty',
            MEDICAL_SPECIALTIES.map(specialty => ({
              text: specialty,
              onPress: () => {
                setSelectedSpecialty(specialty);
                setHasUnsavedChanges(true);
              },
            }))
          );
        }}
        style={{
          borderWidth: 1,
          borderColor: COLORS.border.medium,
          borderRadius: BORDER_RADIUS.input,
          padding: SPACING.md,
          backgroundColor: COLORS.background.surface,
          marginBottom: SPACING.md,
        }}
      >
        <Text style={{
          ...TYPOGRAPHY.label,
          color: COLORS.text.secondary,
          marginBottom: SPACING.xs,
        }}>
          Specialty
        </Text>
        <Text style={{
          ...TYPOGRAPHY.bodyMedium,
          color: selectedSpecialty ? COLORS.text.primary : COLORS.text.tertiary,
        }}>
          {selectedSpecialty || 'Select specialty'}
        </Text>
      </TouchableOpacity>
      
      <Input
        label="Clinic/Hospital"
        placeholder="City Medical Center"
        value={values.clinic}
        onChangeText={(text) => {
          handleChange('clinic')(text);
          setHasUnsavedChanges(true);
        }}
        onBlur={handleBlur('clinic')}
        errorMessage={touched.clinic ? errors.clinic : null}
        leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>🏥</Text>}
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
        placeholder="123 Medical Drive, City, State 12345"
        value={values.address}
        onChangeText={(text) => {
          handleChange('address')(text);
          setHasUnsavedChanges(true);
        }}
        onBlur={handleBlur('address')}
        multiline
        numberOfLines={2}
        errorMessage={touched.address ? errors.address : null}
        leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>📍</Text>}
      />
    </Card>
  );
  
  const renderDateTimeSection = (values, handleChange) => (
    <Card variant="outlined" style={{ marginBottom: SPACING.lg }}>
      <Text style={{
        ...TYPOGRAPHY.h6,
        marginBottom: SPACING.md,
        color: COLORS.medical.appointment.scheduled,
      }}>
        📅 Date & Time
      </Text>
      
      <TouchableOpacity
        onPress={() => setDateTimePickerOpen(true)}
        style={{
          borderWidth: 1,
          borderColor: COLORS.border.medium,
          borderRadius: BORDER_RADIUS.input,
          padding: SPACING.md,
          backgroundColor: COLORS.background.surface,
          marginBottom: SPACING.md,
        }}
      >
        <Text style={{
          ...TYPOGRAPHY.label,
          color: COLORS.text.secondary,
          marginBottom: SPACING.xs,
        }}>
          Appointment Date & Time
        </Text>
        <Text style={{
          ...TYPOGRAPHY.bodyMedium,
          color: values.dateTime ? COLORS.text.primary : COLORS.text.tertiary,
        }}>
          {values.dateTime 
            ? new Date(values.dateTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Select date and time'
          }
        </Text>
      </TouchableOpacity>
      
      <Text style={{
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.sm,
      }}>
        Duration
      </Text>
      
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
      }}>
        {DURATION_OPTIONS.map((option) => (
          <Button
            key={option.value}
            title={option.label}
            variant={selectedDuration === option.value ? 'primary' : 'outline'}
            size="small"
            onPress={() => {
              setSelectedDuration(option.value);
              setHasUnsavedChanges(true);
            }}
          />
        ))}
      </View>
      
      {values.dateTime && (
        <View style={{
          backgroundColor: COLORS.primary.100,
          padding: SPACING.md,
          borderRadius: BORDER_RADIUS.md,
        }}>
          <Text style={{
            ...TYPOGRAPHY.bodySmall,
            color: COLORS.primary.dark,
            marginBottom: SPACING.xs,
          }}>
            Estimated end time:
          </Text>
          <Text style={{
            ...TYPOGRAPHY.bodyMedium,
            fontWeight: '600',
            color: COLORS.primary.main,
          }}>
            {getEndTime(values.dateTime)?.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      )}
    </Card>
  );
  
  const renderAppointmentDetails = (values, handleChange, handleBlur, errors, touched) => (
    <Card variant="outlined" style={{ marginBottom: SPACING.lg }}>
      <Text style={{
        ...TYPOGRAPHY.h6,
        marginBottom: SPACING.md,
        color: COLORS.medical.appointment.scheduled,
      }}>
        📝 Appointment Details
      </Text>
      
      <Input
        label="Reason for Visit"
        placeholder="Annual physical, follow-up on blood pressure, etc."
        value={values.reasonForVisit}
        onChangeText={(text) => {
          handleChange('reasonForVisit')(text);
          setHasUnsavedChanges(true);
        }}
        onBlur={handleBlur('reasonForVisit')}
        multiline
        numberOfLines={3}
        errorMessage={touched.reasonForVisit ? errors.reasonForVisit : null}
        helper="Describe the main purpose of this appointment"
      />
      
      <Input
        label="Additional Notes"
        placeholder="Questions to ask, symptoms to discuss, etc."
        value={values.notes}
        onChangeText={(text) => {
          handleChange('notes')(text);
          setHasUnsavedChanges(true);
        }}
        onBlur={handleBlur('notes')}
        multiline
        numberOfLines={3}
        errorMessage={touched.notes ? errors.notes : null}
        helper="Any additional information for the appointment"
      />
      
      {/* Special Instructions */}
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
        marginTop: SPACING.md,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Switch
            value={fastingRequired}
            onValueChange={(value) => {
              setFastingRequired(value);
              setHasUnsavedChanges(true);
            }}
            trackColor={{
              false: COLORS.neutral.gray[300],
              true: COLORS.status.warning.light,
            }}
            thumbColor={fastingRequired ? COLORS.status.warning.main : COLORS.neutral.gray[400]}
          />
          <Text style={{
            ...TYPOGRAPHY.bodySmall,
            marginLeft: SPACING.sm,
          }}>
            Fasting required
          </Text>
        </View>
        
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Switch
            value={transportationNeeded}
            onValueChange={(value) => {
              setTransportationNeeded(value);
              setHasUnsavedChanges(true);
            }}
            trackColor={{
              false: COLORS.neutral.gray[300],
              true: COLORS.primary.light,
            }}
            thumbColor={transportationNeeded ? COLORS.primary.main : COLORS.neutral.gray[400]}
          />
          <Text style={{
            ...TYPOGRAPHY.bodySmall,
            marginLeft: SPACING.sm,
          }}>
            Transportation needed
          </Text>
        </View>
      </View>
    </Card>
  );
  
  const renderInsuranceSection = (values, handleChange, handleBlur, errors, touched) => {
    if (!enableInsurance) return null;
    
    return (
      <Card variant="outlined" style={{ marginBottom: SPACING.lg }}>
        <Text style={{
          ...TYPOGRAPHY.h6,
          marginBottom: SPACING.md,
          color: COLORS.medical.appointment.scheduled,
        }}>
          🛡️ Insurance & Payment
        </Text>
        
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
          label="Expected Copay ($)"
          placeholder="25.00"
          value={values.copayAmount?.toString()}
          onChangeText={(text) => {
            handleChange('copayAmount')(parseFloat(text) || 0);
            setHasUnsavedChanges(true);
          }}
          onBlur={handleBlur('copayAmount')}
          keyboardType="numeric"
          errorMessage={touched.copayAmount ? errors.copayAmount : null}
          leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>💰</Text>}
        />
      </Card>
    );
  };
  
  const renderReminderSection = () => {
    if (!enableReminders) return null;
    
    return (
      <Card variant="outlined" style={{ marginBottom: SPACING.lg }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: SPACING.md,
        }}>
          <Text style={{
            ...TYPOGRAPHY.h6,
            color: COLORS.medical.appointment.scheduled,
          }}>
            ⏰ Reminders
          </Text>
          
          <Switch
            value={reminderEnabled}
            onValueChange={(value) => {
              setReminderEnabled(value);
              setHasUnsavedChanges(true);
            }}
            trackColor={{
              false: COLORS.neutral.gray[300],
              true: COLORS.primary.light,
            }}
            thumbColor={reminderEnabled ? COLORS.primary.main : COLORS.neutral.gray[400]}
          />
        </View>
        
        {reminderEnabled && (
          <View>
            <Text style={{
              ...TYPOGRAPHY.bodySmall,
              color: COLORS.text.secondary,
              marginBottom: SPACING.md,
            }}>
              When should we remind you about this appointment?
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: SPACING.sm,
            }}>
              {REMINDER_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  title={option.label}
                  variant={selectedReminder === option.value ? 'primary' : 'outline'}
                  size="small"
                  onPress={() => {
                    setSelectedReminder(option.value);
                    setHasUnsavedChanges(true);
                  }}
                />
              ))}
            </View>
          </View>
        )}
      </Card>
    );
  };
  
  const renderRecurringSection = () => (
    <Card variant="outlined" style={{ marginBottom: SPACING.lg }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
      }}>
        <Text style={{
          ...TYPOGRAPHY.h6,
          color: COLORS.medical.appointment.scheduled,
        }}>
          🔄 Recurring Appointment
        </Text>
        
        <Switch
          value={isRecurring}
          onValueChange={(value) => {
            setIsRecurring(value);
            setHasUnsavedChanges(true);
          }}
          trackColor={{
            false: COLORS.neutral.gray[300],
            true: COLORS.secondary.light,
          }}
          thumbColor={isRecurring ? COLORS.secondary.main : COLORS.neutral.gray[400]}
        />
      </View>
      
      {isRecurring && (
        <Text style={{
          ...TYPOGRAPHY.bodySmall,
          color: COLORS.text.secondary,
          fontStyle: 'italic',
        }}>
          Recurring appointment settings can be configured after saving
        </Text>
      )}
    </Card>
  );
  
  // Default values
  const getInitialValues = () => ({
    doctorName: initialValues.doctorName || '',
    specialty: initialValues.specialty || '',
    clinic: initialValues.clinic || '',
    address: initialValues.address || '',
    phone: initialValues.phone || '',
    reasonForVisit: initialValues.reasonForVisit || '',
    notes: initialValues.notes || '',
    insuranceProvider: initialValues.insuranceProvider || '',
    copayAmount: initialValues.copayAmount || 0,
    dateTime: initialValues.dateTime || null,
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
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: COLORS.medical.appointment.scheduled + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: SPACING.lg,
              ...SHADOWS.small,
            }}>
              <Text style={{ fontSize: 32 }}>📅</Text>
            </View>
            
            <Text style={{
              ...TYPOGRAPHY.h2,
              textAlign: 'center',
              marginBottom: SPACING.sm,
            }}>
              {editMode ? 'Edit Appointment' : 'Schedule Appointment'}
            </Text>
            
            <Text style={{
              ...TYPOGRAPHY.bodyMedium,
              color: COLORS.text.secondary,
              textAlign: 'center',
              maxWidth: 280,
            }}>
              {editMode ? 'Update your appointment details' : 'Schedule a new medical appointment'}
            </Text>
          </View>
          
          {/* Status Indicator for Edit Mode */}
          {editMode && initialValues.status && (
            <StatusPill
              status={initialValues.status === 'confirmed' ? 'confirmed' : 'scheduled'}
              text={initialValues.status?.toUpperCase()}
              size="medium"
              style={{
                alignSelf: 'center',
                marginBottom: SPACING.lg,
              }}
            />
          )}
          
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
          
          {/* Appointment Form */}
          <Formik
            ref={formikRef}
            initialValues={getInitialValues()}
            validationSchema={appointmentSchema}
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
                {/* Appointment Type */}
                {renderAppointmentTypeSelector()}
                
                {/* Doctor/Provider Information */}
                {renderDoctorSection(values, handleChange, handleBlur, errors, touched)}
                
                {/* Date & Time */}
                {renderDateTimeSection(values, handleChange)}
                
                {/* Appointment Details */}
                {renderAppointmentDetails(values, handleChange, handleBlur, errors, touched)}
                
                {/* Insurance Section */}
                {renderInsuranceSection(values, handleChange, handleBlur, errors, touched)}
                
                {/* Reminders */}
                {renderReminderSection()}
                
                {/* Recurring Appointment */}
                {renderRecurringSection()}
                
                {/* Action Buttons */}
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
                    title={editMode ? 'Save Changes' : 'Schedule Appointment'}
                    onPress={() => {
                      if (values.dateTime && checkForConflicts(values.dateTime)) {
                        formikSubmit();
                      }
                    }}
                    loading={isSubmitting || saving}
                    disabled={isSubmitting || saving || !values.dateTime}
                    variant="primary"
                    style={{ flex: 2 }}
                  />
                </View>
                
                {/* Cancel Appointment Button (Edit Mode Only) */}
                {editMode && onDelete && (
                  <Button
                    title="Cancel Appointment"
                    onPress={handleDelete}
                    variant="error"
                    size="small"
                    style={{
                      alignSelf: 'center',
                      marginBottom: SPACING.md,
                    }}
                  />
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
      
      {/* Date Time Picker */}
      <DatePicker
        modal
        open={dateTimePickerOpen}
        date={initialValues.dateTime ? new Date(initialValues.dateTime) : new Date()}
        mode="datetime"
        minimumDate={new Date()}
        onConfirm={(dateTime) => {
          setDateTimePickerOpen(false);
          if (checkForConflicts(dateTime) && formikRef.current) {
            formikRef.current.setFieldValue('dateTime', dateTime);
            setHasUnsavedChanges(true);
          }
        }}
        onCancel={() => setDateTimePickerOpen(false)}
      />
      
      {/* Loading Overlay */}
      {(loading || saving) && (
        <LoadingSpinner
          variant="overlay"
          message={loading ? "Loading appointment..." : "Saving appointment..."}
          overlay
        />
      )}
    </AnimatedView>
  );
};

export default AppointmentForm;