-- These are the commands I used to create tables in Turso

-- Create user table
CREATE TABLE
  user (
    id TEXT PRIMARY KEY DEFAULT (LOWER(HEX(RANDOMBLOB(16)))),
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT,
    is_email_verified INTEGER NOT NULL DEFAULT 0,
    provider TEXT,
    provider_id TEXT
);

-- Create email_verification table
CREATE TABLE
  email_verification (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    code TEXT NOT NULL,
    sent_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id)
  );

-- Create session table
CREATE TABLE
  session (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id)
  );

CREATE TABLE
  oauth_account (
    id TEXT PRIMARY KEY DEFAULT (HEX(RANDOMBLOB(16))),
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id)
);