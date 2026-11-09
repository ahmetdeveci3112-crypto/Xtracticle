-- Xtracticle Pro "Watch" free trial (docs/watch-api.md, "Trial"). Additive: nothing in 0001 changes.
--   npx wrangler d1 migrations apply xtracticle-watch --local   (dev)
--   npx wrangler d1 migrations apply xtracticle-watch --remote  (production, owner)
-- A trial is one public X account watched for 14 days without a license. Its watch is an ordinary row in
-- `watches` whose key_hash is 'trial:' || trials.id (license hashes are hex, so the namespaces never meet).
-- email_hash is an HMAC of the lower-cased address and stays after the trial ends: one trial per address.
-- The plain address is kept only while the trial is pending or active (needed to send mail); it is set to
-- NULL when the trial ends or the address unsubscribes.

CREATE TABLE trials (
  id TEXT PRIMARY KEY,
  email_hash TEXT NOT NULL UNIQUE,
  email TEXT,
  handle TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('deleted', 'new', 'both')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'ended')),
  -- Double opt-in link (pending only); the request is deleted when it expires unverified.
  verify_token TEXT UNIQUE,
  verify_expires_at TEXT,
  -- Secret the trial user manages the trial with (sent in the e-mails).
  manage_token TEXT NOT NULL UNIQUE,
  -- Same value as the watch row's unsub_token, so the unsubscribe link keeps working after the watch is gone.
  unsub_token TEXT NOT NULL UNIQUE,
  watch_id TEXT,
  created_at TEXT NOT NULL,
  verified_at TEXT,
  expires_at TEXT,
  reminder_sent_at TEXT,
  ended_at TEXT,
  end_reason TEXT CHECK (end_reason IN ('expired', 'user'))
);
CREATE INDEX trials_status_expires ON trials (status, expires_at);
CREATE INDEX trials_watch ON trials (watch_id);
