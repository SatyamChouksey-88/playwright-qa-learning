---
id: IV-CODE-008
type: iv-coding
level: senior
round: coding
timebox: 12
difficulty: 3
topic: ci
specFile: practice-suite/exercises/interviewer/IV-CODE-008-shard-plan.spec.ts
---

## Interviewer script

Say: "Given file list and shard count, return shard assignments." Discuss runtime-based sharding as follow-up.

## Task statement

Implement `planShards(files: string[], shardCount: number): string[][]` — round-robin assignment.

## Starter code

```ts
export function planShards(files: string[], shardCount: number): string[][] {
  return [files];
}
```

## What to evaluate

- Correct shard count
- Even round-robin
- Handles empty input

## Exemplar solution

```ts
export function planShards(files: string[], shardCount: number): string[][] {
  const shards: string[][] = Array.from({ length: shardCount }, () => []);
  files.forEach((file, index) => {
    const shard = shards[index % shardCount];
    if (shard) shard.push(file);
  });
  return shards;
}
```

## Common candidate mistakes

- All files shard 1
- Off-by-one modulo

## Hint ladder

<details>
<summary>Hint 1</summary>

Create shardCount arrays.

</details>

<details>
<summary>Hint 2</summary>

index % shardCount.

</details>

<details>
<summary>Hint 3</summary>

Empty files → empty shards.

</details>

## Rubric

| Dimension | Look for |
|-----------|----------|
| Technical depth | Sharding algorithm |
| Judgment | Mentions runtime-weighted follow-up |
