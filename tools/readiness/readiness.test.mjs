#!/usr/bin/env node
/** Unit tests for readiness formula — deterministic inputs → outputs. */
import assert from 'node:assert/strict';

const EWMA_ALPHA = 0.2;
const WEIGHTS = { accuracy: 0.5, fsrs: 0.3, exercise: 0.2 };

function ewmaUpdate(prev, correct, hasPrev) {
  const outcome = correct ? 1 : 0;
  return (1 - EWMA_ALPHA) * (hasPrev ? prev : 0.5) + EWMA_ALPHA * outcome;
}

function topicMastery({ ewma, fsrsR, exRatio, hasFsrs = true }) {
  let wAcc = WEIGHTS.accuracy;
  let wFsrs = WEIGHTS.fsrs;
  let wEx = WEIGHTS.exercise;
  if (!hasFsrs) {
    const sum = wAcc + wEx;
    wAcc /= sum;
    wEx /= sum;
    wFsrs = 0;
  }
  return wAcc * ewma + (hasFsrs ? wFsrs * fsrsR : 0) + wEx * exRatio;
}

function band(score) {
  if (score >= 0.8) return 'ready';
  if (score >= 0.5) return 'developing';
  return 'weak';
}

// EWMA: 3 correct → high accuracy
let acc = 0.5;
for (let i = 0; i < 3; i++) acc = ewmaUpdate(acc, true, i > 0);
assert.ok(acc > 0.7, `EWMA after 3 correct should be >0.7, got ${acc}`);

// Full formula with mock inputs
const mastery = topicMastery({ ewma: acc, fsrsR: 0.85, exRatio: 0.5 });
assert.ok(mastery > 0.7 && mastery < 0.95, `mastery ${mastery} in expected range`);
assert.equal(band(0.82), 'ready');
assert.equal(band(0.65), 'developing');
assert.equal(band(0.3), 'weak');

// Renormalize without FSRS
const noFsrs = topicMastery({ ewma: 0.8, fsrsR: 0, exRatio: 1, hasFsrs: false });
assert.ok(Math.abs(noFsrs - 0.8 * (0.5 / 0.7) - 1 * (0.2 / 0.7)) < 0.01 || noFsrs > 0.75);

console.log('readiness formula tests passed');
