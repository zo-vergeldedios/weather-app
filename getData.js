import "dotenv/config";
import postgres from "postgres";

async function fetchData() {
  const [latitude, longitude] = process.env.LOCATION.split(",");
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&timezone=GMT`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();

    // console.log(result);

    const date = new Date().toJSON();
    const currentDate = date.slice(0, 14);
    const modifiedDate = currentDate + "00";

    const time = result.hourly.time;
    const indexOfTime = time.indexOf(modifiedDate);

    const temperatures = result.hourly.temperature_2m;

    for (let i = 0; i < 10; i++) {
      const temperature = temperatures[indexOfTime + i];
      const timestamp = time[indexOfTime + i];

      insertWeather({
        longitude,
        latitude,
        timestamp,
        temperature,
      });
    }
    // let newTime;
    // for (let i = -1; i >= -10; i--) {
    //   newTime = time.at(i);
    //   let newTemp = temperature.at(i);
    //   console.log(timeForDatabase, newTemp);

    // }
    // let indexOfTime = newTime.indexOf(temperature);
    // console.log(modifiedDate);
    // sendSimpleMessage();
  } catch (error) {
    console.log(error.message);
  }
}
fetchData();

const sql = postgres(
  "postgresql://postgres:" +
    process.env.DATABASE_PASS +
    "@db.hnwfcdxvuuuzqkilxenb.supabase.co:5432/postgres",
); // will use psql environment variables

async function insertWeather({ longitude, latitude, timestamp, temperature }) {
  console.log(timestamp);
  const timestampForDatabase = timestamp.replace("T", " ") + ":00 UTC";
  console.log(timestampForDatabase);
  console.log("1");
  await sql`insert into weather10results values(${longitude}, ${latitude}, ${timestampForDatabase}, ${temperature})`;
  console.log("2");
}
