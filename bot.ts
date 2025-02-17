import { Bot } from "grammy";
import { config } from "dotenv";

import { addLocation } from "./commands/addLocation.js";

config();

const bot = new Bot(process.env.BOT_TOKEN!);
addLocation(bot);

bot.command("start", (ctx) => ctx.reply("Working..."));
bot.command("add_location", addLocation);

bot.start();

