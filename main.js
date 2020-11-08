// Part that says that this is a Discord bot
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

// gets credentials
//const config = require('./config.json'); // uncomment this line
const config = require('./config.private.json'); // comment out this line

const AntiSpam = require('discord-anti-spam');
const antiSpam = new AntiSpam({
  warnThreshold: 4, // Amount of messages sent in a row that will cause a warning.
  kickThreshold: 10, // Amount of messages sent in a row that will cause a kick.
  banThreshold: 15, // Amount of messages sent in a row that will cause a ban.
  maxInterval: 2500, // Amount of time (in milliseconds) in which messages are considered spam.
  warnMessage: '{@user}, Please stop spamming.', // Message that will be sent in chat upon warning a user.
  kickMessage: '*Scanning...*\n__***THREAT FOUND***__\n**{user_tag}** has been kicked for spamming!', // Message that will be sent in chat upon kicking a user.
  banMessage: '*Scanning...*\n__***THREAT FOUND***__\n**{user_tag}** has been banned for spamming!', // Message that will be sent in chat upon banning a user.
  maxDuplicatesWarning: 7, // Amount of duplicate messages that trigger a warning.
  maxDuplicatesKick: 10, // Amount of duplicate messages that trigger a warning.
  maxDuplicatesBan: 12, // Amount of duplicate messages that trigger a warning.
  exemptPermissions: ['ADMINISTRATOR'], // Bypass users with any of these permissions.
  ignoreBots: true, // Ignore bot messages.
  verbose: true, // Extended Logs from module.
  ignoredUsers: [], // Array of User IDs that get ignored.
  // And many more options... See the documentation.
});

const profanity = require('./profanity.json');

client.on('ready', () => {
  console.log("Connected as " + client.user.tag);
  client.user.setActivity("For Threats | Type AWACS help", {type: "WATCHING"});
  // List servers the bot is connected to
  console.log("Servers:");
  client.guilds.cache.forEach( (guild) => { console.log(" - " + guild.name) } );
})

client.on('message', (receivedMessage) => {
  if (receivedMessage.author == client.user) { // Prevent bot from responding to its own messages
    return;
  }
  // if (receivedMessage.content.includes('discord.gg/'||'discordapp.com/invite/')) { //if it contains an invite link
  //   if(!receivedMessage.member.hasPermission("KICK_MEMBERS")) {
  //     receivedMessage.delete() //delete the message
  //     return;
  //   }
  // }
  antiSpam.message(receivedMessage);
  if (receivedMessage.content) {
    const profane = !!profanity.find((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'i'); // if the phrase is not alphanumerical,
      return regex.test(receivedMessage.content);             // you may need to escape tokens
    });

    if (profane) {
      receivedMessage.channel.send("*Scanning...*");
      receivedMessage.channel.send("__***THREAT FOUND***__\nTarget: <@" + receivedMessage.author.id + ">");
      receivedMessage.delete().catch(console.error);
      receivedMessage.channel.send("**Threat Eliminated!**");
    }
  }

  var messageSplit = receivedMessage.content.split(" "); // Split the message up in to pieces for each space
  messageSplit[0] = messageSplit[0].toLowerCase();
  if (messageSplit[0] == "awacs") { //check if message starts with awacs
    processCommand(receivedMessage);
  }
})

function processCommand(receivedMessage) { // gets the command and processes what needs to be done
  var fullCommand = receivedMessage.content.substr(6); // Remove the leading exclamation mark
  var splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
  var primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
  var arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command

  primaryCommand = primaryCommand.toLowerCase(); // makes primary command lowercase so that we can detect if someone makes a command lIkE tHiS

  console.log("Command received: " + primaryCommand);
  console.log("Arguments: " + arguments); // There may not be any arguments

  switch (primaryCommand) {
    case 'help':
      helpCommand(arguments, receivedMessage);
    break;
    case 'ping':
      pingCommand(arguments, receivedMessage);
    break;
    default:
      receivedMessage.channel.send("I don't understand the command. Try `awacs help`")
  }
}

function helpCommand(arguments, receivedMessage) {
  var helpMessage = "**About:**\n";
  helpMessage += "This bot was made by ``Michael2#1343`` \n";
  helpMessage += "It was made to be a very simple and lightweight bot to scan for trolls, spammers, and inappropriate messages \n";
  helpMessage += "**Commands:**\n";
  helpMessage += "`awacs help` Help Message (This Message)\n";
  helpMessage += "`awacs ping` Ping the bot\n";
  //helpMessage += "`sudo -h [command]` Help Message For Command\n";
  //helpMessage += "`sudo list` or `sudo -l` List Commands\n";

  var helpEmbed = new Discord.MessageEmbed()
    .setColor('#577a9a')
    .setTitle("Help")
    .setDescription(helpMessage)
    .setTimestamp()
    .setFooter('This bot was made by Michael2#1343', 'https://discord.com/oauth2/authorize?client_id=774775594742841374&permissions=8&scope=bot');
  receivedMessage.channel.send(helpEmbed);
}

client.login(config.token);
