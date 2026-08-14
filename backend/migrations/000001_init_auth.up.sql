CREATE TYPE role AS ENUM ('user', 'admin');

CREATE TABLE users (
  id text PRIMARY KEY NOT NULL,
  phone_number text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  email_verified boolean DEFAULT false NOT NULL,
  image text,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  role role DEFAULT 'user' NOT NULL
);

CREATE TABLE sessions (
  id text PRIMARY KEY NOT NULL,
  expires_at timestamp NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  ip_address text,
  user_agent text,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX sessions_user_id_idx ON sessions (user_id);

CREATE TABLE accounts (
  id text PRIMARY KEY NOT NULL,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamp,
  refresh_token_expires_at timestamp,
  scope text,
  password text,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX accounts_user_id_idx ON accounts (user_id);
