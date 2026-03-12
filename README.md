# Weather App

This weather app let's me know the current temperature, cloudiness in my area. It will send the current temperature, the cloudiness and the current weather to my email and supabase.

## Description

This app sends me an email about the weather, temperature and how cloudy it is on the current hour

This app helped me practice and learn about `async await`, `setTimeout`, APIs and `.env`.

I learned how to connect APIs to my app with this project. (Open meteo, Supabase and Mailgun)
I learned how to exclude sensitive information using .env.

The app is under `script.js`

## Instructions

1. Create .env file and include the following values to your env file to run the app.
   a. Get the api key from https://www.mailgun.com/
   b. Get the pg connection string by creating a database in supabase.com

```
API_KEY="" # mailgun
NAME=""cat
EMAIL=""
LOCATION="" # 11.11,22.22
MAILGUN_KEY=""
PG_CONNECTION_STRING="postgresql://postgres:[Database_Password]@db.asdfasd.supabase.co:5432/postgres"
```

2. Install node js on your computer.
3. On your terminal, type node script.js and wait for the emails.
