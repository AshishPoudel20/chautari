import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import KeyboardScreen from '../../components/common/KeyboardScreen';
import Button from '../../components/common/Button';
import SinglePhotoPicker from '../../components/question/SinglePhotoPicker';
import PhotoSourceSheet from '../../components/question/PhotoSourceSheet';
import { Field, Input, CharCount } from '../../components/common/ui';
import CircleChip from '../../components/circles/CircleChip';
import { useData, useSelectors } from '../../data/store';
import { useNavigationGuard } from '../../utils/navigation';
import { useNetwork } from '../../data/network';
import { useTheme } from '../../theme/ThemeContext';
import AccentSwatch from '../../components/circles/AccentSwatch';
import { useImagePicker } from '../../hooks/useImagePicker';
import { isSupabaseConfigured } from '../../lib/supabase';
import { uploadCircleImage } from '../../services/mediaStorage';
import { isLocalPhotoUri, photoUrl } from '../../utils/photos';
import {
  CIRCLE_ACCENT_PRESETS, CIRCLE_ICON_PRESETS, findSimilarCircles, isCircleNameTaken,
} from '../../data/circles';

const NAME_MIN = 3;
const NAME_MAX = 50;
const DESC_MIN = 20;
const DESC_MAX = 200;

export default function CreateCircleScreen({ navigation }) {
  const { dispatch } = useData();
  const { state } = useSelectors();
  const { replace } = useNavigationGuard(navigation);
  const { online } = useNetwork();
  const { pickFromLibrary } = useImagePicker();
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius), [colors, spacing, font, radius]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accentId, setAccentId] = useState(CIRCLE_ACCENT_PRESETS[0].id);
  const [icon, setIcon] = useState(CIRCLE_ICON_PRESETS[0]);
  const [bannerPhoto, setBannerPhoto] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const similar = useMemo(
    () => findSimilarCircles(name, state.circles),
    [name, state.circles],
  );
  const duplicate = isCircleNameTaken(name, state.circles);
  const nameOk = name.trim().length >= NAME_MIN && name.trim().length <= NAME_MAX && !duplicate;
  const descOk = description.trim().length >= DESC_MIN && description.trim().length <= DESC_MAX;
  const valid = nameOk && descOk;

  const pickBanner = async (pickerFn) => {
    const picked = await pickerFn();
    if (picked) setBannerPhoto({ uri: picked.uri });
  };

  const submit = async () => {
    setTouched(true);
    if (!valid || submitting) return;
    if (bannerPhoto?.uri && !online) {
      Alert.alert('No connection', 'Reconnect to upload your circle image.');
      return;
    }

    const newId = `c_${Date.now().toString(36)}`;
    setSubmitting(true);
    try {
      let imageUrl = photoUrl(bannerPhoto);
      if (bannerPhoto?.uri && isLocalPhotoUri(bannerPhoto.uri)) {
        if (!isSupabaseConfigured()) throw new Error('Image upload requires Supabase — check your .env.');
        imageUrl = await uploadCircleImage(newId, { uri: bannerPhoto.uri });
      }
      const res = await dispatch({
        type: 'CREATE_CIRCLE',
        id: newId,
        name: name.trim(),
        description: description.trim(),
        accentId,
        icon,
        imageUrl,
      });
      if (!res?.ok) throw new Error(res?.error?.message || "Couldn't save your circle.");
      replace('CircleDetail', { circleId: newId });
    } catch (e) {
      Alert.alert('Could not create circle', e?.message || 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <KeyboardScreen
        contentStyle={styles.body}
        footer={(
          <View style={styles.footer}>
            <Button title={submitting ? 'Creating…' : 'Create circle'} onPress={submit} disabled={submitting || (touched && !valid)} />
          </View>
        )}
      >
        <Text style={styles.note}>
          To keep Chautari healthy, new circles need an active member to maintain them.
        </Text>

        <Field label="Banner image · optional">
          <SinglePhotoPicker
            photo={bannerPhoto}
            onPick={() => setPickerOpen(true)}
            onRemove={() => setBannerPhoto(null)}
            label="Add circle banner"
            uploading={submitting && !!bannerPhoto?.uri}
          />
          <Text style={styles.hint}>Falls back to your accent color when no image is set.</Text>
        </Field>

        <Field
          label="Circle name"
          error={touched && duplicate ? 'A circle with this name already exists.' : touched && !nameOk ? `Use ${NAME_MIN}–${NAME_MAX} characters.` : null}
        >
          <Input placeholder="e.g. Footscray Nepali Community" value={name} onChangeText={setName} maxLength={NAME_MAX + 10} />
        </Field>

        {similar.length > 0 && name.trim().length >= 2 && (
          <View style={styles.similarBox}>
            <Text style={styles.similarTitle}>Similar circles exist</Text>
            {similar.map((c) => (
              <View key={c.id} style={styles.similarRow}>
                <CircleChip circle={c} compact showOfficial />
                <Pressable
                  onPress={() => {
                    dispatch({ type: 'TOGGLE_JOIN_CIRCLE', circleId: c.id });
                    navigation.navigate('CircleDetail', { circleId: c.id });
                  }}
                  style={styles.similarJoin}
                >
                  <Text style={styles.similarJoinText}>Join instead</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Field
          label="Description"
          error={touched && !descOk ? `Describe your circle in ${DESC_MIN}–${DESC_MAX} characters.` : null}
        >
          <Input placeholder="What is this circle for?" value={description} onChangeText={setDescription} multiline maxLength={DESC_MAX + 20} />
          <CharCount value={description} min={DESC_MIN} max={DESC_MAX} />
        </Field>

        <Field label="Accent color">
          <View style={styles.swatchRow}>
            {CIRCLE_ACCENT_PRESETS.map((a) => (
              <AccentSwatch
                key={a.id}
                accentId={a.id}
                selected={accentId === a.id}
                onPress={() => setAccentId(a.id)}
              />
            ))}
          </View>
        </Field>

        <Field label="Icon">
          <View style={styles.iconRow}>
            {CIRCLE_ICON_PRESETS.map((ic) => (
              <Pressable key={ic} onPress={() => setIcon(ic)} style={[styles.iconBtn, icon === ic && styles.iconBtnActive]}>
                <Text style={styles.iconEmoji}>{ic}</Text>
              </Pressable>
            ))}
          </View>
        </Field>
      </KeyboardScreen>

      <PhotoSourceSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Add circle banner"
        showRemove={!!bannerPhoto}
        onLibrary={() => pickBanner(pickFromLibrary)}
        onRemove={() => setBannerPhoto(null)}
      />
    </>
  );
}

const createStyles = (colors, spacing, font, radius) => StyleSheet.create({
  body: { padding: spacing.lg },
  note: { fontSize: font.caption, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.lg, fontStyle: 'italic' },
  hint: { fontSize: font.tiny, color: colors.textMuted, marginTop: spacing.sm },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  similarBox: { backgroundColor: colors.secondaryTint, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.expertMarkerBorder },
  similarTitle: { fontWeight: '800', color: colors.secondaryDark, fontSize: font.small, marginBottom: spacing.sm },
  similarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  similarJoin: { paddingHorizontal: 10, paddingVertical: 6 },
  similarJoinText: { color: colors.primary, fontWeight: '800', fontSize: font.caption },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  iconBtn: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgSunken, borderWidth: 1, borderColor: colors.border },
  iconBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  iconEmoji: { fontSize: 22 },
});
