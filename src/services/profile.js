import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ensureSupabaseUserForPhone } from './auth';

export function normalizePhoneE164(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('61') && digits.length === 11) return `+${digits}`;
  if (digits.length === 9 && digits.startsWith('4')) return `+61${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

export async function ensureProfilePhone(userId, phoneE164) {
  if (!isSupabaseConfigured() || !userId) return;
  const phone = normalizePhoneE164(phoneE164);

  const tryUpdate = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ phone })
      .eq('id', userId)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    return !!data;
  };

  if (await tryUpdate()) return;
  await new Promise((r) => setTimeout(r, 400));
  if (await tryUpdate()) return;

  const { error } = await supabase.from('profiles').insert({ id: userId, phone, name: '' });
  if (error && error.code !== '23505') throw error;
}

export function profileRowToUser(row) {
  if (!row) return null;
  return {
    id: 'me',
    name: row.name || '',
    suburb: row.suburb || null,
    photo: row.photo_url || null,
    bio: row.bio || '',
    verified: !!row.verified,
    verifiedCategory: row.verified_category || null,
    profession: row.profession || null,
    contact: row.contact || null,
    isFoundingMember: !!row.is_founding_member,
    followers: row.followers_count ?? 0,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

export function profileMetaFromRow(row) {
  if (!row) return {};
  return {
    newcomer: !!row.newcomer,
    newcomerSince: row.newcomer_since ? new Date(row.newcomer_since).getTime() : null,
    digestMode: row.digest_mode || 'daily',
    checklistCardDismissed: !!row.checklist_card_dismissed,
  };
}

function patchToRow(patch) {
  const row = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.suburb !== undefined) row.suburb = patch.suburb;
  if (patch.photo !== undefined) row.photo_url = patch.photo;
  if (patch.bio !== undefined) row.bio = patch.bio;
  if (patch.newcomer !== undefined) {
    row.newcomer = patch.newcomer;
    row.newcomer_since = patch.newcomer ? new Date().toISOString() : null;
  }
  if (patch.isFoundingMember !== undefined) row.is_founding_member = patch.isFoundingMember;
  if (patch.digestMode !== undefined) row.digest_mode = patch.digestMode;
  if (patch.checklistCardDismissed !== undefined) {
    row.checklist_card_dismissed = patch.checklistCardDismissed;
  }
  return row;
}

export async function fetchProfile(userId) {
  if (!isSupabaseConfigured() || !userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(patch) {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('profiles')
    .update(patchToRow(patch))
    .eq('id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function completeOnboarding({ name, suburb, photo, newcomer, phone }) {
  if (!isSupabaseConfigured()) return null;

  let userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId && phone) {
    const user = await ensureSupabaseUserForPhone(phone);
    userId = user.id;
  }
  if (!userId) throw new Error('Not signed in');

  const row = patchToRow({
    name,
    suburb: suburb || null,
    photo: photo || null,
    newcomer: !!newcomer,
    isFoundingMember: true,
  });
  row.phone = phone ? normalizePhoneE164(phone) : undefined;

  const { error } = await supabase.from('profiles').update(row).eq('id', userId);
  if (error) throw error;
  return userId;
}
