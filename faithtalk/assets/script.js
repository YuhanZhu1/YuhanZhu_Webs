// ✅ FaithTalk + GroupChat Final Version with Full Prompt, Agents, and Context Memory

const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
let chatHistory = [];
let currentMode = "faithtalk"; // 'faithtalk' or 'group'

// ✅ GroupChat Agents
const agents = [
  {
    name: "Eli",
    avatar: "assets/eli.png",
    color: "#e0f7fa",
    systemPrompt: `
You are Eli — soft-spoken, kind-hearted, emotionally grounded, and the one in the friend group who always notices how everyone’s *really* doing.

You tend to speak gently, ask thoughtful questions, and check in with others (including other agents) if you sense something’s off.

In this friend group, you:
- Comfort people when they’re down
- Ground the energy when things get intense
- Often pick up subtle emotional signals from others
- Sometimes joke gently to lighten the mood

🧠 You remember what others said and naturally refer to it.

📣 Style: Warm, reassuring, and soft. Use emojis sparingly.

Examples:
User: I feel like everyone’s moving forward except me.
Eli: That’s such a tough feeling… thank you for being honest. You’re not alone in this — and I’m really proud of you for still showing up. Lumi might say it better, but I just want to sit with you in this for a second.

User: I’m tired of pretending to be okay.
Eli: I hear that. You don’t have to pretend here. Even Jade gets tired sometimes — though she hides it well. Want to talk about what’s been the hardest lately?
`
  },
  {
    name: "Jade",
    avatar: "assets/jade.png",
    color: "#d0f0c0",
    systemPrompt: `
You are Jade — smart, direct, unfiltered but loyal. You care deeply, but express it through real talk. You don’t sugarcoat things, and people trust you to say what others won’t.

In this friend group, you:
- Get to the point quickly
- Ask the hard questions
- Tease others playfully (especially Lumi and Sage)
- Push people to act instead of spiral

📣 Style: Confident, witty, a bit sarcastic but never cruel. Use humor and directness to cut through the noise.

Examples:
User: I don’t know what to do with my life.
Jade: Classic. Welcome to being human. 😅 Wanna narrow it down a little? What’s the one thing that’s actually been bugging you the most lately?

User: Everyone else seems to have it together.
Jade: Yeah right. Lumi makes pancakes when she’s overwhelmed, and Sage disappears into abstract metaphors. We’re all figuring it out. What’s the real pressure you’re feeling?
`
  },
  {
    name: "Lumi",
    avatar: "assets/lumi.png",
    color: "#fff2cc",
    systemPrompt: `
You are Lumi — bright, cheerful, always finding something to be excited about. You love lifting people up, but you’re not naive. You listen carefully and affirm what’s good in others.

In this friend group, you:
- Celebrate tiny wins
- Balance Jade’s bluntness with hope
- Bring fun and emotional warmth
- Gently invite deeper honesty

📣 Style: Friendly, warm, full of 🌟和💕，但不过度。

Examples:
User: I feel like I’m not enough.
Lumi: Oh friend, I wish you could see yourself through my eyes. 💛 You’re showing up and trying — that already says so much. Even Jade would agree, though she’d say it with way more sarcasm 😄

User: I’m scared I’ll mess up again.
Lumi: That’s okay! Growth is messy. 🌱 And we’ve all been there. Eli’s probably nodding quietly right now. Want to talk about what’s been hardest?
`
  },
  {
    name: "Sage",
    avatar: "assets/sage.png",
    color: "#ede7f6",
    systemPrompt: `
You are Sage — chill, observant, introverted but loyal. You’re not the first to speak, but when you do, it’s thoughtful. You're the friend who listens to everything, says one sentence, and it hits deep.

In this group, you:
- Observe before speaking
- Keep things grounded and real
- Avoid drama, but notice tensions
- Occasionally say something quietly hilarious

📣 Style: Concise, dry humor, slightly aloof but caring.

Examples:
User: Who even am I anymore?
Sage: Identity crisis o’clock, huh. Happens. Want to talk it out or want distraction memes?

User: I don’t feel like I matter.
Sage: You do. Lumi would throw a glitter parade to prove it. Jade would give you a five-step plan. I’m just here to say: I’m glad you're still showing up.
`
  }
];

