-- Recent Activity (Feature 16) merges two kinds of event into one list sorted
-- by time. Agent runs already carry `completed_at`, but a company dossier had
-- no timestamp of its own — `company_research` is a bare jsonb blob, and the
-- job's `found_at` records when the job was discovered, not when it was
-- researched. Ordering research by `found_at` would place every dossier at the
-- moment its job appeared, which is wrong whenever a job is researched later
-- (the normal case — research is a button the user presses).
--
-- Nullable on purpose: rows researched before this migration have no recorded
-- time, and the activity feed falls back to `found_at` for those rather than
-- dropping them.

ALTER TABLE public.jobs ADD COLUMN company_researched_at timestamptz;

-- Backfill what can be recovered. The research route writes an agent_logs
-- entry per run, so the newest log for a job is a good stand-in for when its
-- dossier was built. Jobs with no run_id were never narrated and stay null.
UPDATE public.jobs AS j
SET company_researched_at = l.researched_at
FROM (
  SELECT job_id, max(created_at) AS researched_at
  FROM public.agent_logs
  WHERE job_id IS NOT NULL
  GROUP BY job_id
) AS l
WHERE j.id = l.job_id
  AND j.company_research IS NOT NULL;

-- The activity feed reads the most recent researched jobs per user.
CREATE INDEX idx_jobs_user_researched_at
  ON public.jobs(user_id, company_researched_at DESC)
  WHERE company_research IS NOT NULL;
