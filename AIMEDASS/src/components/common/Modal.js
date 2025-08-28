/**
 * MediAssist App - Modal Component
 * Professional modal component with animations and accessibility
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  BackHandler,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING, BORDER_RADIUS, Z_INDEX } from '../../../styles/spacing';
import { SHADOWS } from '../../../styles/shadows';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);

// Modal variants
const VARIANTS = {
  center: {
    position: 'center',
    maxWidth: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  bottom: {
    position: 'bottom',
    maxWidth: '100%',
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  top: {
    position: 'top',
    maxWidth: '100%',
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  fullscreen: {
    position: 'fullscreen',
    maxWidth: '100%',
    maxHeight: '100%',
  },
};

// Animation types
const ANIMATION_TYPES = {
  slide: 'slide',
  fade: 'fade',
  scale: 'scale',
  slideUp: 'slideUp',
  slideDown: 'slideDown',
};

const Modal = ({
  // Visibility props
  visible = false,
  onClose,
  onShow,
  onDismiss,
  
  // Content props
  children,
  title,
  subtitle,
  
  // Style props
  variant = 'center',
  animationType = 'slide',
  
  // Behavior props
  dismissible = true,
  backdropDismiss = true,
  hardwareBackPress = true,
  
  // Visual props
  showCloseButton = true,
  backdrop = true,
  backdropOpacity = 0.5,
  statusBarTranslucent = true,
  
  // Header/Footer props
  header,
  footer,
  
  // Accessibility props
  accessibilityLabel,
  accessibilityViewIsModal = true,
  
  // Custom styles
  style,
  containerStyle,
  contentStyle,
  backdropStyle,
  
  // Test props
  testID,
}) => {
  const insets = useSafeAreaInsets();
  
  // Animation values
  const backdropOpacityValue = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(
    variant === 'bottom' ? SCREEN_HEIGHT : 
    variant === 'top' ? -SCREEN_HEIGHT : 0
  );
  
  // Refs
  const modalRef = useRef(null);
  const isAnimating = useRef(false);
  
  // Get variant configuration
  const variantConfig = VARIANTS[variant];
  
  // Show modal animation
  const showModal = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    
    // Backdrop animation
    if (backdrop) {
      backdropOpacityValue.value = withTiming(backdropOpacity, {
        duration: 300,
      });
    }
    
    // Modal animations based on type
    switch (animationType) {
      case ANIMATION_TYPES.fade:
        modalOpacity.value = withSpring(1, {
          duration: 400,
          dampingRatio: 0.8,
        }, () => {
          runOnJS(() => {
            isAnimating.current = false;
            onShow?.();
          })();
        });
        break;
        
      case ANIMATION_TYPES.scale:
        modalScale.value = withSpring(1, {
          duration: 400,
          dampingRatio: 0.7,
        });
        modalOpacity.value = withSpring(1, {
          duration: 300,
        }, () => {
          runOnJS(() => {
            isAnimating.current = false;
            onShow?.();
          })();
        });
        break;
        
      case ANIMATION_TYPES.slideUp:
      case ANIMATION_TYPES.slide:
        modalTranslateY.value = withSpring(0, {
          duration: 500,
          dampingRatio: 0.8,
        });
        modalOpacity.value = withTiming(1, {
          duration: 200,
        }, () => {
          runOnJS(() => {
            isAnimating.current = false;
            onShow?.();
          })();
        });
        break;
        
      case ANIMATION_TYPES.slideDown:
        modalTranslateY.value = withSpring(0, {
          duration: 500,
          dampingRatio: 0.8,
        });
        modalOpacity.value = withTiming(1, {
          duration: 200,
        }, () => {
          runOnJS(() => {
            isAnimating.current = false;
            onShow?.();
          })();
        });
        break;
        
      default:
        modalOpacity.value = withSpring(1, {
          duration: 300,
        }, () => {
          runOnJS(() => {
            isAnimating.current = false;
            onShow?.();
          })();
        });
    }
  };
  
  // Hide modal animation
  const hideModal = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    
    // Backdrop animation
    if (backdrop) {
      backdropOpacityValue.value = withTiming(0, {
        duration: 250,
      });
    }
    
    // Modal animations based on type
    switch (animationType) {
      case ANIMATION_TYPES.fade:
        modalOpacity.value = withTiming(0, {
          duration: 250,
        }, () => {
          runOnJS(() => {
            isAnimating.current = false;
            onDismiss?.();
          })();
        });
        break;
        
      case ANIMATION_TYPES.scale:
        modalScale.value = withTiming(0.8, {
          duration: 200,
        });
        modalOpacity.value = withTiming(0, {
          duration: 250,
        }, () => {
          runOnJS(() => {
            isAnimating.current = false;
            onDismiss?.();
          })();
        });
        break;
        
      case ANIMATION_TYPES.slideUp:
      case ANIMATION_TYPES.slide:
        modalTranslateY.value = withTiming(
          variant === 'bottom' ? SCREEN_HEIGHT : -SCREEN_HEIGHT,
          { duration: 300 }
        );
        modalOpacity.value = withTiming(0, {
          duration: 200,
        }, () => {
          runOnJS(() => {
            isAnimating.current = false;
            onDismiss?.();
          })();
        });
        break;
        
      case ANIMATION_TYPES.slideDown:
        modalTranslateY.value = withTiming(SCREEN_HEIGHT, {
          duration: 300,
        });
        modalOpacity.value = withTiming(0, {
          duration: 200,
        }, () => {
          runOnJS(() => {
            isAnimating.current = false;
            onDismiss?.();
          })();
        });
        break;
        
      default:
        modalOpacity.value = withTiming(0, {
          duration: 250,
        }, () => {
          runOnJS(() => {
            isAnimating.current = false;
            onDismiss?.();
          })();
        });
    }
  };
  
  // Handle close
  const handleClose = () => {
    if (!dismissible) return;
    hideModal();
    setTimeout(() => onClose?.(), 300);
  };
  
  // Handle backdrop press
  const handleBackdropPress = () => {
    if (backdropDismiss) {
      handleClose();
    }
  };
  
  // Handle hardware back press
  useEffect(() => {
    if (visible && hardwareBackPress && Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handleClose();
          return true;
        }
      );
      
      return () => backHandler.remove();
    }
  }, [visible, hardwareBackPress]);
  
  // Trigger animations when visibility changes
  useEffect(() => {
    if (visible) {
      // Reset animation values
      if (animationType === ANIMATION_TYPES.scale) {
        modalScale.value = 0.8;
      }
      if (animationType !== ANIMATION_TYPES.fade) {
        modalTranslateY.value = variant === 'bottom' ? SCREEN_HEIGHT : 
                              variant === 'top' ? -SCREEN_HEIGHT : 0;
      }
      modalOpacity.value = 0;
      backdropOpacityValue.value = 0;
      
      // Start show animation
      requestAnimationFrame(showModal);
    } else {
      hideModal();
    }
  }, [visible]);
  
  // Animated styles
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacityValue.value,
  }));
  
  const modalAnimatedStyle = useAnimatedStyle(() => {
    const transform = [];
    
    if (animationType === ANIMATION_TYPES.scale) {
      transform.push({ scale: modalScale.value });
    }
    
    if (variant !== 'fullscreen' && modalTranslateY.value !== 0) {
      transform.push({ translateY: modalTranslateY.value });
    }
    
    return {
      opacity: modalOpacity.value,
      transform,
    };
  });
  
  // Styles
  const containerStyleComputed = [
    {
      flex: 1,
      justifyContent: getJustifyContent(),
      alignItems: getAlignItems(),
      paddingTop: variant !== 'fullscreen' ? insets.top : 0,
      paddingBottom: variant !== 'fullscreen' ? insets.bottom : 0,
      paddingHorizontal: variant === 'center' ? SPACING.lg : 0,
    },
    containerStyle,
  ];
  
  const modalStyleComputed = [
    {
      backgroundColor: COLORS.background.surface,
      borderRadius: variant === 'fullscreen' ? 0 : BORDER_RADIUS.modal,
      maxWidth: variantConfig.maxWidth,
      maxHeight: variantConfig.maxHeight,
      width: variant === 'center' ? 'auto' : '100%',
      ...getModalShadow(),
    },
    getVariantSpecificStyles(),
    style,
  ];
  
  const contentStyleComputed = [
    {
      flex: variant === 'fullscreen' ? 1 : 0,
    },
    contentStyle,
  ];
  
  const backdropStyleComputed = [
    {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: COLORS.background.modal,
    },
    backdropStyle,
  ];
  
  // Helper functions
  function getJustifyContent() {
    switch (variant) {
      case 'top': return 'flex-start';
      case 'bottom': return 'flex-end';
      case 'fullscreen': return 'flex-start';
      default: return 'center';
    }
  }
  
  function getAlignItems() {
    switch (variant) {
      case 'fullscreen': return 'stretch';
      default: return 'center';
    }
  }
  
  function getModalShadow() {
    if (variant === 'fullscreen') return {};
    return SHADOWS.modal;
  }
  
  function getVariantSpecificStyles() {
    switch (variant) {
      case 'bottom':
        return {
          borderTopLeftRadius: BORDER_RADIUS.modal,
          borderTopRightRadius: BORDER_RADIUS.modal,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        };
      case 'top':
        return {
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: BORDER_RADIUS.modal,
          borderBottomRightRadius: BORDER_RADIUS.modal,
        };
      default:
        return {};
    }
  }
  
  // Render functions
  const renderHeader = () => {
    if (!header && !title && !showCloseButton) return null;
    
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.light,
      }}>
        <View style={{ flex: 1 }}>
          {header ? header : (
            <>
              {title && (
                <Text style={{
                  ...TYPOGRAPHY.h4,
                  marginBottom: subtitle ? SPACING.xs : 0,
                }}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={{
                  ...TYPOGRAPHY.bodySmall,
                  color: COLORS.text.secondary,
                }}>
                  {subtitle}
                </Text>
              )}
            </>
          )}
        </View>
        
        {showCloseButton && (
          <TouchableOpacity
            onPress={handleClose}
            style={{
              padding: SPACING.sm,
              marginLeft: SPACING.sm,
              borderRadius: BORDER_RADIUS.button,
            }}
            accessibilityLabel="Close modal"
            accessibilityRole="button"
          >
            <Text style={{
              fontSize: 20,
              color: COLORS.text.tertiary,
            }}>
              ×
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  const renderContent = () => (
    <View style={contentStyleComputed}>
      {children}
    </View>
  );
  
  const renderFooter = () => {
    if (!footer) return null;
    
    return (
      <View style={{
        padding: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.light,
      }}>
        {footer}
      </View>
    );
  };
  
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={statusBarTranslucent}
      accessibilityViewIsModal={accessibilityViewIsModal}
      onRequestClose={handleClose}
      testID={testID}
    >
      <View style={{ flex: 1 }}>
        <StatusBar
          backgroundColor="transparent"
          barStyle="light-content"
          translucent={statusBarTranslucent}
        />
        
        {/* Backdrop */}
        {backdrop && (
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <AnimatedView style={[backdropStyleComputed, backdropAnimatedStyle]} />
          </TouchableWithoutFeedback>
        )}
        
        {/* Modal Container */}
        <View style={containerStyleComputed} pointerEvents="box-none">
          <AnimatedView
            ref={modalRef}
            style={[modalStyleComputed, modalAnimatedStyle]}
            accessibilityLabel={accessibilityLabel || title}
          >
            {renderHeader()}
            {renderContent()}
            {renderFooter()}
          </AnimatedView>
        </View>
      </View>
    </RNModal>
  );
};

