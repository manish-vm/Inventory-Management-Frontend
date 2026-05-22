const typeOf = (question) => question.responseType || question.type || 'text';
const textOf = (question) => question.questionText || question.label || question.question || '';
const idOf = (question, index, prefix = 'question') => question.questionId || question.id || `${prefix}-${index}`;
const optionValue = (option) => option.value || option.label || '';
const selectedValues = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const DynamicInspectionForm = ({ forms = [], values, onChange }) => {
  const update = (question, index, answer, prefix) => {
    const questionId = idOf(question, index, prefix);
    onChange({
      ...values,
      [questionId]: {
        questionId,
        question: textOf(question),
        type: typeOf(question),
        answer
      }
    });
  };

  const renderConditionalChildren = (question, selected, level, prefix) =>
    (question.options || [])
      .filter((option) => selected.includes(optionValue(option)))
      .flatMap((option, optionIndex) =>
        (option.subQuestions || []).map((subQuestion, subIndex) =>
          renderQuestion(
            subQuestion,
            subIndex,
            level + 1,
            `${prefix}-${optionIndex}`,
            option.label || option.value
          )
        )
      );

  const renderQuestion = (question, index, level = 0, prefix = 'question', branchLabel = '') => {
    const questionId = idOf(question, index, prefix);
    const value = values[questionId]?.answer ?? '';
    const type = typeOf(question);
    const options = question.options || [];
    const selected = selectedValues(value);

    return (
      <div
        key={questionId}
        className={`relative rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 ${
          level > 0 ? 'ml-5 border-l-4 border-l-blue-300 dark:border-l-blue-800' : ''
        }`}
      >
        {branchLabel && (
          <p className="mb-2 text-xs font-semibold uppercase text-blue-600 dark:text-blue-300">
            Shows when: {branchLabel}
          </p>
        )}

        <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
          {textOf(question)}
          {question.required && <span className="text-red-500"> *</span>}
        </label>

        {(type === 'text' || type === 'remarks') && (
          <textarea
            value={value}
            onChange={(e) => update(question, index, e.target.value, prefix)}
            rows={type === 'remarks' ? 3 : 2}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
        )}

        {type === 'number' && (
          <input
            type="number"
            value={value}
            onChange={(e) => update(question, index, e.target.value, prefix)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
        )}

        {type === 'date' && (
          <input
            type="date"
            value={value}
            onChange={(e) => update(question, index, e.target.value, prefix)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
        )}

        {type === 'dropdown' && (
          <select
            value={value}
            onChange={(e) => update(question, index, e.target.value, prefix)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="">Select</option>
            {options.map((option) => (
              <option key={optionValue(option)} value={optionValue(option)}>
                {option.label || option.value}
              </option>
            ))}
          </select>
        )}

        {type === 'radio' && (
          <div className="flex flex-wrap gap-3">
            {options.map((option) => {
              const valueForOption = optionValue(option);
              return (
                <label key={valueForOption} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name={questionId}
                    checked={value === valueForOption}
                    onChange={() => update(question, index, valueForOption, prefix)}
                  />
                  {option.label || option.value}
                </label>
              );
            })}
          </div>
        )}

        {type === 'checkbox' && (
          <div className="flex flex-wrap gap-3">
            {options.map((option) => {
              const valueForOption = optionValue(option);
              return (
                <label key={valueForOption} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={selected.includes(valueForOption)}
                    onChange={(e) => {
                      update(
                        question,
                        index,
                        e.target.checked
                          ? [...selected, valueForOption]
                          : selected.filter((item) => item !== valueForOption),
                        prefix
                      );
                    }}
                  />
                  {option.label || option.value}
                </label>
              );
            })}
          </div>
        )}

        {renderConditionalChildren(question, selected, level, questionId)}
      </div>
    );
  };

  if (forms.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
        No admin-created inspection form is assigned to this product stage.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {forms.map((form) => (
        <section key={form.formId} className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{form.formName}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">This form was configured by Admin for the current product stage.</p>
          </div>
          <div className="grid gap-3">
            {(form.questions || []).map((question, index) => renderQuestion(question, index))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default DynamicInspectionForm;
