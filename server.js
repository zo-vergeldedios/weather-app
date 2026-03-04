// console.log(process.env);
// console.log(process.env.API_KEY);
import "dotenv/config";

import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

async function sendSimpleMessage(weather) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.API_KEY,
  });
  try {
    const data = await mg.messages.create(
      process.env.MAILGUN_KEY + ".mailgun.org",
      {
        from:
          "Mailgun Sandbox <postmaster@" +
          process.env.MAILGUN_KEY +
          ".mailgun.org>",
        to: [process.env.EMAIL + " <zo.vergeldedios@gmail.com>"],
        subject: "Weather for today",
        text: `Hi`,
      },
    );

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}

sendSimpleMessage();
