const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// НАСТРОЙКИ ТЕЛЕГРАМ-БОТА (Убедитесь, что здесь стоят ваши реальные ключи в кавычках!)
const TG_TOKEN = '8259253933:AAHJTXzS8oo2HpJh0IEuxbWFKAvATM2HbWU';
const MY_CHAT_ID = '2126226102';

// Асинхронная функция отправки уведомления в Telegram
function sendTelegramMessage(text) {
    return new Promise((resolve) => {
        const https = require('https');
        const encodedText = encodeURIComponent(text);
        const url = `https://telegram.org{TG_TOKEN}/sendMessage?chat_id=${MY_CHAT_ID}&text=${encodedText}&parse_mode=Markdown`;

        https.get(url, (res) => {
            resolve(true); 
        }).on('error', (e) => {
            console.error('[ОШИБКА ТГ]', e.message);
            resolve(false); 
        });
    });
}

const server = http.createServer((req, res) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');

    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
        });
    } 
    else if (req.url === '/style.css') {
        fs.readFile(path.join(__dirname, 'public', 'style.css'), (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(content);
        });
    } 
    else if (req.url === '/agreement.html') {
        fs.readFile(path.join(__dirname, 'public', 'agreement.html'), (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
        });
    } 
    else if (req.url === '/privacy.html') {
        fs.readFile(path.join(__dirname, 'public', 'privacy.html'), (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
        });
    }
    else if (req.url === '/api/create-order' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                console.log(`[МАГАЗИН] Игрок ${data.nickname} выбрал товар: ${data.item}`);
                
                let price = 0;
                if (data.item === 'tokens') {
                    const count = parseInt(data.count) || 0;
                    price = count * 2;
                } else {
                    if (data.item === 'hero') price = 49;
                    if (data.item === 'duke') price = 99;
                    if (data.item === 'baron') price = 149;
                    if (data.item === 'pluto') price = 279;
                    if (data.item === 'magister') price = 399;
                    if (data.item === 'overlord') price = 599;
                    if (data.item === 'hydra') price = 999;
                }
                
                let orderDetails = data.item === 'tokens' ? `${data.count} токенов` : `Привилегия [${data.item.toUpperCase()}]`;

                const message = `🔔 *НОВАЯ ПОПЫТКА ПОКУПКИ!* 🔔\n\n` +
                                `👤 Игрок: \`${data.nickname}\`\n` +
                                `📦 Товар: ${orderDetails}\n` +
                                `💰 Сумма: ${price} руб.\n\n` +
                                `⌨️ Команда для выдачи на Aternos:\n` +
                                (data.item === 'tokens' 
                                    ? `\`/give ${data.nickname} token ${data.count}\`` 
                                    : `\`/setgroup "${data.nickname}" ${data.item}\``);

                // Ждем отправку в Telegram
                await sendTelegramMessage(message);
                
                // Исправленная тестовая ссылка для прохождения модерации в Lava
                const testUrl = `https://lava.ru{testPrice}&text=Donate_Minecraft`;
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ url: testUrl })); 
            } catch (e) {
                res.writeHead(400);
                res.end();
            }
        });
    } 
    else {
        res.writeHead(404);
        res.end('404 Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Магазин запущен на порту ${PORT}`);
});
