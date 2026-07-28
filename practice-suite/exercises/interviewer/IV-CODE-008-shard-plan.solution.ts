export function planShards(files: string[], shardCount: number): string[][] {
  const shards: string[][] = Array.from({ length: shardCount }, () => []);
  files.forEach((file, index) => {
    const shard = shards[index % shardCount];
    if (shard) shard.push(file);
  });
  return shards;
}
