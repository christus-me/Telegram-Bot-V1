const { Markup } = require('telegraf');

module.exports = (bot) => {
    bot.command('help', (ctx) => {
        const commands = [
            { command: '/ai', description: '🤖 ai' },
            { command: '/help', description: 'ℹ️ help' },
            { command: '/admin', description: '🤴🏽admin' },
            { command: '/addadmin', description: '➕Ajouter un admin' },
            { command: '/removeadmin', description: '➖Retirer un admin' },
            { command: '/translate', description: 'Translate' },
            { command: '/getid', description: '🆔 ID Telegram' },
            { command: '/imgbb', description: ' 🏞️ imgbb 🔗' },
            { command: '/start', description: '🔹Demarrer🔸' },
        ];

        // Création des boutons inline
        const buttons = commands.map(cmd => [Markup.button.callback(cmd.description, cmd.command)]);

        // Réponse avec un texte d'information et des boutons inline
        ctx.reply(
            '📜 *Liste des commandes disponibles :*',
            Markup.inlineKeyboard(buttons) // Affichage des boutons
        );
    });

    // Gérer les interactions avec les boutons inline
    bot.action(/\/.*/, (ctx) => {
        ctx.answerCbQuery(); // Ferme la notification du bouton

        const command = ctx.match[0]; // récupère la commande associée au bouton
        // Affiche la commande cliquée
        ctx.reply(`*COMMANDE*\n╭──━━━\n├─ ${command}\n╰──━━━`);
    });
};
