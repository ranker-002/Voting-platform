/*
  # Create elections and options tables

  1. New Tables
    - `elections`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `start_date` (timestamp)
      - `end_date` (timestamp)
      - `status` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `election_options`
      - `id` (uuid, primary key)
      - `election_id` (uuid, references elections)
      - `title` (text)
      - `description` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for reading and managing elections
*/

CREATE TABLE IF NOT EXISTS elections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'closed')),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS election_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid REFERENCES elections(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_options ENABLE ROW LEVEL SECURITY;

-- Policies for elections
CREATE POLICY "Everyone can read elections"
  ON elections
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can create elections"
  ON elections
  FOR INSERT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update elections"
  ON elections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies for election options
CREATE POLICY "Everyone can read election options"
  ON election_options
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage election options"
  ON election_options
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );