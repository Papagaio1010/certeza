import { useQuery } from "@tanstack/react-query";
import { UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { AVATAR_BUCKET, createSignedUrl } from "@/lib/storage";

export function useAvatarUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["avatar-url", path ?? "none"],
    queryFn: () => createSignedUrl(AVATAR_BUCKET, path),
    enabled: Boolean(path),
    staleTime: 1000 * 60 * 30,
  });
}

type Props = {
  path?: string | null;
  name?: string | null;
  className?: string;
  /** Tamanho do ícone/inicial em classes tailwind */
  iconClassName?: string;
};

export function ProfileAvatar({ path, name, className, iconClassName }: Props) {
  const { data: url } = useAvatarUrl(path);
  const initial = (name ?? "").trim().charAt(0).toUpperCase();

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary-soft text-primary",
        "size-12",
        className,
      )}
    >
      {url ? (
        <img
          src={url}
          alt={name ? `Foto de ${name}` : "Foto de perfil"}
          loading="lazy"
          className="size-full object-cover"
        />
      ) : initial ? (
        <span className={cn("text-lg font-bold", iconClassName)} aria-hidden="true">
          {initial}
        </span>
      ) : (
        <UserRound className={cn("size-5", iconClassName)} aria-hidden="true" />
      )}
    </span>
  );
}
