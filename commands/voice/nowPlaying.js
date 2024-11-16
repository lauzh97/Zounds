const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getURL } = require('yt-stream');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nowplaying')
		.setDescription('show currently playing music\'s info!'),
	async execute(interaction) {
        if (!global.player || AudioPlayerStatus.Idle == global.player.state.status) {
            let replyMsg = "no music playing!";

            await interaction.reply({
                content: replyMsg
            });

            return;
        }

        const nowPlayingEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(global.nowPlaying.title)
            .setURL(getURL(global.nowPlaying.id))
            .setAuthor({ name: global.nowPlaying.channel.name, iconURL: global.nowPlaying.channel.icon.url, url: global.nowPlaying.channel.url })
            .setDescription("Duration: " + global.nowPlaying.durationFormatted)
            .setImage(global.nowPlaying.thumbnail.url)
            .setTimestamp()

        replyMsg = "Now playing: ";

		await interaction.reply({
            content: replyMsg,
            embeds: [nowPlayingEmbed]
        });
	},
};