// src/components/productReview/NestedQuestionBranch.jsx

import QuestionCard from "./QuestionCard";

const NestedQuestionBranch = ({
  subQuestions,
  onUpdateSubQuestions,
  level = 1
}) => {

  const updateSubQuestion = (updatedQuestion, index) => {

    const updated = [...subQuestions];

    updated[index] = updatedQuestion;

    onUpdateSubQuestions(updated);
  };

  const deleteSubQuestion = (index) => {

    const updated = [...subQuestions];

    updated.splice(index, 1);

    onUpdateSubQuestions(updated);
  };

  return (
    <div
      className={`
        mt-4
        ml-${Math.min(level * 4, 12)}
        border-l-2
        border-gray-300
        pl-4
      `}
    >

      {/* Nested Branch Header */}

      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-700">
          Dependent Questions
        </h4>
      </div>

      {/* Render Nested Questions */}

      {subQuestions?.length > 0 ? (

        subQuestions.map((question, index) => (

          <div
            key={question.questionId || index}
            className="relative mb-4"
          >

            {/* Connector Dot */}

            <div
              className="
                absolute
                -left-[22px]
                top-6
                w-3
                h-3
                rounded-full
                bg-blue-500
              "
            />

            {/* Recursive Question Card */}

            <QuestionCard
              question={question}
              index={index}
              questions={subQuestions}
              setQuestions={onUpdateSubQuestions}
              nestingLevel={level + 1}
            />

            {/* Delete Nested Question */}

            <div className="flex justify-end mt-2">

              <button
                onClick={() => deleteSubQuestion(index)}
                className="
                  text-red-500
                  text-sm
                  hover:text-red-700
                "
              >
                Delete Sub Question
              </button>

            </div>

          </div>

        ))

      ) : (

        <div
          className="
            text-sm
            text-gray-500
            italic
            py-2
          "
        >
          No dependent questions added yet.
        </div>

      )}

    </div>
  );
};

export default NestedQuestionBranch;