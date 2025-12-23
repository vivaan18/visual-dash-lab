-- Security Enhancement: Create admin-only function for role updates
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id uuid, new_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Only admins can update user roles';
  END IF;
  
  -- Update the user's role
  UPDATE public.profiles 
  SET role = new_role, updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Log the role change
  INSERT INTO public.activity_logs (user_id, action, details)
  VALUES (
    auth.uid(),
    'role_updated',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'new_role', new_role,
      'timestamp', now()
    )
  );
END;
$$;