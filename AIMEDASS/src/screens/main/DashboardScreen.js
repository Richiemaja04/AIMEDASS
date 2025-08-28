/**
 * MediAssist App - DashboardScreen
 * Comprehensive health dashboard with personalized insights and quick actions
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  withSpring,
  withDelay,
  interpolate,
  extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Components
import AnimatedHeader, { DashboardHeader } from '../../src/components/common/AnimatedHeader';
import Card, { VitalCard, MedicationCard, AppointmentCard } from '../../src/components/common/Card';
import Button, { FAB } from '../../src/components/common/Button';
import StatusPill from '../../src/components/common/StatusPill';
import SlideInCard from '../../src/components/animations/SlideInCard';
import FadeInView from '../../src/components/animations/FadeInView';
import PulseAnimation from '../../src/components/animations/PulseAnimation';
import SwipeGesture, { MedicationSwipeCard } from '../../src/components/animations/SwipeGesture';
import HealthChart, { VitalRingChart } from '../../src/components/charts/HealthChart';
import ProgressChart, { StepsProgressRing, MedicationAdherenceRing } from '../../src/components/charts/ProgressChart';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';

// Redux actions (commented out since we don't have actual slices)
// import { fetchDashboardData, markMedicationTaken } from '../../store/slices/dashboardSlice';
// import { fetchUserProfile } from '../../store/slices/userSlice';

// Styles
import { COLORS } from '../../styles/colors';
import { TYPOGRAPHY } from '../../styles/typography';
import { SPACING, BORDER_RADIUS, DIMENSIONS } from '../../styles/spacing';
import { SHADOWS } from '../../styles/shadows';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Mock data for demonstration
const MOCK_USER = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  profileImage: null,
  healthScore: 85,
  streak: 7,
};

const MOCK_VITALS = [
  { type: 'heartRate', value: 72, label: 'Heart Rate', unit: 'bpm', timestamp: new Date() },
  { type: 'bloodPressure', value: 120, label: 'Blood Pressure', unit: 'mmHg', timestamp: new Date() },
  { type: 'temperature', value: 98.6, label: 'Temperature', unit: '°F', timestamp: new Date() },
  { type: 'oxygen', value: 98, label: 'Blood Oxygen', unit: '%', timestamp: new Date() },
];

const MOCK_MEDICATIONS = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    nextDose: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    status: 'due',
    urgent: false,
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    nextDose: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    status: 'overdue',
    urgent: true,
  },
  {
    id: '3',
    name: 'Vitamin D3',
    dosage: '2000 IU',
    frequency: 'Once daily',
    nextDose: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    status: 'scheduled',
    urgent: false,
  },
];

const MOCK_APPOINTMENTS = [
  {
    id: '1',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    time: '10:00 AM',
    type: 'Follow-up',
    status: 'confirmed',
  },
  {
    id: '2',
    doctorName: 'Dr. Emma Wilson',
    specialty: 'General Practice',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    time: '2:30 PM',
    type: 'Annual Checkup',
    status: 'scheduled',
  },
];

const MOCK_HEALTH_DATA = [
  { value: 120, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
  { value: 118, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { value: 125, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
  { value: 122, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { value: 119, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { value: 121, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { value: 120, timestamp: new Date() },
];

const DashboardScreen = () => {
  // Navigation
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Redux state (commented out since we don't have actual slices)
  // const { user, loading: userLoading } = useSelector(state => state.user);
  // const { dashboardData, loading, error } = useSelector(state => state.dashboard);
  
  // Local state for demonstration
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    user: MOCK_USER,
    vitals: MOCK_VITALS,
    medications: MOCK_MEDICATIONS,
    appointments: MOCK_APPOINTMENTS,
    healthData: MOCK_HEALTH_DATA,
  });
  
  // Animation values
  const scrollY = useSharedValue(0);
  const headerHeight = useSharedValue(DIMENSIONS.layout.headerHeight);
  
  // Refs
  const scrollViewRef = useRef(null);
  
  // Focus effect to refresh data
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );
  
  // Load dashboard data
  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation:
      // await dispatch(fetchDashboardData()).unwrap();
      // await dispatch(fetchUserProfile()).unwrap();
      
      console.log('Dashboard data loaded');
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle medication taken
  const handleMedicationTaken = async (medication) => {
    try {
      // Optimistic update
      setDashboardData(prev => ({
        ...prev,
        medications: prev.medications.map(med =>
          med.id === medication.id
            ? { ...med, status: 'taken' }
            : med
        ),
      }));
      
      // In real implementation:
      // await dispatch(markMedicationTaken({ medicationId: medication.id }));
      
      Alert.alert(
        'Medication Taken',
        `${medication.name} has been marked as taken.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      // Revert optimistic update on error
      loadDashboardData();
    }
  };
  
  // Handle medication skipped
  const handleMedicationSkipped = async (medication) => {
    try {
      setDashboardData(prev => ({
        ...prev,
        medications: prev.medications.map(med =>
          med.id === medication.id
            ? { ...med, status: 'skipped' }
            : med
        ),
      }));
      
      Alert.alert(
        'Dose Skipped',
        `${medication.name} has been marked as skipped.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error skipping medication:', error);
      loadDashboardData();
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    loadDashboardData(true);
  };
  
  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  
  // Navigation handlers
  const navigateToMedications = () => navigation.navigate('Medications');
  const navigateToAppointments = () => navigation.navigate('Appointments');
  const navigateToVitals = () => navigation.navigate('Vitals');
  const navigateToInsights = () => navigation.navigate('Insights');
  const navigateToProfile = () => navigation.navigate('Profile');
  const navigateToChat = () => navigation.navigate('Chat');
  
  // Render health score section
  const renderHealthScore = () => (
    <SlideInCard
      direction="right"
      delay={200}
      gradient={COLORS.gradients.primary}
      style={styles.healthScoreCard}
    >
      <View style={styles.healthScoreContent}>
        <View style={styles.healthScoreInfo}>
          <Text style={styles.healthScoreLabel}>Health Score</Text>
          <Text style={styles.healthScoreValue}>{dashboardData.user.healthScore}</Text>
          <Text style={styles.healthScoreSubtext}>Excellent</Text>
        </View>
        
        <ProgressChart
          progress={dashboardData.user.healthScore}
          target={100}
          size={80}
          color={COLORS.text.inverse}
          backgroundColor="rgba(255, 255, 255, 0.3)"
          showPercentage={false}
          showValue={false}
        />
      </View>
      
      <View style={styles.streakContainer}>
        <Text style={styles.streakIcon}>🔥</Text>
        <Text style={styles.streakText}>
          {dashboardData.user.streak} day streak
        </Text>
      </View>
    </SlideInCard>
  );
  
  // Render quick stats
  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      {dashboardData.vitals.slice(0, 4).map((vital, index) => (
        <SlideInCard
          key={vital.type}
          direction="up"
          delay={300 + (index * 100)}
          style={styles.vitalStatCard}
          onPress={() => navigateToVitals()}
        >
          <VitalCard vital={vital} />
        </SlideInCard>
      ))}
    </View>
  );
  
  // Render medications section
  const renderMedications = () => {
    const urgentMedications = dashboardData.medications.filter(med => 
      med.status === 'overdue' || med.urgent
    );
    const dueMedications = dashboardData.medications.filter(med => 
      med.status === 'due'
    );
    
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Medications</Text>
          <Button
            title="View All"
            variant="ghost"
            size="small"
            onPress={navigateToMedications}
          />
        </View>
        
        {urgentMedications.length > 0 && (
          <View style={styles.urgentMedicationsContainer}>
            <Text style={styles.urgentMedicationsTitle}>
              ⚠️ Needs Attention
            </Text>
            {urgentMedications.map((medication, index) => (
              <SlideInCard
                key={medication.id}
                direction="left"
                delay={400 + (index * 150)}
                style={styles.medicationCard}
              >
                <MedicationSwipeCard
                  medication={medication}
                  onTaken={handleMedicationTaken}
                  onSkipped={handleMedicationSkipped}
                  urgent={medication.urgent}
                  overdue={medication.status === 'overdue'}
                >
                  <MedicationCard medication={medication} />
                </MedicationSwipeCard>
              </SlideInCard>
            ))}
          </View>
        )}
        
        {dueMedications.length > 0 && (
          <View style={styles.dueMedicationsContainer}>
            {dueMedications.map((medication, index) => (
              <SlideInCard
                key={medication.id}
                direction="left"
                delay={600 + (index * 100)}
                style={styles.medicationCard}
              >
                <MedicationSwipeCard
                  medication={medication}
                  onTaken={handleMedicationTaken}
                  onSkipped={handleMedicationSkipped}
                >
                  <MedicationCard medication={medication} />
                </MedicationSwipeCard>
              </SlideInCard>
            ))}
          </View>
        )}
      </View>
    );
  };
  
  // Render appointments section
  const renderAppointments = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        <Button
          title="Schedule"
          variant="ghost"
          size="small"
          onPress={navigateToAppointments}
        />
      </View>
      
      {dashboardData.appointments.slice(0, 2).map((appointment, index) => (
        <SlideInCard
          key={appointment.id}
          direction="right"
          delay={700 + (index * 100)}
          style={styles.appointmentCard}
        >
          <AppointmentCard 
            appointment={appointment}
            onPress={() => navigateToAppointments()}
          />
        </SlideInCard>
      ))}
    </View>
  );
  
  // Render health trends
  const renderHealthTrends = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Health Trends</Text>
        <Button
          title="Details"
          variant="ghost"
          size="small"
          onPress={navigateToInsights}
        />
      </View>
      
      <SlideInCard
        direction="up"
        delay={800}
        style={styles.chartCard}
      >
        <HealthChart
          data={dashboardData.healthData}
          preset="bloodPressure"
          timeRange="7d"
          height={180}
          showRanges={true}
          showStatistics={false}
          animated={true}
        />
      </SlideInCard>
    </View>
  );
  
  // Render quick actions
  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <SlideInCard
        direction="left"
        delay={900}
        style={styles.quickActionCard}
      >
        <Button
          title="Add Vital Signs"
          variant="outline"
          leftIcon={<Text style={{ fontSize: 18 }}>📊</Text>}
          onPress={navigateToVitals}
          fullWidth
        />
      </SlideInCard>
      
      <SlideInCard
        direction="right"
        delay={950}
        style={styles.quickActionCard}
      >
        <Button
          title="Schedule Appointment"
          variant="outline"
          leftIcon={<Text style={{ fontSize: 18 }}>📅</Text>}
          onPress={navigateToAppointments}
          fullWidth
        />
      </SlideInCard>
    </View>
  );
  
  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner
          variant="medical"
          message="Loading your health dashboard..."
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <DashboardHeader
        user={dashboardData.user}
        notifications={2}
        scrollY={scrollY}
        onProfilePress={navigateToProfile}
      />
      
      {/* Content */}
      <AnimatedScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary.main]}
            tintColor={COLORS.primary.main}
          />
        }
      >
        {/* Health Score */}
        {renderHealthScore()}
        
        {/* Quick Stats */}
        {renderQuickStats()}
        
        {/* Medications */}
        {renderMedications()}
        
        {/* Appointments */}
        {renderAppointments()}
        
        {/* Health Trends */}
        {renderHealthTrends()}
        
        {/* Quick Actions */}
        {renderQuickActions()}
        
        {/* Bottom spacing for FAB */}
        <View style={{ height: 100 }} />
      </AnimatedScrollView>
      
      {/* Floating Action Button */}
      <FAB
        icon={<Text style={{ fontSize: 24, color: COLORS.text.inverse }}>💬</Text>}
        onPress={navigateToChat}
        variant="medical"
        position="bottomRight"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  
  scrollView: {
    flex: 1,
    marginTop: DIMENSIONS.layout.headerHeight,
  },
  
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  
  // Health Score Card
  healthScoreCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  
  healthScoreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  healthScoreInfo: {
    flex: 1,
  },
  
  healthScoreLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.inverse,
    opacity: 0.8,
    marginBottom: SPACING.xs,
  },
  
  healthScoreValue: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.inverse,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  
  healthScoreSubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.inverse,
    opacity: 0.9,
    fontWeight: '600',
  },
  
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignSelf: 'flex-start',
  },
  
  streakIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  
  streakText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.inverse,
    fontWeight: '600',
  },
  
  // Quick Stats
  quickStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  
  vitalStatCard: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm) / 2,
  },
  
  // Section styling
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  sectionTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  
  // Medications
  urgentMedicationsContainer: {
    marginBottom: SPACING.lg,
  },
  
  urgentMedicationsTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.status.warning.main,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  
  dueMedicationsContainer: {
    // Additional styling for due medications
  },
  
  medicationCard: {
    marginBottom: SPACING.sm,
  },
  
  // Appointments
  appointmentCard: {
    marginBottom: SPACING.sm,
  },
  
  // Charts
  chartCard: {
    padding: SPACING.md,
  },
  
  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  
  quickActionCard: {
    flex: 1,
  },
});

export default DashboardScreen;