-- RLS patch — run this in Supabase SQL Editor if you've already run schema.sql
-- Adds missing INSERT policies for users and ratings tables

-- Allow authenticated users to insert their own profile row on signup
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert their own initial rating on signup
CREATE POLICY "Users can insert own rating"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
