-- Expert badge title + professional circle (declared at verification).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expert_badge_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expert_circle_id TEXT REFERENCES public.circles(id) ON DELETE SET NULL;
