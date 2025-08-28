/**
 * MediAssist App - PulseAnimation Component
 * Medical-themed pulse animations for vital signs, alerts, and notifications
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  interpolate,
  interpolateColor,
  runOnJS,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

// Styles
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Pulse animation types
const PULSE_TYPES = {
  HEARTBEAT: 'heartbeat',
  MEDICAL_ALERT: 'medical_alert',
  BREATHING: 'breathing',
  EMERGENCY: 'emergency',
  GENTLE: 'gentle',
  NOTIFICATION: 'notification',
  VITAL_SIGN: 'vital_sign',
  MEDICATION_REMINDER: 'medication_reminder',
};

// Medical pulse patterns
const MEDICAL_PATTERNS = {
  [PULSE_TYPES.HEARTBEAT]: {
    pattern: [
      { scale: 1, duration: 100 },
      { scale: 1.15, duration: 150 },
      { scale: 1, duration: 100 },
      { scale: 1.08, duration: 120 },
      { scale: 1, duration: 430 }, // Rest period
    ],
    interval: 1000, // 60 BPM
    color: COLORS.medical.vital.heartRate,
  },
  [PULSE_TYPES.BREATHING]: {
    pattern: [
      { scale: 1, duration: 1500 }, // Inhale
      { scale: 1.05, duration: 500 }, // Hold
      { scale: 1, duration: 2000 }, // Exhale
    ],
    interval: 4000, // 15 breaths per minute
    color: COLORS.medical.vital.oxygen,
  },
  [PULSE_TYPES.EMERGENCY]: {
    pattern: [
      { scale: 1, duration: 200 },
      { scale: 1.2, duration: 200 },
      { scale: 1, duration: 200 },
      { scale: 1.2, duration: 200 },
      { scale: 1, duration: 400 },
    ],
    interval: 800,
    color: COLORS.accent.main,
  },
  [PULSE_TYPES.MEDICAL_ALERT]: {
    pattern: [
      { scale: 1, duration: 300 },
      { scale: 1.1, duration: 400 },
      { scale: 1, duration: 300 },
    ],
    interval: 2000,
    color: COLORS.status.warning.main,
  },
  [PULSE_TYPES.GENTLE]: {
    pattern: [
      { scale: 1, duration: 800 },
      { scale: 1.03, duration: 800 },
      { scale: 1, duration: 800 },
    ],
    interval: 2400,
    color: COLORS.primary.main,
  },
  [PULSE_TYPES.NOTIFICATION]: {
    pattern: [
      { scale: 1, duration: 400 },
      { scale: 1.08, duration: 400 },
      { scale: 1, duration: 400 },
    ],
    interval: 1200,
    color: COLORS.status.info.main,
  },
  [PULSE_TYPES.VITAL_SIGN]: {
    pattern: [
      { scale: 1, duration: 600 },
      { scale: 1.06, duration: 300 },
      { scale: 1, duration: 600 },
    ],
    interval: 1500,
    color: COLORS.secondary.main,
  },
  [PULSE_TYPES.MEDICATION_REMINDER]: {
    pattern: [
      { scale: 1, duration: 500 },
      { scale: 1.12, duration: 300 },
      { scale: 1, duration: 200 },
      { scale: 1.08, duration: 200 },
      { scale: 1, duration: 500 },
    ],
    interval: 3000,
    color: COLORS.medical.medication.prescription,
  },
};

const PulseAnimation = forwardRef(({
  // Content props
  children,
  
  // Animation props
  pulseType = PULSE_TYPES.GENTLE,
  customPattern,
  
  // Control props
  active = true,
  autoStart = true,
  loop = true,
  
  // Timing props
  speed = 1, // Multiplier for all durations
  delay = 0,
  maxIterations = -1, // -1 for infinite
  
  // Visual props
  pulseColor,
  showRipple = false,
  rippleColor,
  showGlow = false,
  glowColor,
  glowIntensity = 0.5,
  
  // Medical props
  bpm, // Beats per minute for heartbeat
  vitalValue, // For vital sign based animations
  vitalRange, // Normal range for vital signs
  urgency = 'normal', // 'low', 'normal', 'high', 'critical'
  
  // Event handlers
  onPulseStart,
  onPulseComplete,
  onPatternComplete,
  
  // Style props
  style,
  
  // Test props
  testID,
}, ref) => {
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const rotateValue = useSharedValue(0);
  
  // Refs
  const isAnimating = useRef(false);
  const iterationCount = useRef(0);
  const animationTimeout = useRef(null);
  
  // Get pulse pattern based on type or custom pattern
  const getPulsePattern = () => {
    if (customPattern) return customPattern;
    
    let pattern = MEDICAL_PATTERNS[pulseType];
    
    // Adjust pattern based on BPM for heartbeat
    if (pulseType === PULSE_TYPES.HEARTBEAT && bpm) {
      const intervalMs = (60 / bpm) * 1000;
      pattern = {
        ...pattern,
        interval: intervalMs,
      };
    }
    
    // Adjust pattern based on urgency
    if (urgency !== 'normal') {
      const urgencyMultipliers = {
        low: 1.5,
        normal: 1,
        high: 0.7,
        critical: 0.4,
      };
      
      const multiplier = urgencyMultipliers[urgency] || 1;
      pattern = {
        ...pattern,
        pattern: pattern.pattern.map(step => ({
          ...step,
          duration: step.duration * multiplier,
        })),
        interval: pattern.interval * multiplier,
      };
    }
    
    return pattern;
  };
  
  // Get color based on vital value and range
  const getVitalBasedColor = () => {
    if (!vitalValue || !vitalRange) return null;
    
    if (vitalValue < vitalRange.min * 0.8 || vitalValue > vitalRange.max * 1.2) {
      return COLORS.status.error.main;
    } else if (vitalValue < vitalRange.min || vitalValue > vitalRange.max) {
      return COLORS.status.warning.main;
    }
    return COLORS.status.success.main;
  };
  
  // Expose animation controls
  useImperativeHandle(ref, () => ({
    start: () => startPulse(),
    stop: () => stopPulse(),
    pause: () => pausePulse(),
    resume: () => resumePulse(),
    reset: () => resetAnimation(),
    getCurrentScale: () => scale.value,
  }));
  
  // Start pulse animation
  const startPulse = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    iterationCount.current = 0;
    
    if (onPulseStart) {
      runOnJS(onPulseStart)();
    }
    
    executePulsePattern();
  };
  
  // Execute pulse pattern
  const executePulsePattern = () => {
    if (!isAnimating.current) return;
    
    const pattern = getPulsePattern();
    const adjustedSpeed = speed;
    
    // Create sequence of scale animations
    const scaleSequence = pattern.pattern.map((step, index) => {
      const duration = step.duration / adjustedSpeed;
      const easing = step.easing || Easing.inOut(Easing.ease);
      
      return withTiming(step.scale, { duration, easing });
    });
    
    // Execute the sequence
    scale.value = withSequence(
      ...scaleSequence,
      withTiming(1, { duration: 100 }) // Ensure we end at scale 1
    );
    
    // Handle ripple effect
    if (showRipple) {
      executeRippleEffect(pattern);
    }
    
    // Handle glow effect
    if (showGlow) {
      executeGlowEffect(pattern);
    }
    
    // Schedule next iteration
    const totalDuration = pattern.pattern.reduce((sum, step) => sum + step.duration, 0);
    const intervalDelay = Math.max(pattern.interval - totalDuration, 0);
    
    animationTimeout.current = setTimeout(() => {
      iterationCount.current++;
      
      if (onPatternComplete) {
        runOnJS(onPatternComplete)(iterationCount.current);
      }
      
      if (loop && (maxIterations === -1 || iterationCount.current < maxIterations)) {
        executePulsePattern();
      } else {
        stopPulse();
      }
    }, (totalDuration + intervalDelay) / adjustedSpeed);
  };
  
  // Execute ripple effect
  const executeRippleEffect = (pattern) => {
    const totalDuration = pattern.pattern.reduce((sum, step) => sum + step.duration, 0);
    
    rippleScale.value = 0;
    rippleOpacity.value = 0.6;
    
    rippleScale.value = withTiming(2, {
      duration: totalDuration / speed,
      easing: Easing.out(Easing.quad),
    });
    
    rippleOpacity.value = withTiming(0, {
      duration: totalDuration / speed,
      easing: Easing.out(Easing.quad),
    });
  };
  
  // Execute glow effect
  const executeGlowEffect = (pattern) => {
    const maxScale = Math.max(...pattern.pattern.map(step => step.scale));
    const glowIntensityValue = (maxScale - 1) * glowIntensity;
    
    glowOpacity.value = withSequence(
      withTiming(glowIntensityValue, { duration: 200 / speed }),
      withTiming(0, { duration: 800 / speed })
    );
  };
  
  // Stop pulse animation
  const stopPulse = () => {
    isAnimating.current = false;
    
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
      animationTimeout.current = null;
    }
    
    // Cancel all animations
    cancelAnimation(scale);
    cancelAnimation(rippleScale);
    cancelAnimation(rippleOpacity);
    cancelAnimation(glowOpacity);
    
    // Reset to default state
    scale.value = withTiming(1, { duration: 300 });
    rippleScale.value = 0;
    rippleOpacity.value = 0;
    glowOpacity.value = 0;
    
    if (onPulseComplete) {
      runOnJS(onPulseComplete)(iterationCount.current);
    }
  };
  
  // Pause pulse animation
  const pausePulse = () => {
    isAnimating.current = false;
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
      animationTimeout.current = null;
    }
  };
  
  // Resume pulse animation
  const resumePulse = () => {
    if (!isAnimating.current) {
      isAnimating.current = true;
      executePulsePattern();
    }
  };
  
  // Reset animation to initial state
  const resetAnimation = () => {
    stopPulse();
    iterationCount.current = 0;
    scale.value = 1;
    rippleScale.value = 0;
    rippleOpacity.value = 0;
    glowOpacity.value = 0;
  };
  
  // Handle active prop changes
  useEffect(() => {
    if (active && autoStart) {
      const startDelay = setTimeout(() => {
        startPulse();
      }, delay);
      
      return () => clearTimeout(startDelay);
    } else if (!active) {
      stopPulse();
    }
  }, [active, autoStart, delay]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPulse();
    };
  }, []);
  
  // Get effective colors
  const pattern = getPulsePattern();
  const effectiveColor = pulseColor || getVitalBasedColor() || pattern.color;
  const effectiveRippleColor = rippleColor || effectiveColor;
  const effectiveGlowColor = glowColor || effectiveColor;
  
  // Animated styles
  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const rippleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));
  
  const glowAnimatedStyle = useAnimatedStyle(() => {
    if (!showGlow) return {};
    
    return {
      shadowColor: effectiveGlowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: interpolate(glowOpacity.value, [0, 1], [0, 20]),
      shadowOpacity: glowOpacity.value,
      elevation: glowOpacity.value * 10,
    };
  });
  
  const containerStyle = [
    {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    style,
  ];
  
  return (
    <View style={containerStyle} testID={testID}>
      {/* Glow effect */}
      {showGlow && (
        <AnimatedView
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 1000, // Large radius for circular glow
            },
            glowAnimatedStyle,
          ]}
          pointerEvents="none"
        />
      )}
      
      {/* Ripple effect */}
      {showRipple && (
        <AnimatedView
          style={[
            {
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: 1000,
              backgroundColor: effectiveRippleColor,
              opacity: 0.3,
            },
            rippleAnimatedStyle,
          ]}
          pointerEvents="none"
        />
      )}
      
      {/* Main pulsing content */}
      <AnimatedView style={pulseAnimatedStyle}>
        {children}
      </AnimatedView>
    </View>
  );
});

