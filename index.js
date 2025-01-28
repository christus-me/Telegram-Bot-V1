module.exports = {
    log: message => console.log(`[LOG] ${message}`),
    error: message => console.error(`[ERREUR] ${message}`),
};

const { Telegraf } = require('telegraf');
const fs = require('fs');
const express = require('express');
const path = require('path');
const axios = require('axios');

const tokenPath = path.resolve(__dirname, 'account.dev.txt');
const token = fs.readFileSync(tokenPath, 'utf-8').trim();

if (!token) {
    throw new Error('Token not found. Please ensure account.dev.txt contains your bot token.');
}

const bot = new Telegraf(token);
const app = express();

const PORT = process.env.PORT || 3000;
const URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(file => {
    if (file.endsWith('.js')) {
        const command = require(path.join(commandsPath, file));
        command(bot);
    }
});

bot.telegram.setMyCommands([
    { command: 'start', description: 'Démarrer le bot' },
    { command: 'help', description: 'Afficher l\'aide' },
    { command: 'translate', description: 'Traduire un texte' },
    { command: 'imgbb', description: 'Uploader une image sur IMGBB' },
    { command: 'getid', description: 'Obtenir votre ID utilisateur Telegram' },
    { command: 'ai', description: 'Interroger l\'IA' },
    { command: 'admin', description: 'Commandes administratives (pour admin seulement)' },
    
]).then(() => {
    console.log('✅ Commandes ajoutées avec succès au menu du bot.');
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

bot.on('text', async (ctx) => {
    const prompt = ctx.message.text;

    try {
        const { data: { response } } = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o?q=${encodeURIComponent(prompt)}&uid=${ctx.from.id}`); // thank you kaiz

        const parts = [];
        for (let i = 0; i < response.length; i += 1999) {
            parts.push(response.substring(i, i + 1999));
        }

        for (const part of parts) {
            await ctx.reply(part);
        }
    } catch (error) {
        ctx.reply('Une erreur est survenue lors de la génération de la réponse. Veuillez réessayer plus tard.');
        console.error('Erreur lors de l\'appel à l\'API GPT-4o:', error.message);
    }
});

bot.telegram.setWebhook(`${URL}/bot${token}`);
app.use(bot.webhookCallback(`/bot${token}`));

app.listen(PORT, () => {
    console.log(`
0%   ▒▒▒▒▒▒▒▒▒▒
10%  █▒▒▒▒▒▒▒▒▒
20%  ██▒▒▒▒▒▒▒▒
30%  ███▒▒▒▒▒▒▒
40%  ████▒▒▒▒▒▒
50%  █████▒▒▒▒▒
60%  ██████▒▒▒▒
70%  ███████▒▒▒
80%  ████████▒▒
90%  █████████▒
100% ██████████
✅ Made by RONALD SORY ホ 
✅ Bot lancé avec succès sur : ${URL}`);
});
