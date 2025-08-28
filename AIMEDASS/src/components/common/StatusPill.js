/**
 * MediAssist App - StatusPill Component
 * Professional status indicators with medical context
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { COLORS } from '../../styles/colors';
import { TYPOGRAPHY } from '../../styles/typography';
import { SPACING, BORDER_RADIUS } from '../../styles/spacing';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

// Status variants with medical context
const STATUS_VARIANTS = {
  // General statuses
  success: {
    backgroundColor: COLORS.status.success.background,
    borderColor: COLORS.status.success.main,
    textColor: COLORS.status.success.main,
    icon: '✓',
  },
  warning: {
    backgroundColor: COLORS.status.warning.background,
    borderColor: COLORS.status.warning.main,
    textColor: COLORS.status.warning.dark,
    icon: '⚠',
  },
  error: {
    backgroundColor: COLORS.status.error.background,
    borderColor: COLORS.status.error.main,
    textColor: COLORS.status.error.main,
    icon: '✗',
  },
  info: {
    backgroundColor: COLORS.status.info.background,
    borderColor: COLORS.status.info.main,
    textColor: COLORS.status.info.main,
    icon: 'i',
  },
  neutral: {
    backgroundColor: COLORS.neutral.gray[100],
    borderColor: COLORS.neutral.gray[400],
    textColor: COLORS.neutral.gray[700],
    icon: '·',
  },
  
  // Medical specific statuses
  taken: {
    backgroundColor: COLORS.status.success.background,
    borderColor: COLORS.status.success.main,
    textColor: COLORS.status.success.main,
    icon: '✓',
  },
  missed: {
    backgroundColor: COLORS.status.error.background,
    borderColor: COLORS.status.error.main,
    textColor: COLORS.status.error.main,
    icon: '✗',
  },
  due: {
    backgroundColor: COLORS.status.warning.background,
    borderColor: COLORS.status.warning.main,
    textColor: COLORS.status.warning.dark,
    icon: '⏰',
  },
  overdue: {
    backgroundColor: COLORS.accent.100,
    borderColor: COLORS.accent.main,
    textColor: COLORS.accent.dark,
    icon: '⚠',
  },
  
  // Appointment statuses
  scheduled: {
    backgroundColor: COLORS.primary.100,
    borderColor: COLORS.primary.main,
    textColor: COLORS.primary.dark,
    icon: '📅',
  },
  confirmed: {
    backgroundColor: COLORS.status.success.background,
    borderColor: COLORS.status.success.main,
    textColor: COLORS.status.success.main,
    icon: '✓',
  },
  cancelled: {
    backgroundColor: COLORS.neutral.gray[100],
    borderColor: COLORS.neutral.gray[400],
    textColor: COLORS.neutral.gray[600],
    icon: '✗',
  },
  completed: {
    backgroundColor: COLORS.secondary.100,
    borderColor: COLORS.secondary.main,
    textColor: COLORS.secondary.dark,
    icon: '✓',
  },
  
  // Health statuses
  normal: {
    backgroundColor: COLORS.status.success.background,
    borderColor: COLORS.status.success.main,
    textColor: COLORS.status.success.main,
    icon: '✓',
  },
  elevated: {
    backgroundColor: COLORS.status.warning.background,
    borderColor: COLORS.status.warning.main,
    textColor: COLORS.status.warning.dark,
    icon: '↗',
  },
  critical: {
    backgroundColor: COLORS.status.error.background,
    borderColor: COLORS.status.error.main,
    textColor: COLORS.status.error.main,
    icon: '🚨',
  },
  
  // Connection/sync statuses
  online: {
    backgroundColor: COLORS.semantic.online + '20',
    borderColor: COLORS.semantic.online,
    textColor: COLORS.semantic.online,
    icon: '●',
  },
  offline: {
    backgroundColor: COLORS.semantic.offline + '20',
    borderColor: COLORS.semantic.offline,
    textColor: COLORS.semantic.offline,
    icon: '●',
  },
  syncing: {
    backgroundColor: COLORS.semantic.syncing + '20',
    borderColor: COLORS.semantic.syncing,
    textColor: COLORS.semantic.syncing,
    icon: '⟳',
  },
  
  // Emergency status
  emergency: {
    backgroundColor: COLORS.accent.100,
    borderColor: COLORS.accent.main,
    textColor: COLORS.accent.dark,
    icon: '🚨',
  },
};

// Size variants
const SIZE_VARIANTS = {
  small: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    typography: TYPOGRAPHY.overline,
    iconSize: 10,
    height: 24,
  },
  medium: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    typography: TYPOGRAPHY.caption,
    iconSize: 12,
    height: 28,
  },
  large: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    typography: TYPOGRAPHY.bodySmall,
    iconSize: 14,
    height: 32,
  },
};

const StatusPill = ({
  // Content props
  status = 'neutral',
  text,
  icon,
  showIcon = true,
  
  // Style props
  size = 'medium',
  variant = 'filled',
  animated = false,
  pulsing = false,
  
  // Interaction props
  onPress,
  disabled = false,
  
  // Animation props
  animateOnMount = false,
  pulseColor,
  
  // Custom styles
  style,
  textStyle,
  iconStyle,
  
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  
  // Test props
  testID,
}) => {
  // Animation values
  const scale = useSharedValue(animateOnMount ? 0.8 : 1);
  const opacity = useSharedValue(animateOnMount ? 0 : 1);
  const pulseScale = useSharedValue(1);
  const syncRotation = useSharedValue(0);
  
  // Get variant configurations
  const statusConfig = STATUS_VARIANTS[status];
  const sizeConfig = SIZE_VARIANTS[size];
  
  // Mount animation
  useEffect(() => {
    if (animateOnMount) {
      opacity.value = withSpring(1, {
        duration: 400,
        dampingRatio: 0.7,
      });
      scale.value = withSpring(1, {
        duration: 400,
        dampingRatio: 0.6,
      });
    }
  }, [animateOnMount]);
  
  // Pulsing animation
  useEffect(() => {
    if (pulsing) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    }
  }, [pulsing]);
  
  // Syncing rotation animation
  useEffect(() => {
    if (status === 'syncing') {
      syncRotation.value = withRepeat(
        withTiming(360, { duration: 2000 }),
        -1,
        false
      );
    }
  }, [status]);
  
  // Interaction handlers
  const handlePressIn = () => {
    if (!onPress || disabled) return;
    scale.value = withTiming(0.95, { duration: 100 });
  };
  
  const handlePressOut = () => {
    if (!onPress || disabled) return;
    scale.value = withSpring(1, {
      duration: 200,
      dampingRatio: 0.7,
    });
  };
  
  const handlePress = () => {
    if (disabled) return;
    onPress?.();
  };
  
  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { scale: pulseScale.value },
    ],
  }));
  
  const iconAnimatedStyle = useAnimatedStyle(() => {
    if (status === 'syncing') {
      return {
        transform: [{ rotate: `${syncRotation.value}deg` }],
      };
    }
    return {};
  });
  
  // Compute styles
  const containerStyle = [
    {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: BORDER_RADIUS.pill,
      borderWidth: 1,
      height: sizeConfig.height,
      paddingVertical: sizeConfig.paddingVertical,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      backgroundColor: variant === 'outlined' 
        ? 'transparent' 
        : statusConfig.backgroundColor,
      borderColor: statusConfig.borderColor,
      opacity: disabled ? 0.5 : 1,
    },
    style,
  ];
  
  const textStyleComputed = [
    {
      ...sizeConfig.typography,
      color: statusConfig.textColor,
      fontWeight: '600',
      textTransform: size === 'small' ? 'uppercase' : 'none',
      letterSpacing: size === 'small' ? 0.5 : 0,
    },
    textStyle,
  ];
  
  const iconStyleComputed = [
    {
      fontSize: sizeConfig.iconSize,
      color: statusConfig.textColor,
      marginRight: text ? SPACING.xs : 0,
    },
    iconStyle,
  ];
  
  // Render functions
  const renderIcon = () => {
    if (!showIcon && !icon) return null;
    
    const iconToShow = icon || statusConfig.icon;
    
    return (
      <AnimatedView style={iconAnimatedStyle}>
        <Text style={iconStyleComputed}>
          {iconToShow}
        </Text>
      </AnimatedView>
    );
  };
  
  const renderText = () => {
    if (!text) return null;
    
    return (
      <Text style={textStyleComputed} numberOfLines={1}>
        {text}
      </Text>
    );
  };
  
  // Render pulsing background for critical statuses
  const renderPulsingBackground = () => {
    if (!pulsing || status !== 'emergency') return null;
    
    const pulseBackgroundStyle = useAnimatedStyle(() => {
      const backgroundColor = interpolateColor(
        pulseScale.value,
        [1, 1.1],
        [statusConfig.backgroundColor, pulseColor || COLORS.accent.light]
      );
      
      return {
        backgroundColor,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: BORDER_RADIUS.pill,
      };
    });
    
    return <AnimatedView style={pulseBackgroundStyle} />;
  };
  
  // Main component
  const PillComponent = onPress && !disabled ? TouchableOpacity : View;
  
  const componentProps = onPress && !disabled ? {
    onPress: handlePress,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    activeOpacity: 0.7,
    accessibilityRole: 'button',
  } : {};
  
  return (
    <AnimatedView style={containerAnimatedStyle}>
      <PillComponent
        style={containerStyle}
        accessibilityLabel={accessibilityLabel || `Status: ${status} ${text || ''}`}
        accessibilityHint={accessibilityHint}
        testID={testID}
        {...componentProps}
      >
        {renderPulsingBackground()}
        {renderIcon()}
        {renderText()}
      </PillComponent>
    </AnimatedView>
  );
};

// Specialized status pill components
export const MedicationStatusPill = ({ medication, ...props }) => {
  const getStatusFromMedication = () => {
    if (!medication) return 'neutral';
    
    const now = new Date();
    const nextDose = new Date(medication.nextDose);
    const timeDiff = nextDose.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (medication.status === 'taken') return 'taken';
    if (medication.status === 'missed') return 'missed';
    if (hoursDiff <= 0) return 'overdue';
    if (hoursDiff <= 1) return 'due';
    return 'scheduled';
  };
  
  return (
    <StatusPill
      status={getStatusFromMedication()}
      text={medication?.status?.toUpperCase() || 'PENDING'}
      size="small"
      {...props}
    />
  );
};

export const AppointmentStatusPill = ({ appointment, ...props }) => {
  return (
    <StatusPill
      status={appointment?.status || 'scheduled'}
      text={appointment?.status?.toUpperCase() || 'SCHEDULED'}
      size="medium"
      {...props}
    />
  );
};

export const VitalStatusPill = ({ vital, normalRange, ...props }) => {
  const getVitalStatus = () => {
    if (!vital || !normalRange) return 'neutral';
    
    const value = parseFloat(vital.value);
    const min = parseFloat(normalRange.min);
    const max = parseFloat(normalRange.max);
    
    if (value < min * 0.8 || value > max * 1.2) return 'critical';
    if (value < min || value > max) return 'elevated';
    return 'normal';
  };
  
  return (
    <StatusPill
      status={getVitalStatus()}
      text={getVitalStatus().toUpperCase()}
      size="small"
      pulsing={getVitalStatus() === 'critical'}
      {...props}
    />
  );
};

export const ConnectionStatusPill = ({ isOnline, isSyncing, ...props }) => {
  const status = isSyncing ? 'syncing' : isOnline ? 'online' : 'offline';
  const text = isSyncing ? 'SYNCING' : isOnline ? 'ONLINE' : 'OFFLINE';
  
  return (
    <StatusPill
      status={status}
      text={text}
      size="small"
      animated={isSyncing}
      {...props}
    />
  );
};

export const EmergencyStatusPill = ({ isEmergency, ...props }) => {
  if (!isEmergency) return null;
  
  return (
    <StatusPill
      status="emergency"
      text="EMERGENCY"
      size="medium"
      pulsing
      animateOnMount
      {...props}
    />
  );
};

export default StatusPill;