-- Site language a Watch trial was started from: picks the e-mail language and the /pro page the
-- verification link lands on. Existing rows (English pages) keep the default.
ALTER TABLE trials ADD COLUMN lang TEXT NOT NULL DEFAULT 'en';
