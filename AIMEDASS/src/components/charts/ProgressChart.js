/**
 * MediAssist App - ProgressChart Component
 * Interactive progress tracking for health goals and achievements
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Path,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
} from 'react-native-svg';
import { ProgressChart as RNProgressChart } from 'react-native-chart-kit';

// Styles
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING, BORDER_RADIUS } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Progress chart types
const PROGRESS_CHART_TYPES = {
  CIRCULAR_RING: 'circular_ring',
  LINEAR_BAR: 'linear_bar',
  MULTI_RING: 'multi_ring',
  GOAL_TRACKER: 'goal_tracker',
  MILESTONE_PROGRESS: 'milestone_progress',
  RADIAL_GAUGE: 'radial_gauge',
  SEGMENTED_RING: 'segmented_ring',
};

// Health goal presets
const HEALTH_GOAL_PRESETS = {
  steps: {
    color: COLORS.primary.main,
    icon: '👟',
    unit: 'steps',
    target: 10000,
    segments: [2500, 5000, 7500, 10000],
  },
  water: {
    color: COLORS.status.info.main,
    icon: '💧',
    unit: 'glasses',
    target: 8,
    segments: [2, 4, 6, 8],
  },
  sleep: {
    color: COLORS.medical.vital.oxygen,
    icon: '😴',
    unit: 'hours',
    target: 8,
    segments: [4, 6, 7, 8],
  },
  exercise: {
    color: COLORS.secondary.main,
    icon: '💪',
    unit: 'minutes',
    target: 60,
    segments: [15, 30, 45, 60],
  },
  weight: {
    color: COLORS.status.warning.main,
    icon: '⚖️',
    unit: 'lbs',
    target: null, // Dynamic based on goal
    segments: null,
  },
  medication: {
    color: COLORS.medical.medication.prescription,
    icon: '💊',
    unit: '%',
    target: 100,
    segments: [25, 50, 75, 100],
  },
};

const ProgressChart = ({
  // Data props
  progress = 0, // 0-1 for percentage, or actual value
  target = 100,
  multiProgress = [], // For multi-ring charts
  
  // Chart type and preset
  chartType = PROGRESS_CHART_TYPES.CIRCULAR_RING,
  preset,
  
  // Style props
  size = 120,
  strokeWidth = 8,
  color = COLORS.primary.main,
  backgroundColor = COLORS.neutral.gray[200],
  
  // Display options
  showPercentage = true,
  showValue = true,
  showTarget = false,
  showMilestones = false,
  animated = true,
  
  // Interaction props
  onPress,
  onMilestoneReached,
  
  // Custom styling
  style,
  textStyle,
  
  // Goal specific
  goalName,
  unit,
  icon,
  
  // Test props
  testID,
}) => {
  // State
  const [currentProgress, setCurrentProgress] = useState(0);
  const [milestoneReached, setMilestoneReached] = useState(false);
  
  // Animation values
  const progressValue = useSharedValue(0);
  const scaleValue = useSharedValue(animated ? 0.8 : 1);
  const opacityValue = useSharedValue(animated ? 0 : 1);
  const milestoneScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  
  // Refs
  const chartRef = useRef(null);
  
  // Get preset configuration
  const presetConfig = preset ? HEALTH_GOAL_PRESETS[preset] : null;
  const finalColor = presetConfig?.color || color;
  const finalUnit = presetConfig?.unit || unit;
  const finalIcon = presetConfig?.icon || icon;
  const finalTarget = presetConfig?.target || target;
  
  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (progress >= 0 && progress <= 1) {
      return progress; // Already a percentage
    }
    return finalTarget > 0 ? Math.min(progress / finalTarget, 1) : 0;
  }, [progress, finalTarget]);
  
  // Setup animations
  useEffect(() => {
    if (animated) {
      // Initial entrance animation
      opacityValue.value = withSpring(1, { duration: 600, dampingRatio: 0.8 });
      scaleValue.value = withSpring(1, { duration: 600, dampingRatio: 0.7 });
      
      // Progress animation
      progressValue.value = withTiming(progressPercentage, {
        duration: 1200,
      });
    } else {
      progressValue.value = progressPercentage;
    }
    
    setCurrentProgress(progressPercentage);
    
    // Check for milestone achievement
    if (progressPercentage >= 1 && !milestoneReached) {
      setMilestoneReached(true);
      triggerMilestoneAnimation();
      onMilestoneReached?.();
    }
  }, [progressPercentage, animated]);
  
  // Milestone animation
  const triggerMilestoneAnimation = () => {
    milestoneScale.value = withSequence(
      withTiming(1.2, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );
    
    glowOpacity.value = withSequence(
      withTiming(0.8, { duration: 500 }),
      withTiming(0, { duration: 500 })
    );
  };
  
  // Create circular path
  const createCircularPath = (radius, startAngle = 0, endAngle = 360) => {
    const centerX = size / 2;
    const centerY = size / 2;
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };
  
  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
    transform: [
      { scale: scaleValue.value },
      { scale: milestoneScale.value },
    ],
  }));
  
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));
  
  // Animated props for progress circle
  const progressAnimatedProps = useAnimatedProps(() => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progressValue.value * circumference);
    
    return {
      strokeDasharray,
      strokeDashoffset,
    };
  });
  
  // Render circular ring progress
  const renderCircularRing = () => {
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    
    return (
      <View style={{
        width: size,
        height: size,
        position: 'relative',
      }}>
        {/* Glow effect for milestone achievement */}
        <AnimatedView
          style={[
            {
              position: 'absolute',
              width: size + 20,
              height: size + 20,
              left: -10,
              top: -10,
              borderRadius: (size + 20) / 2,
              backgroundColor: finalColor,
            },
            glowAnimatedStyle,
          ]}
        />
        
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={finalColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={finalColor} stopOpacity="0.7" />
            </LinearGradient>
          </Defs>
          
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * radius}
            strokeDashoffset={2 * Math.PI * radius * (1 - progressPercentage)}
            transform={`rotate(-90 ${center} ${center})`}
            animatedProps={progressAnimatedProps}
          />
          
          {/* Milestone markers */}
          {showMilestones && presetConfig?.segments && presetConfig.segments.map((milestone, index) => {
            const milestoneProgress = milestone / finalTarget;
            const angle = milestoneProgress * 360 - 90;
            const markerRadius = radius + strokeWidth / 2;
            const x = center + markerRadius * Math.cos(angle * Math.PI / 180);
            const y = center + markerRadius * Math.sin(angle * Math.PI / 180);
            
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r={3}
                fill={progressPercentage >= milestoneProgress ? finalColor : backgroundColor}
              />
            );
          })}
        </Svg>
        
        {/* Center content */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {finalIcon && (
            <Text style={{
              fontSize: size * 0.2,
              marginBottom: SPACING.xs,
            }}>
              {finalIcon}
            </Text>
          )}
          
          {showPercentage && (
            <Text style={[
              {
                ...TYPOGRAPHY.h4,
                color: finalColor,
                fontWeight: 'bold',
              },
              textStyle,
            ]}>
              {Math.round(progressPercentage * 100)}%
            </Text>
          )}
          
          {showValue && (
            <Text style={{
              ...TYPOGRAPHY.caption,
              color: COLORS.text.secondary,
              textAlign: 'center',
            }}>
              {progress >= 0 && progress <= 1 
                ? `${Math.round(progress * finalTarget)}/${finalTarget}`
                : `${Math.round(progress)}${showTarget ? `/${finalTarget}` : ''}`
              } {finalUnit}
            </Text>
          )}
          
          {goalName && (
            <Text style={{
              ...TYPOGRAPHY.caption,
              color: COLORS.text.tertiary,
              textAlign: 'center',
              marginTop: SPACING.xs,
            }}>
              {goalName}
            </Text>
          )}
        </View>
      </View>
    );
  };
  
  // Render linear bar progress
  const renderLinearBar = () => {
    const barHeight = strokeWidth * 2;
    const barWidth = size * 2;
    
    return (
      <View style={{
        width: barWidth,
        height: barHeight + 40,
      }}>
        {/* Goal name and icon */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: SPACING.sm,
        }}>
          {finalIcon && (
            <Text style={{ fontSize: 16, marginRight: SPACING.sm }}>
              {finalIcon}
            </Text>
          )}
          {goalName && (
            <Text style={{
              ...TYPOGRAPHY.bodyMedium,
              flex: 1,
            }}>
              {goalName}
            </Text>
          )}
          
          <Text style={{
            ...TYPOGRAPHY.bodySmall,
            color: COLORS.text.secondary,
          }}>
            {Math.round(progressPercentage * 100)}%
          </Text>
        </View>
        
        {/* Progress bar */}
        <View style={{
          height: barHeight,
          backgroundColor: backgroundColor,
          borderRadius: barHeight / 2,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <AnimatedView
            style={[
              {
                height: '100%',
                backgroundColor: finalColor,
                borderRadius: barHeight / 2,
                minWidth: barHeight, // Ensure minimum width for visibility
              },
              useAnimatedStyle(() => ({
                width: `${progressValue.value * 100}%`,
              })),
            ]}
          />
          
          {/* Milestone markers */}
          {showMilestones && presetConfig?.segments && presetConfig.segments.map((milestone, index) => {
            const milestoneProgress = milestone / finalTarget;
            
            return (
              <View
                key={index}
                style={{
                  position: 'absolute',
                  left: `${milestoneProgress * 100}%`,
                  top: -2,
                  width: 2,
                  height: barHeight + 4,
                  backgroundColor: COLORS.text.tertiary,
                }}
              />
            );
          })}
        </View>
        
        {/* Value display */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: SPACING.xs,
        }}>
          <Text style={{
            ...TYPOGRAPHY.caption,
            color: COLORS.text.secondary,
          }}>
            {progress >= 0 && progress <= 1 
              ? Math.round(progress * finalTarget)
              : Math.round(progress)
            } {finalUnit}
          </Text>
          
          {showTarget && (
            <Text style={{
              ...TYPOGRAPHY.caption,
              color: COLORS.text.tertiary,
            }}>
              Goal: {finalTarget} {finalUnit}
            </Text>
          )}
        </View>
      </View>
    );
  };
  
  // Render multi-ring progress (for multiple goals)
  const renderMultiRing = () => {
    if (!multiProgress.length) return renderCircularRing();
    
    const ringSpacing = strokeWidth + 4;
    const baseRadius = (size - strokeWidth) / 2;
    
    return (
      <View style={{
        width: size,
        height: size,
        position: 'relative',
      }}>
        <Svg width={size} height={size}>
          {multiProgress.map((item, index) => {
            const radius = baseRadius - (index * ringSpacing);
            const center = size / 2;
            const itemProgress = item.progress || 0;
            
            return (
              <G key={index}>
                {/* Background ring */}
                <Circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={backgroundColor}
                  strokeWidth={strokeWidth - 2}
                  fill="transparent"
                />
                
                {/* Progress ring */}
                <Circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={item.color || finalColor}
                  strokeWidth={strokeWidth - 2}
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * radius}
                  strokeDashoffset={2 * Math.PI * radius * (1 - itemProgress)}
                  transform={`rotate(-90 ${center} ${center})`}
                />
              </G>
            );
          })}
        </Svg>
        
        {/* Center legend */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            ...TYPOGRAPHY.h6,
            color: COLORS.text.primary,
          }}>
            Daily Goals
          </Text>
        </View>
      </View>
    );
  };
  
  // Render radial gauge
  const renderRadialGauge = () => {
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const startAngle = 135; // Start from bottom-left
    const endAngle = 405; // End at bottom-right (270 degrees total)
    const progressAngle = startAngle + (progressPercentage * (endAngle - startAngle));
    
    return (
      <View style={{
        width: size,
        height: size,
        position: 'relative',
      }}>
        <Svg width={size} height={size}>
          {/* Background arc */}
          <Path
            d={createCircularPath(radius, startAngle, endAngle)}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <Path
            d={createCircularPath(radius, startAngle, progressAngle)}
            stroke={finalColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />
          
          {/* Needle/indicator */}
          <G transform={`rotate(${progressAngle} ${center} ${center})`}>
            <Circle
              cx={center}
              cy={center}
              r={4}
              fill={finalColor}
            />
            <Path
              d={`M ${center} ${center - radius + strokeWidth} L ${center + 2} ${center} L ${center - 2} ${center} Z`}
              fill={finalColor}
            />
          </G>
        </Svg>
        
        {/* Value display */}
        <View style={{
          position: 'absolute',
          bottom: size * 0.25,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}>
          <Text style={[
            {
              ...TYPOGRAPHY.h3,
              color: finalColor,
              fontWeight: 'bold',
            },
            textStyle,
          ]}>
            {progress >= 0 && progress <= 1 
              ? Math.round(progress * finalTarget)
              : Math.round(progress)
            }
          </Text>
          <Text style={{
            ...TYPOGRAPHY.caption,
            color: COLORS.text.secondary,
          }}>
            {finalUnit}
          </Text>
        </View>
      </View>
    );
  };
  
  // Main render function
  const renderChart = () => {
    switch (chartType) {
      case PROGRESS_CHART_TYPES.LINEAR_BAR:
        return renderLinearBar();
      case PROGRESS_CHART_TYPES.MULTI_RING:
        return renderMultiRing();
      case PROGRESS_CHART_TYPES.RADIAL_GAUGE:
        return renderRadialGauge();
      case PROGRESS_CHART_TYPES.CIRCULAR_RING:
      default:
        return renderCircularRing();
    }
  };
  
  // Handle press
  const handlePress = () => {
    if (onPress) {
      // Feedback animation
      scaleValue.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      onPress();
    }
  };
  
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={0.8}
      style={style}
      testID={testID}
    >
      <AnimatedView style={containerAnimatedStyle}>
        {renderChart()}
      </AnimatedView>
    </TouchableOpacity>
  );
};

// Specialized progress components
export const StepsProgressRing = ({ steps, ...props }) => (
  <ProgressChart
    progress={steps}
    preset="steps"
    goalName="Daily Steps"
    {...props}
  />
);

export const WaterIntakeProgress = ({ glasses, ...props }) => (
  <ProgressChart
    progress={glasses}
    preset="water"
    goalName="Water Intake"
    chartType={PROGRESS_CHART_TYPES.LINEAR_BAR}
    {...props}
  />
);

export const SleepProgressGauge = ({ hours, ...props }) => (
  <ProgressChart
    progress={hours}
    preset="sleep"
    goalName="Sleep Goal"
    chartType={PROGRESS_CHART_TYPES.RADIAL_GAUGE}
    {...props}
  />
);

export const MedicationAdherenceRing = ({ adherenceRate, ...props }) => (
  <ProgressChart
    progress={adherenceRate / 100}
    preset="medication"
    goalName="Medication Adherence"
    showValue={false}
    {...props}
  />
);

export const MultiGoalRings = ({ goals, ...props }) => (
  <ProgressChart
    multiProgress={goals}
    chartType={PROGRESS_CHART_TYPES.MULTI_RING}
    size={140}
    {...props}
  />
);

export default ProgressChart;