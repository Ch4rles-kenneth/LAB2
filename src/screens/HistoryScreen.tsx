import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

/**
 * HistoryScreen — Phase 8: Supabase History
 *
 * Loads past analysis records from the `analysis_history` Supabase table
 * on mount and on pull-to-refresh. Each row shows the scene context and
 * detected objects, plus a relative timestamp.
 */

interface HistoryItem {
  id: string;
  created_at: string;
  objects: string;
  context: string;
  recommendations: string;
}

export default function HistoryScreen() {
  const [records, setRecords] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (supabaseError) throw supabaseError;
      setRecords(data ?? []);
    } catch (err: any) {
      console.error('Failed to load history:', err);
      setError(err?.message || 'Could not load history. Check your Supabase credentials.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  // ── Helper: format ISO date to readable string ───────────────────────────
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorLabel}>Failed to Load</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis History</Text>
        <Text style={styles.headerCount}>{records.length} records</Text>
      </View>

      {records.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No History Yet</Text>
          <Text style={styles.emptySubtitle}>
            Capture a photo and analyze it to start building your history.
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366f1"
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Timestamp */}
              <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>

              {/* Context */}
              <Text style={styles.cardContext} numberOfLines={2}>
                {item.context || 'No scene context recorded.'}
              </Text>

              {/* Objects detected */}
              {item.objects ? (
                <View style={styles.objectsRow}>
                  {item.objects
                    .split(',')
                    .slice(0, 4)
                    .map((obj, i) => (
                      <View key={i} style={styles.objectChip}>
                        <Text style={styles.objectChipText}>{obj.trim()}</Text>
                      </View>
                    ))}
                </View>
              ) : null}

              {/* Recommendation */}
              {item.recommendations ? (
                <Text style={styles.cardRec} numberOfLines={2}>
                  💡 {item.recommendations}
                </Text>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: '#6366f1',
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
  },
  headerCount: {
    color: '#64748b',
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardDate: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  cardContext: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 10,
  },
  objectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  objectChip: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6366f1',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  objectChipText: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '600',
  },
  cardRec: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#090d16',
  },
  loadingText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '500',
  },
  errorLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorText: {
    color: '#cbd5e1',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
