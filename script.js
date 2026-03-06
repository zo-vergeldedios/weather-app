import "dotenv/config";
import postgres from "postgres";
import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

async function fetchData() {
  const [latitude, longitude] = process.env.LOCATION.split(",");
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code,cloud_cover&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();

    // console.log(result);
    const temperature = result.hourly.temperature_2m;
    const cloudCover = result.hourly.cloud_cover;
    const weatherCode = result.hourly.weather_code;

    // console.log(temperature);
    const date = new Date().toJSON();

    const currentDate = date.slice(0, 14);
    const modifiedDate = currentDate + "00";
    const time = result.hourly.time;
    const indexOfTime = time.indexOf(modifiedDate);

    // console.log(cloudCover);
    // console.log(temperature[indexOfTime]);
    const timeForDatabase = time[indexOfTime].replace("T", " ") + ":00";
    const weather = weatherCode[indexOfTime];
    const translatingWeatherCode = (weathercode) => {
      if (weathercode == 0) {
        return "Clear Sky";
      } else if (weathercode == 1 || weathercode == 2 || weathercode == 3) {
        return "Partly Cloudy";
      } else if (weathercode == 45 || weathercode == 48) {
        return "Fog";
      } else if (weathercode == 51 || weathercode == 53 || weathercode == 55) {
        return "Drizzle";
      } else if (weathercode == 56 || weathercode == 57) {
        return "Freezing Drizzle";
      } else if (weathercode == 61 || weathercode == 63 || weathercode == 65) {
        return "Rain";
      } else if (weathercode == 66 || weathercode == 67) {
        return "Freezing Rain";
      } else if (weathercode == 95) {
        return "Thunder Storm";
      } else return "Weather not found";
      //       0	Clear sky
      // 1, 2, 3	Mainly clear, partly cloudy, and overcast
      // 45, 48	Fog and depositing rime fog
      // 51, 53, 55	Drizzle: Light, moderate, and dense intensity
      // 56, 57	Freezing Drizzle: Light and dense intensity
      // 61, 63, 65	Rain: Slight, moderate and heavy intensity
      // 66, 67	Freezing Rain: Light and heavy intensity
      // 71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
      // 77	Snow grains
      // 80, 81, 82	Rain showers: Slight, moderate, and violent
      // 85, 86	Snow showers slight and heavy
      // 95 *	Thunderstorm: Slight or moderate
      // 96, 99 *
    };

    insertWeather({
      longitude: longitude,
      latitude: latitude,
      timestamp: timeForDatabase,
      temperature: temperature[indexOfTime],
      cloudCover: cloudCover[indexOfTime],
      weatherCode: translatingWeatherCode(weather),
    });
    // console.log(weatherOutput);

    sendSimpleMessage(
      temperature[indexOfTime],
      cloudCover[indexOfTime],
      translatingWeatherCode(weather),
    );
  } catch (error) {
    console.log(error.message);
  }
}

//
fetchData();
// setInterval(fetchData, 10000);
//Get the longitude, latitude, timestamp and temperature.
//Create database in supabase
//Use the library from supabase, connect it to weather app

const sql = postgres(
  "postgresql://postgres:" +
    process.env.DATABASE_PASS +
    "@db.hnwfcdxvuuuzqkilxenb.supabase.co:5432/postgres",
); // will use psql environment variables

async function insertWeather({
  longitude,
  latitude,
  timestamp,
  temperature,
  cloudCover,
  weatherCode,
}) {
  console.log("1");
  await sql`insert into weather values(${longitude}, ${latitude}, ${timestamp}, ${temperature}, ${cloudCover}, ${weatherCode})`;
  console.log("2");
}

// insertWeather({
//   longitude: 10,
//   latitude: 12,
//   timestamp: `2026-01-19T22:00`,
//   temperature: 11,
// });

//Every hour it get the weather, setInterval, add a row to the database with the weather data.
//Create a separate file, Logs the latest 10 results to supabase. (getDataResults)
//put the password to supabase ENV

//MailGun API

async function sendSimpleMessage(temperature, cloudCover, weather) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.API_KEY,
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net"
  });
  try {
    // HOMEWORK: instead of sending an email, create a new row in supabase with the weather and time
    const data = await mg.messages.create(
      process.env.MAILGUN_KEY + ".mailgun.org",
      {
        from:
          "Mailgun Sandbox <postmaster@" +
          process.env.MAILGUN_KEY +
          ".mailgun.org>",
        to: ["Renzo <zo.vergeldedios@gmail.com>"],
        subject: "Weather for today",
        text: `Hello! Right now the temperature is ${temperature}°C, and it is ${cloudCover}% cloudy. We have ${weather} today`,
      },
    );

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}
