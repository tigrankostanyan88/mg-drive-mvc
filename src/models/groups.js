module.exports = (con, DataTypes) => {
    const Groups = con.define('groups', {
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
        text: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        slug: DataTypes.STRING,
        date: {
            type: DataTypes.DATE,
            defaultValue: con.literal("CURRENT_TIMESTAMP"),
            allowNull: false
        }
    });

    Groups.beforeCreate((groups) => {
        groups.slug = groups.title.trim().replace(/\s+/g, '-')
    });
    Groups.beforeUpdate((groups) => {
        groups.slug = groups.title.trim().replace(/\s+/g, '-')
    });

    return Groups;
}