function buildAnswerLookup(answersPayload) {
  return Object.fromEntries(Object.entries(answersPayload || {}));
}

function computeRawScore(items, answers) {
  return (items || []).reduce((acc, id) => acc + (answers[id] === 'yes' ? 1 : 0), 0);
}

function findNorm(finalScore, norms) {
  if (!norms || !Array.isArray(norms.table)) return { normalized: finalScore, level: null };
  const found = norms.table.find((entry) => finalScore >= entry.min && finalScore <= entry.max);
  const target =
    found ||
    [...norms.table].reverse().find((entry) => entry.min <= finalScore) ||
    norms.table[norms.table.length - 1] ||
    null;
  if (target) {
    const normalized = target.value !== undefined ? target.value : target.sten;
    return { normalized, level: target.level || null };
  }
  return { normalized: finalScore, level: null };
}

function orderScaleIds(scales) {
  const order = ['D', 'A', 'B', 'C', 'I', 'G', 'H', 'L', 'F', 'K'];
  for (let i = 1; i <= 9; i++) order.push(`B${i}`);
  order.push('B0');
  return [...scales].sort((a, b) => order.indexOf(a.scale_id) - order.indexOf(b.scale_id));
}

function buildMloAmScales(scoring, answers) {
  const lookup = {};
  const scales = [];
  const baseMaxK = scoring.scales.find((s) => s.id === 'K')?.max_score || 0;

  scoring.scales.forEach((def) => {
    const raw_score = computeRawScore(def.items, answers);
    const kBase = lookup.K?.raw_score || 0;
    const k_correction = def.k_correction ? Math.round((def.k_correction || 0) * kBase) : 0;
    const final_score = def.group === 'mmpi' ? Math.round(raw_score + k_correction) : raw_score;
    const norm = findNorm(final_score, def.norms);
    const max_score = def.group === 'mmpi' && def.k_correction
      ? def.max_score + Math.round((def.k_correction || 0) * baseMaxK)
      : def.max_score;
    const scale = {
      scale_id: def.id,
      name: def.name,
      group: def.group,
      raw_score,
      formula: def.formula || '',
      k_correction_added: k_correction,
      final_score,
      max_score,
      normalized: norm.normalized,
      normalized_kind: def.norms?.kind || null,
      level: norm.level,
      interpretation: def.interpretations?.[norm.level] || null
    };
    lookup[def.id] = scale;
    scales.push(scale);
  });

  scoring.derived.forEach((def) => {
    const components = (def.components || []).map((id) => lookup[id]).filter(Boolean);
    const raw_score = components.reduce((acc, item) => acc + (item.raw_score || 0), 0);
    const final_score = components.reduce((acc, item) => acc + (item.final_score || 0), 0);
    const norm = findNorm(final_score, def.norms);
    const scale = {
      scale_id: def.id,
      name: def.name,
      group: def.group,
      raw_score,
      formula: (def.components || []).join(' + '),
      k_correction_added: 0,
      final_score,
      max_score: def.max_score,
      normalized: norm.normalized,
      normalized_kind: def.norms?.kind || null,
      level: norm.level,
      interpretation: def.interpretations?.[norm.level] || null
    };
    lookup[def.id] = scale;
    scales.push(scale);
  });

  return orderScaleIds(scales);
}

function buildDerived(scales, scoring) {
  const byId = Object.fromEntries(scales.map((s) => [s.scale_id, s]));
  const lap = byId.D;
  const maladaptation = byId.I;
  const lapGroup = lap
    ? lap.level === 'ниже среднего'
      ? 'группа 3'
      : lap.level === 'средний'
        ? 'группа 2'
        : 'группа 1'
    : '—';
  return {
    LAP: lap
      ? {
          scale_id: lap.scale_id,
          name: lap.name,
          raw_score: lap.raw_score,
          final_score: lap.final_score,
          normalized: lap.normalized,
          level: lap.level,
          group: lapGroup,
          age_band: scoring.age_band
        }
      : null,
    maladaptation: maladaptation
      ? {
          scale_id: maladaptation.scale_id,
          raw_score: maladaptation.raw_score,
          final_score: maladaptation.final_score,
          normalized: maladaptation.normalized,
          level: maladaptation.level
        }
      : null
  };
}

function buildSummary(scales, derived, scoring) {
  const template = scoring.summary_templates?.base;
  if (!template) return null;
  const lapLevel = derived.LAP?.level || '—';
  const malLevel = derived.maladaptation?.level || '—';
  const mmpiPeaks = scales
    .filter((s) => s.group === 'mmpi' && s.normalized_kind === 't_score' && (s.normalized || 0) >= 70)
    .map((s) => `${s.scale_id} (${s.normalized})`)
    .join(', ');
  return template
    .replace('{lap_level}', lapLevel)
    .replace('{mal_level}', malLevel)
    .replace('{mmpi_peaks}', mmpiPeaks || 'пики не выявлены');
}

function collectNormTables(scoring) {
  const tables = {};
  scoring.scales
    .filter((s) => ['A', 'B', 'C', 'G', 'H', 'L', 'F', 'K'].includes(s.id))
    .forEach((s) => {
      tables[s.id] = s.norms?.table || [];
    });
  scoring.derived
    .filter((d) => ['D', 'I'].includes(d.id))
    .forEach((d) => {
      tables[d.id] = d.norms?.table || [];
    });
  return tables;
}

function buildMloAmResult(test, sessionId, answersPayload, startedAt) {
  const scoring = test.mlo_scoring;
  const answers = buildAnswerLookup(answersPayload);
  const scales = buildMloAmScales(scoring, answers);
  const derived = buildDerived(scales, scoring);
  const summary_text = buildSummary(scales, derived, scoring);

  const validityScale = scales.find((s) => s.scale_id === 'L');
  const validity = validityScale
    ? {
        is_valid: validityScale.level !== 'выше среднего',
        reason: validityScale.level,
        lie_scale_raw: validityScale.raw_score,
        lie_scale_level: validityScale.level
      }
    : { is_valid: true, reason: null, lie_scale_raw: null, lie_scale_level: null };

  const answersArray = Object.entries(answers).map(([question_id, value]) => ({ question_id, value }));

  return {
    test_id: test.id,
    session_id: sessionId,
    started_at: startedAt || null,
    finished_at: new Date().toISOString(),
    duration_sec: startedAt ? Math.round((Date.now() - new Date(startedAt).getTime()) / 1000) : null,
    answers: answersArray,
    scales,
    derived,
    validity,
    summary_text,
    norm_tables: collectNormTables(scoring)
  };
}

module.exports = { buildMloAmResult };
