const DB = require('../utils/db');

const connect = DB.con;
const Sequelize = DB.Sequelize;

DB.models = {
  User: require('./user')(connect, Sequelize.DataTypes),
  Test: require('./test')(connect, Sequelize.DataTypes),
  Group: require('./groups')(connect, Sequelize.DataTypes),
  Question: require('./question')(connect, Sequelize.DataTypes),
  Registration: require('./registrations')(connect, Sequelize.DataTypes),
  Review: require('./review')(connect, Sequelize.DataTypes),
  File: require('./file')(connect, Sequelize.DataTypes),
}

DB.models.User.hasMany(DB.models.File, {
  foreignKey: 'row_id',
  as: 'files',
  constraints: false,
  scope: {
    name_used: 'user_img'
  }
});


DB.models.File.belongsTo(DB.models.User, {
  foreignKey: 'row_id',
  as: 'files',
  constraints: false,
  scope: {
    name_used: 'user_img'
  }
});



DB.models.Test.hasMany(DB.models.Question, {
  foreignKey: 'row_id',
  as: 'questions',
  constraints: false,
  scope: {
    row_type: 'test'
  }
});

DB.models.Question.belongsTo(DB.models.Test, {
  foreignKey: 'row_id',
  as: 'test',
  constraints: false
});

DB.models.Group.hasMany(DB.models.Question, {
  foreignKey: 'row_id',
  as: 'questions',
  constraints: false,
  scope: {
    row_type: 'group'
  }
});

DB.models.Question.belongsTo(DB.models.Group, {
  foreignKey: 'row_id',
  as: 'group',
  constraints: false
});


DB.models.Question.hasMany(DB.models.File, {
  foreignKey: 'row_id',
  as: 'files',
  constraints: false,
});
DB.models.File.belongsTo(DB.models.Question, {
  foreignKey: 'row_id',
  as: 'question',
  constraints: false
});


module.exports = DB;