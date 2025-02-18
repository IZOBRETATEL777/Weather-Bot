import type { ConversationFlavor } from "@grammyjs/conversations";
import { Bot, Context } from "grammy";

export function registerListLocations(bot: Bot<ConversationFlavor<Context>>) {
    bot.command("list_locations", async (ctx: Context) => {
        const locations = ["Baku", "Berlin", "London"]; // TODO: Fetch from DB

        let message = "Your saved locations:\n\n";
        locations.forEach((location, index) => {
            message += `${index + 1}. ${location}\n`;
        });

        await ctx.reply(message);
    });
}
