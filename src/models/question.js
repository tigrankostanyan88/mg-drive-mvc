module.exports = (con, DataTypes) => {
    const Question = con.define('questions', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        row_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        row_type: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        question: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        correctAnswerIndex: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        options: {
            type: DataTypes.JSON,
            allowNull: true
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: con.literal("CURRENT_TIMESTAMP"),
            allowNull: false
        }
    });
    return Question;
}