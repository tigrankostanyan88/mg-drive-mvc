const DB = require('../models');
const { Test, Question, File } = DB.models;

module.exports = {
  findAllPaged: async ({ limit, offset }) => Test.findAll({
    limit, offset,
    order: [['number','ASC']],
    attributes: ['id','title','number','updatedAt'],
    include: [{
      model: Question,
      as: 'questions',
      attributes: ['id','question'],
      separate: true,
      order: [['id','ASC']],
      limit: 10,
      include: [{
        model: File,
        as: 'files',
        attributes: ['id'],
        separate: true,
        limit: 5
      }]
    }]
  }),
  findAllAdmin: async () => Test.findAll({
    order: [['number','ASC']],
    include: [{ model: Question, as: 'questions' }]
  }),
  findById: async (id) => Test.findByPk(id, {
    attributes: ['id','title','number','slug'],
    include: [{
      model: Question,
      as: 'questions',
      attributes: ['id','title','question'],
      include: [{ model: File, as: 'files', attributes: ['id','path'] }]
    }]
  }),
  create: async (payload) => Test.create(payload),
  update: async (id, body) => {
    const test = await Test.findByPk(id);
    if (!test) return null;
    await test.update(body);
    return test;
  },
  destroyCascade: async (id, t) => {
    const questions = await Question.findAll({ where: { row_id: id, table_name: 'tests' }, transaction: t });
    if (questions.length) {
      const ids = questions.map(q => q.id);
      await File.destroy({ where: { row_id: ids }, transaction: t });
      await Question.destroy({ where: { id: ids }, transaction: t });
    }
    return Test.destroy({ where: { id }, transaction: t });
  }
};
