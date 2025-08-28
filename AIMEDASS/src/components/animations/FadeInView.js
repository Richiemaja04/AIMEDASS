/**
 * MediAssist App - FadeInView Component
 * Smooth fade-in animations with medical-themed timing and effects
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

// Styles
import { COLORS } from '../../../styles/colors';

const AnimatedView = Animated.createAnimatedComponent(View);

// Fade animation types
const FADE_TYPES = {
  FADE_IN: 'fadeIn',
  FADE_OUT: 'fadeOut',
  FADE_IN_OUT: 'fadeInOut',
  PULSE_FADE: 'pulseFade',
  MEDICAL_FADE: 'medicalFade',
  CROSS_FADE: 'crossFade',
};

// Animation presets for medical contexts
const MEDICAL_PRESETS = {
  vital: {
    duration: 800,
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    initialOpacity: 0,
    targetOpacity: 1,
  },
  medication: {
    duration: 600,
    easing: Easing.out(Easing.quad),
    initialOpacity: 0,
    targetOpacity: 1,
  },
  emergency: {
    duration: 400,
    easing: Easing.out(Easing.back(1.1)),
    initialOpacity: 0,
    targetOpacity: 1,
  },
  gentle: {
    duration: 1000,
    easing: Easing.inOut(Easing.ease),
    initialOpacity: 0,
    targetOpacity: 1,
  },
  quick: {
    duration: 300,
    easing: Easing.out(Easing.ease),
    initialOpacity: 0,
    targetOpacity: 1,
  },
};

const FadeInView = forwardRef(({
  // Content props
  children,
  
  // Animation props
  fadeType = FADE_TYPES.FADE_IN,
  preset = 'gentle',
  duration = 600,
  delay = 0,
  
  // Visibility props
  visible = true,
  autoStart = true,
  
  // Fade values
  initialOpacity = 0,
  targetOpacity = 1,
  
  // Timing props
  easing = Easing.out(Easing.ease),
  
  // Medical-themed props
  medicalContext, // 'vital', 'medication', 'emergency', 'appointment'
  healthStatus, // 'normal', 'warning', 'critical'
  
  // Interaction props
  onFadeInComplete,
  onFadeOutComplete,
  onAnimationStart,
  
  // Loop props
  loop = false,
  loopDelay = 1000,
  reverseOnLoop = false,
  
  // Custom styles
  style,
  
  // Test props
  testID,
}, ref) => {
  // Animation values
  const opacity = useSharedValue(initialOpacity);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  
  // Refs
  const hasStarted = useRef(false);
  const isLooping = useRef(false);
  const animationRef = useRef(null);
  
  // Get medical preset if specified
  const getMedicalPreset = () => {
    if (medicalContext && MEDICAL_PRESETS[medicalContext]) {
      return MEDICAL_PRESETS[medicalContext];
    }
    return MEDICAL_PRESETS[preset] || MEDICAL_PRESETS.gentle;
  };
  
  // Get health status color influence
  const getHealthStatusEffect = () => {
    switch (healthStatus) {
      case 'critical':
        return {
          pulseIntensity: 1.1,
          glowEffect: true,
          fastAnimation: true,
        };
      case 'warning':
        return {
          pulseIntensity: 1.05,
          glowEffect: false,
          fastAnimation: false,
        };
      case 'normal':
      default:
        return {
          pulseIntensity: 1.02,
          glowEffect: false,
          fastAnimation: false,
        };
    }
  };
  
  // Expose animation controls via ref
  useImperativeHandle(ref, () => ({
    fadeIn: () => animateFadeIn(),
    fadeOut: () => animateFadeOut(),
    reset: () => resetAnimation(),
    stop: () => stopAnimation(),
    getCurrentOpacity: () => opacity.value,
  }));
  
  // Main fade in animation
  const animateFadeIn = (customDuration, customDelay = 0) => {
    if (hasStarted.current && !loop) return;
    hasStarted.current = true;
    
    const medicalPreset = getMedicalPreset();
    const statusEffect = getHealthStatusEffect();
    const animationDuration = statusEffect.fastAnimation 
      ? (customDuration || medicalPreset.duration) * 0.7 
      : (customDuration || medicalPreset.duration);
    
    // Start callback
    if (onAnimationStart) {
      runOnJS(onAnimationStart)();
    }
    
    // Reset values for fade in
    opacity.value = medicalPreset.initialOpacity;
    
    // Additional effects based on fade type
    switch (fadeType) {
      case FADE_TYPES.MEDICAL_FADE:
        // Medical fade with slight scale and translate
        scale.value = 0.98;
        translateY.value = 5;
        
        opacity.value = withDelay(
          delay + customDelay,
          withTiming(medicalPreset.targetOpacity, {
            duration: animationDuration,
            easing: medicalPreset.easing,
          }, () => {
            if (onFadeInComplete) {
              runOnJS(onFadeInComplete)();
            }
          })
        );
        
        scale.value = withDelay(
          delay + customDelay + 100,
          withSpring(1, {
            duration: animationDuration * 0.8,
            dampingRatio: 0.8,
          })
        );
        
        translateY.value = withDelay(
          delay + customDelay + 150,
          withSpring(0, {
            duration: animationDuration * 0.9,
            dampingRatio: 0.7,
          })
        );
        break;
        
      case FADE_TYPES.PULSE_FADE:
        // Pulse fade with scale animation
        opacity.value = withDelay(
          delay + customDelay,
          withTiming(medicalPreset.targetOpacity, {
            duration: animationDuration,
            easing: medicalPreset.easing,
          })
        );
        
        scale.value = withDelay(
          delay + customDelay,
          withSequence(
            withTiming(statusEffect.pulseIntensity, {
              duration: animationDuration * 0.3,
            }),
            withTiming(1, {
              duration: animationDuration * 0.7,
            })
          )
        );
        
        if (onFadeInComplete) {
          setTimeout(() => {
            runOnJS(onFadeInComplete)();
          }, delay + customDelay + animationDuration);
        }
        break;
        
      case FADE_TYPES.FADE_IN_OUT:
        // Fade in then out
        opacity.value = withDelay(
          delay + customDelay,
          withSequence(
            withTiming(medicalPreset.targetOpacity, {
              duration: animationDuration * 0.4,
              easing: medicalPreset.easing,
            }),
            withTiming(medicalPreset.initialOpacity, {
              duration: animationDuration * 0.6,
              easing: Easing.in(Easing.ease),
            })
          ),
          () => {
            if (onFadeOutComplete) {
              runOnJS(onFadeOutComplete)();
            }
          }
        );
        break;
        
      case FADE_TYPES.FADE_IN:
      default:
        // Standard fade in
        opacity.value = withDelay(
          delay + customDelay,
          withTiming(medicalPreset.targetOpacity, {
            duration: animationDuration,
            easing: medicalPreset.easing,
          }, () => {
            if (onFadeInComplete) {
              runOnJS(onFadeInComplete)();
            }
          })
        );
        break;
    }
    
    // Setup looping if enabled
    if (loop && !isLooping.current) {
      setupLooping();
    }
  };
  
  // Main fade out animation
  const animateFadeOut = (customDuration, customDelay = 0) => {
    const medicalPreset = getMedicalPreset();
    const statusEffect = getHealthStatusEffect();
    const animationDuration = statusEffect.fastAnimation 
      ? (customDuration || medicalPreset.duration) * 0.5 
      : (customDuration || medicalPreset.duration) * 0.7;
    
    opacity.value = withDelay(
      customDelay,
      withTiming(medicalPreset.initialOpacity, {
        duration: animationDuration,
        easing: Easing.in(Easing.ease),
      }, () => {
        if (onFadeOutComplete) {
          runOnJS(onFadeOutComplete)();
        }
        hasStarted.current = false;
      })
    );
    
    // Additional exit effects
    if (fadeType === FADE_TYPES.MEDICAL_FADE) {
      scale.value = withDelay(
        customDelay,
        withTiming(0.95, {
          duration: animationDuration,
        })
      );
      
      translateY.value = withDelay(
        customDelay,
        withTiming(-5, {
          duration: animationDuration,
        })
      );
    }
  };
  
  // Setup looping animation
  const setupLooping = () => {
    if (isLooping.current) return;
    isLooping.current = true;
    
    const runLoop = () => {
      if (!isLooping.current) return;
      
      if (reverseOnLoop) {
        // Reverse animation - fade out then in
        animateFadeOut(duration * 0.5, 0);
        setTimeout(() => {
          if (isLooping.current) {
            animateFadeIn(duration * 0.5, loopDelay);
            setTimeout(runLoop, duration + loopDelay * 2);
          }
        }, duration * 0.5 + 100);
      } else {
        // Pulse animation - scale or opacity pulse
        if (fadeType === FADE_TYPES.PULSE_FADE) {
          const statusEffect = getHealthStatusEffect();
          scale.value = withSequence(
            withTiming(statusEffect.pulseIntensity, { duration: duration * 0.3 }),
            withTiming(1, { duration: duration * 0.7 })
          );
        } else {
          opacity.value = withSequence(
            withTiming(targetOpacity * 0.7, { duration: duration * 0.3 }),
            withTiming(targetOpacity, { duration: duration * 0.7 })
          );
        }
        
        setTimeout(runLoop, duration + loopDelay);
      }
    };
    
    // Start first loop iteration
    setTimeout(runLoop, duration + loopDelay);
  };
  
  // Reset animation to initial state
  const resetAnimation = () => {
    const medicalPreset = getMedicalPreset();
    opacity.value = medicalPreset.initialOpacity;
    scale.value = 1;
    translateY.value = 0;
    hasStarted.current = false;
    isLooping.current = false;
  };
  
  // Stop all animations
  const stopAnimation = () => {
    isLooping.current = false;
    hasStarted.current = false;
  };
  
  // Handle visibility changes
  useEffect(() => {
    if (visible && autoStart) {
      animateFadeIn();
    } else if (!visible) {
      animateFadeOut();
    }
  }, [visible, autoStart]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, []);
  
  // Emergency context effects
  useEffect(() => {
    if (medicalContext === 'emergency' && visible) {
      // Emergency pulsing effect
      const emergencyPulse = () => {
        opacity.value = withSequence(
          withTiming(0.7, { duration: 200 }),
          withTiming(1, { duration: 200 }),
          withTiming(0.7, { duration: 200 }),
          withTiming(1, { duration: 200 })
        );
      };
      
      const emergencyInterval = setInterval(emergencyPulse, 2000);
      return () => clearInterval(emergencyInterval);
    }
  }, [medicalContext, visible]);
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    const baseStyle = {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
    };
    
    // Add glow effect for critical health status
    if (healthStatus === 'critical') {
      const glowIntensity = interpolate(
        opacity.value,
        [0, 1],
        [0, 0.3]
      );
      
      baseStyle.shadowColor = COLORS.status.error.main;
      baseStyle.shadowOffset = { width: 0, height: 0 };
      baseStyle.shadowRadius = interpolate(opacity.value, [0, 1], [0, 10]);
      baseStyle.shadowOpacity = glowIntensity;
      baseStyle.elevation = glowIntensity * 5;
    }
    
    return baseStyle;
  });
  
  return (
    <AnimatedView
      ref={animationRef}
      style={[style, animatedStyle]}
      testID={testID}
    >
      {children}
    </AnimatedView>
  );
});

FadeInView.displayName = 'FadeInView';

// Specialized fade-in components for medical contexts
export const VitalSignFade = ({ vitalType, value, normalRange, ...props }) => {
  const getHealthStatus = () => {
    if (!normalRange || !value) return 'normal';
    
    if (value < normalRange.min * 0.8 || value > normalRange.max * 1.2) {
      return 'critical';
    } else if (value < normalRange.min || value > normalRange.max) {
      return 'warning';
    }
    return 'normal';
  };
  
  return (
    <FadeInView
      medicalContext="vital"
      healthStatus={getHealthStatus()}
      fadeType={FADE_TYPES.MEDICAL_FADE}
      {...props}
    />
  );
};

export const MedicationReminderFade = ({ urgent = false, ...props }) => (
  <FadeInView
    medicalContext="medication"
    healthStatus={urgent ? 'critical' : 'normal'}
    fadeType={urgent ? FADE_TYPES.PULSE_FADE : FADE_TYPES.FADE_IN}
    loop={urgent}
    loopDelay={urgent ? 500 : 1000}
    {...props}
  />
);

export const EmergencyAlertFade = ({ ...props }) => (
  <FadeInView
    medicalContext="emergency"
    healthStatus="critical"
    fadeType={FADE_TYPES.PULSE_FADE}
    loop
    loopDelay={300}
    {...props}
  />
);

export const AppointmentNotificationFade = ({ upcoming = false, ...props }) => (
  <FadeInView
    medicalContext="appointment"
    healthStatus={upcoming ? 'warning' : 'normal'}
    fadeType={upcoming ? FADE_TYPES.PULSE_FADE : FADE_TYPES.FADE_IN}
    {...props}
  />
);

export const GentleMedicalFade = ({ ...props }) => (
  <FadeInView
    medicalContext="gentle"
    fadeType={FADE_TYPES.MEDICAL_FADE}
    preset="gentle"
    {...props}
  />
);

// Staggered fade-in component for lists
export const StaggeredFadeInList = ({ 
  children, 
  staggerDelay = 100, 
  medicalContext,
  ...props 
}) => {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <FadeInView
          key={index}
          delay={index * staggerDelay}
          medicalContext={medicalContext}
          {...props}
        >
          {child}
        </FadeInView>
      ))}
    </>
  );
};

// Cross-fade component for transitioning between states
export const CrossFadeTransition = ({
  showFirst = true,
  firstChild,
  secondChild,
  duration = 400,
  ...props
}) => {
  return (
    <View style={{ position: 'relative' }}>
      <FadeInView
        visible={showFirst}
        duration={duration}
        fadeType={FADE_TYPES.CROSS_FADE}
        style={{ position: showFirst ? 'relative' : 'absolute' }}
        {...props}
      >
        {firstChild}
      </FadeInView>
      
      <FadeInView
        visible={!showFirst}
        duration={duration}
        fadeType={FADE_TYPES.CROSS_FADE}
        style={{ position: !showFirst ? 'relative' : 'absolute' }}
        {...props}
      >
        {secondChild}
      </FadeInView>
    </View>
  );
};

export default FadeInView;