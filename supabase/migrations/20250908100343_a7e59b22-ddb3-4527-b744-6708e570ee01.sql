-- Créer les triggers manquants pour le système de notifications et supervision

-- Trigger pour notifier les nouveaux matches mutuels
DROP TRIGGER IF EXISTS on_new_mutual_match ON matches;
CREATE TRIGGER on_new_mutual_match
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_match();

-- Trigger pour notifier les nouveaux messages
DROP TRIGGER IF EXISTS on_new_message ON messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Trigger pour notifier la famille lors des reviews
DROP TRIGGER IF EXISTS on_family_review ON family_reviews;
CREATE TRIGGER on_family_review
  AFTER INSERT OR UPDATE ON family_reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_family_review();

-- Trigger pour notifier la famille en cas de problème de contenu
DROP TRIGGER IF EXISTS on_moderation_issue ON moderation_logs;
CREATE TRIGGER on_moderation_issue
  AFTER INSERT ON moderation_logs
  FOR EACH ROW
  EXECUTE FUNCTION notify_family_of_content_issue();

-- Trigger pour gérer les nouveaux utilisateurs complètement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_complete();

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_islamic_preferences_updated_at ON islamic_preferences;
CREATE TRIGGER update_islamic_preferences_updated_at
  BEFORE UPDATE ON islamic_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();