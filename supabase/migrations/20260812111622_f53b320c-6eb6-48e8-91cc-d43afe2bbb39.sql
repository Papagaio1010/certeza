ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE TABLE public.professional_details (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  specialty text,
  presentation text,
  council_registration text,
  years_experience smallint,
  education text,
  approach text,
  languages text,
  city text,
  state text,
  online_sessions boolean NOT NULL DEFAULT true,
  in_person_sessions boolean NOT NULL DEFAULT false,
  whatsapp text,
  contact_email text,
  cv_url text,
  cv_filename text,
  show_whatsapp boolean NOT NULL DEFAULT false,
  show_cv boolean NOT NULL DEFAULT true,
  show_location boolean NOT NULL DEFAULT true,
  show_email boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_details TO authenticated;
GRANT ALL ON public.professional_details TO service_role;

ALTER TABLE public.professional_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pd_own" ON public.professional_details FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "pd_select_all_authenticated" ON public.professional_details FOR SELECT TO authenticated
  USING (public.has_role(user_id, 'professional'::public.app_role));

CREATE TRIGGER professional_details_updated_at BEFORE UPDATE ON public.professional_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.professional_private_data (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_private_data TO authenticated;
GRANT ALL ON public.professional_private_data TO service_role;

ALTER TABLE public.professional_private_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ppd_own" ON public.professional_private_data FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER professional_private_data_updated_at BEFORE UPDATE ON public.professional_private_data
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();