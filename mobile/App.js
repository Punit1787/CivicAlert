// mobile/App.js
// Liquid Glass Navigation Shell
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, useColorScheme, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import ReportScreen from './src/screens/ReportScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { Colors, Typography } from './src/theme';

const Tab = createBottomTabNavigator();

// Frosted glass tab bar
function GlassTabBar(props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return (
    <BlurView
      intensity={isDark ? 40 : 65}
      tint={isDark ? 'dark' : 'light'}
      style={styles.tabBarBlur}
    >
      <View style={[styles.tabBarInner, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)' }]}>
        {props.state.routes.map((route, index) => {
          const { options } = props.descriptors[route.key];
          const isFocused = props.state.index === index;
          const C = Colors[isDark ? 'dark' : 'light'];
          const color = isFocused ? C.primary : C.textMuted;

          const icons = {
            Report: isFocused ? 'camera' : 'camera-outline',
            Dashboard: isFocused ? 'grid' : 'grid-outline',
          };

          return (
            <View key={route.key} style={styles.tabItem}>
              <View
                style={[
                  styles.tabIndicator,
                  isFocused && {
                    backgroundColor: C.primaryGlow,
                    shadowColor: C.primary,
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 0 },
                  },
                ]}
              >
                <Ionicons
                  name={icons[route.name] || 'ellipse'}
                  size={22}
                  color={color}
                  onPress={() => {
                    const event = props.navigation.emit({ type: 'tabPress', target: route.key });
                    if (!isFocused && !event.defaultPrevented) {
                      props.navigation.navigate(route.name);
                    }
                  }}
                />
              </View>
              <Text style={[styles.tabLabel, { color, fontWeight: isFocused ? '700' : '500' }]}>
                {route.name}
              </Text>
            </View>
          );
        })}
      </View>
    </BlurView>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const scheme = useColorScheme();
  const C = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  if (loading) {
    return (
      <LinearGradient colors={[C.gradientStart, C.gradientEnd]} style={styles.loadingContainer}>
        <View style={[styles.loadingDot, { backgroundColor: C.primaryGlow }]}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
        <Text style={[Typography.body, { color: C.textSecondary, marginTop: 16 }]}>Loading CivicAlert...</Text>
      </LinearGradient>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const scheme = useColorScheme();
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 1,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  tabIndicator: {
    width: 44,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    letterSpacing: 0.3,
  },
});
