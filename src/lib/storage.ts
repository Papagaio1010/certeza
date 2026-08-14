import { supabase } from "@/integrations/supabase/client";

export const AVATAR_BUCKET = "avatars";
export const CV_BUCKET = "curriculos";

const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7 dias

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export const MAX_CV_BYTES = 10 * 1024 * 1024;

function extensionOf(file: File, fallback: string) {
  const fromName = file.name.includes(".") ? file.name.split(".").pop() : null;
  const ext = (fromName ?? fallback).toLowerCase().replace(/[^a-z0-9]/g, "");
  return ext || fallback;
}

/** Cria uma URL assinada para um caminho do storage. Retorna null quando não há arquivo. */
export async function createSignedUrl(bucket: string, path: string | null | undefined) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function uploadAvatar(userId: string, file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Envie um arquivo de imagem.");
  if (file.size > MAX_AVATAR_BYTES) throw new Error("A imagem deve ter no máximo 5 MB.");
  const path = `${userId}/avatar-${Date.now()}.${extensionOf(file, "jpg")}`;
  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  return path;
}

export async function uploadCv(userId: string, file: File) {
  if (file.size > MAX_CV_BYTES) throw new Error("O arquivo deve ter no máximo 10 MB.");
  const path = `${userId}/curriculo-${Date.now()}.${extensionOf(file, "pdf")}`;
  const { error } = await supabase.storage.from(CV_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || "application/pdf",
  });
  if (error) throw error;
  return path;
}

export async function removeStorageFile(bucket: string, path: string | null | undefined) {
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}
