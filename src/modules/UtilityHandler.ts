const axios = require('axios');
const unshortener = require('unshorten.it');
const config = require('../../config.json');
const { EmbedBuilder } = require('discord.js');

class UtilityHandler {
    constructor(client) {
        this.client = client;
        this.config = config;
        this.random = (array) => array[Math.floor(Math.random() * array.length)];
        this.supportServer = this.config.supportServer;
        this.deleteMessage = this.deleteMessage;
        this.loadingEmbed = new EmbedBuilder().setAuthor({ name: 'Loading...' });
        this.loadingText = '<a:Typing:598682375303593985> **Loading...**';
    }

    deleteMessage(interaction, id) {
        return interaction.channel.messages.fetch(id).then((message) => message.delete());
    }

    removeArrayIndex(array, indexID) {
        return array.filter((_, index) => index != indexID - 1);
    }

    checkURL(string) {
        try {
            new URL(string);
            return true;
        } catch (error) {
            return false;
        }
    }

    convertMS(ms) {
        let seconds = (ms / 1000).toFixed(1),
            minutes = (ms / (1000 * 60)).toFixed(1),
            hours = (ms / (1000 * 60 * 60)).toFixed(1),
            days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
        if (seconds < 60) return seconds + ' Sec';
        else if (minutes < 60) return minutes + ' Min';
        else if (hours < 24) return hours + ' Hrs';
        else return days + ' Days';
    }

    convertBytes(bytes) {
        const MB = Math.floor((bytes / 1024 / 1024) % 1000);
        const GB = Math.floor(bytes / 1024 / 1024 / 1024);
        if (MB >= 1000) return `${GB.toFixed(1)} GB`;
        else return `${Math.round(MB)} MB`;
    }
}

module.exports = UtilityHandler;