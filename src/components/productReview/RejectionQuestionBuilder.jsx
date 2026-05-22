import { ClipboardList, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import QuestionCard from './QuestionCard';

const newQuestion = () => ({
  questionId: uuidv4(),
  questionText: '',
  responseType: 'dropdown',
  options: []
});

const RejectionQuestionBuilder = ({ enabled, onEnable, questions = [], setQuestions }) => {
  const addQuestion = () => {
    setQuestions([...questions, newQuestion()]);
  };

  if (!enabled) {
    return (
      <div className="rounded-lg border border-dashed border-red-300 bg-red-50/60 p-5 dark:border-red-900 dark:bg-red-900/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-red-100 p-2 text-red-700 dark:bg-red-900/40 dark:text-red-300">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Rejected Track Questionnaire</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Capture rejection reasons and conditional details from the shop floor.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onEnable}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            Create Rejection Questionnaire
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Rejection Questionnaire Builder</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Add parent questions, then attach nested dependencies to specific answer choices.
          </p>
        </div>
        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add Parent Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
          No rejection questions configured yet.
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
    </div>
  );
};

export default RejectionQuestionBuilder;
