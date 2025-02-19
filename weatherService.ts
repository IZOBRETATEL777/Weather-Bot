import type { ConversationFlavor } from "@grammyjs/conversations";
import { db, locations, weatherData } from "./db.js";
import { eq } from "drizzle-orm";
import { Bot, Context } from "grammy";

async function fetchWeather(bot: Bot<ConversationFlavor<Context>>) {
    try {
        console.log("🌤 Fetching weather data...");

        const savedLocations = await db.select({ id: locations.id, city: locations.city }).from(locations).execute();
        const locationMap = new Map(savedLocations.map(loc => [loc.city, loc.id])); // Map city → location_id

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

                // Check for extreme weather conditions
                if (data.weather.some((w: { main: string; }) => ["Thunderstorm", "Tornado", "Extreme", "Snow"].includes(w.main))) {
                    await notifyUsers(bot, city, data.weather[0].main);
                }
            } else {
                console.error(`❌ Failed to fetch weather for ${city}:`, data);
            }
        }
    } catch (error) {
        console.error("❌ Error fetching weather data:", error);
    }
}


async function notifyUsers(bot: Bot<ConversationFlavor<Context>>, city: string, condition: string) {
    try {
        console.log(`⚠️ Extreme weather detected in ${city}: ${condition}`);
        
        const users = await db.select({ user_id: locations.user_id }).from(locations).where(eq(locations.city, city)).execute();
        
        for (const user of users) {
            await bot.api.sendMessage(user.user_id, `⚠️ Extreme Weather Alert!
🌪️ Condition: ${condition}
📍 Location: ${city}
Stay safe!`);
        }
    } catch (error) {
        console.error("❌ Error notifying users:", error);
    }
}

export function registerWeatherService(bot: Bot<ConversationFlavor<Context>>) {
    console.log("✅ Registering Weather Service...");
    bot.catch((err) => {
        console.error("❌ Weather Service Error:", err);
    });
    console.log("🌤 Weather worker started, fetching data every 5 minutes...");
    fetchWeather(bot);
    setInterval(() => fetchWeather(bot), 5 * 60 * 1000);
}
