import { Bot, Context } from "grammy";
import { db, locations, weatherData } from "./../db.js";
import { eq } from "drizzle-orm";
import { InlineKeyboard } from "grammy";
import type { ConversationFlavor } from "@grammyjs/conversations";

export function registerWeatherCommand(bot: Bot<ConversationFlavor<Context>>) {
    bot.command("weather", async (ctx: Context) => {
        const userId = ctx.from?.id;
        if (!userId) {
            return ctx.reply("❌ Error: Unable to get your user ID.");
        }

        // Fetch saved locations for the user
        const savedLocations = await db.select({ city: locations.city }).from(locations).where(eq(locations.user_id, userId)).execute();

        if (savedLocations.length === 0) {
            return ctx.reply("🌍 You haven't saved any locations. Use /add_location to add one.");
        }

        // Create inline keyboard with saved locations
        const keyboard = new InlineKeyboard();
        savedLocations.forEach(({ city }) => {
            keyboard.text(city, `weather_${city}`).row();
        });

        await ctx.reply("📍 Select a location to get the current weather:", {
            reply_markup: keyboard,
        });
    });

    bot.callbackQuery(/^weather_(.+)/, async (ctx) => {
        const city = ctx.match[1];

        // Fetch the latest weather data for the selected city
        const weather = await db.select({ temperature: weatherData.temperature, recorded_at: weatherData.recorded_at })
            .from(weatherData)
            .where(eq(weatherData.city, city))
            .execute();

        if (!weather.length) {
            return ctx.answerCallbackQuery({ text: `❌ No weather data available for ${city}.` });
        }

        const { temperature, recorded_at } = weather[0];
        await ctx.editMessageText(`🌤 Weather in ${city}:
🌡 Temperature: ${temperature}°C`);
    });
}
