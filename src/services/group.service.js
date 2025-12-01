const cache = require('../utils/cache');
const AppError = require('../utils/appError');
const dbCon = require('../utils/db');
const repo = require('../repositories/groupRepository');
const { GROUPS_PAGE_PREFIX } = require('../constants/cache');

async function listPaged(page = 1, limit = 20) {
  const key = `${GROUPS_PAGE_PREFIX}:page=${page}:limit=${limit}`;
  const cached = await cache.get(key);
  if (cached) return { groups: cached, fromCache: true };
  const offset = (page - 1) * limit;
  const rows = await repo.findAllPaged({ limit, offset });
  const groups = rows.map(r => r.get({ plain: true }));
  await cache.set(key, groups, 20);
  return { groups, fromCache: false };
}

async function listAdmin() {
  return repo.findAllAdmin();
}

async function getById(id) {
  const group = await repo.findById(id);
  if (!group) throw new AppError('Group not found', 404);
  return group;
}

async function create(body) {
  const group = await repo.create(body);
  return group;
}

async function update(id, body) {
  const group = await repo.update(id, body);
  if (!group) throw new AppError('Group not found', 404);
  return group;
}

async function remove(id) {
  const t = await dbCon.con.transaction();
  try {
    const deleted = await repo.destroyCascade(id, t);
    if (!deleted) {
      await t.rollback();
      throw new AppError('Group not found', 404);
    }
    await t.commit();
    return true;
  } catch (e) {
    try { await t.rollback(); } catch {}
    throw e instanceof AppError ? e : new AppError('Internal server error', 500);
  }
}

module.exports = { listPaged, listAdmin, getById, create, update, remove };

