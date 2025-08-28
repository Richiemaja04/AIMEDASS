/**
 * MediAssist App - Card Component
 * Professional card component with animations and medical variants
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING, BORDER_RADIUS, DIMENSIONS } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

// Card variants
const VARIANTS = {
  default: {
    backgroundColor: COLORS.background.card,
    borderColor: COLORS.border.light,
    shadow: SHADOWS.card,
  },
  elevated: {
    backgroundColor: COLORS.background.card,
    borderColor: 'transparent',
    shadow: SHADOWS.large,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border.medium,
    shadow: SHADOWS.none,
  },
  filled: {
    backgroundColor: COLORS.neutral.gray[50],
    borderColor: 'transparent',
    shadow: SHADOWS.small,
  },
  medical: {
    backgroundColor: COLORS.background.card,
    borderColor: COLORS.primary.light,
    shadow: SHADOWS.medicationCard,
  },
  vital: {
    backgroundColor: COLORS.background.card,
    borderColor: COLORS.medical.vital.heartRate,
    shadow: SHADOWS.vitalsCard,
  },
  appointment: {
    backgroundColor: COLORS.background.card,
    borderColor: COLORS.medical.appointment.scheduled,
    shadow: SHADOWS.appointmentCard,
  },
  emergency: {
    backgroundColor: COLORS.status.error.background,
    borderColor: COLORS.status.error.main,
    shadow: SHADOWS.emergencyCard,
  },
};

// Card sizes
const SIZES = {
  small: {
    padding: SPACING.md,
    minHeight: DIMENSIONS.card.minHeight * 0.7,
  },
  medium: {
    padding: SPACING.lg,
    minHeight: DIMENSIONS.card.minHeight,
  },
  large: {
    padding: SPACING.xl,
    minHeight: DIMENSIONS.card.minHeight * 1.3,
  },
};

const Card = ({
  // Content props
  children,
  title,
  subtitle,
  description,
  
  // Style props
  variant = 'default',
  size = 'medium',
  rounded = true,
  
  // Layout props
  horizontal = false,
  
  // Visual props
  gradient,
  backgroundImage,
  overlay = false,
  overlayOpacity = 0.5,
  
  // Interactive props
  onPress,
  onLongPress,
  pressable = false,
  disabled = false,
  
  // Animation props
  animateOnPress = true,
  animateOnMount = false,
  delay = 0,
  
  // Header/Footer props
  header,
  footer,
  leftAction,
  rightAction,
  
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  
  // Custom styles
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  
  // Test props
  testID,
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(animateOnMount ? 0 : 1);
  const translateY = useSharedValue(animateOnMount ? 20 : 0);
  
  // Mount animation
  React.useEffect(() => {
    if (animateOnMount) {
      const animationDelay = delay;
      
      setTimeout(() => {
        opacity.value = withSpring(1, { duration: 600, dampingRatio: 0.7 });
        translateY.value = withSpring(0, { duration: 600, dampingRatio: 0.7 });
      }, animationDelay);
    }
  }, [animateOnMount, delay, opacity, translateY]);
  
  // Get variant and size styles
  const variantStyle = VARIANTS[variant];
  const sizeStyle = SIZES[size];
  
  // Interaction handlers
  const handlePressIn = () => {
    if (!animateOnPress || disabled) return;
    
    scale.value = withSpring(0.98, {
      duration: 150,
      dampingRatio: 0.7,
    });
  };
  
  const handlePressOut = () => {
    if (!animateOnPress || disabled) return;
    
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
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));
  
  // Compute styles
  const cardStyle = [
    {
      backgroundColor: variantStyle.backgroundColor,
      borderRadius: rounded ? BORDER_RADIUS.card : 0,
      borderWidth: variantStyle.borderColor !== 'transparent' ? 1 : 0,
      borderColor: variantStyle.borderColor,
      overflow: 'hidden',
      ...variantStyle.shadow,
    },
    style,
  ];
  
  const contentStyleComputed = [
    {
      padding: sizeStyle.padding,
      minHeight: sizeStyle.minHeight,
      flexDirection: horizontal ? 'row' : 'column',
    },
    contentStyle,
  ];
  
  const titleStyleComputed = [
    {
      ...TYPOGRAPHY.h5,
      marginBottom: subtitle || description ? SPACING.xs : 0,
    },
    titleStyle,
  ];
  
  const subtitleStyleComputed = [
    {
      ...TYPOGRAPHY.bodySmall,
      color: COLORS.text.secondary,
      marginBottom: description ? SPACING.xs : 0,
    },
    subtitleStyle,
  ];
  
  const descriptionStyle = {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.bodyMedium.fontSize * 1.4,
  };
  
  // Render functions
  const renderHeader = () => {
    if (!header && !title && !leftAction && !rightAction) return null;
    
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: sizeStyle.padding,
        paddingTop: sizeStyle.padding,
        paddingBottom: children ? SPACING.sm : sizeStyle.padding,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {leftAction && (
            <View style={{ marginRight: SPACING.sm }}>
              {leftAction}
            </View>
          )}
          
          <View style={{ flex: 1 }}>
            {header ? header : (
              <>
                {title && (
                  <Text style={titleStyleComputed} numberOfLines={2}>
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text style={subtitleStyleComputed} numberOfLines={1}>
                    {subtitle}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
        
        {rightAction && (
          <View style={{ marginLeft: SPACING.sm }}>
            {rightAction}
          </View>
        )}
      </View>
    );
  };
  
  const renderContent = () => {
    return (
      <View style={contentStyleComputed}>
        {description && (
          <Text style={descriptionStyle} numberOfLines={3}>
            {description}
          </Text>
        )}
        {children}
      </View>
    );
  };
  
  const renderFooter = () => {
    if (!footer) return null;
    
    return (
      <View style={{
        paddingHorizontal: sizeStyle.padding,
        paddingBottom: sizeStyle.padding,
        paddingTop: children ? SPACING.sm : 0,
      }}>
        {footer}
      </View>
    );
  };
  
  const renderOverlay = () => {
    if (!overlay) return null;
    
    return (
      <View style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
      }} />
    );
  };
  
  // Card content
  const cardContent = (
    <>
      {renderOverlay()}
      {renderHeader()}
      {(children || description) && renderContent()}
      {renderFooter()}
    </>
  );
  
  // Wrapper component based on interactivity
  const CardWrapper = pressable || onPress ? AnimatedTouchableOpacity : AnimatedView;
  
  const wrapperProps = pressable || onPress ? {
    onPress: handlePress,
    onLongPress,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    disabled,
    activeOpacity: 1,
    accessibilityLabel: accessibilityLabel || title,
    accessibilityHint,
    accessibilityRole: accessibilityRole || 'button',
    testID,
  } : {
    accessibilityLabel,
    testID,
  };
  
  // Render with gradient background
  if (gradient) {
    return (
      <CardWrapper
        style={[cardStyle, animatedStyle]}
        {...wrapperProps}
      >
        <LinearGradient
          colors={gradient}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {cardContent}
        </LinearGradient>
      </CardWrapper>
    );
  }
  
  // Render with background image
  if (backgroundImage) {
    return (
      <CardWrapper
        style={[cardStyle, animatedStyle]}
        {...wrapperProps}
      >
        <ImageBackground
          source={backgroundImage}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          {cardContent}
        </ImageBackground>
      </CardWrapper>
    );
  }
  
  // Default render
  return (
    <CardWrapper
      style={[cardStyle, animatedStyle]}
      {...wrapperProps}
    >
      {cardContent}
    </CardWrapper>
  );
};

// Specialized card components
export const MedicationCard = ({ medication, onPress, ...props }) => {
  const statusColor = medication?.status === 'taken' 
    ? COLORS.status.success.main 
    : medication?.status === 'missed' 
    ? COLORS.status.error.main 
    : COLORS.status.warning.main;
    
  return (
    <Card
      variant="medical"
      onPress={onPress}
      pressable
      title={medication?.name}
      subtitle={`${medication?.dosage} • ${medication?.frequency}`}
      rightAction={
        <View style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: statusColor,
        }} />
      }
      {...props}
    />
  );
};

export const VitalCard = ({ vital, onPress, ...props }) => {
  const getVitalColor = (type) => {
    switch (type) {
      case 'heartRate': return COLORS.medical.vital.heartRate;
      case 'bloodPressure': return COLORS.medical.vital.bloodPressure;
      case 'temperature': return COLORS.medical.vital.temperature;
      case 'oxygen': return COLORS.medical.vital.oxygen;
      case 'glucose': return COLORS.medical.vital.glucose;
      default: return COLORS.primary.main;
    }
  };
  
  return (
    <Card
      variant="vital"
      size="small"
      onPress={onPress}
      pressable
      style={{
        borderLeftWidth: 4,
        borderLeftColor: getVitalColor(vital?.type),
      }}
      {...props}
    >
      <View style={{ alignItems: 'center' }}>
        <Text style={{
          ...TYPOGRAPHY.medicalValue,
          color: getVitalColor(vital?.type),
        }}>
          {vital?.value}
        </Text>
        <Text style={{
          ...TYPOGRAPHY.caption,
          textAlign: 'center',
          marginTop: SPACING.xs,
        }}>
          {vital?.label}
        </Text>
      </View>
    </Card>
  );
};

export const AppointmentCard = ({ appointment, onPress, ...props }) => {
  const statusColor = appointment?.status === 'confirmed' 
    ? COLORS.medical.appointment.confirmed
    : appointment?.status === 'cancelled'
    ? COLORS.medical.appointment.cancelled
    : COLORS.medical.appointment.scheduled;
    
  return (
    <Card
      variant="appointment"
      onPress={onPress}
      pressable
      title={appointment?.doctorName}
      subtitle={appointment?.specialty}
      description={`${appointment?.date} at ${appointment?.time}`}
      rightAction={
        <View style={{
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.xs,
          borderRadius: BORDER_RADIUS.pill,
          backgroundColor: statusColor,
        }}>
          <Text style={{
            ...TYPOGRAPHY.caption,
            color: COLORS.text.inverse,
            fontWeight: '600',
          }}>
            {appointment?.status?.toUpperCase()}
          </Text>
        </View>
      }
      {...props}
    />
  );
};

export default Card;