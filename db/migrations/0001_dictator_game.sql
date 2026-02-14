CREATE TABLE IF NOT EXISTS experiment_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_token_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dictator_game_responses (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES experiment_sessions(id) ON DELETE CASCADE,
  experiment_slug TEXT NOT NULL DEFAULT 'dictator-game-v1',
  amount_given SMALLINT NOT NULL CHECK (amount_given BETWEEN 0 AND 100 AND amount_given % 5 = 0),
  amount_kept SMALLINT NOT NULL CHECK (amount_kept BETWEEN 0 AND 100 AND amount_kept % 5 = 0),
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

CREATE INDEX IF NOT EXISTS idx_dictator_game_responses_experiment_slug
  ON dictator_game_responses (experiment_slug);

CREATE INDEX IF NOT EXISTS idx_dictator_game_responses_created_at
  ON dictator_game_responses (created_at DESC);
