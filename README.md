# AI Assistant Platform

> **Status: Active Development**  
> A RAG-powered conversational AI backend built to explore how a useful AI assistant can combine streaming responses, persistent conversations, long-term memory, semantic retrieval, query rewriting, relevance reranking, and grounded answers.

This project is being built incrementally. The goal is not just to make an AI chat endpoint work, but to understand and implement the pieces that make an AI application more reliable and useful in real-world scenarios.

## Why I built this

I wanted to go beyond calling an LLM API and build the surrounding system myself.

The project started as a simple streaming chat service and has gradually grown into a conversational RAG system. Along the way, I have been focusing on questions that matter in practical AI engineering:

- How should conversations be persisted?
- How can an assistant remember useful information across conversations?
- How do we retrieve the right information from a knowledge base?
- What should happen when the retrieved information is not enough?
- How can follow-up questions such as "What does it synchronize with?" be understood from previous context?
- How can retrieved chunks be filtered beyond simple vector similarity?
- How do we evaluate whether retrieval and grounded responses are actually working?

The repository will continue to evolve as I work through the remaining production-hardening pieces.

---

## What I've built so far

### Conversational AI

- OpenAI-powered chat responses
- Streaming responses using the OpenAI Responses API
- Persistent conversations in MongoDB
- Multiple conversations
- Conversation history and message persistence
- Conversation-aware prompt construction

### Long-term memory

- User memory storage
- Memory retrieval during prompt construction
- LLM-assisted memory extraction
- Memory persistence and updates

### RAG pipeline

The current RAG flow includes:

1. User question
2. Conversational query rewriting
3. Query embedding
4. MongoDB Atlas Vector Search
5. Relevance-based reranking
6. Context construction and deduplication
7. Grounded response generation
8. Assistant response persistence

The embedding model currently used is `text-embedding-3-small` with 1536-dimensional vectors.

### Grounded answers

The assistant is instructed to use the retrieved knowledge rather than silently filling gaps with general model knowledge.

When the available material is insufficient, the system can refuse to answer instead of presenting an unsupported answer as fact.

### Evaluation and diagnostics

The project also includes evaluation/diagnostic endpoints for checking:

- Query rewriting
- Retrieval behavior
- Grounding behavior
- Retrieval scores
- Relevance scores
- End-to-end RAG cases

For example, the current evaluation set includes both answerable questions and intentionally unsupported questions. In one completed evaluation run, query rewriting and grounding both reached 100%, while overall results were limited by retrieval quality in one case. This is useful because it exposes where the pipeline needs improvement rather than hiding the weakness behind the final answer.

---

## High-level architecture

```text
                    ┌─────────────────────┐
                    │      Client         │
                    │  Chat / API caller  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    ChatService      │
                    │  conversation flow  │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
        ┌────────────────┐ ┌───────────┐ ┌────────────────┐
        │ Query Rewrite  │ │  Memory   │ │   Retrieval    │
        │   Service      │ │ Pipeline  │ │    Service     │
        └───────┬────────┘ └───────────┘ └───────┬────────┘
                │                                │
                │                                ▼
                │                       ┌─────────────────┐
                │                       │ MongoDB Atlas   │
                │                       │ Vector Search   │
                │                       └────────┬────────┘
                │                                │
                │                                ▼
                │                       ┌─────────────────┐
                │                       │   Reranking     │
                │                       │ Relevance model │
                │                       └────────┬────────┘
                │                                │
                └──────────────┬─────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │  RAG Context Builder│
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │    Prompt Builder   │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │      OpenAI         │
                    │   Streaming LLM     │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Persisted Assistant │
                    │      Response       │
                    └─────────────────────┘
```

For a more detailed explanation, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Technology stack

| Area | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| API | Express |
| Database | MongoDB / MongoDB Atlas |
| ODM | Mongoose |
| Vector search | MongoDB Atlas Vector Search |
| LLM | OpenAI Responses API |
| Chat model | `gpt-5-mini` |
| Embeddings | `text-embedding-3-small` |
| Validation | Zod |
| Development | tsx |
| Local database | Docker Compose |

---

## Project structure

