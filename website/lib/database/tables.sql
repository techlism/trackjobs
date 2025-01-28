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

-- Generated Resume Table
CREATE TABLE generated_resume (
    id TEXT PRIMARY KEY,
    manual_resume_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    resume_title TEXT NOT NULL,
    resume_content TEXT NOT NULL,
    job_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (manual_resume_id) REFERENCES manual_resume(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (job_id) REFERENCES job_details(id)
);

CREATE TABLE manual_resume (
  id TEXT PRIMARY KEY DEFAULT (HEX(RANDOMBLOB(8))),
  user_id TEXT NOT NULL,
  resume_title TEXT NOT NULL,
  resume_content TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES user(id)
)

CREATE INDEX idx_manual_resume_user ON manual_resume(user_id);

-- Generated Resume Count Table
CREATE TABLE generated_resume_count (
    user_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES job_details(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_generated_resume_user ON generated_resume(user_id);
CREATE INDEX idx_generated_resume_job ON generated_resume(job_id);

CREATE TABLE job_details (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    company_name TEXT NOT NULL,
    job_description_summary TEXT NOT NULL,
    applied_on INTEGER NOT NULL,
    current_status TEXT NOT NULL CHECK(current_status IN ('Saved', 'Applied', 'OA/Assignment' , 'Interview', 'Offer', 'Rejected', 'Withdrawn', 'Other')),
    link TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES user(id),
    UNIQUE(user_id, link)
);