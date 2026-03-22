-- Migration 00010: notifications table
-- Append-only audit log. email + in_app only.
-- Dispatched on admin status change — never on booking/visit creation.

CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES public.users(id),
  type            TEXT NOT NULL CHECK (type IN (
                    'booking_confirmed','booking_cancelled','booking_completed',
                    'visit_confirmed','visit_cancelled','visit_completed','welcome'
                  )),
  channel         TEXT NOT NULL CHECK (channel IN ('email','in_app')),
  message         TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending','sent','failed')),
  retry_count     INTEGER NOT NULL DEFAULT 0,
  sent_at         TIMESTAMPTZ,
  reference_id    UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_student_channel ON public.notifications(student_id, channel);
