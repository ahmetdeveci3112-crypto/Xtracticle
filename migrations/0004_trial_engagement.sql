-- Watch trial engagement e-mails and the "resend confirmation" endpoint (docs/watch-api.md, "Trial"). Additive only.
-- welcome_sent_at: the "Watch is on" e-mail after verification; checkin_sent_at: the day-7 check-in.
-- verify_sent_at / verify_sends: last time and number of verification e-mails sent for a pending request
-- (POST /api/watch/trial/resend waits 2 minutes between sends and stops at 3). Rows created before this
-- migration have NULL timestamps and count as one send.
ALTER TABLE trials ADD COLUMN welcome_sent_at TEXT;
ALTER TABLE trials ADD COLUMN checkin_sent_at TEXT;
ALTER TABLE trials ADD COLUMN verify_sent_at TEXT;
ALTER TABLE trials ADD COLUMN verify_sends INTEGER NOT NULL DEFAULT 1;
