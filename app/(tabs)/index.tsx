import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { format } from 'date-fns';
import { Calendar, Plus, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Meeting = Database['public']['Tables']['meetings']['Row'];

export default function AttendanceScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMeetings();
  }, [selectedDate]);

  async function loadMeetings() {
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString())
        .order('date');

      if (error) throw error;
      setMeetings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <TouchableOpacity style={styles.dateButton}>
          <Calendar size={20} color="#6366f1" />
          <Text style={styles.dateText}>{format(selectedDate, 'MMMM d, yyyy')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addMeetingButton}
          onPress={() => router.push('/meetings/new')}>
          <Plus size={20} color="#ffffff" />
          <Text style={styles.buttonText}>Add New Meeting</Text>
        </TouchableOpacity>

        <View style={styles.meetingsContainer}>
          {meetings.map((meeting) => (
            <TouchableOpacity
              key={meeting.id}
              style={styles.meetingCard}
              onPress={() => router.push(`/meetings/${meeting.id}`)}>
              <View>
                <Text style={styles.meetingTitle}>{meeting.name}</Text>
                <Text style={styles.meetingTime}>
                  {format(new Date(meeting.date), 'h:mm a')}
                </Text>
                <View style={styles.meetingTypeTag}>
                  <Text style={styles.meetingTypeText}>
                    {meeting.type.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
                {meeting.special_note && (
                  <Text style={styles.specialNote}>{meeting.special_note}</Text>
                )}
              </View>
              <ChevronRight size={20} color="#6b7280" />
            </TouchableOpacity>
          ))}

          {!loading && meetings.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No meetings scheduled for this day</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
  },
  dateText: {
    marginLeft: 8,
    color: '#374151',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  addMeetingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  meetingsContainer: {
    gap: 16,
  },
  meetingCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  meetingTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  meetingTypeTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  meetingTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366f1',
  },
  specialNote: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});