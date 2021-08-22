module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        user_email: {
            type: Sequelize.STRING
        },
        code: {
            type: Sequelize.STRING
        }
    });

    return User;
};