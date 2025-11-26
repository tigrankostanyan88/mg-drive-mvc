const DB = require('../utils/db');

const connect = DB.con;
const Sequelize = DB.Sequelize;

DB.models = {
  User: require('./user')(connect, Sequelize.DataTypes),
  Test: require('./test')(connect, Sequelize.DataTypes),
  Group: require('./Group')(connect, Sequelize.DataTypes),
  Question: require('./question')(connect, Sequelize.DataTypes),
  RegisterCourse: require('./RegisterCourse')(connect, Sequelize.DataTypes),
  Review: require('./review')(connect, Sequelize.DataTypes),
  File: require('./file')(connect, Sequelize.DataTypes),
  Contact: require('./contact')(connect, Sequelize.DataTypes),
}

// User → Files
DB.models.User.hasMany(DB.models.File, {
  foreignKey: 'row_id',
  sourceKey: 'id', 
  as: 'files',
  constraints: false,
  scope: {
    name_used: 'user_img'
  }
});

// File → User
DB.models.File.belongsTo(DB.models.User, {
  foreignKey: 'row_id',
  targetKey: 'id', 
  as: 'user',
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
    table_name: 'tests'
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
    table_name: 'groups'
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