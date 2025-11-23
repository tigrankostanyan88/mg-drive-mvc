// models/Test.js
module.exports = (con, DataTypes) => {
    const Test = con.define('tests', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        title: {
            type: DataTypes.STRING,
            allowNull: false
        },

        number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            index: true
        },

        slug: DataTypes.STRING,
    }, {
        timestamps: true,
        indexes: [
            { fields: ['number'] },
            { fields: ['slug'] }
        ]
    });

    Test.beforeCreate((test) => {
        const match = test.title.match(/\d+/);
        test.number = match ? parseInt(match[0]) : 0;
        test.title = test.title.replace(/\d+/g, '').trim();
        test.slug = test.title.toLowerCase().replace(/\s+/g, '-');
    });

    Test.beforeUpdate((test) => {
        const match = test.title.match(/\d+/);
        test.number = match ? parseInt(match[0]) : 0;
        test.title = test.title.replace(/\d+/g, '').trim();
        test.slug = test.title.toLowerCase().replace(/\s+/g, '-');
    });

    return Test;
};
