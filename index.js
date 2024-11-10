const TelegramApi = require('node-telegram-bot-api')
const options = require('./options');
const constants = require('./constants');
const sequelize = require('./db');
const {TOKEN} = constants
const {gameOptions, againOptions} = options

const UserModel = require('./models')


const bot = new TelegramApi(TOKEN, {polling: true})

const chats = {}



const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю число от 0 до 9, а ты отгадай его');
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (error) {
        console.log('ERR: DB CONNECT')
    }

    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Информация о пользователе'},
        {command: '/game', description: 'Поиграй со мной'},
        {command: '/again', description: 'Играть еще раз'}
    ])
    
    bot.on('message', async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if(text === '/start') {
                await UserModel.create({chatId})
                return bot.sendMessage(chatId, `Привет ${msg.from.first_name}! Добро пожаловать!`);
            }
        
            if(text === '/info') {
                const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Привет, ${msg.from?.first_name || ''} ${msg.from?.last_name || ''}! В игре у тебя правильных ответов - ${user.right}, неправильных - ${user.wrong}`);
            }
    
            if(text === '/game') {
                return startGame(chatId);
            }
    
    
            return bot.sendMessage(chatId, 'Моя твоя не понимать');
        } catch (error) {
            return bot.sendMessage(chatId, 'Произошла ошибка')
        }
    })

    bot.on('callback_query', async (msg) => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if(data == '/again') {
            return startGame(chatId);
        }

        const user = await UserModel.findOne({chatId})

        if(data == chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${data}`, againOptions)
        } else {
            user.wrong += 1;
            await bot.sendMessage(chatId, `К сожалению, ты не отгадал цифру. Правильный ответ равен ${chats[chatId]}`, againOptions)
        }

        await user.save();
    })
}

start()