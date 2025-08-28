/**
 * MediAssist App - Input Component
 * Professional input component with validation and animations
 */

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING, BORDER_RADIUS, DIMENSIONS } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const AnimatedView = Reanimated.createAnimatedComponent(View);
const AnimatedTextInput = Reanimated.createAnimatedComponent(TextInput);

// Input variants
const VARIANTS = {
  default: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.light,
    focusBorderColor: COLORS.primary.main,
    shadow: SHADOWS.input,
  },
  filled: {
    backgroundColor: COLORS.neutral.gray[100],
    borderColor: 'transparent',
    focusBorderColor: COLORS.primary.main,
    shadow: SHADOWS.none,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border.medium,
    focusBorderColor: COLORS.primary.main,
    shadow: SHADOWS.none,
  },
  medical: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.medical.medication.prescription,
    focusBorderColor: COLORS.medical.medication.prescription,
    shadow: SHADOWS.input,
  },
};

// Input states
const STATES = {
  default: {
    borderColor: COLORS.border.light,
    textColor: COLORS.text.primary,
    labelColor: COLORS.text.secondary,
  },
  focus: {
    borderColor: COLORS.primary.main,
    textColor: COLORS.text.primary,
    labelColor: COLORS.primary.main,
  },
  error: {
    borderColor: COLORS.status.error.main,
    textColor: COLORS.text.primary,
    labelColor: COLORS.status.error.main,
  },
  success: {
    borderColor: COLORS.status.success.main,
    textColor: COLORS.text.primary,
    labelColor: COLORS.status.success.main,
  },
  disabled: {
    borderColor: COLORS.border.light,
    textColor: COLORS.text.disabled,
    labelColor: COLORS.text.disabled,
  },
};

