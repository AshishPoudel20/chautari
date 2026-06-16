import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Button from '../components/Button';
import KeyboardScreen from '../components/KeyboardScreen';
import ExpertProfessionalFields from '../components/ExpertProfessionalFields';
import { useData, useSelectors } from '../data/store';
import { useTheme } from '../theme/ThemeContext';
import { hasExpertProfessionalProfile, validateExpertBadgeTitle } from '../utils/expertPost';

/** One-time setup for experts verified before badge title + circle were required. */
export default function ExpertProfessionalSetupScreen({ navigation }) {
  const { colors, spacing } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing), [colors, spacing]);
  const { dispatch } = useData();
  const { me, state } = useSelectors();
  const user = me();

  const [badgeTitle, setBadgeTitle] = useState(user?.expertBadgeTitle || user?.profession || '');
  const [circleId, setCircleId] = useState(user?.expertCircleId || user?.verifiedCategory || null);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const valid = !validateExpertBadgeTitle(badgeTitle) && !!circleId;

  useEffect(() => {
    if (user && hasExpertProfessionalProfile(user)) {
      navigation.goBack();
    }
  }, [user, navigation]);

  const save = async () => {
    setTouched(true);
    if (!valid || saving) return;
    setSaving(true);
    try {
      const res = await dispatch({
        type: 'SET_EXPERT_PROFESSIONAL_PROFILE',
        expertBadgeTitle: badgeTitle.trim(),
        expertCircleId: circleId,
      });
      if (res?.ok === false) throw res.error || new Error('Could not save');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e?.message || 'Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardScreen
      safe={false}
      contentStyle={styles.body}
      footer={(
        <View style={styles.footer}>
          <Button title={saving ? 'Saving…' : 'Save and continue'} onPress={save} disabled={!valid || saving} />
        </View>
      )}
      >
        <Text style={styles.lead}>
          Set your badge title and professional circle once — professional posts will route there automatically.
        </Text>
        <ExpertProfessionalFields
        badgeTitle={badgeTitle}
        onBadgeTitleChange={setBadgeTitle}
        circleId={circleId}
        onCircleIdChange={setCircleId}
        circles={state.circles}
        touched={touched}
      />
    </KeyboardScreen>
  );
}

const createStyles = (colors, spacing) => StyleSheet.create({
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  lead: { fontSize: 15, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.lg },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
