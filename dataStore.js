const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_PATH = path.join(__dirname, 'data', 'responses.json');

function ensureFile() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify({ records: [] }, null, 2));
  }
}

function loadData() {
  ensureFile();
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function persistData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function createRecord(testSlug, person) {
  const data = loadData();
  const id = randomUUID();
  const record = {
    id,
    testSlug,
    person,
    createdAt: new Date().toISOString(),
    status: 'intake'
  };
  data.records.push(record);
  persistData(data);
  return record;
}

function updateRecord(id, update) {
  const data = loadData();
  const record = data.records.find((item) => item.id === id);
  if (!record) return null;
  Object.assign(record, update);
  persistData(data);
  return record;
}

function getRecord(id) {
  const data = loadData();
  return data.records.find((item) => item.id === id);
}

function listRecordsByTest(testSlug) {
  const data = loadData();
  return data.records.filter((record) => record.testSlug === testSlug && record.status === 'complete');
}

module.exports = {
  createRecord,
  updateRecord,
  getRecord,
  listRecordsByTest
};
