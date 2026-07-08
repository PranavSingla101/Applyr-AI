-- Generated resumes are stored at a separate path from the user's uploaded
-- resume (resume_pdf_url/key) so generating a resume never overwrites the
-- file Extract from Resume reads from.

ALTER TABLE public.profiles ADD COLUMN generated_resume_pdf_url text;
ALTER TABLE public.profiles ADD COLUMN generated_resume_pdf_key text;
