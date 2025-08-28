/**
 * MediAssist App - SwipeGesture Component
 * Interactive swipe gestures for medical actions and navigation
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  Platform,
  Vibration,
  Alert,
} from 'react-native';
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useAnimatedGestureHandler,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  interpolateColor,
  runOnJS,
  extrapolate,
  Extrapolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import HapticFeedback from 'react-native-haptic-feedback';

// Styles
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING, BORDER_RADIUS } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Swipe directions
const SWIPE_DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down',
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
};

// Medical swipe actions
const MEDICAL_ACTIONS = {
  TAKE_MEDICATION: {
    direction: SWIPE_DIRECTIONS.RIGHT,
    color: COLORS.status.success.main,
    icon: '✓',
    text: 'Take Medication',
    confirmText: 'Swipe to take',
  },
  SKIP_MEDICATION: {
    direction: SWIPE_DIRECTIONS.LEFT,
    color: COLORS.status.warning.main,
    icon: '⏭',
    text: 'Skip Dose',
    confirmText: 'Swipe to skip',
  },
  EMERGENCY_CALL: {
    direction: SWIPE_DIRECTIONS.UP,
    color: COLORS.status.error.main,
    icon: '🚨',
    text: 'Emergency Call',
    confirmText: 'Swipe up to call',
  },
  SNOOZE_REMINDER: {
    direction: SWIPE_DIRECTIONS.DOWN,
    color: COLORS.neutral.gray[500],
    icon: '😴',
    text: 'Snooze',
    confirmText: 'Swipe to snooze',
  },
  COMPLETE_APPOINTMENT: {
    direction: SWIPE_DIRECTIONS.RIGHT,
    color: COLORS.secondary.main,
    icon: '✅',
    text: 'Mark Complete',
    confirmText: 'Swipe to complete',
  },
  DELETE_ITEM: {
    direction: SWIPE_DIRECTIONS.LEFT,
    color: COLORS.status.error.main,
    icon: '🗑',
    text: 'Delete',
    confirmText: 'Swipe to delete',
  },
};

// Swipe thresholds
const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 800;
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 1,
};

const SwipeGesture = ({
  // Content props
  children,
  
  // Swipe configuration
  direction = SWIPE_DIRECTIONS.HORIZONTAL,
  actions = {},
  
  // Thresholds
  swipeThreshold = SWIPE_THRESHOLD,
  velocityThreshold = VELOCITY_THRESHOLD,
  
  // Visual feedback
  showIndicators = true,
  showProgress = true,
  enableHaptics = true,
  
  // Behavior props
  requireConfirmation = false,
  autoReset = true,
  disabled = false,
  
  // Medical context
  medicalAction,
  urgency = 'normal', // 'low', 'normal', 'high', 'critical'
  
  // Event handlers
  onSwipeStart,
  onSwipeProgress,
  onSwipeComplete,
  onSwipeCancel,
  onActionTrigger,
  
  // Style props
  style,
  containerStyle,
  
  // Test props
  testID,
}) => {
  // State
  const [activeAction, setActiveAction] = useState(null);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  
  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const indicatorOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  
  // Refs
  const gestureRef = useRef(null);
  const hasHapticFeedback = useRef(false);
  
  // Get medical action configuration
  const getMedicalActionConfig = () => {
    if (medicalAction && MEDICAL_ACTIONS[medicalAction]) {
      return MEDICAL_ACTIONS[medicalAction];
    }
    return null;
  };
  
  // Get urgency-based styling
  const getUrgencyStyle = () => {
    switch (urgency) {
      case 'critical':
        return {
          backgroundColor: COLORS.status.error.background,
          borderColor: COLORS.status.error.main,
          pulseEffect: true,
        };
      case 'high':
        return {
          backgroundColor: COLORS.status.warning.background,
          borderColor: COLORS.status.warning.main,
          pulseEffect: false,
        };
      case 'low':
        return {
          backgroundColor: COLORS.neutral.gray[100],
          borderColor: COLORS.neutral.gray[300],
          pulseEffect: false,
        };
      default:
        return {
          backgroundColor: COLORS.background.surface,
          borderColor: COLORS.border.light,
          pulseEffect: false,
        };
    }
  };
  
  // Determine swipe actions based on direction and configuration
  const getSwipeActions = () => {
    const medicalConfig = getMedicalActionConfig();
    if (medicalConfig) {
      return { [medicalConfig.direction]: medicalConfig };
    }
    
    return actions;
  };
  
  // Haptic feedback helper
  const triggerHapticFeedback = (type = 'light') => {
    if (!enableHaptics) return;
    
    if (Platform.OS === 'ios') {
      const hapticType = {
        light: 'impactLight',
        medium: 'impactMedium',
        heavy: 'impactHeavy',
        success: 'notificationSuccess',
        warning: 'notificationWarning',
        error: 'notificationError',
      };
      
      HapticFeedback.trigger(hapticType[type] || hapticType.light);
    } else {
      Vibration.vibrate(type === 'heavy' ? 100 : 50);
    }
  };
  
  // Gesture handler
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (event) => {
      if (disabled) return;
      
      runOnJS(setIsSwipeActive)(true);
      runOnJS(setHasTriggered)(false);
      hasHapticFeedback.current = false;
      
      scale.value = withSpring(0.98, SPRING_CONFIG);
      indicatorOpacity.value = withTiming(1, { duration: 200 });
      
      if (onSwipeStart) {
        runOnJS(onSwipeStart)(event);
      }
    },
    
    onActive: (event) => {
      if (disabled) return;
      
      const { translationX, translationY, velocityX, velocityY } = event;
      
      // Update translations based on direction
      if (direction === SWIPE_DIRECTIONS.HORIZONTAL || direction === SWIPE_DIRECTIONS.LEFT || direction === SWIPE_DIRECTIONS.RIGHT) {
        translateX.value = translationX;
      }
      
      if (direction === SWIPE_DIRECTIONS.VERTICAL || direction === SWIPE_DIRECTIONS.UP || direction === SWIPE_DIRECTIONS.DOWN) {
        translateY.value = translationY;
      }
      
      // Calculate progress
      const progress = Math.abs(translationX) / swipeThreshold;
      progressWidth.value = Math.min(progress, 1) * 100;
      
      // Determine active action
      const swipeActions = getSwipeActions();
      let currentAction = null;
      
      if (Math.abs(translationX) > 20) {
        if (translationX > 0 && swipeActions[SWIPE_DIRECTIONS.RIGHT]) {
          currentAction = swipeActions[SWIPE_DIRECTIONS.RIGHT];
        } else if (translationX < 0 && swipeActions[SWIPE_DIRECTIONS.LEFT]) {
          currentAction = swipeActions[SWIPE_DIRECTIONS.LEFT];
        }
      }
      
      if (Math.abs(translationY) > 20) {
        if (translationY < 0 && swipeActions[SWIPE_DIRECTIONS.UP]) {
          currentAction = swipeActions[SWIPE_DIRECTIONS.UP];
        } else if (translationY > 0 && swipeActions[SWIPE_DIRECTIONS.DOWN]) {
          currentAction = swipeActions[SWIPE_DIRECTIONS.DOWN];
        }
      }
      
      runOnJS(setActiveAction)(currentAction);
      
      // Trigger haptic feedback at threshold
      const passedThreshold = Math.abs(translationX) > swipeThreshold || Math.abs(translationY) > swipeThreshold;
      if (passedThreshold && !hasHapticFeedback.current) {
        hasHapticFeedback.current = true;
        runOnJS(triggerHapticFeedback)('medium');
      }
      
      // Progress callback
      if (onSwipeProgress) {
        runOnJS(onSwipeProgress)({
          progress: Math.min(progress, 1),
          activeAction: currentAction,
          translation: { x: translationX, y: translationY },
        });
      }
    },
    
    onEnd: (event) => {
      if (disabled) return;
      
      const { translationX, translationY, velocityX, velocityY } = event;
      const swipeActions = getSwipeActions();
      
      // Determine if swipe should trigger action
      const shouldTrigger = 
        Math.abs(translationX) > swipeThreshold || 
        Math.abs(translationY) > swipeThreshold ||
        Math.abs(velocityX) > velocityThreshold ||
        Math.abs(velocityY) > velocityThreshold;
      
      let triggeredAction = null;
      
      if (shouldTrigger) {
        if (Math.abs(translationX) > Math.abs(translationY)) {
          // Horizontal swipe
          if (translationX > 0 && swipeActions[SWIPE_DIRECTIONS.RIGHT]) {
            triggeredAction = swipeActions[SWIPE_DIRECTIONS.RIGHT];
          } else if (translationX < 0 && swipeActions[SWIPE_DIRECTIONS.LEFT]) {
            triggeredAction = swipeActions[SWIPE_DIRECTIONS.LEFT];
          }
        } else {
          // Vertical swipe
          if (translationY < 0 && swipeActions[SWIPE_DIRECTIONS.UP]) {
            triggeredAction = swipeActions[SWIPE_DIRECTIONS.UP];
          } else if (translationY > 0 && swipeActions[SWIPE_DIRECTIONS.DOWN]) {
            triggeredAction = swipeActions[SWIPE_DIRECTIONS.DOWN];
          }
        }
      }
      
      if (triggeredAction) {
        runOnJS(setHasTriggered)(true);
        runOnJS(handleActionTrigger)(triggeredAction);
        
        // Success haptic
        runOnJS(triggerHapticFeedback)('success');
        
        if (onSwipeComplete) {
          runOnJS(onSwipeComplete)(triggeredAction);
        }
      } else {
        // Cancel swipe
        if (onSwipeCancel) {
          runOnJS(onSwipeCancel)(event);
        }
      }
      
      // Reset animations
      if (autoReset && !hasTriggered) {
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
      
      scale.value = withSpring(1, SPRING_CONFIG);
      indicatorOpacity.value = withTiming(0, { duration: 300 });
      progressWidth.value = withTiming(0, { duration: 300 });
      
      runOnJS(setIsSwipeActive)(false);
      runOnJS(setActiveAction)(null);
    },
  });
  
  // Handle action trigger
  const handleActionTrigger = (action) => {
    if (requireConfirmation && urgency !== 'critical') {
      Alert.alert(
        action.text,
        'Are you sure you want to proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => {
              if (onActionTrigger) {
                onActionTrigger(action);
              }
            },
            style: urgency === 'high' ? 'destructive' : 'default',
          },
        ]
      );
    } else {
      if (onActionTrigger) {
        onActionTrigger(action);
      }
    }
  };
  
  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });
  
  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    if (!activeAction) return { backgroundColor: 'transparent' };
    
    const progress = Math.min(
      Math.abs(translateX.value) / swipeThreshold,
      Math.abs(translateY.value) / swipeThreshold,
      1
    );
    
    return {
      backgroundColor: activeAction.color + Math.round(progress * 50).toString(16),
    };
  });
  
  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
  }));
  
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));
  
  // Render swipe indicators
  const renderIndicators = () => {
    if (!showIndicators) return null;
    
    const swipeActions = getSwipeActions();
    const urgencyStyle = getUrgencyStyle();
    
    return (
      <AnimatedView
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg,
          },
          indicatorAnimatedStyle,
        ]}
        pointerEvents="none"
      >
        {/* Left action indicator */}
        {swipeActions[SWIPE_DIRECTIONS.LEFT] && (
          <View style={{
            backgroundColor: swipeActions[SWIPE_DIRECTIONS.LEFT].color,
            borderRadius: BORDER_RADIUS.pill,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            opacity: activeAction === swipeActions[SWIPE_DIRECTIONS.LEFT] ? 1 : 0.6,
          }}>
            <Text style={{
              ...TYPOGRAPHY.caption,
              color: COLORS.text.inverse,
              fontWeight: 'bold',
            }}>
              {swipeActions[SWIPE_DIRECTIONS.LEFT].icon} {swipeActions[SWIPE_DIRECTIONS.LEFT].confirmText}
            </Text>
          </View>
        )}
        
        {/* Right action indicator */}
        {swipeActions[SWIPE_DIRECTIONS.RIGHT] && (
          <View style={{
            backgroundColor: swipeActions[SWIPE_DIRECTIONS.RIGHT].color,
            borderRadius: BORDER_RADIUS.pill,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            opacity: activeAction === swipeActions[SWIPE_DIRECTIONS.RIGHT] ? 1 : 0.6,
          }}>
            <Text style={{
              ...TYPOGRAPHY.caption,
              color: COLORS.text.inverse,
              fontWeight: 'bold',
            }}>
              {swipeActions[SWIPE_DIRECTIONS.RIGHT].confirmText} {swipeActions[SWIPE_DIRECTIONS.RIGHT].icon}
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  // Render progress indicator
  const renderProgress = () => {
    if (!showProgress || !activeAction) return null;
    
    return (
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: COLORS.neutral.gray[200],
        borderRadius: 2,
      }}>
        <AnimatedView
          style={[
            {
              height: '100%',
              backgroundColor: activeAction.color,
              borderRadius: 2,
            },
            progressAnimatedStyle,
          ]}
        />
      </View>
    );
  };
  
  // Main container styles
  const urgencyStyle = getUrgencyStyle();
  const containerStyles = [
    {
      backgroundColor: urgencyStyle.backgroundColor,
      borderWidth: 1,
      borderColor: urgencyStyle.borderColor,
      borderRadius: BORDER_RADIUS.card,
      overflow: 'hidden',
      ...SHADOWS.card,
    },
    containerStyle,
  ];
  
  return (
    <GestureHandlerRootView style={[{ flex: 1 }, style]} testID={testID}>
      <PanGestureHandler
        ref={gestureRef}
        onGestureEvent={gestureHandler}
        onHandlerStateChange={gestureHandler}
        activeOffsetX={direction.includes('horizontal') || direction === SWIPE_DIRECTIONS.LEFT || direction === SWIPE_DIRECTIONS.RIGHT ? [-10, 10] : undefined}
        activeOffsetY={direction.includes('vertical') || direction === SWIPE_DIRECTIONS.UP || direction === SWIPE_DIRECTIONS.DOWN ? [-10, 10] : undefined}
        enabled={!disabled}
      >
        <AnimatedView style={containerStyles}>
          {/* Background color animation */}
          <AnimatedView
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
              backgroundAnimatedStyle,
            ]}
          />
          
          {/* Main content */}
          <AnimatedView style={containerAnimatedStyle}>
            {children}
          </AnimatedView>
          
          {/* Swipe indicators */}
          {renderIndicators()}
          
          {/* Progress indicator */}
          {renderProgress()}
        </AnimatedView>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

