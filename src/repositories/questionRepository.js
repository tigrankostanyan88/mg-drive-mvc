const DB = require('../models');
const { Question, File, Test, Group } = DB.models;

module.exports = {
  create: async (body, t) => {
    let options;
    try { options = typeof body.options === 'string' ? JSON.parse(body.options) : body.options; } catch { options = []; }
    const payload = {
      row_id: body.row_id,
      table_name: body.table_name,
      question: body.question,
      correctAnswerIndex: body.correctAnswerIndex,
      options
    };
    return Question.create(payload, { transaction: t });
  },

  findByIdWithFiles: async (id) => Question.findByPk(id, {
    include: [{ model: File, as: 'files', attributes: ['id','path'] }]
  }),

  save: async (question) => question.save(),

  findFileByRowId: async (rowId) => File.findOne({ where: { row_id: rowId } }),
  destroyById: async (id) => Question.destroy({ where: { id } }),
  destroyFileById: async (id) => File.destroy({ where: { id } }),

  findAllBasic: async () => Question.findAll({
    attributes: ['id','question','options','row_id','table_name','correctAnswerIndex']
  }),

  findAllTests: async () => Test.findAll({ attributes: ['id','title','number'] }),
  findAllGroups: async () => Group.findAll({ attributes: ['id','title','number'] })
};

