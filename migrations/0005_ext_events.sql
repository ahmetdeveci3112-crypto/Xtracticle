-- Anonymous daily counters for the browser extension and the /saved page (POST /api/ext/event,
-- src/shared/ext.ts; docs/chrome-extension-plan.md A6). Additive only.
-- One row per day × surface × event × kept parameter × extension version; n is the count.
-- No IP, license, account, URL or post id is stored.
CREATE TABLE IF NOT EXISTS ext_events (
  day     TEXT    NOT NULL,              -- UTC date, YYYY-MM-DD
  surface TEXT    NOT NULL,              -- 'ext' (x.com, popup) or 'web' (/saved)
  name    TEXT    NOT NULL,              -- COUNTER_EVENTS in src/shared/events.ts
  param   TEXT    NOT NULL DEFAULT '',   -- the event's one kept parameter value, or ''
  version TEXT    NOT NULL DEFAULT '',   -- extension version, or ''
  n       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, surface, name, param, version)
);
