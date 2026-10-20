-- Migration 04: Email Notifications Transactional Outbox & Event Triggers

CREATE TYPE public.email_event_type AS ENUM (
    'submission_acknowledgement',
    'status_update',
    'issue_resolved',
    'issue_reopened',
    'admin_reply',
    'info_request'
);

CREATE TYPE public.email_delivery_status AS ENUM (
    'queued',
    'sending',
    'sent_to_provider',
    'delivered',
    'failed',
    'bounced'
);

CREATE TABLE IF NOT EXISTS public.email_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    event_type public.email_event_type NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT,
    body_text TEXT,
    delivery_status public.email_delivery_status NOT NULL DEFAULT 'queued',
    provider_message_id TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    idempotency_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- Index for queue polling and status inquiries
CREATE INDEX IF NOT EXISTS idx_email_notifs_delivery ON public.email_notifications(delivery_status, created_at);
CREATE INDEX IF NOT EXISTS idx_email_notifs_submission ON public.email_notifications(submission_id);

-- Row Level Security for email notifications (Admin only)
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view email notification logs"
  ON public.email_notifications FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Only admins can retry or update email logs"
  ON public.email_notifications FOR ALL
  USING (public.is_admin());

-- Automated Outbox Trigger: Queue Acknowledgement Email on New Submission
CREATE OR REPLACE FUNCTION public.trg_enqueue_submission_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recipient TEXT;
  v_idempotency TEXT;
BEGIN
  -- Obtain student email from profiles
  SELECT email INTO v_recipient FROM public.profiles WHERE id = NEW.student_id;
  
  IF v_recipient IS NOT NULL THEN
    v_idempotency := 'ack_' || NEW.id || '_' || EXTRACT(EPOCH FROM NEW.created_at);
    
    INSERT INTO public.email_notifications (
      submission_id,
      recipient_email,
      event_type,
      subject,
      delivery_status,
      idempotency_key
    ) VALUES (
      NEW.id,
      v_recipient,
      'submission_acknowledgement',
      '[CET] Submission Received – ' || NEW.reference_number,
      'queued',
      v_idempotency
    ) ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_submission_enqueued_email
AFTER INSERT ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.trg_enqueue_submission_email();
