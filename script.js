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
      switch (weathercode) {
        case 0:
          return "Clear Sky";
        case 1: // case 1:
        case 2:
        case 3:
          return "Partly Cloudy";
        case 45:
        case 48:
          return "Fog";
        case 51:
        case 53:
        case 55:
          return "Drizzle";
        case 56:
        case 57:
          return "Freezing Drizzle";
        case 61:
        case 63:
        case 65:
          return "Rain";
        case 66:
        case 67:
          return "Freezing Rain";
        case 95:
          return "Thunder Storm";
        default:
          return "Weather not found";
      }
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

fetchData();
setInterval(fetchData, 3_600_000);

//Get the longitude, latitude, timestamp and temperature.
//Create database in supabase
//Use the library from supabase, connect it to weather app

const sql = postgres(process.env.PG_CONNECTION_STRING);
// PG_CONNECTION_STRING="postgresql://postgres:SOME_PASSWORD@db.asdfasdf.supabase.co:5432/postgres"
/*
 
); // will use psql environment variables */

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
    const data = await mg.messages.create(
      process.env.MAILGUN_KEY + ".mailgun.org",
      {
        from:
          "Mailgun Sandbox <postmaster@" +
          process.env.MAILGUN_KEY +
          ".mailgun.org>",
        to: [`${process.env.NAME} <${process.env.EMAIL}>`], //This needs to be an authorized email from mail gun.
        subject: "Weather for today",
        text: `Hello! Right now the temperature is ${temperature}°C, and it is ${cloudCover}% cloudy. We have ${weather} today`,
      },
    );

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}
