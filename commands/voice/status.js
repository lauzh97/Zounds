const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('for debugging!'),
	async execute(interaction) {

        console.log(global.player);

		await interaction.reply({
            content: "debugging!",
            ephemeral: true
        });
	},
};