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

-- Resume table with personal info
CREATE TABLE resume (
    id TEXT PRIMARY KEY DEFAULT (HEX(RANDOMBLOB(16))),
    user_id TEXT NOT NULL,
    resume_title TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    summary TEXT,
    github TEXT,
    linkedin TEXT,
    portfolio TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Section configuration and metadata
CREATE TABLE resume_section (
    id TEXT PRIMARY KEY DEFAULT (HEX(RANDOMBLOB(16))),
    resume_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL,
    allow_multiple INTEGER DEFAULT 0,
    min_items INTEGER,
    max_items INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (resume_id) REFERENCES resume(id) ON DELETE CASCADE
);

-- Field definitions
CREATE TABLE resume_section_field (
    id TEXT PRIMARY KEY DEFAULT (HEX(RANDOMBLOB(16))),
    section_id TEXT NOT NULL,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('text', 'date', 'textarea', 'link')),
    required INTEGER DEFAULT 0,
    full_width INTEGER DEFAULT 1,
    placeholder TEXT,
    list_type TEXT CHECK(list_type IN ('text', 'date', 'textarea', 'link')),
    display_order INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (section_id) REFERENCES resume_section(id) ON DELETE CASCADE
);

-- Section items (entries)
CREATE TABLE resume_section_item (
    id TEXT PRIMARY KEY DEFAULT (HEX(RANDOMBLOB(16))),
    section_id TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (section_id) REFERENCES resume_section(id) ON DELETE CASCADE
);

-- Field values
CREATE TABLE resume_section_field_value (
    id TEXT PRIMARY KEY DEFAULT (HEX(RANDOMBLOB(16))),
    section_item_id TEXT NOT NULL,
    field_id TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (section_item_id) REFERENCES resume_section_item(id) ON DELETE CASCADE,
    FOREIGN KEY (field_id) REFERENCES resume_section_field(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_resume_user ON resume(user_id);
CREATE INDEX idx_section_resume ON resume_section(resume_id);
CREATE INDEX idx_section_item_section ON resume_section_item(section_id);
CREATE INDEX idx_field_section ON resume_section_field(section_id);
CREATE INDEX idx_field_value_item ON resume_section_field_value(section_item_id);
CREATE INDEX idx_field_value_field ON resume_section_field_value(field_id);
CREATE INDEX idx_section_display_order ON resume_section(display_order);
CREATE INDEX idx_field_display_order ON resume_section_field(display_order);
CREATE INDEX idx_item_display_order ON resume_section_item(display_order);

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