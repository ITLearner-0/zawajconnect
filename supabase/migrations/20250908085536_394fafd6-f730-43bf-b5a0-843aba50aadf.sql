-- Enable leaked password protection for better security
-- This helps prevent users from using commonly leaked passwords
UPDATE auth.config 
SET leaked_password_protection = true 
WHERE id = 1;