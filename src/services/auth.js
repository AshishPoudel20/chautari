import { supabase, isSupabaseConfigured, isAuthDevMode } from '../lib/supabase';

const DEV_AUTH_PASSWORD = 'chautari-prototype';

function normalizePhoneE164(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('61') && digits.length === 11) return `+${digits}`;
  if (digits.length === 9 && digits.startsWith('4')) return `+61${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

export function toE164Au(digits) {
  const cleaned = String(digits).replace(/\D/g, '');
  return `+61${cleaned}`;
}

/** Prototype: mock OTP in the app; real Supabase account is created at onboarding finish. */
export function usesMockOtp() {
  return !isSupabaseConfigured() || isAuthDevMode();
}

function emailForPhone(phoneE164) {
  const digits = normalizePhoneE164(phoneE164).replace(/\D/g, '');
  return `user+${digits}@chautari.app`;
}

/** Creates or signs in a Supabase user for this phone (email provider, no SMS). */
export async function ensureSupabaseUserForPhone(phoneE164) {
  if (!isSupabaseConfigured()) return null;
  const email = emailForPhone(phoneE164);
  const phone = normalizePhoneE164(phoneE164);

  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: DEV_AUTH_PASSWORD,
  });
  if (!error && data.user) return data.user;

  ({ data, error } = await supabase.auth.signUp({
    email,
    password: DEV_AUTH_PASSWORD,
    options: { data: { phone } },
  }));
  if (error) throw error;
  if (!data.user) throw new Error('Could not create account');
  return data.user;
}

export async function sendPhoneOtp(phoneE164) {
  if (usesMockOtp()) return;
  const { error } = await supabase.auth.signInWithOtp({ phone: phoneE164 });
  if (error) throw error;
}

export async function verifyPhoneOtp(phoneE164, token) {
  if (!isSupabaseConfigured()) return { user: null };
  const { data, error } = await supabase.auth.verifyOtp({
    phone: phoneE164,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return { user: data.user, session: data.session };
}

export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}