const Input = forwardRef(({
  // Content props
  label,
  placeholder,
  value,
  defaultValue,
  helper,
  errorMessage,
  successMessage,
  
  // Style props
  variant = 'default',
  size = 'medium',
  multiline = false,
  numberOfLines = 4,
  
  // Icons and actions
  leftIcon,
  rightIcon,
  leftAction,
  rightAction,
  showClearButton = false,
  
  // Input props
  keyboardType = 'default',
  returnKeyType = 'done',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  secureTextEntry = false,
  maxLength,
  editable = true,
  
  // State props
  disabled = false,
  required = false,
  
  // Animation props
  animatedLabel = true,
  focusAnimation = true,
  
  // Validation props
  validate,
  validateOnChange = false,
  validateOnBlur = true,
  
  // Event handlers
  onChangeText,
  onFocus,
  onBlur,
  onSubmitEditing,
  
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  
  // Custom styles
  style,
  containerStyle,
  inputStyle,
  labelStyle,
  helperStyle,
  
  // Test props
  testID,
}, ref) => {
  // State
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [validationError, setValidationError] = useState('');
  const [isValid, setIsValid] = useState(true);
  
  // Refs
  const inputRef = useRef(null);
  const focusAnimation = useRef(new Animated.Value(0)).current;
  
  // Reanimated values
  const borderColorProgress = useSharedValue(0);
  const labelProgress = useSharedValue(value || defaultValue ? 1 : 0);
  const shadowProgress = useSharedValue(0);
  
  // Imperatively expose input methods
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      handleChangeText('');
      inputRef.current?.clear();
    },
    getValue: () => value ?? internalValue,
    validate: () => performValidation(value ?? internalValue),
  }));
  
  // Get current value
  const currentValue = value ?? internalValue;
  
  // Determine current state
  const getCurrentState = () => {
    if (disabled) return 'disabled';
    if (errorMessage || validationError) return 'error';
    if (successMessage && isValid) return 'success';
    if (isFocused) return 'focus';
    return 'default';
  };
  
  const currentState = getCurrentState();
  const variantStyle = VARIANTS[variant];
  const stateStyle = STATES[currentState];
  
  // Validation function
  const performValidation = (text) => {
    if (!validate) return true;
    
    try {
      validate(text);
      setValidationError('');
      setIsValid(true);
      return true;
    } catch (error) {
      setValidationError(error.message);
      setIsValid(false);
      return false;
    }
  };
  
  // Handlers
  const handleChangeText = (text) => {
    setInternalValue(text);
    onChangeText?.(text);
    
    // Animate label
    if (animatedLabel) {
      labelProgress.value = withSpring(text ? 1 : 0, {
        duration: 200,
        dampingRatio: 0.7,
      });
    }
    
    // Validate on change if enabled
    if (validateOnChange) {
      performValidation(text);
    }
  };
  
  const handleFocus = (event) => {
    setIsFocused(true);
    
    // Animations
    if (focusAnimation) {
      borderColorProgress.value = withTiming(1, { duration: 200 });
      shadowProgress.value = withTiming(1, { duration: 200 });
      
      Animated.timing(focusAnimation, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }
    
    if (animatedLabel && !currentValue) {
      labelProgress.value = withSpring(1, {
        duration: 200,
        dampingRatio: 0.7,
      });
    }
    
    onFocus?.(event);
  };
  
  const handleBlur = (event) => {
    setIsFocused(false);
    
    // Animations
    if (focusAnimation) {
      borderColorProgress.value = withTiming(0, { duration: 200 });
      shadowProgress.value = withTiming(0, { duration: 200 });
      
      Animated.timing(focusAnimation, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }
    
    if (animatedLabel && !currentValue) {
      labelProgress.value = withSpring(0, {
        duration: 200,
        dampingRatio: 0.7,
      });
    }
    
    // Validate on blur if enabled
    if (validateOnBlur) {
      performValidation(currentValue);
    }
    
    onBlur?.(event);
  };
  
  const handleClear = () => {
    handleChangeText('');
    inputRef.current?.focus();
  };
  
  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      borderColorProgress.value,
      [0, 1],
      [stateStyle.borderColor, variantStyle.focusBorderColor]
    );
    
    const shadowOpacity = interpolate(
      shadowProgress.value,
      [0, 1],
      [0.1, 0.25]
    );
    
    return {
      borderColor,
      ...(Platform.OS === 'ios' && {
        shadowOpacity,
      }),
    };
  });
  
  const animatedLabelStyle = useAnimatedStyle(() => {
    if (!animatedLabel) return {};
    
    const translateY = interpolate(
      labelProgress.value,
      [0, 1],
      [0, -24]
    );
    
    const scale = interpolate(
      labelProgress.value,
      [0, 1],
      [1, 0.85]
    );
    
    const color = interpolateColor(
      borderColorProgress.value,
      [0, 1],
      [COLORS.text.secondary, stateStyle.labelColor]
    );
    
    return {
      transform: [
        { translateY },
        { scale },
      ],
      color,
    };
  });
  
  // Styles
  const containerStyleComputed = [
    {
      marginBottom: SPACING.md,
    },
    containerStyle,
  ];
  
  const inputContainerStyle = [
    {
      minHeight: multiline ? DIMENSIONS.input.multilineMinHeight : DIMENSIONS.input.height,
      backgroundColor: variantStyle.backgroundColor,
      borderWidth: 1,
      borderColor: stateStyle.borderColor,
      borderRadius: BORDER_RADIUS.input,
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: multiline ? SPACING.md : 0,
      ...variantStyle.shadow,
    },
    style,
  ];
  
  const textInputStyle = [
    {
      ...TYPOGRAPHY.input,
      flex: 1,
      color: stateStyle.textColor,
      paddingVertical: Platform.OS === 'ios' ? 0 : SPACING.sm,
      textAlignVertical: multiline ? 'top' : 'center',
    },
    inputStyle,
  ];
  
  const labelStyleComputed = [
    {
      ...TYPOGRAPHY.label,
      color: stateStyle.labelColor,
      marginBottom: SPACING.xs,
    },
    labelStyle,
  ];
  
  const helperTextStyle = [
    {
      ...TYPOGRAPHY.caption,
      color: currentState === 'error' 
        ? COLORS.status.error.main 
        : currentState === 'success'
        ? COLORS.status.success.main
        : COLORS.text.tertiary,
      marginTop: SPACING.xs,
      marginLeft: SPACING.sm,
    },
    helperStyle,
  ];
  
  // Render helpers
  const renderIcon = (icon, position) => {
    if (!icon) return null;
    
    return (
      <View style={{
        marginRight: position === 'left' ? SPACING.sm : 0,
        marginLeft: position === 'right' ? SPACING.sm : 0,
        alignSelf: multiline ? 'flex-start' : 'center',
        marginTop: multiline && position === 'left' ? SPACING.sm : 0,
      }}>
        {React.isValidElement(icon) ? icon : null}
      </View>
    );
  };
  
  const renderAction = (action, position) => {
    if (!action) return null;
    
    return (
      <TouchableOpacity
        style={{
          marginRight: position === 'left' ? SPACING.sm : 0,
          marginLeft: position === 'right' ? SPACING.sm : 0,
          alignSelf: multiline ? 'flex-start' : 'center',
          marginTop: multiline && position === 'left' ? SPACING.sm : 0,
          padding: SPACING.xs,
        }}
        onPress={action.onPress}
        accessibilityLabel={action.accessibilityLabel}
        accessibilityRole="button"
      >
        {action.icon}
      </TouchableOpacity>
    );
  };
  
  const renderClearButton = () => {
    if (!showClearButton || !currentValue || disabled) return null;
    
    return (
      <TouchableOpacity
        style={{
          marginLeft: SPACING.sm,
          padding: SPACING.xs,
        }}
        onPress={handleClear}
        accessibilityLabel="Clear input"
        accessibilityRole="button"
      >
        {/* Replace with actual clear icon */}
        <Text style={{ color: COLORS.text.tertiary, fontSize: 16 }}>×</Text>
      </TouchableOpacity>
    );
  };
  
  const renderHelperText = () => {
    const helperText = errorMessage || validationError || successMessage || helper;
    if (!helperText) return null;
    
    return (
      <Text style={helperTextStyle} numberOfLines={2}>
        {helperText}
      </Text>
    );
  };
  
  return (
    <View style={containerStyleComputed}>
      {/* Static Label */}
      {label && !animatedLabel && (
        <Text style={labelStyleComputed}>
          {label}
          {required && <Text style={{ color: COLORS.status.error.main }}> *</Text>}
        </Text>
      )}
      
      {/* Input Container */}
      <AnimatedView style={[inputContainerStyle, animatedContainerStyle]}>
        {/* Animated Label */}
        {label && animatedLabel && (
          <Reanimated.Text
            style={[
              {
                ...TYPOGRAPHY.label,
                position: 'absolute',
                left: SPACING.md,
                top: multiline ? SPACING.md : DIMENSIONS.input.height / 2 - 8,
                zIndex: 1,
                backgroundColor: variantStyle.backgroundColor,
                paddingHorizontal: SPACING.xs,
              },
              animatedLabelStyle,
            ]}
            pointerEvents="none"
          >
            {label}
            {required && <Text style={{ color: COLORS.status.error.main }}> *</Text>}
          </Reanimated.Text>
        )}
        
        {renderIcon(leftIcon, 'left')}
        {renderAction(leftAction, 'left')}
        
        <AnimatedTextInput
          ref={inputRef}
          style={textInputStyle}
          value={currentValue}
          placeholder={!animatedLabel ? placeholder : (isFocused || currentValue ? placeholder : '')}
          placeholderTextColor={COLORS.text.tertiary}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          editable={!disabled && editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textContentType="none"
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          testID={testID}
        />
        
        {renderClearButton()}
        {renderAction(rightAction, 'right')}
        {renderIcon(rightIcon, 'right')}
      </AnimatedView>
      
      {/* Character Count */}
      {maxLength && currentValue && (
        <Text style={[helperTextStyle, { textAlign: 'right', marginTop: SPACING.xs }]}>
          {currentValue.length}/{maxLength}
        </Text>
      )}
      
      {/* Helper Text */}
      {renderHelperText()}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;