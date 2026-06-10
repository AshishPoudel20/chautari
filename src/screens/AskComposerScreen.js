import React, { useMemo,  useState, useRef  } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Animated, Easing, Alert } from 'react-native';
import Avatar from '../components/Avatar';
import KeyboardScreen from '../components/KeyboardScreen';
import Button from '../components/Button';
import { Field, Input, CharCount } from '../components/ui';
import ExpertPostQuota from '../components/ExpertPostQuota';
import { useData, useSelectors } from '../data/store';
import { useNetwork } from '../data/network';
import { useNavigationGuard } from '../utils/navigation';
import CircleChip from '../components/CircleChip';
import { useTheme } from '../theme/ThemeContext';

const TITLE_MIN = 10, TITLE_MAX = 120, BODY_MIN = 30, BODY_MAX = 4000, MAX_PHOTOS = 5;

export default function AskComposerScreen({ navigation, route }) {
  const { colors, spacing, font, radius, shadow } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius, shadow), [colors, spacing, font, radius, shadow]);

  const { dispatch } = useData();
  const { me, canExpertPostToday, joinedCirclesList, state, circleById, isJoinedCircle } = useSelectors();
  const { online } = useNetwork();
  const { replace } = useNavigationGuard(navigation);
  const user = me();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [circleId, setCircleId] = useState(route.params?.circleId || null);
  const [circleQuery, setCircleQuery] = useState('');
  const [photos, setPhotos] = useState([]);
  const [anonymous, setAnonymous] = useState(false);
  const [touched, setTouched] = useState(false);

  // success overlay
  const [posting, setPosting] = useState(false);
  const success = useRef(new Animated.Value(0)).current;

  const titleOk = title.trim().length >= TITLE_MIN && title.trim().length <= TITLE_MAX;
  const bodyOk = body.trim().length >= BODY_MIN && body.trim().length <= BODY_MAX;
  const atDailyLimit = user?.verified && !canExpertPostToday();
  const valid = titleOk && bodyOk && !!circleId && !atDailyLimit;
  const selectedCircle = circleById(circleId);

  const circleOptions = useMemo(() => {
    const joined = joinedCirclesList();
    const joinedIds = new Set(joined.map((c) => c.id));
    const rest = state.circles.filter((c) => !joinedIds.has(c.id));
    const q = circleQuery.trim().toLowerCase();
    const filter = (list) => (q ? list.filter((c) => c.name.toLowerCase().includes(q)) : list);
    return [...filter(joined), ...filter(rest)];
  }, [joinedCirclesList, state.circles, circleQuery]);

  const addPhoto = () => {
    if (photos.length >= MAX_PHOTOS) return;
    setPhotos((p) => [...p, { id: `ph_${Date.now()}` }]); // mocked local thumbnail
  };

  const submit = () => {
    setTouched(true);
    if (atDailyLimit) {
      Alert.alert(
        'Daily limit reached',
        'Verified experts can post up to 2 questions per day. Your limit resets tomorrow.',
      );
      return;
    }
    if (!valid || posting) return;
    if (!online) {
      Alert.alert('No connection', 'You’re offline. Reconnect to post your question — your draft stays here.');
      return;
    }
    const id = `q_${Date.now().toString(36)}`;
    // Optimistic: write to the store immediately, then play a brief confirmation
    // and drop the asker straight into the live thread.
    dispatch({ type: 'ASK_QUESTION', id, title, body, circleId, anonymous, photos });
    setPosting(true);
    Animated.timing(success, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    setTimeout(() => replace('QuestionDetail', { questionId: id, justPosted: true }), 850);
  };

  const previewName = anonymous ? 'Anonymous' : user?.name || 'You';
  const previewSuburb = anonymous ? null : user?.suburb;

  return (
    <View style={styles.wrap}>
    <KeyboardScreen
      safe={false}
      contentStyle={styles.body}
      footer={(
        <View style={styles.footer}>
          <Button
            title={atDailyLimit ? 'Daily limit reached' : 'Post question'}
            icon="✍️"
            onPress={submit}
            disabled={atDailyLimit || (touched && !valid)}
          />
        </View>
      )}
    >
        <ExpertPostQuota variant="banner" />

        <Field
          label="Your question"
          error={touched && !titleOk ? `Keep the title between ${TITLE_MIN} and ${TITLE_MAX} characters.` : null}
        >
          <Input placeholder="e.g. Can I apply for a 485 visa before my results are out?" value={title} onChangeText={setTitle} maxLength={TITLE_MAX + 20} />
          <View style={styles.counterRow}><CharCount value={title} min={TITLE_MIN} max={TITLE_MAX} /></View>
        </Field>

        <Field
          label="Add details"
          error={touched && !bodyOk ? `Add a bit more context (at least ${BODY_MIN} characters).` : null}
        >
          <Input placeholder="Share the context so people can give you a genuinely useful answer…" value={body} onChangeText={setBody} maxLength={BODY_MAX + 50} multiline />
          <View style={styles.counterRow}><CharCount value={body} min={BODY_MIN} max={BODY_MAX} /></View>
        </Field>

        <Field label="Circle" error={touched && !circleId ? 'Pick a circle for your question.' : null}>
          <Input
            placeholder="Search circles…"
            value={circleQuery}
            onChangeText={setCircleQuery}
            style={{ marginBottom: spacing.sm }}
          />
          <View style={styles.chips}>
            {circleOptions.map((c) => (
              <Pressable key={c.id} onPress={() => setCircleId(c.id)} style={{ marginBottom: spacing.sm }}>
                <CircleChip
                  circle={c}
                  compact
                  showOfficial
                  onPress={() => setCircleId(c.id)}
                />
                {circleId === c.id ? <Text style={styles.selectedMark}>✓ selected</Text> : null}
                {!isJoinedCircle(c.id) ? (
                  <Text style={styles.joinHint}>Not joined — you can still post here</Text>
                ) : null}
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label={`Photos · optional · up to ${MAX_PHOTOS}`}>
          <View style={styles.photoRow}>
            {photos.map((p) => (
              <Pressable key={p.id} style={styles.photoTile} onPress={() => setPhotos((arr) => arr.filter((x) => x.id !== p.id))}>
                <Text style={styles.photoEmoji}>🖼</Text>
                <View style={styles.photoRemove}><Text style={styles.photoRemoveText}>✕</Text></View>
              </Pressable>
            ))}
            {photos.length < MAX_PHOTOS && (
              <Pressable style={[styles.photoTile, styles.photoAdd]} onPress={addPhoto}>
                <Text style={styles.photoAddText}>＋</Text>
              </Pressable>
            )}
          </View>
        </Field>

        {/* Safe, reassuring anonymous toggle with a live preview */}
        <View style={styles.anonCard}>
          <View style={styles.anonHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.anonTitle}>Ask anonymously</Text>
              <Text style={styles.anonSub}>Your name, photo and suburb stay hidden on this question.</Text>
            </View>
            <Switch
              value={anonymous}
              onValueChange={setAnonymous}
              trackColor={{ true: colors.primary, false: colors.borderStrong }}
              thumbColor={colors.onPrimary}
            />
          </View>

          <View style={styles.previewLabelRow}>
            <Text style={styles.previewLabel}>HOW IT WILL APPEAR</Text>
          </View>
          <View style={styles.previewRow}>
            <Avatar name={previewName} anon={anonymous} size={34} />
            <View style={{ marginLeft: spacing.sm }}>
              <Text style={styles.previewName}>{previewName}</Text>
              <Text style={styles.previewMeta}>
                {previewSuburb ? `${previewSuburb} · ` : ''}just now{selectedCircle ? ` · ${selectedCircle.name}` : ''}
              </Text>
            </View>
          </View>
        </View>
    </KeyboardScreen>

      {posting && (
        <View style={styles.overlay} pointerEvents="none">
          <Animated.View style={[styles.successCard, { opacity: success, transform: [{ scale: success.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
            <Text style={styles.successCheck}>✓</Text>
            <Text style={styles.successText}>Posted — it's live!</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  counterRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 },
  chips: { gap: spacing.xs },
  selectedMark: { fontSize: font.tiny, color: colors.primary, fontWeight: '800', marginTop: 4, marginLeft: 4 },
  joinHint: { fontSize: font.tiny, color: colors.textFaint, marginTop: 2, marginLeft: 4 },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoTile: { width: 68, height: 68, borderRadius: radius.md, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  photoEmoji: { fontSize: 26 },
  photoRemove: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  photoRemoveText: { color: colors.onPrimary, fontWeight: '900', fontSize: 11 },
  photoAdd: { borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', backgroundColor: 'transparent' },
  photoAddText: { fontSize: 28, color: colors.primary },

  anonCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  anonHeader: { flexDirection: 'row', alignItems: 'center' },
  anonTitle: { fontWeight: '800', color: colors.text, fontSize: font.bodyLg },
  anonSub: { color: colors.textMuted, fontSize: font.caption, marginTop: 3, lineHeight: 18, paddingRight: spacing.md },
  previewLabelRow: { marginTop: spacing.lg, marginBottom: spacing.sm },
  previewLabel: { fontSize: font.tiny, fontWeight: '800', color: colors.textFaint, letterSpacing: 0.8 },
  previewRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgSunken, borderRadius: radius.md, padding: spacing.md },
  previewName: { fontWeight: '800', color: colors.text, fontSize: font.caption },
  previewMeta: { color: colors.textMuted, fontSize: font.tiny, marginTop: 2 },

  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },

  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.overlay },
  successCard: { backgroundColor: colors.surface, borderRadius: radius.xl, paddingVertical: spacing.xl, paddingHorizontal: 40, alignItems: 'center', ...shadow.raised },
  successCheck: { fontSize: 44, color: colors.success, fontWeight: '900', marginBottom: spacing.sm },
  successText: { fontSize: font.subtitle, fontWeight: '800', color: colors.text },
});
