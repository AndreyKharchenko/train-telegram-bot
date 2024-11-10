const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'telegram_bot',
    'root',
    'root',
    {
        host: '176.114.89.221',
        port: '5432',
        dialect: 'postgres'
    }
)