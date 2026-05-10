// mobile/src/screens/LoginScreen.js
// Liquid Glass — frosted panels, luminous accents, depth layering
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  TextInput, KeyboardAvoidingView, Platform, useColorScheme, Alert,
  ScrollView, Animated, Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, Typography, Spacing, Glass } from '../theme';

const { width, height } = Dimensions.get('window');

// Animated floating orb for background depth
function FloatingOrb({ color, size, x, y, delay }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 4000 + delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 4000 + delay, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.15, 1] });
  return (
    <Animated.View style={[
      styles.orb,
      { backgroundColor: color, width: size, height: size, borderRadius: size / 2, left: x, top: y,
        transform: [{ translateY }, { scale }] },
    ]} />
  );
}

export default function LoginScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const { signInWithGoogle, signInWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDevLogin, setShowDevLogin] = useState(false);

  // Fade in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGoogleSignIn = async () => {
    if (!consent) return Alert.alert('Consent Required', 'Please agree to the terms before proceeding.');
    setLoading(true);
    try {
      await signInWithGoogle('mock_dev_token');
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.error || 'Could not sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) return Alert.alert('Missing Fields', 'Enter email and password.');
    if (!consent) return Alert.alert('Consent Required', 'Please agree to the terms before proceeding.');
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.error || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      {/* Gradient backdrop */}
      <LinearGradient
        colors={isDark
          ? ['#0B1120', '#111D35', '#162544', '#0B1120']
          : ['#DFE7F2', '#C4D4EA', '#B8C9E2', '#DFE7F2']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating orbs for depth */}
      <FloatingOrb color={isDark ? 'rgba(77,154,255,0.12)' : 'rgba(10,108,255,0.10)'} size={200} x={-40} y={height * 0.08} delay={0} />
      <FloatingOrb color={isDark ? 'rgba(52,237,186,0.08)' : 'rgba(0,200,150,0.07)'} size={160} x={width * 0.55} y={height * 0.55} delay={1200} />
      <FloatingOrb color={isDark ? 'rgba(255,107,129,0.06)' : 'rgba(255,59,92,0.05)'} size={120} x={width * 0.7} y={height * 0.12} delay={600} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Logo + Title */}
            <View style={styles.header}>
              <View style={[styles.logoContainer, { shadowColor: C.primary }]}>
                <LinearGradient
                  colors={['#0A6CFF', '#0052CC']}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="shield-checkmark" size={34} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={[Typography.h1, { color: C.text, marginTop: Spacing.md }]}>
                CivicAlert
              </Text>
              <Text style={[Typography.body, { color: C.textSecondary, marginTop: Spacing.xs, textAlign: 'center' }]}>
                AI-Powered Traffic Violation Reporting
              </Text>
            </View>

            {/* Trust Badge — glass panel */}
            <BlurView intensity={isDark ? 30 : 50} tint={isDark ? 'dark' : 'light'} style={[styles.badgeBlur, { borderColor: C.glassBorder }]}>
              <View style={[styles.badgeInner, { backgroundColor: C.glassInner }]}>
                <Ionicons name="lock-closed" size={13} color={C.primary} />
                <Text style={[Typography.caption, { color: C.primary, marginLeft: 6 }]}>
                  Government Grade • End-to-End Encrypted
                </Text>
              </View>
            </BlurView>

            {/* ── Main Glass Card ──────────────────────────── */}
            <BlurView intensity={isDark ? 35 : 60} tint={isDark ? 'dark' : 'light'} style={[styles.glassCard, { borderColor: C.glassBorder }]}>
              <View style={[styles.glassCardInner, { backgroundColor: C.glass }]}>

                {/* Google Sign-In */}
                <TouchableOpacity
                  style={[styles.googleBtn, { backgroundColor: C.glassHighlight, borderColor: C.glassBorder }]}
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                  activeOpacity={0.6}
                >
                  {loading ? (
                    <ActivityIndicator color={C.primary} />
                  ) : (
                    <>
                      <View style={styles.googleIcon}>
                        <Ionicons name="logo-google" size={18} color="#4285F4" />
                      </View>
                      <Text style={[Typography.bodyBold, { color: C.text, marginLeft: Spacing.sm }]}>
                        Continue with Google
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: C.divider }]} />
                  <Text style={[styles.dividerText, { color: C.textMuted }]}>or</Text>
                  <View style={[styles.dividerLine, { backgroundColor: C.divider }]} />
                </View>

                {/* Dev login toggle */}
                <TouchableOpacity onPress={() => setShowDevLogin(!showDevLogin)} activeOpacity={0.7}>
                  <Text style={[Typography.caption, { color: C.primary, textAlign: 'center' }]}>
                    {showDevLogin ? 'Hide Developer Login' : 'Developer Login ↓'}
                  </Text>
                </TouchableOpacity>

                {showDevLogin && (
                  <View style={styles.devSection}>
                    <View style={[styles.inputContainer, { backgroundColor: C.glassInner, borderColor: C.borderSubtle }]}>
                      <Ionicons name="mail-outline" size={18} color={C.textMuted} style={{ marginRight: 10 }} />
                      <TextInput
                        style={[styles.input, { color: C.text }]}
                        placeholder="Email"
                        placeholderTextColor={C.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                    <View style={[styles.inputContainer, { backgroundColor: C.glassInner, borderColor: C.borderSubtle }]}>
                      <Ionicons name="lock-closed-outline" size={18} color={C.textMuted} style={{ marginRight: 10 }} />
                      <TextInput
                        style={[styles.input, { color: C.text }]}
                        placeholder="Password"
                        placeholderTextColor={C.textMuted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.devSubmitBtn}
                      onPress={handleEmailLogin}
                      disabled={loading}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={['#0A6CFF', '#0052CC']}
                        style={styles.devSubmitGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>Sign In</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <Text style={[Typography.caption, { color: C.textMuted, textAlign: 'center', marginTop: Spacing.sm }]}>
                      Demo: user@demo.com / demo123
                    </Text>
                  </View>
                )}
              </View>
            </BlurView>

            {/* Consent */}
            <TouchableOpacity style={styles.consentRow} onPress={() => setConsent(!consent)} activeOpacity={0.7}>
              <View style={[
                styles.checkbox,
                {
                  borderColor: consent ? C.primary : C.textMuted,
                  backgroundColor: consent ? C.primary : 'transparent',
                  shadowColor: consent ? C.primary : 'transparent',
                  shadowOpacity: consent ? 0.4 : 0,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 0 },
                }
              ]}>
                {consent && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
              </View>
              <Text style={[Typography.caption, { color: C.textSecondary, flex: 1, marginLeft: Spacing.sm, lineHeight: 18 }]}>
                I consent to submitting traffic violation reports and confirm all information provided is truthful per government guidelines.
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={[Typography.small, { color: C.textMuted, textAlign: 'center' }]}>
                Ministry of Road Transport & Highways
              </Text>
              <Text style={[Typography.caption, { color: C.textMuted, textAlign: 'center', marginTop: 4, opacity: 0.6 }]}>
                v1.0.0 • AI Verification System
              </Text>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  orb: {
    position: 'absolute',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoContainer: {
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBlur: {
    alignSelf: 'center',
    borderRadius: Glass.borderRadiusFull,
    borderWidth: Glass.borderWidth,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  badgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  glassCard: {
    borderRadius: Glass.borderRadius,
    borderWidth: Glass.borderWidth,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOpacity: 1,
    shadowRadius: Glass.shadowRadius,
    shadowOffset: Glass.shadowOffset,
    elevation: 8,
  },
  glassCardInner: {
    padding: Spacing.lg,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: Glass.borderRadiusSm,
    borderWidth: Glass.borderWidth,
  },
  googleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 14, fontSize: 13, fontWeight: '500' },
  devSection: { marginTop: Spacing.md },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: Glass.borderRadiusSm,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  devSubmitBtn: {
    marginTop: Spacing.xs,
    borderRadius: Glass.borderRadiusSm,
    overflow: 'hidden',
  },
  devSubmitGradient: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Glass.borderRadiusSm,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.xl,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
  },
});
