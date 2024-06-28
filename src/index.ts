import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import readline from "readline";

import fs from 'fs';
import { NewMessage } from "telegram/events";

function readJSON(path: string): Promise<objType> {
    const rStream = fs.createReadStream(path);
    const data: string[] = [];
    rStream.on('data', (chunk) => {
        data.push(chunk.toString('utf-8'))
    })
    return new Promise((resolve, reject) => {
        rStream.on('end', () => {
            try {
                const obj = JSON.parse(data.join(''))
                resolve(obj)
            } catch (err) {
                reject(err)
            } finally {
                rStream.close();
            }
        })
    })
}

type objType = {[key: string]: any}

async function writeJSON(path: string, json: objType) {
    const prevJson: objType = await readJSON(path);
    Object.keys(json).map((key) => {
        prevJson[key] = json[key]
    })
    const wStream = fs.createWriteStream(path);
    wStream.write(JSON.stringify(prevJson, null, 2))
    wStream.end();
}

function random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateMessage(path: string) {
    const messageConfig = await readJSON(path);
    if (!messageConfig['raw-content'] || !messageConfig['users'] || !messageConfig['actions']) {
        console.error(` 
            Тебе нужно вручную заполнить файл конфигурации сообщения ("message.json"). \n
            Поле raw-content отвечает за плоскую составляющую сообщения \n 
            Поле users - массив имён пользователей \n 
            Поле actions - массив "действий" которые пользователь выполнил. \n 
            Если ты где то потерял изначальное сообщение, напиши мне и я скину пример.
        `)
        return;
    }

    let message: string = messageConfig['raw-content'];
    
    const users: string[] = messageConfig['users'];
    const actions: string[] = messageConfig['actions'];
    
    const user = users[random(0, users.length - 1)];
    const action = actions[random(0, actions.length - 1)];

    message = message.replace('$user$', user);
    message = message.replace('$action$', action);
    return message;
}
 
async function getClient(): Promise<TelegramClient | undefined> {
    const apiObj = await readJSON('./src/api.json');
    if (!apiObj.apiId || !apiObj.apiHash) {
        console.error(` 
            Введи API ID и API Hash в файле "api.json". Получить ты их можешь перейдя по ссылке https://my.telegram.org/.\n 
            Там необходимо авторизоваться и после этого нажать на кнопку API Development Tools, и заполнить форму.\n 
            После нажатия на кнопку Create Application можно будет скопировать значения полей api_id и api_hash и вставить в файл "api.json".
        `)
        return;
    }
    const apiId = +apiObj.apiId;
    const apiHash = apiObj.apiHash;
    const stringSession = new StringSession(apiObj.stringSession);
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const client = new TelegramClient(stringSession, apiId, apiHash, {connectionRetries: 5});
    await client.start({
        phoneNumber: async () =>
            new Promise((resolve) =>
                rl.question("Please enter your number: ", resolve)
            ),
        password: async () =>
            new Promise((resolve) =>
                rl.question("Please enter your password: ", resolve)
            ),
        phoneCode: async () =>
            new Promise((resolve) =>
                rl.question("Please enter the code you received: ", resolve)
            ),
        onError: (err) => console.log(err),
    });
    console.log('Успешно подключен')
    await writeJSON('./src/api.json', {stringSession: client.session.save()});
    
    return client;
}

async function getChannel(client: TelegramClient) {
    const dialogs = await client.getDialogs();
    const channelName = (await readJSON('./src/message.json'))['channel-name']
    return dialogs.find((dialog) => dialog.title === channelName);
}

async function start() {
    const client = await getClient();
    if (!client) return;
    const channel = await getChannel(client)
    if (!channel) return;

    //@ts-ignore
    if (!channel.entity?.adminRights || !channel.entity?.adminRights.postMessages) {
        console.error('Ты должен быть админом и иметь право отправлять сообщения в указанном тг канале')
        return;
    }

    const newMessageEvent = new NewMessage({fromUsers: [channel.inputEntity]}); 
    const messageConfig = await readJSON('./src/message.json');
    const minDelay = messageConfig['min-delay']
    const maxDelay = messageConfig['max-delay']
    const minPostsCount = messageConfig['min-posts-count']
    const maxPostsCount = messageConfig['max-posts-count']
    let counter = 0;
    let limit = random(minPostsCount,maxPostsCount);
    console.log(`Сообщение будет опубликовано через ${limit - counter} поста(-ов)`)
    
    client.addEventHandler(async () => {
        counter++;
        
        if (limit <= counter) {
            counter = 0;
            limit = random(minPostsCount,maxPostsCount);
            const timeout = random(minDelay,maxDelay);
            console.log(`Сообщение будет отправлено через ${timeout / 1000}s`)
            console.log(`Следующее сообщение будет опубликовано через ${limit - counter} поста(-ов)`)
            setTimeout(async () => {
                const message = await generateMessage('./src/message.json')
                client.sendMessage(channel.inputEntity, {message})
            }, timeout)
        } else console.log(`Сообщение будет опубликовано через ${limit - counter} поста(-ов)`) 
    },  newMessageEvent)

}


start();