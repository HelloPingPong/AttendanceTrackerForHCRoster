import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Trash2, Search } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Meeting = Database['public']['Tables']['meetings']['Row'];
type Member = Database['public']['Tables']['members']['Row'];
type Attendance = Database['public']['Tables']['attendance']['Row'];

export default function MeetingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMeetingAndMembers();
  }, [id]);

  async function loadMeetingAndMembers() {
    try {
      // Load meeting if not new
      if (id !== 'new') {
        const { data: meetingData, error: meetingError } = await supabase
          .from('meetings')
          .select('*')
          .eq('id', id)
          .single();

        if (meetingError) throw meetingError;
        setMeeting(meetingData);

        // Load attendance for this meeting
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*')
          .eq('meeting_id', id);

        if (attendanceError) throw attendanceError;
        const attendanceMap = attendanceData.reduce((acc, curr) => {
          acc[curr.member_id!] = curr.is_present;
          return acc;
        }, {} as Record<string, boolean>);
        setAttendance(attendanceMap);
      } else {
        setMeeting({
          id: '',
          name: '',
          description: '',
          date: new Date().toISOString(),
          type: 'homechurch',
          special_note: null,
          created_at: new Date().toISOString(),
        });
      }

      // Load all members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('name');

      if (membersError) throw membersError;
      setMembers(membersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meeting data');
    } finally {
      setLoading(false);
    }
  }

  async function saveMeeting() {
    if (!meeting) return;
    setSaving(true);
    setError(null);

    try {
      let meetingId = id;

      if (id === 'new') {
        const { data, error } = await supabase
          .from('meetings')
          .insert([{
            name: meeting.name,
            description: meeting.description,
            date: meeting.date,
            type: meeting.type,
            special_note: meeting.special_note,
          }])
          .select()
          .single();

        if (error) throw error;
        meetingId = data.id;
      } else {
        const { error } = await supabase
          .from('meetings')
          .update({
            name: meeting.name,
            description: meeting.description,
            date: meeting.date,
            type: meeting.type,
            special_note: meeting.special_note,
          })
          .eq('id', id);

        if (error) throw error;
      }

      // Save attendance
      const attendancePromises = Object.entries(attendance).map(([memberId, isPresent]) => {
        return supabase
          .from('attendance')
          .upsert([{
            meeting_id: meetingId,
            member_id: memberId,
            is_present: isPresent,
            date: meeting.date,
          }], {
            onConflict: 'meeting_id,member_id',
          });
      });

      await Promise.all(attendancePromises);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save meeting');
    } finally {
      setSaving(false);
    }
  }

  async function deleteMeeting() {
    if (!meeting || id === 'new') return;
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);
      if (error) throw error;
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete meeting');
    } finally {
      setSaving(false);
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!meeting) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Meeting not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
          headerTitle: id === 'new' ? 'New Meeting' : 'Edit Meeting',
          headerRight: () => (
            <View style={styles.headerButtons}>
              {id !== 'new' && (
                <TouchableOpacity 
                  onPress={deleteMeeting}
                  style={[styles.headerButton, styles.deleteButton]}>
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={saveMeeting}
                style={[styles.headerButton, styles.saveButton]}>
                <Save size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.content}>
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Meeting Name</Text>
          <TextInput
            style={styles.input}
            value={meeting.name}
            onChangeText={(text) => setMeeting({ ...meeting, name: text })}
            placeholder="Enter meeting name"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={meeting.description}
            onChangeText={(text) => setMeeting({ ...meeting, description: text })}
            placeholder="Enter meeting description"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date & Time</Text>
          <DateTimePicker
            value={new Date(meeting.date)}
            mode="datetime"
            onChange={(event, date) => {
              if (date) {
                setMeeting({ ...meeting, date: date.toISOString() });
              }
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Meeting Type</Text>
          <View style={styles.typeButtons}>
            {(['homechurch', 'central_teaching', 'prayer_group', 'mens_cell', 'womens_cell', 'special'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  meeting.type === type && styles.typeButtonActive
                ]}
                onPress={() => setMeeting({ ...meeting, type })}>
                <Text style={[
                  styles.typeButtonText,
                  meeting.type === type && styles.typeButtonTextActive
                ]}>{type.replace('_', ' ').toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Special Note</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={meeting.special_note || ''}
            onChangeText={(text) => setMeeting({ ...meeting, special_note: text })}
            placeholder="Enter any special notes (optional)"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Attendance</Text>
          <View style={styles.searchContainer}>
            <Search size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search members..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.attendanceList}>
            {filteredMembers.map((member) => (
              <View key={member.id} style={styles.attendanceRow}>
                <View>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={styles.memberTags}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{member.category}</Text>
                    </View>
                  </View>
                </View>
                <Switch
                  value={attendance[member.id] || false}
                  onValueChange={(value) => {
                    setAttendance({
                      ...attendance,
                      [member.id]: value,
                    });
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  saveButton: {
    backgroundColor: '#6366f1',
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
  errorBannerText: {
    color: '#ef4444',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  typeButtonActive: {
    backgroundColor: '#6366f1',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  attendanceList: {
    gap: 12,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  memberTags: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366f1',
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});