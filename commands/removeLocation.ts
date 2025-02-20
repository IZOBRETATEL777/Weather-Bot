import { Bot, Context } from "grammy";
import { db, locations, weatherData } from "../db.ts";
import { and, eq } from "drizzle-orm";
import { InlineKeyboard } from "grammy";
import type { ConversationFlavor } from "@grammyjs/conversations";

export function registerRemoveLocation(bot: Bot<ConversationFlavor<Context>>) {
    bot.command("remove_location", async (ctx: Context) => {
        const userId = ctx.from?.id;
        if (!userId) {
            return ctx.reply("❌ Error: Unable to get your user ID.");
        }

        // Fetch saved locations for the user
        const savedLocations = await db.select({ city: locations.city }).from(locations).where(eq(locations.user_id, userId)).execute();

        if (savedLocations.length === 0) {
            return ctx.reply("🌍 You haven't saved any locations to remove.");
        }

        // Create inline keyboard with saved locations for deletion
        const keyboard = new InlineKeyboard();
        savedLocations.forEach(({ city }) => {
            keyboard.text(`❌ ${city}`, `remove_${city}`).row();
        });

        await ctx.reply("📍 Select a location to remove:", {
            reply_markup: keyboard,
        });
    });

    bot.callbackQuery(/^remove_(.+)/, async (ctx) => {
        const city = ctx.match[1];
        const userId = ctx.from?.id;
        if (!userId) return;

        // Confirmation step
        const keyboard = new InlineKeyboard()
            .text("✅ Yes", `confirm_remove_${city}`)
            .text("❌ No", "cancel_remove");

        await ctx.reply(`🗑️ Are you sure you want to remove "${city}"?`, {
            reply_markup: keyboard,
        });
    });

    bot.callbackQuery(/^confirm_remove_(.+)/, async (ctx) => {
        const city = ctx.match?.[1]?.trim();
        const userId = ctx.from?.id;
        
        if (!city || !userId) {
            console.error("Missing city or userId");
            return;
        }
        
        const locationId = await db
            .select({ id: locations.id })
            .from(locations)
            .where(and(eq(locations.user_id, userId), eq(locations.city, city)))
            .execute()
            .then((rows) => rows[0]?.id);
        
        if (!locationId) {
            console.log(`No location found for city: ${city} and userId: ${userId}`);
            return;
        }
        
        await db.delete(weatherData)
            .where(eq(weatherData.location_id, locationId))
            .execute()
            .catch((err) => console.error("Error deleting weather data:", err));
        
        await db.delete(locations)
            .where(eq(locations.id, locationId))
            .execute()
            .catch((err) => console.error("Error deleting location:", err));
        
        console.log(`Successfully deleted location ${locationId} and related weather data`);
        

        await ctx.editMessageText(`✅ Location "${city}" has been removed.`);
    });

    bot.callbackQuery("cancel_remove", async (ctx) => {
        await ctx.editMessageText("❌ Location removal canceled.");
    });
}
