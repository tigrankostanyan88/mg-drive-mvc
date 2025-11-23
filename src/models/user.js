const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = (con, DataTypes) => {
    const User = con.define('users', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ""
        },

        address: DataTypes.STRING,
        age: DataTypes.INTEGER,

        role: {
            type: DataTypes.ENUM('user', 'team-member', 'student', 'teacher', 'admin'),
            defaultValue: 'user'
        },

        experience: DataTypes.STRING,
        biography: DataTypes.TEXT,
        specialization: DataTypes.STRING,
        certificates: DataTypes.STRING,
        education: DataTypes.STRING,

        number_of_students: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true }
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false
        },

        passwordChangedAt: DataTypes.DATE,
        passwordResetToken: DataTypes.STRING,
        passwordResetExpires: DataTypes.DATE,

        date: {
            type: DataTypes.DATE,
            defaultValue: con.literal("CURRENT_TIMESTAMP"),
            allowNull: false
        },

        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        defaultScope: {
            where: { deleted: false }
        },

        scopes: {
            withDeleted: {} // we can manually include deleted if needed
        },

        indexes: [
            { unique: true, fields: ['email'] },
            { fields: ['deleted'] }
        ],

        hooks: {
            // Hash password only if modified
            beforeSave: async (user) => {
                if (user.changed('password')) {
                    user.password = await bcrypt.hash(user.password, 10);
                    user.passwordChangedAt = new Date(Date.now() - 1000);

                    // clear reset token if pass changed
                    user.passwordResetToken = null;
                    user.passwordResetExpires = null;
                }
            }
        }
    });

    // ------- INSTANCE METHODS -------

    User.prototype.correctPassword = function (candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    };

    User.prototype.changedPasswordAfter = function (JWTTimestamp) {
        if (!this.passwordChangedAt) return false;

        const changedTS = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTS;
    };

    User.prototype.createPasswordResetToken = function () {
        const resetToken = crypto.randomBytes(32).toString('hex');

        this.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

        return resetToken;
    };

    return User;
};
