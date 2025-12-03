const { cachedTests, getTestBySlug } = require('../configs');

function normalizeScore(raw, scale) {
  if (!scale.norms || !scale.norms.method) return { normalized: raw, level: null };
  let normalized = raw;
  if (scale.norms.method === 'percent') {
    const range = (scale.raw_max || 0) - (scale.raw_min || 0) || 1;
    normalized = Math.min(100, Math.max(0, Math.round(((raw - (scale.raw_min || 0)) / range) * 100)));
  }
  if (scale.norms.method === 'average_percent' && Array.isArray(scale.derived_from)) {
    // normalized will be computed elsewhere using derived_from
  }

  const level = determineLevel(normalized, scale.norms.thresholds || []);
  return { normalized, level };
}

function determineLevel(value, thresholds) {
  if (!thresholds) return null;
  const found = thresholds.find((item) => {
    const gtOk = item.gt === undefined || value > item.gt;
    const gteOk = item.gte === undefined || value >= item.gte;
    const ltOk = item.lt === undefined || value < item.lt;
    const lteOk = item.lte === undefined || value <= item.lte;
    return gtOk && gteOk && ltOk && lteOk;
  });
  return found ? found.level : null;
}

function computeRawScaleScore(scale, answers) {
  let raw = 0;
  (scale.items || []).forEach((item) => {
    const answer = answers[item.question_id];
    if (answer === undefined || answer === null) return;
    if (Array.isArray(answer)) {
      if (item.answer_value === 'selected' && answer.length) raw += item.score;
      if (item.answer_value && answer.includes(item.answer_value)) raw += item.score;
      return;
    }
    if (answer === item.answer_value) raw += item.score;
  });
  return raw;
}

function buildScales(test, answers) {
  const scaleResults = {};
  test.scales.forEach((scale) => {
    if (scale.derived_from) return;
    const raw_score = computeRawScaleScore(scale, answers);
    const { normalized, level } = normalizeScore(raw_score, scale);
    scaleResults[scale.id] = {
      scale_id: scale.id,
      name: scale.name,
      raw_score,
      raw_min: scale.raw_min,
      raw_max: scale.raw_max,
      normalized,
      level,
      interpretation: scale.interpretations?.[level] || null
    };
  });

  // derived scales
  test.scales
    .filter((scale) => Array.isArray(scale.derived_from))
    .forEach((scale) => {
      const related = scale.derived_from
        .map((id) => scaleResults[id])
        .filter(Boolean);
      const normalized = related.length
        ? Math.round((related.reduce((acc, item) => acc + (item.normalized || 0), 0) / related.length))
        : 0;
      const raw_score = related.reduce((acc, item) => acc + (item.raw_score || 0), 0);
      const level = determineLevel(normalized, scale.norms?.thresholds || []);
      scaleResults[scale.id] = {
        scale_id: scale.id,
        name: scale.name,
        raw_score,
        raw_min: scale.raw_min,
        raw_max: scale.raw_max,
        normalized,
        level,
        interpretation: scale.interpretations?.[level] || null
      };
    });

  return Object.values(scaleResults);
}

function buildSummary(test, scaleResults, derived) {
  const summaryRule = test.derived_rules?.summary;
  if (!summaryRule) return null;
  const topScale = [...scaleResults].sort((a, b) => (b.normalized || 0) - (a.normalized || 0))[0];
  const lapLevel = scaleResults.find((s) => s.scale_id === 'LAP')?.level;
  let summary = summaryRule.template;
  summary = summary.replace('{top_scale}', topScale?.name || '—');
  summary = summary.replace('{lap_level}', lapLevel || '—');
  if (summary.includes('{leaders}')) {
    const leaders = [...scaleResults]
      .sort((a, b) => (b.normalized || 0) - (a.normalized || 0))
      .slice(0, summaryRule.top_scales || 3)
      .map((s) => `${s.name} (${s.level || '—'})`)
      .join(', ');
    summary = summary.replace('{leaders}', leaders);
  }
  if (summary.includes('{risks_status}')) {
    const riskLevels = scaleResults
      .filter((s) => s.scale_id.startsWith('risk_'))
      .map((s) => `${s.name}: ${s.level || '—'}`)
      .join('; ');
    summary = summary.replace('{risks_status}', riskLevels || 'нет данных');
  }
  const lookup = Object.fromEntries(scaleResults.map((s) => [s.scale_id, s]));
  summary = summary.replace(/\{([A-Za-z_]+)\}/g, (match, key) => {
    if (lookup[key]) return lookup[key].level || `${lookup[key].normalized || 0}%`;
    if (derived && derived[key]) return derived[key].name || derived[key].id || match;
    return match;
  });
  return summary;
}

function deriveEpiTemperament(test, scaleResults) {
  const rules = test.derived_rules?.temperaments || [];
  const lookup = Object.fromEntries(scaleResults.map((s) => [s.scale_id, s.level]));
  const found = rules.find((rule) => {
    const eMatch = !rule.conditions?.E || lookup.E === rule.conditions.E;
    const nMatch = !rule.conditions?.N || lookup.N === rule.conditions.N;
    return eMatch && nMatch;
  });
  return found || null;
}

function computeRisks(test, scaleResults) {
  const risks = test.risks || [];
  const computed = risks.map((risk) => {
    const related = risk.source_scales
      .map((id) => scaleResults.find((s) => s.scale_id === id))
      .filter(Boolean);
    const normalized = related.length
      ? Math.round((related.reduce((acc, item) => acc + (item.normalized || 0), 0) / related.length))
      : 0;
    const level = determineLevel(normalized, risk.thresholds || []);
    return {
      scale_id: risk.id,
      name: risk.name,
      raw_score: normalized,
      raw_min: 0,
      raw_max: 100,
      normalized,
      level,
      interpretation: risk.description
    };
  });
  return computed;
}

function buildResult(testSlug, sessionId, answersPayload, startedAt) {
  const test = getTestBySlug(testSlug);
  if (!test) throw new Error('Тест не найден');

  const answers = Object.entries(answersPayload || {}).map(([question_id, value]) => ({ question_id, value }));
  const answerLookup = Object.fromEntries(answers.map((a) => [a.question_id, a.value]));

  let scales = buildScales(test, answerLookup);
  const riskScales = computeRisks(test, scales);
  scales = [...scales, ...riskScales];

  const derived = {};
  if (test.id === 'epi') {
    const temperament = deriveEpiTemperament(test, scales);
    if (temperament) derived.temperament = temperament;
  }
  const summary_text = buildSummary(test, scales, derived);

  const validityScale = scales.find((s) => ['D', 'L'].includes(s.scale_id));
  const validity = validityScale
    ? { is_valid: validityScale.level !== 'недостоверен' && validityScale.level !== 'высокий', reason: validityScale.level, lie_scale_raw: validityScale.raw_score, lie_scale_level: validityScale.level }
    : { is_valid: true, reason: null, lie_scale_raw: null, lie_scale_level: null };

  return {
    test_id: test.id,
    session_id: sessionId,
    started_at: startedAt || null,
    finished_at: new Date().toISOString(),
    duration_sec: startedAt ? Math.round((Date.now() - new Date(startedAt).getTime()) / 1000) : null,
    answers,
    scales,
    derived,
    validity,
    summary_text
  };
}

module.exports = {
  cachedTests,
  buildResult,
  determineLevel,
  buildScales
};
