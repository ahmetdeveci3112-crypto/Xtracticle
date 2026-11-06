-- Xtracticle Pro "Watch": account monitoring. Applied with
--   npx wrangler d1 migrations apply xtracticle-watch --local   (dev)
--   npx wrangler d1 migrations apply xtracticle-watch --remote  (production, owner)
-- All timestamps are ISO 8601 UTC strings (lexicographically ordered). Handles are stored lower-case.
-- License keys never appear here: key_hash is an HMAC of the key (see src/shared/watch/db.ts).

CREATE TABLE watches (
  id TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL,
  handle TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('deleted', 'new', 'both')),
  email TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  feed_token TEXT NOT NULL UNIQUE,
  unsub_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  last_polled_at TEXT,
  fail_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'protected', 'gone')),
  UNIQUE (key_hash, handle)
);
CREATE INDEX watches_handle ON watches (handle);
CREATE INDEX watches_poll ON watches (status, last_polled_at);

-- The latest ~40 own posts of every watched handle, shared by all its watchers.
-- Rows whose last_seen_at is older than 90 days are pruned by the cron.
CREATE TABLE snapshots (
  handle TEXT NOT NULL,
  post_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT,
  media_json TEXT,
  -- The post this one replies to when it is part of the account's own thread.
  parent_id TEXT,
  author_name TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  PRIMARY KEY (handle, post_id)
);
CREATE INDEX snapshots_seen ON snapshots (last_seen_at);

-- What was detected, per handle. payload_json holds the post as last seen (deleted/new).
-- Rows older than 90 days (detected_at) are pruned by the cron.
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  handle TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deleted', 'new', 'protected', 'gone', 'renamed')),
  post_id TEXT,
  payload_json TEXT NOT NULL,
  detected_at TEXT NOT NULL
);
CREATE INDEX events_handle ON events (handle, detected_at);
CREATE INDEX events_detected ON events (detected_at);
-- A post is reported deleted (or new) once, even if a poll is interrupted and repeated.
CREATE UNIQUE INDEX events_post ON events (handle, type, post_id) WHERE post_id IS NOT NULL;

CREATE TABLE notifications (
  watch_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email')),
  sent_at TEXT NOT NULL,
  PRIMARY KEY (watch_id, event_id, channel)
);

-- Opt-out list. Adding a handle here (see docs/watch-api.md) pauses its watches and deletes its data.
CREATE TABLE blocklist (
  handle TEXT PRIMARY KEY,
  reason TEXT,
  created_at TEXT NOT NULL
);

-- Double opt-in tokens for e-mail notifications.
CREATE TABLE email_tokens (
  token TEXT PRIMARY KEY,
  watch_id TEXT NOT NULL,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX email_tokens_watch ON email_tokens (watch_id);

-- Cron bookkeeping (last digest date, last prune time).
CREATE TABLE meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
