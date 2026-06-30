CREATE OR REPLACE FUNCTION public.notify_new_notice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.published = true THEN
    PERFORM net.http_post(
      url := 'https://idokzcesdubuumvizbad.supabase.co/functions/v1/send-push',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('title', NEW.title, 'body', NEW.description, 'notice_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;