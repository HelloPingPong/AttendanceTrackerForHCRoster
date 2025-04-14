import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Member = Database['public']['Tables']['members']['Row'];

export default function MemberDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMember();
  }, [id]);

  async function loadMember() {
    if (id === 'new') {
      setMember({
        id: '',
        name: '',
        category: 'FT',
        sub_categories: {
          gender: 'male',
          isBeliever: false,
          isDisciple: false,
          inMinistryHouse: false,
          isPrimaryLeader: false,
          isSecondaryLeader: false,
          isMarried: false
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setMember(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load member');
    } finally {
      setLoading(false);
    }
  }

  async function saveMember() {
    if (!member) return;
    setSaving(true);
    setError(null);

    try {
      if (id === 'new') {
        const { error } = await supabase
          .from('members')
          .insert([{
            name: member.name,
            category: member.category,
            sub_categories: member.sub_categories
          }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('members')
          .update({
            name: member.name,
            category: member.category,
            sub_categories: member.sub_categories,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        if (error) throw error;
      }
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save member');
    } finally {
      setSaving(false);
    }
  }

  async function deleteMember() {
    if (!member || id === 'new') return;
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);
      if (error) throw error;
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete member');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Member not found</Text>
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
          headerTitle: id === 'new' ? 'New Member' : 'Edit Member',
          headerRight: () => (
            <View style={styles.headerButtons}>
              {id !== 'new' && (
                <TouchableOpacity 
                  onPress={deleteMember}
                  style={[styles.headerButton, styles.deleteButton]}>
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={saveMember}
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
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={member.name}
            onChangeText={(text) => setMember({ ...member, name: text })}
            placeholder="Enter member name"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryButtons}>
            {(['OM', 'FT', 'RN', 'XT', 'V'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  member.category === cat && styles.categoryButtonActive
                ]}
                onPress={() => setMember({ ...member, category: cat })}>
                <Text style={[
                  styles.categoryButtonText,
                  member.category === cat && styles.categoryButtonTextActive
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Sub Categories</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Gender</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  member.sub_categories.gender === 'male' && styles.genderButtonActive
                ]}
                onPress={() => setMember({
                  ...member,
                  sub_categories: { ...member.sub_categories, gender: 'male' }
                })}>
                <Text style={[
                  styles.genderButtonText,
                  member.sub_categories.gender === 'male' && styles.genderButtonTextActive
                ]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  member.sub_categories.gender === 'female' && styles.genderButtonActive
                ]}
                onPress={() => setMember({
                  ...member,
                  sub_categories: { ...member.sub_categories, gender: 'female' }
                })}>
                <Text style={[
                  styles.genderButtonText,
                  member.sub_categories.gender === 'female' && styles.genderButtonTextActive
                ]}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Believer</Text>
            <Switch
              value={member.sub_categories.isBeliever}
              onValueChange={(value) => setMember({
                ...member,
                sub_categories: { ...member.sub_categories, isBeliever: value }
              })}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Disciple</Text>
            <Switch
              value={member.sub_categories.isDisciple}
              onValueChange={(value) => setMember({
                ...member,
                sub_categories: { ...member.sub_categories, isDisciple: value }
              })}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>In Ministry House</Text>
            <Switch
              value={member.sub_categories.inMinistryHouse}
              onValueChange={(value) => setMember({
                ...member,
                sub_categories: { ...member.sub_categories, inMinistryHouse: value }
              })}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Primary Leader</Text>
            <Switch
              value={member.sub_categories.isPrimaryLeader}
              onValueChange={(value) => setMember({
                ...member,
                sub_categories: { ...member.sub_categories, isPrimaryLeader: value }
              })}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Secondary Leader</Text>
            <Switch
              value={member.sub_categories.isSecondaryLeader}
              onValueChange={(value) => setMember({
                ...member,
                sub_categories: { ...member.sub_categories, isSecondaryLeader: value }
              })}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Married</Text>
            <Switch
              value={member.sub_categories.isMarried}
              onValueChange={(value) => setMember({
                ...member,
                sub_categories: { ...member.sub_categories, isMarried: value }
              })}
            />
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
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  categoryButtonActive: {
    backgroundColor: '#6366f1',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  genderButtonActive: {
    backgroundColor: '#6366f1',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  genderButtonTextActive: {
    color: '#ffffff',
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});