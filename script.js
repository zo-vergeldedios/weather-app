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
    // const translatingWeatherCode = (weatherCode[indexOfTime]) => {

    // }

    insertWeather({
      longitude: longitude,
      latitude: latitude,
      timestamp: timeForDatabase,
      temperature: temperature[indexOfTime],
      cloudCover: cloudCover[indexOfTime],
      // weatherCode: ,
    });
    // console.log(weatherOutput);

    sendSimpleMessage(temperature[indexOfTime], cloudCover[indexOfTime]);
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
}) {
  console.log("1");
  await sql`insert into weather values(${longitude}, ${latitude}, ${timestamp}, ${temperature}, ${cloudCover})`;
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

async function sendSimpleMessage(temperature, cloudCover, weatherCode) {
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
        text: `Hello! Right now the temperature is ${temperature}	°C, and it is ${cloudCover}% cloudy. `,
        // The weather for today is ${weatherCode}
      },
    );

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}
