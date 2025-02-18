import type { ConversationFlavor } from "@grammyjs/conversations";
import { Bot, Context } from "grammy";
import { db, locations } from "../db.js";
import { eq } from "drizzle-orm";

export function registerListLocations(bot: Bot<ConversationFlavor<Context>>) {
    bot.command("list_locations", async (ctx: Context) => {
        const userId = ctx.from?.id;
        if (!userId) {
            console.log("❌ Error: No user ID found in /list_locations command.");
            return ctx.reply("❌ An error occurred. Please try again.");
        }

        console.log(`🟢 User ${userId} triggered /list_locations`);

        try {
            console.log(`🔍 Fetching locations for user ${userId} from database...`);
            const savedLocations = await db
                .select()
                .from(locations)
                .where(eq(locations.user_id, userId))
                .execute();

            console.log(`📂 Database response for ${userId}:`, savedLocations);

            if (savedLocations.length === 0) {
                console.log(`ℹ️ No locations found for ${userId}`);
                return ctx.reply("You have no saved locations.");
            }

            let message = "📍 Your saved locations:\n\n";
            savedLocations.forEach((loc, index) => {
                message += `${index + 1}. ${loc.city}\n`;
            });

            console.log(`📋 Sending locations list for ${userId}`);
            await ctx.reply(message);
        } catch (error) {
            console.error("❌ Database error while listing locations:", error);
            ctx.reply("❌ An error occurred while fetching your locations.");
        }
    });
}
