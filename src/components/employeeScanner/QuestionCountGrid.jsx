const typeOf = (question) => question.responseType || question.type || 'text';
const textOf = (question) => question.questionText || question.label || question.question || '';
const idOf = (question, index, prefix = 'question') => question.questionId || question.id || `${prefix}-${index}`;
const optionValue = (option) => option.value || option.label || '';
const selectedValues = (value) => (Array.isArray(value) ? value : value ? [value] : []);
const RESPONSE_COUNT_KEY = '__response__';

const normalizeCount = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

/**
 * Renders questionnaire UI where every answer type can capture a quantity.
 * Choice fields capture count per selected option; free-form fields capture one count per answer.
 */
const QuestionCountGrid = ({ forms = [], values, onChange }) => {
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

  const updateCount = (question, optionKey, count) => {
    const questionId = idOf(question, 0, 'question');
    // store per-question per-option counts under special key
    const countKey = `${questionId}::__count__::${optionKey}`;
    onChange({
      ...values,
      [countKey]: {
        questionId,
        question: textOf(question),
        type: 'count',
        optionKey,
        answer: normalizeCount(count)
      }
    });
  };

  const getCount = (question, optionKey) => {
    const questionId = idOf(question, 0, 'question');
    const countKey = `${questionId}::__count__::${optionKey}`;
    return normalizeCount(values?.[countKey]?.answer);
  };

  const renderQuestion = (question, index, level = 0, prefix = 'question', branchLabel = '') => {
    const questionId = idOf(question, index, prefix);
    const typeRaw = typeOf(question);
    const type = String(typeRaw ?? '').trim();
    const normalizedType = type.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

    const value = values?.[questionId]?.answer ?? (normalizedType === 'checkbox' ? [] : '');
    const options = question.options || [];
    const selected = selectedValues(value);

    const isMulti =
      [
        'checkbox',
        'checkbox group',
        'multiple choice',
        'multi select',
        'multiselect'
      ].includes(normalizedType) ||
      ['checkbox', 'checkbox group', 'multiSelect', 'multipleChoice'].some(
        (t) => t.toLowerCase() === typeRaw?.toString?.().toLowerCase?.()
      );

    const isSelect =
      [
        'dropdown',
        'select',
        'single select',
        'singleselect'
      ].includes(normalizedType) ||
      ['dropdown', 'select', 'singleSelect'].some(
        (t) => t.toLowerCase() === typeRaw?.toString?.().toLowerCase?.()
      );

    const isRadio =
      normalizedType === 'radio' ||
      type === 'radio';

    const hasOptions = options.length > 0;
    const isTextArea = ['textarea', 'long text', 'paragraph'].includes(normalizedType);

    const isSingle = isRadio || isSelect || (hasOptions && !isMulti);

    const renderCountInput = (optionKey) => (
      <input
        type="number"
        min={0}
        value={getCount(question, optionKey)}
        onChange={(e) => updateCount(question, optionKey, e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
        placeholder="Count"
      />
    );

    return (
      <div
        key={questionId}
        className={`rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 ${
          level > 0 ? 'ml-5 border-l-4 border-l-blue-300 dark:border-l-blue-800' : ''
        }`}
      >
        {branchLabel && (
          <p className="mb-2 text-xs font-semibold uppercase text-blue-600 dark:text-blue-300">Shows when: {branchLabel}</p>
        )}

        <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
          {textOf(question)}
          {question.required && <span className="text-red-500"> *</span>}
        </label>

        {hasOptions && !isSingle && (
          <div className="space-y-3">
            {options.map((option) => {
              const optionKey = optionValue(option);
              const checked = selected.includes(optionKey);
              return (
                <div key={optionKey} className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900/30">
                  <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const nextSelected = e.target.checked
                          ? [...selected, optionKey]
                          : selected.filter((v) => v !== optionKey);
                        update(question, index, nextSelected, prefix);
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{option.label || option.value}</div>
                      {checked && (
                        <div className="mt-2">
                          {renderCountInput(optionKey)}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        )}

        {hasOptions && isSingle && !isSelect && (
          <div className="space-y-2">
            {options.map((option) => {
              const optionKey = optionValue(option);
              const checked = selected.includes(optionKey);
              return (
                <div key={optionKey} className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900/30">
                  <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name={questionId}
                      checked={checked}
                      onChange={() => update(question, index, optionKey, prefix)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{option.label || option.value}</div>
                      {checked && (
                        <div className="mt-2">
                          {renderCountInput(optionKey)}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        )}

        {hasOptions && isSelect && (
          <div className="space-y-3">
            <select
              value={selected[0] || ''}
              onChange={(e) => update(question, index, e.target.value, prefix)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            >
              <option value="">Select option</option>
              {options.map((option) => {
                const optionKey = optionValue(option);
                return (
                  <option key={optionKey} value={optionKey}>
                    {option.label || option.value}
                  </option>
                );
              })}
            </select>
            {selected[0] && renderCountInput(selected[0])}
          </div>
        )}

        {!hasOptions && (
          <div className="space-y-3">
            {isTextArea ? (
              <textarea
                value={value}
                onChange={(e) => update(question, index, e.target.value, prefix)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
              />
            ) : (
              <input
                type={normalizedType === 'number' || normalizedType === 'numeric' ? 'number' : 'text'}
                value={value}
                onChange={(e) => update(question, index, e.target.value, prefix)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
              />
            )}
            {renderCountInput(RESPONSE_COUNT_KEY)}
          </div>
        )}
      </div>
    );
  };

  if (forms.length === 0) return null;

  return (
    <div className="space-y-5">
      {forms.map((form) => (
        <section key={form.formId} className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{form.formName}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Enter reason-wise counts.</p>
          </div>
          <div className="grid gap-3">
            {(form.questions || []).map((question, index) => renderQuestion(question, index))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default QuestionCountGrid;

