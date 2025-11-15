-- Add generation status tracking to ai_programs table
-- This allows background job processing for AI program generation

-- Add generation_status column
ALTER TABLE ai_programs
ADD COLUMN IF NOT EXISTS generation_status TEXT DEFAULT 'completed'
CHECK (generation_status IN ('generating', 'completed', 'failed'));

-- Add generation_error column for error messages
ALTER TABLE ai_programs
ADD COLUMN IF NOT EXISTS generation_error TEXT;

-- Create index for querying by status
CREATE INDEX IF NOT EXISTS idx_ai_programs_generation_status
ON ai_programs(generation_status)
WHERE generation_status != 'completed';

-- Add comment explaining the status field
COMMENT ON COLUMN ai_programs.generation_status IS
'Status of AI program generation: generating (in progress), completed (success), failed (error occurred)';

COMMENT ON COLUMN ai_programs.generation_error IS
'Error message if generation failed, null otherwise';
