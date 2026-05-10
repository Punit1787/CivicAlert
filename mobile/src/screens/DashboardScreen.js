// mobile/src/screens/DashboardScreen.js
// Liquid Glass — frosted stats cards, translucent report tiles, glow badges
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  useColorScheme, TouchableOpacity, Animated, Platform, Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getUserReports } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Colors, Typography, Spacing, Glass } from '../theme';

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
  Approved: { icon: 'checkmark-circle', key: 'success', label: 'Accepted' },
  Rejected: { icon: 'close-circle', key: 'danger', label: 'Rejected' },
  Pending: { icon: 'time', key: 'warning', label: 'Pending' },
};

export default function DashboardScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const { user, signOut } = useAuth();

  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const data = await getUserReports();
      setReports(data);
    } catch { /* silent */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);
  const onRefresh = () => { setRefreshing(true); fetchReports(); };

  const total = reports.length;
  const accepted = reports.filter(r => r.status === 'Approved').length;
  const rejected = reports.filter(r => r.status === 'Rejected').length;
  const pending = reports.filter(r => r.status === 'Pending').length;

  const renderReport = ({ item, index }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
    const statusColor = C[cfg.key];
    const statusGlow = C[cfg.key + 'Glow'];

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <BlurView
          intensity={isDark ? 25 : 50}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.cardBlur, { borderColor: C.glassBorder }]}
        >
          <View style={[styles.cardInner, { backgroundColor: C.glass }]}>
            {/* Header row */}
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <View style={[styles.typeBadge, { backgroundColor: C.primaryGlow }]}>
                  <Text style={[Typography.small, { color: C.primary }]}>{item.violationType}</Text>
                </View>
                <Text style={[Typography.h3, { color: C.text, marginTop: 6 }]}>
                  {item.detectedPlate || item.vehicleNumber || 'No Plate'}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusGlow, borderColor: statusColor + '30' }]}>
                <Ionicons name={cfg.icon} size={14} color={statusColor} />
                <Text style={[Typography.small, { color: statusColor, marginLeft: 4, fontSize: 10 }]}>
                  {cfg.label}
                </Text>
              </View>
            </View>

            {/* Score pills */}
            <View style={[styles.scoreRow, { borderTopColor: C.divider }]}>
              <ScorePill label="FAKE" value={item.fakeScore} warn={item.fakeScore > 0.5} C={C} isDark={isDark} />
              <ScorePill label="VIOLATION" value={item.violationScore} C={C} isDark={isDark} />
              <ScorePill label="PLATE" value={item.plateValid ? '✓' : '✗'} warn={!item.plateValid} C={C} isDark={isDark} />
              <ScorePill label="AI" value={item.aiVerified ? '✓' : '–'} C={C} isDark={isDark} />
            </View>

            {/* Timestamp */}
            <View style={styles.timestampRow}>
              <Ionicons name="time-outline" size={12} color={C.textMuted} />
              <Text style={[Typography.caption, { color: C.textMuted, marginLeft: 6, fontSize: 12 }]}>
                {new Date(item.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={[C.gradientStart, C.gradientEnd]} style={styles.flex}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={styles.headerWrap}>
        <BlurView intensity={isDark ? 30 : 55} tint={isDark ? 'dark' : 'light'} style={[styles.headerBlur, { borderColor: C.glassBorder }]}>
          <View style={[styles.headerInner, { backgroundColor: C.glass }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.avatarCircle, { backgroundColor: C.primaryGlow }]}>
                <Text style={[Typography.bodyBold, { color: C.primary }]}>
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[Typography.h3, { color: C.text }]}>{user?.name || 'User'}</Text>
                <View style={styles.pointsRow}>
                  <Ionicons name="star" size={13} color={C.warning} />
                  <Text style={[Typography.captionBold, { color: C.warning, marginLeft: 4 }]}>
                    {user?.points || 0} pts
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={signOut} activeOpacity={0.6} style={styles.logoutBtn}>
              <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={[styles.logoutBlur, { borderColor: C.glassBorder }]}>
                <Ionicons name="log-out-outline" size={20} color={C.textSecondary} />
              </BlurView>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      {/* ── Stats Row ───────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <GlassStatCard label="Total" value={total} color={C.primary} glow={C.primaryGlow} C={C} isDark={isDark} />
        <GlassStatCard label="Accepted" value={accepted} color={C.success} glow={C.successGlow} C={C} isDark={isDark} />
        <GlassStatCard label="Pending" value={pending} color={C.warning} glow={C.warningGlow} C={C} isDark={isDark} />
        <GlassStatCard label="Rejected" value={rejected} color={C.danger} glow={C.dangerGlow} C={C} isDark={isDark} />
      </View>

      {/* Section title */}
      <View style={styles.sectionHeader}>
        <Text style={[Typography.small, { color: C.textMuted }]}>RECENT REPORTS</Text>
        <Text style={[Typography.caption, { color: C.textMuted }]}>{total} total</Text>
      </View>

      {/* ── Report List ─────────────────────────────────────────── */}
      <FlatList
        data={reports}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderReport}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: C.primaryGlow }]}>
                <Ionicons name="document-text-outline" size={36} color={C.primary} />
              </View>
              <Text style={[Typography.body, { color: C.textMuted, marginTop: Spacing.md, textAlign: 'center' }]}>
                No reports yet.{'\n'}Start by capturing a violation.
              </Text>
            </View>
          )
        }
      />
    </LinearGradient>
  );
}

