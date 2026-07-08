-- Store the storage key alongside the URL so the download route doesn't
-- have to guess the object path — follow InsForge's documented "save both
-- url and key" pattern instead of hardcoding `${user_id}/resume.pdf`.

ALTER TABLE public.profiles ADD COLUMN resume_pdf_key text;
