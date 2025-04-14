import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Search, UserPlus, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Member = Database['public']['Tables']['members']['Row'];

export default function RosterScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryCounts = members.reduce((acc, member) => {
    acc[member.category] = (acc[member.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Roster</Text>
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
      </View>

      <ScrollView style={styles.content}>
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addMemberButton}
          onPress={() => router.push('/roster/new')}>
          <UserPlus size={20} color="#ffffff" />
          <Text style={styles.buttonText}>Add New Member</Text>
        </TouchableOpacity>

        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoryGrid}>
            {(['OM', 'FT', 'RN', 'XT', 'V'] as const).map((category) => (
              <View key={category} style={styles.categoryCard}>
                <Text style={styles.categoryCode}>{category}</Text>
                <Text style={styles.categoryCount}>{categoryCounts[category] || 0}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.membersContainer}>
          <Text style={styles.sectionTitle}>Members</Text>
          {filteredMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={styles.memberRow}
              onPress={() => router.push(`/roster/${member.id}`)}>
              <View>
                <Text style={styles.memberName}>{member.name}</Text>
                <View style={styles.memberTags}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{member.category}</Text>
                  </View>
                  {member.sub_categories.isBeliever && (
                    <View style={[styles.categoryTag, styles.believerTag]}>
                      <Text style={styles.categoryTagText}>Believer</Text>
                    </View>
                  )}
                </View>
              </View>
              <ChevronRight size={20} color="#6b7280" />
            </TouchableOpacity>
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
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
  addMemberButton: {
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
  categoriesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    width: '30%',
    alignItems: 'center',
  },
  categoryCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  membersContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
  believerTag: {
    backgroundColor: '#dcfce7',
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366f1',
  },
});