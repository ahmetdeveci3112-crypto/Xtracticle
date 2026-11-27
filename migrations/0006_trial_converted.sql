-- Watch trial → Pro conversion (docs/reports/watch-trial-conversion-2026-11-27.md). Additive only.
-- When a Gumroad license is verified (POST /api/pro/activate or the daily /api/pro/me recheck), the buyer's
-- e-mail is hashed with hashTrialEmail and matched against trials.email_hash, which outlives the trial.
-- The address itself is never stored here. Set once, on the first match.
--   converted_at:   first time a valid Pro license with this trial's address was seen
--   converted_plan: monthly / yearly / lifetime
--   purchased_at:   Gumroad sale_timestamp of that license (compare with created_at / ended_at)
ALTER TABLE trials ADD COLUMN converted_at TEXT;
ALTER TABLE trials ADD COLUMN converted_plan TEXT;
ALTER TABLE trials ADD COLUMN purchased_at TEXT;
