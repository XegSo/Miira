const { SlashCommandBuilder, TextInputStyle, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, SelectMenuBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
const Canvas = require('canvas');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { UserRefreshClient } = require('google-auth-library');
const { networksecurity_v1 } = require('googleapis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Server dashboard.')
    .addSubcommand((subcommand) => subcommand.setName("inventory").setDescription('Shows your current inventory where you can use your items.'))
    .addSubcommand((subcommand) => subcommand.setName("daily").setDescription('Daily tokens!'))
    .addSubcommand((subcommand) =>
      subcommand.setName("leaderboard")
        .setDescription('Shows the top 10 users with more Credits.')
        .addStringOption(option =>
          option
            .setName('choice')
            .setDescription('Type of the leaderboard')
            .setRequired(true)
            .addChoices(
              { name: 'tokens', value: 'tokens' },
              { name: 'combo', value: 'combo' },
            )
        )
    )
    .addSubcommand((subcommand) => subcommand.setName("profile").setDescription('Shows your server profile.'))
    .addSubcommand((subcommand) => subcommand.setName("suggest").setDescription('Suggest something for the server or collabs.'))
    .addSubcommand((subcommand) =>
      subcommand.setName("shop")
        .setDescription('Lists the shop where you can buy items using server tokens.')
        .addStringOption(option =>
          option
            .setName('class')
            .setDescription('Select which kind of items to display')
            .setRequired(true)
            .addChoices(
              { name: 'Augments', value: 'Augments' },
              { name: 'Roles', value: 'Roles' },
              { name: 'Commissions', value: 'Commissions' },
              { name: 'Collab Perks', value: 'Collab Perks' },
              { name: 'Extra', value: 'Extra' },
              //{ name: 'Cosmetics', value: 'Cosmetics' },
              //{ name: 'Instant Goodies', value: 'Instant Goodies' },
            )
        )
    ),
  async execute(int, client) {
    const subcommand = int.options.getSubcommand();
    const userId = int.user.id;
    const guild = client.guilds.cache.get(localConstants.guildId);
    const guildMember = guild.members.cache.get(userId);
    if (subcommand === "inventory") {
      await int.deferReply({ ephemeral: true });
      const userId = int.user.id;
      const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
      // Retrieve the user's inventory items from the database
      try {
        const userInventory = await localFunctions.getInventory(userId, collection);
        const onUse = await localFunctions.getOnUse(userId, collection);


        const inventoryEmbedTop = new EmbedBuilder()
          .setImage('https://puu.sh/JPcRE/8db81baad8.png')
          .setColor('#f26e6a');

        if (!userInventory || userInventory.length === 0) {
          const emptyEmbedBottom = new EmbedBuilder()
            .setDescription('\`\`\`🔐 Items on storage\`\`\`')
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setColor('#f26e6a')
            .addFields({ name: 'Your inventory is empty.', value: 'Use /shop to get some items.' });
          await int.editReply({
            content: '',
            embeds: [inventoryEmbedTop, emptyEmbedBottom],
            ephemeral: true
          });
          return;
        }

        const options = [
          new SelectMenuBuilder()
            .setCustomId('use-item')
            .setPlaceholder('Select an item to use.')
            .addOptions(
              userInventory.map((item) => ({
                label: item.name,
                value: item.name,
                description: item.value,
              }))
            ),
        ];

        const inventoryEmbedBottom = new EmbedBuilder()
          .setImage('https://puu.sh/JPffc/3c792e61c9.png')
          .setColor('#f26e6a');
        inventoryEmbedBottom.setDescription('\`\`\`🔐 Items on storage\`\`\`');
        for (const item of userInventory) {
          inventoryEmbedBottom.addFields({ name: `· ${item.name}`, value: item.desc });
        }

        if (onUse) {
          inventoryEmbedBottom.addFields({ name: "\u200B", value: '\`\`\`🚀 Items on use\`\`\`' });
          for (const item of onUse) {
            inventoryEmbedBottom.addFields({ name: `· ${item.name}`, value: item.desc });
          }
        }

        const actionRow = new ActionRowBuilder().addComponents(options);
        await int.editReply({
          content: '',
          components: [actionRow],
          embeds: [inventoryEmbedTop, inventoryEmbedBottom],
          ephemeral: true
        });
      } finally {
        mongoClient.close();
      }
    }
    if (subcommand === "leaderboard") {
      await int.deferReply();
      const leaderboardType = int.options.getString('choice');
      if (leaderboardType === 'tokens' || leaderboardType === null) {
        // Prepare the leaderboard data for the embed
        let leaderboardDataTokens = await localFunctions.updateLeaderboardData('tokens');
        const TopEmbed = new EmbedBuilder()
          .setImage('https://puu.sh/JPdfL/9b2860ac7a.png')
          .setColor('#f26e6a');
        const TokensEmbed = localFunctions.createLeaderboardEmbedTokens(leaderboardDataTokens);
        // Send the embed as a response

        await int.editReply({ content: '', embeds: [TopEmbed, TokensEmbed] });
      } else {
        let leaderboardDataCombo = await localFunctions.updateLeaderboardData('combo');
        const TopEmbed = new EmbedBuilder()
          .setImage('https://puu.sh/JPdfL/9b2860ac7a.png')
          .setColor('#f26e6a');
        const ComboEmbed = localFunctions.createLeaderboardEmbedCombo(leaderboardDataCombo);
        await int.editReply({ content: '', embeds: [TopEmbed, ComboEmbed] });
      }
    }
    if (subcommand === "profile") {
      await int.deferReply();
      const date = Date.now();
      const userId = int.user.id;
      const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
      const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB("Special");
      const guild = client.guilds.cache.get(localConstants.guildId);
      const guildMember = guild.members.cache.get(userId);
      try {
        const NormalBoostboostEndTime = await localFunctions.getBoostEndTime(userId, collection);
        const remainingTimeNormalBoost = NormalBoostboostEndTime ? NormalBoostboostEndTime - date : 0;
        const PermaBoost = await localFunctions.getPermaBoost(userId, collection);
        const GlobalBoost = await localFunctions.getGlobalBoost(collectionSpecial);
        const GlobalBoostTime = GlobalBoost.boostEndTime;
        const remainingTimeGlobalBoost = GlobalBoost ? GlobalBoost.boostEndTime : 0;
        const GlobalBoostMultiplier = GlobalBoost ? GlobalBoost.multiplier : 0;

        const balance = await localFunctions.getBalance(userId, collection);
        const existingBalance = balance ? balance : 0;
        const topCombo = await localFunctions.getTopCombo(userId, collection) || 0;

        let userInventory = await localFunctions.getInventory(userId, collection) || [];

        let onUse = await localFunctions.getOnUse(userId, collection);

        let MirageFormat = Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        let formattedBalance = MirageFormat.format(existingBalance)

        let boosts = [];
        let badges = [];
        let userLevel = 'LEVEL 0';
        let textColor = "#f9e1e1";
        const comboFullText = `TOP COMBO: ${topCombo}`;;
        let backgroundName = '';

        const roles = guildMember.roles.cache.map(role => role.name);
        const badgesDB = await localFunctions.getBadges(userId, collection);

        if (badgesDB) {
          badges = badgesDB;
        } else {
          badges = localFunctions.updateBadges(roles);
          await localFunctions.setBadges(userId, badges, collection);
        }

        if (roles.includes("Level 3")) {
          userLevel = "LEVEL 3";
        } else if (roles.includes("Level 2")) {
          userLevel = "LEVEL 2";
        } else if (roles.includes("Level 1")) {
          userLevel = "LEVEL 1";
        }

        if (remainingTimeNormalBoost) {
          if (remainingTimeNormalBoost > 0) {
            const secondsRemainingNormalBoost = remainingTimeNormalBoost / 1000;
            if (secondsRemainingNormalBoost < 60) {
              boosts.push(`2X TOKEN BOOST EXPIRING IN ${Math.round(secondsRemainingNormalBoost)} SECONDS`);
            }
            if (secondsRemainingNormalBoost < 3600) {
              boosts.push(`2X TOKEN BOOST EXPIRING IN ${Math.round(secondsRemainingNormalBoost / 60)} MINUTES`);
            }
            if (secondsRemainingNormalBoost > 3600) {
              boosts.push(`2X TOKEN BOOST EXPIRING IN ${Math.round(secondsRemainingNormalBoost / 3600)} HOURS`);
            }
          }
        }

        if (GlobalBoostTime) {
          if (GlobalBoostTime > date) {
            const secondsRemainingGlobalBoost = (remainingTimeGlobalBoost - date) / 1000;
            if (secondsRemainingGlobalBoost < 60) {
              boosts.push(`${GlobalBoostMultiplier}X GLOBAL BOOST EXPIRING IN ${Math.round(secondsRemainingGlobalBoost)} SECONDS`);
            }
            if (secondsRemainingGlobalBoost < 3600) {
              boosts.push(`${GlobalBoostMultiplier}X GLOBAL BOOST EXPIRING IN ${Math.round(secondsRemainingGlobalBoost / 60)} MINUTES`);
            }
            if (secondsRemainingGlobalBoost > 3600) {
              boosts.push(`${GlobalBoostMultiplier}X GLOBAL BOOST EXPIRING IN ${Math.round(secondsRemainingGlobalBoost / 3600)} HOURS`);
            }
          }
        }

        if (PermaBoost) {
          boosts.push('PERMANENT 2X TOKEN BOOST');
        }

        const canvas = Canvas.createCanvas(2800, 646);
        const ctx = canvas.getContext('2d');

        const avatar = await Canvas.loadImage(int.user.displayAvatarURL({ extension: "jpg", size: 2048 }));

        ctx.drawImage(avatar, 30, 30, 510, 510);

        if (!onUse.length && !userInventory.length) { //Updates cosmetics if the user doesn't have them
          await localFunctions.updateNonPurchaseableCosmetics(userId, collection, roles, userInventory, onUse)
          console.log(`Cosmetics for user ${int.user.tag} have been updated`);
        }

        try {
          backgroundName = onUse.find((item) => item.type === 'background').name;
        } catch (error) {
          backgroundName = 'Profile';
        }

        if (backgroundName === "Staff Background") {
          textColor = "#FFFFFF";
        }

        let background = await Canvas.loadImage(`./assets/backgrounds/${backgroundName}.png`);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        localFunctions.ctxText(canvas, ctx, textColor, int.user.username.split("").join(String.fromCharCode(8202)), 'start', 'Montserrat', 114, 'normal', 494, 120);

        localFunctions.ctxText(canvas, ctx, textColor, formattedBalance.split("").join(String.fromCharCode(8202)), 'start', 'Montserrat', 125, 'italic', 603, 436);

        localFunctions.ctxText(canvas, ctx, textColor, comboFullText.split("").join(String.fromCharCode(8202)), 'start', 'Montserrat', 78, 'italic', 1777, 388);

        localFunctions.ctxText(canvas, ctx, textColor, userLevel.split("").join(String.fromCharCode(8202)), 'start', 'Montserrat', 78, 'italic', 1777, 511);

        let posyBoosts = 54;
        for (const boost of boosts) {
          localFunctions.ctxText(canvas, ctx, textColor, boost.split("").join(String.fromCharCode(8202)), 'end', 'Montserrat', 34, 'Normal', 2764, posyBoosts);
          posyBoosts = posyBoosts + 50;
        }

        let posxBadges = 596;
        for (const badge of badges) {
          let badgeImage = await Canvas.loadImage(`./assets/badges/${badge}.png`);
          ctx.drawImage(badgeImage, posxBadges, 207, 92, 92);
          posxBadges = posxBadges + 160;
        }

        const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
          name: "profile.png"
        });

        await int.editReply({ files: [attachment] });


      } finally {
        mongoClient.close();
        mongoClientSpecial.close();
      }
    }
    if (subcommand === "suggest") {
      const modal = new ModalBuilder()
        .setCustomId("suggest-modal")
        .setTitle('Send a suggestion');

      const title = new TextInputBuilder()
        .setCustomId('suggestion-title')
        .setLabel('Resume your suggestion in a few words.')
        .setPlaceholder('Ex: Adding x to the collabs.')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      const suggestion = new TextInputBuilder()
        .setCustomId('suggestion')
        .setLabel('What are you suggesting?')
        .setPlaceholder('Note: If you suggest a lot of useless things, you will be muted. ')
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

      const reason = new TextInputBuilder()
        .setCustomId('suggestion-reason')
        .setLabel('Why is this suggestion?')
        .setPlaceholder('Specify how the implementation of this suggestion will be benefitial for the server or the collabs.')
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

      modal.addComponents(new ActionRowBuilder().addComponents(title), new ActionRowBuilder().addComponents(suggestion), new ActionRowBuilder().addComponents(reason));

      await int.showModal(modal);
    }
    if (subcommand === "shop") {
      await int.deferReply();
      const shopType = int.options.getString('class');
      const shopEmbed = new EmbedBuilder()
        .setImage('https://puu.sh/JPffc/3c792e61c9.png')
        .setColor('#f26e6a')
        .setTitle(`${shopType}`)
        .setFooter({ text: 'Note: Prices and Items on the shop might change at any given time.' });
      for (const item of localConstants.shopItems) {
        if (item.class === shopType) {
          shopEmbed.addFields({ name: `🏷 ${item.name}`, value: `${item.desc}\n **Cost: **${item.value}` });
        }
      }
      const BuyEmbed = new EmbedBuilder()
        .setImage('https://puu.sh/JPaDZ/a52c04b267.png')
        .setColor('#f26e6a');
      const options = new SelectMenuBuilder()
        .setCustomId('buy-item')
        .setPlaceholder('Select an item to buy');
      for (const item of localConstants.shopItems) {
        if (item.class === shopType) {
          options.addOptions({ label: item.name, value: item.name, description: item.value });
        }
      }
      const shopClass = new SelectMenuBuilder()
        .setCustomId('shop-class')
        .setPlaceholder('Switch to another section')
        .addOptions([
          { label: 'Augments', value: 'Augments', description: 'Activity augments.' },
          { label: 'Roles', value: 'Roles', description: 'Special Roles.' },
          { label: 'Commissions', value: 'Commissions', description: 'GFX Commissions.' },
          { label: 'Collab Perks', value: 'Collab Perks', description: 'Perks for the megacollabs.' },
          { label: 'Extra', value: 'Extra', description: 'Stuff that doesn\'t fit any category.' },
        ]);
      const actionRowOptions = new ActionRowBuilder().addComponents(options);
      const actionRowShopClass = new ActionRowBuilder().addComponents(shopClass);
      await int.editReply({
        content: '',
        embeds: [BuyEmbed, shopEmbed],
        components: [actionRowOptions, actionRowShopClass],
      });
    }
    if (subcommand === "daily") {
      await int.deferReply();
      const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
      const currentDate = Date.now();
      try {
        let userArray = await localFunctions.getUserDaily(userId, collection);
        const currentBalance = await localFunctions.getBalance(userId, collection);
        let amountToEarn = 100;
        let newBalance = currentBalance;
        if (!userArray) {
          userArray = {
            streak: 0,
            lastDate: currentDate,
          };
        }
        const daysSinceLastMessage = (currentDate - userArray.lastDate) / (1000 * 60 * 60 * 24);
        if (daysSinceLastMessage > 2 || daysSinceLastMessage === 0) {
          const oldStreak = userArray.streak;
          userArray.streak = 0;
          userArray.lastDate = currentDate;
          newBalance = currentBalance + amountToEarn;
          await localFunctions.setUserDaily(userId, userArray, collection);
          await localFunctions.setBalance(userId, newBalance, collection);
          if (daysSinceLastMessage === 0) {
            int.editReply(`Welcome to your first daily claim! You\'ve obtained ${amountToEarn} tokens and you\'ve started a new streak! You will obtain **30** extra tokens by every day you run this command! You will also have a time window of **24 hours** to run this command after one day passes. If you miss the window your streak will reset!`);
          } else {
            int.editReply(`Oh no! You\'ve obtained **${amountToEarn}** tokens and you\'ve restarted your streak! Your old streak was of ${oldStreak}. Good luck on this new run!`);
          }
        } else if (daysSinceLastMessage <= 2 && daysSinceLastMessage >= 1) {
          amountToEarn = 100 + (30*(userArray.streak + 1));
          userArray.streak = userArray.streak + 1;
          userArray.lastDate = currentDate;
          newBalance = currentBalance + amountToEarn;
          await localFunctions.setUserDaily(userId, userArray, collection);
          await localFunctions.setBalance(userId, newBalance, collection);
          int.editReply(`Welcome back! You\'ve obtained **${amountToEarn}** tokens! Your current streak is of **${userArray.streak}**!.`);
        } else {
          int.editReply(`You cannot claim your daily bonus yet! Come back <t:${Math.floor(userArray.lastDate/1000 + 86400)}:R>`);
        }
      } finally {
        mongoClient.close();
      }
    }
  }
}