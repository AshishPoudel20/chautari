import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useSelectors } from '../data/store';
import { useNavigationGuard } from '../utils/navigation';
import { CATEGORIES } from '../data/categories';
import { useTheme } from '../theme/ThemeContext';

// Grid of the 8 fixed categories with question counts.
export default function CategoriesScreen({ navigation }) {
  const { colors, spacing, font, radius, shadow } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius, shadow), [colors, spacing, font, radius, shadow]);

  const { categoryCounts } = useSelectors();
  const { navigate } = useNavigationGuard(navigation);
  const counts = categoryCounts();

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={CATEGORIES}
      keyExtractor={(c) => c.id}
      numColumns={2}
      columnWrapperStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
      contentContainerStyle={{ paddingVertical: spacing.lg, gap: spacing.md }}
      ListHeaderComponent={<Text style={styles.heading}>Browse by category</Text>}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.tile, pressed && { opacity: 0.85 }]}
          onPress={() => navigate('CategoryFeed', { categoryId: item.id })}
        >
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.count}>{counts[item.id] || 0} question{(counts[item.id] || 0) === 1 ? '' : 's'}</Text>
        </Pressable>
      )}
    />
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  heading: { fontSize: font.subtitle, fontWeight: '800', color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  tile: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, minHeight: 124, justifyContent: 'space-between', ...shadow.card },
  icon: { fontSize: 32 },
  name: { fontSize: font.body, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  count: { fontSize: font.tiny, color: colors.primary, marginTop: 2, fontWeight: '700' },
});
