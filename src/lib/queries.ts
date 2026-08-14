import { supabase } from "@/integrations/supabase/client";

export type DiaryEntry = {
  id: string;
  user_id: string;
  emotions: string[];
  content: string;
  day_rating: number;
  shared: boolean;
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
};

export type EmotionalProfile = {
  user_id: string;
  predominant_emotions: string[];
  current_state: string | null;
  updated_at: string;
};

export type PublicProfile = {
  id: string;
  nickname: string;
  bio: string | null;
  avatar_url: string | null;
};

export type ProfessionalDetails = {
  user_id: string;
  full_name: string | null;
  specialty: string | null;
  presentation: string | null;
  council_registration: string | null;
  years_experience: number | null;
  education: string | null;
  approach: string | null;
  languages: string | null;
  city: string | null;
  state: string | null;
  online_sessions: boolean;
  in_person_sessions: boolean;
  whatsapp: string | null;
  contact_email: string | null;
  cv_url: string | null;
  cv_filename: string | null;
  show_whatsapp: boolean;
  show_cv: boolean;
  show_location: boolean;
  show_email: boolean;
};

export type ProfessionalCard = PublicProfile & { details: ProfessionalDetails | null };

export async function fetchProfessionalProfiles(): Promise<ProfessionalCard[]> {
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "professional");
  if (rolesError) throw rolesError;
  const ids = (roles ?? []).map((row) => row.user_id);
  if (ids.length === 0) return [];
  const [{ data, error }, { data: details }] = await Promise.all([
    supabase.from("profiles").select("id, nickname, bio, avatar_url").in("id", ids).order("nickname"),
    supabase.from("professional_details").select("*").in("user_id", ids),
  ]);
  if (error) throw error;
  return ((data ?? []) as PublicProfile[]).map((profile) => ({
    ...profile,
    details:
      ((details ?? []) as ProfessionalDetails[]).find((item) => item.user_id === profile.id) ?? null,
  }));
}

export async function fetchProfessionalById(id: string): Promise<ProfessionalCard | null> {
  const [{ data: profile, error }, { data: details }] = await Promise.all([
    supabase.from("profiles").select("id, nickname, bio, avatar_url").eq("id", id).maybeSingle(),
    supabase.from("professional_details").select("*").eq("user_id", id).maybeSingle(),
  ]);
  if (error) throw error;
  if (!profile) return null;
  return {
    ...(profile as PublicProfile),
    details: (details as ProfessionalDetails) ?? null,
  };
}

export async function fetchMyProfessionalData(userId: string) {
  const [{ data: details }, { data: privateData }] = await Promise.all([
    supabase.from("professional_details").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("professional_private_data").select("cpf").eq("user_id", userId).maybeSingle(),
  ]);
  return {
    details: (details as ProfessionalDetails) ?? null,
    cpf: privateData?.cpf ?? "",
  };
}

export async function fetchMyLink(userId: string) {
  const { data, error } = await supabase
    .from("professional_links")
    .select("id, professional_id, status, created_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { data: professional } = await supabase
    .from("profiles")
    .select("id, nickname, bio, avatar_url")
    .eq("id", data.professional_id)
    .maybeSingle();
  return { ...data, professional: (professional as PublicProfile) ?? null };
}

export async function fetchDiaryEntries(userId: string) {
  const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DiaryEntry[];
}

export async function fetchEmotionalProfile(userId: string) {
  const { data, error } = await supabase
    .from("emotional_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as EmotionalProfile) ?? null;
}

export async function fetchConversation(userId: string, partnerId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userId})`,
    )
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function markConversationRead(userId: string, partnerId: string) {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", userId)
    .eq("sender_id", partnerId)
    .is("read_at", null);
}

export async function fetchUnreadCount(userId: string) {
  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .is("read_at", null);
  if (error) throw error;
  return count ?? 0;
}

export async function fetchLinkedUsers(professionalId: string) {
  const { data: links, error } = await supabase
    .from("professional_links")
    .select("id, user_id, created_at, status")
    .eq("professional_id", professionalId)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const ids = (links ?? []).map((link) => link.user_id);
  if (ids.length === 0) return [];
  const [{ data: profiles }, { data: emotional }, { data: messages }] = await Promise.all([
    supabase.from("profiles").select("id, nickname, bio, avatar_url").in("id", ids),
    supabase.from("emotional_profiles").select("*").in("user_id", ids),
    supabase
      .from("messages")
      .select("*")
      .eq("recipient_id", professionalId)
      .is("read_at", null),
  ]);

  return (links ?? []).map((link) => ({
    ...link,
    profile: ((profiles ?? []) as PublicProfile[]).find((item) => item.id === link.user_id) ?? null,
    emotional:
      ((emotional ?? []) as EmotionalProfile[]).find((item) => item.user_id === link.user_id) ??
      null,
    unread: ((messages ?? []) as Message[]).filter((item) => item.sender_id === link.user_id).length,
  }));
}

export async function fetchSharedEntries(userIds?: string[]) {
  let query = supabase
    .from("diary_entries")
    .select("*")
    .eq("shared", true)
    .order("created_at", { ascending: false });
  if (userIds) query = query.in("user_id", userIds);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as DiaryEntry[];
}
