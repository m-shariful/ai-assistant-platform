export interface GroundingEvaluationCase {
  id: string;
  query: string;
  expectedQuery: string | null;
  expectedRetrieval: boolean;
  expectedBehavior: "answer_from_context" | "refuse_insufficient_context";
}

export const GROUNDING_EVALUATION_CASES: GroundingEvaluationCase[] = [
  {
    id: "state-basic",
    query: "How does state work in React?",
    expectedQuery: null,
    expectedRetrieval: true,
    expectedBehavior: "answer_from_context",
  },
  {
    id: "state-sharing",
    query: "How can state be shared between React components?",
    expectedQuery: null,
    expectedRetrieval: true,
    expectedBehavior: "answer_from_context",
  },
  {
    id: "hooks-basic",
    query: "How do React Hooks work?",
    expectedQuery: null,
    expectedRetrieval: true,
    expectedBehavior: "answer_from_context",
  },
  {
    id: "use-effect",
    query: "What is useEffect?",
    expectedQuery: null,
    expectedRetrieval: true,
    expectedBehavior: "answer_from_context",
  },

  {
    id: "components",
    query: "What are React components?",
    expectedQuery: null,
    expectedRetrieval: true,
    expectedBehavior: "answer_from_context",
  },
  {
    id: "rules-of-hooks",
    query: "What are the Rules of Hooks?",
    expectedQuery: null,
    expectedRetrieval: false,
    expectedBehavior: "refuse_insufficient_context",
  },
  {
    id: "telephone",
    query: "Who invented the telephone?",
    expectedQuery: null,
    expectedRetrieval: false,
    expectedBehavior: "refuse_insufficient_context",
  },
  {
    id: "mongodb",
    query: "What is MongoDB?",
    expectedQuery: null,
    expectedRetrieval: false,
    expectedBehavior: "refuse_insufficient_context",
  },
  {
    id: "followup-useeffect",
    query: "What does it synchronize with?",
    expectedQuery: "What does useEffect synchronize with?",
    expectedRetrieval: true,
    expectedBehavior: "answer_from_context",
  },
  {
    id: "followup-state",
    query: "How does it change?",
    expectedQuery: "How does React state change?",
    expectedRetrieval: true,
    expectedBehavior: "answer_from_context",
  },
  {
    id: "topic-switch-mongodb",
    query: "What about MongoDB?",
    expectedQuery: "What about MongoDB?",
    expectedRetrieval: false,
    expectedBehavior: "refuse_insufficient_context",
  },
];
