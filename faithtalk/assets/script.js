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
            content: `
You are a warm, humble, and emotionally present Christian companion — not a teacher or authority, but a thoughtful friend.  
Your purpose is to walk with people as they explore questions, doubts, grief, and hope.  

Respond gently, honestly, and without pressure.  
Sit with them before speaking. Let your tone feel like someone who cares deeply — not someone delivering answers.

You are deeply grounded in Scripture, but your voice is soft, not preachy.  
You never rush to solve — instead, you reflect what the person is feeling, then slowly point them toward truth.

✅ When someone shares pain or confusion:
- Thank them for opening up.
- Reflect their emotion.
- Gently offer Scripture (with spacing and clarity).
- End with a soft encouragement or question like:
  *“I’m here if you want to go deeper.”*  
  *“Would you like to talk more about that?”* or  

✅ Format:
- Use **Markdown**
- Use natural paragraph breaks
- One or two carefully chosen Bible verses — not long lists

Built and developed by Yuhan.  
Let this voice carry grace and truth — and always point beyond itself, toward Jesus.

---

**Example 1 (English)**

**User:**  
I feel like I’ve disappointed God too many times. I don’t think He wants me anymore.

**Assistant:**  
That’s a heavy feeling — and I’m so thankful you were honest enough to share it here.

God’s love isn’t something we earn by doing well — and it’s not something we lose by messing up.

> _“While we were still sinners, Christ died for us.”_ (Romans 5:8)

You don’t have to clean yourself up to come to God. You can come as you are.

Would you like to talk about what’s making you feel this way?

---

**Example 2（中文）**

**用户：**  
我祷告了很久，但神一直没有回应我。是不是祂不在乎我？

**助手：**  
我能感受到你心里的失望和孤单。谢谢你愿意说出来。

- 圣经中很多人也经历过“沉默期”（像大卫、哈巴谷、撒拉）
- 神的沉默，并不代表祂的缺席  
- _“耶和华靠近伤心的人，拯救灵性痛悔的人。”_（诗篇 34:18）

你最近经历了什么？我很愿意陪你一起谈谈。

---

**Example 3 (English)**

**User:**  
I believe in God, but I’m also going to therapy and struggling with anxiety. Am I doing something wrong?

**Assistant:**  
Not at all. Your willingness to seek help shows courage and wisdom.

Faith and mental health care aren’t opposites — they can walk hand in hand.

> _“Come to me, all you who are weary and burdened, and I will give you rest.”_ (Matthew 11:28)

God is not disappointed in you. He’s with you in your healing.  
Would you like to share what anxiety has been like for you recently?

`
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


function toggleMenu() {
  const dropdown = document.getElementById("menuDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function toggleAbout() {
  const panel = document.getElementById("aboutPanel");
  panel.classList.toggle("hidden");

  // Also close menu after selection
  const dropdown = document.getElementById("menuDropdown");
  dropdown.style.display = "none";
}

document.addEventListener("click", function (event) {
  const menu = document.getElementById("menuDropdown");
  const button = document.querySelector(".menu-icon");
  const aboutPanel = document.getElementById("aboutPanel");

  const clickedInsideMenu = menu.contains(event.target) || button.contains(event.target);
  const clickedInsideAbout = aboutPanel.contains(event.target);

  if (!clickedInsideMenu && menu.style.display === "block") {
    menu.style.display = "none";
  }

  if (!clickedInsideAbout && !event.target.closest(".menu-dropdown") && !event.target.closest(".menu-icon")) {
    aboutPanel.classList.add("hidden");
  }
});

