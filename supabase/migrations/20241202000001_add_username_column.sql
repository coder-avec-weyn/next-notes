ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

COMMENT ON COLUMN users.username IS 'Unique username for the user';
