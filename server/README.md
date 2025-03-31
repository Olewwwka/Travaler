# Travaller Server

Бэкенд-сервер для приложения Travaller, построенный с использованием Node.js, Express и TypeScript.

## Требования

- Node.js (версия 14 или выше)
- MongoDB (версия 4.4 или выше)
- npm или yarn

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/travaller.git
cd travaller/server
```

2. Установите зависимости:
```bash
npm install
# или
yarn install
```

3. Создайте файл .env на основе .env.example и настройте переменные окружения:
```bash
cp .env.example .env
```

4. Запустите MongoDB:
```bash
# Убедитесь, что MongoDB запущена на вашей системе
```

## Разработка

Для запуска сервера в режиме разработки:
```bash
npm run dev
# или
yarn dev
```

## Сборка

Для сборки проекта:
```bash
npm run build
# или
yarn build
```

## Запуск

Для запуска собранного проекта:
```bash
npm start
# или
yarn start
```

## Тестирование

Для запуска тестов:
```bash
npm test
# или
yarn test
```

## API Endpoints

### Аутентификация
- POST /api/auth/register - Регистрация нового пользователя
- POST /api/auth/login - Вход в систему
- POST /api/auth/logout - Выход из системы

### Профиль
- GET /api/profile - Получение профиля пользователя
- PUT /api/profile - Обновление профиля
- PUT /api/profile/password - Изменение пароля

### Точки интереса
- GET /api/points - Получение списка точек
- GET /api/points/:id - Получение детальной информации о точке
- POST /api/points - Создание новой точки
- PUT /api/points/:id - Обновление точки
- DELETE /api/points/:id - Удаление точки
- POST /api/points/:id/favorite - Добавление точки в избранное
- DELETE /api/points/:id/favorite - Удаление точки из избранного

### Отзывы
- GET /api/reviews - Получение списка отзывов
- POST /api/reviews - Создание нового отзыва
- PUT /api/reviews/:id - Обновление отзыва
- DELETE /api/reviews/:id - Удаление отзыва

## Структура проекта

```
server/
├── src/
│   ├── config/         # Конфигурационные файлы
│   ├── controllers/    # Контроллеры
│   ├── middleware/     # Middleware
│   ├── models/        # Mongoose модели
│   ├── routes/        # Маршруты
│   ├── services/      # Бизнес-логика
│   ├── utils/         # Вспомогательные функции
│   └── app.ts         # Основной файл приложения
├── tests/             # Тесты
├── .env              # Переменные окружения
├── .gitignore       # Игнорируемые файлы
├── package.json     # Зависимости и скрипты
├── tsconfig.json    # Конфигурация TypeScript
└── README.md        # Документация
```

## Лицензия

MIT 