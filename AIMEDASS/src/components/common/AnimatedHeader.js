/**
 * MediAssist App - AnimatedHeader Component
 * Professional animated header with medical-themed interactions
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedScrollHandler,
  withTiming,
  withSpring,
  interpolate,
  interpolateColor,
  extrapolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING, BORDER_RADIUS, DIMENSIONS } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Header variants
const VARIANTS = {
  default: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.light,
    shadow: SHADOWS.header,
  },
  medical: {
    backgroundColor: COLORS.primary.main,
    borderColor: COLORS.primary.dark,
    shadow: SHADOWS.header,
  },
  gradient: {
    colors: COLORS.gradients.medical,
    borderColor: 'transparent',
    shadow: SHADOWS.header,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadow: SHADOWS.none,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: COLORS.border.light,
    shadow: SHADOWS.small,
    backdropFilter: 'blur(20px)',
  },
};

// Animation types
const ANIMATION_TYPES = {
  fade: 'fade',
  slide: 'slide',
  scale: 'scale',
  blur: 'blur',
  parallax: 'parallax',
};

const AnimatedHeader = ({
  // Content props
  title,
  subtitle,
  leftAction,
  rightAction,
  centerComponent,
  
  // Style props
  variant = 'default',
  animationType = 'fade',
  height = DIMENSIONS.layout.headerHeight,
  
  // Scroll props
  scrollY,
  scrollThreshold = 50,
  hideOnScroll = false,
  
  // Visual props
  showBorder = true,
  showShadow = true,
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor,
  
  // Animation props
  animateOnMount = true,
  parallaxEnabled = false,
  
  // Accessibility props
  accessibilityLabel,
  
  // Custom styles
  style,
  titleStyle,
  contentStyle,
  
  // Test props
  testID,
}) => {
  const insets = useSafeAreaInsets();
  
  // Animation values
  const headerOpacity = useSharedValue(animateOnMount ? 0 : 1);
  const headerTranslateY = useSharedValue(animateOnMount ? -height : 0);
  const shadowOpacity = useSharedValue(0);
  const borderOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(1);
  const titleScale = useSharedValue(1);
  
  // Refs
  const headerRef = useRef(null);
  
  // Get variant configuration
  const variantConfig = VARIANTS[variant];
  const totalHeight = height + insets.top;
  
  // Mount animation
  useEffect(() => {
    if (animateOnMount) {
      headerOpacity.value = withSpring(1, {
        duration: 800,
        dampingRatio: 0.8,
      });
      headerTranslateY.value = withSpring(0, {
        duration: 800,
        dampingRatio: 0.7,
      });
    }
  }, [animateOnMount, headerOpacity, headerTranslateY]);
  
  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const scrollPosition = event.contentOffset.y;
      
      // Handle hide on scroll
      if (hideOnScroll) {
        const shouldHide = scrollPosition > scrollThreshold;
        headerTranslateY.value = withTiming(
          shouldHide ? -totalHeight : 0,
          { duration: 300 }
        );
      }
      
      // Handle shadow and border opacity
      if (showShadow) {
        shadowOpacity.value = withTiming(
          scrollPosition > 5 ? 1 : 0,
          { duration: 200 }
        );
      }
      
      if (showBorder) {
        borderOpacity.value = withTiming(
          scrollPosition > 10 ? 1 : 0,
          { duration: 200 }
        );
      }
      
      // Handle title animations
      if (animationType === 'scale') {
        const scale = interpolate(
          scrollPosition,
          [0, scrollThreshold],
          [1, 0.9],
          Extrapolate.CLAMP
        );
        titleScale.value = scale;
      }
      
      if (animationType === 'fade') {
        const opacity = interpolate(
          scrollPosition,
          [0, scrollThreshold],
          [1, 0.7],
          Extrapolate.CLAMP
        );
        titleOpacity.value = opacity;
      }
      
      // Parallax effect
      if (parallaxEnabled) {
        const parallaxOffset = interpolate(
          scrollPosition,
          [0, 200],
          [0, -50],
          Extrapolate.CLAMP
        );
        headerTranslateY.value = parallaxOffset;
      }
    },
  });
  
  // Attach scroll handler if scrollY is provided
  useEffect(() => {
    if (scrollY) {
      scrollY.addListener(scrollHandler);
      return () => scrollY.removeListener(scrollHandler);
    }
  }, [scrollY, scrollHandler]);
  
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      shadowOpacity.value,
      [0, 1],
      [
        variant === 'transparent' ? 'transparent' : variantConfig.backgroundColor,
        variant === 'glass' ? 'rgba(255, 255, 255, 0.98)' : variantConfig.backgroundColor,
      ]
    );
    
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: headerTranslateY.value }],
      backgroundColor: variant !== 'gradient' ? backgroundColor : 'transparent',
    };
  });
  
  const shadowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: shadowOpacity.value,
  }));
  
  const borderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));
  
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));
  
  // Styles
  const headerStyle = [
    {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: totalHeight,
      zIndex: 1000,
      paddingTop: insets.top,
      ...(showShadow && variantConfig.shadow),
    },
    style,
  ];
  
  const contentStyleComputed = [
    {
      flex: 1,
      height: height,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
    },
    contentStyle,
  ];
  
  const titleStyleComputed = [
    {
      ...TYPOGRAPHY.h4,
      color: variant === 'medical' || variant === 'gradient' 
        ? COLORS.text.inverse 
        : COLORS.text.primary,
      textAlign: 'center',
      flex: 1,
    },
    titleStyle,
  ];
  
  const subtitleStyleComputed = {
    ...TYPOGRAPHY.bodySmall,
    color: variant === 'medical' || variant === 'gradient' 
      ? COLORS.text.inverse 
      : COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  };
  
  // Render functions
  const renderLeftAction = () => {
    if (!leftAction) return <View style={{ width: 44 }} />;
    
    return (
      <View style={{
        alignItems: 'flex-start',
        justifyContent: 'center',
        minWidth: 44,
        height: 44,
      }}>
        {leftAction}
      </View>
    );
  };
  
  const renderCenterContent = () => {
    if (centerComponent) {
      return (
        <AnimatedView style={[{ flex: 1, alignItems: 'center' }, titleAnimatedStyle]}>
          {centerComponent}
        </AnimatedView>
      );
    }
    
    return (
      <AnimatedView style={[{ flex: 1, alignItems: 'center' }, titleAnimatedStyle]}>
        {title && (
          <Text style={titleStyleComputed} numberOfLines={1}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={subtitleStyleComputed} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </AnimatedView>
    );
  };
  
  const renderRightAction = () => {
    if (!rightAction) return <View style={{ width: 44 }} />;
    
    return (
      <View style={{
        alignItems: 'flex-end',
        justifyContent: 'center',
        minWidth: 44,
        height: 44,
      }}>
        {rightAction}
      </View>
    );
  };
  
  const renderShadow = () => {
    if (!showShadow) return null;
    
    return (
      <AnimatedView
        style={[
          {
            position: 'absolute',
            bottom: -8,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: 'transparent',
            shadowColor: COLORS.shadow.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 8,
          },
          shadowAnimatedStyle,
        ]}
      />
    );
  };
  
  const renderBorder = () => {
    if (!showBorder) return null;
    
    return (
      <AnimatedView
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: variantConfig.borderColor,
          },
          borderAnimatedStyle,
        ]}
      />
    );
  };
  
  // Status bar component
  const renderStatusBar = () => (
    <StatusBar
      barStyle={statusBarStyle}
      backgroundColor={statusBarBackgroundColor || 'transparent'}
      translucent
    />
  );
  
  // Render gradient variant
  if (variant === 'gradient') {
    return (
      <>
        {renderStatusBar()}
        <AnimatedView
          ref={headerRef}
          style={[headerStyle, headerAnimatedStyle]}
          accessibilityLabel={accessibilityLabel || title}
          testID={testID}
        >
          <AnimatedLinearGradient
            colors={variantConfig.colors}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={contentStyleComputed}>
              {renderLeftAction()}
              {renderCenterContent()}
              {renderRightAction()}
            </View>
          </AnimatedLinearGradient>
          
          {renderBorder()}
          {renderShadow()}
        </AnimatedView>
      </>
    );
  }
  
  // Default render
  return (
    <>
      {renderStatusBar()}
      <AnimatedView
        ref={headerRef}
        style={[headerStyle, headerAnimatedStyle]}
        accessibilityLabel={accessibilityLabel || title}
        testID={testID}
      >
        <View style={contentStyleComputed}>
          {renderLeftAction()}
          {renderCenterContent()}
          {renderRightAction()}
        </View>
        
        {renderBorder()}
        {renderShadow()}
      </AnimatedView>
    </>
  );
};

// Specialized header components
export const MedicalHeader = ({ patient, ...props }) => {
  return (
    <AnimatedHeader
      variant="medical"
      title={patient?.name || 'Patient'}
      subtitle={patient?.id ? `ID: ${patient.id}` : undefined}
      {...props}
    />
  );
};

export const DashboardHeader = ({ user, notifications, ...props }) => {
  return (
    <AnimatedHeader
      variant="gradient"
      title={`Hello, ${user?.firstName || 'User'}`}
      subtitle="How are you feeling today?"
      rightAction={
        <TouchableOpacity
          style={{
            position: 'relative',
            padding: SPACING.sm,
          }}
          onPress={() => {/* Handle notifications */}}
        >
          {/* Bell icon would go here */}
          <View style={{
            width: 24,
            height: 24,
            backgroundColor: COLORS.text.inverse,
            borderRadius: 12,
          }} />
          {notifications > 0 && (
            <View style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: COLORS.status.error.main,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{
                ...TYPOGRAPHY.caption,
                color: COLORS.text.inverse,
                fontSize: 10,
                fontWeight: 'bold',
              }}>
                {notifications > 9 ? '9+' : notifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      }
      {...props}
    />
  );
};

export const SearchHeader = ({ onSearch, ...props }) => {
  return (
    <AnimatedHeader
      variant="default"
      centerComponent={
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.neutral.gray[100],
          borderRadius: BORDER_RADIUS.lg,
          paddingHorizontal: SPACING.md,
          marginHorizontal: SPACING.sm,
          height: 36,
        }}>
          {/* Search icon would go here */}
          <View style={{
            width: 16,
            height: 16,
            backgroundColor: COLORS.text.tertiary,
            borderRadius: 8,
            marginRight: SPACING.sm,
          }} />
          <Text style={{
            ...TYPOGRAPHY.bodyMedium,
            color: COLORS.text.tertiary,
            flex: 1,
          }}>
            Search medications, doctors...
          </Text>
        </View>
      }
      {...props}
    />
  );
};

export default AnimatedHeader;