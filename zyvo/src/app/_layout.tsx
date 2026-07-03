import React, { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  useWindowDimensions,
  LogBox,
} from 'react-native';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

SplashScreen.preventAutoHideAsync();
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

// Global style injection for Web to fix outline focus rings and Chrome autofill background issues
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(`
    input, textarea, select {
      outline: none !important;
      outline-style: none !important;
      box-shadow: none !important;
    }
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      transition: background-color 5000s ease-in-out 0s !important;
      -webkit-text-fill-color: #111827 !important;
      background-color: transparent !important;
    }
  `));
  document.head.appendChild(style);
}

// Simulated iPhone Wrapper for Web Desktop Viewports
function WebIphoneWrapper({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const showIphoneFrame = isWeb && width > 768; // Display only on desktop monitors

  let pathname = '';
  try {
    pathname = usePathname();
  } catch (e) {
    // Catch block in case router is not initialized yet
  }

  const isLightStatusBar = pathname === '/' || pathname === '/onboarding' || pathname.includes('onboarding');
  const barColor = isLightStatusBar ? '#FFFFFF' : '#0F172A';

  if (!showIphoneFrame) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return (
    <View style={styles.webContainer}>
      {/* Background Graphic Accents */}
      <View style={styles.bgGrid} />
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />

      {/* Mockup Canvas */}
      <View style={styles.deviceWrapper}>
        {/* iPhone Outer Bezel */}
        <View style={styles.iphoneBezel}>
          {/* Screen area */}
          <View style={styles.iphoneScreen}>
            <View style={styles.screenContent}>
              {children}
            </View>

            {/* Dynamic Island Notch */}
            <View style={styles.dynamicIsland}>
              <View style={styles.cameraLens} />
              <View style={styles.speakerGrille} />
            </View>

            {/* StatusBar Overlay */}
            <View style={styles.statusBarMock}>
              <Text style={[styles.statusBarTime, { color: barColor }]}>9:41</Text>
              <View style={styles.statusBarIcons}>
                <View style={styles.signalBarRow}>
                  <View style={[styles.signalBar, { height: 4, backgroundColor: barColor }]} />
                  <View style={[styles.signalBar, { height: 6, backgroundColor: barColor }]} />
                  <View style={[styles.signalBar, { height: 8, backgroundColor: barColor }]} />
                  <View style={[styles.signalBar, { height: 10, backgroundColor: barColor }]} />
                </View>
                <Text style={[styles.iconWifi, { color: barColor }]}>📶</Text>
                <View style={styles.batteryIcon}>
                  <View style={[styles.batteryBody, { borderColor: barColor }]} />
                  <View style={[styles.batteryCap, { backgroundColor: barColor }]} />
                </View>
              </View>
            </View>

            {/* Simulated bottom home swipe bar indicator */}
            <View style={styles.homeIndicator} />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-ExtraBold': Inter_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <WebIphoneWrapper>
      <View style={{ flex: 1, width: '100%' }}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="space/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="booking/index" options={{ headerShown: false }} />
            <Stack.Screen name="booking/seats" options={{ headerShown: false }} />
            <Stack.Screen name="booking/summary" options={{ headerShown: false }} />
            <Stack.Screen name="booking/payment" options={{ headerShown: false }} />
            <Stack.Screen name="favorites/index" options={{ headerShown: false }} />
            <Stack.Screen name="booking/success" options={{ headerShown: false }} />
            <Stack.Screen name="booking/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="booking/checkin" options={{ headerShown: false }} />
            <Stack.Screen name="session/active" options={{ headerShown: false }} />
            <Stack.Screen name="settings/index" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaProvider>
      </View>
    </WebIphoneWrapper>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  bgGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
  },
  bgBlob1: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    top: -200,
    left: -200,
  },
  bgBlob2: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    bottom: -150,
    right: -100,
  },
  deviceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  infoPanel: {
    marginRight: 60,
    maxWidth: 280,
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  infoTitle: {
    fontFamily: 'Inter-ExtraBold',
    fontSize: 36,
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  infoSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#60A5FA',
    marginTop: 4,
  },
  divider: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  bulletText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#94A3B8',
  },
  infoFootnote: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 32,
  },
  iphoneBezel: {
    width: 412,
    height: 864,
    borderRadius: 54,
    backgroundColor: '#1E293B',
    padding: 11,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.55,
    shadowRadius: 35,
    elevation: 20,
    borderWidth: 2,
    borderColor: '#334155',
  },
  iphoneScreen: {
    flex: 1,
    borderRadius: 43,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
  },
  screenContent: {
    flex: 1,
  },
  dynamicIsland: {
    position: 'absolute',
    top: 11,
    alignSelf: 'center',
    width: 110,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000000',
    zIndex: 99999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  cameraLens: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  speakerGrille: {
    width: 45,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#1E293B',
  },
  statusBarMock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 12,
    zIndex: 9999,
  },
  statusBarTime: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#0F172A',
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 6,
  },
  signalBar: {
    width: 2.5,
    backgroundColor: '#0F172A',
    marginHorizontal: 0.5,
    borderRadius: 0.5,
  },
  iconWifi: {
    fontSize: 10,
    color: '#0F172A',
    marginRight: 6,
    top: -1,
  },
  batteryIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBody: {
    width: 18,
    height: 9,
    borderRadius: 2.5,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: 'transparent',
  },
  batteryCap: {
    width: 1.5,
    height: 3,
    backgroundColor: '#0F172A',
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
    marginLeft: 1,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: 140,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#000000',
    zIndex: 99999,
    opacity: 0.8,
  },
});
