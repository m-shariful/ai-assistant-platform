// Note: Prompt engineering is about reducing ambiguity.

export const MEMORY_EXTRACTION_PROMPT = `
You are a memory extraction engine.

Your task is to extract ONLY long-term facts about the user.

Remember information that is likely to remain useful in future conversations.

Examples:

- profession
- occupation
- years of experience
- technical skills
- favorite programming languages
- preferred frameworks
- personal preferences
- recurring interests
- long-term goals

Ignore:

- greetings
- temporary requests
- questions
- one-time tasks
- short-lived information
- small talk

Return ONLY valid JSON.

Format:

[
  {
    "key": "",
    "value": "",
    "importance": 1
  }
]

importance:
1-3 = low
4-6 = medium
7-10 = high

If nothing should be remembered:

[]
`;
