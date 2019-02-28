/**
 * Copyright (c) 2019
 *
 * Run Discord bot.
 * It launchs the bot on a specific port using "config.json".
 * Use a "." (dot) to run a command (see "commands" folder)
 *
 * @summary Brain of the bot
 * @author Valentin/Valousegawa/Telest <valou.pannacotta@gmail.com>
 *
 * Created at     : 2019-02-04 09:21:56
 * Last modified  : 2019-02-28 10:31:40
 */

const Discord = require("discord.js");
const cron = require("node-cron");
const fs = require("fs");

const config = require("../config/config.json");

const bot = new Discord.Client({ autoReconnect: true });
bot.commands = new Discord.Collection();

// Init all command
const commandFiles = fs.readdirSync("../src/commands/");
commandFiles.forEach(file => {
    const command = require(`./commands/${file}`); // eslint-disable-line
    bot.commands.set(command.name, command);
});

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
});
bot.on("disconnected", () => {
    bot.login(config.token).catch(err => console.error(err));
});


bot.on("message", message => {
    const args = message.content.slice(config.startCommand.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!bot.commands.has(commandName)) return;

    const command = bot.commands.get(commandName);
    try {
        command.execute(message, args, bot);
    } catch (error) {
        console.error(error);
        message.reply("there was an error trying to execute that command!");
    }
});

bot.login(config.token);