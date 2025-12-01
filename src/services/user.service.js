const { USERS_ALL_KEY, USERS_TTL } = require('../constants/cache');
const cache = require('../utils/cache');
const AppError = require('../utils/appError');
const Files = require('../controllers/File');
const repo = require('../repositories/userRepository');
const { Sequelize } = require('../models');

async function getAll({ excludeRoles = [] } = {}) {
  const cacheKey = USERS_ALL_KEY;
  const cached = await cache.get(cacheKey);
  if (cached) return { users: cached, fromCache: true };
  const where = excludeRoles.length
    ? { role: { [Sequelize.Op.notIn]: excludeRoles } }
    : {};
  const users = await repo.findAll({ where });
  await cache.set(cacheKey, users, USERS_TTL);
  return { users, fromCache: false };
}

async function updateUser(id, body, files) {
  const user = await repo.findById(id);
  if (!user) throw new AppError('User not found.', 404);
  for (let key in body) user[key] = body[key];
  await repo.save(user);
  if (files?.user_img) {
    const img = await new Files(user, files.user_img).replace('user_img');
    if (img.status !== 'success') {
      const msg = typeof img.message === 'object' ? Object.values(img.message).join(' ') : img.message;
      throw new AppError(msg, 400);
    }
    await user.createFile(img.table);
  }
  await cache.del(USERS_ALL_KEY);
  return user;
}

async function updateMe(currentUserId, body, files) {
  const user = await repo.findById(currentUserId);
  if (!user) throw new AppError('User not found.', 404);
  for (let key in body) user[key] = body[key];
  await repo.save(user);
  if (files?.user_img) {
    const img = await new Files(user, files.user_img).replace('user_img');
    if (img.status !== 'success') {
      const msg = typeof img.message === 'object' ? Object.values(img.message).join(' ') : img.message;
      throw new AppError(msg, 400);
    }
    await user.createFile(img.table);
  }
  await cache.del(USERS_ALL_KEY);
  return user;
}

module.exports = { getAll, updateUser, updateMe };
