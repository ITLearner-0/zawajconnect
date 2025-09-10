-- Drop the old trigger and recreate it with the correct function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger pointing to the correct function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_complete();