// Specialized modal components
export const ConfirmModal = ({
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  dangerous = false,
  ...props
}) => {
  return (
    <Modal
      variant="center"
      title={title}
      footer={
        <View style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: SPACING.sm,
        }}>
          <TouchableOpacity
            onPress={onCancel}
            style={{
              paddingHorizontal: SPACING.lg,
              paddingVertical: SPACING.md,
              borderRadius: BORDER_RADIUS.button,
            }}
          >
            <Text style={{
              ...TYPOGRAPHY.buttonMedium,
              color: COLORS.text.secondary,
            }}>
              {cancelText}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onConfirm}
            style={{
              paddingHorizontal: SPACING.lg,
              paddingVertical: SPACING.md,
              backgroundColor: dangerous ? COLORS.status.error.main : COLORS.primary.main,
              borderRadius: BORDER_RADIUS.button,
            }}
          >
            <Text style={{
              ...TYPOGRAPHY.buttonMedium,
              color: COLORS.text.inverse,
            }}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      }
      {...props}
    >
      {message && (
        <View style={{ padding: SPACING.lg }}>
          <Text style={TYPOGRAPHY.bodyMedium}>
            {message}
          </Text>
        </View>
      )}
    </Modal>
  );
};

export const BottomSheetModal = ({ children, ...props }) => {
  return (
    <Modal
      variant="bottom"
      animationType="slideUp"
      {...props}
    >
      <View style={{
        width: 50,
        height: 4,
        backgroundColor: COLORS.neutral.gray[300],
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: SPACING.sm,
        marginBottom: SPACING.md,
      }} />
      {children}
    </Modal>
  );
};

export default Modal;