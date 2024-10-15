const { SlashCommandBuilder } = require('discord.js');
const { JoinVoiceChannel } = require('./inner/joinVoiceChannel');
const { createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('play a youtube video!')
        .addStringOption(option => 
            option
                .setName("url")
                .setDescription("the youtube url")
                .setRequired(true)
        ),
	async execute(interaction) {
        const connection = JoinVoiceChannel(interaction);
        const url = interaction.options.getString("url");
        const player = createAudioPlayer();
        let replyMsg = "playing!";

        if (!connection) {
            replyMsg = "failed to join channel!";

            await interaction.reply({
                content: replyMsg,
                ephemeral: true
            });

            return;
        }

        const ytSource = ytdl(url, {
            filter : 'audioonly',
            dlChunkSize: 0,
        });
        const audioResource = createAudioResource(ytSource);
        player.play(audioResource);
        connection.subscribe(player);

        player.on('error', error => {
            console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
        });

        await interaction.reply({
            content: replyMsg,
            ephemeral: true
        });
	},
};