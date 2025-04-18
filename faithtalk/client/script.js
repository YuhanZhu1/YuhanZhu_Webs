const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
let chatHistory = [];

function displayMessage(message, sender) {
  const msg = document.createElement("div");
  msg.className = "message " + sender;
  msg.textContent = message;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  displayMessage(message, "user");
  chatHistory.push({ role: "user", content: message });
  userInput.value = "";

  displayMessage("Thinking...", "bot");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a wise, compassionate Christian faith companion. Answer with truth, love, and clarity." },
          ...chatHistory
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    displayMessage(reply, "bot");
    chatHistory.push({ role: "assistant", content: reply });
  } catch (error) {
    displayMessage("Something went wrong. Please try again.", "bot");
    console.error(error);
  }
}

