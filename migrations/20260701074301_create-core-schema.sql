-- Feature 04: Database Schema
-- profiles, agent_runs, jobs, agent_logs + RLS

-- ============================================================
-- profiles
-- ============================================================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  location text,
  current_title text,
  experience_level text,
  years_experience integer,
  skills text[] NOT NULL DEFAULT '{}',
  industries text[] NOT NULL DEFAULT '{}',
  work_experience jsonb,
  education jsonb,
  job_titles_seeking text[] NOT NULL DEFAULT '{}',
  remote_preference text,
  preferred_locations text[] NOT NULL DEFAULT '{}',
  salary_expectation text,
  cover_letter_tone text,
  linkedin_url text,
  portfolio_url text,
  work_authorization text,
  resume_pdf_url text,
  is_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner select" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "owner insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "owner update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "owner delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (id = (SELECT auth.uid()));

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- ============================================================
-- agent_runs
-- ============================================================

CREATE TABLE public.agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text,
  job_title_searched text,
  location_searched text,
  jobs_found integer,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_agent_runs_user_id ON public.agent_runs(user_id);

ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner select" ON public.agent_runs
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "owner insert" ON public.agent_runs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "owner update" ON public.agent_runs
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "owner delete" ON public.agent_runs
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_runs TO authenticated;

-- ============================================================
-- jobs
-- ============================================================

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('search', 'url')),
  source_url text,
  external_apply_url text,
  title text,
  company text,
  location text,
  salary text,
  job_type text,
  about_role text,
  responsibilities text[] NOT NULL DEFAULT '{}',
  requirements text[] NOT NULL DEFAULT '{}',
  nice_to_have text[] NOT NULL DEFAULT '{}',
  benefits text[] NOT NULL DEFAULT '{}',
  about_company text,
  match_score integer,
  match_reason text,
  matched_skills text[] NOT NULL DEFAULT '{}',
  missing_skills text[] NOT NULL DEFAULT '{}',
  company_research jsonb,
  found_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_run_id ON public.jobs(run_id);
CREATE INDEX idx_jobs_user_match_score ON public.jobs(user_id, match_score);
CREATE INDEX idx_jobs_user_found_at ON public.jobs(user_id, found_at);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner select" ON public.jobs
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "owner insert" ON public.jobs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "owner update" ON public.jobs
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "owner delete" ON public.jobs
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;

-- ============================================================
-- agent_logs
-- ============================================================

CREATE TABLE public.agent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES public.agent_runs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  level text,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_logs_user_id ON public.agent_logs(user_id);
CREATE INDEX idx_agent_logs_run_id ON public.agent_logs(run_id);

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner select" ON public.agent_logs
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "owner insert" ON public.agent_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "owner update" ON public.agent_logs
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "owner delete" ON public.agent_logs
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_logs TO authenticated;
