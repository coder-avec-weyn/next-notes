-- Add unique constraint to username column (if not exists)
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Add public_profile column to users table (if not exists)
ALTER TABLE users ADD COLUMN public_profile BOOLEAN DEFAULT true;

-- Add is_public column to notes table (if not exists)
ALTER TABLE notes ADD COLUMN is_public BOOLEAN DEFAULT false;

-- Create indexes for better search performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_name ON users (name);
CREATE INDEX IF NOT EXISTS idx_users_public_profile ON users (public_profile);
CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes (is_public);
