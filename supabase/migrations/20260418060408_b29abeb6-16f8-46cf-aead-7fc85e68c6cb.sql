
-- Roles enum and table for examiner/candidate access control
CREATE TYPE public.app_role AS ENUM ('candidate', 'examiner', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'candidate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Candidate intake profile
CREATE TABLE public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_code TEXT UNIQUE,
  -- Step 1: Personal
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  entry_scheme TEXT,    -- NDA / CDS
  target_service TEXT,  -- ARMY / NAVY / AIR_FORCE
  city TEXT,
  state TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  -- Step 2: Biometric baseline
  height_cm NUMERIC,
  weight_kg NUMERIC,
  chest_cm NUMERIC,
  blood_group TEXT,
  -- Step 3: Medical history (jsonb for flexibility)
  medical_history JSONB DEFAULT '{}'::jsonb,
  -- Step 4: Family history
  family_history JSONB DEFAULT '{}'::jsonb,
  -- Status
  intake_step INT NOT NULL DEFAULT 1,
  intake_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates view own profile" ON public.candidate_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'examiner') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Candidates insert own profile" ON public.candidate_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Candidates update own profile" ON public.candidate_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Assessment results
CREATE TABLE public.assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parameter TEXT NOT NULL,
  measured_value TEXT,
  threshold TEXT,
  status TEXT NOT NULL,  -- FIT / UNFIT / BORDERLINE / INCONCLUSIVE
  notes TEXT,
  examiner_signed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own results" ON public.assessment_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'examiner') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Insert own results" ON public.assessment_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Examiners update results" ON public.assessment_results
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'examiner') OR public.has_role(auth.uid(), 'admin'));

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_candidate_profiles_updated_at
  BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-create candidate role + profile shell on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'candidate') ON CONFLICT DO NOTHING;
  INSERT INTO public.candidate_profiles (user_id, candidate_code, contact_email)
    VALUES (NEW.id, 'CP-' || upper(substr(replace(NEW.id::text, '-', ''), 1, 8)), NEW.email)
    ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
