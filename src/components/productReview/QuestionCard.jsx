import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CHOICE_TYPES = ['dropdown', 'radio', 'checkbox'];

const QuestionCard = ({ question, onChange, onRemove, level = 0, branchLabel }) => {
  const isSubQuestion = level > 0;
  const isChoiceType = CHOICE_TYPES.includes(question.responseType);
  const optionsLocked = Boolean(question.optionsLocked || question.optionsSource);

  const updateQuestion = (patch) => {
    const next = { ...question, ...patch };
    if (patch.responseType === 'text') {
      next.options = [];
    }
    onChange(next);
  };

  const updateOption = (optionId, patch) => {
    updateQuestion({
      options: (question.options || []).map((option) =>
        option.optionId === optionId
          ? {
              ...option,
              ...patch,
              value: patch.label !== undefined ? patch.label : option.value
            }
          : option
      )
    });
  };

  const addOption = () => {
    updateQuestion({
      options: [
        ...(question.options || []),
        {
          optionId: uuidv4(),
          label: '',
          value: '',
          subQuestions: []
        }
      ]
    });
  };

  const removeOption = (optionId) => {
    updateQuestion({
      options: (question.options || []).filter((option) => option.optionId !== optionId)
    });
  };

  const addSubQuestion = (optionId) => {
    updateQuestion({
      options: (question.options || []).map((option) =>
        option.optionId === optionId
          ? {
              ...option,
              subQuestions: [
                ...(option.subQuestions || []),
                {
                  questionId: uuidv4(),
                  questionText: '',
                  responseType: 'text',
                  options: []
                }
              ]
            }
          : option
      )
    });
  };

  const updateSubQuestions = (optionId, subQuestions) => {
    updateQuestion({
      options: (question.options || []).map((option) =>
        option.optionId === optionId ? { ...option, subQuestions } : option
      )
    });
  };

  return (
    <div className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {level > 0 && (
        <div className="absolute -left-5 top-8 h-px w-5 bg-slate-300 dark:bg-slate-600" />
      )}

      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {branchLabel && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
              Shows when: {branchLabel}
            </p>
          )}
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {level === 0 ? 'Parent Question' : 'Sub-Question'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          aria-label="Remove question"
          title="Remove question"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className={`grid gap-4 ${isSubQuestion ? '' : 'md:grid-cols-[1fr_220px]'}`}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Question Text</span>
          <input
            type="text"
            value={question.questionText || ''}
            onChange={(e) => updateQuestion({ questionText: e.target.value })}
            placeholder="Which component failed quality control?"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </label>

        {!isSubQuestion && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Response Type</span>
            <select
              value={question.responseType || 'text'}
              onChange={(e) => updateQuestion({ responseType: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            >
              <option value="dropdown">Dropdown</option>
              <option value="radio">Multiple Choice (Radio)</option>
              <option value="checkbox">Checkbox</option>
              <option value="text">Empty Text Box</option>
            </select>
          </label>
        )}
      </div>

      {!isSubQuestion && isChoiceType && (
        <div className="mt-5 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Answer Options</p>
            {optionsLocked ? (
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
                Auto from report sheet
              </span>
            ) : (
              <button
                type="button"
                onClick={addOption}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Plus className="h-4 w-4" />
                Add Option
              </button>
            )}
          </div>

          <div className="space-y-4">
            {(question.options || []).map((option, optionIndex) => (
              <div key={option.optionId || optionIndex} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={option.label || ''}
                    onChange={(e) => updateOption(option.optionId, { label: e.target.value })}
                    placeholder={`Option ${optionIndex + 1}`}
                    readOnly={optionsLocked}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 read-only:bg-slate-100 read-only:font-medium dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:read-only:bg-slate-950"
                  />
                  {!optionsLocked && (
                    <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => addSubQuestion(option.optionId)}
                      className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 dark:border-primary-800 dark:text-primary-300 dark:hover:bg-primary-900/20"
                    >
                      <Plus className="h-4 w-4" />
                      Add Sub-Question
                    </button>
                    <button
                      type="button"
                      onClick={() => removeOption(option.optionId)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      aria-label="Remove option"
                      title="Remove option"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  )}
                </div>

                {(option.subQuestions || []).length > 0 && (
                  <div className="mt-4 border-l-2 border-slate-300 pl-5 dark:border-slate-600">
                    <div className="space-y-4">
                      {option.subQuestions.map((subQuestion, subIndex) => (
                        <QuestionCard
                          key={subQuestion.questionId || subIndex}
                          question={subQuestion}
                          level={level + 1}
                          branchLabel={option.label || `Option ${optionIndex + 1}`}
                          onChange={(updatedSubQuestion) => {
                            const nextSubQuestions = [...option.subQuestions];
                            nextSubQuestions[subIndex] = updatedSubQuestion;
                            updateSubQuestions(option.optionId, nextSubQuestions);
                          }}
                          onRemove={() => {
                            updateSubQuestions(
                              option.optionId,
                              option.subQuestions.filter((_, currentIndex) => currentIndex !== subIndex)
                            );
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
