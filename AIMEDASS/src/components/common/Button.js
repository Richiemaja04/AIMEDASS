/**
 * MediAssist App - Button Component
 * Professional button component with animations and accessibility
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Vibration,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING, BORDER_RADIUS, DIMENSIONS } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Button variants
const VARIANTS = {
  primary: {
    backgroundColor: COLORS.primary.main,
    borderColor: COLORS.primary.main,
    textColor: COLORS.text.inverse,
    shadow: SHADOWS.button,
  },
  secondary: {
    backgroundColor: COLORS.secondary.main,
    borderColor: COLORS.secondary.main,
    textColor: COLORS.text.inverse,
    shadow: SHADOWS.button,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: COLORS.primary.main,
    textColor: COLORS.primary.main,
    shadow: SHADOWS.none,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    textColor: COLORS.primary.main,
    shadow: SHADOWS.none,
  },
  success: {
    backgroundColor: COLORS.status.success.main,
    borderColor: COLORS.status.success.main,
    textColor: COLORS.text.inverse,
    shadow: SHADOWS.success,
  },
  warning: {
    backgroundColor: COLORS.status.warning.main,
    borderColor: COLORS.status.warning.main,
    textColor: COLORS.text.primary,
    shadow: SHADOWS.warning,
  },
  error: {
    backgroundColor: COLORS.status.error.main,
    borderColor: COLORS.status.error.main,
    textColor: COLORS.text.inverse,
    shadow: SHADOWS.error,
  },
  medical: {
    backgroundColor: COLORS.medical.medication.prescription,
    borderColor: COLORS.medical.medication.prescription,
    textColor: COLORS.text.inverse,
    shadow: SHADOWS.button,
  },
};

// Button sizes
const SIZES = {
  small: {
    height: DIMENSIONS.button.height.small,
    paddingHorizontal: SPACING.md,
    typography: TYPOGRAPHY.buttonSmall,
    iconSize: 16,
  },
  medium: {
    height: DIMENSIONS.button.height.medium,
    paddingHorizontal: SPACING.lg,
    typography: TYPOGRAPHY.buttonMedium,
    iconSize: 20,
  },
  large: {
    height: DIMENSIONS.button.height.large,
    paddingHorizontal: SPACING.xl,
    typography: TYPOGRAPHY.buttonLarge,
    iconSize: 24,
  },
};

const Button = ({
  // Content props
  title,
  children,
  leftIcon,
  rightIcon,
  
  // Style props
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  rounded = false,
  
  // State props
  disabled = false,
  loading = false,
  
  // Interaction props
  onPress,
  onLongPress,
  
  // Animation props
  hapticFeedback = true,
  animationType = 'scale',
  
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  
  // Custom style props
  style,
  textStyle,
  containerStyle,
  
  // Test props
  testID,
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const elevation = useSharedValue(VARIANTS[variant].shadow.elevation || 0);
  
  // Refs
  const buttonRef = useRef(null);
  
  // Get variant and size styles
  const variantStyle = VARIANTS[variant];
  const sizeStyle = SIZES[size];
  
  // Handle press animations
  const handlePressIn = () => {
    if (disabled || loading) return;
    
    if (animationType === 'scale') {
      scale.value = withSpring(0.95, {
        duration: 150,
        dampingRatio: 0.7,
      });
    } else if (animationType === 'opacity') {
      opacity.value = withTiming(0.7, { duration: 150 });
    }
    
    // Reduce elevation on press
    if (Platform.OS === 'android' && variantStyle.shadow.elevation) {
      elevation.value = withTiming(variantStyle.shadow.elevation * 0.5, {
        duration: 150,
      });
    }
    
    // Haptic feedback
    if (hapticFeedback && Platform.OS === 'ios') {
      Vibration.vibrate(10);
    }
  };
  
  const handlePressOut = () => {
    if (disabled || loading) return;
    
    if (animationType === 'scale') {
      scale.value = withSpring(1, {
        duration: 200,
        dampingRatio: 0.7,
      });
    } else if (animationType === 'opacity') {
      opacity.value = withTiming(1, { duration: 200 });
    }
    
    // Restore elevation
    if (Platform.OS === 'android' && variantStyle.shadow.elevation) {
      elevation.value = withTiming(variantStyle.shadow.elevation, {
        duration: 200,
      });
    }
  };
  
  const handlePress = () => {
    if (disabled || loading) return;
    
    // Accessibility announcement for screen readers
    if (accessibilityLabel) {
      AccessibilityInfo.announceForAccessibility(`${accessibilityLabel} activated`);
    }
    
    onPress?.();
  };
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      ...(Platform.OS === 'android' && {
        elevation: elevation.value,
      }),
    };
  });
  
  // Compute styles
  const buttonStyle = [
    {
      height: sizeStyle.height,
      paddingHorizontal: sizeStyle.paddingHorizontal,
      backgroundColor: disabled 
        ? COLORS.neutral.gray[300] 
        : variantStyle.backgroundColor,
      borderWidth: variant === 'outline' || variant === 'ghost' ? 1 : 0,
      borderColor: disabled 
        ? COLORS.neutral.gray[300] 
        : variantStyle.borderColor,
      borderRadius: rounded ? sizeStyle.height / 2 : BORDER_RADIUS.button,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: fullWidth ? '100%' : DIMENSIONS.button.minWidth,
      ...(!disabled && Platform.OS === 'ios' && variantStyle.shadow),
    },
    style,
  ];
  
  const textStyleComputed = [
    {
      ...sizeStyle.typography,
      color: disabled 
        ? COLORS.text.disabled 
        : variantStyle.textColor,
      marginLeft: leftIcon ? SPACING.sm : 0,
      marginRight: rightIcon ? SPACING.sm : 0,
    },
    textStyle,
  ];
  
  const containerStyleComputed = [
    {
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    },
    containerStyle,
  ];
  
  // Render icon
  const renderIcon = (icon, position) => {
    if (!icon) return null;
    
    return (
      <View style={{
        marginRight: position === 'left' && title ? SPACING.sm : 0,
        marginLeft: position === 'right' && title ? SPACING.sm : 0,
      }}>
        {React.isValidElement(icon) ? icon : null}
      </View>
    );
  };
  
  // Render loading indicator
  const renderLoading = () => {
    if (!loading) return null;
    
    return (
      <ActivityIndicator
        size="small"
        color={variantStyle.textColor}
        style={{
          marginRight: title ? SPACING.sm : 0,
        }}
      />
    );
  };
  
  return (
    <View style={containerStyleComputed}>
      <AnimatedTouchableOpacity
        ref={buttonRef}
        style={[buttonStyle, animatedStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={onLongPress}
        disabled={disabled || loading}
        activeOpacity={animationType === 'opacity' ? 1 : 0.8}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
        testID={testID}
      >
        {renderLoading()}
        {renderIcon(leftIcon, 'left')}
        
        {(title || children) && (
          <Text style={textStyleComputed} numberOfLines={1}>
            {children || title}
          </Text>
        )}
        
        {renderIcon(rightIcon, 'right')}
      </AnimatedTouchableOpacity>
    </View>
  );
};

// Button group component for related actions
export const ButtonGroup = ({
  children,
  direction = 'horizontal',
  spacing = SPACING.sm,
  style,
}) => {
  const containerStyle = [
    {
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      alignItems: direction === 'horizontal' ? 'center' : 'stretch',
    },
    style,
  ];
  
  const childrenWithSpacing = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;
    
    const marginStyle = direction === 'horizontal' 
      ? { marginRight: index < children.length - 1 ? spacing : 0 }
      : { marginBottom: index < children.length - 1 ? spacing : 0 };
    
    return (
      <View style={marginStyle}>
        {child}
      </View>
    );
  });
  
  return (
    <View style={containerStyle}>
      {childrenWithSpacing}
    </View>
  );
};

// Floating Action Button variant
export const FAB = ({
  icon,
  onPress,
  variant = 'primary',
  size = 'medium',
  position = 'bottomRight',
  style,
  ...props
}) => {
  const fabSizes = {
    small: DIMENSIONS.fab.small,
    medium: DIMENSIONS.fab.medium,
    large: DIMENSIONS.fab.large,
  };
  
  const fabSize = fabSizes[size];
  
  const positionStyles = {
    topLeft: { top: SPACING.lg, left: SPACING.lg },
    topRight: { top: SPACING.lg, right: SPACING.lg },
    bottomLeft: { bottom: SPACING.lg, left: SPACING.lg },
    bottomRight: { bottom: SPACING.lg, right: SPACING.lg },
  };
  
  const fabStyle = [
    {
      position: 'absolute',
      width: fabSize,
      height: fabSize,
      borderRadius: fabSize / 2,
      ...SHADOWS.fab,
    },
    positionStyles[position],
    style,
  ];
  
  return (
    <Button
      style={fabStyle}
      variant={variant}
      size={size}
      rounded
      onPress={onPress}
      {...props}
    >
      {icon}
    </Button>
  );
};

export default Button;