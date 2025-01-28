const { Telegraf } = require('telegraf');
const fs = require('fs');
const express = require('express');
const path = require('path');
const axios = require('axios');

// Récupérer le token du bot depuis le fichier
const tokenPath = path.resolve(__dirname, 'account.dev.txt');
const token = fs.readFileSync(tokenPath, 'utf-8').trim();

if (!token) {
    throw new Error('Token not found. Please ensure account.dev.txt contains your bot token.');
}

const bot = new Telegraf(token);
const app = express();

const PORT = process.env.PORT || 3000;
const URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

// Ajouter les commandes au menu Telegram
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

// Servir des fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ajouter des gestionnaires pour chaque commande
bot.command('start', (ctx) => {
    ctx.reply('Bienvenue ! Je suis votre bot Telegram. Utilisez /help pour voir toutes les commandes disponibles.');
});

bot.command('help', (ctx) => {
    ctx.reply('Voici une liste des commandes disponibles :\n' +
        '/start - Démarrer le bot\n' +
        '/help - Afficher l\'aide\n' +
        '/translate - Traduire un texte\n' +
        '/imgbb - Uploader une image sur IMGBB\n' +
        '/getid - Obtenir votre ID utilisateur Telegram\n' +
        '/ai - Interroger l\'IA\n' +
        '/admin - Commandes administratives (pour admin seulement)');
});

bot.command('translate', (ctx) => {
    ctx.reply('Veuillez entrer le texte que vous souhaitez traduire.');
});

bot.command('imgbb', (ctx) => {
    ctx.reply('Envoyez une image à uploader sur IMGBB.');
});

bot.command('getid', (ctx) => {
    ctx.reply(`Votre ID utilisateur est : ${ctx.from.id}`);
});

bot.command('ai', async (ctx) => {
    const prompt = ctx.message.text.split(' ').slice(1).join(' ');
    if (!prompt) {
        return ctx.reply('Veuillez fournir une question ou un texte à analyser.');
    }

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

bot.command('admin', (ctx) => {
    if (ctx.from.id !== 123456789) { // Remplacez 123456789 par votre ID Telegram
        return ctx.reply('❌ Vous n\'êtes pas autorisé à utiliser cette commande.');
    }
    ctx.reply('Bienvenue, admin. Que souhaitez-vous faire ?');
});


bot.on('text', async (ctx) => {
    const prompt = ctx.message.text;
    const senderId = ctx.from.id;

    try {
        const { data: { response } } = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o?q=${encodeURIComponent(prompt)}&uid=${senderId}`); // thank you kaiz

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
