const DB = require('../models');
const { User } = DB.models;

module.exports = {
  findAll: async ({ where = {} } = {}) => User.findAll({ where }),
  findById: async (id) => User.findByPk(id),
  save: async (user) => user.save()
};

