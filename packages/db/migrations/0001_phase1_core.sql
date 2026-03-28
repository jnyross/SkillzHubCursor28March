CREATE TYPE project_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE skill_version_status AS ENUM ('draft', 'frozen', 'accepted', 'superseded', 'abandoned');
CREATE TYPE eval_set_status AS ENUM ('draft', 'frozen');
CREATE TYPE assertion_type AS ENUM ('file_exists', 'text_contains', 'regex_match', 'llm_graded');
CREATE TYPE iteration_status AS ENUM ('draft', 'queued', 'running', 'reviewing', 'completed', 'failed');
CREATE TYPE run_status AS ENUM ('queued', 'running', 'succeeded', 'failed', 'canceled');
CREATE TYPE run_config AS ENUM ('with_skill', 'without_skill', 'old_skill');
CREATE TYPE comparable_pair_status AS ENUM ('pending', 'comparable', 'graded', 'excluded');
CREATE TYPE blind_review_label AS ENUM ('candidate_a', 'candidate_b');

CREATE TABLE projects (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status project_status NOT NULL DEFAULT 'draft',
  owner_user_id text NOT NULL,
  brief_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  brief_approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE skills (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  name text NOT NULL,
  slug text NOT NULL,
  current_draft_version_id text,
  accepted_version_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, slug)
);

CREATE TABLE skill_versions (
  id text PRIMARY KEY,
  skill_id text NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  version_number integer NOT NULL,
  status skill_version_status NOT NULL DEFAULT 'draft',
  base_version_id text,
  frontmatter_name text NOT NULL,
  frontmatter_description text NOT NULL,
  bundle_hash text NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (skill_id, version_number)
);

CREATE TABLE skill_files (
  id text PRIMARY KEY,
  skill_version_id text NOT NULL REFERENCES skill_versions(id) ON DELETE RESTRICT,
  path text NOT NULL,
  kind text NOT NULL,
  storage_uri text NOT NULL,
  sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (skill_version_id, path)
);

CREATE TABLE eval_sets (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  name text NOT NULL,
  status eval_set_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE eval_cases (
  id text PRIMARY KEY,
  eval_set_id text NOT NULL REFERENCES eval_sets(id) ON DELETE RESTRICT,
  slug text NOT NULL,
  prompt text NOT NULL,
  expected_output text NOT NULL DEFAULT '',
  files_manifest_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (eval_set_id, slug)
);

CREATE TABLE assertions (
  id text PRIMARY KEY,
  eval_case_id text NOT NULL REFERENCES eval_cases(id) ON DELETE RESTRICT,
  text text NOT NULL,
  type assertion_type NOT NULL,
  config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_quantitative boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE iterations (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  number integer NOT NULL,
  skill_version_id text NOT NULL REFERENCES skill_versions(id) ON DELETE RESTRICT,
  baseline_skill_version_id text,
  eval_set_id text NOT NULL REFERENCES eval_sets(id) ON DELETE RESTRICT,
  template_hash text NOT NULL,
  model_config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  tool_config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  status iteration_status NOT NULL DEFAULT 'draft',
  total_pairs integer NOT NULL DEFAULT 0,
  graded_pair_count integer NOT NULL DEFAULT 0,
  reviewed_at timestamptz,
  review_notes text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, number)
);

CREATE TABLE iteration_eval_snapshots (
  id text PRIMARY KEY,
  iteration_id text NOT NULL REFERENCES iterations(id) ON DELETE RESTRICT,
  eval_case_id text NOT NULL REFERENCES eval_cases(id) ON DELETE RESTRICT,
  prompt_snapshot text NOT NULL,
  expected_output_snapshot text NOT NULL,
  assertions_snapshot_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  snapshot_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (iteration_id, eval_case_id)
);

CREATE TABLE runs (
  id text PRIMARY KEY,
  iteration_id text NOT NULL REFERENCES iterations(id) ON DELETE RESTRICT,
  eval_snapshot_id text NOT NULL REFERENCES iteration_eval_snapshots(id) ON DELETE RESTRICT,
  config run_config NOT NULL,
  status run_status NOT NULL DEFAULT 'queued',
  provider text NOT NULL DEFAULT 'claude-code',
  model_id text NOT NULL,
  template_hash text NOT NULL,
  skill_mode run_config NOT NULL,
  skill_bundle_hash text,
  total_tokens integer,
  duration_ms integer,
  total_cost_usd numeric(10, 4),
  artifact_storage_uri text,
  manifest_hash text,
  transcript_uri text,
  failure_reason text,
  lineage_parent_run_id text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE grades (
  id text PRIMARY KEY,
  run_id text NOT NULL UNIQUE REFERENCES runs(id) ON DELETE RESTRICT,
  grader_version text NOT NULL,
  grading_json jsonb NOT NULL DEFAULT '{"expectations":[]}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE comparable_pairs (
  id text PRIMARY KEY,
  iteration_id text NOT NULL REFERENCES iterations(id) ON DELETE RESTRICT,
  eval_snapshot_id text NOT NULL REFERENCES iteration_eval_snapshots(id) ON DELETE RESTRICT,
  primary_run_id text NOT NULL UNIQUE REFERENCES runs(id) ON DELETE RESTRICT,
  baseline_run_id text NOT NULL UNIQUE REFERENCES runs(id) ON DELETE RESTRICT,
  template_hash text NOT NULL,
  status comparable_pair_status NOT NULL DEFAULT 'pending',
  candidate_a_run_id text NOT NULL REFERENCES runs(id) ON DELETE RESTRICT,
  candidate_b_run_id text NOT NULL REFERENCES runs(id) ON DELETE RESTRICT,
  revealed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (iteration_id, eval_snapshot_id)
);

CREATE TABLE benchmarks (
  id text PRIMARY KEY,
  iteration_id text NOT NULL UNIQUE REFERENCES iterations(id) ON DELETE RESTRICT,
  benchmark_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  benchmark_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  id text PRIMARY KEY,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  event_type text NOT NULL,
  actor_user_id text NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE skill_versions
  ADD CONSTRAINT skill_versions_base_version_fk
  FOREIGN KEY (base_version_id) REFERENCES skill_versions(id) ON DELETE RESTRICT;

ALTER TABLE skills
  ADD CONSTRAINT skills_current_draft_version_fk
  FOREIGN KEY (current_draft_version_id) REFERENCES skill_versions(id) ON DELETE RESTRICT,
  ADD CONSTRAINT skills_accepted_version_fk
  FOREIGN KEY (accepted_version_id) REFERENCES skill_versions(id) ON DELETE RESTRICT;

ALTER TABLE runs
  ADD CONSTRAINT runs_lineage_parent_fk
  FOREIGN KEY (lineage_parent_run_id) REFERENCES runs(id) ON DELETE RESTRICT;

CREATE UNIQUE INDEX unique_active_draft_skill_version
  ON skill_versions(skill_id)
  WHERE status = 'draft';

CREATE UNIQUE INDEX unique_accepted_skill_version
  ON skill_versions(skill_id)
  WHERE status = 'accepted';

CREATE INDEX idx_skill_versions_lookup ON skill_versions(skill_id, version_number DESC);
CREATE INDEX idx_iterations_project ON iterations(project_id, number DESC);
CREATE INDEX idx_runs_iteration ON runs(iteration_id, status);
CREATE INDEX idx_runs_snapshot ON runs(eval_snapshot_id, config, status);
CREATE INDEX idx_pairs_iteration ON comparable_pairs(iteration_id, status);
CREATE INDEX idx_audit_entity ON audit_events(entity_type, entity_id, created_at DESC);
