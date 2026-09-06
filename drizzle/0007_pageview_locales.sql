-- Anonymous language signal on the existing pageview beacon: which locale we
-- served, and the base tag of the browser's preferred language. No identifier,
-- no IP, no region — enough to rank languages worth translating, nothing more.
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "site_locale" text;
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "browser_locale" text;