// ── Glass Stat Card ─────────────────────────────────────────────────
function GlassStatCard({ label, value, color, glow, C, isDark }) {
  return (
    <BlurView intensity={isDark ? 25 : 45} tint={isDark ? 'dark' : 'light'} style={[styles.statBlur, { borderColor: C.glassBorder }]}>
      <View style={[styles.statInner, { backgroundColor: C.glass }]}>
        <View style={[styles.statDot, { backgroundColor: color, shadowColor: color, shadowOpacity: 0.5, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }]} />
        <Text style={[Typography.h2, { color, marginTop: 4 }]}>{value}</Text>
        <Text style={[Typography.small, { color: C.textMuted, marginTop: 2, fontSize: 9 }]}>{label}</Text>
      </View>
    </BlurView>
  );
}

// ── Score Pill ───────────────────────────────────────────────────────
function ScorePill({ label, value, warn, C, isDark }) {
  const display = typeof value === 'number' ? value.toFixed(2) : (value || '–');
  return (
    <View style={styles.scorePill}>
      <Text style={[Typography.small, { color: C.textMuted, fontSize: 9 }]}>{label}</Text>
      <Text style={[Typography.mono, { color: warn ? C.danger : C.text, marginTop: 2, fontSize: 13 }]}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // Header
  headerWrap: { paddingHorizontal: Spacing.md, paddingTop: Platform.OS === 'ios' ? 56 : 40 },
  headerBlur: { borderRadius: Glass.borderRadius, borderWidth: Glass.borderWidth, overflow: 'hidden' },
  headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  pointsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  logoutBtn: {},
  logoutBlur: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', padding: 8 },
  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm },
  statBlur: { flex: 1, borderRadius: Glass.borderRadiusSm, borderWidth: Glass.borderWidth, overflow: 'hidden' },
  statInner: { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4 },
  statDot: { width: 6, height: 6, borderRadius: 3 },
  // Section
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm,
  },
  // List
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  cardBlur: { borderRadius: Glass.borderRadius, borderWidth: Glass.borderWidth, overflow: 'hidden', marginBottom: Spacing.sm },
  cardInner: { padding: Spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 3, borderRadius: Glass.borderRadiusFull },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Glass.borderRadiusFull, borderWidth: 1,
  },
  scoreRow: {
    flexDirection: 'row', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, gap: Spacing.sm,
  },
  scorePill: { flex: 1, alignItems: 'center' },
  timestampRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  // Empty
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
});