```text
src/
├── config/
├── controllers/
├── evaluation/
├── models/
├── prompts/
├── routes/
├── services/
└── index.ts

docs/
├── ARCHITECTURE.md
└── EVALUATION.md
```

The services are intentionally separated so that the main conversation flow does not become one large piece of application logic.

---

## Getting started

### Requirements

- Node.js
- npm
- MongoDB, or Docker
- OpenAI API key
- MongoDB Atlas if using Vector Search

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and provide your credentials.

```bash
cp .env.example .env
```

Windows users can copy the file manually if `cp` is unavailable.

### 3. Start MongoDB locally

The repository includes a local MongoDB setup:

```bash
docker compose up -d
```

The local MongoDB instance is configured for port `27020`.

### 4. Start the API

```bash
npm run dev
```

The default API port is `5000`.

### 5. Check the server

```bash
curl http://localhost:5000/health
```

---

## MongoDB Atlas Vector Search

The knowledge collection uses 1536-dimensional embeddings.

The vector index is configured around:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

The index name currently used by the application is:

```text
knowledge_vector_index
```

---

## API overview

### Health

```http
GET /health
```

### Chat

```http
POST /chat
```

### Streaming chat

```http
POST /chat-stream
```

### Conversations

```http
GET /conversations
POST /conversations
GET /conversations/:id
```

### Knowledge

```http
POST /knowledge
```

### Embeddings

```http
POST /embeddings
```

### Retrieval

```http
POST /retrieval
```

### Evaluation

The evaluation router exposes diagnostics for RAG, grounding, retrieval debugging, and query rewriting.

See [`docs/EVALUATION.md`](docs/EVALUATION.md) for the current evaluation flow.

---

## A small example of the RAG behavior

Suppose the knowledge base contains information about React Hooks.

A user can ask:

```text
What is useEffect?
```

The system retrieves relevant knowledge and can answer from that material.

Then the user can ask:

```text
What does it synchronize with?
```

The query rewriting step can turn the follow-up into:

```text
What does useEffect synchronize with?
```

This gives the retrieval layer a much clearer query to work with.

If the user switches topics to something that is not present in the knowledge base, the system is designed to avoid inventing an answer and instead indicate that the supplied knowledge is insufficient.

---

## Current development status

This repository is **not presented as a finished production platform**.

The core AI/RAG pipeline is working, and I am continuing to improve the engineering around it.

### Already implemented

- [x] Streaming AI responses
- [x] MongoDB conversation persistence
- [x] Multiple conversations
- [x] Conversation memory
- [x] Embedding generation
- [x] Vector search
- [x] Query rewriting
- [x] Relevance reranking
- [x] RAG context construction
- [x] Grounded/refusal behavior
- [x] RAG evaluation and diagnostics

### In progress / planned

- [ ] Better token-aware context management
- [ ] More robust failure handling and retries
- [ ] Stronger structured-output validation
- [ ] Automated unit/integration tests
- [ ] Authentication and authorization
- [ ] Rate limiting and API protection
- [ ] Centralized error handling
- [ ] Production logging, metrics, and tracing
- [ ] More comprehensive RAG evaluation
- [ ] Knowledge ingestion/versioning improvements
- [ ] CI/CD and deployment hardening

These items will be added and documented as they are actually implemented.

---

## Engineering notes

A major part of this project is learning from failures rather than only showing successful demos.

For example, retrieval quality depends on more than simply having embeddings and a vector index. Thresholds, chunking strategy, query formulation, reranking, and context construction all affect the final result.

That is why the project contains diagnostic and evaluation paths instead of treating the first working answer as proof that the RAG system is good enough.

The current evaluation artifacts are documented in [`docs/EVALUATION.md`](docs/EVALUATION.md).

---

## Security note

This repository is currently an actively developed backend and should not be treated as a production deployment.

Authentication/authorization, rate limiting, restrictive CORS, protected administrative endpoints, comprehensive automated tests, and several other production controls are still part of the hardening work.

Never commit a real `.env` file or API credentials.

---

## What's next

The next stages will focus less on adding flashy features and more on making the existing pipeline dependable:

**quality → context management → failure handling → validation → testing → security → observability → deployment**

The repository will be updated as those pieces are completed.

---

## License

MIT
