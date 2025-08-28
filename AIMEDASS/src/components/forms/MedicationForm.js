/**
 * MediAssist App - MedicationForm Component
 * Comprehensive medication management form with reminders and interactions
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
const medicationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Medication name must be at least 2 characters')
    .max(100, 'Medication name must be less than 100 characters')
    .required('Medication name is required'),
  dosage: Yup.string()
    .required('Dosage is required')
    .matches(/^[\d\.]+ ?(mg|g|ml|units?|tablets?|capsules?|drops?|sprays?|puffs?)$/i, 'Enter valid dosage (e.g., 10 mg, 1 tablet)'),
  frequency: Yup.string()
    .required('Frequency is required'),
  instructions: Yup.string()
    .max(500, 'Instructions must be less than 500 characters'),
  prescribingDoctor: Yup.string()
    .max(100, 'Doctor name must be less than 100 characters'),
  pharmacy: Yup.string()
    .max(100, 'Pharmacy name must be less than 100 characters'),
  notes: Yup.string()
    .max(300, 'Notes must be less than 300 characters'),
  refillsRemaining: Yup.number()
    .min(0, 'Refills cannot be negative')
    .max(99, 'Refills cannot exceed 99'),
  cost: Yup.number()
    .min(0, 'Cost cannot be negative'),
});

// Constants
const MEDICATION_TYPES = [
  { value: 'prescription', label: 'Prescription', icon: '💊' },
  { value: 'otc', label: 'Over-the-Counter', icon: '🏪' },
  { value: 'supplement', label: 'Supplement', icon: '🌿' },
  { value: 'herbal', label: 'Herbal', icon: '🌱' },
];

const FREQUENCY_OPTIONS = [
  { value: 'once_daily', label: 'Once Daily', times: 1 },
  { value: 'twice_daily', label: 'Twice Daily', times: 2 },
  { value: 'three_times_daily', label: 'Three Times Daily', times: 3 },
  { value: 'four_times_daily', label: 'Four Times Daily', times: 4 },
  { value: 'every_6_hours', label: 'Every 6 Hours', times: 4 },
  { value: 'every_8_hours', label: 'Every 8 Hours', times: 3 },
  { value: 'every_12_hours', label: 'Every 12 Hours', times: 2 },
  { value: 'as_needed', label: 'As Needed', times: 0 },
  { value: 'custom', label: 'Custom Schedule', times: 0 },
];

const DOSAGE_FORMS = [
  'Tablet', 'Capsule', 'Liquid', 'Injection', 'Inhaler', 
  'Cream', 'Ointment', 'Drop', 'Patch', 'Spray', 'Powder'
];

const MedicationForm = ({
  // Medication data
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
  enableInteractionCheck = true,
  enableCostTracking = true,
  
  // Animation props
  animateOnMount = true,
  
  // Custom styles
  style,
  containerStyle,
  
  // Test props
  testID,
}) => {
  // State
  const [selectedType, setSelectedType] = useState(initialValues.type || 'prescription');
  const [selectedFrequency, setSelectedFrequency] = useState(initialValues.frequency || 'once_daily');
  const [selectedDosageForm, setSelectedDosageForm] = useState(initialValues.dosageForm || 'Tablet');
  const [reminderTimes, setReminderTimes] = useState(initialValues.reminderTimes || ['09:00']);
  const [remindersEnabled, setRemindersEnabled] = useState(initialValues.remindersEnabled !== false);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [foodInstructions, setFoodInstructions] = useState(initialValues.foodInstructions || 'no_preference');
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
  
  // Update reminder times when frequency changes
  useEffect(() => {
    const frequencyOption = FREQUENCY_OPTIONS.find(f => f.value === selectedFrequency);
    if (frequencyOption && frequencyOption.times > 0) {
      const newTimes = [];
      const interval = 24 / frequencyOption.times;
      
      for (let i = 0; i < frequencyOption.times; i++) {
        const hour = Math.floor(9 + (i * interval)); // Start at 9 AM
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        newTimes.push(timeString);
      }
      
      setReminderTimes(newTimes);
      setHasUnsavedChanges(true);
    }
  }, [selectedFrequency]);
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setSubmitting(true);
      
      const medicationData = {
        ...values,
        type: selectedType,
        frequency: selectedFrequency,
        dosageForm: selectedDosageForm,
        reminderTimes: remindersEnabled ? reminderTimes : [],
        remindersEnabled,
        foodInstructions,
        updatedAt: new Date().toISOString(),
        ...(editMode ? {} : { createdAt: new Date().toISOString() }),
      };
      
      await onSave?.(medicationData);
      setHasUnsavedChanges(false);
      
    } catch (error) {
      if (error.field) {
        setFieldError(error.field, error.message);
      } else {
        Alert.alert('Save Failed', error.message || 'Unable to save medication. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle medication deletion
  const handleDelete = () => {
    Alert.alert(
      'Delete Medication',
      'Are you sure you want to delete this medication? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(),
        },
      ]
    );
  };
  
  // Handle reminder time changes
  const addReminderTime = () => {
    const newTime = '12:00'; // Default time
    setReminderTimes([...reminderTimes, newTime]);
    setHasUnsavedChanges(true);
  };
  
  const removeReminderTime = (index) => {
    const newTimes = reminderTimes.filter((_, i) => i !== index);
    setReminderTimes(newTimes);
    setHasUnsavedChanges(true);
  };
  
  const updateReminderTime = (index, time) => {
    const newTimes = [...reminderTimes];
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    newTimes[index] = `${hours}:${minutes}`;
    setReminderTimes(newTimes);
    setHasUnsavedChanges(true);
  };
  
  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));
  
  // Render functions
  const renderMedicationTypeSelector = () => (
    <View style={{ marginBottom: SPACING.lg }}>
      <Text style={{
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.sm,
      }}>
        Medication Type
      </Text>
      
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
      }}>
        {MEDICATION_TYPES.map((type) => (
          <Button
            key={type.value}
            title={`${type.icon} ${type.label}`}
            variant={selectedType === type.value ? 'primary' : 'outline'}
            size="small"
            onPress={() => {
              setSelectedType(type.value);
              setHasUnsavedChanges(true);
            }}
            style={{ flex: 1, minWidth: 120 }}
          />
        ))}
      </View>
    </View>
  );
  
  const renderDosageSection = (values, handleChange, handleBlur, errors, touched) => (
    <Card variant="outlined" style={{ marginBottom: SPACING.lg }}>
      <Text style={{
        ...TYPOGRAPHY.h6,
        marginBottom: SPACING.md,
        color: COLORS.medical.medication.prescription,
      }}>
        💊 Dosage Information
      </Text>
      
      <View style={{
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
      }}>
        <Input
          label="Dosage Amount"
          placeholder="10 mg"
          value={values.dosage}
          onChangeText={(text) => {
            handleChange('dosage')(text);
            setHasUnsavedChanges(true);
          }}
          onBlur={handleBlur('dosage')}
          errorMessage={touched.dosage ? errors.dosage : null}
          style={{ flex: 2 }}
          helper="e.g., 10 mg, 1 tablet, 5 ml"
        />
        
        <View style={{ flex: 1 }}>
          <Text style={{
            ...TYPOGRAPHY.label,
            marginBottom: SPACING.sm,
          }}>
            Form
          </Text>
          <TouchableOpacity
            onPress={() => {
              // Show dosage form picker
              Alert.alert(
                'Select Dosage Form',
                '',
                DOSAGE_FORMS.map(form => ({
                  text: form,
                  onPress: () => {
                    setSelectedDosageForm(form);
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
              justifyContent: 'center',
            }}
          >
            <Text style={{
              ...TYPOGRAPHY.bodyMedium,
              color: COLORS.text.primary,
            }}>
              {selectedDosageForm}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={{
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.sm,
      }}>
        Frequency
      </Text>
      
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.xs,
        marginBottom: SPACING.md,
      }}>
        {FREQUENCY_OPTIONS.map((freq) => (
          <Button
            key={freq.value}
            title={freq.label}
            variant={selectedFrequency === freq.value ? 'primary' : 'outline'}
            size="small"
            onPress={() => {
              setSelectedFrequency(freq.value);
              setHasUnsavedChanges(true);
            }}
            style={{ minWidth: 100 }}
          />
        ))}
      </View>
      
      <Input
        label="Special Instructions"
        placeholder="Take with food, avoid alcohol, etc."
        value={values.instructions}
        onChangeText={(text) => {
          handleChange('instructions')(text);
          setHasUnsavedChanges(true);
        }}
        onBlur={handleBlur('instructions')}
        multiline
        numberOfLines={2}
        errorMessage={touched.instructions ? errors.instructions : null}
      />
    </Card>
  );
  
  const renderFoodInstructions = () => (
    <View style={{ marginBottom: SPACING.lg }}>
      <Text style={{
        ...TYPOGRAPHY.label,
        marginBottom: SPACING.sm,
      }}>
        Food Instructions
      </Text>
      
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
      }}>
        {[
          { value: 'with_food', label: 'With Food', icon: '🍽️' },
          { value: 'without_food', label: 'Empty Stomach', icon: '⭕' },
          { value: 'no_preference', label: 'No Preference', icon: '✅' },
        ].map((option) => (
          <Button
            key={option.value}
            title={`${option.icon} ${option.label}`}
            variant={foodInstructions === option.value ? 'primary' : 'outline'}
            size="small"
            onPress={() => {
              setFoodInstructions(option.value);
              setHasUnsavedChanges(true);
            }}
            style={{ flex: 1 }}
          />
        ))}
      </View>
    </View>
  );
  
  const renderRemindersSection = () => {
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
            color: COLORS.medical.medication.prescription,
          }}>
            ⏰ Reminders
          </Text>
          
          <Switch
            value={remindersEnabled}
            onValueChange={(value) => {
              setRemindersEnabled(value);
              setHasUnsavedChanges(true);
            }}
            trackColor={{
              false: COLORS.neutral.gray[300],
              true: COLORS.primary.light,
            }}
            thumbColor={remindersEnabled ? COLORS.primary.main : COLORS.neutral.gray[400]}
          />
        </View>
        
        {remindersEnabled && (
          <View>
            <Text style={{
              ...TYPOGRAPHY.bodySmall,
              color: COLORS.text.secondary,
              marginBottom: SPACING.md,
            }}>
              Set reminder times for taking your medication
            </Text>
            
            <View style={{ gap: SPACING.sm }}>
              {reminderTimes.map((time, index) => (
                <View key={index} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: SPACING.sm,
                }}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedTimeIndex(index);
                      setTimePickerOpen(true);
                    }}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: SPACING.md,
                      backgroundColor: COLORS.neutral.gray[100],
                      borderRadius: BORDER_RADIUS.input,
                      borderWidth: 1,
                      borderColor: COLORS.border.light,
                    }}
                  >
                    <Text style={{ fontSize: 16, marginRight: SPACING.sm }}>⏰</Text>
                    <Text style={TYPOGRAPHY.bodyMedium}>
                      {new Date(`2000-01-01T${time}:00`).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </TouchableOpacity>
                  
                  <Button
                    onPress={() => removeReminderTime(index)}
                    variant="outline"
                    size="small"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      borderColor: COLORS.status.error.main,
                    }}
                  >
                    <Text style={{
                      color: COLORS.status.error.main,
                      fontSize: 16,
                    }}>
                      ✕
                    </Text>
                  </Button>
                </View>
              ))}
            </View>
            
            {reminderTimes.length < 6 && (
              <Button
                title="Add Reminder Time"
                onPress={addReminderTime}
                variant="outline"
                size="small"
                style={{
                  marginTop: SPACING.md,
                  alignSelf: 'center',
                }}
                leftIcon={<Text style={{ fontSize: 14 }}>➕</Text>}
              />
            )}
          </View>
        )}
      </Card>
    );
  };
  
  const renderPrescriptionDetails = (values, handleChange, handleBlur, errors, touched) => {
    if (selectedType !== 'prescription') return null;
    
    return (
      <Card variant="outlined" style={{ marginBottom: SPACING.lg }}>
        <Text style={{
          ...TYPOGRAPHY.h6,
          marginBottom: SPACING.md,
          color: COLORS.medical.medication.prescription,
        }}>
          🏥 Prescription Details
        </Text>
        
        <Input
          label="Prescribing Doctor"
          placeholder="Dr. John Smith"
          value={values.prescribingDoctor}
          onChangeText={(text) => {
            handleChange('prescribingDoctor')(text);
            setHasUnsavedChanges(true);
          }}
          onBlur={handleBlur('prescribingDoctor')}
          errorMessage={touched.prescribingDoctor ? errors.prescribingDoctor : null}
          leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>👨‍⚕️</Text>}
        />
        
        <Input
          label="Pharmacy"
          placeholder="CVS Pharmacy"
          value={values.pharmacy}
          onChangeText={(text) => {
            handleChange('pharmacy')(text);
            setHasUnsavedChanges(true);
          }}
          onBlur={handleBlur('pharmacy')}
          errorMessage={touched.pharmacy ? errors.pharmacy : null}
          leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>🏪</Text>}
        />
        
        <View style={{
          flexDirection: 'row',
          gap: SPACING.sm,
        }}>
          <Input
            label="Refills Remaining"
            placeholder="3"
            value={values.refillsRemaining?.toString()}
            onChangeText={(text) => {
              handleChange('refillsRemaining')(parseInt(text) || 0);
              setHasUnsavedChanges(true);
            }}
            onBlur={handleBlur('refillsRemaining')}
            keyboardType="numeric"
            errorMessage={touched.refillsRemaining ? errors.refillsRemaining : null}
            style={{ flex: 1 }}
          />
          
          {enableCostTracking && (
            <Input
              label="Cost ($)"
              placeholder="25.99"
              value={values.cost?.toString()}
              onChangeText={(text) => {
                handleChange('cost')(parseFloat(text) || 0);
                setHasUnsavedChanges(true);
              }}
              onBlur={handleBlur('cost')}
              keyboardType="numeric"
              errorMessage={touched.cost ? errors.cost : null}
              leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>💰</Text>}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </Card>
    );
  };
  
  const renderScheduleSection = (values, handleChange, handleBlur) => (
    <Card variant="outlined" style={{ marginBottom: SPACING.lg }}>
      <Text style={{
        ...TYPOGRAPHY.h6,
        marginBottom: SPACING.md,
        color: COLORS.medical.medication.prescription,
      }}>
        📅 Schedule
      </Text>
      
      <View style={{
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            ...TYPOGRAPHY.label,
            marginBottom: SPACING.sm,
          }}>
            Start Date
          </Text>
          <TouchableOpacity
            onPress={() => setStartDatePickerOpen(true)}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border.medium,
              borderRadius: BORDER_RADIUS.input,
              padding: SPACING.md,
              backgroundColor: COLORS.background.surface,
            }}
          >
            <Text style={TYPOGRAPHY.bodyMedium}>
              {values.startDate ? new Date(values.startDate).toLocaleDateString() : 'Select Date'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{
            ...TYPOGRAPHY.label,
            marginBottom: SPACING.sm,
          }}>
            End Date (Optional)
          </Text>
          <TouchableOpacity
            onPress={() => setEndDatePickerOpen(true)}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border.medium,
              borderRadius: BORDER_RADIUS.input,
              padding: SPACING.md,
              backgroundColor: COLORS.background.surface,
            }}
          >
            <Text style={TYPOGRAPHY.bodyMedium}>
              {values.endDate ? new Date(values.endDate).toLocaleDateString() : 'Ongoing'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
  
  // Default values
  const getInitialValues = () => ({
    name: initialValues.name || '',
    dosage: initialValues.dosage || '',
    frequency: initialValues.frequency || 'once_daily',
    instructions: initialValues.instructions || '',
    prescribingDoctor: initialValues.prescribingDoctor || '',
    pharmacy: initialValues.pharmacy || '',
    notes: initialValues.notes || '',
    refillsRemaining: initialValues.refillsRemaining || 0,
    cost: initialValues.cost || 0,
    startDate: initialValues.startDate || new Date(),
    endDate: initialValues.endDate || null,
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
              backgroundColor: COLORS.medical.medication.prescription + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: SPACING.lg,
              ...SHADOWS.small,
            }}>
              <Text style={{ fontSize: 32 }}>💊</Text>
            </View>
            
            <Text style={{
              ...TYPOGRAPHY.h2,
              textAlign: 'center',
              marginBottom: SPACING.sm,
            }}>
              {editMode ? 'Edit Medication' : 'Add Medication'}
            </Text>
            
            <Text style={{
              ...TYPOGRAPHY.bodyMedium,
              color: COLORS.text.secondary,
              textAlign: 'center',
              maxWidth: 280,
            }}>
              {editMode ? 'Update medication details and reminders' : 'Add a new medication to your health profile'}
            </Text>
          </View>
          
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
          
          {/* Medication Form */}
          <Formik
            ref={formikRef}
            initialValues={getInitialValues()}
            validationSchema={medicationSchema}
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
                {/* Basic Information */}
                <Input
                  label="Medication Name"
                  placeholder="e.g., Lisinopril, Tylenol, Vitamin D"
                  value={values.name}
                  onChangeText={(text) => {
                    handleChange('name')(text);
                    setHasUnsavedChanges(true);
                  }}
                  onBlur={handleBlur('name')}
                  errorMessage={touched.name ? errors.name : null}
                  leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>💊</Text>}
                />
                
                {/* Medication Type */}
                {renderMedicationTypeSelector()}
                
                {/* Dosage Information */}
                {renderDosageSection(values, handleChange, handleBlur, errors, touched)}
                
                {/* Food Instructions */}
                {renderFoodInstructions()}
                
                {/* Prescription Details */}
                {renderPrescriptionDetails(values, handleChange, handleBlur, errors, touched)}
                
                {/* Schedule */}
                {renderScheduleSection(values, handleChange, handleBlur)}
                
                {/* Reminders */}
                {renderRemindersSection()}
                
                {/* Additional Notes */}
                <Input
                  label="Additional Notes"
                  placeholder="Any additional information about this medication..."
                  value={values.notes}
                  onChangeText={(text) => {
                    handleChange('notes')(text);
                    setHasUnsavedChanges(true);
                  }}
                  onBlur={handleBlur('notes')}
                  multiline
                  numberOfLines={3}
                  errorMessage={touched.notes ? errors.notes : null}
                  style={{ marginBottom: SPACING.xl }}
                />
                
                {/* Action Buttons */}
                <View style={{
                  flexDirection: 'row',
                  gap: SPACING.sm,
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
                    title={editMode ? 'Save Changes' : 'Add Medication'}
                    onPress={formikSubmit}
                    loading={isSubmitting || saving}
                    disabled={isSubmitting || saving}
                    variant="primary"
                    style={{ flex: 2 }}
                  />
                </View>
                
                {/* Delete Button (Edit Mode Only) */}
                {editMode && onDelete && (
                  <Button
                    title="Delete Medication"
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
      
      {/* Date Pickers */}
      <DatePicker
        modal
        open={startDatePickerOpen}
        date={initialValues.startDate ? new Date(initialValues.startDate) : new Date()}
        mode="date"
        onConfirm={(date) => {
          setStartDatePickerOpen(false);
          if (formikRef.current) {
            formikRef.current.setFieldValue('startDate', date);
            setHasUnsavedChanges(true);
          }
        }}
        onCancel={() => setStartDatePickerOpen(false)}
      />
      
      <DatePicker
        modal
        open={endDatePickerOpen}
        date={initialValues.endDate ? new Date(initialValues.endDate) : new Date()}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => {
          setEndDatePickerOpen(false);
          if (formikRef.current) {
            formikRef.current.setFieldValue('endDate', date);
            setHasUnsavedChanges(true);
          }
        }}
        onCancel={() => setEndDatePickerOpen(false)}
      />
      
      <DatePicker
        modal
        open={timePickerOpen}
        date={new Date(`2000-01-01T${reminderTimes[selectedTimeIndex] || '12:00'}:00`)}
        mode="time"
        onConfirm={(time) => {
          setTimePickerOpen(false);
          updateReminderTime(selectedTimeIndex, time);
        }}
        onCancel={() => setTimePickerOpen(false)}
      />
      
      {/* Loading Overlay */}
      {(loading || saving) && (
        <LoadingSpinner
          variant="overlay"
          message={loading ? "Loading medication..." : "Saving medication..."}
          overlay
        />
      )}
    </AnimatedView>
  );
};

export default MedicationForm;