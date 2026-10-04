const express = require("express");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WA_TOKEN = process.env.WA_TOKEN;
const PHONE_ID = process.env.PHONE_ID;

// Meta webhook verify
app.get("/webhook", (req, res) => {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === VERIFY_TOKEN
  ) {
    return res.status(200).send(req.query["hub.challenge"]);
  }
  res.sendStatus(403);
});

// Incoming messages
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  try {
    const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!msg || msg.type !== "text") return;

    const from = msg.from;
    const text = msg.text.body.toLowerCase();

    let reply = "ආයුබෝවන්! Golden Glow Skin වෙත සාදරයෙන් පිළිගන්නවා. ඔබට උදව් කරන්නේ කෙසේද?";
    if (text.includes("price") || text.includes("මිල")) {
      reply = "මිල ගණන් ගැන දැනගන්න කරුණාකර අපට පණිවිඩයක් තබන්න.";
    }

    await fetch(`https://graph.facebook.com/v25.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply },
      }),
    });
  } catch (e) {
    console.error(e);
  }
});

app.listen(process.env.PORT || 3000);
