const selectedValues = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const EmployeeReviewRenderer = ({ questions = [], answers = {}, setAnswers }) => {
  const updateAnswer = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const renderChildQuestions = (question, selected) =>
    (question.options || [])
      .filter((option) => selected.includes(option.value))
      .flatMap((option) => option.subQuestions || [])
      .map((subQuestion) => renderQuestion(subQuestion, true));

  const renderQuestion = (question, nested = false) => {
    const answer = answers[question.questionId];
    const selected = selectedValues(answer);

    return (
      <div
        key={question.questionId}
        className={`${nested ? 'ml-5 border-l-2 border-slate-300 pl-5 dark:border-slate-600' : ''} mb-4 rounded-lg bg-white p-4 shadow-sm dark:bg-slate-800`}
      >
        <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">{question.questionText}</p>

        {question.responseType === 'text' && (
          <input
            type="text"
            value={answer || ''}
            onChange={(e) => updateAnswer(question.questionId, e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
        )}

        {question.responseType === 'dropdown' && (
          <select
            value={answer || ''}
            onChange={(e) => updateAnswer(question.questionId, e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="">Select an answer</option>
            {(question.options || []).map((option) => (
              <option key={option.optionId || option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {question.responseType === 'radio' && (
          <div className="space-y-2">
            {(question.options || []).map((option) => (
              <label key={option.optionId || option.value} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name={question.questionId}
                  value={option.value}
                  checked={answer === option.value}
                  onChange={(e) => updateAnswer(question.questionId, e.target.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        )}

        {question.responseType === 'checkbox' && (
          <div className="space-y-2">
            {(question.options || []).map((option) => (
              <label key={option.optionId || option.value} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selected, option.value]
                      : selected.filter((value) => value !== option.value);
                    updateAnswer(question.questionId, next);
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
        )}

        {renderChildQuestions(question, selected)}
      </div>
    );
  };

  return <div>{questions.map((question) => renderQuestion(question))}</div>;
};

export default EmployeeReviewRenderer;
