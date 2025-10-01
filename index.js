const express = require("express");
const bodyParser = require("body-parser");
const { MessagingResponse } = require("twilio").twiml;
const { Pool } = require("pg");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// DB connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Get random question by type
async function getRandomQuestion(type) {
  const res = await pool.query(
    "SELECT question FROM questions WHERE type=$1 ORDER BY RANDOM() LIMIT 1",
    [type]
  );
  return res.rows.length > 0 ? res.rows[0].question : "No questions available yet.";
}

app.post("/whatsapp", async (req, res) => {
  const twiml = new MessagingResponse();
  const msg = req.body.Body.trim().toLowerCase();

  if (msg === "start") {
    twiml.message("💖 Welcome lovebirds! Choose:\n1️⃣ Truth\n2️⃣ Dare\n3️⃣ Random");
  } else if (msg === "1") {
    twiml.message("Truth: " + await getRandomQuestion("truth"));
  } else if (msg === "2") {
    twiml.message("Dare: " + await getRandomQuestion("dare"));
  } else if (msg === "3") {
    twiml.message("🎲 " + await getRandomQuestion("random"));
  } else {
    twiml.message("Type 'start' to begin or 1️⃣ Truth, 2️⃣ Dare, 3️⃣ Random");
  }

  res.type("text/xml").send(twiml.toString());
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