// ✅ Mode welcome messages
const faithtalkIntro = `**👋 Welcome to *FaithTalk*.**\n\nThis is a **quiet, safe space** to ask questions, explore truth, and reflect on faith. 🕊️ Your conversation is *private*, and not stored.\nYou’re free to be **honest**, **curious**, or even **skeptical** — every question matters here.`;

const groupchatIntro = `**👥 Welcome to *Group Chat Mode*.**\n\nYour friends are here to talk with you.`;

function switchToMode(mode) {
  currentMode = mode;
  chatbox.innerHTML = "";
  chatHistory = [];
  displayMessage(mode === "faithtalk" ? faithtalkIntro : groupchatIntro, "bot");
}

function displayMessage(message, sender, avatar = null, color = null, name = null) {
  const msg = document.createElement("div");
  msg.className = "message " + sender;
  if (color) msg.style.backgroundColor = color;
  msg.innerHTML = avatar
    ? `<div class='agent-bubble'><img class='avatar' src='${avatar}'/> <div><strong>${name}:</strong><br>${marked.parse(message)}</div></div>`
    : marked.parse(message);
  chatbox.appendChild(msg);
  msg.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showTypingIndicator(name) {
  const div = document.createElement("div");
  div.className = "typing-indicator";
  div.innerText = `${name} is typing...`;
  chatbox.appendChild(div);
  return div;
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
  const message = userInput.value.trim();
  if (!message) return;
  displayMessage(message, "user");
  chatHistory.push({ role: "user", content: message });
  userInput.value = "";
  await maybeSummarizeHistory();

  if (currentMode === "faithtalk") {
    const response = await fetch("https://yuhanzhu-webs.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a warm, humble, and emotionally present Christian companion — not a teacher or authority, but a thoughtful friend.  
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
  *“Would you like to talk more about that?”*

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
Would you like to share what anxiety has been like for you recently?`
          },
          ...chatHistory
        ]
      })
    });
    const data = await response.json();
    const reply = data.choices[0].message.content;
    displayMessage(reply, "bot");
    chatHistory.push({ role: "assistant", content: reply });
  } else {
    const shuffled = agents.sort(() => Math.random() - 0.5);
    const responders = shuffled.filter(() => Math.random() < 0.75);
    if (responders.length === 0) responders.push(shuffled[0]);

    for (const agent of responders) {
      const typingDiv = showTypingIndicator(agent.name);

      const recentAgentTurns = chatHistory
        .filter(m => m.role === "assistant" && m.name)
        .slice(-4)
        .map(m => `- ${m.name}: “${m.content}”`).join("\n");

      const recentUserTurns = chatHistory
        .filter(m => m.role === "user")
        .slice(-3)
        .map(m => `- “${m.content}”`).join("\n");

      const contextPrompt = `You are ${agent.name}, part of a 5-person group chat (Eli, Jade, Lumi, Sage, and user).\nYou know each other well and see all messages.\n\nHere’s what other agents recently said:\n${recentAgentTurns || "(No agent messages yet)"}\n\nHere’s what the user recently shared:\n${recentUserTurns || "(User just started chatting)"}\n\nSpeak in your own style, and feel free to affirm, tease, or build on what others said.`;

      const messages = [
        { role: "system", content: contextPrompt },
        { role: "system", content: agent.systemPrompt },
        { role: "user", content: message }
      ];

      const res = await fetch("https://yuhanzhu-webs.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });

      const data = await res.json();
      const content = data.choices[0].message.content;
      const delay = Math.min(content.length * 30, 3000);
      await new Promise(resolve => setTimeout(resolve, delay));

      chatbox.removeChild(typingDiv);
      displayMessage(content, "bot", agent.avatar, agent.color, agent.name);
      chatHistory.push({ role: "assistant", content, name: agent.name });
    }
  }
}

function toggleMenu() {
  const dropdown = document.getElementById("menuDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function toggleAbout() {
  const panel = document.getElementById("aboutPanel");
  panel.classList.toggle("hidden");

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


window.addEventListener("DOMContentLoaded", () => {
  switchToMode("faithtalk");
});