// Specialized swipe gesture components
export const MedicationSwipeCard = ({ 
  medication, 
  onTaken, 
  onSkipped, 
  urgent = false,
  overdue = false,
  ...props 
}) => {
  const urgencyLevel = overdue ? 'critical' : urgent ? 'high' : 'normal';
  
  return (
    <SwipeGesture
      direction={SWIPE_DIRECTIONS.HORIZONTAL}
      actions={{
        [SWIPE_DIRECTIONS.RIGHT]: {
          ...MEDICAL_ACTIONS.TAKE_MEDICATION,
          text: 'Take ' + medication?.name,
        },
        [SWIPE_DIRECTIONS.LEFT]: {
          ...MEDICAL_ACTIONS.SKIP_MEDICATION,
          text: 'Skip ' + medication?.name,
        },
      }}
      onActionTrigger={(action) => {
        if (action.direction === SWIPE_DIRECTIONS.RIGHT) {
          onTaken?.(medication);
        } else {
          onSkipped?.(medication);
        }
      }}
      urgency={urgencyLevel}
      requireConfirmation={overdue}
      {...props}
    />
  );
};

export const EmergencySwipeButton = ({ onEmergencyCall, ...props }) => (
  <SwipeGesture
    medicalAction="EMERGENCY_CALL"
    onActionTrigger={onEmergencyCall}
    urgency="critical"
    requireConfirmation={false}
    enableHaptics
    {...props}
  />
);

