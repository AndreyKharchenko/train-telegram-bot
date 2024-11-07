const TelegramApi = require('node-telegram-bot-api')
const options = require('./options')
const {gameOptions, againOptions} = options

const token = '8094153597:AAEHogGR3twOLfCxMh47dIVTo3xrJEnve7A'

const bot = new TelegramApi(token, {polling: true})

const chats = {}



const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю число от 0 до 9, а ты отгадай его');
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber.toString();
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Информация о пользователе'},
        {command: '/game', description: 'Поиграй со мной'},
        {command: '/again', description: 'Играть еще раз'}
    ])
    
    bot.on('message', async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;
        if(text === '/start') {
            return bot.sendMessage(chatId, `Привет ${msg.from.first_name}! Добро пожаловать!`);
        }
    
        if(text === '/info') {
            return bot.sendMessage(chatId, `Привет, ${msg.from?.first_name || ''} ${msg.from?.last_name || ''}!`);
        }

        if(text === '/game') {
            return startGame(chatId);
        }


        return bot.sendMessage(chatId, 'Моя твоя не понимать');
    })

    bot.on('callback_query', async (msg) => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if(data == '/again') {
            return startGame(chatId);
        }

        if(data === chats[chatId]) {
            return await bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${data}`, againOptions)
        } else {
            return await bot.sendMessage(chatId, `К сожалению, ты не отгадал цифру. Правильный ответ равен ${chats[chatId]}`, againOptions)
        }
    })
}

start()