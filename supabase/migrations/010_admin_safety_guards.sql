-- Admin safety guards (applied to remote via MCP)

-- update_user_role: only admins can change roles; cannot remove the LAST active admin
CREATE OR REPLACE FUNCTION public.update_user_role(p_user_id uuid, p_roles app_role[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  caller_roles app_role[];
  target_roles app_role[];
  admin_count integer;
BEGIN
  SELECT role INTO caller_roles FROM public.user_roles WHERE user_id = auth.uid();
  IF caller_roles IS NULL OR NOT caller_roles @> ARRAY['admin'::app_role] THEN
    RAISE EXCEPTION 'Only admins can change roles';
  END IF;

  SELECT role INTO target_roles FROM public.user_roles WHERE user_id = p_user_id;
  IF target_roles IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF target_roles @> ARRAY['admin'::app_role] AND NOT p_roles @> ARRAY['admin'::app_role] THEN
    SELECT count(*) INTO admin_count
    FROM public.user_roles
    WHERE user_roles.active = true
      AND user_roles.role @> ARRAY['admin'::app_role]
      AND user_id <> p_user_id;

    IF admin_count = 0 THEN
      RAISE EXCEPTION 'No puedes quitar el rol de admin al ultimo administrador activo del sistema';
    END IF;
  END IF;

  UPDATE public.user_roles
  SET role = p_roles
  WHERE user_id = p_user_id;
END;
$function$;

-- toggle_user_active: cannot suspend the LAST active admin
CREATE OR REPLACE FUNCTION public.toggle_user_active(p_user_id uuid, p_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE c integer;
BEGIN
  IF NOT p_active THEN
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role @> ARRAY['admin'::app_role]) THEN
      SELECT count(*) INTO c FROM public.user_roles WHERE active = true AND role @> ARRAY['admin'::app_role] AND user_id <> p_user_id;
      IF c = 0 THEN RAISE EXCEPTION 'last_active_admin'; END IF;
    END IF;
  END IF;
  UPDATE public.user_roles SET active = p_active WHERE user_id = p_user_id;
END;
$function$;
