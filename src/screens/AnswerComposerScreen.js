import React, { useMemo,  useState, useRef  } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import Avatar from '../components/Avatar';
import KeyboardScreen from '../components/KeyboardScreen';
import Button from '../components/Button';
import { Field, Input, CharCount } from '../components/ui';
import { useData, useSelectors } from '../data/store';
import { useNetwork } from '../data/network';
import { useToast } from '../components/Toast';
import { useTheme } from '../theme/ThemeContext';

const BODY_MIN = 20, BODY_MAX = 4000;

// Answer composer modal: body, link insert, safe anonymous toggle. No photos (per brief).
export default function AnswerComposerScreen({ navigation, route }) {
  const { colors, spacing, font, radius, shadow } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius, shadow), [colors, spacing, font, radius, shadow]);

  const { questionId } = route.params;
  const { dispatch } = useData();
  const { online } = useNetwork();
  const showToast = useToast();
  const { questionById, me } = useSelectors();
  const question = questionById(questionId);
  const user = me();
  const [body, setBody] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const selection = useRef({ start: 0, end: 0 });

  const len = body.trim().length;
  const valid = len >= BODY_MIN && len <= BODY_MAX;

  const insertLink = () => {
    const url = 'https://';
    const pos = selection.current.start;
    setBody((b) => b.slice(0, pos) + url + b.slice(pos));
  };

  const submit = () => {
    if (!valid) return;
    if (!online) {
      Alert.alert('No connection', 'You’re offline. Reconnect to post your answer — your draft stays here.');
      return;
    }
    dispatch({ type: 'ADD_ANSWER', questionId, body, anonymous });
    navigation.goBack();
    showToast('Answer posted', { tone: 'success' });
  };

  return (
    <KeyboardScreen
      safe={false}
      contentStyle={styles.body}
      footer={(
        <View style={styles.footer}>
          <Button title="Post answer" icon="✍️" onPress={submit} disabled={!valid} />
        </View>
      )}
    >
        {question && (
          <View style={styles.qContext}>
            <Text style={styles.qContextLabel}>ANSWERING</Text>
            <Text style={styles.qContextTitle} numberOfLines={2}>{question.title}</Text>
          </View>
        )}

        <View style={styles.toolbar}>
          <Pressable style={styles.toolBtn} onPress={insertLink}>
            <Text style={styles.toolBtnText}>🔗 Insert link</Text>
          </Pressable>
          <CharCount value={body} min={BODY_MIN} max={BODY_MAX} />
        </View>

        <Field error={len > 0 && !valid ? `Answers are ${BODY_MIN}–${BODY_MAX} characters.` : null}>
          <Input
            placeholder="Share what you know from experience. Be kind and specific — links are welcome."
            value={body}
            onChangeText={setBody}
            onSelectionChange={(e) => { selection.current = e.nativeEvent.selection; }}
            multiline
            autoFocus
            maxLength={BODY_MAX + 50}
            style={{ minHeight: 200 }}
          />
        </Field>

        <View style={styles.anonCard}>
          <View style={styles.anonHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.anonTitle}>Answer anonymously</Text>
              <Text style={styles.anonSub}>Your name, photo and suburb stay hidden on this answer.</Text>
            </View>
            <Switch value={anonymous} onValueChange={setAnonymous} trackColor={{ true: colors.primary, false: colors.borderStrong }} thumbColor={colors.onPrimary} />
          </View>
          <View style={styles.previewRow}>
            <Avatar name={anonymous ? 'Anonymous' : user?.name || 'You'} anon={anonymous} size={28} />
            <Text style={styles.previewName}>{anonymous ? 'Anonymous' : user?.name || 'You'}</Text>
            <Text style={styles.previewMeta}>· just now</Text>
          </View>
        </View>
    </KeyboardScreen>
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  qContext: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  qContextLabel: { fontSize: font.tiny, fontWeight: '800', color: colors.textFaint, letterSpacing: 0.8, marginBottom: 4 },
  qContextTitle: { fontSize: font.body, fontWeight: '700', color: colors.text, lineHeight: 21 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  toolBtn: { backgroundColor: colors.primaryTint, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
  toolBtnText: { color: colors.primary, fontWeight: '800', fontSize: font.caption },
  anonCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginTop: spacing.sm, ...shadow.card },
  anonHeader: { flexDirection: 'row', alignItems: 'center' },
  anonTitle: { fontWeight: '800', color: colors.text, fontSize: font.bodyLg },
  anonSub: { color: colors.textMuted, fontSize: font.caption, marginTop: 3, lineHeight: 18, paddingRight: spacing.md },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.lg, backgroundColor: colors.bgSunken, borderRadius: radius.md, padding: spacing.md },
  previewName: { fontWeight: '800', color: colors.text, fontSize: font.caption },
  previewMeta: { color: colors.textMuted, fontSize: font.tiny },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
