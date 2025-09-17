const slugify = require('slugify');

module.exports = (con, DataTypes) => {
    const Test = con.define('tests', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: DataTypes.STRING
    }, {
        timestamps: true,
    });

    Test.beforeCreate((test) => {
        test.slug = test.title.trim().replace(/\s+/g, '-')
    });
    Test.beforeUpdate((test) => {
        test.slug = test.title.trim().replace(/\s+/g, '-')
    });

    return Test;
}