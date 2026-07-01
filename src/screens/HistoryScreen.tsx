import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface HistoryItem {
  id: string;
  objects: string;
  context: string;
  created_at: string;
}

export default function HistoryScreen() {
  const [history] = useState<HistoryItem[]>([
    {
      id: '1',
      objects: 'Laptop, Coffee Cup',
      context: 'Desk setup at night',
      created_at: '2026-07-01T12:00:00Z',
    },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Analysis History</Text>
      
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemTitle}>{item.objects}</Text>
            <Text style={styles.itemSubtitle}>{item.context}</Text>
            <Text style={styles.itemTime}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No history records found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  itemTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
