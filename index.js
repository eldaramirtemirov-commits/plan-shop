const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
// НАСТРОЙКИ ТЕЛЕГРАМ-БОТА (вставьте свои данные)
const TG_TOKEN = '8259253933:AAHJTXzS8oo2HpJh0IEuxbWFKAvATM2HbWU';
const MY_CHAT_ID = '2126226102';

const server = http.createServer((req, res) => {
    // 1. Главная страница магазина
    if (req.url === '/' || req.url === '/index.html') {
        const filePath = path.join(__dirname, 'public', 'index.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ошибка: Проверьте, что в папке public есть файл index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            }
        });
    } 
    // 2. Подключение стилей CSS
    else if (req.url === '/style.css') {
        const filePath = path.join(__dirname, 'public', 'style.css');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end();
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(content);
            }
        });
    } 
    else if (req.url === '/agreement.html') {
    const filePath = path.join(__dirname, 'public', 'agreement.html');
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Файл agreement.html не найден в папке public');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
        }
    });
}
    else if (req.url === '/privacy.html') {
        const filePath = path.join(__dirname, 'public', 'privacy.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Файл privacy.html не найден в папке public');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            }
        });
    }

    // 3. Обработка клика по кнопке "Купить"
    else if (req.url === '/api/create-order' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.log(`[МАГАЗИН] Игрок ${data.nickname} выбрал товар: ${data.item}`);
                let orderDetails = data.item === 'tokens' ? `${data.count} токенов` : `Привилегия [${data.item.toUpperCase()}]`;
            
            // Расчет цены для вывода в Telegram
            let price = 0;
            if (data.item === 'tokens') price = (parseInt(data.count) || 0) * 2;
            else {
                if (data.item === 'hero') price = 49;
                if (data.item === 'duke') price = 99;
                if (data.item === 'baron') price = 149;
                if (data.item === 'pluto') price = 279;
                if (data.item === 'magister') price = 399;
                if (data.item === 'overlord') price = 599;
                if (data.item === 'hydra') price = 999;
            }

            const message = `🔔 *НОВАЯ ПОПЫТКА ПОКУПКИ!* 🔔\n\n` +
                            `👤 Игрок: \`${data.nickname}\`\n` +
                            `📦 Товар: ${orderDetails}\n` +
                            `💰 Сумма: ${price} руб.\n\n` +
                            `⌨️ Команда для выдачи на Aternos:\n` +
                            (data.item === 'tokens' 
                                ? `\`/give ${data.nickname} token ${data.count}\`` 
                                : `\`/setgroup "${data.nickname}" ${data.item}\``);

            // Вызываем функцию, которую мы создали в самом низу файла
            sendTelegramMessage(message);
                // Временный переход на заглушку оплаты, пока вы не выберете кассу
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ url: 'https://lava.ru' })); 
            } catch (e) {
                res.writeHead(400);
                res.end();
            }
        });
    } 
    // 4. Если страница не найдена
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Page Not Found');
    }
});

// Функция для отправки уведомлений в Telegram через встроенный модуль HTTPS
function sendTelegramMessage(text) {
    const https = require('https');
    
    // Перепишите функцию в самом верху или внизу index.js
function sendTelegramMessage(text) {
    return new Promise((resolve) => {
        const https = require('https');
        const encodedText = encodeURIComponent(text);
        const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage?chat_id=${MY_CHAT_ID}&text=${encodedText}&parse_mode=Markdown`;

        https.get(url, (res) => {
            resolve(true); // Успешно дождались ответа от ТГ
        }).on('error', (e) => {
            console.error('[ОШИБКА ТГ]', e.message);
            resolve(false); // Ошибка, но сервер не зависнет
        });
    });
}
server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` МАГАЗИН "Plan Shop For Ore" УСПЕШНО ЗАПУЩЕН!`);
    console.log(` Откройте в браузере адрес: http://localhost:${PORT}`);
    console.log(`==================================================`);
});
