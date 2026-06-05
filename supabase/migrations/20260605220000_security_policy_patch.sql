-- =========================================================
-- SECURITY PATCH: Fix overly-permissive RLS policies
-- Applied: 2026-06-05
-- =========================================================

-- ── credit_transactions: remove INSERT/UPDATE/DELETE from authenticated ──
-- Previously authenticated users could INSERT directly into credit_transactions,
-- allowing balance manipulation. Credits must only be modified via SECURITY DEFINER functions.

REVOKE INSERT, UPDATE, DELETE ON public.credit_transactions FROM authenticated;

-- Ensure SELECT-only policy exists (drop old ones and recreate safely)
DROP POLICY IF EXISTS "ctx_owner_select" ON public.credit_transactions;
CREATE POLICY "ctx_owner_select" ON public.credit_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ── xp_logs: remove INSERT/UPDATE/DELETE from authenticated ──
-- Previously users could grant XP to themselves by inserting rows directly.
-- XP logs must only be written via SECURITY DEFINER server functions.

REVOKE INSERT, UPDATE, DELETE ON public.xp_logs FROM authenticated;

DROP POLICY IF EXISTS "xp_owner_all" ON public.xp_logs;
CREATE POLICY "xp_owner_select" ON public.xp_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ── subscriptions: remove INSERT/UPDATE/DELETE from authenticated ──
-- Subscription status should only be modified by server-side webhooks (e.g., Stripe).

REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated;

DROP POLICY IF EXISTS "sub_owner_select" ON public.subscriptions;
CREATE POLICY "sub_owner_select" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ── Grant credits function: add a server-side XP award function ──
-- Safe way to award XP (only callable, not writable via table directly)

CREATE OR REPLACE FUNCTION public.award_xp(_amount INTEGER, _reason TEXT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID; _new_xp INTEGER;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _amount <= 0 OR _amount > 500 THEN RAISE EXCEPTION 'invalid_xp_amount'; END IF;

  UPDATE public.profiles
    SET xp = xp + _amount,
        level = FLOOR((xp + _amount) / 100) + 1
    WHERE user_id = _uid
    RETURNING xp INTO _new_xp;

  INSERT INTO public.xp_logs(user_id, amount, reason)
    VALUES (_uid, _amount, _reason);

  RETURN _new_xp;
END; $$;
GRANT EXECUTE ON FUNCTION public.award_xp(INTEGER, TEXT) TO authenticated;

-- ── messages_owner_all: restrict UPDATE/DELETE to prevent editing history ──
-- Users should only INSERT and SELECT their own messages, not edit or delete them
-- (to maintain conversation integrity).

DROP POLICY IF EXISTS "messages_owner_all" ON public.chat_messages;
CREATE POLICY "messages_owner_select" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "messages_owner_insert" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
-- Allow delete only of own messages (e.g., if session is deleted)
CREATE POLICY "messages_owner_delete" ON public.chat_messages
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ── Add missing index for week activity query performance ──
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.chat_messages(user_id, created_at DESC);

-- ── Add missing index for vocabulary search ──
CREATE INDEX IF NOT EXISTS idx_vocabulary_user ON public.vocabulary(user_id, created_at DESC);
