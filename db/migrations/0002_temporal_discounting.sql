CREATE TABLE IF NOT EXISTS temporal_discounting_responses (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES experiment_sessions(id) ON DELETE CASCADE,
  experiment_slug TEXT NOT NULL DEFAULT 'temporal-discounting-v1',
  donation_timing TEXT NOT NULL CHECK (donation_timing IN ('sooner', 'later')),
  age_range TEXT NOT NULL,
  gender_identity TEXT NOT NULL,
  country_or_region TEXT NOT NULL,
  education_level TEXT NOT NULL,
  employment_status TEXT NOT NULL,
  income_range TEXT NOT NULL,
  browser_language TEXT,
  timezone_offset_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, experiment_slug)
);

CREATE INDEX IF NOT EXISTS idx_temporal_discounting_responses_experiment_slug
  ON temporal_discounting_responses (experiment_slug);

CREATE INDEX IF NOT EXISTS idx_temporal_discounting_responses_created_at
  ON temporal_discounting_responses (created_at DESC);
