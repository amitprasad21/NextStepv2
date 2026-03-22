-- Migration 00011: All triggers
-- set_updated_at: reusable trigger for 8 tables
-- sync_fee_range: auto-sync fee_min/fee_max from college_courses

-- set_updated_at (reusable)
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Apply to all 8 tables with updated_at:
CREATE TRIGGER trg_users_upd      BEFORE UPDATE ON public.users             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_profiles_upd   BEFORE UPDATE ON public.student_profiles  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_admin_upd      BEFORE UPDATE ON public.admin_users       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_colleges_upd   BEFORE UPDATE ON public.colleges          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_courses_upd    BEFORE UPDATE ON public.college_courses   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_slots_upd      BEFORE UPDATE ON public.counselling_slots FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_bookings_upd   BEFORE UPDATE ON public.counselling_bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_visits_upd     BEFORE UPDATE ON public.college_visits    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- sync_fee_range: fully implemented with DELETE handling and COALESCE
CREATE OR REPLACE FUNCTION sync_fee_range() RETURNS TRIGGER AS $$
DECLARE tid UUID;
BEGIN
  IF TG_OP='DELETE' THEN tid:=OLD.college_id; ELSE tid:=NEW.college_id; END IF;
  UPDATE public.colleges SET
    fee_min=(SELECT MIN(annual_fee) FROM public.college_courses WHERE college_id=tid AND annual_fee IS NOT NULL),
    fee_max=(SELECT MAX(annual_fee) FROM public.college_courses WHERE college_id=tid AND annual_fee IS NOT NULL)
  WHERE id=tid;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_fee AFTER INSERT OR UPDATE OR DELETE ON public.college_courses
  FOR EACH ROW EXECUTE FUNCTION sync_fee_range();
