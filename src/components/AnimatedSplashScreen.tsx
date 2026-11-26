import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

interface AnimatedSplashScreenProps {
  isAppReady: boolean;
  onAnimationComplete: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ICON_SIZE = Math.min(SCREEN_WIDTH * 0.48, 210);

export function AnimatedSplashScreen({
  isAppReady,
  onAnimationComplete,
}: AnimatedSplashScreenProps) {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.35)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;

  // State to track whether initial entrance has completed and min duration elapsed
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const exitStartedRef = useRef(false);
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // 1. On mount: dismiss static native splash and trigger entrance "Zoom In -> Settle" animation
  useEffect(() => {
    // Hide native OS splash screen immediately to show our animated splash seamlessly
    SplashScreen.hideAsync().catch(() => {});

    // Entrance sequence: Fade in & Zoom In (scale 0.35 -> 1.15) then Settle (scale 1.15 -> 1.0)
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.sequence([
        // Phase 1: Zoom In
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Phase 2: Settle (Zoom Out to 1.0)
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 360,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Phase 3: Start subtle breathing loop while waiting for app readiness
      if (!exitStartedRef.current) {
        pulseLoopRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.04,
              duration: 800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1.0,
              duration: 800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        pulseLoopRef.current.start();
      }
    });

    // Looping animation for loading dots
    const dotsLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotsAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dotsAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    dotsLoop.start();

    // Minimum display duration (1250ms) so user can enjoy the smooth entrance
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1250);

    return () => {
      clearTimeout(minTimer);
      if (pulseLoopRef.current) {
        pulseLoopRef.current.stop();
      }
      dotsLoop.stop();
    };
  }, []);

  // 2. When BOTH app is ready (auth/storage initialized) AND minimum time has elapsed, trigger Exit
  useEffect(() => {
    if (isAppReady && minTimeElapsed && !exitStartedRef.current) {
      exitStartedRef.current = true;

      if (pulseLoopRef.current) {
        pulseLoopRef.current.stop();
      }

      // Exit sequence: Zoom Out (scale 1.0 -> 0.72) and Dissolve (opacity 1 -> 0)
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.72,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onAnimationComplete();
      });
    }
  }, [isAppReady, minTimeElapsed, onAnimationComplete]);

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        styles.container,
        {
          opacity: containerOpacity,
        },
      ]}
    >
      {/* Background Decorative Glow Rings */}
      <Animated.View
        style={[
          styles.glowOuter,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.glowInner,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Main Animated App Icon */}
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
        }}
      >
        <Animated.View
          style={[
            styles.iconCard,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Image
            source={require('../../assets/images/app_icon.png')}
            style={styles.iconImage}
            resizeMode="cover"
          />
        </Animated.View>
      </Animated.View>

      {/* Footer Branding & Loading Indicator */}
      <Animated.View style={[styles.footer, { opacity: opacityAnim }]}>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dotsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.35, 1],
                }),
                transform: [
                  {
                    scale: dotsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dotsAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.6, 1, 0.6],
                }),
                transform: [
                  {
                    scale: dotsAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.25, 1],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dotsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.35],
                }),
                transform: [
                  {
                    scale: dotsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1.2, 0.8],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>

        <Text style={styles.brandTitle}>ONEMODO PATRONS</Text>
        <Text style={styles.brandSubtitle}>EXECUTIVE PORTAL</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#9C040B', // Matches app_icon.png dominant rich crimson
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  glowOuter: {
    position: 'absolute',
    width: ICON_SIZE * 1.5,
    height: ICON_SIZE * 1.5,
    borderRadius: (ICON_SIZE * 1.5) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  glowInner: {
    position: 'absolute',
    width: ICON_SIZE * 1.25,
    height: ICON_SIZE * 1.25,
    borderRadius: (ICON_SIZE * 1.25) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconCard: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: Math.round(ICON_SIZE * 0.22),
    overflow: 'hidden',
    backgroundColor: '#9C040B',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
      },
    }),
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 3,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 2,
    marginTop: 4,
    textAlign: 'center',
  },
});
