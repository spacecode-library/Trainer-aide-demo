import { ProgramGeneratorWizard } from '@/components/ai-programs/ProgramGeneratorWizard';

export default function NewProgramPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ProgramGeneratorWizard />
      </div>
    </div>
  );
}
