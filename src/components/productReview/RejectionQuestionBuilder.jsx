import { Copy, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import QuestionCard from './QuestionCard';

const newQuestion = () => ({
  questionId: uuidv4(),
  questionText: '',
  responseType: 'dropdown',
  options: []
});

const RejectionQuestionBuilder = ({
  enabled,
  onEnable,
  questions = [],
  setQuestions,
  title = 'Rejection Questionnaire Builder',
  emptyMessage = 'No rejection questions configured yet.',
  onSave,
  saving = false,
  saveLabel = 'Save Questionnaire',
  autoOptionGroups = [],
  onCopy,
  copyLabel = ''
}) => {
  const addQuestion = () => {
    setQuestions([...questions, newQuestion()]);
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Add parent questions. Sheet-derived answer options are filled automatically when available.
          </p>
          {autoOptionGroups.length > 0 && (
            <p className="mt-1 text-xs font-medium text-primary-700 dark:text-primary-300">
              {autoOptionGroups.length} Assembly Process option(s) loaded from the report sheet.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {onCopy && (
            <button
              type="button"
              onClick={onCopy}
              disabled={questions.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-100"
            >
              <Copy className="h-4 w-4" />
              {copyLabel || 'Copy Questionnaire'}
            </button>
          )}
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Add Parent Question
          </button>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.questionId || index}
              question={question}
              onChange={(updatedQuestion) => {
                const nextQuestions = [...questions];
                nextQuestions[index] = updatedQuestion;
                setQuestions(nextQuestions);
              }}
              onRemove={() => setQuestions(questions.filter((_, currentIndex) => currentIndex !== index))}
            />
          ))}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {saving ? 'Saving...' : saveLabel}
        </button>
      </div>
    </div>
  );
};

export default RejectionQuestionBuilder;
