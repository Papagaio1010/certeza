import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  FileText,
  ImagePlus,
  Loader2,
  LogOut,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/AppShell";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { LoadingState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProfessionalData } from "@/lib/queries";
import {
  AVATAR_BUCKET,
  CV_BUCKET,
  createSignedUrl,
  removeStorageFile,
  uploadAvatar,
  uploadCv,
} from "@/lib/storage";

export const Route = createFileRoute("/pro/perfil")({
  ssr: false,
  component: ProProfilePage,
});

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function formatWhatsapp(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isValidCpf(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digits = cpf.split("").map(Number);
  const rounds: Array<{ length: number; position: number }> = [
    { length: 9, position: 10 },
    { length: 10, position: 11 },
  ];
  for (const round of rounds) {
    let sum = 0;
    for (let index = 0; index < round.length; index += 1) {
      sum += (digits[index] ?? 0) * (round.position - index);
    }
    let check = (sum * 10) % 11;
    if (check === 10) check = 0;
    if (check !== (digits[round.length] ?? -1)) return false;
  }
  return true;
}

function Section({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-soft mt-6 p-6 sm:p-8">
      <header className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">
          {step}
        </span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ProProfilePage() {
  const { user, profile, refresh, signOut } = useAuth();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const avatarInput = useRef<HTMLInputElement>(null);
  const cvInput = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [council, setCouncil] = useState("");
  const [years, setYears] = useState("");
  const [education, setEducation] = useState("");
  const [approach, setApproach] = useState("");
  const [languages, setLanguages] = useState("");
  const [presentation, setPresentation] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [online, setOnline] = useState(true);
  const [inPerson, setInPerson] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [showWhatsapp, setShowWhatsapp] = useState(false);
  const [showCv, setShowCv] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showEmail, setShowEmail] = useState(false);

  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cvPath, setCvPath] = useState<string | null>(null);
  const [cvName, setCvName] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState(false);

  const data = useQuery({
    queryKey: ["pro-details", userId],
    queryFn: () => fetchMyProfessionalData(userId),
    enabled: Boolean(userId),
  });

  const cvLink = useQuery({
    queryKey: ["cv-url", cvPath ?? "none"],
    queryFn: () => createSignedUrl(CV_BUCKET, cvPath),
    enabled: Boolean(cvPath),
  });

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname);
      setAvatarPath(profile.avatar_url ?? null);
    }
  }, [profile]);

  useEffect(() => {
    if (!data.data) return;
    const details = data.data.details;
    setCpf(data.data.cpf ? formatCpf(data.data.cpf) : "");
    if (!details) return;
    setFullName(details.full_name ?? "");
    setSpecialty(details.specialty ?? "");
    setCouncil(details.council_registration ?? "");
    setYears(details.years_experience != null ? String(details.years_experience) : "");
    setEducation(details.education ?? "");
    setApproach(details.approach ?? "");
    setLanguages(details.languages ?? "");
    setPresentation(details.presentation ?? "");
    setCity(details.city ?? "");
    setState(details.state ?? "");
    setOnline(details.online_sessions);
    setInPerson(details.in_person_sessions);
    setWhatsapp(details.whatsapp ? formatWhatsapp(details.whatsapp) : "");
    setContactEmail(details.contact_email ?? "");
    setShowWhatsapp(details.show_whatsapp);
    setShowCv(details.show_cv);
    setShowLocation(details.show_location);
    setShowEmail(details.show_email);
    setCvPath(details.cv_url ?? null);
    setCvName(details.cv_filename ?? null);
  }, [data.data]);

  async function handleAvatarChange(file: File | null) {
    if (!file || !userId) return;
    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
    setAvatarUploading(true);
    try {
      const previous = avatarPath;
      const path = await uploadAvatar(userId, file);
      const { error } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", userId);
      if (error) throw error;
      if (previous && previous !== path) await removeStorageFile(AVATAR_BUCKET, previous);
      setAvatarPath(path);
      await refresh();
      void queryClient.invalidateQueries({ queryKey: ["avatar-url"] });
      void queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast.success("Foto de perfil salva.");
    } catch (error) {
      setAvatarPreview(null);
      toast.error(error instanceof Error ? error.message : "Não conseguimos salvar a foto agora.");
    } finally {
      setAvatarUploading(false);
      if (avatarInput.current) avatarInput.current.value = "";
    }
  }

  async function handleAvatarRemove() {
    if (!userId) return;
    setAvatarUploading(true);
    try {
      const previous = avatarPath;
      const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
      if (error) throw error;
      await removeStorageFile(AVATAR_BUCKET, previous);
      setAvatarPath(null);
      setAvatarPreview(null);
      await refresh();
      void queryClient.invalidateQueries({ queryKey: ["avatar-url"] });
      void queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast.success("Foto removida. Um avatar neutro será exibido.");
    } catch {
      toast.error("Não conseguimos remover a foto agora.");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleCvChange(file: File | null) {
    if (!file || !userId) return;
    setCvUploading(true);
    try {
      const previous = cvPath;
      const path = await uploadCv(userId, file);
      const { error } = await supabase
        .from("professional_details")
        .upsert({ user_id: userId, cv_url: path, cv_filename: file.name });
      if (error) throw error;
      if (previous && previous !== path) await removeStorageFile(CV_BUCKET, previous);
      setCvPath(path);
      setCvName(file.name);
      void queryClient.invalidateQueries({ queryKey: ["pro-details", userId] });
      toast.success("Currículo enviado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não conseguimos enviar o arquivo agora.");
    } finally {
      setCvUploading(false);
      if (cvInput.current) cvInput.current.value = "";
    }
  }

  async function handleCvRemove() {
    if (!userId) return;
    setCvUploading(true);
    try {
      const previous = cvPath;
      const { error } = await supabase
        .from("professional_details")
        .upsert({ user_id: userId, cv_url: null, cv_filename: null });
      if (error) throw error;
      await removeStorageFile(CV_BUCKET, previous);
      setCvPath(null);
      setCvName(null);
      void queryClient.invalidateQueries({ queryKey: ["pro-details", userId] });
      toast.success("Currículo removido.");
    } catch {
      toast.error("Não conseguimos remover o currículo agora.");
    } finally {
      setCvUploading(false);
    }
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      if (nickname.trim().length < 2) throw new Error("O nome de exibição é obrigatório.");
      if (fullName.trim().length < 3) throw new Error("Informe seu nome completo.");
      if (!isValidCpf(cpf)) throw new Error("Informe um CPF válido.");
      if (specialty.trim().length < 2) throw new Error("Informe sua área de atuação.");
      const digitsWhats = onlyDigits(whatsapp);
      if (digitsWhats && digitsWhats.length < 10) throw new Error("WhatsApp incompleto.");
      if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
        throw new Error("E-mail de contato inválido.");
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ nickname: nickname.trim(), bio: presentation.trim() || null })
        .eq("id", userId);
      if (profileError) throw profileError;

      const { error: detailsError } = await supabase.from("professional_details").upsert({
        user_id: userId,
        full_name: fullName.trim(),
        specialty: specialty.trim(),
        presentation: presentation.trim() || null,
        council_registration: council.trim() || null,
        years_experience: years ? Number(years) : null,
        education: education.trim() || null,
        approach: approach.trim() || null,
        languages: languages.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        online_sessions: online,
        in_person_sessions: inPerson,
        whatsapp: digitsWhats || null,
        contact_email: contactEmail.trim() || null,
        show_whatsapp: showWhatsapp,
        show_cv: showCv,
        show_location: showLocation,
        show_email: showEmail,
      });
      if (detailsError) throw detailsError;

      const { error: privateError } = await supabase
        .from("professional_private_data")
        .upsert({ user_id: userId, cpf: onlyDigits(cpf) });
      if (privateError) throw privateError;
    },
    onSuccess: async () => {
      toast.success("Cadastro profissional atualizado.");
      await refresh();
      void queryClient.invalidateQueries({ queryKey: ["pro-details", userId] });
      void queryClient.invalidateQueries({ queryKey: ["professionals"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Não conseguimos salvar agora."),
  });

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/", replace: true });
  }

  if (data.isLoading) return <LoadingState label="Carregando seu cadastro..." />;

  return (
    <div className="animate-rise">
      <PageHeader
        title="Cadastro profissional"
        description="Complete seu cadastro para que os pacientes conheçam seu trabalho. Você escolhe o que fica visível."
      />

      <Section
        step={1}
        title="Informações pessoais"
        description="Seus dados de identificação. O CPF é usado apenas internamente e nunca aparece para pacientes."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full-name">Nome completo</Label>
            <Input
              id="full-name"
              value={fullName}
              maxLength={120}
              onChange={(event) => setFullName(event.target.value)}
              className="min-h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">Nome de exibição</Label>
            <Input
              id="nickname"
              value={nickname}
              maxLength={60}
              onChange={(event) => setNickname(event.target.value)}
              className="min-h-12 rounded-2xl"
            />
            <p className="text-xs text-muted-foreground">É o nome que os pacientes veem.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              inputMode="numeric"
              autoComplete="off"
              value={cpf}
              onChange={(event) => setCpf(formatCpf(event.target.value))}
              className="min-h-12 rounded-2xl"
            />
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Guardado com segurança e visível apenas para você.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-email">E-mail da conta</Label>
            <Input
              id="login-email"
              value={user?.email ?? ""}
              readOnly
              disabled
              className="min-h-12 rounded-2xl"
            />
          </div>
        </div>
      </Section>

      <Section
        step={2}
        title="Foto de perfil (opcional)"
        description="Uma foto ajuda os pacientes a se sentirem mais confortáveis. Se preferir, deixe o avatar neutro."
      >
        <div className="flex flex-wrap items-center gap-6">
          {avatarPreview ? (
            <span className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-3xl bg-primary-soft">
              <img src={avatarPreview} alt="Pré-visualização da foto" className="size-full object-cover" />
            </span>
          ) : (
            <ProfileAvatar
              path={avatarPath}
              name={nickname}
              className="size-24 rounded-3xl"
              iconClassName="size-8"
            />
          )}
          <div className="flex flex-wrap gap-3">
            <input
              ref={avatarInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleAvatarChange(event.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              className="min-h-12 rounded-full"
              disabled={avatarUploading}
              onClick={() => avatarInput.current?.click()}
            >
              {avatarUploading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus className="size-4" aria-hidden="true" />
              )}
              {avatarPath ? "Trocar foto" : "Adicionar foto"}
            </Button>
            {avatarPath && (
              <Button
                type="button"
                variant="ghost"
                className="min-h-12 rounded-full"
                disabled={avatarUploading}
                onClick={() => void handleAvatarRemove()}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Remover foto
              </Button>
            )}
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Formatos de imagem até 5 MB. A foto é salva na hora e continua disponível nos próximos acessos.
        </p>
      </Section>

      <Section
        step={3}
        title="Informações profissionais"
        description="Conte sobre sua formação e abordagem. Estas informações ficam visíveis para os pacientes."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="specialty">Área de atuação / especialidade</Label>
            <Input
              id="specialty"
              value={specialty}
              maxLength={100}
              placeholder="Ex.: Psicologia clínica — ansiedade"
              onChange={(event) => setSpecialty(event.target.value)}
              className="min-h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="council">Registro profissional (opcional)</Label>
            <Input
              id="council"
              value={council}
              maxLength={40}
              placeholder="Ex.: CRP 06/123456"
              onChange={(event) => setCouncil(event.target.value)}
              className="min-h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years">Anos de experiência (opcional)</Label>
            <Input
              id="years"
              inputMode="numeric"
              value={years}
              onChange={(event) => setYears(onlyDigits(event.target.value).slice(0, 2))}
              className="min-h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="languages">Idiomas de atendimento (opcional)</Label>
            <Input
              id="languages"
              value={languages}
              maxLength={80}
              placeholder="Ex.: Português, Espanhol"
              onChange={(event) => setLanguages(event.target.value)}
              className="min-h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="education">Formação (opcional)</Label>
            <Input
              id="education"
              value={education}
              maxLength={160}
              placeholder="Ex.: Psicologia — USP"
              onChange={(event) => setEducation(event.target.value)}
              className="min-h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="approach">Abordagem (opcional)</Label>
            <Input
              id="approach"
              value={approach}
              maxLength={120}
              placeholder="Ex.: Terapia cognitivo-comportamental"
              onChange={(event) => setApproach(event.target.value)}
              className="min-h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade (opcional)</Label>
            <Input
              id="city"
              value={city}
              maxLength={80}
              onChange={(event) => setCity(event.target.value)}
              className="min-h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado (opcional)</Label>
            <Input
              id="state"
              value={state}
              maxLength={40}
              onChange={(event) => setState(event.target.value)}
              className="min-h-12 rounded-2xl"
            />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Label htmlFor="presentation">Apresentação profissional</Label>
          <Textarea
            id="presentation"
            value={presentation}
            rows={6}
            maxLength={1200}
            placeholder="Conte brevemente sobre sua abordagem e como você acolhe quem chega."
            onChange={(event) => setPresentation(event.target.value)}
            className="rounded-2xl text-base"
          />
          <p className="text-xs text-muted-foreground">{presentation.length}/1200 caracteres</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
            <span className="text-sm">Atendimento online</span>
            <Switch checked={online} onCheckedChange={setOnline} />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
            <span className="text-sm">Atendimento presencial</span>
            <Switch checked={inPerson} onCheckedChange={setInPerson} />
          </label>
        </div>
      </Section>

      <Section
        step={4}
        title="Currículo (opcional)"
        description="Envie um PDF com seu currículo. Você decide se ele fica visível para os pacientes."
      >
        <div className="flex flex-wrap items-center gap-4">
          <input
            ref={cvInput}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf"
            className="hidden"
            onChange={(event) => void handleCvChange(event.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            className="min-h-12 rounded-full"
            disabled={cvUploading}
            onClick={() => cvInput.current?.click()}
          >
            {cvUploading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="size-4" aria-hidden="true" />
            )}
            {cvPath ? "Trocar currículo" : "Enviar currículo"}
          </Button>
          {cvPath && (
            <>
              <a
                href={cvLink.data ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                <FileText className="size-4" aria-hidden="true" />
                {cvName ?? "Currículo enviado"}
              </a>
              <Button
                type="button"
                variant="ghost"
                className="min-h-12 rounded-full"
                disabled={cvUploading}
                onClick={() => void handleCvRemove()}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Remover
              </Button>
            </>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Arquivos até 10 MB.</p>
      </Section>

      <Section
        step={5}
        title="Contato (opcional)"
        description="Formas de contato que você pode disponibilizar aos pacientes."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
            <Input
              id="whatsapp"
              inputMode="tel"
              value={whatsapp}
              placeholder="(11) 90000-0000"
              onChange={(event) => setWhatsapp(formatWhatsapp(event.target.value))}
              className="min-h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">E-mail de contato (opcional)</Label>
            <Input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              className="min-h-12 rounded-2xl"
            />
          </div>
        </div>
      </Section>

      <Section
        step={6}
        title="Privacidade e visibilidade"
        description="Escolha o que os pacientes podem ver no seu perfil. O CPF nunca é exibido."
      >
        <div className="grid gap-3">
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
            <span className="text-sm">Permitir que pacientes visualizem meu WhatsApp</span>
            <Switch checked={showWhatsapp} onCheckedChange={setShowWhatsapp} />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
            <span className="text-sm">Exibir meu currículo no perfil</span>
            <Switch checked={showCv} onCheckedChange={setShowCv} />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
            <span className="text-sm">Exibir cidade e estado</span>
            <Switch checked={showLocation} onCheckedChange={setShowLocation} />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
            <span className="text-sm">Exibir meu e-mail de contato</span>
            <Switch checked={showEmail} onCheckedChange={setShowEmail} />
          </label>
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Seu CPF é armazenado separadamente e só pode ser acessado por você. Foto, currículo e
            WhatsApp são opcionais.
          </p>
        </div>
      </Section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          className="min-h-12 rounded-full sm:px-8"
          disabled={save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Salvar cadastro
        </Button>
        <Button variant="ghost" className="min-h-12 rounded-full" onClick={handleSignOut}>
          <LogOut className="size-4" aria-hidden="true" />
          Sair da conta
        </Button>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Lembre-se: a plataforma exibe apenas o apelido dos pacientes e os registros que eles
        escolheram compartilhar.
      </p>
    </div>
  );
}
