import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SecurityService } from '@/services/SecurityService';
import { AlertCircle, MapPin, Camera } from 'lucide-react-native';

export default function SecurityLogs() {
  const [intruderAttempts, setIntruderAttempts] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'attempts' | 'events'>('attempts');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const [attempts, events] = await Promise.all([
        SecurityService.getIntruderAttempts(),
        SecurityService.getSecurityEvents(),
      ]);
      setIntruderAttempts(attempts);
      setSecurityEvents(events);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'unlock_success':
        return '#4CAF50';
      case 'unlock_fail':
        return '#FF9800';
      case 'alarm_triggered':
        return '#F44336';
      case 'lockout_started':
        return '#9C27B0';
      default:
        return '#2196F3';
    }
  };

  const renderIntruderAttempt = (attempt: any) => (
    <View key={attempt.id} style={styles.logCard}>
      <View style={styles.logHeader}>
        <AlertCircle size={24} color="#F44336" />
        <Text style={styles.logTitle}>Intruder Attempt</Text>
      </View>

      <View style={styles.logDetail}>
        <Text style={styles.logLabel}>Failed Attempts:</Text>
        <Text style={styles.logValue}>{attempt.attempt_count}</Text>
      </View>

      <View style={styles.logDetail}>
        <Text style={styles.logLabel}>Time:</Text>
        <Text style={styles.logValue}>{formatDate(attempt.timestamp)}</Text>
      </View>

      {attempt.location_address && (
        <View style={styles.logDetail}>
          <MapPin size={16} color="#666" />
          <Text style={styles.logValue}>{attempt.location_address}</Text>
        </View>
      )}

      {attempt.image_url && (
        <View style={styles.logDetail}>
          <Camera size={16} color="#666" />
          <Text style={styles.logValue}>Photo captured</Text>
        </View>
      )}

      {attempt.device_info && (
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceInfoText}>
            {attempt.device_info.brand} {attempt.device_info.model} - {attempt.device_info.osName} {attempt.device_info.osVersion}
          </Text>
        </View>
      )}
    </View>
  );

  const renderSecurityEvent = (event: any) => (
    <View key={event.id} style={styles.logCard}>
      <View style={styles.logHeader}>
        <View
          style={[
            styles.eventIndicator,
            { backgroundColor: getEventColor(event.event_type) },
          ]}
        />
        <Text style={styles.logTitle}>{event.event_type.replace(/_/g, ' ').toUpperCase()}</Text>
      </View>

      <View style={styles.logDetail}>
        <Text style={styles.logLabel}>Time:</Text>
        <Text style={styles.logValue}>{formatDate(event.timestamp)}</Text>
      </View>

      {event.details && Object.keys(event.details).length > 0 && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsLabel}>Details:</Text>
          {Object.entries(event.details).map(([key, value]) => (
            <Text key={key} style={styles.detailsText}>
              {key}: {String(value)}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Security Logs</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'attempts' && styles.tabActive]}
          onPress={() => setActiveTab('attempts')}
        >
          <Text style={[styles.tabText, activeTab === 'attempts' && styles.tabTextActive]}>
            Intruder Attempts ({intruderAttempts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.tabActive]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>
            Security Events ({securityEvents.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'attempts' ? (
          intruderAttempts.length > 0 ? (
            intruderAttempts.map(renderIntruderAttempt)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No intruder attempts recorded</Text>
            </View>
          )
        ) : (
          securityEvents.length > 0 ? (
            securityEvents.map(renderSecurityEvent)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No security events recorded</Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  logCard: {
    backgroundColor: '#FFF',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  logDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  logLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  logValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  deviceInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  deviceInfoText: {
    fontSize: 12,
    color: '#666',
  },
  eventIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  detailsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  detailsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