PulseAnimation.displayName = 'PulseAnimation';

// Specialized pulse components
export const HeartbeatPulse = ({ bpm = 72, ...props }) => (
  <PulseAnimation
    pulseType={PULSE_TYPES.HEARTBEAT}
    bpm={bpm}
    showRipple
    rippleColor={COLORS.medical.vital.heartRate}
    {...props}
  />
);

export const BreathingPulse = ({ respirationRate = 16, ...props }) => {
  const breathingBPM = respirationRate; // Convert to pattern timing
  
  return (
    <PulseAnimation
      pulseType={PULSE_TYPES.BREATHING}
      speed={respirationRate / 16} // Adjust speed based on normal rate
      showGlow
      glowColor={COLORS.medical.vital.oxygen}
      glowIntensity={0.3}
      {...props}
    />
  );
};

export const EmergencyPulse = ({ critical = false, ...props }) => (
  <PulseAnimation
    pulseType={PULSE_TYPES.EMERGENCY}
    urgency={critical ? 'critical' : 'high'}
    showRipple
    showGlow
    glowColor={COLORS.accent.main}
    glowIntensity={critical ? 0.8 : 0.5}
    {...props}
  />
);

export const VitalSignPulse = ({ 
  vitalType, 
  value, 
  normalRange, 
  ...props 
}) => {
  const getVitalColor = () => {
    switch (vitalType) {
      case 'heartRate':
        return COLORS.medical.vital.heartRate;
      case 'bloodPressure':
        return COLORS.medical.vital.bloodPressure;
      case 'temperature':
        return COLORS.medical.vital.temperature;
      case 'oxygen':
        return COLORS.medical.vital.oxygen;
      default:
        return COLORS.primary.main;
    }
  };
  
  return (
    <PulseAnimation
      pulseType={PULSE_TYPES.VITAL_SIGN}
      vitalValue={value}
      vitalRange={normalRange}
      pulseColor={getVitalColor()}
      showGlow={value && normalRange && (value < normalRange.min || value > normalRange.max)}
      {...props}
    />
  );
};

