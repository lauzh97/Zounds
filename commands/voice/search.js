const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const { getQueue, isQueueEmpty, addToQueue } = require('./util/queueUtil');
const { default: YouTube } = require('youtube-sr');
const { AudioPlayerStatus, createAudioPlayer } = require('@discordjs/voice');
const { playAudio } = require('./util/playUtil');
const { joinVoice } = require('./util/voiceUtil');
const { getURL } = require('yt-stream');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('search for music!')
        .addStringOption(option => 
            option
                .setName("keyword")
                .setDescription("the music keyword (e.g. title)")
                .setRequired(true)
        ),
	async execute(interaction) {
        const connection = joinVoice(interaction);
        const keyword = interaction.options.getString("keyword");
        let replyMsg = "";

        const videos = await YouTube.search(keyword, {
            limit: 10
        });

        const select = new StringSelectMenuBuilder()
            .setCustomId("select")
            .setPlaceholder("Select a music to play it!")

        videos.forEach((video, i) => {
            select.addOptions(
				new StringSelectMenuOptionBuilder()
                    .setLabel(video.title)
                    .setDescription(video.channel.name)
                    .setValue(String(i))
            );
        })

        const row = new ActionRowBuilder()
			.addComponents(select);

		const response = await interaction.reply({
            content: replyMsg,
			components: [row]
        });

        try {
            const responseObj = await response.awaitMessageComponent({time: 60_000});
            const selected = responseObj.values[0];

            addToQueue(getURL(videos[Number(selected)].id));
            replyMsg = "added to queue!";

            if (!global.player) {
                global.player = createAudioPlayer();
            }
    
            // play next in queue if AudioPlayer is not playing anything
            if (AudioPlayerStatus.Idle == global.player.state.status) {
                if (isQueueEmpty()) return;
        
                const ytInfo = playAudio(connection, getQueue().shift());
                replyMsg = "now playing: " + (await ytInfo).title;
            }
            
            global.player.on(AudioPlayerStatus.Idle, () => {
                if (!isQueueEmpty()) {
                    playAudio(connection, getQueue().shift());
                }
            });

            await interaction.editReply({ 
                content: replyMsg, 
                components: []
            });
        } catch (e) {
            console.log(e);
            await interaction.editReply({ 
                content: 'Search error!', 
                components: [],
                ephemeral: true
            });
        }
	},
};
