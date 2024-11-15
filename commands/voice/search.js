const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const { getQueue, isQueueEmpty, addToQueue, clearQueue } = require('./util/queueUtil');
const { default: YouTube } = require('youtube-sr');
const { AudioPlayerStatus, createAudioPlayer } = require('@discordjs/voice');
const { playAudio } = require('./util/playUtil');
const { joinVoice } = require('./util/voiceUtil');
const { getURL } = require('yt-stream');
const { UNABLE_TO_JOIN_CHANNEL } = require('./constant/errMsg');

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
        await interaction.deferReply();

        const connection = joinVoice(interaction);
        const keyword = interaction.options.getString("keyword");
        let replyMsg = "";

        if (!connection) {
            replyMsg = UNABLE_TO_JOIN_CHANNEL;

            await interaction.editReply({
                content: replyMsg,
                ephemeral: true
            });

            return;
        }

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
                    .setDescription("(" + video.durationFormatted + ") - " + video.channel.name)
                    .setValue(String(i))
            );
        })

        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Cancel")
                .setValue("cancel")
            );

        const row = new ActionRowBuilder()
			.addComponents(select);

		const response = await interaction.editReply({
            content: replyMsg,
			components: [row],
            ephemeral: true
        });

        try {
            const responseObj = await response.awaitMessageComponent({time: 60_000});
            const selected = responseObj.values[0];

            if ("cancel" == selected) {
                replyMsg = "Canceled!";

                await interaction.editReply({ 
                    content: replyMsg, 
                    components: []
                });

                return;
            }

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
