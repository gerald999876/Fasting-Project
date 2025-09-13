import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, Trophy, Target, Flame, Calendar, Clock, TrendingUp, Star, Lock } from 'lucide-react-native';
import { storageService } from '@/utils/storage';
import { FastingSession } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { PremiumBadge } from '@/components/PremiumBadge';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'streak' | 'duration' | 'consistency' | 'milestone';
  isPremium?: boolean;
}

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [sessions, setSessions] = useState<FastingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [fastingSessions, settings] = await Promise.all([
        storageService.getFastingSessions(),
        storageService.getUserSettings()
      ]);
      
      setSessions(fastingSessions || []);
      setIsPremium(settings?.isPremium || false);
      calculateAchievements(fastingSessions || []);
    } catch (error) {
      console.error('Error loading achievements data:', error);
      setSessions([]);
      setIsPremium(false);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (error) {
      console.error('Error refreshing achievements data:', error);
    } finally {
      setRefreshing(false);
    }
  };


  const calculateAchievements = (sessions: FastingSession[]) => {
    try {
      const completedSessions = sessions.filter(s => s.completed && s.duration);
      const currentStreak = calculateCurrentStreak(completedSessions);
      const longestStreak = calculateLongestStreak(completedSessions);
      const totalFasts = completedSessions.length;
      const totalHours = completedSessions.reduce((sum, s) => sum + ((s.duration || 0) / 60), 0);

      console.log('Achievements calculation:', {
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        currentStreak,
        longestStreak,
        totalFasts,
        totalHours
      });

    const achievementsList: Achievement[] = [
      // Streak Achievements
      {
        id: 'first_fast',
        title: 'First Steps',
        description: 'Complete your first fast',
        icon: Target,
        color: '#10B981',
        unlocked: totalFasts >= 1,
        progress: Math.min(totalFasts, 1),
        maxProgress: 1,
        category: 'milestone'
      },
      {
        id: 'streak_3',
        title: 'Getting Started',
        description: 'Maintain a 3-day streak',
        icon: Flame,
        color: '#F59E0B',
        unlocked: currentStreak >= 3,
        progress: Math.min(currentStreak, 3),
        maxProgress: 3,
        category: 'streak'
      },
      {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: Flame,
        color: '#EF4444',
        unlocked: currentStreak >= 7,
        progress: Math.min(currentStreak, 7),
        maxProgress: 7,
        category: 'streak'
      },
      {
        id: 'streak_30',
        title: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        icon: Trophy,
        color: '#8B5CF6',
        unlocked: currentStreak >= 30,
        progress: Math.min(currentStreak, 30),
        maxProgress: 30,
        category: 'streak',
        isPremium: true
      },
      // Duration Achievements
      {
        id: 'hours_24',
        title: 'Day One',
        description: 'Fast for 24 total hours',
        icon: Clock,
        color: '#10B981',
        unlocked: totalHours >= 24,
        progress: Math.min(totalHours, 24),
        maxProgress: 24,
        category: 'duration'
      },
      {
        id: 'hours_100',
        title: 'Century Club',
        description: 'Fast for 100 total hours',
        icon: Clock,
        color: '#06B6D4',
        unlocked: totalHours >= 100,
        progress: Math.min(totalHours, 100),
        maxProgress: 100,
        category: 'duration'
      },
      {
        id: 'hours_500',
        title: 'Time Master',
        description: 'Fast for 500 total hours',
        icon: Clock,
        color: '#3B82F6',
        unlocked: totalHours >= 500,
        progress: Math.min(totalHours, 500),
        maxProgress: 500,
        category: 'duration',
        isPremium: true
      },
      {
        id: 'hours_1000',
        title: 'Fasting Legend',
        description: 'Fast for 1000 total hours',
        icon: Trophy,
        color: '#8B5CF6',
        unlocked: totalHours >= 1000,
        progress: Math.min(totalHours, 1000),
        maxProgress: 1000,
        category: 'duration',
        isPremium: true
      },
      // Consistency Achievements
      {
        id: 'fasts_5',
        title: 'Getting the Hang of It',
        description: 'Complete 5 fasts',
        icon: Award,
        color: '#10B981',
        unlocked: totalFasts >= 5,
        progress: Math.min(totalFasts, 5),
        maxProgress: 5,
        category: 'consistency'
      },
      {
        id: 'fasts_10',
        title: 'Dedicated Faster',
        description: 'Complete 10 fasts',
        icon: Award,
        color: '#10B981',
        unlocked: totalFasts >= 10,
        progress: Math.min(totalFasts, 10),
        maxProgress: 10,
        category: 'consistency'
      },
      {
        id: 'fasts_25',
        title: 'Fasting Enthusiast',
        description: 'Complete 25 fasts',
        icon: Star,
        color: '#F59E0B',
        unlocked: totalFasts >= 25,
        progress: Math.min(totalFasts, 25),
        maxProgress: 25,
        category: 'consistency'
      },
      {
        id: 'fasts_50',
        title: 'Fasting Pro',
        description: 'Complete 50 fasts',
        icon: Star,
        color: '#F59E0B',
        unlocked: totalFasts >= 50,
        progress: Math.min(totalFasts, 50),
        maxProgress: 50,
        category: 'consistency',
        isPremium: true
      },
      {
        id: 'fasts_100',
        title: 'Fasting Legend',
        description: 'Complete 100 fasts',
        icon: Trophy,
        color: '#EF4444',
        unlocked: totalFasts >= 100,
        progress: Math.min(totalFasts, 100),
        maxProgress: 100,
        category: 'consistency',
        isPremium: true
      }
    ];

      setAchievements(achievementsList);
    } catch (error) {
      console.error('Error calculating achievements:', error);
      setAchievements([]);
    }
  };

  const calculateCurrentStreak = (sessions: FastingSession[]): number => {
    try {
      if (sessions.length === 0) return 0;
      
      // Get unique dates when fasting sessions occurred
      const fastingDates = new Set<string>();
      sessions.forEach(session => {
        if (session.startTime) {
          const date = new Date(session.startTime);
          if (!isNaN(date.getTime())) {
            date.setHours(0, 0, 0, 0);
            fastingDates.add(date.toDateString());
          }
        }
      });

      // Convert to sorted array of dates
      const sortedDates = Array.from(fastingDates)
        .map(dateStr => new Date(dateStr))
        .filter(date => !isNaN(date.getTime()))
        .sort((a, b) => b.getTime() - a.getTime()); // Most recent first

      if (sortedDates.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if we have a session today or yesterday to start the streak
      const hasToday = sortedDates.some(date => date.toDateString() === today.toDateString());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const hasYesterday = sortedDates.some(date => date.toDateString() === yesterday.toDateString());

      if (!hasToday && !hasYesterday) return 0;

      // Start counting from the most recent date
      let currentDate = hasToday ? today : yesterday;
      
      for (const fastingDate of sortedDates) {
        const dayDiff = Math.floor((currentDate.getTime() - fastingDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === streak) {
          streak++;
          currentDate = new Date(fastingDate);
        } else if (dayDiff > streak) {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating current streak:', error);
      return 0;
    }
  };

  const calculateLongestStreak = (sessions: FastingSession[]): number => {
    try {
      if (sessions.length === 0) return 0;
      
      // Get unique dates when fasting sessions occurred
      const fastingDates = new Set<string>();
      sessions.forEach(session => {
        if (session.startTime) {
          const date = new Date(session.startTime);
          if (!isNaN(date.getTime())) {
            date.setHours(0, 0, 0, 0);
            fastingDates.add(date.toDateString());
          }
        }
      });

      // Convert to sorted array of dates (oldest first)
      const sortedDates = Array.from(fastingDates)
        .map(dateStr => new Date(dateStr))
        .filter(date => !isNaN(date.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

      if (sortedDates.length === 0) return 0;

      let maxStreak = 1;
      let currentStreak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = sortedDates[i - 1];
        const currentDate = sortedDates[i];
        
        const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }

      return maxStreak;
    } catch (error) {
      console.error('Error calculating longest streak:', error);
      return 0;
    }
  };

  const categories = [
    { id: 'all', label: 'All', icon: Award },
    { id: 'streak', label: 'Streaks', icon: Flame },
    { id: 'duration', label: 'Duration', icon: Clock },
    { id: 'consistency', label: 'Consistency', icon: TrendingUp },
    { id: 'milestone', label: 'Milestones', icon: Target },
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Achievements</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {unlockedCount} of {totalCount} unlocked
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: colors.primary,
                  width: `${(unlockedCount / totalCount) * 100}%`
                }
              ]} 
            />
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <IconComponent 
                  size={16} 
                  color={isSelected ? '#FFFFFF' : colors.textSecondary} 
                />
                <Text style={[
                  styles.categoryText,
                  { color: isSelected ? '#FFFFFF' : colors.textSecondary }
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.achievementsGrid}>
          {filteredAchievements.length === 0 ? (
            <View style={styles.emptyState}>
              <Award size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                {selectedCategory === 'all' ? 'No achievements yet' : `No ${selectedCategory} achievements yet`}
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>
                Complete your first fast to start earning achievements!
              </Text>
            </View>
          ) : (
            filteredAchievements.map((achievement) => {
            const IconComponent = achievement.icon;
            const isLocked = !achievement.unlocked;
            const isPremiumLocked = achievement.isPremium && !isPremium;
            
            return (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  achievement.unlocked && { borderColor: achievement.color + '40' }
                ]}
              >
                {isPremiumLocked && (
                  <View style={styles.premiumOverlay}>
                    <Lock size={16} color={colors.textTertiary} />
                    <PremiumBadge size="small" />
                  </View>
                )}
                
                <View style={[
                  styles.achievementIcon,
                  { backgroundColor: achievement.color + '20' },
                  isLocked && { opacity: 0.5 }
                ]}>
                  <IconComponent 
                    size={24} 
                    color={isLocked ? colors.textTertiary : achievement.color} 
                  />
                </View>
                
                <Text style={[
                  styles.achievementTitle,
                  { color: isLocked ? colors.textTertiary : colors.text }
                ]}>
                  {achievement.title}
                </Text>
                
                <Text style={[
                  styles.achievementDescription,
                  { color: isLocked ? colors.textTertiary : colors.textSecondary }
                ]}>
                  {achievement.description}
                </Text>
                
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBarSmall, { backgroundColor: colors.border }]}>
                    <View 
                      style={[
                        styles.progressFillSmall,
                        { 
                          backgroundColor: isLocked ? colors.textTertiary : achievement.color,
                          width: `${(achievement.progress / achievement.maxProgress) * 100}%`
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[
                    styles.progressText,
                    { color: isLocked ? colors.textTertiary : colors.textSecondary }
                  ]}>
                    {Math.floor(achievement.progress)}/{achievement.maxProgress}
                  </Text>
                </View>
              </View>
            );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  achievementCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  premiumOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  progressBarSmall: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});