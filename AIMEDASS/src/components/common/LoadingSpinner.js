/**
 * MediAssist App - LoadingSpinner Component
 * Professional loading components with medical-themed animations
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  interpolateColor,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING, BORDER_RADIUS } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Loading spinner variants
const VARIANTS = {
  default: {
    size: 40,
    color: COLORS.primary.main,
    backgroundColor: 'transparent',
  },
  small: {
    size: 24,
    color: COLORS.primary.main,
    backgroundColor: 'transparent',
  },
  large: {
    size: 60,
    color: COLORS.primary.main,
    backgroundColor: 'transparent',
  },
  medical: {
    size: 50,
    color: COLORS.medical.medication.prescription,
    backgroundColor: 'transparent',
  },
  overlay: {
    size: 50,
    color: COLORS.primary.main,
    backgroundColor: COLORS.background.modal,
  },
};

// Basic Loading Spinner
const LoadingSpinner = ({
  variant = 'default',
  size,
  color,
  visible = true,
  overlay = false,
  message,
  style,
  testID,
}) => {
  const variantConfig = VARIANTS[variant];
  const spinnerSize = size || variantConfig.size;
  const spinnerColor = color || variantConfig.color;
  
  // Animation values
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);
  
  // Start animations
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      rotation.value = 0;
    }
  }, [visible]);
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  
  const containerStyle = [
    {
      justifyContent: 'center',
      alignItems: 'center',
      ...(overlay && {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: variantConfig.backgroundColor,
        zIndex: 999,
      }),
    },
    style,
  ];
  
  if (!visible) return null;
  
  return (
    <View style={containerStyle} testID={testID}>
      <AnimatedView style={animatedStyle}>
        <ActivityIndicator
          size={spinnerSize}
          color={spinnerColor}
        />
      </AnimatedView>
      {message && (
        <Text style={{
          ...TYPOGRAPHY.bodySmall,
          color: COLORS.text.secondary,
          marginTop: SPACING.md,
          textAlign: 'center',
        }}>
          {message}
        </Text>
      )}
    </View>
  );
};

// Medical Cross Spinner
export const MedicalSpinner = ({
  size = 50,
  color = COLORS.primary.main,
  visible = true,
  style,
}) => {
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 1500,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  
  if (!visible) return null;
  
  return (
    <AnimatedView style={[{ justifyContent: 'center', alignItems: 'center' }, style, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-4H6v-2h4V7h4v4h4v2h-4v4z"
          fill={color}
        />
      </Svg>
    </AnimatedView>
  );
};

// Pulse Loader
export const PulseLoader = ({
  size = 40,
  color = COLORS.primary.main,
  visible = true,
  count = 3,
  style,
}) => {
  const pulseValues = Array(count).fill(0).map(() => useSharedValue(0.3));
  
  useEffect(() => {
    if (visible) {
      pulseValues.forEach((value, index) => {
        value.value = withRepeat(
          withSequence(
            withTiming(1, {
              duration: 600,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(0.3, {
              duration: 600,
              easing: Easing.inOut(Easing.ease),
            })
          ),
          -1,
          false
        );
      });
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <View style={[{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    }, style]}>
      {pulseValues.map((value, index) => {
        const animatedStyle = useAnimatedStyle(() => ({
          opacity: value.value,
          transform: [{ scale: value.value }],
        }));
        
        return (
          <AnimatedView
            key={index}
            style={[
              {
                width: size / 3,
                height: size / 3,
                borderRadius: size / 6,
                backgroundColor: color,
                marginHorizontal: 2,
              },
              animatedStyle,
            ]}
          />
        );
      })}
    </View>
  );
};

// Heart Beat Loader
export const HeartBeatLoader = ({
  size = 50,
  color = COLORS.medical.vital.heartRate,
  visible = true,
  style,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  useEffect(() => {
    if (visible) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 200 }),
          withTiming(1, { duration: 200 }),
          withTiming(1.1, { duration: 150 }),
          withTiming(1, { duration: 150 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
    }
  }, [visible]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  if (!visible) return null;
  
  return (
    <AnimatedView style={[{ justifyContent: 'center', alignItems: 'center' }, style, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5 2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"
          fill={color}
        />
      </Svg>
    </AnimatedView>
  );
};

// Progress Ring
export const ProgressRing = ({
  size = 60,
  strokeWidth = 4,
  progress = 0,
  color = COLORS.primary.main,
  backgroundColor = COLORS.neutral.gray[200],
  showPercentage = true,
  animated = true,
  style,
}) => {
  const animatedProgress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  useEffect(() => {
    if (animated) {
      animatedProgress.value = withSpring(progress, {
        duration: 1000,
        dampingRatio: 0.7,
      });
    } else {
      animatedProgress.value = progress;
    }
  }, [progress, animated]);
  
  const animatedProps = useAnimatedStyle(() => {
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (animatedProgress.value / 100) * circumference;
    
    return {
      strokeDasharray,
      strokeDashoffset,
    };
  });
  
  return (
    <View style={[{ justifyContent: 'center', alignItems: 'center' }, style]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
        />
      </Svg>
      
      {showPercentage && (
        <View style={{
          position: 'absolute',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            ...TYPOGRAPHY.h6,
            color: color,
            fontWeight: 'bold',
          }}>
            {Math.round(progress)}%
          </Text>
        </View>
      )}
    </View>
  );
};

// Skeleton Loader
export const SkeletonLoader = ({
  width = '100%',
  height = 20,
  borderRadius = BORDER_RADIUS.sm,
  style,
}) => {
  const shimmer = useSharedValue(-1);
  
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [-1, 1],
      [-100, 300]
    );
    
    return {
      transform: [{ translateX }],
    };
  });
  
  return (
    <View style={[{
      width,
      height,
      backgroundColor: COLORS.neutral.gray[200],
      borderRadius,
      overflow: 'hidden',
    }, style]}>
      <AnimatedView style={[{
        width: '30%',
        height: '100%',
        backgroundColor: COLORS.neutral.gray[100],
        opacity: 0.5,
      }, animatedStyle]} />
    </View>
  );
};

// Full Screen Loader
export const FullScreenLoader = ({
  visible = false,
  message = "Loading...",
  variant = 'medical',
  backdrop = true,
}) => {
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: 300,
    });
  }, [visible]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  if (!visible) return null;
  
  return (
    <AnimatedView style={[{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: backdrop ? COLORS.background.modal : 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }, animatedStyle]}>
      <View style={{
        backgroundColor: COLORS.background.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        alignItems: 'center',
        minWidth: 120,
        ...SHADOWS.large,
      }}>
        {variant === 'medical' ? (
          <MedicalSpinner size={50} />
        ) : variant === 'heart' ? (
          <HeartBeatLoader size={50} />
        ) : variant === 'pulse' ? (
          <PulseLoader size={40} />
        ) : (
          <LoadingSpinner variant="large" />
        )}
        
        <Text style={{
          ...TYPOGRAPHY.bodyMedium,
          color: COLORS.text.secondary,
          marginTop: SPACING.md,
          textAlign: 'center',
        }}>
          {message}
        </Text>
      </View>
    </AnimatedView>
  );
};

// Loading Button State
export const LoadingButton = ({
  loading = false,
  children,
  style,
  textStyle,
  loadingColor = COLORS.text.inverse,
  ...buttonProps
}) => {
  return (
    <TouchableOpacity
      style={[{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: loading ? 0.7 : 1,
      }, style]}
      disabled={loading}
      {...buttonProps}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={loadingColor}
          style={{ marginRight: SPACING.sm }}
        />
      )}
      {typeof children === 'string' ? (
        <Text style={textStyle}>
          {loading ? 'Loading...' : children}
        </Text>
      ) : children}
    </TouchableOpacity>
  );
};

export default LoadingSpinner;