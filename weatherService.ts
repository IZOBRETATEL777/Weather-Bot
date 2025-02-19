import { Bot, Context } from "grammy";
import { db, locations, weatherData } from "./db.js";
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
🌡 Temperature: ${temperature}°C
📅 Last Updated: ${new Date(recorded_at).toLocaleString()}`);
    });
}

export function registerWeatherService(bot: Bot<ConversationFlavor<Context>>) {
    console.log("✅ Registering Weather Service...");
    bot.catch((err) => {
        console.error("❌ Weather Service Error:", err);
    });
    console.log("🌤 Weather worker started, fetching data every 5 minutes...");
    setInterval(async () => {
        await fetchWeather();
    }, 5 * 60 * 1000);
}

export async function fetchWeather() {
    try {
        console.log("🌤 Fetching weather data...");

        const savedLocations = await db.select({ id: locations.id, city: locations.city }).from(locations).execute();
        const locationMap = new Map(savedLocations.map(loc => [loc.city, loc.id]));

        for (const city of locationMap.keys()) {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${Bun.env.OPENWEATHER_API_KEY}`);
            const data = await response.json();

            if (response.ok && data.main && data.main.temp) {
                const locationId = locationMap.get(city);
                if (!locationId) {
                    console.error(`❌ No matching location_id found for city: ${city}`);
                    continue;
                }

                await db.insert(weatherData)
                    .values({ location_id: locationId, city, temperature: data.main.temp, recorded_at: new Date() })
                    .onConflictDoUpdate({
                        target: weatherData.city,
                        set: { temperature: data.main.temp, recorded_at: new Date() }
                    })
                    .execute();

                console.log(`✅ Weather data recorded for ${city}: ${data.main.temp}°C`);
            } else {
                console.error(`❌ Failed to fetch weather for ${city}:`, data);
            }
        }
    } catch (error) {
        console.error("❌ Error fetching weather data:", error);
    }
}
