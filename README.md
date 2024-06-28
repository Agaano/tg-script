# О приложении
Это приложение необходимо для отправления сообщений в Telegram каналах по определённому шаблону. Оно работает следующим образом: 
1. Ставится счётчик.
2. С каждым отправленным в указанном канале постом счётчик будет уменьшаться.
3. Когда счётчик достигает нуля, ставится таймер.
4. По истечению таймера отправляется сообщение с определённым паттерном.
5. Ставится ещё один счётчик и алгоритм повторяется с пункта 1.

Пример: 

```cmd
Сообщение будет опубликовано через 4 поста(-ов)
Сообщение будет опубликовано через 3 поста(-ов)
Сообщение будет опубликовано через 2 поста(-ов)
Сообщение будет опубликовано через 1 поста(-ов)
Сообщение будет отправлено через 2.873s
Следующее сообщение будет опубликовано через 6 поста(-ов)
Сообщение будет опубликовано через 5 поста(-ов)
Сообщение будет опубликовано через 4 поста(-ов)
Сообщение будет опубликовано через 3 поста(-ов)
Сообщение будет опубликовано через 2 поста(-ов)
Сообщение будет опубликовано через 1 поста(-ов)
Сообщение будет отправлено через 2.772s

```

## Запуск и установка

Для установки проекта просто склонируй репозиторий в нужную тебе директорию, или скачай архив с гитхаба и распакуй.
Для запуска проекта тебе нужен установленный NodeJS на компьютере. 

Проверить наличие NodeJS можно при помощи команды `node --version`, а так же `npm --version`
Если при вводе этих команд выдаёт ошибку значит NodeJS не установлен.
Установить его можно здесь - [NodeJS](https://nodejs.org/en)

После успешной установки ноды необходимо ввести несколько команд для запуска приложения. 
1. `npm i` - для установки зависимостей проекта
2. `npm run start` - для запуска проекта

Но перед тем как запускать приложение необходимо заполнить файл "api.json". 
Там хранятся апи ключи для доступа к Telegram API.
Получить их можно перейдя по следующей ссылке - https://my.telegram.org/ и выполнив следующие действия:
1. Войти в свой телеграм аккаунт
2. Затем нажать кнопку "API Development tools" и заполнить данные приложения (требуется только название приложения и краткое имя)
3. Наконец, нажать кнопку "Create application"

После этого в поле App api_id и App api_hash будут храниться нужные поля. Их необходимо скопировать и вставить в соответствующие поля в файле "api.json"
Всё! Теперь при запуске приложения необходимо войти в аккаунт (только один раз, в следующий раз приложение запомнит сессию и запишет её в тот же "api.json")

## Настройка

Настройка приложения происходит в файле "message.json". Здесь можно настроить вид самого сообщения, канал в который это сообщение будет отправляться, задержку перед отправкой (минимальную, максимальную), через сколько постов будет отправляться сообщение и, конечно же, список никнеймов пользователей. 
Далее будет пояснение по каждому полю файла "message.json":
- `"channel-name"` - Название канала. Необходимо ввести именно отображаемое название поскольку искать оно будет именно по свойству title
- `"min-delay"`, `"max-delay"` - Диапазон задержки перед отправлением сообщения. Указывается в миллисекундах
- `"min-posts-count"`, `"max-posts-count"` - Диапазон количества постов перед отправлением сообщения.
- `"raw-content"` - Плоская составляющая сообщения, т.е. по сути всё сообщение содержится именно здесь. Место куда должен вставляться никнейм пользователя помечается как "$user$" и место куда должно вставляться действие пользователя помечается как "$action$". 
- `"actions"` - Список возможных действий, будет выбираться одно из действий и вставляться в итоговое сообщение.
- `"users"` - Список имён пользователей. 