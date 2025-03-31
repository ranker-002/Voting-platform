/*
  # Create votes table

  1. New Tables
    - `votes`
      - `id` (uuid, primary key)
      - `election_id` (uuid, references elections)
      - `option_id` (uuid, references election_options)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for vote management
    - Add unique constraint to prevent multiple votes
*/

CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid REFERENCES elections(id) ON DELETE CASCADE NOT NULL,
  option_id uuid REFERENCES election_options(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(election_id, user_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies for votes
CREATE POLICY "Users can read all votes"
  ON votes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote once per election"
  ON votes
  FOR INSERT
  TO authenticated
  USING (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM votes
      WHERE votes.election_id = election_id
      AND votes.user_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM elections
      WHERE elections.id = election_id
      AND elections.status = 'active'
    )
  );

-- Function to count votes for an option
CREATE OR REPLACE FUNCTION get_option_votes(option_id uuid)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM votes
  WHERE votes.option_id = $1;
$$;

-- Function to check if user has voted in an election
CREATE OR REPLACE FUNCTION has_user_voted(election_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM votes
    WHERE votes.election_id = $1
    AND votes.user_id = $2
  );
$$;