export function answerScore(answer) {
  if (answer === 'ja') return 2;
  if (answer === 'teilweise') return 1;
  return 0;
}

export function scoreDimension(answers) {
  const total = answerScore(answers.reg) + answerScore(answers.org) + answerScore(answers.tech);
  return Math.round((total / 6) * 100);
}

const SML_LEVELS = [
  { id: 'future-proof', label: 'Future-Proof', min: 76, color: '#10b981' },
  { id: 'advanced',     label: 'Advanced',     min: 51, color: '#3b82f6' },
  { id: 'managed',      label: 'Managed',      min: 26, color: '#f59e0b' },
  { id: 'initial',      label: 'Initial',      min: 0,  color: '#f97316' },
];

export function getSMLLevel(score) {
  return SML_LEVELS.find(l => score >= l.min);
}

export function weakestLink(dimensionScores) {
  return Math.min(...Object.values(dimensionScores));
}

export function scoreAllDimensions(answers) {
  const scores = {};
  for (const [dim, ans] of Object.entries(answers)) {
    scores[dim] = scoreDimension(ans);
  }
  const overall = weakestLink(scores);
  return { ...scores, overall, smlLevel: getSMLLevel(overall) };
}
