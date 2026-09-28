# RAG Evaluation

The project includes evaluation and diagnostic paths because a RAG system should be tested as a pipeline, not judged only by whether a demo question produced a nice-looking answer.

## What is evaluated

The current evaluation cases look at several stages:

### 1. Query rewriting

Does a conversational question become a useful standalone retrieval query?

Example:

```text
Input:
What does it synchronize with?

Expected rewrite:
What does useEffect synchronize with?
```

### 2. Retrieval

Did the system retrieve knowledge when knowledge was expected?

The evaluation records information such as:

- whether retrieval was expected
- whether retrieval occurred
- number of vector candidates
- top vector score
- final result count
- top relevance score

### 3. Grounding

When knowledge is available, does the answer stay grounded in it?

When knowledge is intentionally unavailable, does the assistant avoid inventing an answer?

### 4. Overall result

The evaluation combines the individual checks into an overall pass/fail result.

---

## Example evaluation behavior

The test set includes both supported and unsupported questions.

For a supported question such as:

```text
What is useEffect?
```

the expected flow is:

```text
question
  ↓
rewrite
  ↓
retrieve relevant knowledge
  ↓
rerank
  ↓
answer from retrieved context
```

For an unsupported question such as:

```text
Who invented the telephone?
```

the expected flow is:

```text
question
  ↓
rewrite
  ↓
no relevant knowledge
  ↓
refuse rather than invent
```

---

## Current observed evaluation

One completed evaluation run produced:

| Metric | Result |
|---|---:|
| Query rewrite | 11/11 — 100% |
| Retrieval | 10/11 — 90.9% |
| Grounding | 11/11 — 100% |
| Overall | 10/11 — 90.9% |

These numbers are included as development evidence, not as a claim that the system is universally 90.9% accurate.

The evaluation set is small and depends on the current knowledge corpus and test cases.

The useful part is that the evaluation identifies **where** the pipeline needs work.

---

## Why retrieval matters

A final answer can be grounded correctly and still be wrong for the intended task if retrieval failed to find the required information.

For example:

```text
Expected:
retrieve React state knowledge

Actual:
no relevant chunks

Final answer:
correctly refuses
```

From a grounding perspective, the refusal is good.

From a retrieval perspective, the system still has a problem.

That distinction is why the project reports retrieval and grounding separately.

---

## Diagnostic information

The evaluation/diagnostic endpoints expose information useful for investigating:

- rewritten queries
- expected retrieval
- actual retrieval
- vector result count
- vector top score
- relevance score
- grounding result
- final answer
- overall pass/fail

This makes the evaluation useful during development instead of being only a final report.

---

## Current limitations of the evaluation

The evaluation framework is itself still being improved.

Current limitations include:

- The test corpus is relatively small.
- Evaluation cases are hand-defined.
- Some answer/grounding checks use rule-based detection.
- Retrieval and reranking quality need broader datasets.
- There is not yet a full automated CI evaluation pipeline.
- Metrics do not yet cover latency, token usage, cost, or production traffic behavior.

The next phase will focus on making evaluation more systematic and repeatable.
