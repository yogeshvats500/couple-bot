// index.js
const express = require("express");
const bodyParser = require("body-parser");
const { MessagingResponse } = require("twilio").twiml;
const { Pool } = require("pg");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Connect to Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Function to get a random question from DB by type
async function getRandomQuestion(type) {
  try {
    const res = await pool.query(
      "SELECT question FROM questions WHERE type=$1 ORDER BY RANDOM() LIMIT 1",
      [type]
    );
    return res.rows.length > 0 ? res.rows[0].question : "No questions available yet.";
  } catch (err) {
    console.error("DB Error:", err);
    return "Error fetching question. Please try again later.";
  }
}

// Twilio WhatsApp webhook
app.post("/whatsapp", async (req, res) => {
  const msg = (req.body.Body || "").trim().toLowerCase();
  const twiml = new MessagingResponse();
  let reply = "";

  if (msg === "start") {
    reply = "💖 Welcome lovebirds! Choose:\n1️⃣ Truth\n2️⃣ Dare\n3️⃣ Random";
  } else if (msg === "1") {
    reply = "Truth: " + await getRandomQuestion("truth");
  } else if (msg === "2") {
    reply = "Dare: " + await getRandomQuestion("dare");
  } else if (msg === "3") {
    reply = await getRandomQuestion("random");
  } else {
    reply = "Type 'start' to begin or 1️⃣ Truth, 2️⃣ Dare, 3️⃣ Random";
  }

  twiml.message(reply);
  res.type("text/xml").send(twiml.toString());
});

// Optional GET / route for testing in browser
app.get("/", (req, res) => {
  res.send("💖 Couples WhatsApp Game Bot is live!");
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Bot running on port ${port}`));
