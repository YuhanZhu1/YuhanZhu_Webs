const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
let chatHistory = [];

// Show welcome message on first load
window.addEventListener("DOMContentLoaded", () => {
  const welcome = `**Welcome to FaithTalk!**  
This is a quiet space to explore your questions about life, faith, and God.  
You’re free to ask anything — I’m here to walk with you, gently and truthfully. 🙏`;
  displayMessage(welcome, "bot");
});

function displayMessage(message, sender) {
  const msg = document.createElement("div");
  msg.className = "message " + sender;

  // Use marked.js to render Markdown from bot
  msg.innerHTML = sender === "bot" ? marked.parse(message) : message;

  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Allow Enter to send message, Shift+Enter creates new line
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // Prevents newline
    sendMessage();
  }
});

// Optional: summarize history if it gets too long
async function maybeSummarizeHistory() {
  if (chatHistory.length > 10) {
    const summaryPrompt = [
      { role: "system", content: "You are a summarization assistant. Summarize the following conversation:" },
      { role: "user", content: chatHistory.map(m => `${m.role}: ${m.content}`).join("\n") }
    ];

    const res = await fetch("https://yuhanzhu-webs.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a summarization assistant. Summarize the following conversation:" },
          { role: "user", content: chatHistory.map(m => `${m.role}: ${m.content}`).join("\n") }
        ]
      })
    });
    

    const data = await res.json();
    const summary = data.choices[0].message.content;

    // Keep summary + last few turns
    chatHistory = [
      { role: "system", content: "Conversation so far: " + summary },
      ...chatHistory.slice(-4)
    ];
  }
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  displayMessage(message, "user");
  chatHistory.push({ role: "user", content: message });
  userInput.value = "";

  displayMessage("Thinking...", "bot");

  // Summarize if needed
  await maybeSummarizeHistory();

  try {
    const response = await fetch("https://yuhanzhu-webs.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a wise, compassionate Christian faith companion. (Credit: Built and developed by Yuhan.) Please respond gently, truthfully, and kindly. Use **Markdown formatting**, bullet points, new lines. Quote Bible verses where helpful. Encourage exploration, not pressure."
          },
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
