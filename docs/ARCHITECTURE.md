# Architecture

This document explains how the current AI Assistant Platform is put together and why the major pieces are separated.

## 1. Request flow

The main streaming conversation flow is currently:

```text
Request
  │
  ▼
ChatService
  │
  ├── validate conversation/message input
  │
  ├── persist latest user message
  │
  ├── QueryRewriteService
  │
  ├── RetrievalService
  │      └── EmbeddingService
  │             └── MongoDB Atlas Vector Search
  │
  ├── RerankingService
  │      └── RelevanceService
  │
  ├── RAGContextService
  │
  ├── PromptBuilder
  │      └── Memory retrieval
  │
  ├── OpenAIChatService
  │      └── streaming response
  │
  ├── persist assistant response
  │
  └── MemoryPipelineService
```

The intention is to keep each responsibility understandable and replaceable.

---

## 2. Conversation layer

Conversations and messages are persisted in MongoDB.

The application supports multiple conversations rather than treating the chat history as one permanent thread.

The streaming request carries the conversation context and the service persists the latest user and assistant messages.

One current limitation is that the application still relies on a demo user identifier in the orchestration layer because authentication has not yet been implemented.

---

## 3. Query rewriting

A follow-up question often depends on the previous turn.

For example:

```text
User: What is useEffect?

User: What does it synchronize with?
```

Sending only the second sentence to a semantic retrieval system is ambiguous.

The `QueryRewriteService` uses the LLM to produce a self-contained retrieval query:

```text
What does useEffect synchronize with?
```

The rewrite is intended to:

- preserve the user's intent
- resolve references such as "it", "this", or "that"
- avoid adding unnecessary scope
- recognize topic switches

The rewritten query is then used for retrieval.

---

## 4. Embeddings and vector search

Knowledge is converted into embeddings using:

```text
text-embedding-3-small
```

The current embedding dimension is:

```text
1536
```

The application stores the embedding alongside each knowledge chunk.

MongoDB Atlas Vector Search is then used to find semantically similar chunks.

The current retrieval layer also applies a minimum vector-score threshold rather than blindly accepting every candidate.

---

## 5. Relevance reranking

Vector similarity is useful, but semantic similarity does not always mean that a piece of knowledge is actually useful for answering the question.

The current pipeline therefore has a second stage:

```text
Vector Search
      │
      ▼
Candidate chunks
      │
      ▼
RelevanceService
      │
      ▼
RerankingService
      │
      ▼
Relevant chunks
```

The relevance step asks the model to judge whether a chunk actually helps answer the question.

The reranker then filters and orders the candidates using that relevance score.

This is intentionally separate from vector retrieval so that the two stages have different jobs:

- **Vector search:** find potentially related material.
- **Reranking:** decide which candidates are actually useful.

---

## 6. RAG context construction

`RAGContextService` turns the selected chunks into a controlled context block for the prompt.

The current implementation:

- removes duplicate chunks
- includes source metadata
- labels retrieved sources
- applies a maximum context length

The context is then passed to the prompt builder.

Token-aware budgeting is a planned improvement; the current limit is character-based.

---

## 7. Grounded generation

The prompt explicitly establishes a RAG policy.

The assistant should:

- use the retrieved knowledge
- avoid silently supplementing the answer with outside knowledge
- avoid making unsupported assumptions
- refuse when the supplied knowledge is insufficient

This creates an important distinction between:

```text
"I don't know from the supplied knowledge."
```

and:

```text
"I can answer this because the model already knows it."
```

For this project, the first behavior is intentional when retrieval does not provide enough evidence.

---

## 8. Memory pipeline

Conversation memory is separate from RAG knowledge.

The memory pipeline can:

1. inspect the conversation
2. extract potentially useful user-specific information
3. persist memory
4. retrieve relevant stored memories later
5. make those memories available to prompt construction

This allows the system to maintain useful information beyond a single conversation.

---

## 9. Knowledge ingestion

Knowledge ingestion currently follows this general process:

```text
Document
   │
   ▼
Create parent document
   │
   ▼
Split into chunks
   │
   ▼
Generate embeddings
   │
   ▼
Create knowledge records
   │
   ▼
Bulk insert
```

The current chunking strategy is intentionally simple and primarily uses paragraph boundaries.

More advanced chunk sizing, overlap, token-aware splitting, deduplication, versioning, and idempotent ingestion are planned improvements.

---

## 10. Evaluation

Evaluation is treated as a separate concern rather than mixing test logic into the chat request path.

The current evaluation flow can inspect:

- rewritten query
- retrieval success
- vector scores
- reranking/relevance
- grounding behavior
- final pass/fail result

This makes it possible to identify whether a bad answer came from:

```text
query understanding
       ↓
retrieval
       ↓
reranking
       ↓
context construction
       ↓
generation
```

instead of only looking at the final answer.

---

## 11. Current architectural limitations

The project is still under active development.

Important limitations include:

- Authentication and authorization are not implemented.
- Some diagnostic and ingestion endpoints are not protected.
- The non-streaming `/chat` route does not currently go through the complete RAG orchestration used by the streaming flow.
- The conversation orchestration currently uses a demo user identifier.
- Context limits are character-based rather than token-aware.
- Reranking performs separate LLM relevance evaluations for candidates.
- Retry, timeout, and advanced failure policies are still being hardened.
- Automated unit/integration tests and CI are not yet in place.
- Production observability is not yet implemented.

These are documented deliberately so the repository remains honest about its current state.
