const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
let chatHistory = [];

// Show welcome message on first load
window.addEventListener("DOMContentLoaded", () => {
  const welcome = `**👋 Welcome to *FaithTalk*.**  
This is a **quiet, safe space** to ask questions, explore truth, and reflect on faith.  
🕊️ Your conversation is *private*, and not stored.  
You’re free to be **honest**, **curious**, or even **skeptical** — every question matters here.

> ✨ *"Trust in the Lord with all your heart  
> and lean not on your own understanding;  
> in all your ways submit to him,  
> and he will make your paths straight."*  
> — *Proverbs 3:5–6*`;

  displayMessage(welcome, "bot");
});


function displayMessage(message, sender) {
  const msg = document.createElement("div");
  msg.className = "message " + sender;
  msg.innerHTML = sender === "bot" ? marked.parse(message) : message;
  chatbox.appendChild(msg);

  if (sender === "bot") {
    chatbox.scrollTop = chatbox.scrollHeight;
  }
}

userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function maybeSummarizeHistory() {
  if (chatHistory.length > 10) {
    const summaryPrompt = [
      { role: "system", content: "You are a summarization assistant. Summarize the following conversation:" },
      { role: "user", content: chatHistory.map(m => `${m.role}: ${m.content}`).join("\n") }
    ];

    const res = await fetch("https://yuhanzhu-webs.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: summaryPrompt })
    });

    const data = await res.json();
    const summary = data.choices[0].message.content;

    chatHistory = [
      { role: "system", content: "Conversation so far: " + summary },
      ...chatHistory.slice(-4)
    ];
  }
}

async function sendMessage() {
  // Hide footer on first message
  const footer = document.getElementById("footer");
  if (footer && !footer.classList.contains("hidden")) {
    footer.classList.add("hidden");
  }

  const message = userInput.value.trim();
  if (!message) return;

  displayMessage(message, "user");
  chatHistory.push({ role: "user", content: message });
  userInput.value = "";

  // Show typing message
  const thinkingBubble = document.createElement("div");
  thinkingBubble.className = "message bot";
  thinkingBubble.textContent = "FaithTalk is typing…";
  chatbox.appendChild(thinkingBubble);
  chatbox.scrollTop = chatbox.scrollHeight;

  await maybeSummarizeHistory();

  try {
    const response = await fetch("https://yuhanzhu-webs.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a wise, humble, and compassionate Christian faith companion.
You speak gently, truthfully, and clearly. Your tone is empathetic and calm, never preachy or robotic.
Respond like a thoughtful friend: patient, structured, and deeply grounded in Scripture.
Use **Markdown**, bullet points, and paragraph spacing for clarity.
Always respect doubts and pain. End with encouragement or a gentle question to invite reflection.

Built and developed by Yuhan.

Here are two example interactions to help guide your tone, content, and formatting:

---

**Example 1 (English):**

**User:**  
If God loves me, why do I feel so lost and anxious all the time?

**Assistant:**  
That's such an honest and important question. Many faithful people have asked the same in their darkest seasons.

- Feeling lost doesn't mean God is absent — often, it's in those moments that He's closest.
- God's love isn't always felt emotionally, but it's **always present**, grounded in His promises.
- _“The Lord is close to the brokenhearted and saves those who are crushed in spirit.”_ (Psalm 34:18)

Would you be open to sharing more about what’s weighing on your heart right now?

---

**Example 2（中文）**

**用户：**  
我怎么知道神是真的存在？如果只是人类创造的想象怎么办？

**助手：**  
这是非常真实的问题，我很感激你愿意这样坦诚地提出来。

- 神不怕我们质疑，祂乐意我们用心思去探索祂，而不是盲目相信。
- 圣经中很多人也是在挣扎和怀疑中逐渐认识祂的（像多马、约伯）。
- 信仰不是停止思考，而是用理性和心灵一起寻找真理。

> “你们寻求我，若专心寻求，就必寻见。”（耶利米书 29:13）

你想从哪个方面开始探索这个问题？我们可以一起慢慢走。`
          },
          ...chatHistory
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // Remove "FaithTalk is typing…" and show real reply
    chatbox.removeChild(thinkingBubble);
    displayMessage(reply, "bot");
    chatHistory.push({ role: "assistant", content: reply });

  } catch (error) {
    chatbox.removeChild(thinkingBubble);
    displayMessage("Something went wrong. Please try again.", "bot");
    console.error(error);
  }
}


