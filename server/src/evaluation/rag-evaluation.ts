export interface RAGEvaluationCase {
  id: string;
  query: string;
  expectedRetrieval: boolean;
  expectedBehavior: "answer_from_context" | "refuse_insufficient_context";
}

export const RAG_EVALUATION_CASES: RAGEvaluationCase[] = [
  {
    id: "state-basic",
    query: "How does state work in React?",
    expectedRetrieval: true,
    expectedBehavior: "answer_from_context",
  },
  {
    id: "state-sharing",
    query: "How can state be shared between React components?",
    expectedRetrieval: true,
    expectedBehavior: "answer_from_context",
  },
  {
    id: "hooks-basic",
    query: "How do React Hooks work?",
    expectedRetrieval: true,
    expectedBehavior: "answer_from_context",
  },
  {
    id: "use-effect",
    query: "What is useEffect?",
    expectedRetrieval: true,
    expectedBehavior: "answer_from_context",
  },
  {
    id: "components",
    query: "What are React components?",
    expectedRetrieval: true,
    expectedBehavior: "answer_from_context",
  },

  // Important false-positive test
  {
    id: "rules-of-hooks",
    query: "What are the Rules of Hooks?",
    expectedRetrieval: false,
    expectedBehavior: "refuse_insufficient_context",
  },

  {
    id: "telephone",
    query: "Who invented the telephone?",
    expectedRetrieval: false,
    expectedBehavior: "refuse_insufficient_context",
  },

  {
    id: "mongodb",
    query: "What is MongoDB?",
    expectedRetrieval: false,
    expectedBehavior: "refuse_insufficient_context",
  },
];

export const RAG_CONVERSATION_EVALUATION_CASES: {
  id: string;
  messages: {
    role: "user" | "assistant";
    content: string;
  }[];
  expectedRetrieval: boolean;
  expectedBehavior: "answer_from_context" | "refuse_insufficient_context";
  expectedQuery?: string;
}[] = [
  {
    id: "followup-useeffect",
    messages: [
      {
        role: "user",
        content: "What is useEffect?",
      },
      {
        role: "assistant",
        content:
          "useEffect is a React Hook that lets a component synchronize with an external system.",
      },
      {
        role: "user",
        content: "What does it synchronize with?",
      },
    ],
    expectedRetrieval: true,
    expectedBehavior: "answer_from_context",
    expectedQuery: "What does useEffect synchronize with?",
  },

  {
    id: "followup-state",
    messages: [
      {
        role: "user",
        content: "What is React state?",
      },
      {
        role: "assistant",
        content:
          "React state allows a component to store information that can change over time.",
      },
      {
        role: "user",
        content: "How does it change?",
      },
    ],
    expectedRetrieval: true,
    expectedBehavior: "answer_from_context",
    expectedQuery: "How does React state change?",
  },

  {
    id: "context-switch",
    messages: [
      {
        role: "user",
        content: "What is React state?",
      },
      {
        role: "assistant",
        content: "React state stores information that can change over time.",
      },
      {
        role: "user",
        content: "What about MongoDB?",
      },
    ],
    expectedRetrieval: false,
    expectedBehavior: "refuse_insufficient_context",
  },
];
