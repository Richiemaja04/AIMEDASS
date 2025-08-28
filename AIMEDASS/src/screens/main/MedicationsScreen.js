/**
 * MediAssist App - MedicationsScreen
 * Comprehensive medication management with tracking, reminders, and analytics
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Components
import AnimatedHeader from '../../src/components/common/AnimatedHeader';
import Button, { FAB } from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import Card, { MedicationCard } from '../../src/components/common/Card';
import StatusPill, { MedicationStatusPill } from '../../src/components/common/StatusPill';
import SlideInCard from '../../src/components/animations/SlideInCard';
import FadeInView from '../../src/components/animations/FadeInView';
import SwipeGesture, { MedicationSwipeCard } from '../../src/components/animations/SwipeGesture';
import MedicationChart, { AdherenceChart, WeeklyAdherenceCalendar } from '../../src/components/charts/MedicationChart';
import Modal, { BottomSheetModal } from '../../src/components/common/Modal';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';

// Redux actions (commented out)
// import { fetchMedications, addMedication, updateMedication, deleteMedication } from '../../store/slices/medicationSlice';

// Styles
import { COLORS } from '../../styles/colors';
import { TYPOGRAPHY } from '../../styles/typography';
import { SPACING, BORDER_RADIUS, DIMENSIONS } from '../../styles/spacing';
import { SHADOWS } from '../../styles/shadows';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Mock data
const MOCK_MEDICATIONS = [
  {
    id: '1',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    type: 'prescription',
    reminderTimes: ['09:00'],
    remindersEnabled: true,
    prescribingDoctor: 'Dr. Sarah Johnson',
    startDate: new Date('2024-01-15'),
    endDate: null,
    instructions: 'Take with food',
    sideEffects: ['Dizziness', 'Dry cough'],
    refillsRemaining: 3,
    lastTaken: new Date(Date.now() - 24 * 60 * 60 * 1000),
    adherenceRate: 92,
    status: 'active',
    color: COLORS.medical.medication.prescription,
  },
  {
    id: '2',
    name: 'Metformin',
    genericName: 'Metformin HCl',
    dosage: '500mg',
    frequency: 'Twice daily',
    type: 'prescription',
    reminderTimes: ['08:00', '20:00'],
    remindersEnabled: true,
    prescribingDoctor: 'Dr. Michael Chen',
    startDate: new Date('2024-02-01'),
    endDate: null,
    instructions: 'Take with meals',
    sideEffects: ['Nausea', 'Stomach upset'],
    refillsRemaining: 1,
    lastTaken: new Date(Date.now() - 12 * 60 * 60 * 1000),
    adherenceRate: 88,
    status: 'active',
    color: COLORS.medical.medication.prescription,
  },
  {
    id: '3',
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol',
    dosage: '2000 IU',
    frequency: 'Once daily',
    type: 'supplement',
    reminderTimes: ['09:00'],
    remindersEnabled: true,
    prescribingDoctor: null,
    startDate: new Date('2024-01-01'),
    endDate: null,
    instructions: 'Take with fatty meal for better absorption',
    sideEffects: [],
    refillsRemaining: null,
    lastTaken: new Date(Date.now() - 36 * 60 * 60 * 1000),
    adherenceRate: 75,
    status: 'active',
    color: COLORS.medical.medication.supplement,
  },
  {
    id: '4',
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    dosage: '200mg',
    frequency: 'As needed',
    type: 'otc',
    reminderTimes: [],
    remindersEnabled: false,
    prescribingDoctor: null,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-15'),
    instructions: 'Take with food or milk',
    sideEffects: ['Stomach irritation'],
    refillsRemaining: null,
    lastTaken: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    adherenceRate: 100,
    status: 'completed',
    color: COLORS.medical.medication.overTheCounter,
  },
];

const MOCK_ADHERENCE_DATA = [
  { medicationId: '1', date: new Date(), status: 'taken', scheduledTime: '09:00' },
  { medicationId: '2', date: new Date(), status: 'taken', scheduledTime: '08:00' },
  { medicationId: '2', date: new Date(), status: 'missed', scheduledTime: '20:00' },
  { medicationId: '3', date: new Date(), status: 'skipped', scheduledTime: '09:00' },
];

// Filter options
const FILTER_OPTIONS = [
  { key: 'all', label: 'All', color: COLORS.primary.main },
  { key: 'active', label: 'Active', color: COLORS.status.success.main },
  { key: 'due', label: 'Due Today', color: COLORS.status.warning.main },
  { key: 'prescription', label: 'Prescription', color: COLORS.medical.medication.prescription },
  { key: 'otc', label: 'OTC', color: COLORS.medical.medication.overTheCounter },
  { key: 'supplement', label: 'Supplements', color: COLORS.medical.medication.supplement },
];

// Sort options
const SORT_OPTIONS = [
  { key: 'name', label: 'Name A-Z' },
  { key: 'nextDose', label: 'Next Dose' },
  { key: 'adherence', label: 'Adherence' },
  { key: 'dateAdded', label: 'Recently Added' },
];

const MedicationsScreen = () => {
  // Navigation
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Redux state (commented out)
  // const { medications, adherenceData, loading, error } = useSelector(state => state.medications);
  
  // Local state
  const [medications, setMedications] = useState(MOCK_MEDICATIONS);
  const [adherenceData, setAdherenceData] = useState(MOCK_ADHERENCE_DATA);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('nextDose');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Animation values
  const scrollY = useSharedValue(0);
  const searchBarOpacity = useSharedValue(1);
  const headerHeight = useSharedValue(DIMENSIONS.layout.headerHeight);
  
  // Refs
  const flatListRef = useRef(null);
  
  // Focus effect
  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [])
  );
  
  // Load medications
  const loadMedications = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation:
      // await dispatch(fetchMedications()).unwrap();
      
      console.log('Medications loaded');
    } catch (error) {
      console.error('Error loading medications:', error);
      Alert.alert('Error', 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter and sort medications
  const getFilteredMedications = () => {
    let filtered = medications;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(med =>
        med.name.toLowerCase().includes(query) ||
        med.genericName.toLowerCase().includes(query) ||
        (med.prescribingDoctor && med.prescribingDoctor.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'active':
          filtered = filtered.filter(med => med.status === 'active');
          break;
        case 'due':
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          filtered = filtered.filter(med => {
            if (!med.reminderTimes.length) return false;
            return med.reminderTimes.some(time => {
              const [hours, minutes] = time.split(':');
              const reminderTime = new Date(today);
              reminderTime.setHours(parseInt(hours), parseInt(minutes));
              return reminderTime <= now && now - reminderTime < 24 * 60 * 60 * 1000;
            });
          });
          break;
        default:
          filtered = filtered.filter(med => med.type === selectedFilter);
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'adherence':
          return b.adherenceRate - a.adherenceRate;
        case 'dateAdded':
          return b.startDate - a.startDate;
        case 'nextDose':
        default:
          if (!a.reminderTimes.length && !b.reminderTimes.length) return 0;
          if (!a.reminderTimes.length) return 1;
          if (!b.reminderTimes.length) return -1;
          
          const now = new Date();
          const getNextDose = (med) => {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const times = med.reminderTimes.map(time => {
              const [hours, minutes] = time.split(':');
              const doseTime = new Date(today);
              doseTime.setHours(parseInt(hours), parseInt(minutes));
              if (doseTime < now) {
                doseTime.setDate(doseTime.getDate() + 1);
              }
              return doseTime;
            });
            return Math.min(...times);
          };
          
          return getNextDose(a) - getNextDose(b);
      }
    });
    
    return filtered;
  };
  
  // Handle medication actions
  const handleMedicationTaken = (medication) => {
    Alert.alert(
      'Medication Taken',
      `${medication.name} has been marked as taken.`,
      [{ text: 'OK' }]
    );
    
    // Update local state or dispatch action
    setAdherenceData(prev => [...prev, {
      medicationId: medication.id,
      date: new Date(),
      status: 'taken',
      scheduledTime: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    }]);
  };
  
  const handleMedicationSkipped = (medication) => {
    Alert.alert(
      'Dose Skipped',
      `${medication.name} dose has been skipped.`,
      [{ text: 'OK' }]
    );
  };
  
  const handleMedicationEdit = (medication) => {
    navigation.navigate('EditMedication', { medicationId: medication.id });
  };
  
  const handleMedicationDelete = (medication) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete ${medication.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMedications(prev => prev.filter(med => med.id !== medication.id));
          },
        },
      ]
    );
  };
  
  const handleAddMedication = () => {
    navigation.navigate('AddMedication');
  };
  
  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      
      // Hide search bar on scroll down
      const shouldHideSearch = event.contentOffset.y > 50;
      searchBarOpacity.value = withTiming(shouldHideSearch ? 0 : 1, { duration: 200 });
    },
  });
  
  // Animated styles
  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: searchBarOpacity.value,
    transform: [{
      translateY: interpolate(searchBarOpacity.value, [0, 1], [-20, 0])
    }],
  }));
  
  // Render medication item
  const renderMedicationItem = ({ item: medication, index }) => (
    <SlideInCard
      direction="left"
      delay={index * 50}
      style={styles.medicationItemContainer}
    >
      <MedicationSwipeCard
        medication={medication}
        onTaken={() => handleMedicationTaken(medication)}
        onSkipped={() => handleMedicationSkipped(medication)}
        urgent={medication.status === 'overdue'}
        overdue={false}
      >
        <TouchableOpacity
          onPress={() => setSelectedMedication(medication)}
          style={styles.medicationItem}
        >
          <View style={styles.medicationHeader}>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>{medication.name}</Text>
              {medication.genericName !== medication.name && (
                <Text style={styles.medicationGeneric}>({medication.genericName})</Text>
              )}
              <Text style={styles.medicationDosage}>
                {medication.dosage} • {medication.frequency}
              </Text>
              {medication.prescribingDoctor && (
                <Text style={styles.medicationDoctor}>
                  Prescribed by {medication.prescribingDoctor}
                </Text>
              )}
            </View>
            
            <View style={styles.medicationActions}>
              <MedicationStatusPill medication={medication} />
              
              {medication.adherenceRate && (
                <View style={styles.adherenceContainer}>
                  <Text style={styles.adherenceLabel}>Adherence</Text>
                  <Text style={[
                    styles.adherenceValue,
                    {
                      color: medication.adherenceRate >= 90 
                        ? COLORS.status.success.main
                        : medication.adherenceRate >= 70
                        ? COLORS.status.warning.main
                        : COLORS.status.error.main
                    }
                  ]}>
                    {medication.adherenceRate}%
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {medication.reminderTimes.length > 0 && (
            <View style={styles.reminderTimes}>
              <Text style={styles.reminderLabel}>Next doses:</Text>
              <View style={styles.reminderTimesContainer}>
                {medication.reminderTimes.map((time, timeIndex) => (
                  <StatusPill
                    key={timeIndex}
                    status="info"
                    text={time}
                    size="small"
                    style={styles.reminderTime}
                  />
                ))}
              </View>
            </View>
          )}
          
          {medication.refillsRemaining !== null && (
            <View style={styles.refillInfo}>
              <Text style={[
                styles.refillText,
                {
                  color: medication.refillsRemaining <= 1 
                    ? COLORS.status.error.main 
                    : medication.refillsRemaining <= 3
                    ? COLORS.status.warning.main
                    : COLORS.text.secondary
                }
              ]}>
                {medication.refillsRemaining > 0 
                  ? `${medication.refillsRemaining} refills remaining`
                  : 'No refills remaining - Contact doctor'
                }
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </MedicationSwipeCard>
    </SlideInCard>
  );
  
  // Render filter chips
  const renderFilterChips = () => (
    <View style={styles.filterChipsContainer}>
      <FlatList
        horizontal
        data={FILTER_OPTIONS}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedFilter(item.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedFilter === item.key 
                  ? item.color 
                  : COLORS.neutral.gray[100],
              }
            ]}
          >
            <Text style={[
              styles.filterChipText,
              {
                color: selectedFilter === item.key 
                  ? COLORS.text.inverse 
                  : COLORS.text.secondary,
              }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.filterChipsContent}
      />
    </View>
  );
  
  // Render analytics section
  const renderAnalytics = () => {
    if (!showAnalytics) return null;
    
    return (
      <FadeInView style={styles.analyticsContainer}>
        <Text style={styles.analyticsTitle}>Medication Analytics</Text>
        
        <View style={styles.analyticsContent}>
          <AdherenceChart
            medications={medications}
            adherenceData={adherenceData}
            timeRange="7d"
            height={200}
          />
          
          <View style={styles.analyticsStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>89%</Text>
              <Text style={styles.statLabel}>Overall Adherence</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{medications.filter(m => m.status === 'active').length}</Text>
              <Text style={styles.statLabel}>Active Medications</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Due Today</Text>
            </View>
          </View>
        </View>
      </FadeInView>
    );
  };
  
  const filteredMedications = getFilteredMedications();
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <AnimatedHeader
        title="Medications"
        variant="medical"
        scrollY={scrollY}
        rightAction={
          <View style={styles.headerActions}>
            <Button
              onPress={() => setShowAnalytics(!showAnalytics)}
              variant="ghost"
              size="small"
              leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.inverse }}>📊</Text>}
            />
            <Button
              onPress={() => setShowFilters(true)}
              variant="ghost"
              size="small"
              leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.inverse }}>🔧</Text>}
            />
          </View>
        }
      />
      
      {/* Content */}
      <View style={styles.content}>
        {/* Search Bar */}
        <Animated.View style={[styles.searchContainer, searchBarAnimatedStyle]}>
          <Input
            placeholder="Search medications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Text style={{ fontSize: 16, color: COLORS.text.tertiary }}>🔍</Text>}
            showClearButton
            style={styles.searchInput}
          />
        </Animated.View>
        
        {/* Filter Chips */}
        {renderFilterChips()}
        
        {/* Analytics */}
        {renderAnalytics()}
        
        {/* Medications List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner message="Loading medications..." />
          </View>
        ) : (
          <AnimatedFlatList
            ref={flatListRef}
            data={filteredMedications}
            keyExtractor={(item) => item.id}
            renderItem={renderMedicationItem}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <FadeInView style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>💊</Text>
                <Text style={styles.emptyTitle}>No Medications Found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery.trim() 
                    ? 'Try adjusting your search or filters'
                    : 'Add your first medication to get started'
                  }
                </Text>
                {!searchQuery.trim() && (
                  <Button
                    title="Add Medication"
                    onPress={handleAddMedication}
                    style={styles.emptyAction}
                  />
                )}
              </FadeInView>
            }
          />
        )}
      </View>
      
      {/* Floating Action Button */}
      <FAB
        icon={<Text style={{ fontSize: 24, color: COLORS.text.inverse }}>+</Text>}
        onPress={handleAddMedication}
        variant="medical"
        position="bottomRight"
      />
      
      {/* Filters Bottom Sheet */}
      <BottomSheetModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter & Sort"
      >
        <View style={styles.filtersContent}>
          {/* Sort options */}
          <Text style={styles.filterSectionTitle}>Sort By</Text>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => {
                setSelectedSort(option.key);
                setShowFilters(false);
              }}
              style={styles.sortOption}
            >
              <Text style={[
                styles.sortOptionText,
                { fontWeight: selectedSort === option.key ? 'bold' : 'normal' }
              ]}>
                {option.label}
              </Text>
              {selectedSort === option.key && (
                <Text style={styles.sortOptionSelected}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetModal>
      
      {/* Medication Details Modal */}
      {selectedMedication && (
        <Modal
          visible={!!selectedMedication}
          onClose={() => setSelectedMedication(null)}
          title={selectedMedication.name}
          variant="bottom"
        >
          <View style={styles.medicationDetails}>
            <Text style={styles.medicationDetailText}>
              {selectedMedication.dosage} • {selectedMedication.frequency}
            </Text>
            {selectedMedication.instructions && (
              <Text style={styles.medicationInstructions}>
                {selectedMedication.instructions}
              </Text>
            )}
            
            <View style={styles.medicationActions}>
              <Button
                title="Edit"
                onPress={() => {
                  setSelectedMedication(null);
                  handleMedicationEdit(selectedMedication);
                }}
                style={styles.medicationActionButton}
              />
              <Button
                title="Delete"
                variant="error"
                onPress={() => {
                  setSelectedMedication(null);
                  handleMedicationDelete(selectedMedication);
                }}
                style={styles.medicationActionButton}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  
  content: {
    flex: 1,
    marginTop: DIMENSIONS.layout.headerHeight,
  },
  
  // Search
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  
  searchInput: {
    marginBottom: 0,
  },
  
  // Header Actions
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  
  // Filter Chips
  filterChipsContainer: {
    backgroundColor: COLORS.background.primary,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  
  filterChipsContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.pill,
    marginRight: SPACING.sm,
  },
  
  filterChipText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  
  // Analytics
  analyticsContainer: {
    backgroundColor: COLORS.background.surface,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  
  analyticsTitle: {
    ...TYPOGRAPHY.h6,
    marginBottom: SPACING.md,
  },
  
  analyticsContent: {
    // Additional analytics content styles
  },
  
  analyticsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  
  statItem: {
    alignItems: 'center',
  },
  
  statValue: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary.main,
    fontWeight: 'bold',
  },
  
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  
  // List
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 100, // Space for FAB
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Medication Items
  medicationItemContainer: {
    marginBottom: SPACING.sm,
  },
  
  medicationItem: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.small,
  },
  
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  
  medicationInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  
  medicationName: {
    ...TYPOGRAPHY.h6,
    marginBottom: SPACING.xs,
  },
  
  medicationGeneric: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
  },
  
  medicationDosage: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  
  medicationDoctor: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.tertiary,
  },
  
  medicationActions: {
    alignItems: 'flex-end',
  },
  
  adherenceContainer: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  
  adherenceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  
  adherenceValue: {
    ...TYPOGRAPHY.h6,
    fontWeight: 'bold',
  },
  
  // Reminder Times
  reminderTimes: {
    marginBottom: SPACING.sm,
  },
  
  reminderLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  
  reminderTimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  
  reminderTime: {
    // Additional styles for reminder time pills
  },
  
  // Refill Info
  refillInfo: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    paddingTop: SPACING.sm,
  },
  
  refillText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  
  emptyTitle: {
    ...TYPOGRAPHY.h5,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  
  emptySubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    maxWidth: 280,
  },
  
  emptyAction: {
    // Additional styles for empty action button
  },
  
  // Filters Modal
  filtersContent: {
    padding: SPACING.lg,
  },
  
  filterSectionTitle: {
    ...TYPOGRAPHY.h6,
    marginBottom: SPACING.md,
  },
  
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  
  sortOptionText: {
    ...TYPOGRAPHY.bodyMedium,
  },
  
  sortOptionSelected: {
    color: COLORS.primary.main,
    fontWeight: 'bold',
  },
  
  // Medication Details Modal
  medicationDetails: {
    padding: SPACING.lg,
  },
  
  medicationDetailText: {
    ...TYPOGRAPHY.bodyLarge,
    marginBottom: SPACING.md,
  },
  
  medicationInstructions: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
  },
  
  medicationActionButton: {
    marginBottom: SPACING.sm,
  },
});

export default MedicationsScreen;