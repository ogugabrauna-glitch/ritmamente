
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_likes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_comments() FROM PUBLIC, anon, authenticated;