export const MedicationReminderPulse = ({ urgent = false, overdue = false, ...props }) => {
  const getUrgency = () => {
    if (overdue) return 'critical';
    if (urgent) return 'high';
    return 'normal';
  };
  
  return (
    <PulseAnimation
      pulseType={PULSE_TYPES.MEDICATION_REMINDER}
      urgency={getUrgency()}
      showRipple={urgent || overdue}
      showGlow={overdue}
      glowColor={COLORS.medical.medication.prescription}
      {...props}
    />
  );
};

export const NotificationPulse = ({ priority = 'normal', ...props }) => {
  const getPulseType = () => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return PULSE_TYPES.MEDICAL_ALERT;
      case 'low':
        return PULSE_TYPES.GENTLE;
      default:
        return PULSE_TYPES.NOTIFICATION;
    }
  };
  
  return (
    <PulseAnimation
      pulseType={getPulseType()}
      urgency={priority}
      showRipple={priority === 'high' || priority === 'urgent'}
      {...props}
    />
  );
};

export const GentlePulse = ({ ...props }) => (
  <PulseAnimation
    pulseType={PULSE_TYPES.GENTLE}
    showGlow
    glowIntensity={0.2}
    {...props}
  />
);

// Synchronized pulse group for multiple elements
export const SynchronizedPulseGroup = ({ 
  children, 
  pulseType = PULSE_TYPES.GENTLE,
  staggerDelay = 100,
  ...props 
}) => {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <PulseAnimation
          key={index}
          pulseType={pulseType}
          delay={index * staggerDelay}
          {...props}
        >
          {child}
        </PulseAnimation>
      ))}
    </>
  );
};

export default PulseAnimation;