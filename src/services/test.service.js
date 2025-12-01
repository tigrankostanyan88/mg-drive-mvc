const cache = require('../utils/cache');
const AppError = require('../utils/appError');
const dbCon = require('../utils/db');
const repo = require('../repositories/testRepository');
const { TESTS_PAGE_PREFIX } = require('../constants/cache');

async function listPaged(page = 1, limit = 20) {
  const key = `${TESTS_PAGE_PREFIX}:page=${page}:limit=${limit}`;
  const cached = await cache.get(key);
  if (cached) return { tests: cached, fromCache: true };
  const offset = (page - 1) * limit;
  const rows = await repo.findAllPaged({ limit, offset });
  const tests = rows.map(r => r.get({ plain: true }));
  await cache.set(key, tests, 20);
  return { tests, fromCache: false };
}

async function listAdmin() {
  return repo.findAllAdmin();
}

async function getById(id) {
  const test = await repo.findById(id);
  if (!test) throw new AppError('Test not found', 404);
  return test;
}

async function create(body) {
  const test = await repo.create(body);
  return test;
}

async function update(id, body) {
  const test = await repo.update(id, body);
  if (!test) throw new AppError('Test not found', 404);
  return test;
}

async function remove(id) {
  const t = await dbCon.con.transaction();
  try {
    const deleted = await repo.destroyCascade(id, t);
    if (!deleted) {
      await t.rollback();
      throw new AppError('Test not found', 404);
    }
    await t.commit();
    return true;
  } catch (e) {
    try { await t.rollback(); } catch {}
    throw e instanceof AppError ? e : new AppError('Internal server error', 500);
  }
}

module.exports = { listPaged, listAdmin, getById, create, update, remove };

