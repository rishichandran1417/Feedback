-- Migration 09: Make category optional on submissions table
ALTER TABLE public.submissions ALTER COLUMN category_id DROP NOT NULL;
