const DB = require('../models');
const { Group, Question, File } = DB.models;

module.exports = {
  findAllPaged: async ({ limit, offset }) => Group.findAll({
    limit, offset,
    order: [['number','ASC']],
    attributes: ['id','title','number','slug','date'],
    include: [{
      model: Question,
      as: 'questions',
      attributes: ['id','question'],
      separate: true,
      order: [['id','ASC']],
      include: [{ model: File, as: 'files', attributes: ['id','path'], separate: true }]
    }]
  }),
  findAllAdmin: async () => Group.findAll({
    order: [['number','ASC']],
    include: [{ model: Question, as: 'questions' }]
  }),
  findById: async (id) => Group.findByPk(id, {
    attributes: ['id','title','number','slug','date'],
    include: [{
      model: Question,
      as: 'questions',
      attributes: ['id','title','question'],
      include: [{ model: File, as: 'files', attributes: ['id','path'] }]
    }]
  }),
  create: async (payload) => Group.create(payload),
  update: async (id, body) => {
    const group = await Group.findByPk(id);
    if (!group) return null;
    await group.update(body);
    return group;
  },
  destroyCascade: async (id, t) => {
    const questions = await Question.findAll({ where: { row_id: id, table_name: 'groups' }, transaction: t });
    if (questions.length) {
      const ids = questions.map(q => q.id);
      await File.destroy({ where: { row_id: ids }, transaction: t });
      await Question.destroy({ where: { id: ids }, transaction: t });
    }
    return Group.destroy({ where: { id }, transaction: t });
  }
};
