/**
 * MediAssist App - MedicationChart Component
 * Interactive medication adherence and pattern visualization
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import {
  LineChart,
  BarChart,
  ProgressChart,
  PieChart,
} from 'react-native-chart-kit';
import Svg, { 
  Circle, 
  Rect, 
  Text as SvgText, 
  G,
  Defs,
  LinearGradient,
  Stop 
} from 'react-native-svg';

// Styles
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING, BORDER_RADIUS } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

// Chart types for medication visualization
const MEDICATION_CHART_TYPES = {
  ADHERENCE: 'adherence',
  SCHEDULE: 'schedule',
  DOSAGE_PATTERN: 'dosage_pattern',
  WEEKLY_CALENDAR: 'weekly_calendar',
  MONTHLY_HEATMAP: 'monthly_heatmap',
  PIE_BREAKDOWN: 'pie_breakdown',
  PROGRESS_RING: 'progress_ring',
};

// Adherence status colors
const ADHERENCE_COLORS = {
  taken: COLORS.status.success.main,
  missed: COLORS.status.error.main,
  partial: COLORS.status.warning.main,
  skipped: COLORS.neutral.gray[400],
  future: COLORS.neutral.gray[200],
};

const MedicationChart = ({
  // Data props
  medications = [],
  adherenceData = [],
  chartType = MEDICATION_CHART_TYPES.ADHERENCE,
  
  // Time range
  timeRange = '7d', // '1d', '7d', '1m', '3m'
  
  // Style props
  width = SCREEN_WIDTH - SPACING.lg * 2,
  height = 220,
  
  // Chart configuration
  showGrid = true,
  showLabels = true,
  showLegend = true,
  animated = true,
  
  // Interaction props
  onMedicationPress,
  onDatePress,
  
  // Custom styles
  style,
  
  // Test props
  testID,
}) => {
  // State
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [processedData, setProcessedData] = useState({});
  
  // Animation values
  const chartOpacity = useSharedValue(animated ? 0 : 1);
  const chartScale = useSharedValue(animated ? 0.9 : 1);
  
  // Process data based on chart type and time range
  useEffect(() => {
    processChartData();
    
    if (animated) {
      chartOpacity.value = withSpring(1, { duration: 800, dampingRatio: 0.8 });
      chartScale.value = withSpring(1, { duration: 800, dampingRatio: 0.7 });
    }
  }, [medications, adherenceData, chartType, timeRange]);
  
  // Data processing
  const processChartData = () => {
    switch (chartType) {
      case MEDICATION_CHART_TYPES.ADHERENCE:
        setProcessedData(processAdherenceData());
        break;
      case MEDICATION_CHART_TYPES.SCHEDULE:
        setProcessedData(processScheduleData());
        break;
      case MEDICATION_CHART_TYPES.DOSAGE_PATTERN:
        setProcessedData(processDosagePatternData());
        break;
      case MEDICATION_CHART_TYPES.WEEKLY_CALENDAR:
        setProcessedData(processWeeklyCalendarData());
        break;
      case MEDICATION_CHART_TYPES.MONTHLY_HEATMAP:
        setProcessedData(processMonthlyHeatmapData());
        break;
      case MEDICATION_CHART_TYPES.PIE_BREAKDOWN:
        setProcessedData(processPieBreakdownData());
        break;
      case MEDICATION_CHART_TYPES.PROGRESS_RING:
        setProcessedData(processProgressRingData());
        break;
      default:
        setProcessedData({});
    }
  };
  
  // Process adherence data for line/bar chart
  const processAdherenceData = () => {
    const now = new Date();
    const days = getTimeRangeDays();
    const labels = [];
    const adherenceRates = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayData = adherenceData.filter(item => 
        item.date?.split('T')[0] === dateStr
      );
      
      const totalDoses = dayData.length;
      const takenDoses = dayData.filter(item => item.status === 'taken').length;
      const rate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;
      
      adherenceRates.push(rate);
      
      // Format label based on time range
      if (timeRange === '1d') {
        labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else if (timeRange === '7d') {
        labels.push(date.toLocaleDateString([], { weekday: 'short' }));
      } else {
        labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
      }
    }
    
    return {
      labels,
      datasets: [{
        data: adherenceRates,
        color: (opacity = 1) => COLORS.primary.main + Math.round(opacity * 255).toString(16),
        strokeWidth: 3,
      }],
      adherenceRates,
    };
  };
  
  // Process schedule data for today's medications
  const processScheduleData = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = adherenceData.filter(item => 
      item.date?.split('T')[0] === today
    );
    
    // Group by hour
    const hourlyData = {};
    for (let hour = 0; hour < 24; hour++) {
      hourlyData[hour] = {
        scheduled: 0,
        taken: 0,
        missed: 0,
      };
    }
    
    todayData.forEach(item => {
      const hour = new Date(item.scheduledTime).getHours();
      hourlyData[hour].scheduled++;
      if (item.status === 'taken') {
        hourlyData[hour].taken++;
      } else if (item.status === 'missed') {
        hourlyData[hour].missed++;
      }
    });
    
    const labels = Object.keys(hourlyData).map(hour => 
      `${hour.toString().padStart(2, '0')}:00`
    );
    
    return {
      labels: labels.filter(label => {
        const hour = parseInt(label.split(':')[0]);
        return hourlyData[hour].scheduled > 0;
      }),
      scheduled: Object.values(hourlyData).map(data => data.scheduled),
      taken: Object.values(hourlyData).map(data => data.taken),
      missed: Object.values(hourlyData).map(data => data.missed),
      hourlyData,
    };
  };
  
  // Process dosage pattern data
  const processDosagePatternData = () => {
    const medicationDosages = {};
    
    medications.forEach(med => {
      const dosageAmount = parseFloat(med.dosage.match(/[\d.]+/)?.[0] || 0);
      const medData = adherenceData.filter(item => 
        item.medicationId === med.id && item.status === 'taken'
      );
      
      medicationDosages[med.name] = {
        dailyDosage: dosageAmount * (med.timesPerDay || 1),
        adherenceCount: medData.length,
        color: COLORS.medical.medication[med.type] || COLORS.primary.main,
      };
    });
    
    return medicationDosages;
  };
  
  // Process weekly calendar data
  const processWeeklyCalendarData = () => {
    const weekData = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayData = adherenceData.filter(item => 
        item.date?.split('T')[0] === dateStr
      );
      
      const totalDoses = dayData.length;
      const takenDoses = dayData.filter(item => item.status === 'taken').length;
      const missedDoses = dayData.filter(item => item.status === 'missed').length;
      
      weekData.push({
        date,
        dateStr,
        day: date.toLocaleDateString([], { weekday: 'short' }),
        total: totalDoses,
        taken: takenDoses,
        missed: missedDoses,
        adherenceRate: totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0,
      });
    }
    
    return weekData;
  };
  
  // Process monthly heatmap data
  const processMonthlyHeatmapData = () => {
    const monthData = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = adherenceData.filter(item => 
        item.date?.split('T')[0] === dateStr
      );
      
      const totalDoses = dayData.length;
      const takenDoses = dayData.filter(item => item.status === 'taken').length;
      const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : null;
      
      monthData.push({
        day,
        date,
        dateStr,
        total: totalDoses,
        taken: takenDoses,
        adherenceRate,
      });
    }
    
    return monthData;
  };
  
  // Process pie breakdown data
  const processPieBreakdownData = () => {
    const statusCounts = {
      taken: 0,
      missed: 0,
      partial: 0,
      skipped: 0,
    };
    
    adherenceData.forEach(item => {
      if (statusCounts[item.status] !== undefined) {
        statusCounts[item.status]++;
      }
    });
    
    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        population: count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
        color: ADHERENCE_COLORS[status],
        legendFontColor: COLORS.text.primary,
        legendFontSize: 12,
      }));
  };
  
  // Process progress ring data
  const processProgressRingData = () => {
    const totalDoses = adherenceData.length;
    const takenDoses = adherenceData.filter(item => item.status === 'taken').length;
    const adherenceRate = totalDoses > 0 ? takenDoses / totalDoses : 0;
    
    return {
      adherenceRate,
      totalDoses,
      takenDoses,
      missedDoses: totalDoses - takenDoses,
    };
  };
  
  // Helper functions
  const getTimeRangeDays = () => {
    switch (timeRange) {
      case '1d': return 1;
      case '7d': return 7;
      case '1m': return 30;
      case '3m': return 90;
      default: return 7;
    }
  };
  
  // Chart configuration
  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: COLORS.background.surface,
    backgroundGradientTo: COLORS.background.surface,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => COLORS.primary.main + Math.round(opacity * 255).toString(16),
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 1,
    propsForLabels: {
      fontSize: 11,
      fontWeight: '400',
    },
    propsForVerticalLabels: {
      fontSize: 10,
    },
    propsForHorizontalLabels: {
      fontSize: 10,
    },
  };
  
  // Render adherence line chart
  const renderAdherenceChart = () => {
    if (!processedData.labels?.length) return renderEmptyState();
    
    return (
      <LineChart
        data={processedData}
        width={width}
        height={height}
        chartConfig={{
          ...chartConfig,
          color: (opacity = 1) => COLORS.status.success.main + Math.round(opacity * 255).toString(16),
        }}
        bezier
        withHorizontalLabels={showLabels}
        withVerticalLabels={showLabels}
        withDots
        withShadow={false}
        withInnerLines={showGrid}
        withOuterLines={showGrid}
        style={{
          borderRadius: BORDER_RADIUS.md,
        }}
        formatYLabel={(value) => `${Math.round(value)}%`}
      />
    );
  };
  
  // Render schedule bar chart
  const renderScheduleChart = () => {
    if (!processedData.labels?.length) return renderEmptyState();
    
    const chartData = {
      labels: processedData.labels,
      datasets: [
        {
          data: processedData.taken,
          color: (opacity = 1) => COLORS.status.success.main + Math.round(opacity * 255).toString(16),
        },
        {
          data: processedData.missed,
          color: (opacity = 1) => COLORS.status.error.main + Math.round(opacity * 255).toString(16),
        },
      ],
    };
    
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
  };
  
  // Render weekly calendar view
  const renderWeeklyCalendar = () => {
    if (!processedData.length) return renderEmptyState();
    
    return (
      <View style={{
        height,
        padding: SPACING.md,
        backgroundColor: COLORS.background.surface,
        borderRadius: BORDER_RADIUS.md,
      }}>
        <Text style={{
          ...TYPOGRAPHY.h6,
          marginBottom: SPACING.md,
          textAlign: 'center',
        }}>
          Weekly Adherence
        </Text>
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          flex: 1,
        }}>
          {processedData.map((dayData, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onDatePress?.(dayData)}
              style={{
                flex: 1,
                alignItems: 'center',
                marginHorizontal: 2,
              }}
            >
              <Text style={{
                ...TYPOGRAPHY.caption,
                color: COLORS.text.secondary,
                marginBottom: SPACING.xs,
              }}>
                {dayData.day}
              </Text>
              
              <View style={{
                width: 40,
                height: 60,
                borderRadius: BORDER_RADIUS.sm,
                backgroundColor: dayData.total === 0 
                  ? COLORS.neutral.gray[200]
                  : dayData.adherenceRate >= 80
                  ? COLORS.status.success.main
                  : dayData.adherenceRate >= 50
                  ? COLORS.status.warning.main
                  : COLORS.status.error.main,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{
                  ...TYPOGRAPHY.caption,
                  color: COLORS.text.inverse,
                  fontWeight: 'bold',
                }}>
                  {dayData.total > 0 ? Math.round(dayData.adherenceRate) + '%' : '-'}
                </Text>
              </View>
              
              <Text style={{
                ...TYPOGRAPHY.caption,
                color: COLORS.text.tertiary,
                marginTop: SPACING.xs,
              }}>
                {dayData.taken}/{dayData.total}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  // Render monthly heatmap
  const renderMonthlyHeatmap = () => {
    if (!processedData.length) return renderEmptyState();
    
    const today = new Date();
    const monthName = today.toLocaleDateString([], { month: 'long', year: 'numeric' });
    
    return (
      <View style={{
        height,
        padding: SPACING.md,
        backgroundColor: COLORS.background.surface,
        borderRadius: BORDER_RADIUS.md,
      }}>
        <Text style={{
          ...TYPOGRAPHY.h6,
          marginBottom: SPACING.md,
          textAlign: 'center',
        }}>
          {monthName} Adherence
        </Text>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            width: width * 1.2,
          }}
        >
          {processedData.map((dayData, index) => {
            const isToday = dayData.dateStr === new Date().toISOString().split('T')[0];
            const intensity = dayData.adherenceRate ? dayData.adherenceRate / 100 : 0;
            
            return (
              <TouchableOpacity
                key={index}
                onPress={() => onDatePress?.(dayData)}
                style={{
                  width: 24,
                  height: 24,
                  margin: 1,
                  borderRadius: 4,
                  backgroundColor: dayData.total === 0
                    ? COLORS.neutral.gray[200]
                    : interpolateColor(
                        intensity,
                        [0, 1],
                        [COLORS.status.error.light, COLORS.status.success.main]
                      ),
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: isToday ? 2 : 0,
                  borderColor: COLORS.primary.main,
                }}
              >
                <Text style={{
                  ...TYPOGRAPHY.caption,
                  fontSize: 10,
                  color: intensity > 0.5 ? COLORS.text.inverse : COLORS.text.primary,
                  fontWeight: isToday ? 'bold' : 'normal',
                }}>
                  {dayData.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };
  
  // Render pie chart breakdown
  const renderPieBreakdown = () => {
    if (!processedData.length) return renderEmptyState();
    
    return (
      <PieChart
        data={processedData}
        width={width}
        height={height}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 10]}
        absolute
      />
    );
  };
  
  // Render progress ring
  const renderProgressRing = () => {
    if (!processedData.adherenceRate) return renderEmptyState();
    
    return (
      <View style={{
        height,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background.surface,
        borderRadius: BORDER_RADIUS.md,
      }}>
        <ProgressChart
          data={{
            labels: ['Adherence'],
            data: [processedData.adherenceRate],
          }}
          width={width}
          height={height}
          strokeWidth={16}
          radius={80}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => COLORS.status.success.main + Math.round(opacity * 255).toString(16),
          }}
          hideLegend
        />
        
        <View style={{
          position: 'absolute',
          alignItems: 'center',
        }}>
          <Text style={{
            ...TYPOGRAPHY.h1,
            color: COLORS.status.success.main,
            fontWeight: 'bold',
          }}>
            {Math.round(processedData.adherenceRate * 100)}%
          </Text>
          <Text style={{
            ...TYPOGRAPHY.caption,
            color: COLORS.text.secondary,
          }}>
            Adherence
          </Text>
          <Text style={{
            ...TYPOGRAPHY.caption,
            color: COLORS.text.tertiary,
            marginTop: SPACING.xs,
          }}>
            {processedData.takenDoses}/{processedData.totalDoses} doses
          </Text>
        </View>
      </View>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={{
      height,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.neutral.gray[50],
      borderRadius: BORDER_RADIUS.md,
    }}>
      <Text style={{
        ...TYPOGRAPHY.h6,
        color: COLORS.text.tertiary,
        marginBottom: SPACING.sm,
      }}>
        📊
      </Text>
      <Text style={{
        ...TYPOGRAPHY.bodyMedium,
        color: COLORS.text.tertiary,
        textAlign: 'center',
      }}>
        No medication data available
      </Text>
      <Text style={{
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.text.tertiary,
        textAlign: 'center',
        marginTop: SPACING.xs,
      }}>
        Start tracking your medications to see insights
      </Text>
    </View>
  );
  
  // Render main chart based on type
  const renderMainChart = () => {
    switch (chartType) {
      case MEDICATION_CHART_TYPES.ADHERENCE:
        return renderAdherenceChart();
      case MEDICATION_CHART_TYPES.SCHEDULE:
        return renderScheduleChart();
      case MEDICATION_CHART_TYPES.WEEKLY_CALENDAR:
        return renderWeeklyCalendar();
      case MEDICATION_CHART_TYPES.MONTHLY_HEATMAP:
        return renderMonthlyHeatmap();
      case MEDICATION_CHART_TYPES.PIE_BREAKDOWN:
        return renderPieBreakdown();
      case MEDICATION_CHART_TYPES.PROGRESS_RING:
        return renderProgressRing();
      default:
        return renderAdherenceChart();
    }
  };
  
  // Render chart statistics
  const renderStatistics = () => {
    const totalDoses = adherenceData.length;
    const takenDoses = adherenceData.filter(item => item.status === 'taken').length;
    const missedDoses = adherenceData.filter(item => item.status === 'missed').length;
    const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;
    
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
            color: COLORS.status.success.main,
          }}>
            {Math.round(adherenceRate)}%
          </Text>
          <Text style={{
            ...TYPOGRAPHY.caption,
            color: COLORS.text.secondary,
          }}>
            Adherence
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            ...TYPOGRAPHY.h6,
            color: COLORS.text.primary,
          }}>
            {takenDoses}
          </Text>
          <Text style={{
            ...TYPOGRAPHY.caption,
            color: COLORS.text.secondary,
          }}>
            Taken
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            ...TYPOGRAPHY.h6,
            color: COLORS.status.error.main,
          }}>
            {missedDoses}
          </Text>
          <Text style={{
            ...TYPOGRAPHY.caption,
            color: COLORS.text.secondary,
          }}>
            Missed
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            ...TYPOGRAPHY.h6,
            color: COLORS.text.primary,
          }}>
            {medications.length}
          </Text>
          <Text style={{
            ...TYPOGRAPHY.caption,
            color: COLORS.text.secondary,
          }}>
            Medications
          </Text>
        </View>
      </View>
    );
  };
  
  // Animated styles
  const chartAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
    transform: [{ scale: chartScale.value }],
  }));
  
  return (
    <View style={[{ width }, style]} testID={testID}>
      <AnimatedView style={chartAnimatedStyle}>
        {renderMainChart()}
      </AnimatedView>
      
      {/* Statistics */}
      {chartType !== MEDICATION_CHART_TYPES.PROGRESS_RING && renderStatistics()}
      
      {/* Legend for complex charts */}
      {showLegend && chartType === MEDICATION_CHART_TYPES.SCHEDULE && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: SPACING.lg,
          marginTop: SPACING.sm,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: COLORS.status.success.main,
              marginRight: SPACING.xs,
            }} />
            <Text style={{
              ...TYPOGRAPHY.caption,
              color: COLORS.text.secondary,
            }}>
              Taken
            </Text>
          </View>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: COLORS.status.error.main,
              marginRight: SPACING.xs,
            }} />
            <Text style={{
              ...TYPOGRAPHY.caption,
              color: COLORS.text.secondary,
            }}>
              Missed
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

// Specialized medication chart components
export const AdherenceChart = ({ medications, adherenceData, ...props }) => (
  <MedicationChart
    medications={medications}
    adherenceData={adherenceData}
    chartType={MEDICATION_CHART_TYPES.ADHERENCE}
    {...props}
  />
);

export const MedicationScheduleChart = ({ medications, adherenceData, ...props }) => (
  <MedicationChart
    medications={medications}
    adherenceData={adherenceData}
    chartType={MEDICATION_CHART_TYPES.SCHEDULE}
    {...props}
  />
);

export const WeeklyAdherenceCalendar = ({ medications, adherenceData, ...props }) => (
  <MedicationChart
    medications={medications}
    adherenceData={adherenceData}
    chartType={MEDICATION_CHART_TYPES.WEEKLY_CALENDAR}
    height={160}
    {...props}
  />
);

export const AdherenceProgressRing = ({ medications, adherenceData, ...props }) => (
  <MedicationChart
    medications={medications}
    adherenceData={adherenceData}
    chartType={MEDICATION_CHART_TYPES.PROGRESS_RING}
    height={200}
    {...props}
  />
);

export default MedicationChart;