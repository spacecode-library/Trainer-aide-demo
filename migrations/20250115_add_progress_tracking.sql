-- Add progress tracking fields to ai_programs table
-- This enables real-time progress updates during AI generation

ALTER TABLE ai_programs
ADD COLUMN IF NOT EXISTS progress_message TEXT;

ALTER TABLE ai_programs
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 0;

ALTER TABLE ai_programs
ADD COLUMN IF NOT EXISTS total_steps INTEGER DEFAULT 0;

ALTER TABLE ai_programs
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0
CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- Create index for querying in-progress generations
CREATE INDEX IF NOT EXISTS idx_ai_programs_progress
ON ai_programs(generation_status, progress_percentage)
WHERE generation_status = 'generating';

-- Add comment for documentation
COMMENT ON COLUMN ai_programs.progress_message IS 'Human-readable description of current generation step (e.g., "Generating week 1 (chunk 1/8)...")';
COMMENT ON COLUMN ai_programs.current_step IS 'Current step number in the generation process';
COMMENT ON COLUMN ai_programs.total_steps IS 'Total number of steps in the generation process';
COMMENT ON COLUMN ai_programs.progress_percentage IS 'Completion percentage from 0 to 100';