export const AppointmentSwipeCard = ({ 
  appointment, 
  onComplete, 
  onCancel,
  ...props 
}) => (
  <SwipeGesture
    direction={SWIPE_DIRECTIONS.HORIZONTAL}
    actions={{
      [SWIPE_DIRECTIONS.RIGHT]: {
        ...MEDICAL_ACTIONS.COMPLETE_APPOINTMENT,
        text: 'Complete appointment',
      },
      [SWIPE_DIRECTIONS.LEFT]: {
        color: COLORS.status.error.main,
        icon: '❌',
        text: 'Cancel appointment',
        confirmText: 'Swipe to cancel',
      },
    }}
    onActionTrigger={(action) => {
      if (action.direction === SWIPE_DIRECTIONS.RIGHT) {
        onComplete?.(appointment);
      } else {
        onCancel?.(appointment);
      }
    }}
    requireConfirmation
    {...props}
  />
);

export const DeleteSwipeAction = ({ 
  item, 
  onDelete, 
  confirmationRequired = true,
  ...props 
}) => (
  <SwipeGesture
    medicalAction="DELETE_ITEM"
    onActionTrigger={() => onDelete?.(item)}
    requireConfirmation={confirmationRequired}
    urgency="high"
    {...props}
  />
);

export default SwipeGesture;