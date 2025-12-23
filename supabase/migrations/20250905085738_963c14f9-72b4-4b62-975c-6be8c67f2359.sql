-- Fix security issue: Restrict profile visibility to own profile or admin access

-- Drop the existing overly permissive policy
DROP POLICY "Users can view all profiles" ON public.profiles;

-- Create new secure policies for profile access
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));