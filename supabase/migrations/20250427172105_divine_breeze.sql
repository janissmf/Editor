/*
  # Create nodes table

  1. New Tables
    - `nodes`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `label` (text)
      - `description` (text, nullable)
      - `parent_id` (uuid, foreign key to nodes.id)
      - `is_expanded` (boolean)

  2. Security
    - Enable RLS on `nodes` table
    - Add policies for authenticated users to perform CRUD operations
*/

-- Create nodes table
CREATE TABLE IF NOT EXISTS nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  label text NOT NULL,
  description text,
  parent_id uuid REFERENCES nodes(id) ON DELETE CASCADE,
  is_expanded boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow select for authenticated users" ON nodes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow insert for authenticated users" ON nodes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON nodes
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete for authenticated users" ON nodes
  FOR DELETE TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS nodes_parent_id_idx ON nodes(parent_id);
CREATE INDEX IF NOT EXISTS nodes_created_at_idx ON nodes(created_at);