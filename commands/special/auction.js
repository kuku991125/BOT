const Auction = require("../../settings/models/auction.js");
const Member = require("../../settings/models/member.js");
const { AuctionGlobal, AuctionPerson } = require("../../structures/Pagination.js");
const config = require("../../settings/default.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = { 
    name: "auction",
    description: "拍賣行.",
    options: [
        {
            name: "看法",
            description: "查看拍賣。（全球和用戶）",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "全球的",
                    description: "查看全球拍賣.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "頁",
                            description: "您要獲取有關信息的頁面.",
                            type: ApplicationCommandOptionType.Integer, /// 4 = Integer
                            required: false,
                        }
                    ]
                },
                {
                    name: "人",
                    description: "查看用戶拍賣.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "用戶",
                            description: "您要查看拍賣的用戶.",
                            type: ApplicationCommandOptionType.User, /// 6 = User
                            required: true,
                        },
                        {
                            name: "頁",
                            description: "您要獲取有關信息的頁面.",
                            type: ApplicationCommandOptionType.Integer, /// 4 = Integer
                            required: false
                        }
                    ]
                }
            ]
        },
        {
            name: "賣",
            description: "出售商品。（角色賣家）",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "角色",
                    description: "您想出售的角色。",
                    type: ApplicationCommandOptionType.Role, /// 8 = Role
                    required: true
                },
                {
                    name: "價格",
                    description: "您要出售商品的價格.",
                    type: ApplicationCommandOptionType.Integer, /// 4 = Integer
                    required: true
                }
            ]
        },
        {
            name: "買",
            description: "購買商品。（角色買家）",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "用戶",
                    description: "您想購買商品的用戶.",
                    type: ApplicationCommandOptionType.User, /// 6 = User
                    required: true
                },
                {
                    name: "項目id",
                    description: "您想購買的商品.",
                    type: ApplicationCommandOptionType.Integer, /// 4 = Integer
                    required: true
                }
            ]
        }
    ],
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });

        if (interaction.options.getSubcommand() === "賣") {
            const role = interaction.options.getRole("角色");
            const roleList = config.auction.role_list;

            /// Check if the role is in the list
            if (!roleList.includes(role.name)) {
                interaction.editReply(`你不能出售這個角色。（賣出角色: \`${roleList.join(", ")}\`)`);
                return;
            }

            const price = interaction.options.getInteger("price");
            if(price < config.auction.auction_start) return interaction.editReply(`You can't sell less than \`$${numberWithCommas(config.auction.auction_start)}\` coins.`);

            const your = await Member.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id });
            const MaxAuction = await Auction.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id }).countDocuments();
            /// Max Auction
            if(MaxAuction >= config.auction.max_auction) return interaction.editReply(`You can't have more than \`${config.auction.auction_start}\` auctions.`);

            /// Tax -5%
            const Tax = price * config.auction.auction_tax;
            /// Not have money to pay tax
            if(your.money < Tax) return interaction.editReply(`您不能少於\'$ ${numberWithCommas(Tax)} \`要繳稅.`);

            /// Price - Tax
            const FullTax = price - Tax;

            /// Find role
            const roles = client.guilds.cache.get(interaction.guild.id).roles.cache.find(r => r.name === role.name);
            const alreadyHave = interaction.member.roles.cache.find(r => r.id === roles.id);
            /// RETURN IF YOU DON'T HAVE THE ROLE
            if(!alreadyHave) return interaction.editReply("您沒有這個角色。");

            /// Generate item id
            const item_id = Math.floor(Math.random() * 100000);
            /// CREATE NEW AUCTION
            const item = new Auction({
                guild_id: interaction.guild.id,
                item_id: item_id,
                item_name: role.name,
                item_price: price,
                item_seller: interaction.user.id,
            });


            await item.save();
            /// REMOVE MONEY BY TAX
            your.money -= Tax;
            await your.save();

            await interaction.editReply(`您已經成功賣出了 \`${role.name}\` 角色 \`$${numberWithCommas(FullTax)}\` 硬幣. (Tax: \`-$${numberWithCommas(Tax)}\`)`);

            const embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
                .setDescription(`
                **角色名稱:** \`${role.name}\`
                **價格:** \`$${numberWithCommas(price)}\` **coins**
                **賣方:** ${interaction.user}
                `)
                .setColor("#ff0000")
                .setFooter({ text: `項目ID: ${item_id}`})
                .setTimestamp();

            /// Remove Role 
            await interaction.member.roles.remove(roles);

            const channel = client.channels.cache.get(config.auction.auction_alert);
            await channel.send({ embeds: [embed] });
            
        }

        if (interaction.options.getSubcommand() === "買") {

            //// FIND USER AND BUY ITEM USE ITEM_ID
            // REMOVE YOUR MONEY AND ADD ITEM TO YOUR INVENTORY
            // ADD MONEY TO SELLER
            // REMOVE ITEM FROM AUCTION

            const item_id = interaction.options.getInteger("item_id");
            const target = interaction.options.getUser("用戶");

            if(target.bot) return interaction.editReply("您不能從機器人購買商品.");

            //// FIND ITEM USE ITEM_ID & ITEM OWNER
            const itemAc = await Auction.findOne({ guild_id: interaction.guild.id, item_id: item_id, item_seller: target.id });

            const your = await Member.findOne({ guild_id: interaction.guild.id, user_id: interaction.user.id });

            if (!itemAc) {
                await interaction.editReply("此項目不存在.");
                return;
            }

            if (itemAc.item_seller === interaction.user.id) {
                await interaction.editReply("你不能購買自己的物品.");
                return;
            }

            if (itemAc.item_price > your.money) {
                await interaction.editReply("您沒有足夠的錢來購買這個角色。");
                return;
            }

            /// FIND ROLE
            const roles = client.guilds.cache.get(interaction.guild.id).roles.cache.find(r => r.name === itemAc.item_name);
            const alreadyHave = interaction.member.roles.cache.find(r => r.id === roles.id);
            /// RETURN IF YOU ALREADY HAVE ROLE
            if(alreadyHave) return interaction.editReply("你已經有這個角色.");

            /// CHECK TARGET
            const targetMoney = await Member.findOne({ guild_id: interaction.guild.id, user_id: target.id });

            /// TAX -5%
            const Tax = itemAc.item_price * config.auction.auction_tax;
            /// PRICE - TAX
            const FullTax = itemAc.item_price - Tax;

            await interaction.editReply(`您已經成功購買了 \`${itemAc.item_name}\` 角色 \`$${numberWithCommas(FullTax)}\` 硬幣。（稅： \`-$${numberWithCommas(Tax)}\`)`);

            const embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
                .setDescription(`
                **角色名稱:** \`${itemAc.item_name}\`
                **價格:** \`$${numberWithCommas(itemAc.item_price)}\` **硬幣**
                **Buyer:** ${interaction.user}
                `)
                .setColor("#33ff00")
                .setFooter({ text: `項目ID: ${item_id}`})
                .setTimestamp();

            await interaction.member.roles.add(roles);
            /// REMOVE YOUR MONEY AND ADD ROLE
            your.money -= itemAc.item_price;
            await your.save();

            //// ADD MONEY TO SELLER
            targetMoney.money += FullTax;
            await targetMoney.save();

            /// REMOVE THIS ITEM FROM AUCTION
            await itemAc.remove();

            /// SEND TO CHANNEL
            const channel = client.channels.cache.get(config.auction.auction_alert);
            await channel.send({ content: `${interaction.user} & ${target}`, embeds: [embed] });
        }

        if (interaction.options.getSubcommand() === "全球的") {
            const args = interaction.options.getInteger("頁");
            const auction = await Auction.find({ guild_id: interaction.guild.id });

            let pagesNum = Math.ceil(auction.length / 10);
            if(pagesNum === 0) pagesNum = 1;
    
            /// Sort by Prices
    
            auction.sort((a, b) => {
                return b.item_price - a.item_price;
            });
    
            const auctionStrings = [];
            for (let i = 0; i < auction.length; i++) {
                const e = auction[i];
                auctionStrings.push(
                    `**ID：** ${e.item_id} • \`${e.item_name}\` • \`價格 $${numberWithCommas(e.item_price)}\` • ${client.users.cache.get(e.item_seller)}
                    `);
            }
    
            const pages = [];
            for (let i = 0; i < pagesNum; i++) {
                const str = auctionStrings.slice(i * 10, i * 10 + 10).join('');
    
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `拍賣全球`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setColor(client.color)
                    .setDescription(`${str == '' ? '  No Auctions' : '\n' + str}`)
                    .setFooter({ text: `頁 • ${i + 1}/${pagesNum} | ${auction.length} • 全部拍賣`});
    
                pages.push(embed);
            }
    
            if (!args) {
                if (pages.length == pagesNum && auction.length > 10) AuctionGlobal(client, interaction, pages, 120000, auction.length);
                else return interaction.editReply({ embeds: [pages[0]] });
            }
            else {
                if (isNaN(args)) return interaction.editReply('頁面必須是一個數字.');
                if (args > pagesNum) return interaction.editReply(`只有${pageNum}頁面可用.`);
                const pageNum = args == 0 ? 1 : args - 1;
                return interaction.editReply({ embeds: [pages[pageNum]] });
            }
        }

        if (interaction.options.getSubcommand() === "人") {
            const args = interaction.options.getInteger("頁");
            const member = interaction.options.getUser("用戶");
            const mention = member ? member.id : interaction.user.id;

            const avatarURL = member ? member.displayAvatarURL({ format: "png", size: 512 }) : interaction.user.displayAvatarURL({ format: "png", size: 512 });
            const userTag = member ? member.tag : interaction.user.tag;

            const auction = await Auction.find({ guild_id: interaction.guild.id, item_seller: mention });

            let pagesNum = Math.ceil(auction.length / 10);
            if(pagesNum === 0) pagesNum = 1;
            
            /// Sort by Prices

            auction.sort((a, b) => {
                return b.item_price - a.item_price;
            });
    
            const auctionStrings = [];
            for (let i = 0; i < auction.length; i++) {
                const e = auction[i];
                auctionStrings.push(
                    `**ID：**${e.item_id} • \`${e.item_name}\` • \`價格 $${numberWithCommas(e.item_price)}\`
                    `);
            }
    
            const pages = [];
            for (let i = 0; i < pagesNum; i++) {
                const str = auctionStrings.slice(i * 10, i * 10 + 10).join('');
    
                const embed = new EmbedBuilder()
                    .setAuthor({ name: userTag, iconURL: avatarURL })
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setColor(client.color)
                    .setDescription(`${str == '' ? '  沒有相關產品' : '\n' + str}`)
                    .setFooter({ text: `頁 • ${i + 1}/${pagesNum} | ${auction.length} • 總項目`});
    
                pages.push(embed);
            }
    
            if (!args) {
                if (pages.length == pagesNum && auction.length > 10) AuctionPerson(client, interaction, pages, 120000, auction.length);
                else return interaction.editReply({ embeds: [pages[0]] });
            }
            else {
                if (isNaN(args)) return interaction.editReply('頁面必須是一個數字.');
                if (args > pagesNum) return interaction.editReply(`只有${pageNum}頁面可用.`);
                const pageNum = args == 0 ? 1 : args - 1;
                return interaction.editReply({ embeds: [pages[pageNum]] });
            }

        }
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}