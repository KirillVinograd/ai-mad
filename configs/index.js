const fs = require('fs');
const path = require('path');

const TESTS_DIR = path.join(__dirname, 'tests');

function loadTestFiles() {
  const files = fs.readdirSync(TESTS_DIR).filter((file) => file.endsWith('.json'));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(TESTS_DIR, file), 'utf-8');
    return JSON.parse(raw);
  });
}

const cachedTests = loadTestFiles();

function listTests() {
  return cachedTests.map(({ id, slug, meta }) => ({ id, slug, meta }));
}

function getTestBySlug(slug) {
  return cachedTests.find((test) => test.slug === slug);
}

module.exports = {
  listTests,
  getTestBySlug,
  cachedTests
};
