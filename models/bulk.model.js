module.exports = (sequelize, Sequelize) => {
    const Bulk = sequelize.define("bulk", {
        user_email: {
            type: Sequelize.STRING
        },
        code: {
            type: Sequelize.STRING
        },
        address: {
            type: Sequelize.STRING
        },
        sendto: {
            type: Sequelize.STRING
        },
        cc: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        }
    });

    return Bulk;
};