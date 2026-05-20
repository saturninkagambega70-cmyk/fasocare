const targetUrl = process.env.LOAD_TEST_URL || 'http://localhost:3001/api/v1/health';
const concurrentUsers = Number(process.env.LOAD_TEST_USERS || '100');
const requestsPerUser = Number(process.env.LOAD_TEST_REQUESTS || '5');
const method = (process.env.LOAD_TEST_METHOD || 'GET').toUpperCase();
const body = process.env.LOAD_TEST_BODY;

async function singleRequest(userId, requestId) {
  const startedAt = performance.now();

  try {
    const response = await fetch(targetUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method === 'GET' || !body ? undefined : body,
    });

    const durationMs = performance.now() - startedAt;
    return {
      ok: response.ok,
      status: response.status,
      durationMs,
      userId,
      requestId,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      durationMs: performance.now() - startedAt,
      userId,
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function runUser(userId) {
  const results = [];

  for (let requestId = 1; requestId <= requestsPerUser; requestId += 1) {
    results.push(await singleRequest(userId, requestId));
  }

  return results;
}

function percentile(sortedValues, ratio) {
  if (sortedValues.length === 0) {
    return 0;
  }

  const index = Math.min(
    sortedValues.length - 1,
    Math.max(0, Math.ceil(sortedValues.length * ratio) - 1),
  );

  return sortedValues[index];
}

async function main() {
  console.log(`Starting load test against ${targetUrl}`);
  console.log(`Users=${concurrentUsers} Requests/User=${requestsPerUser} Method=${method}`);

  const startedAt = performance.now();
  const results = (await Promise.all(
    Array.from({ length: concurrentUsers }, (_, index) => runUser(index + 1)),
  )).flat();
  const totalDurationMs = performance.now() - startedAt;

  const latencies = results.map((result) => result.durationMs).sort((a, b) => a - b);
  const successCount = results.filter((result) => result.ok).length;
  const failureCount = results.length - successCount;
  const averageLatencyMs =
    latencies.reduce((sum, current) => sum + current, 0) / Math.max(latencies.length, 1);

  console.log('\nLoad test summary');
  console.log(`Total requests: ${results.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
  console.log(`Total duration: ${totalDurationMs.toFixed(2)} ms`);
  console.log(`Average latency: ${averageLatencyMs.toFixed(2)} ms`);
  console.log(`P50 latency: ${percentile(latencies, 0.5).toFixed(2)} ms`);
  console.log(`P95 latency: ${percentile(latencies, 0.95).toFixed(2)} ms`);
  console.log(`P99 latency: ${percentile(latencies, 0.99).toFixed(2)} ms`);

  const errorSamples = results.filter((result) => !result.ok).slice(0, 5);
  if (errorSamples.length > 0) {
    console.log('\nFailure samples');
    for (const sample of errorSamples) {
      console.log(
        `User ${sample.userId} Request ${sample.requestId}: status=${sample.status} error=${sample.error || 'HTTP error'}`,
      );
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Load test failed:', error);
  process.exit(1);
});
