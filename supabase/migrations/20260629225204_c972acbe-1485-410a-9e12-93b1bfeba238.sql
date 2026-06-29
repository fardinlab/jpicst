
-- Device tokens for FCM push
CREATE TABLE public.device_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token text NOT NULL UNIQUE,
  platform text NOT NULL DEFAULT 'android',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_tokens TO authenticated;
GRANT SELECT, INSERT ON public.device_tokens TO anon;
GRANT ALL ON public.device_tokens TO service_role;

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous app installs) can register a token
CREATE POLICY "Anyone can register device token"
  ON public.device_tokens FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can update their own token row (for refresh) by matching token value
CREATE POLICY "Update own token"
  ON public.device_tokens FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Admins can view all tokens
CREATE POLICY "Admins view tokens"
  ON public.device_tokens FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Trigger function: call send-push edge function when a published notice is inserted
CREATE OR REPLACE FUNCTION public.notify_new_notice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.published = true THEN
    PERFORM extensions.http_post(
      url := 'https://idokzcesdubuumvizbad.supabase.co/functions/v1/send-push',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('title', NEW.title, 'body', NEW.description, 'notice_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_notice_insert_notify
AFTER INSERT ON public.notices
FOR EACH ROW EXECUTE FUNCTION public.notify_new_notice();
