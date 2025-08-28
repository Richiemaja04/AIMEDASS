/**
 * MediAssist App - HealthChart Component
 * Interactive health data visualization with medical contexts
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
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import {
  LineChart,
  BarChart,
  AreaChart,
  PieChart,
  ProgressChart,
} from 'react-native-chart-kit';
import Svg, { Circle, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

// Styles
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING, BORDER_RADIUS } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

// Chart types
const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  AREA: 'area',
  PIE: 'pie',
  PROGRESS: 'progress',
  VITAL_RING: 'vital_ring',
  TREND: 'trend',
};

// Medical chart presets
const MEDICAL_PRESETS = {
  bloodPressure: {
    type: CHART_TYPES.LINE,
    color: COLORS.medical.vital.bloodPressure,
    unit: 'mmHg',
    normalRange: { min: 90, max: 140 },
    criticalRange: { min: 60, max: 180 },
  },
  heartRate: {
    type: CHART_TYPES.LINE,
    color: COLORS.medical.vital.heartRate,
    unit: 'bpm',
    normalRange: { min: 60, max: 100 },
    criticalRange: { min: 40, max: 150 },
  },
  temperature: {
    type: CHART_TYPES.LINE,
    color: COLORS.medical.vital.temperature,
    unit: '°F',
    normalRange: { min: 97, max: 99.5 },
    criticalRange: { min: 95, max: 104 },
  },
  weight: {
    type: CHART_TYPES.AREA,
    color: COLORS.secondary.main,
    unit: 'lbs',
    normalRange: null,
    criticalRange: null,
  },
  glucose: {
    type: CHART_TYPES.LINE,
    color: COLORS.medical.vital.glucose,
    unit: 'mg/dL',
    normalRange: { min: 70, max: 140 },
    criticalRange: { min: 40, max: 400 },
  },
};

const HealthChart = ({
  // Data props
  data = [],
  chartType = CHART_TYPES.LINE,
  preset,
  
  // Style props
  width = SCREEN_WIDTH - SPACING.lg * 2,
  height = 220,
  color = COLORS.primary.main,
  backgroundColor = 'transparent',
  
  // Chart configuration
  showGrid = true,
  showLabels = true,
  showLegend = false,
  showRanges = true,
  animated = true,
  
  // Interaction props
  onDataPointPress,
  onChartPress,
  
  // Time range
  timeRange = '7d', // '1d', '7d', '1m', '3m', '1y'
  
  // Medical props
  unit,
  normalRange,
  criticalRange,
  target,
  
  // Custom styles
  style,
  
  // Test props
  testID,
}) => {
  // State
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [chartConfig, setChartConfig] = useState(null);
  const [processedData, setProcessedData] = useState([]);
  
  // Animation values
  const chartOpacity = useSharedValue(animated ? 0 : 1);
  const chartScale = useSharedValue(animated ? 0.8 : 1);
  const pulseAnimation = useSharedValue(1);
  
  // Refs
  const chartRef = useRef(null);
  
  // Get preset configuration
  const presetConfig = preset ? MEDICAL_PRESETS[preset] : null;
  const finalColor = presetConfig?.color || color;
  const finalUnit = presetConfig?.unit || unit;
  const finalNormalRange = presetConfig?.normalRange || normalRange;
  const finalCriticalRange = presetConfig?.criticalRange || criticalRange;
  const finalChartType = presetConfig?.type || chartType;
  
  // Process data on mount and data changes
  useEffect(() => {
    processChartData();
    setupChartConfig();
    
    if (animated) {
      chartOpacity.value = withSpring(1, { duration: 800, dampingRatio: 0.8 });
      chartScale.value = withSpring(1, { duration: 800, dampingRatio: 0.7 });
    }
  }, [data, timeRange, finalChartType]);
  
  // Setup chart configuration
  const setupChartConfig = () => {
    const config = {
      backgroundColor: backgroundColor,
      backgroundGradientFrom: backgroundColor || COLORS.background.surface,
      backgroundGradientTo: backgroundColor || COLORS.background.surface,
      backgroundGradientFromOpacity: 0,
      backgroundGradientToOpacity: 0,
      color: (opacity = 1) => `rgba(${hexToRgb(finalColor)}, ${opacity})`,
      strokeWidth: 2,
      barPercentage: 0.7,
      useShadowColorFromDataset: false,
      decimalPlaces: 1,
      propsForLabels: {
        fontSize: 12,
        fontFamily: Platform.select({
          ios: 'SF Pro Text',
          android: 'Roboto',
          default: 'System',
        }),
      },
      propsForVerticalLabels: {
        fontSize: 10,
      },
      propsForHorizontalLabels: {
        fontSize: 10,
      },
      fillShadowGradient: finalColor,
      fillShadowGradientOpacity: 0.3,
      ...(showGrid && {
        propsForBackgroundLines: {
          strokeDasharray: '',
          stroke: COLORS.border.light,
          strokeWidth: 1,
        },
      }),
    };
    
    setChartConfig(config);
  };
  
  // Process and filter data based on time range
  const processChartData = () => {
    if (!data || data.length === 0) {
      setProcessedData([]);
      return;
    }
    
    // Filter data by time range
    const now = new Date();
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.timestamp || item.date);
      const diffInDays = (now - itemDate) / (1000 * 60 * 60 * 24);
      
      switch (timeRange) {
        case '1d':
          return diffInDays <= 1;
        case '7d':
          return diffInDays <= 7;
        case '1m':
          return diffInDays <= 30;
        case '3m':
          return diffInDays <= 90;
        case '1y':
          return diffInDays <= 365;
        default:
          return true;
      }
    });
    
    // Sort by date
    const sortedData = filteredData.sort((a, b) => {
      const dateA = new Date(a.timestamp || a.date);
      const dateB = new Date(b.timestamp || b.date);
      return dateA - dateB;
    });
    
    setProcessedData(sortedData);
  };
  
  // Helper functions
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0, 0, 0';
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
  };
  
  const formatChartData = () => {
    if (!processedData.length) return { labels: [], datasets: [{ data: [] }] };
    
    const labels = processedData.map(item => {
      const date = new Date(item.timestamp || item.date);
      switch (timeRange) {
        case '1d':
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        case '7d':
          return date.toLocaleDateString([], { weekday: 'short' });
        case '1m':
        case '3m':
          return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        case '1y':
          return date.toLocaleDateString([], { month: 'short' });
        default:
          return date.toLocaleDateString();
      }
    });
    
    const values = processedData.map(item => item.value);
    
    return {
      labels,
      datasets: [{
        data: values,
        color: (opacity = 1) => `rgba(${hexToRgb(finalColor)}, ${opacity})`,
        strokeWidth: 2,
      }]
    };
  };
  
  // Handle data point press
  const handleDataPointPress = (data) => {
    setSelectedDataPoint(data);
    
    // Pulse animation
    pulseAnimation.value = withSpring(1.2, { duration: 200 }, () => {
      pulseAnimation.value = withSpring(1, { duration: 200 });
    });
    
    onDataPointPress?.(data);
  };
  
  // Get status color based on value and ranges
  const getStatusColor = (value) => {
    if (!finalNormalRange && !finalCriticalRange) return finalColor;
    
    if (finalCriticalRange) {
      if (value < finalCriticalRange.min || value > finalCriticalRange.max) {
        return COLORS.status.error.main;
      }
    }
    
    if (finalNormalRange) {
      if (value < finalNormalRange.min || value > finalNormalRange.max) {
        return COLORS.status.warning.main;
      }
    }
    
    return COLORS.status.success.main;
  };
  
  // Render range indicators
  const renderRangeIndicators = () => {
    if (!showRanges || (!finalNormalRange && !finalCriticalRange)) return null;
    
    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginTop: SPACING.sm,
      }}>
        {finalNormalRange && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: COLORS.status.success.main,
              marginRight: SPACING.xs,
            }} />
            <Text style={{
              ...TYPOGRAPHY.caption,
              color: COLORS.text.secondary,
            }}>
              Normal: {finalNormalRange.min}-{finalNormalRange.max} {finalUnit}
            </Text>
          </View>
        )}
        
        {finalCriticalRange && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: COLORS.status.error.main,
              marginRight: SPACING.xs,
            }} />
            <Text style={{
              ...TYPOGRAPHY.caption,
              color: COLORS.text.secondary,
            }}>
              Critical: <{finalCriticalRange.min} or >{finalCriticalRange.max} {finalUnit}
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  // Render chart statistics
  const renderStatistics = () => {
    if (!processedData.length) return null;
    
    const values = processedData.map(item => item.value);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const latest = values[values.length - 1];
    const trend = values.length > 1 ? (latest - values[values.length - 2]) : 0;
    
    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.neutral.gray[50],
        borderRadius: BORDER_RADIUS.md,
        marginTop: SPACING.md,
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            ...TYPOGRAPHY.h6,
            color: getStatusColor(latest),
          }}>
            {latest?.toFixed(1)}
          </Text>
          <Text style={{
            ...TYPOGRAPHY.caption,
            color: COLORS.text.secondary,
          }}>
            Current
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            ...TYPOGRAPHY.h6,
            color: COLORS.text.primary,
          }}>
            {avg.toFixed(1)}
          </Text>
          <Text style={{
            ...TYPOGRAPHY.caption,
            color: COLORS.text.secondary,
          }}>
            Average
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            ...TYPOGRAPHY.h6,
            color: trend >= 0 ? COLORS.status.success.main : COLORS.status.error.main,
          }}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}
          </Text>
          <Text style={{
            ...TYPOGRAPHY.caption,
            color: COLORS.text.secondary,
          }}>
            Trend
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            ...TYPOGRAPHY.h6,
            color: COLORS.text.primary,
          }}>
            {min.toFixed(1)}-{max.toFixed(1)}
          </Text>
          <Text style={{
            ...TYPOGRAPHY.caption,
            color: COLORS.text.secondary,
          }}>
            Range
          </Text>
        </View>
      </View>
    );
  };
  
  // Render time range selector
  const renderTimeRangeSelector = () => {
    const ranges = [
      { value: '1d', label: '1D' },
      { value: '7d', label: '7D' },
      { value: '1m', label: '1M' },
      { value: '3m', label: '3M' },
      { value: '1y', label: '1Y' },
    ];
    
    return (
      <View style={{
        flexDirection: 'row',
        backgroundColor: COLORS.neutral.gray[100],
        borderRadius: BORDER_RADIUS.pill,
        padding: SPACING.xs,
        marginBottom: SPACING.md,
      }}>
        {ranges.map((range) => (
          <TouchableOpacity
            key={range.value}
            onPress={() => setTimeRange?.(range.value)}
            style={{
              flex: 1,
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              borderRadius: BORDER_RADIUS.pill,
              backgroundColor: timeRange === range.value ? finalColor : 'transparent',
            }}
          >
            <Text style={{
              ...TYPOGRAPHY.caption,
              textAlign: 'center',
              fontWeight: '600',
              color: timeRange === range.value ? COLORS.text.inverse : COLORS.text.secondary,
            }}>
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Render vital ring chart
  const renderVitalRing = () => {
    if (finalChartType !== CHART_TYPES.VITAL_RING || !processedData.length) return null;
    
    const latest = processedData[processedData.length - 1];
    const value = latest?.value || 0;
    const progress = finalNormalRange 
      ? Math.min(value / finalNormalRange.max, 1.0)
      : value / 100;
    
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', height }}>
        <ProgressChart
          data={{
            labels: [preset || 'Value'],
            data: [progress]
          }}
          width={width}
          height={height}
          strokeWidth={16}
          radius={80}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => getStatusColor(value) + Math.round(opacity * 255).toString(16),
          }}
          hideLegend
        />
        
        <View style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{
            ...TYPOGRAPHY.h2,
            color: getStatusColor(value),
            fontWeight: 'bold',
          }}>
            {value.toFixed(0)}
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
  
  // Render main chart
  const renderChart = () => {
    if (!processedData.length || !chartConfig) {
      return (
        <View style={{
          height,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.neutral.gray[50],
          borderRadius: BORDER_RADIUS.md,
        }}>
          <Text style={{
            ...TYPOGRAPHY.bodyMedium,
            color: COLORS.text.tertiary,
          }}>
            No data available
          </Text>
        </View>
      );
    }
    
    const chartData = formatChartData();
    
    switch (finalChartType) {
      case CHART_TYPES.LINE:
        return (
          <LineChart
            data={chartData}
            width={width}
            height={height}
            chartConfig={chartConfig}
            bezier
            onDataPointClick={handleDataPointPress}
            withHorizontalLabels={showLabels}
            withVerticalLabels={showLabels}
            withShadow={false}
            withDots
            withInnerLines={showGrid}
            withOuterLines={showGrid}
            style={{
              borderRadius: BORDER_RADIUS.md,
            }}
          />
        );
        
      case CHART_TYPES.BAR:
        return (
          <BarChart
            data={chartData}
            width={width}
            height={height}
            chartConfig={chartConfig}
            showBarTops={false}
            withHorizontalLabels={showLabels}
            withVerticalLabels={showLabels}
            style={{
              borderRadius: BORDER_RADIUS.md,
            }}
          />
        );
        
      case CHART_TYPES.AREA:
        return (
          <AreaChart
            data={chartData}
            width={width}
            height={height}
            chartConfig={chartConfig}
            withHorizontalLabels={showLabels}
            withVerticalLabels={showLabels}
            withInnerLines={showGrid}
            style={{
              borderRadius: BORDER_RADIUS.md,
            }}
          />
        );
        
      case CHART_TYPES.VITAL_RING:
        return renderVitalRing();
        
      default:
        return renderChart();
    }
  };
  
  // Animated styles
  const chartAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
    transform: [
      { scale: chartScale.value },
      { scale: pulseAnimation.value },
    ],
  }));
  
  // Main render
  return (
    <View style={[{ width }, style]} testID={testID}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
      }}>
        <View>
          {preset && (
            <Text style={{
              ...TYPOGRAPHY.h6,
              color: finalColor,
              textTransform: 'capitalize',
            }}>
              {preset.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Text>
          )}
          
          {finalUnit && (
            <Text style={{
              ...TYPOGRAPHY.caption,
              color: COLORS.text.secondary,
            }}>
              Values in {finalUnit}
            </Text>
          )}
        </View>
        
        {showLegend && processedData.length > 0 && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: finalColor,
              marginRight: SPACING.xs,
            }} />
            <Text style={{
              ...TYPOGRAPHY.caption,
              color: COLORS.text.secondary,
            }}>
              {processedData.length} readings
            </Text>
          </View>
        )}
      </View>
      
      {/* Time Range Selector */}
      {renderTimeRangeSelector()}
      
      {/* Chart */}
      <AnimatedView style={chartAnimatedStyle}>
        {renderChart()}
      </AnimatedView>
      
      {/* Statistics */}
      {renderStatistics()}
      
      {/* Range Indicators */}
      {renderRangeIndicators()}
      
      {/* Selected Data Point Details */}
      {selectedDataPoint && (
        <View style={{
          marginTop: SPACING.md,
          padding: SPACING.md,
          backgroundColor: COLORS.primary.100,
          borderRadius: BORDER_RADIUS.md,
          borderLeftWidth: 4,
          borderLeftColor: finalColor,
        }}>
          <Text style={{
            ...TYPOGRAPHY.bodySmall,
            color: COLORS.primary.dark,
            marginBottom: SPACING.xs,
          }}>
            Selected Reading
          </Text>
          <Text style={{
            ...TYPOGRAPHY.bodyMedium,
            color: COLORS.text.primary,
          }}>
            {selectedDataPoint.value} {finalUnit} at {new Date(selectedDataPoint.x).toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );
};

// Specialized health chart components
export const BloodPressureChart = ({ data, ...props }) => (
  <HealthChart
    data={data}
    preset="bloodPressure"
    {...props}
  />
);

export const HeartRateChart = ({ data, ...props }) => (
  <HealthChart
    data={data}
    preset="heartRate"
    {...props}
  />
);

export const WeightChart = ({ data, ...props }) => (
  <HealthChart
    data={data}
    preset="weight"
    {...props}
  />
);

export const GlucoseChart = ({ data, ...props }) => (
  <HealthChart
    data={data}
    preset="glucose"
    {...props}
  />
);

export const VitalRingChart = ({ data, preset, ...props }) => (
  <HealthChart
    data={data}
    preset={preset}
    chartType={CHART_TYPES.VITAL_RING}
    height={200}
    {...props}
  />
);

export default HealthChart;