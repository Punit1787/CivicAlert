// mobile/src/screens/ReportScreen.js
// Liquid Glass — frosted camera overlay, translucent panels, glow accents
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  ScrollView, useColorScheme, Platform, Image, Animated, Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { submitReport } from '../services/api';
import { Colors, Typography, Spacing, Glass } from '../theme';

const { width } = Dimensions.get('window');

const VIOLATION_TYPES = [
  { label: 'No Helmet', icon: 'bicycle' },
  { label: 'No Seatbelt', icon: 'car-sport' },
  { label: 'Signal Jump', icon: 'warning' },
  { label: 'Wrong Parking', icon: 'locate' },
  { label: 'Triple Riding', icon: 'people' },
  { label: 'Mobile While Driving', icon: 'phone-portrait' },
];

export default function ReportScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [violationType, setViolationType] = useState(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState('capture');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [step]);

  useEffect(() => {
    if (submitting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [submitting]);

  // Auto GPS
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    })();
  }, []);

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const pic = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      setPhoto(pic);
      fadeAnim.setValue(0);
      setStep('review');
    } catch {
      Alert.alert('Error', 'Failed to capture photo.');
    }
  };

  const retake = () => {
    setPhoto(null);
    setResult(null);
    fadeAnim.setValue(0);
    setStep('capture');
  };

  const handleSubmit = async () => {
    if (!photo) return Alert.alert('Error', 'Please capture a photo.');
    if (!violationType) return Alert.alert('Error', 'Select a violation type.');
    if (!consent) return Alert.alert('Consent Required', 'You must agree to the terms.');

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', { uri: photo.uri, type: 'image/jpeg', name: `report_${Date.now()}.jpg` });
      formData.append('violationType', violationType);
      formData.append('consent', 'true');
      if (location) {
        formData.append('lat', String(location.lat));
        formData.append('lng', String(location.lng));
      }
      const data = await submitReport(formData);
      setResult(data);
      fadeAnim.setValue(0);
      setStep('result');
    } catch (err) {
      Alert.alert('Submission Failed', err.response?.data?.error || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const newReport = () => {
    setPhoto(null);
    setResult(null);
    setViolationType(null);
    setConsent(false);
    fadeAnim.setValue(0);
    setStep('capture');
  };

  // ── Camera Permission ─────────────────────────────────────────────
  if (!permission) return <View style={[styles.center, { backgroundColor: C.background }]} />;
  if (!permission.granted) {
    return (
      <LinearGradient colors={[C.gradientStart, C.gradientEnd]} style={styles.center}>
        <BlurView intensity={isDark ? 35 : 60} tint={isDark ? 'dark' : 'light'} style={[styles.permCard, { borderColor: C.glassBorder }]}>
          <View style={[styles.permCardInner, { backgroundColor: C.glass }]}>
            <View style={[styles.permIconCircle, { backgroundColor: C.primaryGlow }]}>
              <Ionicons name="camera-outline" size={40} color={C.primary} />
            </View>
            <Text style={[Typography.h3, { color: C.text, marginTop: Spacing.lg, textAlign: 'center' }]}>
              Camera Access Required
            </Text>
            <Text style={[Typography.body, { color: C.textSecondary, marginTop: Spacing.sm, textAlign: 'center', lineHeight: 22 }]}>
              Camera is needed to capture traffic violations. No gallery uploads allowed.
            </Text>
            <TouchableOpacity style={styles.permBtnWrap} onPress={requestPermission} activeOpacity={0.7}>
              <LinearGradient colors={['#0A6CFF', '#0052CC']} style={styles.permBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="camera" size={20} color="#FFF" />
                <Text style={[Typography.bodyBold, { color: '#FFF', marginLeft: 8 }]}>Grant Access</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </LinearGradient>
    );
  }

  // ── Result Screen ─────────────────────────────────────────────────
  if (step === 'result' && result) {
    const v = result.verification || {};
    const accepted = v.finalDecision === 'ACCEPTED';
    const rejected = v.finalDecision === 'REJECTED';
    const statusColor = accepted ? C.success : rejected ? C.danger : C.warning;
    const statusGlow = accepted ? C.successGlow : rejected ? C.dangerGlow : C.warningGlow;

    return (
      <LinearGradient colors={[C.gradientStart, C.gradientEnd]} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', width: '100%' }}>
            {/* Status Icon */}
            <View style={[styles.resultIconCircle, { backgroundColor: statusGlow, shadowColor: statusColor }]}>
              <Ionicons
                name={accepted ? 'checkmark-circle' : rejected ? 'close-circle' : 'alert-circle'}
                size={52}
                color={statusColor}
              />
            </View>
            <Text style={[Typography.h2, { color: C.text, textAlign: 'center', marginTop: Spacing.md }]}>
              {accepted ? 'Report Accepted' : rejected ? 'Report Rejected' : 'Under Review'}
            </Text>
            <Text style={[Typography.body, { color: C.textSecondary, textAlign: 'center', marginTop: Spacing.xs, paddingHorizontal: Spacing.md }]}>
              {result.message}
            </Text>

            {/* Metrics Glass Card */}
            <BlurView intensity={isDark ? 30 : 55} tint={isDark ? 'dark' : 'light'} style={[styles.metricsBlur, { borderColor: C.glassBorder }]}>
              <View style={[styles.metricsInner, { backgroundColor: C.glass }]}>
                <GlassMetric label="Fake Score" value={v.fakeScore?.toFixed(2)} warn={v.fakeScore > 0.5} C={C} />
                <View style={[styles.metricDivider, { backgroundColor: C.divider }]} />
                <GlassMetric label="Vehicle" value={v.vehicleDetected ? '✓ Detected' : '✗ None'} warn={!v.vehicleDetected} C={C} />
                <View style={[styles.metricDivider, { backgroundColor: C.divider }]} />
                <GlassMetric label="Plate" value={v.plateNumber || '–'} C={C} />
                <View style={[styles.metricDivider, { backgroundColor: C.divider }]} />
                <GlassMetric label="Valid Plate" value={v.plateValid ? '✓ Yes' : '✗ No'} warn={!v.plateValid} C={C} />
                <View style={[styles.metricDivider, { backgroundColor: C.divider }]} />
                <GlassMetric label="Violation Score" value={v.violationScore?.toFixed(2)} C={C} />
                <View style={[styles.metricDivider, { backgroundColor: C.divider }]} />
                <GlassMetric label="Decision" value={v.finalDecision} color={statusColor} C={C} />
              </View>
            </BlurView>

            {/* New Report Button */}
            <TouchableOpacity style={styles.newReportWrap} onPress={newReport} activeOpacity={0.7}>
              <LinearGradient colors={['#0A6CFF', '#0052CC']} style={styles.newReportGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                <Text style={[Typography.bodyBold, { color: '#FFF', marginLeft: 8 }]}>New Report</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── Camera Capture ────────────────────────────────────────────────
  if (step === 'capture') {
    return (
      <View style={styles.flex}>
        <CameraView ref={cameraRef} style={styles.flex} facing="back">
          {/* Top glass overlay with GPS */}
          <View style={styles.cameraTopOverlay}>
            <BlurView intensity={40} tint="dark" style={[styles.gpsBlur, { borderColor: 'rgba(255,255,255,0.12)' }]}>
              <View style={styles.gpsInner}>
                <View style={[styles.gpsDot, { backgroundColor: location ? '#00C896' : '#FFB020' }]} />
                <Text style={[Typography.caption, { color: '#FFFFFF', marginLeft: 8 }]}>
                  {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Acquiring GPS...'}
                </Text>
              </View>
            </BlurView>
          </View>

          {/* Viewfinder corners */}
          <View style={styles.viewfinder}>
            <View style={[styles.vfCorner, styles.vfTL]} />
            <View style={[styles.vfCorner, styles.vfTR]} />
            <View style={[styles.vfCorner, styles.vfBL]} />
            <View style={[styles.vfCorner, styles.vfBR]} />
          </View>

          {/* Bottom glass capture bar */}
          <View style={styles.captureBarWrap}>
            <BlurView intensity={50} tint="dark" style={[styles.captureBar, { borderColor: 'rgba(255,255,255,0.10)' }]}>
              <View style={styles.captureBarInner}>
                <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.7)' }]}>
                  Point at the violation
                </Text>
                <TouchableOpacity style={styles.captureBtn} onPress={takePhoto} activeOpacity={0.6}>
                  <View style={styles.captureBtnRing}>
                    <View style={styles.captureBtnInner} />
                  </View>
                </TouchableOpacity>
                <Text style={[Typography.small, { color: 'rgba(255,255,255,0.5)' }]}>
                  Camera only
                </Text>
              </View>
            </BlurView>
          </View>
        </CameraView>
      </View>
    );
  }

  // ── Review & Submit ───────────────────────────────────────────────
  return (
    <LinearGradient colors={[C.gradientStart, C.gradientEnd]} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.reviewContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Photo Preview Glass Card */}
          {photo && (
            <View style={[styles.previewCard, { shadowColor: C.glassShadow }]}>
              <Image source={{ uri: photo.uri }} style={styles.previewImage} resizeMode="cover" />
              {/* Retake overlay button */}
              <BlurView intensity={45} tint="dark" style={styles.retakeBlur}>
                <TouchableOpacity style={styles.retakeBtn} onPress={retake} activeOpacity={0.7}>
                  <Ionicons name="camera-reverse" size={18} color="#FFF" />
                  <Text style={[Typography.caption, { color: '#FFF', marginLeft: 6 }]}>Retake</Text>
                </TouchableOpacity>
              </BlurView>
            </View>
          )}

          {/* GPS Glass Badge */}
          <BlurView intensity={isDark ? 30 : 50} tint={isDark ? 'dark' : 'light'} style={[styles.locationBlur, { borderColor: C.glassBorder }]}>
            <View style={[styles.locationInner, { backgroundColor: C.glass }]}>
              <View style={[styles.gpsDot, { backgroundColor: location ? C.success : C.warning, marginRight: 10 }]} />
              <Ionicons name="location" size={16} color={location ? C.success : C.warning} />
              <Text style={[Typography.caption, { color: C.textSecondary, marginLeft: 8, flex: 1 }]}>
                {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Fetching location...'}
              </Text>
            </View>
          </BlurView>

          {/* Violation Type Selection */}
          <Text style={[Typography.small, { color: C.textMuted, marginTop: Spacing.xl, marginBottom: Spacing.sm, marginLeft: 4 }]}>
            SELECT VIOLATION TYPE
          </Text>
          <View style={styles.violationGrid}>
            {VIOLATION_TYPES.map((v) => {
              const isSelected = violationType === v.label;
              return (
                <TouchableOpacity
                  key={v.label}
                  activeOpacity={0.6}
                  onPress={() => setViolationType(v.label)}
                >
                  <BlurView
                    intensity={isDark ? 25 : 45}
                    tint={isDark ? 'dark' : 'light'}
                    style={[
                      styles.violationChipBlur,
                      { borderColor: isSelected ? C.primary : C.glassBorder },
                      isSelected && { shadowColor: C.primary, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
                    ]}
                  >
                    <View style={[
                      styles.violationChipInner,
                      { backgroundColor: isSelected ? C.primaryGlow : C.glass },
                    ]}>
                      <Ionicons name={v.icon} size={16} color={isSelected ? C.primary : C.textSecondary} />
                      <Text style={[Typography.caption, { color: isSelected ? C.primary : C.text, marginLeft: 8, fontWeight: isSelected ? '700' : '500' }]}>
                        {v.label}
                      </Text>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Consent */}
          <TouchableOpacity style={styles.consentRow} onPress={() => setConsent(!consent)} activeOpacity={0.7}>
            <View style={[
              styles.checkbox,
              {
                borderColor: consent ? C.primary : C.textMuted,
                backgroundColor: consent ? C.primary : 'transparent',
                shadowColor: consent ? C.primary : 'transparent',
                shadowOpacity: consent ? 0.45 : 0,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 0 },
              }
            ]}>
              {consent && <Ionicons name="checkmark" size={13} color="#FFF" />}
            </View>
            <Text style={[Typography.caption, { color: C.textSecondary, flex: 1, marginLeft: Spacing.sm, lineHeight: 18 }]}>
              I confirm this report is truthful and consent to AI verification and data storage.
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }], marginTop: Spacing.xl }}>
            <TouchableOpacity
              style={styles.submitWrap}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={submitting ? ['#4A5568', '#4A5568'] : ['#0A6CFF', '#0052CC']}
                style={[styles.submitGrad, submitting && { opacity: 0.7 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {submitting ? (
                  <>
                    <ActivityIndicator color="#FFF" size="small" />
                    <Text style={[Typography.bodyBold, { color: '#FFF', marginLeft: 10 }]}>Verifying with AI...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={20} color="#FFF" />
                    <Text style={[Typography.bodyBold, { color: '#FFF', marginLeft: 10 }]}>Submit & Verify</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

function GlassMetric({ label, value, warn, color, C }) {
  const textColor = color || (warn ? C.danger : C.text);
  return (
    <View style={styles.metricRow}>
      <Text style={[Typography.caption, { color: C.textMuted }]}>{label}</Text>
      <Text style={[Typography.mono, { color: textColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Permission
  permCard: { borderRadius: Glass.borderRadius, borderWidth: Glass.borderWidth, overflow: 'hidden', marginHorizontal: 32 },
  permCardInner: { padding: 32, alignItems: 'center' },
  permIconCircle: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  permBtnWrap: { marginTop: Spacing.xl, borderRadius: Glass.borderRadiusSm, overflow: 'hidden', width: '100%' },
  permBtnGrad: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: Glass.borderRadiusSm },
  // Camera
  cameraTopOverlay: {
    position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: Spacing.md, right: Spacing.md, zIndex: 10,
  },
  gpsBlur: { borderRadius: Glass.borderRadiusFull, borderWidth: 1, overflow: 'hidden', alignSelf: 'flex-start' },
  gpsInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8 },
  gpsDot: { width: 8, height: 8, borderRadius: 4 },
  viewfinder: {
    position: 'absolute', top: '22%', left: '10%', right: '10%', bottom: '30%',
  },
  vfCorner: { position: 'absolute', width: 28, height: 28, borderColor: 'rgba(255,255,255,0.6)' },
  vfTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  vfTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  vfBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  vfBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  captureBarWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  captureBar: { borderTopWidth: 1, overflow: 'hidden' },
  captureBarInner: { alignItems: 'center', paddingVertical: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  captureBtn: { marginVertical: 12 },
  captureBtnRing: {
    width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: 'rgba(255,255,255,0.8)',
    padding: 5, alignItems: 'center', justifyContent: 'center',
  },
  captureBtnInner: { flex: 1, width: '100%', borderRadius: 34, backgroundColor: '#FFFFFF' },
  // Review
  reviewContent: { padding: Spacing.lg, paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: Spacing.xxl },
  previewCard: {
    borderRadius: Glass.borderRadiusLg, overflow: 'hidden', shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  previewImage: { width: '100%', height: 260, borderRadius: Glass.borderRadiusLg },
  retakeBlur: {
    position: 'absolute', top: Spacing.sm, right: Spacing.sm,
    borderRadius: Glass.borderRadiusFull, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', overflow: 'hidden',
  },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7 },
  locationBlur: { borderRadius: Glass.borderRadiusSm, borderWidth: Glass.borderWidth, overflow: 'hidden', marginTop: Spacing.md },
  locationInner: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  violationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  violationChipBlur: { borderRadius: Glass.borderRadiusFull, borderWidth: Glass.borderWidth, overflow: 'hidden' },
  violationChipInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: Spacing.xl },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  submitWrap: { borderRadius: Glass.borderRadiusSm, overflow: 'hidden' },
  submitGrad: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: Glass.borderRadiusSm },
  // Result
  resultContent: { flexGrow: 1, padding: Spacing.lg, paddingTop: Platform.OS === 'ios' ? 80 : 60, alignItems: 'center' },
  resultIconCircle: {
    width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 4 }, elevation: 10,
  },
  metricsBlur: { borderRadius: Glass.borderRadius, borderWidth: Glass.borderWidth, overflow: 'hidden', marginTop: Spacing.xl, width: '100%' },
  metricsInner: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  metricDivider: { height: 1 },
  newReportWrap: { marginTop: Spacing.xl, borderRadius: Glass.borderRadiusSm, overflow: 'hidden', width: '100%' },
  newReportGrad: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: Glass.borderRadiusSm },
});
