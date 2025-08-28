/**
 * MediAssist App - SlideInCard Component
 * Animated card with smooth slide-in transitions and medical-themed effects
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  interpolateColor,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

// Components
import Card from '../common/Card';

// Styles
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING, BORDER_RADIUS } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Slide directions
const SLIDE_DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down',
  FADE: 'fade',
  SCALE: 'scale',
  ROTATE: 'rotate',
};

// Animation presets
const ANIMATION_PRESETS = {
  gentle: {
    duration: 600,
    easing: Easing.out(Easing.quad),
    dampingRatio: 0.8,
  },
  bouncy: {
    duration: 800,
    easing: Easing.out(Easing.back(1.2)),
    dampingRatio: 0.6,
  },
  quick: {
    duration: 300,
    easing: Easing.out(Easing.ease),
    dampingRatio: 0.9,
  },
  medical: {
    duration: 700,
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    dampingRatio: 0.75,
  },
};

const SlideInCard = ({
  // Content props
  children,
  title,
  subtitle,
  
  // Animation props
  direction = SLIDE_DIRECTIONS.LEFT,
  preset = 'gentle',
  delay = 0,
  distance = 100,
  
  // Visibility props
  visible = true,
  autoShow = true,
  
  // Interaction props
  onPress,
  onAnimationComplete,
  
  // Stagger props (for multiple cards)
  index = 0,
  staggerDelay = 100,
  
  // Card appearance
  variant = 'default',
  gradient,
  
  // Medical-themed props
  medicalType, // 'vital', 'medication', 'appointment', 'emergency'
  statusColor,
  pulseEffect = false,
  glowEffect = false,
  
  // Custom styles
  style,
  contentStyle,
  
  // Test props
  testID,
}) => {
  // Animation values
  const translateX = useSharedValue(getInitialTranslateX());
  const translateY = useSharedValue(getInitialTranslateY());
  const opacity = useSharedValue(0);
  const scale = useSharedValue(direction === SLIDE_DIRECTIONS.SCALE ? 0.5 : 1);
  const rotation = useSharedValue(direction === SLIDE_DIRECTIONS.ROTATE ? -10 : 0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const pressScale = useSharedValue(1);
  
  // Refs
  const hasAnimated = useRef(false);
  const animationPreset = ANIMATION_PRESETS[preset] || ANIMATION_PRESETS.gentle;
  
  // Get initial transform values based on direction
  function getInitialTranslateX() {
    switch (direction) {
      case SLIDE_DIRECTIONS.LEFT:
        return -distance;
      case SLIDE_DIRECTIONS.RIGHT:
        return distance;
      default:
        return 0;
    }
  }
  
  function getInitialTranslateY() {
    switch (direction) {
      case SLIDE_DIRECTIONS.UP:
        return distance;
      case SLIDE_DIRECTIONS.DOWN:
        return -distance;
      default:
        return 0;
    }
  }
  
  // Get medical theme colors
  const getMedicalColors = () => {
    switch (medicalType) {
      case 'vital':
        return {
          primary: COLORS.medical.vital.heartRate,
          secondary: COLORS.medical.vital.bloodPressure,
          gradient: [COLORS.medical.vital.heartRate, COLORS.medical.vital.oxygen],
        };
      case 'medication':
        return {
          primary: COLORS.medical.medication.prescription,
          secondary: COLORS.medical.medication.overTheCounter,
          gradient: [COLORS.medical.medication.prescription, COLORS.medical.medication.supplement],
        };
      case 'appointment':
        return {
          primary: COLORS.medical.appointment.scheduled,
          secondary: COLORS.medical.appointment.confirmed,
          gradient: [COLORS.medical.appointment.scheduled, COLORS.medical.appointment.confirmed],
        };
      case 'emergency':
        return {
          primary: COLORS.accent.main,
          secondary: COLORS.status.error.main,
          gradient: [COLORS.accent.main, COLORS.status.error.main],
        };
      default:
        return {
          primary: statusColor || COLORS.primary.main,
          secondary: COLORS.primary.light,
          gradient: gradient || COLORS.gradients.primary,
        };
    }
  };
  
  // Trigger entrance animation
  const triggerEntranceAnimation = () => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    
    const totalDelay = delay + (index * staggerDelay);
    
    // Main entrance animation
    const animateWithPreset = (value, target) => {
      return preset === 'bouncy' || preset === 'medical'
        ? withSpring(target, {
            duration: animationPreset.duration,
            dampingRatio: animationPreset.dampingRatio,
          })
        : withTiming(target, {
            duration: animationPreset.duration,
            easing: animationPreset.easing,
          });
    };
    
    // Stagger the animations slightly for smooth effect
    opacity.value = withDelay(totalDelay, animateWithPreset(opacity.value, 1));
    
    translateX.value = withDelay(
      totalDelay + 50,
      animateWithPreset(translateX.value, 0)
    );
    
    translateY.value = withDelay(
      totalDelay + 100,
      animateWithPreset(translateY.value, 0)
    );
    
    if (direction === SLIDE_DIRECTIONS.SCALE) {
      scale.value = withDelay(
        totalDelay + 150,
        animateWithPreset(scale.value, 1)
      );
    }
    
    if (direction === SLIDE_DIRECTIONS.ROTATE) {
      rotation.value = withDelay(
        totalDelay + 200,
        animateWithPreset(rotation.value, 0)
      );
    }
    
    // Completion callback
    if (onAnimationComplete) {
      const completionDelay = totalDelay + animationPreset.duration + 200;
      setTimeout(() => {
        runOnJS(onAnimationComplete)();
      }, completionDelay);
    }
  };
  
  // Trigger exit animation
  const triggerExitAnimation = () => {
    opacity.value = withTiming(0, { duration: 300 });
    translateX.value = withTiming(getInitialTranslateX() / 2, { duration: 300 });
    translateY.value = withTiming(getInitialTranslateY() / 2, { duration: 300 });
    scale.value = withTiming(0.8, { duration: 300 });
    hasAnimated.current = false;
  };
  
  // Handle visibility changes
  useEffect(() => {
    if (visible && autoShow) {
      triggerEntranceAnimation();
    } else if (!visible) {
      triggerExitAnimation();
    }
  }, [visible, autoShow]);
  
  // Pulse effect for medical cards
  useEffect(() => {
    if (pulseEffect && medicalType === 'emergency') {
      // Emergency pulse - faster and more noticeable
      pulseScale.value = withSequence(
        withTiming(1.05, { duration: 400 }),
        withTiming(1, { duration: 400 }),
        withTiming(1.05, { duration: 400 }),
        withTiming(1, { duration: 400 })
      );
      
      const interval = setInterval(() => {
        pulseScale.value = withSequence(
          withTiming(1.05, { duration: 400 }),
          withTiming(1, { duration: 400 })
        );
      }, 2000);
      
      return () => clearInterval(interval);
    } else if (pulseEffect) {
      // Gentle pulse for other medical types
      pulseScale.value = withSequence(
        withTiming(1.02, { duration: 800 }),
        withTiming(1, { duration: 800 })
      );
      
      const interval = setInterval(() => {
        pulseScale.value = withSequence(
          withTiming(1.02, { duration: 800 }),
          withTiming(1, { duration: 800 })
        );
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [pulseEffect, medicalType]);
  
  // Glow effect for emergency or important cards
  useEffect(() => {
    if (glowEffect) {
      glowOpacity.value = withSequence(
        withTiming(0.3, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      );
      
      const interval = setInterval(() => {
        glowOpacity.value = withSequence(
          withTiming(0.3, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        );
      }, 2500);
      
      return () => clearInterval(interval);
    }
  }, [glowEffect]);
  
  // Handle press interactions
  const handlePressIn = () => {
    pressScale.value = withSpring(0.98, {
      duration: 150,
      dampingRatio: 0.7,
    });
  };
  
  const handlePressOut = () => {
    pressScale.value = withSpring(1, {
      duration: 200,
      dampingRatio: 0.7,
    });
  };
  
  const handlePress = () => {
    if (onPress) {
      // Feedback animation
      pressScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 150 })
      );
      
      onPress();
    }
  };
  
  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { scale: pulseScale.value },
        { scale: pressScale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });
  
  // Glow animated style
  const glowAnimatedStyle = useAnimatedStyle(() => {
    const medicalColors = getMedicalColors();
    
    return {
      opacity: glowOpacity.value,
      shadowColor: medicalColors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 15,
      elevation: glowOpacity.value * 10,
    };
  });
  
  // Background gradient animated style
  const gradientAnimatedStyle = useAnimatedStyle(() => {
    if (!gradient && !medicalType) return {};
    
    const medicalColors = getMedicalColors();
    const backgroundOpacity = interpolate(
      opacity.value,
      [0, 1],
      [0, 0.1]
    );
    
    return {
      backgroundColor: medicalColors.primary + Math.round(backgroundOpacity * 255).toString(16),
    };
  });
  
  // Render medical indicator
  const renderMedicalIndicator = () => {
    if (!medicalType) return null;
    
    const medicalColors = getMedicalColors();
    const icons = {
      vital: '❤️',
      medication: '💊',
      appointment: '📅',
      emergency: '🚨',
    };
    
    return (
      <View style={{
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: medicalColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 12 }}>
          {icons[medicalType]}
        </Text>
      </View>
    );
  };
  
  // Render status indicator
  const renderStatusIndicator = () => {
    if (!statusColor) return null;
    
    return (
      <View style={{
        position: 'absolute',
        left: 0,
        top: SPACING.md,
        bottom: SPACING.md,
        width: 4,
        backgroundColor: statusColor,
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
      }} />
    );
  };
  
  // Main component styles
  const containerStyle = [
    {
      overflow: 'visible', // Allow glow effect to show
    },
    style,
  ];
  
  const cardContentStyle = [
    {
      position: 'relative',
    },
    contentStyle,
  ];
  
  // Render with gradient background if specified
  if (gradient || medicalType) {
    const medicalColors = getMedicalColors();
    const gradientColors = gradient || medicalColors.gradient;
    
    return (
      <AnimatedView
        style={[containerStyle, containerAnimatedStyle, glowAnimatedStyle]}
        testID={testID}
      >
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!onPress}
          activeOpacity={1}
        >
          <AnimatedLinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              {
                borderRadius: BORDER_RADIUS.card,
                padding: SPACING.lg,
                ...SHADOWS.card,
              },
              gradientAnimatedStyle,
            ]}
          >
            <View style={cardContentStyle}>
              {renderStatusIndicator()}
              {renderMedicalIndicator()}
              
              {title && (
                <Text style={{
                  ...TYPOGRAPHY.h5,
                  color: COLORS.text.inverse,
                  marginBottom: subtitle ? SPACING.xs : SPACING.sm,
                }}>
                  {title}
                </Text>
              )}
              
              {subtitle && (
                <Text style={{
                  ...TYPOGRAPHY.bodySmall,
                  color: COLORS.text.inverse,
                  opacity: 0.9,
                  marginBottom: SPACING.sm,
                }}>
                  {subtitle}
                </Text>
              )}
              
              {children}
            </View>
          </AnimatedLinearGradient>
        </TouchableOpacity>
      </AnimatedView>
    );
  }
  
  // Render with standard card
  return (
    <AnimatedView
      style={[containerStyle, containerAnimatedStyle, glowAnimatedStyle]}
      testID={testID}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
        activeOpacity={1}
      >
        <Card
          variant={variant}
          title={title}
          subtitle={subtitle}
          style={cardContentStyle}
        >
          {renderStatusIndicator()}
          {renderMedicalIndicator()}
          {children}
        </Card>
      </TouchableOpacity>
    </AnimatedView>
  );
};

// Specialized slide-in card components
export const MedicalSlideInCard = ({ 
  medicalType = 'vital',
  emergency = false,
  ...props 
}) => (
  <SlideInCard
    medicalType={emergency ? 'emergency' : medicalType}
    pulseEffect={emergency}
    glowEffect={emergency}
    preset={emergency ? 'bouncy' : 'medical'}
    {...props}
  />
);

export const VitalSignCard = ({ vital, trend, ...props }) => (
  <SlideInCard
    medicalType="vital"
    statusColor={
      trend === 'up' ? COLORS.status.success.main :
      trend === 'down' ? COLORS.status.error.main :
      COLORS.status.warning.main
    }
    direction={SLIDE_DIRECTIONS.UP}
    preset="gentle"
    {...props}
  >
    {/* Vital sign content would go here */}
    {props.children}
  </SlideInCard>
);

