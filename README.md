# Weather App

This weather app let's me know the current temperature, cloudiness in my area. It will send the current temperature, the cloudiness and the current weather to my email and supabase.

## Description

This app sends me an email about the weather, temperature and how cloudy it is on the current hour.

This app helped me practice and learn about `async await`, `setTimeout`, APIs and `.env`.

I learned how to connect APIs to my app with this project. (Open meteo, Supabase and Mailgun)
I learned how to exclude sensitive information using .env.

The app is under `script.js`

## Instructions

1. Create .env file and create the following values

```
API_KEY="" # supabase
EMAIL=""
LOCATION="" # 11.11,22.22
MAILGUN_KEY=""
DATABASE_PASS="" # supabase db password
```

2. Install node js on your computer.
3. On your terminal, type node script.js to run the app.
