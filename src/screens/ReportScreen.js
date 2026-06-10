import React, { useMemo,  useState  } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Button from '../components/Button';
import KeyboardScreen from '../components/KeyboardScreen';
import { Input } from '../components/ui';
import { useToast } from '../components/Toast';
import { useData } from '../data/store';
import { useNetwork } from '../data/network';
import { useTheme } from '../theme/ThemeContext';

// Report Content modal + Report Expert modal share this screen via the `kind` param.
const REASONS = {
  content: ['Spam or advertising', 'Misinformation', 'Harassment or hate', 'Inappropriate content', 'Off-topic', 'Other'],
  expert: ['Not actually qualified', 'Misleading credentials', 'Promotional / soliciting', 'Unprofessional conduct', 'Other'],
};

export default function ReportScreen({ navigation, route }) {
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius), [colors, spacing, font, radius]);

  const { kind = 'content', targetTitle } = route.params || {};
  const { dispatch } = useData();
  const { online } = useNetwork();
  const showToast = useToast();
  const [reason, setReason] = useState(null);
  const [detail, setDetail] = useState('');

  const submit = () => {
    if (!reason) return;
    if (!online) {
      Alert.alert('No connection', 'You’re offline. Reconnect to submit your report.');
      return;
    }
    dispatch({ type: 'ADD_REPORT', report: { kind, target: targetTitle, reason, detail: detail.trim() } });
    navigation.goBack();
    showToast('Report submitted — thanks for flagging this', { tone: 'success' });
  };

  return (
    <KeyboardScreen
      safe={false}
      contentStyle={styles.body}
      footer={(
        <View style={styles.footer}>
          <Button title="Submit report" variant="danger" onPress={submit} disabled={!reason} />
        </View>
      )}
    >
        <Text style={styles.title}>{kind === 'expert' ? 'Report this expert' : 'Report content'}</Text>
        {targetTitle ? <Text style={styles.target} numberOfLines={2}>Reporting: {targetTitle}</Text> : null}

        <Text style={styles.label}>Reason</Text>
        {REASONS[kind].map((r) => (
          <Pressable key={r} style={styles.reason} onPress={() => setReason(r)}>
            <View style={[styles.radio, reason === r && styles.radioOn]}>{reason === r ? <View style={styles.radioDot} /> : null}</View>
            <Text style={styles.reasonText}>{r}</Text>
          </Pressable>
        ))}

        <Text style={[styles.label, { marginTop: spacing.lg }]}>Additional details (optional)</Text>
        <Input value={detail} onChangeText={setDetail} multiline placeholder="Add any context that helps us review…" />
    </KeyboardScreen>
  );
}

const createStyles = (colors, spacing, font, radius) => StyleSheet.create({
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  title: { fontSize: font.h2, fontWeight: '800', color: colors.text },
  target: { color: colors.textMuted, fontSize: font.small, marginTop: 4, marginBottom: spacing.md },
  label: { fontSize: font.small, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  reason: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },
  reasonText: { fontSize: font.body, color: colors.text },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