export const MedicationReminderCard = ({ urgent = false, ...props }) => (
  <SlideInCard
    medicalType="medication"
    pulseEffect={urgent}
    glowEffect={urgent}
    direction={SLIDE_DIRECTIONS.LEFT}
    preset={urgent ? 'bouncy' : 'gentle'}
    {...props}
  />
);

export const AppointmentCard = ({ upcoming = false, ...props }) => (
  <SlideInCard
    medicalType="appointment"
    pulseEffect={upcoming}
    direction={SLIDE_DIRECTIONS.RIGHT}
    preset="gentle"
    {...props}
  />
);

export const EmergencyAlert = ({ ...props }) => (
  <SlideInCard
    medicalType="emergency"
    pulseEffect
    glowEffect
    direction={SLIDE_DIRECTIONS.SCALE}
    preset="bouncy"
    {...props}
  />
);

// Staggered card list component
export const StaggeredCardList = ({ 
  cards = [], 
  staggerDelay = 150,
  direction = SLIDE_DIRECTIONS.LEFT,
  ...props 
}) => {
  return (
    <>
      {cards.map((cardProps, index) => (
        <SlideInCard
          key={cardProps.key || index}
          index={index}
          staggerDelay={staggerDelay}
          direction={direction}
          {...cardProps}
          {...props}
        />
      ))}
    </>
  );
};

export default SlideInCard;