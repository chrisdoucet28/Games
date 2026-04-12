import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const TEAM_COLORS = [
  { name: "Red", bg: "#EF4444", light: "#FEE2E2", dark: "#991B1B", emoji: "🔴" },
  { name: "Blue", bg: "#3B82F6", light: "#DBEAFE", dark: "#1E3A8A", emoji: "🔵" },
  { name: "Green", bg: "#22C55E", light: "#DCFCE7", dark: "#14532D", emoji: "🟢" },
  { name: "Yellow", bg: "#EAB308", light: "#FEF9C3", dark: "#713F12", emoji: "🟡" },
];

const GAME_MODES = [
  { id: "auction",   name: "Sentence Auction",  icon: "🏛️", desc: "Bet points on correct or incorrect sentences",               color: "#8B5CF6", tag: "Read & analyse sentences" },
  { id: "battleship",name: "Grammar Battleship", icon: "⚓",  desc: "Attack coordinates by answering correctly",                 color: "#3B82F6", tag: "Short answers & recall" },
  { id: "hotpotato", name: "Hot Potato",         icon: "🥔",  desc: "Answer fast or keep the potato — the timer ends randomly",  color: "#F97316", tag: "Quick completions under pressure" },
  { id: "castle",    name: "Castle Defense",     icon: "🏰",  desc: "Correct answers let you attack enemies",                    color: "#10B981", tag: "Short answers & recall" },
  { id: "hill",      name: "King of the Hill",   icon: "👑",  desc: "Capture zones by answering questions",                     color: "#EC4899", tag: "Short answers & recall" },
  { id: "bridge",    name: "Bridge Builder",     icon: "🌉",  desc: "Race to build your bridge across four different task types",color: "#0EA5E9", tag: "Mixed — from recall to speaking" },
  { id: "minefield", name: "Minefield",          icon: "💣",  desc: "Combine sentence fragments to speak — and dodge the mines",  color: "#EF4444", tag: "Construct full sentences aloud" },
  { id: "cards",     name: "Card Shuffle",       icon: "🃏",  desc: "Pick a card and complete an open speaking or writing task",  color: "#F59E0B", tag: "Open speaking tasks" },
  { id: "hotseat",   name: "Hot Seat",           icon: "🔥",  desc: "Describe words to your teammate — no spelling allowed",     color: "#EF4444", tag: "Free description & paraphrase" },
  { id: "spy",       name: "Spy Among Us",       icon: "🕵️",  desc: "Speak freely, listen carefully, find who has a different topic", color: "#374151", tag: "Free discussion & deduction" },
];

const TASK_TYPES = ["finish the sentence", "correct grammar mistakes", "use vocabulary in a sentence", "choose correct grammar", "rewrite sentences", "speaking task"];

// ─── BUILT-IN QUESTION LIBRARY ────────────────────────────────────────────────
const TOPIC_LIBRARY = {
  // ── GRAMMAR TOPICS ──────────────────────────────────────────────────────────
  so_neither: {
    label: "So do I / Neither do I",
    category: "grammar",
    questions: [
      { type:"choose correct grammar", question:"'I love pizza.' — 'So ___ I.' (do/am/have)", answer:"do", hint:"'So do I' agrees with a main verb", difficulty:"easy" },
      { type:"choose correct grammar", question:"'I'm tired.' — '___ am I.' (So/Neither/Nor)", answer:"So", hint:"'So am I' agrees with a positive statement", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I don't like horror films.' — 'Neither do I don't.'", answer:"Neither do I.", hint:"No double negative needed", difficulty:"easy" },
      { type:"finish the sentence", question:"'I haven't been to Paris.' — 'Neither ___ I.'", answer:"have", hint:"Match the auxiliary verb from the original", difficulty:"medium" },
      { type:"finish the sentence", question:"'She can swim.' — 'So ___ he.'", answer:"can", hint:"Repeat the modal verb", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I'm not hungry.' — 'Neither I am.'", answer:"Neither am I.", hint:"Inversion is required after Neither", difficulty:"medium" },
      { type:"choose correct grammar", question:"'They've finished.' — '___ have we.' (So/Neither/But)", answer:"So", hint:"'So have we' agrees with a positive statement", difficulty:"medium" },
      { type:"finish the sentence", question:"'I wouldn't do that.' — 'Neither ___ I.'", answer:"would", hint:"Match the modal verb", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'I didn't enjoy it.' — 'Neither I did.'", answer:"Neither did I.", hint:"Subject and auxiliary must be inverted", difficulty:"medium" },
      { type:"choose correct grammar", question:"'I was confused.' — '___ was he.' (Neither/So/Nor)", answer:"So", hint:"'So was he' for agreement with positives", difficulty:"medium" },
      { type:"finish the sentence", question:"'I've never met him.' — 'Neither ___ she.'", answer:"has", hint:"Change pronoun and match present perfect auxiliary", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'I'm not coming.' — 'Neither am I coming.'", answer:"Neither am I.", hint:"Don't repeat the main verb", difficulty:"hard" },
      { type:"choose correct grammar", question:"'She doesn't care.' — '___ do I.' (Neither/Nor/So)", answer:"Neither", hint:"Agree with a negative using 'neither'", difficulty:"hard" },
      { type:"finish the sentence", question:"'He had already left.' — 'So ___ she.'", answer:"had", hint:"Use past perfect auxiliary", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'I can't afford it.' — 'Neither can't I.'", answer:"Neither can I.", hint:"'Neither' already makes it negative", difficulty:"hard" },
      { type:"rewrite sentences", question:"Rewrite: 'I like coffee and she likes coffee too.' Using 'so'", answer:"I like coffee and so does she.", hint:"Use inversion after 'so'", difficulty:"hard" },
      { type:"rewrite sentences", question:"Rewrite: 'He doesn't smoke. I don't smoke.' Using 'neither'", answer:"He doesn't smoke and neither do I.", hint:"Join with 'and neither do I'", difficulty:"hard" },
      { type:"finish the sentence", question:"'They aren't ready.' — 'Neither ___ we.'", answer:"are", hint:"Match 'to be' from the original", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'I will help.' — 'So I will.'", answer:"So will I.", hint:"Auxiliary must come before the subject", difficulty:"hard" },
      { type:"choose correct grammar", question:"'I've read that book.' — '___ have I.' (So/Neither/Nor)", answer:"So", hint:"Positive response to a positive statement", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"So do I / Neither do I", spyTopic:"Simple Agreement (me too / me neither)", crewmatePrompt:"Share two things you love and two things you don't like — your partner must agree using 'So do I' or 'Neither do I'.", spyPrompt:"Share two things you love and two things you don't like — your partner agrees by saying 'Me too' or 'Me neither'.", explanation:"Crewmates use 'So do I' / 'Neither do I' with inversion. The spy uses the informal 'Me too' / 'Me neither' instead.", spyGuessOptions:["So do I / Neither do I","Present Simple Agreements","Me too / Me neither","Auxiliary Verbs"] },
      { crewmateTopic:"So do I / Neither do I", spyTopic:"Also / Either", crewmatePrompt:"Say three things about yourself and wait for your teammates to respond using 'So do I', 'Neither do I', or 'So can I'.", spyPrompt:"Say three things about yourself and wait for teammates to respond using 'I also…' or 'I don't either'.", explanation:"Crewmates use inverted 'So/Neither + auxiliary + subject'. The spy uses 'also' and 'either' without inversion.", spyGuessOptions:["So do I / Neither do I","Also / Either","Nor do I structure","Question Tags"] },
      { crewmateTopic:"So do I / Neither do I", spyTopic:"Nor do I", crewmatePrompt:"Make statements about your habits and preferences. Respond to others using 'So does she' or 'Neither have I'.", spyPrompt:"Make statements about habits and preferences. Respond to others using 'Nor do I' or 'Nor can I'.", explanation:"'Nor do I' is formal and less common; crewmates use the standard 'Neither do I' / 'So do I' forms.", spyGuessOptions:["So do I / Neither do I","Nor do I","Me too / Me neither","I don't either"] },
      { crewmateTopic:"So do I / Neither do I", spyTopic:"Present Simple with 'too'", crewmatePrompt:"Talk about your likes and dislikes — after each statement, your partner responds using 'So do I' or 'Neither do I'.", spyPrompt:"Talk about your likes and dislikes — after each statement, say 'I like that too' or 'I don't like that either'.", explanation:"Crewmates use inverted 'So/Neither' structures. The spy adds 'too' or 'either' at the end instead of inverting.", spyGuessOptions:["So do I / Neither do I","Tag questions","Adding 'too' or 'either'","Simple Present Agreement"] },
    ],
    minefieldGrid: {
      topic: "So do I / Neither do I",
      instructions: "Students combine the statement (top) with the response starter (side) to make a full agreement sentence — then complete it naturally.",
      colLabels: ["I love jazz.", "I'm not tired.", "She can swim.", "They haven't eaten.", "I didn't go."],
      rowLabels: ["So …", "Neither …", "So … either.", "Nor …", "And … too."],
    },
    hotSeatWords: [
      {word:"agreement"},{word:"same"},{word:"both"},{word:"also"},
      {word:"too"},{word:"either"},{word:"neither"},{word:"nor"},
      {word:"reaction"},{word:"response"},{word:"match"},{word:"copy"},
      {word:"confirm"},{word:"disagree"},{word:"similar"},{word:"opposite"},
      {word:"like me"},{word:"me too"},{word:"same here"},{word:"exactly"},
    ],
    hotPotatoPrompts: [
      {prompt:"I love pizza and so ___", answer:"do I / does she / do they"},
      {prompt:"She can't swim and neither ___", answer:"can I / can he"},
      {prompt:"'So do I' agrees with a ___ statement.", answer:"positive"},
      {prompt:"'Neither do I' agrees with a ___ statement.", answer:"negative"},
      {prompt:"Complete: 'I've been to Paris.' 'So ___ I!'", answer:"have"},
      {prompt:"Complete: 'He doesn't like rain.' 'Neither ___ I.'", answer:"do"},
      {prompt:"'So am I' — what does 'am' tell you?", answer:"it follows 'I am'"},
      {prompt:"Complete: 'They were late.' 'So ___ we.'", answer:"were"},
      {prompt:"'So can she' — name something she can do.", answer:"(free answer)"},
      {prompt:"Complete: 'I wouldn't do that.' 'Neither ___ I.'", answer:"would"},
      {prompt:"Does 'So do I' come after positive or negative?", answer:"positive"},
      {prompt:"Complete: 'We haven't eaten.' 'Neither ___ I.'", answer:"have"},
      {prompt:"Use 'So did I' — what tense is it?", answer:"past simple"},
      {prompt:"Complete: 'She's tired.' 'So ___ I.'", answer:"am"},
      {prompt:"'Neither will I' — what does 'will' tell you?", answer:"future"},
      {prompt:"Complete: 'I don't like Mondays.' 'Neither ___ I.'", answer:"do"},
      {prompt:"Use 'So have I' in a sentence about travel.", answer:"(free answer)"},
      {prompt:"Complete: 'He had already left.' 'So ___ I.'", answer:"had"},
      {prompt:"'So' for agreement — positive or negative?", answer:"positive"},
      {prompt:"'Neither' for agreement — positive or negative?", answer:"negative"},
    ],
    auctionSentences: [
      { sentence:"I love jazz and so does she.", isCorrect:true, explanation:"Correct inversion: 'so does she' agrees with positive statement." },
      { sentence:"I'm not coming and neither he is.", isCorrect:false, explanation:"Inversion is required after 'neither': 'neither is he'." },
      { sentence:"She can swim and so can I.", isCorrect:true, explanation:"'So can I' correctly mirrors the modal 'can'." },
      { sentence:"They've finished and so we have.", isCorrect:false, explanation:"Inversion after 'so': 'so have we', not 'so we have'." },
      { sentence:"I didn't enjoy it and neither did he.", isCorrect:true, explanation:"'Neither did he' correctly agrees with a negative past simple." },
      { sentence:"He was late and so she was.", isCorrect:false, explanation:"'So was she' — auxiliary must come before the subject." },
      { sentence:"I'm tired and so is my brother.", isCorrect:true, explanation:"'So is my brother' correctly agrees with 'am' using 'is' for a different subject." },
      { sentence:"I can't afford it and neither can't she.", isCorrect:false, explanation:"'Neither' already makes it negative — 'can't' creates a double negative. Use 'neither can she'." },
      { sentence:"We hadn't met before and neither had they.", isCorrect:true, explanation:"'Neither had they' correctly mirrors the past perfect negative." },
      { sentence:"I don't smoke and neither I do.", isCorrect:false, explanation:"Subject and auxiliary must be inverted: 'neither do I'." },
    ],
    cardTasks: [
      { task:"Make a sentence using 'so do I' to agree with a friend." },
      { task:"Use 'neither can I' to agree with something you can't do." },
      { task:"Say something you love, then your partner replies with 'so do I'." },
      { task:"Use 'neither have I' to respond to something you haven't done." },
      { task:"Make a sentence with 'so am I' to agree about a feeling." },
      { task:"Use 'neither would I' in a sentence about something unpleasant." },
      { task:"Agree with 'She's never been to Japan' using 'neither'." },
      { task:"Use 'so did I' to agree about something that happened yesterday." },
      { task:"Make a sentence: 'I really enjoyed the film.' Your partner replies using 'so'." },
      { task:"Use 'neither do I' to disagree with something negative." },
      { task:"Agree with 'He works really hard' using 'so'." },
      { task:"Use 'neither was I' to respond to 'I wasn't ready'." },
      { task:"Make a sentence with 'so can she' about an ability." },
      { task:"Use 'neither will I' to respond to a refusal." },
      { task:"Agree with 'They've already eaten' using 'so have we'." },
      { task:"Use 'neither should we' in a sentence about something risky." },
      { task:"Respond to 'I'd love a holiday right now' using 'so would I'." },
      { task:"Make a two-part exchange using 'neither' for something nobody likes." },
      { task:"Use 'so does he' to describe a shared habit." },
      { task:"Respond to 'She hadn't heard the news' using 'neither had I'." },
    ],
  },

  prefer_rather: {
    label: "I'd prefer vs I'd rather",
    category: "grammar",
    questions: [
      { type:"choose correct grammar", question:"'___ stay home tonight.' (I'd rather/I'd prefer to)", answer:"I'd rather", hint:"'Rather' is followed by bare infinitive", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ a coffee, please.' (I'd prefer/I'd rather)", answer:"I'd prefer", hint:"'Prefer' can be followed by a noun", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I'd rather to go by train.'", answer:"I'd rather go by train.", hint:"'Rather' takes a bare infinitive (no 'to')", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I'd prefer go early.'", answer:"I'd prefer to go early.", hint:"'Prefer' needs 'to' before the infinitive", difficulty:"medium" },
      { type:"finish the sentence", question:"'I'd rather ___ (not/go) out tonight — I'm exhausted.'", answer:"not go", hint:"'Rather not' for negatives — no 'to'", difficulty:"medium" },
      { type:"rewrite sentences", question:"Rewrite using 'I'd rather': 'I want to walk instead of taking the bus.'", answer:"I'd rather walk than take the bus.", hint:"Use 'than' to show the contrast", difficulty:"medium" },
      { type:"finish the sentence", question:"'I'd prefer ___ (wait/to wait) for a better opportunity.'", answer:"to wait", hint:"'Prefer' + to-infinitive", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She'd rather that I don't come.'", answer:"She'd rather I didn't come.", hint:"After 'rather that', use past subjunctive", difficulty:"hard" },
      { type:"choose correct grammar", question:"'He'd rather ___ TV than read.' (watching/watch/to watch)", answer:"watch", hint:"Bare infinitive after 'would rather'", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'I'd prefer going than staying.'", answer:"I'd prefer to go rather than stay.", hint:"'Prefer to do rather than do' is the correct form", difficulty:"hard" },
      { type:"rewrite sentences", question:"Rewrite using 'I'd prefer': 'I want tea, not coffee.'", answer:"I'd prefer tea to coffee.", hint:"'Prefer X to Y' for comparing nouns", difficulty:"medium" },
      { type:"finish the sentence", question:"'Would you rather ___ (stay/to stay) or come with us?'", answer:"stay", hint:"Questions with 'would rather' take bare infinitive", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I'd rather you would leave now.'", answer:"I'd rather you left now.", hint:"'Rather + subject' needs past simple for present preference", difficulty:"hard" },
      { type:"choose correct grammar", question:"'She'd prefer ___ (to work/working) from home.' (to work/working)", answer:"to work", hint:"'Prefer' + to-infinitive, not gerund", difficulty:"medium" },
      { type:"rewrite sentences", question:"Rewrite using 'I'd rather': 'She wants him to stop talking.'", answer:"She'd rather he stopped talking.", hint:"'Rather + subject + past simple'", difficulty:"hard" },
      { type:"finish the sentence", question:"'I'd prefer ___ (coffee/to have coffee) to tea.'", answer:"coffee", hint:"'Prefer noun to noun'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'They'd rather to travel by car.'", answer:"They'd rather travel by car.", hint:"No 'to' after 'would rather'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'I'd rather you ___ early.' (come/came/to come)", answer:"came", hint:"Past simple in the subordinate clause", difficulty:"hard" },
      { type:"rewrite sentences", question:"Rewrite: 'I want to read rather than watch TV.'", answer:"I'd rather read than watch TV.", hint:"'Rather...than' with bare infinitives", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'I'd prefer not going to the party.'", answer:"I'd prefer not to go to the party.", hint:"'Prefer not to + infinitive'", difficulty:"hard" },
    ],
    spyRounds: [
      { crewmateTopic:"I'd prefer / I'd rather", spyTopic:"I want / I would like", crewmatePrompt:"Talk about your preferences for food, travel, and free time using 'I'd rather' and 'I'd prefer to'.", spyPrompt:"Talk about your preferences for food, travel, and free time using 'I want' and 'I would like'.", explanation:"Crewmates use 'I'd rather + bare infinitive' and 'I'd prefer to + infinitive'. The spy uses 'want' and 'would like' instead.", spyGuessOptions:["I'd prefer / I'd rather","I want / I would like","Second Conditional","I wish"] },
      { crewmateTopic:"I'd prefer / I'd rather", spyTopic:"Comparative adjectives", crewmatePrompt:"Compare two options in different situations using 'I'd rather… than…' and 'I'd prefer X to Y'.", spyPrompt:"Compare two options using 'X is better than Y' and 'X is more enjoyable than Y'.", explanation:"Crewmates express preference with 'I'd rather/prefer'. The spy compares using comparative adjectives instead.", spyGuessOptions:["I'd prefer / I'd rather","Comparative adjectives","Would rather + past simple","Superlatives"] },
      { crewmateTopic:"I'd prefer / I'd rather", spyTopic:"Would rather + past simple (for others)", crewmatePrompt:"Use 'I'd rather' and 'I'd prefer to' to talk about your own preferences for the weekend.", spyPrompt:"Say what you'd prefer other people to do — use 'I'd rather you…' and 'I'd prefer you to…'.", explanation:"Crewmates express personal preferences. The spy uses 'I'd rather you + past simple' to express preference about someone else's actions.", spyGuessOptions:["I'd prefer / I'd rather","Would rather + past simple","I'd prefer you to","Expressing wishes"] },
      { crewmateTopic:"I'd prefer / I'd rather", spyTopic:"I feel like / I'm in the mood for", crewmatePrompt:"Talk about what you prefer to eat, watch, or do this evening using 'I'd rather' and 'I'd prefer'.", spyPrompt:"Talk about what you feel like eating, watching, or doing tonight using 'I feel like' and 'I'm in the mood for'.", explanation:"Crewmates use the formal preference structures. The spy uses informal 'feel like' and 'in the mood for' instead.", spyGuessOptions:["I'd prefer / I'd rather","Feel like / In the mood for","I fancy","Would love to"] },
    ],
    hotSeatWords: [
      {word:"preference"},{word:"choice"},{word:"favourite"},{word:"option"},
      {word:"instead"},{word:"better"},{word:"rather"},{word:"wish"},
      {word:"compare"},{word:"decide"},{word:"pick"},{word:"want"},
      {word:"holiday"},{word:"food"},{word:"drink"},{word:"weather"},
      {word:"ideal"},{word:"perfect"},{word:"dream"},{word:"prefer"},
    ],
    hotPotatoPrompts: [
      {prompt:"I'd rather ___ home tonight.", answer:"stay"},
      {prompt:"I'd prefer ___ coffee, please.", answer:"a"},
      {prompt:"'Rather' or 'prefer'? I'd ___ not go.", answer:"rather"},
      {prompt:"Complete: 'I'd prefer ___ by train.'", answer:"to travel"},
      {prompt:"'I'd rather you left' — who leaves?", answer:"you"},
      {prompt:"'Rather' + bare infinitive or 'to'?", answer:"bare infinitive"},
      {prompt:"'Prefer' + infinitive needs 'to' — true or false?", answer:"true"},
      {prompt:"Complete: 'Would you rather tea ___ coffee?", answer:"or"},
      {prompt:"I'd prefer tea ___ coffee.", answer:"to"},
      {prompt:"'I'd rather' expresses a ___ .", answer:"preference"},
      {prompt:"Complete: 'I'd rather ___ wait.'", answer:"not"},
      {prompt:"Say a preference using 'I'd rather'.", answer:"(free answer)"},
      {prompt:"'I'd prefer to stay' — the verb after 'prefer' is?", answer:"to stay"},
      {prompt:"'I'd rather go' — the verb is in what form?", answer:"bare infinitive"},
      {prompt:"Complete: 'I'd prefer X ___ Y.'", answer:"to"},
      {prompt:"Say a weekend preference using 'I'd rather'.", answer:"(free answer)"},
      {prompt:"'Prefer' or 'rather'? I'd ___ a window seat.", answer:"prefer"},
      {prompt:"'I'd rather not work today' — feeling?", answer:"tired / lazy"},
      {prompt:"Complete: 'She'd rather ___ than drive.'", answer:"take the train"},
      {prompt:"Use 'I'd prefer' about food.", answer:"(free answer)"},
    ],
    auctionSentences: [
      { sentence:"I'd rather stay home than go out tonight.", isCorrect:true, explanation:"'Would rather + bare infinitive + than + bare infinitive' is correct." },
      { sentence:"She'd prefer working from home.", isCorrect:false, explanation:"'Would prefer' takes 'to + infinitive': 'she'd prefer to work from home'." },
      { sentence:"I'd prefer coffee to tea, please.", isCorrect:true, explanation:"'Prefer + noun + to + noun' is the correct comparative form." },
      { sentence:"I'd rather to stay than leave early.", isCorrect:false, explanation:"'Would rather' is followed by a bare infinitive — no 'to'." },
      { sentence:"He'd rather you didn't mention it.", isCorrect:true, explanation:"'Would rather + subject + past simple' for present preference about others." },
      { sentence:"She'd prefer to go rather than stay.", isCorrect:true, explanation:"'Prefer to do rather than do' is the correct full form." },
      { sentence:"I'd rather you wouldn't talk so loudly.", isCorrect:false, explanation:"After 'would rather + subject', use past simple: 'I'd rather you didn't talk'." },
      { sentence:"They'd prefer leave early if possible.", isCorrect:false, explanation:"'Would prefer' needs 'to' before the infinitive: 'they'd prefer to leave'." },
      { sentence:"I'd rather not go — I'm exhausted.", isCorrect:true, explanation:"'Would rather not + bare infinitive' is the correct negative form." },
      { sentence:"He'd prefer coffee than tea.", isCorrect:false, explanation:"'Prefer X to Y' — use 'to', not 'than' when comparing nouns." },
    ],
    minefieldGrid: {
      topic: "I'd prefer / I'd rather",
      instructions: "Students combine the situation (top) with the starter (side) to make a full preference sentence — then complete it naturally.",
      colLabels: ["It's raining outside.", "You have a free afternoon.", "Your friend suggests fast food.", "You have to travel far.", "You need to study."],
      rowLabels: ["I'd rather …", "I'd prefer to …", "I'd rather not …", "I'd prefer … to …", "I'd rather you …"],
    },
    cardTasks: [
      { task:"Tell your partner what you'd rather do this evening, and why." },
      { task:"Use 'I'd prefer to...' to talk about how you'd rather travel." },
      { task:"Make a sentence: 'I'd rather you...' asking someone to do something." },
      { task:"Compare two foods using 'I'd prefer X to Y'." },
      { task:"Use 'I'd rather not' to decline something politely." },
      { task:"Make a sentence with 'she'd rather he...' about someone else's preference." },
      { task:"Use 'I'd prefer to stay' or 'I'd rather go' — choose one and explain." },
      { task:"Tell your partner two options and ask 'Would you rather...?'" },
      { task:"Use 'I'd prefer to work alone rather than...' in a sentence." },
      { task:"Make a sentence with 'I'd rather...' about your study habits." },
      { task:"Use 'she'd prefer tea to coffee' as a model — make your own version." },
      { task:"Say what you'd rather do on a rainy day using 'I'd rather'." },
      { task:"Use 'I'd prefer not to...' to politely decline an invitation." },
      { task:"Compare two films or shows using 'I'd rather watch X than Y'." },
      { task:"Make a sentence: 'Would you prefer to...?' — ask your partner something." },
      { task:"Use 'He'd rather work from home' as a model — say something similar." },
      { task:"Tell your partner your food preferences using 'I'd prefer X to Y'." },
      { task:"Use 'I'd rather you didn't...' to express a preference about someone's behaviour." },
      { task:"Make a 'rather than' sentence about weekend activities." },
      { task:"Use 'I'd prefer to wait' in a real-life situation." },
    ],
  },

  passive_active: {
    label: "Passive vs Active",
    category: "grammar",
    questions: [
      { type:"rewrite sentences", question:"Rewrite in passive: 'They built this house in 1920.'", answer:"This house was built in 1920.", hint:"Object → subject, add 'was/were + past participle'", difficulty:"easy" },
      { type:"rewrite sentences", question:"Rewrite in active: 'The report was written by Sarah.'", answer:"Sarah wrote the report.", hint:"Agent → subject, remove 'by'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'The cake was bake by my mother.'", answer:"The cake was baked by my mother.", hint:"Past participle needed after 'was'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'The windows ___ cleaned yesterday.' (were/was/are)", answer:"were", hint:"'Windows' is plural — use 'were'", difficulty:"easy" },
      { type:"rewrite sentences", question:"Rewrite in passive: 'Someone has stolen my wallet.'", answer:"My wallet has been stolen.", hint:"Present perfect passive: has/have + been + past participle", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'The letters are been sent.'", answer:"The letters are being sent.", hint:"Present continuous passive: am/is/are + being + past participle", difficulty:"medium" },
      { type:"rewrite sentences", question:"Rewrite in passive: 'They will announce the results tomorrow.'", answer:"The results will be announced tomorrow.", hint:"Future passive: will + be + past participle", difficulty:"medium" },
      { type:"choose correct grammar", question:"'She ___ offered a promotion last week.' (was/were/is)", answer:"was", hint:"Past simple passive, singular subject", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'The movie is directed from Steven Spielberg.'", answer:"The movie was directed by Steven Spielberg.", hint:"Use 'by' to introduce the agent", difficulty:"medium" },
      { type:"rewrite sentences", question:"Rewrite in active: 'Mistakes were made by the team.'", answer:"The team made mistakes.", hint:"Agent after 'by' becomes the subject", difficulty:"medium" },
      { type:"finish the sentence", question:"'The letter ___ (write) by hand in the 18th century.'", answer:"was written", hint:"Past simple passive", difficulty:"easy" },
      { type:"rewrite sentences", question:"Rewrite in passive: 'They have been investigating the case for months.'", answer:"The case has been being investigated for months.", hint:"Present perfect continuous passive (complex form)", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'English is spoke in over 50 countries.'", answer:"English is spoken in over 50 countries.", hint:"'Spoken' is the past participle of 'speak'", difficulty:"medium" },
      { type:"choose correct grammar", question:"'The suspect is ___ questioned by police.' (being/been/be)", answer:"being", hint:"Present continuous passive: is + being", difficulty:"hard" },
      { type:"rewrite sentences", question:"Rewrite: 'People say he is brilliant.' Using 'He is said...'", answer:"He is said to be brilliant.", hint:"Reporting passive: is said to + infinitive", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'The homework must finished by Friday.'", answer:"The homework must be finished by Friday.", hint:"Modal + be + past participle", difficulty:"medium" },
      { type:"choose correct grammar", question:"'The new bridge ___ built by 2030.' (will be/will been/is)", answer:"will be", hint:"Future passive: will + be + past participle", difficulty:"medium" },
      { type:"rewrite sentences", question:"Rewrite in passive: 'Nobody has touched this document.'", answer:"This document has not been touched.", hint:"Negative passive: has not been + past participle", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'It is thought that he stole the money. / He is thought to stole the money.'", answer:"He is thought to have stolen the money.", hint:"Perfect infinitive after reporting passive", difficulty:"hard" },
      { type:"rewrite sentences", question:"Rewrite in active: 'The experiment was being conducted by the scientists.'", answer:"The scientists were conducting the experiment.", hint:"Past continuous active", difficulty:"hard" },
    ],
    spyRounds: [
      { crewmateTopic:"Passive Voice", spyTopic:"Active Voice", crewmatePrompt:"Describe how things are made, built, or done — use passive voice and focus on the object, not the doer.", spyPrompt:"Describe how people make, build, or do things — use active voice and name the subject performing the action.", explanation:"Crewmates use 'is/was made by', 'have been built', etc. The spy uses active sentences where the doer is the subject.", spyGuessOptions:["Passive Voice","Active Voice","Present Perfect Active","Past Simple"] },
      { crewmateTopic:"Passive Voice", spyTopic:"Past Simple Active", crewmatePrompt:"Talk about historical events or news stories — focus on what happened to people or things using passive constructions.", spyPrompt:"Talk about historical events or news stories — say who did what using simple past tense.", explanation:"Crewmates say 'The law was passed' or 'People were evacuated'. The spy says 'They passed the law' or 'People evacuated'.", spyGuessOptions:["Passive Voice","Past Simple Active","Reported Speech","Present Perfect Passive"] },
      { crewmateTopic:"Passive Voice", spyTopic:"Present Perfect Active", crewmatePrompt:"Talk about changes in your town or school — use 'has been' and 'have been' + past participle.", spyPrompt:"Talk about changes in your town or school — use 'has/have + past participle' from the doer's perspective.", explanation:"Crewmates use 'The building has been renovated'. The spy uses 'They have renovated the building' — present perfect active.", spyGuessOptions:["Passive Voice","Present Perfect Active","Present Perfect Passive","Was/Were + adjective"] },
      { crewmateTopic:"Passive Voice", spyTopic:"Impersonal 'it' structures", crewmatePrompt:"Talk about rules, laws, and social norms using passive structures like 'is allowed', 'is required', 'is said to be'.", spyPrompt:"Talk about rules, laws, and norms using impersonal 'it' — 'it is said that', 'it is believed that', 'it is known that'.", explanation:"Crewmates use passive 'It is known that…' and 'He is said to be…'. The spy uses very similar 'It is said that…' impersonal structures, which overlap.", spyGuessOptions:["Passive Voice","Impersonal 'it' structures","Modal passives","Reporting verbs"] },
    ],
    minefieldGrid: {
      topic: "Passive Voice",
      instructions: "Students combine the subject (top) with the tense starter (side) to make a full passive sentence — then complete it naturally.",
      colLabels: ["The windows", "This painting", "The report", "New laws", "The emails"],
      rowLabels: ["… was/were …", "… is/are being …", "… has/have been …", "… will be …", "… had been …"],
    },
    hotSeatWords: [
      {word:"built"},{word:"written"},{word:"stolen"},{word:"discovered"},
      {word:"invented"},{word:"elected"},{word:"awarded"},{word:"destroyed"},
      {word:"cleaned"},{word:"repaired"},{word:"opened"},{word:"closed"},
      {word:"painted"},{word:"cooked"},{word:"made"},{word:"broken"},
      {word:"found"},{word:"lost"},{word:"sent"},{word:"delivered"},
    ],
    hotPotatoPrompts: [
      {prompt:"'The cake was eaten.' Who ate it?", answer:"unknown / not said"},
      {prompt:"'The window was broken.' Active: someone ___ the window.", answer:"broke"},
      {prompt:"Passive uses 'to be' + ___", answer:"past participle"},
      {prompt:"'It was built in 1900.' What was built?", answer:"(depends on context)"},
      {prompt:"'She was given a prize.' Who received it?", answer:"she"},
      {prompt:"Make passive: 'They found the keys.'", answer:"The keys were found."},
      {prompt:"'English is spoken here.' Past or present passive?", answer:"present"},
      {prompt:"'The report has been sent.' Tense?", answer:"present perfect passive"},
      {prompt:"In passive, the doer comes after ___.", answer:"by"},
      {prompt:"Make active: 'The letter was written by Anna.'", answer:"Anna wrote the letter."},
      {prompt:"'The bridge is being repaired.' Tense?", answer:"present continuous passive"},
      {prompt:"'Mistakes were made.' Who made them?", answer:"unknown"},
      {prompt:"'The film was directed by Spielberg.' Passive or active?", answer:"passive"},
      {prompt:"Make passive: 'Shakespeare wrote Hamlet.'", answer:"Hamlet was written by Shakespeare."},
      {prompt:"'He was arrested.' Past passive — true or false?", answer:"true"},
      {prompt:"'It will be announced tomorrow.' Tense?", answer:"future passive"},
      {prompt:"Passive voice focuses on the ___, not the doer.", answer:"action / object"},
      {prompt:"'The project must be finished.' Modal passive?", answer:"yes"},
      {prompt:"'The news is being broadcast.' What does 'being' show?", answer:"it's happening now"},
      {prompt:"Make passive: 'They are cleaning the offices.'", answer:"The offices are being cleaned."},
    ],
    auctionSentences: [
      { sentence:"This house was built in 1920.", isCorrect:true, explanation:"Correct past simple passive: 'was + past participle'." },
      { sentence:"The report has been submitting.", isCorrect:false, explanation:"Passive requires past participle: 'has been submitted'." },
      { sentence:"English is spoken all over the world.", isCorrect:true, explanation:"Correct present simple passive with the irregular past participle 'spoken'." },
      { sentence:"The results will been announced tomorrow.", isCorrect:false, explanation:"Future passive: 'will + be', not 'will + been'." },
      { sentence:"She was offered a promotion last month.", isCorrect:true, explanation:"Correct past simple passive — personal passive with indirect object." },
      { sentence:"The windows is being cleaned right now.", isCorrect:false, explanation:"'Windows' is plural — should be 'are being cleaned'." },
      { sentence:"The homework must be finished by Friday.", isCorrect:true, explanation:"Correct modal passive: 'must + be + past participle'." },
      { sentence:"Mistakes were made from the entire team.", isCorrect:false, explanation:"The agent in passive sentences follows 'by', not 'from'." },
      { sentence:"He is thought to be the best candidate.", isCorrect:true, explanation:"Correct reporting passive: 'is thought to + infinitive'." },
      { sentence:"The letter are being written by hand.", isCorrect:false, explanation:"'The letter' is singular — should be 'is being written'." },
    ],
    cardTasks: [
      { task:"Describe something being built or renovated near you using the passive." },
      { task:"Use the passive to talk about a famous invention: 'X was invented by...'." },
      { task:"Make a sentence with 'has been stolen/lost/found' about something." },
      { task:"Describe a process in your school or job using 'is/are being...'." },
      { task:"Use 'will be announced' or 'will be published' in a sentence about the future." },
      { task:"Transform 'The teacher corrects the homework' into the passive." },
      { task:"Describe a famous building using 'was built/designed/constructed'." },
      { task:"Use 'must be finished' or 'must be submitted' in a sentence." },
      { task:"Say something about a language using 'is spoken by...'." },
      { task:"Use the passive to describe what happened in a news story." },
      { task:"Make a sentence with 'is said to be' about a famous person or place." },
      { task:"Describe your town using at least one passive structure." },
      { task:"Use 'had been forgotten/lost/left behind' in a short story sentence." },
      { task:"Transform 'They arrested three people' into the passive." },
      { task:"Use 'is being investigated' or 'is being reviewed' about a current event." },
      { task:"Describe a meal being prepared using the present continuous passive." },
      { task:"Use 'It is believed that...' or 'It is thought that...' in a sentence." },
      { task:"Make a negative passive sentence: 'The results haven't been...'." },
      { task:"Use 'was offered a job/promotion/scholarship' in a personal sentence." },
      { task:"Describe something that will be completed next year using the future passive." },
    ],
  },

  indefinite_pronouns: {
    label: "Indefinite Pronouns",
    category: "grammar",
    questions: [
      { type:"choose correct grammar", question:"'Is ___ home?' (somebody/anybody/nobody)", answer:"anybody", hint:"Use 'anybody' in questions", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'Nobody doesn't want to leave.'", answer:"Nobody wants to leave.", hint:"'Nobody' already makes it negative — no double negative", difficulty:"easy" },
      { type:"finish the sentence", question:"'I looked everywhere but couldn't find ___.'", answer:"anything / anywhere", hint:"'Any-' in negative contexts", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ left their umbrella here.' (Someone/Anyone/No one)", answer:"Someone", hint:"Use 'someone' in positive statements", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'There is anyone in the office.'", answer:"There is someone in the office.", hint:"'Anyone' is for questions and negatives, not positives", difficulty:"medium" },
      { type:"choose correct grammar", question:"'We looked ___ for the keys.' (everywhere/somewhere/anywhere)", answer:"everywhere", hint:"'Everywhere' means in all places", difficulty:"easy" },
      { type:"finish the sentence", question:"'She told ___ about the surprise — it stayed secret.'", answer:"nobody / no one", hint:"Negative pronoun without extra negation", difficulty:"medium" },
      { type:"rewrite sentences", question:"Rewrite: 'I didn't see any person there.'", answer:"I saw nobody there. / I didn't see anyone there.", hint:"Two correct options using indefinite pronouns", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'Everything are ready for the party.'", answer:"Everything is ready for the party.", hint:"Indefinite pronouns are always singular", difficulty:"medium" },
      { type:"choose correct grammar", question:"'Can ___ help me with this?' (someone/anyone/no one)", answer:"anyone", hint:"'Anyone' is preferred in requests and questions", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'Somebody have called you.'", answer:"Somebody has called you.", hint:"'Somebody' takes singular verb", difficulty:"easy" },
      { type:"finish the sentence", question:"'I'm bored — there's ___ to do!'", answer:"nothing", hint:"Negative pronoun for things", difficulty:"easy" },
      { type:"rewrite sentences", question:"Rewrite: 'There is no place I'd rather be.'", answer:"There is nowhere I'd rather be.", hint:"Use 'nowhere' instead of 'no place'", difficulty:"hard" },
      { type:"choose correct grammar", question:"'He didn't tell ___ his secret.' (nobody/anybody/somebody)", answer:"anybody", hint:"Use 'anybody' in negatives", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'Everywhere I go, people recognises me.'", answer:"Everywhere I go, people recognise me.", hint:"'People' is plural", difficulty:"hard" },
      { type:"finish the sentence", question:"'___ of the answers were completely correct — they all had mistakes.'", answer:"None", hint:"'None of' for zero quantity", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'I've looked everywhere but I can't find it somewhere.'", answer:"I've looked everywhere but I can't find it anywhere.", hint:"'Anywhere' in negative clauses", difficulty:"hard" },
      { type:"choose correct grammar", question:"'___ what happens, stay calm.' (Whatever/Whoever/However)", answer:"Whatever", hint:"'Whatever' refers to things/events", difficulty:"hard" },
      { type:"rewrite sentences", question:"Rewrite without double negative: 'I didn't see nobody.'", answer:"I didn't see anybody. / I saw nobody.", hint:"Choose one negative element", difficulty:"medium" },
      { type:"finish the sentence", question:"'___ calls, tell them I'm busy.'", answer:"Whoever", hint:"'Whoever' = any person who", difficulty:"hard" },
    ],
    spyRounds: [
      { crewmateTopic:"Indefinite Pronouns", spyTopic:"Quantifiers (some/any/no)", crewmatePrompt:"Talk about people and things at a party using 'someone', 'nobody', 'everything', 'anywhere'.", spyPrompt:"Talk about people and things at a party using 'some people', 'no one', 'all things', 'any place'.", explanation:"Crewmates use single-word indefinite pronouns. The spy uses quantifier + noun phrases that express the same meaning differently.", spyGuessOptions:["Indefinite Pronouns","Quantifiers (some/any/no)","Articles","Relative Pronouns"] },
      { crewmateTopic:"Indefinite Pronouns", spyTopic:"Everyone/No one (without compound forms)", crewmatePrompt:"Describe an ideal city using 'everybody', 'nothing', 'somewhere', 'anyone' and similar pronouns.", spyPrompt:"Describe an ideal city using 'every person', 'not a thing', 'in some place', 'any person' — avoid compound pronouns.", explanation:"Crewmates use compound indefinite pronouns (everybody, nothing). The spy splits them into separate words.", spyGuessOptions:["Indefinite Pronouns","Everyone/No one","Distributive pronouns","Universal pronouns"] },
      { crewmateTopic:"Indefinite Pronouns", spyTopic:"Reflexive Pronouns", crewmatePrompt:"Tell a story about an empty house at night — use 'nobody', 'something', 'anywhere', 'nothing'.", spyPrompt:"Tell a story about an empty house at night — talk about what the person did themselves using 'himself', 'herself', 'themselves'.", explanation:"Crewmates use indefinite pronouns (nobody, something). The spy uses reflexive pronouns (himself, herself) instead.", spyGuessOptions:["Indefinite Pronouns","Reflexive Pronouns","Demonstrative Pronouns","Relative Pronouns"] },
      { crewmateTopic:"Indefinite Pronouns", spyTopic:"Negative Pronouns with 'not…any'", crewmatePrompt:"Talk about your ideal holiday destination using 'somewhere', 'nothing', 'everyone', 'anything'.", spyPrompt:"Talk about your ideal holiday using negative sentences — 'I didn't do anything', 'There wasn't anyone', 'I didn't go anywhere'.", explanation:"Crewmates use indefinite pronouns like 'nothing' and 'nobody'. The spy expresses the same ideas with 'not…anything' and 'not…anyone'.", spyGuessOptions:["Indefinite Pronouns","Negative any-compounds","Double negatives","Quantifiers"] },
    ],
    minefieldGrid: {
      topic: "Indefinite Pronouns",
      instructions: "Students combine the context (top) with the pronoun starter (side) to make a full, natural sentence — then finish it with their own idea.",
      colLabels: ["At a party", "In an empty house", "Before a big exam", "On a long journey", "After a disaster"],
      rowLabels: ["Somebody …", "Nobody …", "Everything …", "Nothing …", "Anywhere …"],
    },
    hotSeatWords: [
      {word:"somebody"},{word:"nobody"},{word:"everybody"},{word:"anybody"},
      {word:"something"},{word:"nothing"},{word:"everything"},{word:"anything"},
      {word:"somewhere"},{word:"nowhere"},{word:"everywhere"},{word:"anywhere"},
      {word:"no one"},{word:"anyone"},{word:"everyone"},{word:"someone"},
      {word:"whoever"},{word:"whatever"},{word:"wherever"},{word:"none"},
      {word:"all"},{word:"each"},{word:"both"},{word:"neither"},
    ],
    hotPotatoPrompts: [
      {prompt:"'___ is at the door.' (person, unknown)", answer:"Someone / Somebody"},
      {prompt:"'Is ___ there?' (negative question)", answer:"anyone / anybody"},
      {prompt:"'___ knows the answer!' (all people)", answer:"Everyone / Everybody"},
      {prompt:"'I looked ___ but couldn't find it.'", answer:"everywhere"},
      {prompt:"'There's ___ in the fridge.' (nothing)", answer:"nothing"},
      {prompt:"'Did ___ call while I was out?'", answer:"anyone / anybody"},
      {prompt:"'___ left their bag.' (a person, unknown)", answer:"Someone / Somebody"},
      {prompt:"'She goes ___ without her dog.' (no place)", answer:"nowhere"},
      {prompt:"'___ is fine — I don't mind.' (anything)", answer:"Anything"},
      {prompt:"'He ate ___.' (all the food)", answer:"everything"},
      {prompt:"'___ was wrong — the house looked perfect.' (nothing)", answer:"Nothing"},
      {prompt:"'You can sit ___.' (any seat)", answer:"anywhere"},
      {prompt:"'___ has passed their driving test.' (all)", answer:"Everyone / Everybody"},
      {prompt:"'Is there ___ I can do?' (any help)", answer:"anything"},
      {prompt:"'___ told me, but I forgot who.' (a person)", answer:"Someone / Somebody"},
      {prompt:"'I've looked ___ — I can't find my keys.'", answer:"everywhere"},
      {prompt:"'There's ___ wrong.' (not a thing)", answer:"nothing"},
      {prompt:"'___ can join — the more the better.' (any person)", answer:"Anyone / Anybody"},
      {prompt:"Indefinite pronouns with 'every-' are positive/negative?", answer:"positive"},
      {prompt:"'No-' pronouns make the sentence positive or negative?", answer:"negative"},
    ],
    auctionSentences: [
      { sentence:"Nobody wants to stay late tonight.", isCorrect:true, explanation:"'Nobody' is singular and takes a positive verb — no double negative needed." },
      { sentence:"Is there anyone who can help me?", isCorrect:true, explanation:"'Anyone' is correct in questions — neutral and open." },
      { sentence:"Everything were ready before the guests arrived.", isCorrect:false, explanation:"Indefinite pronouns like 'everything' always take a singular verb: 'was ready'." },
      { sentence:"I looked everywhere but found anything.", isCorrect:false, explanation:"With a positive verb, use 'nothing': 'I found nothing'." },
      { sentence:"Somebody has left their umbrella by the door.", isCorrect:true, explanation:"'Somebody' is singular — 'has' is correct." },
      { sentence:"There is someone at the door — can you check?", isCorrect:true, explanation:"'Someone' is correct in positive statements when a person is expected." },
      { sentence:"Nobody don't want to miss the final.", isCorrect:false, explanation:"'Nobody' already makes it negative — double negative is incorrect. 'Nobody wants to miss it'." },
      { sentence:"She told nobody about her plans.", isCorrect:true, explanation:"'Nobody' is used as a negative object — no auxiliary negation needed." },
      { sentence:"There is anyone in the room — I can hear voices.", isCorrect:false, explanation:"In positive statements, use 'someone', not 'anyone'." },
      { sentence:"I've searched everywhere but can't find it anywhere.", isCorrect:true, explanation:"'Everywhere' (all places) and 'anywhere' (in negative context) are both correctly used." },
    ],
    cardTasks: [
      { task:"Use 'somebody' or 'nobody' to describe the atmosphere at a party." },
      { task:"Make a sentence with 'anything' in a negative context." },
      { task:"Use 'everywhere' to describe a city or place you've visited." },
      { task:"Describe an empty room using 'nobody', 'nothing', and 'nowhere'." },
      { task:"Use 'somebody has...' to describe something that happened mysteriously." },
      { task:"Make a question using 'anyone' to ask for help or information." },
      { task:"Use 'everything' in a positive sentence about a perfect day." },
      { task:"Describe a very busy place using 'everybody' and 'everywhere'." },
      { task:"Use 'nothing' to express that you have no plans this weekend." },
      { task:"Make a sentence with 'none of the students/teams/people...'." },
      { task:"Use 'someone left...' to describe something mysterious at school." },
      { task:"Make a positive statement using 'something' about today." },
      { task:"Use 'whoever' in a sentence about a rule or decision." },
      { task:"Describe a lost object using 'anywhere', 'somewhere', or 'nowhere'." },
      { task:"Use 'everyone agrees that...' to express a general opinion." },
      { task:"Make a sentence with 'nothing to do' about a boring afternoon." },
      { task:"Use 'anyone can...' to talk about a skill or opportunity." },
      { task:"Make a sentence with 'somewhere' about a dream destination." },
      { task:"Use 'nobody knows...' in a mysterious or surprising sentence." },
      { task:"Use 'everything went wrong' or 'everything went well' to describe a day." },
    ],
  },

  future_in_past: {
    label: "Future in the Past",
    category: "grammar",
    questions: [
      { type:"correct grammar mistakes", question:"'She said she will call me.' (reported speech)", answer:"She said she would call me.", hint:"'Will' becomes 'would' in reported speech", difficulty:"easy" },
      { type:"choose correct grammar", question:"'He was going to ___ the project.' (finish/finishing/finished)", answer:"finish", hint:"'Was going to' + bare infinitive", difficulty:"easy" },
      { type:"finish the sentence", question:"'I thought we ___ (have) more time.'", answer:"would have", hint:"'Would have' for past expectations", difficulty:"medium" },
      { type:"rewrite sentences", question:"Rewrite as past: 'She is going to resign.' (She told me...)", answer:"She told me she was going to resign.", hint:"'Is going to' → 'was going to'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'They was about to leave when it started raining.'", answer:"They were about to leave when it started raining.", hint:"'Were about to' — plural subject", difficulty:"easy" },
      { type:"choose correct grammar", question:"'He ___ to be a doctor when he grew up.' (wanted/was going/would)", answer:"was going", hint:"'Was going to + infinitive' for unfulfilled plans", difficulty:"medium" },
      { type:"finish the sentence", question:"'At that point I realised the meeting ___ (start) in five minutes.'", answer:"was about to start / was going to start", hint:"Imminent future in past narrative", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'I was going study medicine but changed my mind.'", answer:"I was going to study medicine but changed my mind.", hint:"'Going to' needs 'to' before the infinitive", difficulty:"easy" },
      { type:"rewrite sentences", question:"Report: 'I will finish by Friday,' he said.", answer:"He said he would finish by Friday.", hint:"'Will' → 'would' in reported speech backshift", difficulty:"medium" },
      { type:"choose correct grammar", question:"'She ___ arrive any minute — we were so nervous.' (was to/would/was about to)", answer:"was about to", hint:"'Was about to' = imminent future", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'We would to visit Rome, but we ran out of money.'", answer:"We were going to visit Rome, but we ran out of money.", hint:"'Would + bare infinitive' is used differently — use 'was going to' for plans", difficulty:"hard" },
      { type:"finish the sentence", question:"'He had no idea his life ___ (change) so dramatically.'", answer:"was going to change / would change", hint:"Future in the past for unforeseen events", difficulty:"hard" },
      { type:"rewrite sentences", question:"Report: 'We are about to land,' the pilot announced.", answer:"The pilot announced they were about to land.", hint:"'Are about to' → 'were about to'", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'She was to had met him at the station.'", answer:"She was to have met him at the station.", hint:"'Was to have + past participle' for unfulfilled arrangements", difficulty:"hard" },
      { type:"choose correct grammar", question:"'It ___ be our last chance. We knew it.' (would/will/was)", answer:"would", hint:"'Would be' — future in past", difficulty:"medium" },
      { type:"finish the sentence", question:"'Little did she know, it ___ (be) the most important day of her life.'", answer:"would be", hint:"'Would be' for dramatic narrative futures in the past", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'I was going to called her, but I forgot.'", answer:"I was going to call her, but I forgot.", hint:"'Going to' + bare infinitive, not past tense", difficulty:"easy" },
      { type:"rewrite sentences", question:"Report: 'He will never do it,' she thought.", answer:"She thought he would never do it.", hint:"Backshift 'will' → 'would' in thoughts", difficulty:"medium" },
      { type:"choose correct grammar", question:"'They ___ marry that summer, but the wedding was postponed.' (were to/was to/would)", answer:"were to", hint:"'Were to' for formal planned future in past", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'I knew she is going to win.'", answer:"I knew she was going to win.", hint:"Backshift: 'is going to' → 'was going to'", difficulty:"hard" },
    ],
    spyRounds: [
      { crewmateTopic:"Future in the Past", spyTopic:"Past Simple", crewmatePrompt:"Tell the story of a time you had big plans that didn't happen — use 'was going to', 'would', and 'were about to'.", spyPrompt:"Tell the story of a time you had big plans that didn't happen — use simple past verbs to describe what you did and didn't do.", explanation:"Crewmates express what was planned or expected (was going to, would). The spy narrates what actually happened using plain past simple.", spyGuessOptions:["Future in the Past","Past Simple","Past Continuous","Second Conditional"] },
      { crewmateTopic:"Future in the Past", spyTopic:"Second Conditional", crewmatePrompt:"Describe a childhood dream you had — talk about what you thought would happen using 'was going to', 'would become', 'was to be'.", spyPrompt:"Describe a childhood dream — talk about what would happen IF things had gone differently using 'would be' and 'if I were'.", explanation:"Crewmates describe past expectations ('I thought I would…'). The spy speculates hypothetically using second conditional ('If I were…').", spyGuessOptions:["Future in the Past","Second Conditional","Third Conditional","Past Perfect"] },
      { crewmateTopic:"Future in the Past", spyTopic:"Past Continuous", crewmatePrompt:"Tell a story about a plan that was interrupted — use 'was about to', 'were going to', 'would' to describe what was expected.", spyPrompt:"Tell a story about an action that was interrupted — use 'was doing', 'were walking', 'was talking' to describe ongoing actions.", explanation:"Crewmates use future-in-past to say what was planned. The spy uses past continuous to describe what was in progress when something happened.", spyGuessOptions:["Future in the Past","Past Continuous","Past Perfect","Used to"] },
      { crewmateTopic:"Future in the Past", spyTopic:"Reported Speech (Future)", crewmatePrompt:"Talk about news from the past — what people thought was going to happen, what was predicted to occur.", spyPrompt:"Report what people said about the future — use 'she said that she would', 'he told me it would', 'they said it was going to'.", explanation:"Crewmates use future-in-past for their own past expectations. The spy reports other people's words using reported speech.", spyGuessOptions:["Future in the Past","Reported Speech","Would for future","Past Simple"] },
    ],
    minefieldGrid: {
      topic: "Future in the Past",
      instructions: "Students combine the past situation (top) with the future-in-past starter (side) to make a full sentence — then complete it naturally.",
      colLabels: ["She looked at the map and …", "He packed his bags because …", "They sat down nervously because …", "I checked the weather since …", "We booked the tickets as …"],
      rowLabels: ["… was going to …", "… would …", "… were about to …", "… was to …", "… thought … would …"],
    },
    hotSeatWords: [
      {word:"plan"},{word:"dream"},{word:"hope"},{word:"prediction"},
      {word:"appointment"},{word:"meeting"},{word:"trip"},{word:"surprise"},
      {word:"almost"},{word:"nearly"},{word:"supposed to"},{word:"meant to"},
      {word:"cancelled"},{word:"interrupted"},{word:"changed"},{word:"delayed"},
      {word:"promised"},{word:"expected"},{word:"ready"},{word:"prepared"},
    ],
    hotPotatoPrompts: [
      {prompt:"'She was going to call.' Did she call?", answer:"probably not"},
      {prompt:"'Was going to' + what verb form?", answer:"bare infinitive"},
      {prompt:"'I thought it would rain.' Did it rain?", answer:"maybe not"},
      {prompt:"'They were about to leave.' Did they leave immediately?", answer:"yes / nearly"},
      {prompt:"'He was going to be a doctor.' Is he a doctor now?", answer:"probably not"},
      {prompt:"'Would' here is past or future?", answer:"past form of will"},
      {prompt:"'She was to meet him at 8.' Did they meet?", answer:"planned to"},
      {prompt:"'Was going to' shows a past ___ .", answer:"plan / intention"},
      {prompt:"'I knew it would be hard.' Tense of 'knew'?", answer:"past simple"},
      {prompt:"'They were about to ___ when it started raining.'", answer:"(free — leave, eat, start)"},
      {prompt:"'He would become famous.' From whose past view?", answer:"someone in the past"},
      {prompt:"'Was going to' vs 'would' — are they similar?", answer:"yes"},
      {prompt:"'She was going to call but forgot.' Synonym of 'going to'?", answer:"planning to"},
      {prompt:"'I thought we would win.' Did we win?", answer:"probably not"},
      {prompt:"'They were supposed to arrive at 6.' Did they?", answer:"maybe not"},
      {prompt:"'Was about to' means something ___ happened.", answer:"almost / nearly"},
      {prompt:"'He would later regret it.' When is 'later'?", answer:"after that moment in the past"},
      {prompt:"'She was going to ___ but changed her mind.'", answer:"(free answer)"},
      {prompt:"'Future in the past' describes plans made ___ .", answer:"in the past"},
      {prompt:"Name a plan you had that didn't happen.", answer:"(free answer)"},
    ],
    auctionSentences: [
      { sentence:"She said she would call me later that evening.", isCorrect:true, explanation:"'Would' correctly replaces 'will' in reported speech (backshift)." },
      { sentence:"He was going to studied abroad, but changed his mind.", isCorrect:false, explanation:"'Going to' takes a bare infinitive: 'was going to study'." },
      { sentence:"They were about to leave when the phone rang.", isCorrect:true, explanation:"'Were about to' correctly expresses an imminent future in a past narrative." },
      { sentence:"I thought we will have more time to prepare.", isCorrect:false, explanation:"After 'thought', 'will' must backshift to 'would': 'I thought we would have'." },
      { sentence:"Little did she know it would change her life forever.", isCorrect:true, explanation:"'Would' is the correct future-in-past form in a dramatic narrative." },
      { sentence:"She was to met him at the station at noon.", isCorrect:false, explanation:"'Was to' takes a bare infinitive: 'was to meet', not 'met'." },
      { sentence:"I knew she was going to win the competition.", isCorrect:true, explanation:"'Was going to' correctly backshifts 'is going to' in reported thought." },
      { sentence:"He was going to called her, but he forgot.", isCorrect:false, explanation:"'Was going to' must be followed by a bare infinitive: 'call', not 'called'." },
      { sentence:"We were about to give up when we found the answer.", isCorrect:true, explanation:"Correct: 'were about to + infinitive' for an imminent action in the past." },
      { sentence:"She was going to be our best player, but got injured.", isCorrect:true, explanation:"'Was going to be' correctly expresses an unfulfilled future expectation." },
    ],
    cardTasks: [
      { task:"Use 'was going to' to describe a plan you had but didn't carry out." },
      { task:"Tell your partner about something that was about to happen when something else interrupted." },
      { task:"Use 'they were going to move' in a sentence about a life change that didn't happen." },
      { task:"Make a sentence with 'I thought it would...' about an expectation that proved wrong." },
      { task:"Use 'was about to' to describe a dramatic moment in a story." },
      { task:"Tell your partner about a holiday or trip you were going to take but didn't." },
      { task:"Use 'she told me she would...' to report what someone promised." },
      { task:"Make a sentence with 'little did they know it would...'." },
      { task:"Describe an unfulfilled ambition using 'was going to be'." },
      { task:"Use 'were about to give up when...' in a motivational story." },
      { task:"Report a conversation: 'He said he would never...'." },
      { task:"Use 'was to have met' or 'were to arrive' in a formal-sounding sentence." },
      { task:"Describe a plan that changed at the last minute using 'was going to'." },
      { task:"Use 'they would eventually...' to describe something that took a long time." },
      { task:"Make a sentence: 'At that moment, she realised it would...'." },
      { task:"Tell a short story using 'was going to', 'were about to', and 'would'." },
      { task:"Use 'I had no idea it would...' to express surprise about a past event." },
      { task:"Describe a near-miss or close call using 'was about to'." },
      { task:"Make a sentence with 'she thought she would never...'." },
      { task:"Use 'it was meant to be' or 'it was going to be different' in a sentence." },
    ],
  },

  relative_clauses: {
    label: "Relative Clauses",
    category: "grammar",
    questions: [
      { type:"choose correct grammar", question:"'The woman ___ called is my sister.' (who/which/whose)", answer:"who", hint:"'Who' for people", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'The book which I told you about it is amazing.'", answer:"The book which I told you about is amazing.", hint:"Remove 'it' — 'which' already replaces the object", difficulty:"medium" },
      { type:"finish the sentence", question:"'The car ___ I bought last year broke down yesterday.'", answer:"that / which", hint:"Both 'that' and 'which' work for things", difficulty:"easy" },
      { type:"choose correct grammar", question:"'The student ___ bag was stolen reported it to the teacher.' (whose/who's/who)", answer:"whose", hint:"'Whose' shows possession", difficulty:"medium" },
      { type:"rewrite sentences", question:"Combine: 'She met a man. His wife is famous.' Using a relative clause.", answer:"She met a man whose wife is famous.", hint:"Use 'whose' for possession", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'That's the restaurant where I went there last summer.'", answer:"That's the restaurant where I went last summer.", hint:"'Where' replaces 'there' — don't use both", difficulty:"medium" },
      { type:"choose correct grammar", question:"'2005 was the year ___ everything changed.' (when/which/where)", answer:"when", hint:"'When' for time expressions", difficulty:"medium" },
      { type:"rewrite sentences", question:"Combine using a non-defining relative clause: 'My brother lives in Paris. He's a chef.'", answer:"My brother, who lives in Paris, is a chef.", hint:"Non-defining clauses need commas", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'He is the person who I trust him most.'", answer:"He is the person who I trust most.", hint:"Don't repeat the pronoun — 'who' replaces 'him'", difficulty:"medium" },
      { type:"choose correct grammar", question:"'This is the school ___ I studied.' (where/which/when)", answer:"where", hint:"'Where' for places", difficulty:"easy" },
      { type:"finish the sentence", question:"'The reason ___ she left is still unclear.'", answer:"why / that", hint:"'Why' or 'that' after 'reason'", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'London, which I visited it last year, is beautiful.'", answer:"London, which I visited last year, is beautiful.", hint:"Remove 'it' — 'which' already covers it", difficulty:"hard" },
      { type:"rewrite sentences", question:"Add a defining relative clause: 'The woman works here. I told you about her.'", answer:"The woman (who/that) I told you about works here.", hint:"Object relative clause — 'who/that' can be omitted", difficulty:"hard" },
      { type:"choose correct grammar", question:"'Everything ___ you said is true.' (what/that/which)", answer:"that", hint:"After 'everything', use 'that' not 'what'", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'The film, that won three Oscars, is on tonight.'", answer:"The film, which won three Oscars, is on tonight.", hint:"Non-defining clauses use 'which', not 'that'", difficulty:"hard" },
      { type:"finish the sentence", question:"'She's the kind of person ___ always finds a solution.'", answer:"who", hint:"'Who' for people — subject of the relative clause", difficulty:"easy" },
      { type:"rewrite sentences", question:"Combine: 'He gave me a gift. I didn't expect it.'", answer:"He gave me a gift (that/which) I didn't expect.", hint:"Object relative clause — pronoun can be omitted", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'This is what that I wanted to show you.'", answer:"This is what I wanted to show you.", hint:"'What' = the thing that — don't add 'that'", difficulty:"hard" },
      { type:"choose correct grammar", question:"'The hotel ___ we stayed was perfect.' (where/which/that)", answer:"where", hint:"'Where' for places we stay/work/live", difficulty:"medium" },
      { type:"finish the sentence", question:"'I'll never forget the day ___ we first met.'", answer:"when / that", hint:"'When' or 'that' for time references", difficulty:"medium" },
    ],
    spyRounds: [
      { crewmateTopic:"Relative Clauses", spyTopic:"Participle Clauses", crewmatePrompt:"Describe people, places, and things using 'who', 'which', 'where', 'whose' to add information.", spyPrompt:"Describe people, places, and things using -ing or -ed participle phrases to add information, like 'the man standing there'.", explanation:"Crewmates use relative clauses ('the man who works there'). The spy uses reduced participle clauses ('the man working there').", spyGuessOptions:["Relative Clauses","Participle Clauses","Adjective Phrases","Appositives"] },
      { crewmateTopic:"Relative Clauses", spyTopic:"Prepositional Phrases", crewmatePrompt:"Define or describe five things in the classroom or school using relative clauses — who, which, where, that.", spyPrompt:"Define or describe five things in the classroom or school using prepositional phrases — 'the book on the table', 'the room at the end'.", explanation:"Crewmates add information with relative clauses. The spy uses simple prepositional phrases to locate or describe instead.", spyGuessOptions:["Relative Clauses","Prepositional Phrases","Noun Phrases","Appositives"] },
      { crewmateTopic:"Relative Clauses", spyTopic:"Non-defining relative clauses", crewmatePrompt:"Talk about people you know — define who they are using defining relative clauses: 'the person who', 'the one that'.", spyPrompt:"Talk about people you know — add extra information using commas and non-defining clauses: 'my friend, who lives in Rome,'.", explanation:"Crewmates use defining relative clauses (no commas, essential info). The spy uses non-defining clauses (commas, extra info).", spyGuessOptions:["Defining Relative Clauses","Non-defining Relative Clauses","Appositives","Embedded Questions"] },
      { crewmateTopic:"Relative Clauses", spyTopic:"Embedded questions (indirect questions)", crewmatePrompt:"Describe the reason why, the moment when, and the place where something important happened to you — use 'why', 'when', 'where'.", spyPrompt:"Talk about what you know and don't know — use 'I know where', 'I wonder why', 'I don't know when'.", explanation:"Crewmates use relative clauses ('the reason why I did it'). The spy uses embedded/indirect questions ('I know why I did it').", spyGuessOptions:["Relative Clauses","Embedded Questions","Noun Clauses","Adverbial Clauses"] },
    ],
    minefieldGrid: {
      topic: "Relative Clauses",
      instructions: "Students combine the noun (top) with the relative pronoun starter (side) to make a full relative clause sentence — then complete it with their own idea.",
      colLabels: ["The city …", "My neighbour …", "The moment …", "The reason …", "A restaurant …"],
      rowLabels: ["… who …", "… which/that …", "… where …", "… when …", "… whose …"],
    },
    hotSeatWords: [
      {word:"who"},{word:"which"},{word:"whose"},{word:"where"},
      {word:"when"},{word:"why"},{word:"that"},{word:"describe"},
      {word:"person"},{word:"place"},{word:"reason"},{word:"time"},
      {word:"thing"},{word:"object"},{word:"location"},{word:"moment"},
      {word:"owner"},{word:"connect"},{word:"identify"},{word:"define"},
    ],
    hotPotatoPrompts: [
      {prompt:"'The man ___ lives next door.' (person)", answer:"who"},
      {prompt:"'The book ___ I read.' (thing)", answer:"that / which"},
      {prompt:"'The city ___ I was born.' (place)", answer:"where"},
      {prompt:"'The day ___ we met.' (time)", answer:"when"},
      {prompt:"'The reason ___ I left.' (reason)", answer:"why"},
      {prompt:"'The woman ___ car is red.' (possession)", answer:"whose"},
      {prompt:"'Who', 'which', 'where' — what are they called?", answer:"relative pronouns"},
      {prompt:"Non-defining clause: use commas, yes or no?", answer:"yes"},
      {prompt:"Defining clause: use commas, yes or no?", answer:"no"},
      {prompt:"'The film, which was long, was great.' Can we remove the clause?", answer:"yes"},
      {prompt:"'She's the teacher who helped me.' Can we remove 'who helped me'?", answer:"no"},
      {prompt:"'The place ___ I grew up is beautiful.'", answer:"where"},
      {prompt:"'He's the one ___ always arrives late.'", answer:"who / that"},
      {prompt:"'My sister, ___ is a nurse, lives in London.'", answer:"who"},
      {prompt:"'___ ' for people: who or which?", answer:"who"},
      {prompt:"'___ ' for things: who or which?", answer:"which"},
      {prompt:"'The town ___ we spent our holiday.'", answer:"where"},
      {prompt:"Can 'that' replace 'which' in a defining clause?", answer:"yes"},
      {prompt:"Can 'that' replace 'who' in a defining clause?", answer:"yes (informal)"},
      {prompt:"Describe your school using a relative clause.", answer:"(free answer)"},
    ],
    auctionSentences: [
      { sentence:"The woman who called me is my new manager.", isCorrect:true, explanation:"'Who' correctly introduces a subject relative clause for a person." },
      { sentence:"That's the city where I grew up there.", isCorrect:false, explanation:"'Where' already replaces 'there' — both together is redundant." },
      { sentence:"My brother, who lives in Paris, is a chef.", isCorrect:true, explanation:"Non-defining relative clause correctly set off with commas." },
      { sentence:"She's the student who's essay won first prize.", isCorrect:false, explanation:"'Whose' shows possession — 'who's' means 'who is'." },
      { sentence:"The book I recommended is now out of stock.", isCorrect:true, explanation:"The relative pronoun 'that/which' is correctly omitted in an object clause." },
      { sentence:"The film, that won three Oscars, is on tonight.", isCorrect:false, explanation:"Non-defining relative clauses use 'which', not 'that'." },
      { sentence:"2005 was the year when everything changed.", isCorrect:true, explanation:"'When' correctly refers to a point in time after 'year'." },
      { sentence:"He is the person who I trust him most.", isCorrect:false, explanation:"'Who' already replaces the object — 'him' is redundant. Say 'who I trust most'." },
      { sentence:"This is the restaurant where we celebrated our anniversary.", isCorrect:true, explanation:"'Where' correctly introduces a relative clause for a place." },
      { sentence:"Everything what she told me turned out to be false.", isCorrect:false, explanation:"After 'everything', use 'that', not 'what'. 'What' = 'the thing that'." },
    ],
    cardTasks: [
      { task:"Describe a person you admire using a relative clause with 'who'." },
      { task:"Use 'which' to add extra information about your hometown." },
      { task:"Make a sentence with 'whose' to describe someone's talent or possession." },
      { task:"Use 'where' to describe a place that is special to you." },
      { task:"Make a non-defining relative clause about a family member." },
      { task:"Describe a film or book using a defining relative clause." },
      { task:"Use 'the year when...' to talk about an important moment in history." },
      { task:"Make a sentence with 'the reason why...' to explain a decision." },
      { task:"Describe your school or workplace using a relative clause." },
      { task:"Use 'who I trust most' or 'who I admire' in a sentence about someone." },
      { task:"Make a sentence with 'the thing that bothers me most is...'." },
      { task:"Describe a memory using 'I'll never forget the day when...'." },
      { task:"Use a relative clause to define what makes a good teacher or friend." },
      { task:"Make a sentence with 'whose work I really respect' about someone famous." },
      { task:"Use 'which surprised everyone' in a non-defining relative clause." },
      { task:"Describe a shop or restaurant using 'where I always go to...'." },
      { task:"Make a sentence with 'the people who matter most to me...'." },
      { task:"Use 'that I've always wanted to do' about a goal or dream." },
      { task:"Describe a problem using 'which is something we need to address'." },
      { task:"Make a sentence using 'whoever is responsible for...' about a situation." },
    ],
  },

  adverbs: {
    label: "Adverbs",
    category: "grammar",
    questions: [
      { type:"correct grammar mistakes", question:"'She sings beautiful.'", answer:"She sings beautifully.", hint:"Adverbs modify verbs — add '-ly'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'He works ___ hard.' (very/much/well)", answer:"very", hint:"'Very' intensifies adverbs and adjectives", difficulty:"easy" },
      { type:"finish the sentence", question:"'She speaks French ___. (fluency)'", answer:"fluently", hint:"Adjective → adverb: add '-ly'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I hardly can believe it.'", answer:"I can hardly believe it.", hint:"'Hardly' goes between auxiliary and main verb", difficulty:"medium" },
      { type:"choose correct grammar", question:"'He ___ arrives late.' (never/not ever/always not)", answer:"never", hint:"'Never' is the correct adverb of frequency", difficulty:"easy" },
      { type:"rewrite sentences", question:"Rewrite with an adverb: 'She gave a careful answer.'", answer:"She answered carefully.", hint:"Move the adjective and convert to adverb", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'He did good in the exam.'", answer:"He did well in the exam.", hint:"'Well' is the adverb form — 'good' is an adjective", difficulty:"medium" },
      { type:"choose correct grammar", question:"'The surgery went ___.' (smoothly/smooth/well-smoothly)", answer:"smoothly", hint:"Adverb needed to modify the verb", difficulty:"medium" },
      { type:"finish the sentence", question:"'You should ___ (careful) read the instructions.'", answer:"carefully", hint:"Adverb form of 'careful'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She drives more careful than her brother.'", answer:"She drives more carefully than her brother.", hint:"Comparative of adverbs: more + adverb (-ly)", difficulty:"medium" },
      { type:"choose correct grammar", question:"'I ___ go to the gym on Sundays.' (usually/use to/habitual)", answer:"usually", hint:"'Usually' = adverb of frequency", difficulty:"easy" },
      { type:"rewrite sentences", question:"Rewrite: 'He is a quick learner.' Using an adverb.", answer:"He learns quickly.", hint:"Adjective → adverb to modify the verb", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'She can hardily wait for the holidays.'", answer:"She can hardly wait for the holidays.", hint:"'Hardly' means 'almost not' — 'hardily' is a different word", difficulty:"hard" },
      { type:"finish the sentence", question:"'He speaks so ___ (quiet) that I can't hear him.'", answer:"quietly", hint:"Adverb needed after 'so'", difficulty:"medium" },
      { type:"choose correct grammar", question:"'She smiled ___.' (warm/warmly/warming)", answer:"warmly", hint:"Adverb modifies the verb 'smiled'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She's incredibly good — she plays the piano most beautiful.'", answer:"She's incredibly good — she plays the piano most beautifully.", hint:"Superlative adverb: most + adverb (-ly)", difficulty:"hard" },
      { type:"rewrite sentences", question:"Add an adverb of degree: 'She was tired after the run.'", answer:"She was absolutely/extremely/completely tired after the run.", hint:"Intensifying adverbs before adjectives", difficulty:"medium" },
      { type:"choose correct grammar", question:"'He had ___ finished the test when the bell rang.' (just/already/yet)", answer:"just", hint:"'Just' = immediately before", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'She was enough clever to solve it.'", answer:"She was clever enough to solve it.", hint:"'Enough' comes after adjectives, not before", difficulty:"hard" },
      { type:"finish the sentence", question:"'The food smelled ___.' (good/well/nicely)", answer:"good", hint:"After sense verbs like 'smell', use adjective not adverb", difficulty:"hard" },
    ],
    spyRounds: [
      { crewmateTopic:"Adverbs of Manner", spyTopic:"Adjectives", crewmatePrompt:"Describe how you and people you know do things — speak quickly, drive carefully, sing beautifully. Use adverbs to modify verbs.", spyPrompt:"Describe people and things — a quick driver, a careful person, a beautiful singer. Use adjectives to describe nouns.", explanation:"Crewmates use adverbs of manner to modify verbs ('she drives carefully'). The spy uses adjectives to describe nouns ('she is a careful driver').", spyGuessOptions:["Adverbs of Manner","Adjectives","Intensifiers","Comparative Adverbs"] },
      { crewmateTopic:"Adverbs of Frequency", spyTopic:"Time expressions", crewmatePrompt:"Talk about your daily habits and routines — use 'always', 'usually', 'sometimes', 'rarely', 'never' to say how often.", spyPrompt:"Talk about your daily habits and routines — use 'every day', 'three times a week', 'once a month', 'on Fridays' to say when.", explanation:"Crewmates use adverbs of frequency (always, rarely). The spy uses time expressions and phrases (every day, on weekends).", spyGuessOptions:["Adverbs of Frequency","Time Expressions","Present Simple","Habitual Actions"] },
      { crewmateTopic:"Adverbs (enough / too)", spyTopic:"Comparative adjectives", crewmatePrompt:"Talk about whether things are suitable or excessive — 'fast enough', 'too expensive', 'warm enough', 'too loud'.", spyPrompt:"Compare things to say whether they meet a standard — 'faster than needed', 'more expensive than expected', 'warmer than before'.", explanation:"Crewmates use 'too + adjective' and 'adjective + enough'. The spy uses comparatives ('more … than') to express similar ideas.", spyGuessOptions:["Enough / Too","Comparative Adjectives","Very / Quite","Superlatives"] },
      { crewmateTopic:"Adverbs of Degree", spyTopic:"Intensifiers with nouns", crewmatePrompt:"Describe your reactions and feelings about recent events — use 'absolutely', 'completely', 'extremely', 'quite', 'rather'.", spyPrompt:"Describe your reactions to events — use 'a total', 'a complete', 'a real', 'such a' before nouns to intensify.", explanation:"Crewmates intensify adjectives with adverbs ('absolutely brilliant'). The spy intensifies nouns ('a total disaster', 'such a mess').", spyGuessOptions:["Adverbs of Degree","Noun Intensifiers","Emphatic adjectives","Very / Really"] },
    ],
    minefieldGrid: {
      topic: "Adverbs",
      instructions: "Students combine the subject/verb starter (top) with the adverb (side) to make a natural full sentence — then finish it with their own detail.",
      colLabels: ["She speaks English …", "He finished the test …", "They drive …", "I work …", "She handled it …"],
      rowLabels: ["… fluently / beautifully …", "… quickly / carefully …", "… incredibly well …", "… barely / hardly …", "… confidently / quietly …"],
    },
    hotSeatWords: [
      {word:"quickly"},{word:"slowly"},{word:"quietly"},{word:"loudly"},
      {word:"carefully"},{word:"badly"},{word:"well"},{word:"happily"},
      {word:"always"},{word:"never"},{word:"usually"},{word:"sometimes"},
      {word:"often"},{word:"rarely"},{word:"already"},{word:"still"},
      {word:"very"},{word:"too"},{word:"enough"},{word:"hard"},
    ],
    hotPotatoPrompts: [
      {prompt:"'She sings ___.' (beautiful → adverb)", answer:"beautifully"},
      {prompt:"'He drives very ___.' (careful → adverb)", answer:"carefully"},
      {prompt:"'She runs ___.' (quick → adverb)", answer:"quickly"},
      {prompt:"'He spoke ___.' (quiet → adverb)", answer:"quietly"},
      {prompt:"Adverbs of manner say ___ something is done.", answer:"how"},
      {prompt:"Adverbs of frequency say ___ something happens.", answer:"how often"},
      {prompt:"'Always, usually, often' — what type of adverb?", answer:"frequency"},
      {prompt:"'She ___ wakes up late.' (every day, without exception)", answer:"always"},
      {prompt:"'He ___ eats vegetables.' (almost never)", answer:"rarely / hardly ever"},
      {prompt:"'Too' means more than ___.", answer:"enough / needed"},
      {prompt:"'Fast' as adverb — does it change?", answer:"no, stays 'fast'"},
      {prompt:"'Good' → adverb?", answer:"well"},
      {prompt:"'Hard' → adverb?", answer:"hard (no change)"},
      {prompt:"'I'm not ___ fast for this job.' (sufficient speed)", answer:"fast enough"},
      {prompt:"'It's ___ hot to eat.' (more than comfortable)", answer:"too"},
      {prompt:"'She ___ finished before anyone else.' (before expected)", answer:"already"},
      {prompt:"'He's ___ working at midnight.' (continuing)", answer:"still"},
      {prompt:"Adverb for 'absolute'?", answer:"absolutely"},
      {prompt:"'She dances ___.' (bad → adverb)", answer:"badly"},
      {prompt:"'He works ___.' (hard → adverb)", answer:"hard"},
    ],
    auctionSentences: [
      { sentence:"She sings beautifully — everyone was amazed.", isCorrect:true, explanation:"'Beautifully' is the adverb correctly modifying the verb 'sings'." },
      { sentence:"He did good in the final exam.", isCorrect:false, explanation:"'Well' is the adverb form — 'good' is an adjective. 'He did well'." },
      { sentence:"She can hardly wait for the summer holidays.", isCorrect:true, explanation:"'Hardly' correctly means 'almost not' — placed between auxiliary and main verb." },
      { sentence:"She drives more careful than her brother.", isCorrect:false, explanation:"Comparative adverb form: 'more carefully', not 'more careful'." },
      { sentence:"She was clever enough to solve the problem herself.", isCorrect:true, explanation:"'Enough' correctly follows the adjective 'clever'." },
      { sentence:"The soup smells well — I think it's ready.", isCorrect:false, explanation:"After sense verbs like 'smell', use an adjective: 'smells good'." },
      { sentence:"He speaks so quietly that I can barely hear him.", isCorrect:true, explanation:"'Quietly' correctly modifies 'speaks'; 'barely' modifies 'hear'." },
      { sentence:"She was enough confident to present alone.", isCorrect:false, explanation:"'Enough' must follow the adjective: 'confident enough', not 'enough confident'." },
      { sentence:"I had just finished eating when she arrived.", isCorrect:true, explanation:"'Just' correctly placed between auxiliary 'had' and past participle 'finished'." },
      { sentence:"They played incredible well in the second half.", isCorrect:false, explanation:"'Incredible' is an adjective — the adverb 'incredibly' is needed to modify 'well'." },
    ],
    cardTasks: [
      { task:"Describe how a famous musician or artist performs using an adverb." },
      { task:"Use 'incredibly' or 'absolutely' to intensify an opinion you have." },
      { task:"Make a sentence with 'hardly' about something you almost never do." },
      { task:"Describe how you work or study using at least two adverbs." },
      { task:"Use 'fluently' to talk about a language skill." },
      { task:"Make a sentence with 'carefully' about an activity that requires concentration." },
      { task:"Use 'surprisingly' or 'unexpectedly' in a sentence about something that happened." },
      { task:"Describe a sport or activity using 'quickly', 'slowly', or 'gracefully'." },
      { task:"Use 'barely' or 'nearly' to describe a close call or difficult situation." },
      { task:"Make a sentence with 'deeply' or 'strongly' to express a feeling or belief." },
      { task:"Describe how someone you know speaks or communicates using an adverb." },
      { task:"Use 'already', 'just', or 'still' to talk about what you've done today." },
      { task:"Make a sentence with 'never' about something you refuse to do." },
      { task:"Use 'completely' or 'entirely' to emphasise a change or decision." },
      { task:"Describe a city or place using adverbs of manner." },
      { task:"Use 'enough' in a sentence about whether you feel ready for something." },
      { task:"Make a sentence with 'occasionally' or 'frequently' about your habits." },
      { task:"Use 'unfortunately' or 'fortunately' at the start of a sentence about your week." },
      { task:"Describe a performance or presentation using at least one adverb." },
      { task:"Use 'too' or 'not enough' in a sentence about a problem you face." },
    ],
  },

  double_comparatives: {
    label: "Double Comparatives",
    category: "grammar",
    questions: [
      { type:"finish the sentence", question:"'___ harder you work, ___ better your results.' (The/The)", answer:"The...the", hint:"Double comparative uses 'the...the'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'More you practice, the more fluent you become.'", answer:"The more you practice, the more fluent you become.", hint:"Both parts need 'the'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ he talked, the more confused I got.' (The more/More/The much)", answer:"The more", hint:"'The more' starts double comparatives", difficulty:"easy" },
      { type:"rewrite sentences", question:"Rewrite: 'If you eat a lot of sugar, you gain more weight.'", answer:"The more sugar you eat, the more weight you gain.", hint:"Double comparative: cause → effect", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'The sooner we leave, the better we arrive.'", answer:"The sooner we leave, the earlier we arrive.", hint:"'Better' doesn't modify arrival — use 'earlier'", difficulty:"hard" },
      { type:"finish the sentence", question:"'___ (fewer) people come, ___ (enjoyable) it will be.'", answer:"The fewer...the more enjoyable", hint:"'Fewer' for countable, 'less' for uncountable", difficulty:"hard" },
      { type:"choose correct grammar", question:"'___ fit you become, the more energy you have.' (More/The fitter/The more)", answer:"The fitter", hint:"Use comparative adjective after 'the'", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'The more expensive is the hotel, the better the service.'", answer:"The more expensive the hotel, the better the service.", hint:"Don't use 'is' inside the double comparative clause", difficulty:"hard" },
      { type:"rewrite sentences", question:"Rewrite: 'If we wait longer, we pay more.'", answer:"The longer we wait, the more we pay.", hint:"The + comparative in both clauses", difficulty:"medium" },
      { type:"choose correct grammar", question:"'The less you worry, ___.' (the happier you'll be/you'll be happier/the more happy)", answer:"the happier you'll be", hint:"Both parts must use comparative form with 'the'", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'The more we laughed, the more happier we felt.'", answer:"The more we laughed, the happier we felt.", hint:"'The happier' — don't add 'more' before short comparative", difficulty:"hard" },
      { type:"finish the sentence", question:"'___ I know him, the more I admire him.'", answer:"The more", hint:"'The more I know him...'", difficulty:"easy" },
      { type:"rewrite sentences", question:"Rewrite: 'Reading makes you smarter and smarter.'", answer:"The more you read, the smarter you become.", hint:"Double comparative for progressive change", difficulty:"hard" },
      { type:"choose correct grammar", question:"'The ___ food you cook, the ___ money you save.' (less/fewer/more...more/less)", answer:"more...less", hint:"Cooking more food leads to saving more money... or less spending", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'The hotter the weather, sweatier you get.'", answer:"The hotter the weather, the sweatier you get.", hint:"Both parts need 'the'", difficulty:"medium" },
      { type:"finish the sentence", question:"'___ time passes, ___ difficult it becomes to remember.'", answer:"The more...the more", hint:"Both clauses need 'the + comparative'", difficulty:"medium" },
      { type:"rewrite sentences", question:"Rewrite: 'If there are fewer students, there is more individual attention.'", answer:"The fewer students there are, the more individual attention there is.", hint:"'Fewer' for countable — maintain double comparative structure", difficulty:"hard" },
      { type:"choose correct grammar", question:"'The ___ you sleep, the ___ you'll feel.' (more/better/less...more rested/better)", answer:"more...better", hint:"More sleep → better feeling", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'More slowly she walks, the further behind she falls.'", answer:"The more slowly she walks, the further behind she falls.", hint:"Need 'the' at the start of both clauses", difficulty:"hard" },
      { type:"finish the sentence", question:"'___ richer he became, ___ lonely he felt.'", answer:"The richer...the more", hint:"Short comparatives just add 'the'; long ones need 'the more'", difficulty:"hard" },
    ],
    spyRounds: [
      { crewmateTopic:"Double Comparatives", spyTopic:"Conditional sentences (first conditional)", crewmatePrompt:"Talk about cause and effect in life — the more you study, the better your results; the harder you work, the more you earn.", spyPrompt:"Talk about cause and effect using if-sentences — if you study more, your results will improve; if you work harder, you'll earn more.", explanation:"Crewmates use double comparatives ('the more…the better'). The spy expresses the same ideas with first conditional ('if…will').", spyGuessOptions:["Double Comparatives","First Conditional","Cause and Effect","Correlative Conjunctions"] },
      { crewmateTopic:"Double Comparatives", spyTopic:"As…as comparisons", crewmatePrompt:"Describe how things change together — the warmer the weather gets, the happier people feel. Use 'the + comparative' in both parts.", spyPrompt:"Compare things that are equal or different — 'as warm as last summer', 'not as expensive as before', 'as happy as ever'.", explanation:"Crewmates use double comparatives to show proportional change. The spy uses 'as…as' to make equal comparisons.", spyGuessOptions:["Double Comparatives","As…as Comparisons","Superlatives","Parallel structure"] },
      { crewmateTopic:"Double Comparatives", spyTopic:"Superlatives", crewmatePrompt:"Talk about how qualities intensify — the more people eat, the heavier they become; the less you sleep, the worse you feel.", spyPrompt:"Talk about extremes — the most tired you've ever been, the best food you've eaten, the worst experience you've had.", explanation:"Crewmates use double comparatives for proportional relationships. The spy uses superlatives ('the most', 'the best') for extremes.", spyGuessOptions:["Double Comparatives","Superlatives","As…as","Regular Comparatives"] },
      { crewmateTopic:"Double Comparatives", spyTopic:"Parallel structure with 'and'", crewmatePrompt:"Describe trends and patterns — the more technology improves, the faster life becomes. Use double comparative structure.", spyPrompt:"Describe related trends — 'technology improves and life gets faster', 'you study more and results get better'. Connect ideas with 'and'.", explanation:"Crewmates use the 'the…the…' double comparative structure. The spy connects related ideas with a simple 'and' instead.", spyGuessOptions:["Double Comparatives","Parallel 'and' structure","Correlatives","Proportional Clauses"] },
    ],
    minefieldGrid: {
      topic: "Double Comparatives",
      instructions: "Students combine the first clause (top) with the result clause starter (side) to make a full double comparative sentence — filling in the rest themselves.",
      colLabels: ["The more you practise, …", "The harder you work, …", "The less you sleep, …", "The earlier we leave, …", "The more expensive it is, …"],
      rowLabels: ["… the better …", "… the more …", "… the less …", "… the worse …", "… the more likely …"],
    },
    hotSeatWords: [
      {word:"increase"},{word:"decrease"},{word:"improve"},{word:"progress"},
      {word:"better"},{word:"worse"},{word:"more"},{word:"less"},
      {word:"study more"},{word:"earn more"},{word:"eat less"},{word:"sleep less"},
      {word:"exercise more"},{word:"spend more"},{word:"wait longer"},{word:"work harder"},
      {word:"practise"},{word:"experience"},{word:"grow"},{word:"change"},
    ],
    hotPotatoPrompts: [
      {prompt:"'The more you study, ___ you learn.'", answer:"the more"},
      {prompt:"'The sooner, ___.'", answer:"the better"},
      {prompt:"'The harder you work, ___ you earn.'", answer:"the more"},
      {prompt:"'The ___ you eat, the worse you feel.'", answer:"more"},
      {prompt:"'The more technology improves, ___ life becomes.'", answer:"the faster / the easier"},
      {prompt:"'The less you sleep, ___.'", answer:"the more tired you feel"},
      {prompt:"Double comparative uses 'the' how many times?", answer:"twice"},
      {prompt:"'The more you practise, ___.'", answer:"the better you get"},
      {prompt:"'The ___ the better' — one word for fewer?", answer:"fewer / less"},
      {prompt:"'The warmer it gets, ___ people are.'", answer:"the happier"},
      {prompt:"'The more expensive the hotel, ___.'", answer:"the better the service"},
      {prompt:"'___ you wait, the longer the queue gets.'", answer:"The longer"},
      {prompt:"'The more you complain, ___ it helps.'", answer:"the less"},
      {prompt:"Complete: 'The older you get, ___.'", answer:"(free — the wiser)"},
      {prompt:"'The more people eat, ___.'", answer:"the fatter they get"},
      {prompt:"Double comparative shows cause and ___.", answer:"effect"},
      {prompt:"'The less you worry, ___.'", answer:"the better you feel"},
      {prompt:"'The more friends you have, ___.'", answer:"the happier you are"},
      {prompt:"Complete: 'The harder the exam, ___.'", answer:"the more we study"},
      {prompt:"Say your own double comparative about school.", answer:"(free answer)"},
    ],
    auctionSentences: [
      { sentence:"The more you practice, the better you get.", isCorrect:true, explanation:"Classic double comparative: 'the + comparative' in both clauses." },
      { sentence:"More you practice, the better you get.", isCorrect:false, explanation:"Both clauses in a double comparative need 'the': 'The more you practice'." },
      { sentence:"The harder he worked, the more successful he became.", isCorrect:true, explanation:"Correct: 'the + comparative adjective/adverb' in both clauses." },
      { sentence:"The less she worries, the more happier she feels.", isCorrect:false, explanation:"'Happier' is already the comparative — don't add 'more'." },
      { sentence:"The sooner we leave, the earlier we'll arrive.", isCorrect:true, explanation:"Correct double comparative — both parts properly formed." },
      { sentence:"The more expensive is the hotel, the better the service.", isCorrect:false, explanation:"Don't insert 'is' inside the comparative clause: 'the more expensive the hotel'." },
      { sentence:"The fewer students there are, the more attention each one gets.", isCorrect:true, explanation:"'Fewer' for countable nouns — correctly used in the double comparative." },
      { sentence:"The hotter the weather, sweater you get.", isCorrect:false, explanation:"Both parts need 'the': 'the sweatier you get'." },
      { sentence:"The more slowly she speaks, the easier it is to understand.", isCorrect:true, explanation:"'More slowly' is the correct comparative of 'slowly' — both clauses begin with 'the'." },
      { sentence:"The more he earned, the more happier he should have been.", isCorrect:false, explanation:"'Happier' is already comparative — adding 'more' is a double comparative error." },
    ],
    cardTasks: [
      { task:"Use 'the more you practice, the...' to give advice about learning." },
      { task:"Make a double comparative about the weather and how people feel." },
      { task:"Use 'the harder you work, the...' to motivate your team." },
      { task:"Make a sentence with 'the longer you wait, the...' about a situation." },
      { task:"Use 'the more expensive, the better' or argue against it." },
      { task:"Make a double comparative about exercise and health." },
      { task:"Use 'the fewer people, the...' to describe your ideal social event." },
      { task:"Make a sentence: 'The less I sleep, the...' about your energy or mood." },
      { task:"Use a double comparative to describe how technology affects our lives." },
      { task:"Make a sentence with 'the sooner, the better' about something in your life." },
      { task:"Use 'the more I know him/her, the more I...' about someone you admire." },
      { task:"Make a double comparative about studying vocabulary or grammar." },
      { task:"Use 'the richer people become, the...' to discuss a social issue." },
      { task:"Make a sentence: 'The more slowly I read, the...' about your understanding." },
      { task:"Use 'the more confident you are, the...' as career or study advice." },
      { task:"Make a double comparative about travel: the destination and the experience." },
      { task:"Use 'the less you worry, the...' to give life advice." },
      { task:"Make a sentence about food using 'the fresher the ingredients, the...'." },
      { task:"Use 'the more time we spend together, the...' about a relationship." },
      { task:"Make a double comparative about reading or watching the news." },
    ],
  },

  third_conditional: {
    label: "Third Conditional",
    category: "grammar",
    questions: [
      { type:"correct grammar mistakes", question:"'If she studied, she would passed.'", answer:"If she had studied, she would have passed.", hint:"Third conditional: If + past perfect, would + have + past participle", difficulty:"easy" },
      { type:"finish the sentence", question:"'If I had known, I ___ (tell) you.'", answer:"would have told", hint:"Would + have + past participle in the main clause", difficulty:"easy" },
      { type:"choose correct grammar", question:"'If he ___ earlier, he wouldn't have missed the train.' (left/had left/would leave)", answer:"had left", hint:"Past perfect in the if-clause", difficulty:"easy" },
      { type:"rewrite sentences", question:"Rewrite: 'She didn't study so she failed.'", answer:"If she had studied, she wouldn't have failed.", hint:"Third conditional expresses unreal past situations", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'If they would have called, we would have known.'", answer:"If they had called, we would have known.", hint:"Don't use 'would' in the if-clause", difficulty:"medium" },
      { type:"finish the sentence", question:"'She wouldn't have got lost if she ___ (listen) to me.'", answer:"had listened", hint:"Past perfect in the if-clause", difficulty:"medium" },
      { type:"choose correct grammar", question:"'I wish I ___ harder at school.' (had studied/studied/would study)", answer:"had studied", hint:"'Wish' for past regrets uses past perfect", difficulty:"medium" },
      { type:"rewrite sentences", question:"Rewrite using 'but for': 'If you hadn't helped me, I would have failed.'", answer:"But for your help, I would have failed.", hint:"'But for + noun' replaces the if-clause", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'If I wouldn't have been there, it would have been worse.'", answer:"If I hadn't been there, it would have been worse.", hint:"Use 'hadn't' not 'wouldn't have' in the if-clause", difficulty:"hard" },
      { type:"finish the sentence", question:"'Had she ___ (know) about it, she would have reacted differently.'", answer:"known", hint:"Inverted third conditional: Had + subject + past participle", difficulty:"hard" },
      { type:"choose correct grammar", question:"'___ I been more careful, the accident wouldn't have happened.' (Had/If/Would)", answer:"Had", hint:"Inversion replaces 'if' in formal third conditionals", difficulty:"hard" },
      { type:"rewrite sentences", question:"Rewrite with inversion: 'If she had arrived on time, she would have got the job.'", answer:"Had she arrived on time, she would have got the job.", hint:"Had + subject + past participle...", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'If I had knew the answer, I would have told you.'", answer:"If I had known the answer, I would have told you.", hint:"'Known' is the past participle of 'know'", difficulty:"medium" },
      { type:"choose correct grammar", question:"'She would have ___ if she had practised more.' (won/win/winning)", answer:"won", hint:"'Would have + past participle'", difficulty:"medium" },
      { type:"finish the sentence", question:"'We ___ (not/miss) the bus if we had left five minutes earlier.'", answer:"wouldn't have missed", hint:"Negative third conditional main clause", difficulty:"medium" },
      { type:"rewrite sentences", question:"Express regret: 'I didn't apologise. Our friendship ended.'", answer:"If I had apologised, our friendship wouldn't have ended.", hint:"Third conditional for past regrets", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'What would have you done if you had been there?'", answer:"What would you have done if you had been there?", hint:"Question: What + would + subject + have + past participle", difficulty:"hard" },
      { type:"choose correct grammar", question:"'If only I ___ listened to your advice.' (have/had/would have)", answer:"had", hint:"'If only + past perfect' for regrets", difficulty:"hard" },
      { type:"finish the sentence", question:"'I would never have met her ___ (if/unless/had) I not moved to London.'", answer:"if / had", hint:"Both 'if I had not' and 'had I not' are correct", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'The project would been a success if we had worked harder.'", answer:"The project would have been a success if we had worked harder.", hint:"'Would have been' — don't drop 'have'", difficulty:"medium" },
    ],
    spyRounds: [
      { crewmateTopic:"Third Conditional", spyTopic:"Second Conditional", crewmatePrompt:"Talk about past regrets and things that didn't happen — if you hadn't done something, what would have been different?", spyPrompt:"Talk about imaginary situations — if you could change one thing, what would you do differently right now?", explanation:"Crewmates use third conditional for past unreal situations (if + past perfect, would have). The spy uses second conditional for present hypotheticals.", spyGuessOptions:["Third Conditional","Second Conditional","Mixed Conditional","Past Perfect"] },
      { crewmateTopic:"Third Conditional", spyTopic:"Mixed Conditional (3rd/2nd)", crewmatePrompt:"Reflect on a past decision — what would have happened if you had made a different choice? How would your life have changed?", spyPrompt:"Reflect on a past decision — if you had made a different choice then, how would your life be different now?", explanation:"Crewmates keep both clauses in the past (if had done → would have). The spy mixes: past condition → present result (if had done → would be now).", spyGuessOptions:["Third Conditional","Mixed Conditional","Second Conditional","Regret expressions"] },
      { crewmateTopic:"Third Conditional", spyTopic:"I wish / If only (past)", crewmatePrompt:"Discuss a historical event — what would have happened if a key moment had gone differently? Use the third conditional.", spyPrompt:"Express regret about a historical event — use 'I wish it had been different' or 'If only they had decided otherwise'.", explanation:"Crewmates construct full third conditional sentences. The spy uses 'I wish + past perfect' and 'If only + past perfect' to express similar regrets.", spyGuessOptions:["Third Conditional","I wish / If only","Past Perfect regrets","Should have"] },
      { crewmateTopic:"Third Conditional", spyTopic:"Should have / Could have", crewmatePrompt:"Talk about a past situation that went wrong — what would have happened if things had been different? Use 'if had…would have'.", spyPrompt:"Criticise or reflect on a past situation — talk about what people should have done differently, what could have been avoided.", explanation:"Crewmates use third conditional structure. The spy uses modal perfect forms ('should have', 'could have') to express criticism or possibility.", spyGuessOptions:["Third Conditional","Should have / Could have","Regret Modals","Past Perfect"] },
    ],
    minefieldGrid: {
      topic: "Third Conditional",
      instructions: "Students combine the if-clause start (top) with the result clause starter (side) to build a full third conditional sentence — completing it with their imagination.",
      colLabels: ["If she hadn't overslept, …", "If we had left earlier, …", "If he had studied harder, …", "If they had listened, …", "If I had known, …"],
      rowLabels: ["… she/we/he/I would have …", "… they wouldn't have …", "… everything would have …", "… she/he could have …", "… it might have …"],
    },
    hotSeatWords: [
      {word:"regret"},{word:"mistake"},{word:"accident"},{word:"failure"},
      {word:"consequence"},{word:"turning point"},{word:"bad luck"},{word:"wrong choice"},
      {word:"if only"},{word:"too late"},{word:"second chance"},{word:"missed chance"},
      {word:"could have"},{word:"should have"},{word:"different"},{word:"changed"},
      {word:"wish"},{word:"past"},{word:"unreal"},{word:"what if"},
    ],
    hotPotatoPrompts: [
      {prompt:"'If I had studied, I ___ passed.'", answer:"would have"},
      {prompt:"Third conditional: if + ___ perfect.", answer:"past"},
      {prompt:"'If she had left earlier, she ___ missed the bus.'", answer:"wouldn't have"},
      {prompt:"'If + past perfect' = real or unreal past?", answer:"unreal"},
      {prompt:"'If he had called, I ___ answered.'", answer:"would have"},
      {prompt:"Complete: 'If it hadn't rained, we ___.'", answer:"would have gone out"},
      {prompt:"'Would have' + what verb form?", answer:"past participle"},
      {prompt:"'If I had known' — did I know?", answer:"no"},
      {prompt:"'She would have won if she ___.'", answer:"had tried harder"},
      {prompt:"Third conditional is about the past — true or false?", answer:"true"},
      {prompt:"'If they had listened, ___ happened.'", answer:"it wouldn't have"},
      {prompt:"'Had I known' — is this formal or informal?", answer:"formal (inverted)"},
      {prompt:"'If I hadn't eaten so much, I ___ feel sick.'", answer:"wouldn't have felt"},
      {prompt:"Complete: 'If you had told me, I ___.'", answer:"would have helped"},
      {prompt:"'If we had left earlier' — did we leave early?", answer:"no"},
      {prompt:"'He would have come if ___.'", answer:"he had been invited"},
      {prompt:"Express regret about yesterday using third conditional.", answer:"(free answer)"},
      {prompt:"'If she had studied medicine, she ___ a doctor.'", answer:"would have been"},
      {prompt:"'They would have met if ___.'", answer:"they had been there"},
      {prompt:"Name a regret using 'If I had...'", answer:"(free answer)"},
    ],
    auctionSentences: [
      { sentence:"If she had studied harder, she would have passed.", isCorrect:true, explanation:"Correct third conditional: 'if + past perfect, would + have + past participle'." },
      { sentence:"If they would have called, we would have known.", isCorrect:false, explanation:"'Would' cannot appear in the 'if' clause — use 'had called'." },
      { sentence:"Had I known earlier, I would have helped you.", isCorrect:true, explanation:"Inverted third conditional — formal alternative to 'If I had known'." },
      { sentence:"She wouldn't have got lost if she listened to me.", isCorrect:false, explanation:"The if-clause needs past perfect: 'if she had listened'." },
      { sentence:"The project would have been a success if we had worked together.", isCorrect:true, explanation:"Correct: 'would + have + past participle' in main clause, 'had + past participle' in if-clause." },
      { sentence:"What would have you done in that situation?", isCorrect:false, explanation:"In questions: 'would + subject + have', not 'would have + subject': 'What would you have done?'" },
      { sentence:"If only I had taken your advice — things would be different.", isCorrect:true, explanation:"'If only + past perfect' correctly expresses a past regret." },
      { sentence:"The project would been a great success.", isCorrect:false, explanation:"'Would have been' — 'have' cannot be dropped in the third conditional." },
      { sentence:"She would never have met him if she hadn't moved abroad.", isCorrect:true, explanation:"Correct negative third conditional — both clauses properly formed." },
      { sentence:"Had I knew about the problem, I would have acted sooner.", isCorrect:false, explanation:"Inverted third conditionals use the past participle: 'known', not 'knew'." },
    ],
    cardTasks: [
      { task:"Use the third conditional to express a regret about your education." },
      { task:"Make a third conditional about a historical event: 'If X had happened, Y would have...'." },
      { task:"Use 'If I had known...' to talk about a decision you made." },
      { task:"Make a sentence with 'she would never have met him if...'." },
      { task:"Use the third conditional to describe what might have happened differently in your life." },
      { task:"Make an inverted third conditional starting with 'Had I...'." },
      { task:"Use 'If only I had...' to express a strong regret." },
      { task:"Make a third conditional about a famous person: 'If they hadn't..., they would have...'." },
      { task:"Use 'but for...' to replace the if-clause in a third conditional." },
      { task:"Describe an accident or near miss using the third conditional." },
      { task:"Use 'I wish I had...' to talk about something you didn't do." },
      { task:"Make a third conditional about choosing a different career." },
      { task:"Use 'what would you have done if...' to ask your partner a question." },
      { task:"Describe a friendship or relationship using 'we would never have met if...'." },
      { task:"Make a sentence with 'wouldn't have been possible without...'." },
      { task:"Use the third conditional to talk about a sporting event outcome." },
      { task:"Make a sentence: 'If I had taken that opportunity, I would have...'." },
      { task:"Use 'they would have succeeded if...' to analyse a failure." },
      { task:"Make a third conditional about a travel experience or adventure." },
      { task:"Use 'had she arrived on time, everything would have...' in a story." },
    ],
  },

  // ── VOCABULARY TOPICS ────────────────────────────────────────────────────────
  giving_opinions: {
    label: "Giving Opinions",
    category: "vocabulary",
    questions: [
      { type:"use vocabulary in a sentence", question:"Use 'In my opinion' to give your view on social media.", answer:"In my opinion, social media has both positive and negative effects on society.", hint:"'In my opinion' + opinion statement", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ I see it, everyone deserves a second chance.' (As far as/The way/From where)", answer:"The way", hint:"'The way I see it' = in my view", difficulty:"easy" },
      { type:"finish the sentence", question:"'If you ask ___, we should invest more in education.'", answer:"me", hint:"'If you ask me' is an informal opinion opener", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'According to me, the film was brilliant.'", answer:"In my opinion / Personally, the film was brilliant.", hint:"'According to' is for sources, not personal opinions", difficulty:"medium" },
      { type:"use vocabulary in a sentence", question:"Use 'I tend to think' to express a cautious opinion.", answer:"I tend to think that working from home is more productive for most people.", hint:"'I tend to think' softens your opinion", difficulty:"medium" },
      { type:"choose correct grammar", question:"'___ my point of view, it's an ethical issue.' (From/In/To)", answer:"From", hint:"'From my point of view' is the correct expression", difficulty:"medium" },
      { type:"finish the sentence", question:"'I'm ___ the opinion that technology will replace many jobs.'", answer:"of", hint:"'I'm of the opinion that...'", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'What do you think about of the new policy?'", answer:"What do you think of / about the new policy?", hint:"Don't use 'about of' — choose one preposition", difficulty:"medium" },
      { type:"use vocabulary in a sentence", question:"Use 'As far as I'm concerned' to give a strong personal view.", answer:"As far as I'm concerned, honesty is the most important value in a friendship.", hint:"'As far as I'm concerned' = from my personal perspective", difficulty:"medium" },
      { type:"choose correct grammar", question:"'___ my knowledge, no one has solved this problem.' (To the best of/As best of/From best of)", answer:"To the best of", hint:"'To the best of my knowledge' = as far as I know", difficulty:"hard" },
      { type:"finish the sentence", question:"'It's my firm ___ that education should be free.'", answer:"belief / view / conviction", hint:"'It's my firm belief/view/conviction that...'", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'I completely agree with this opinion that he said.'", answer:"I completely agree with the opinion he expressed.", hint:"Avoid 'the opinion that he said' — 'expressed' is more natural", difficulty:"hard" },
      { type:"use vocabulary in a sentence", question:"Use 'I can see both sides' in a balanced opinion.", answer:"I can see both sides of the argument, but I still think stricter laws are necessary.", hint:"Acknowledge opposing views before stating your own", difficulty:"hard" },
      { type:"choose correct grammar", question:"'Don't you ___ that we should do more?' (think/consider/believe)", answer:"think", hint:"'Don't you think...?' is the most natural question form", difficulty:"easy" },
      { type:"finish the sentence", question:"'Would you ___ to share your view on this?'", answer:"like / care", hint:"'Would you like/care to share...' — polite invitation", difficulty:"medium" },
      { type:"correct grammar mistakes", question:"'I have a strong feeling that this approach, it won't work.'", answer:"I have a strong feeling that this approach won't work.", hint:"Remove the redundant 'it' — the clause already has a subject", difficulty:"hard" },
      { type:"use vocabulary in a sentence", question:"Use 'Personally speaking' to introduce your opinion.", answer:"Personally speaking, I find it difficult to understand why anyone would disagree.", hint:"'Personally speaking' = expressing a subjective view", difficulty:"medium" },
      { type:"choose correct grammar", question:"'___ honest with you, I don't think it'll work.' (To be/Being/For being)", answer:"To be", hint:"'To be honest with you' — infinitive opener", difficulty:"medium" },
      { type:"finish the sentence", question:"'I'd like to ___ that I strongly disagree with that position.'", answer:"state / say / point out", hint:"Formal language: 'I'd like to state/say/point out that...'", difficulty:"hard" },
      { type:"correct grammar mistakes", question:"'What is your opinion for the current situation?'", answer:"What is your opinion on/about the current situation?", hint:"'Opinion on/about' — not 'for'", difficulty:"medium" },
    ],
    spyRounds: [
      { crewmateTopic:"Giving Opinions", spyTopic:"Stating Facts", crewmatePrompt:"Discuss a current issue — express your personal view using 'In my opinion', 'I tend to think', 'From my point of view'.", spyPrompt:"Discuss a current issue — present objective information using 'Research shows', 'Studies suggest', 'It is known that'.", explanation:"Crewmates use opinion phrases to signal personal views. The spy states things as facts using impersonal, evidential language.", spyGuessOptions:["Giving Opinions","Stating Facts","Reporting Verbs","Hedging Language"] },
      { crewmateTopic:"Giving Opinions", spyTopic:"Agreeing and Disagreeing", crewmatePrompt:"Share your views on education — use opinion openers like 'Personally speaking', 'As far as I'm concerned', 'I strongly believe'.", spyPrompt:"Respond to what others say about education — use 'I completely agree', 'I see your point but', 'I'm not sure I agree with that'.", explanation:"Crewmates open with personal opinion starters. The spy uses agreement/disagreement language to respond to others.", spyGuessOptions:["Giving Opinions","Agreeing and Disagreeing","Hedging","Discourse Markers"] },
      { crewmateTopic:"Giving Opinions", spyTopic:"Hedging Language", crewmatePrompt:"Give your clear personal opinion on technology — use 'I believe', 'I think', 'To be honest', 'If you ask me'.", spyPrompt:"Give a cautious opinion on technology — use 'It might be the case that', 'There's a possibility that', 'It seems as though'.", explanation:"Crewmates use direct opinion starters. The spy uses hedging language to express uncertainty and soften claims.", spyGuessOptions:["Giving Opinions","Hedging Language","Speculating","Modal Verbs"] },
      { crewmateTopic:"Giving Opinions", spyTopic:"Discourse Markers", crewmatePrompt:"Give a structured opinion on social media — use 'In my view', 'Personally', 'The way I see it' to introduce your stance.", spyPrompt:"Give a structured opinion on social media — use 'First of all', 'Furthermore', 'On the other hand', 'In conclusion' to organise ideas.", explanation:"Crewmates use opinion-marking phrases to signal their view. The spy uses discourse/sequencing markers to structure an argument.", spyGuessOptions:["Giving Opinions","Discourse Markers","Linkers","Argumentation"] },
    ],
    minefieldGrid: {
      topic: "Giving Opinions",
      instructions: "Students combine the topic (top) with the opinion phrase (side) to make a full, natural opinion statement — completing it with their own view.",
      colLabels: ["… social media …", "… working from home …", "… learning English …", "… city life …", "… technology in schools …"],
      rowLabels: ["In my opinion, …", "As far as I'm concerned, …", "Personally speaking, …", "I tend to think that …", "From my point of view, …"],
    },
    hotSeatWords: [
      {word:"opinion"},{word:"view"},{word:"belief"},{word:"idea"},
      {word:"agree"},{word:"disagree"},{word:"debate"},{word:"argue"},
      {word:"evidence"},{word:"example"},{word:"reason"},{word:"point"},
      {word:"convinced"},{word:"neutral"},{word:"personally"},{word:"honestly"},
      {word:"support"},{word:"against"},{word:"think"},{word:"feel"},
    ],
    hotPotatoPrompts: [
      {prompt:"'In my ___, social media is useful.'", answer:"opinion"},
      {prompt:"'Personally ___, I love this city.'", answer:"speaking"},
      {prompt:"Start a sentence with 'From my point of ___'.", answer:"view"},
      {prompt:"'I ___ think it's a good idea.'", answer:"tend to / strongly"},
      {prompt:"'As far as I'm ___...'", answer:"concerned"},
      {prompt:"'To be ___, I'm not sure.'", answer:"honest"},
      {prompt:"'If you ___ me, it's too expensive.'", answer:"ask"},
      {prompt:"'In my view, homework ___ necessary.'", answer:"is"},
      {prompt:"'I must ___ I disagree.'", answer:"say"},
      {prompt:"'Don't you ___? It's obvious!'", answer:"think / agree"},
      {prompt:"Opinion phrase: 'I ___ believe technology is good.'", answer:"strongly / firmly"},
      {prompt:"'The way I ___ it...'", answer:"see"},
      {prompt:"Give an opinion on fast food in 5 seconds.", answer:"(free answer)"},
      {prompt:"'It's my ___ belief that...'", answer:"firm"},
      {prompt:"'As I ___ it, we need more parks.'", answer:"see"},
      {prompt:"'I have to ___ that I was wrong.'", answer:"admit"},
      {prompt:"'To the best of my ___...'", answer:"knowledge"},
      {prompt:"Give an opinion on mobile phones in class.", answer:"(free answer)"},
      {prompt:"'I ___ of the opinion that...'", answer:"am"},
      {prompt:"'I can see ___ sides of the argument.'", answer:"both"},
    ],
    auctionSentences: [
      { sentence:"In my opinion, we should invest more in renewable energy.", isCorrect:true, explanation:"'In my opinion' correctly introduces a personal view." },
      { sentence:"According to me, the film was absolutely brilliant.", isCorrect:false, explanation:"'According to' is for citing sources — use 'In my opinion' or 'Personally' for your own view." },
      { sentence:"As far as I'm concerned, this is a serious issue.", isCorrect:true, explanation:"'As far as I'm concerned' is a fixed expression meaning 'from my personal perspective'." },
      { sentence:"What do you think about of the new government policy?", isCorrect:false, explanation:"Use either 'think of' or 'think about' — not both prepositions together." },
      { sentence:"From my point of view, the plan has too many risks.", isCorrect:true, explanation:"'From my point of view' correctly introduces a personal perspective." },
      { sentence:"To be honest with, I'm not sure the idea will work.", isCorrect:false, explanation:"The fixed expression is 'To be honest with you' or simply 'To be honest'." },
      { sentence:"I tend to think that stricter laws would reduce crime.", isCorrect:true, explanation:"'I tend to think' correctly softens a personal opinion." },
      { sentence:"I'd like to point that there are serious flaws in this argument.", isCorrect:false, explanation:"'Point out' is a phrasal verb — 'out' cannot be omitted." },
      { sentence:"Personally speaking, I find it difficult to agree with that position.", isCorrect:true, explanation:"'Personally speaking' is a correct fixed expression for introducing a subjective view." },
      { sentence:"What is your opinion for the current education system?", isCorrect:false, explanation:"Use 'opinion on' or 'opinion about' — not 'opinion for'." },
    ],
    cardTasks: [
      { task:"Use 'In my opinion' to share your view on social media." },
      { task:"Start with 'As far as I'm concerned' and give a strong opinion about education." },
      { task:"Use 'From my point of view' to discuss a current news topic." },
      { task:"Give your opinion about city life vs country life using 'Personally speaking'." },
      { task:"Use 'I tend to think that...' to give a cautious opinion about technology." },
      { task:"Start with 'To be honest' and say something surprising about yourself." },
      { task:"Use 'If you ask me...' to give an informal opinion about school rules." },
      { task:"Make a sentence with 'It's my firm belief that...' about something important to you." },
      { task:"Use 'I can see both sides of...' to discuss a controversial topic." },
      { task:"Give your opinion about a film or book using 'The way I see it...'." },
      { task:"Use 'I'd like to point out that...' in a formal-sounding statement." },
      { task:"Start with 'Don't you think...' to ask your partner for their opinion." },
      { task:"Use 'I must say...' to share a reaction to something surprising." },
      { task:"Make a balanced sentence with 'although I understand..., I still believe...'." },
      { task:"Use 'To the best of my knowledge...' about a fact you're not 100% sure of." },
      { task:"Start with 'I have to admit...' and share an honest opinion." },
      { task:"Use 'What's your view on...' to invite someone into a discussion." },
      { task:"Make a sentence with 'I strongly believe that...' about an environmental issue." },
      { task:"Use 'In my view, the most important thing is...' about relationships." },
      { task:"Give a two-sided opinion using 'On the one hand... On the other hand...'." },
    ],
  },

  // ── A1 TOPICS ────────────────────────────────────────────────────────────────

  greetings_introductions: {
    label: "Greetings & Introductions",
    category: "vocabulary",
    questions: [
      { type:"choose correct grammar", question:"'___ your name?' 'My name is Ana.' (What's/Who's/How's)", answer:"What's", hint:"'What's your name?' is the standard greeting question", difficulty:"easy" },
      { type:"finish the sentence", question:"'Hello! I ___ Maria. Nice to meet you!'", answer:"am / 'm", hint:"Use 'am' or the contraction 'm' with I", difficulty:"easy" },
      { type:"choose correct grammar", question:"'How ___ you?' 'I'm fine, thanks!' (are/is/am)", answer:"are", hint:"'How are you?' uses 'are' with 'you'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'My name Maria.'", answer:"My name is Maria.", hint:"Don't forget the verb 'is'", difficulty:"easy" },
      { type:"finish the sentence", question:"'Nice to ___ you!' 'Nice to meet you too!'", answer:"meet", hint:"'Nice to meet you' is a fixed greeting phrase", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ are you from?' 'I'm from Brazil.' (Where/What/Who)", answer:"Where", hint:"'Where are you from?' asks about origin", difficulty:"easy" },
      { type:"finish the sentence", question:"'I'm ___ Mexico. Where are you from?'", answer:"from", hint:"'I'm from + country'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I from Spain.'", answer:"I am from Spain. / I'm from Spain.", hint:"You need the verb 'am' or 'are'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ old are you?' 'I'm twenty.' (How/What/Where)", answer:"How", hint:"'How old are you?' asks about age", difficulty:"easy" },
      { type:"finish the sentence", question:"'I ___ twenty-two years old.'", answer:"am / 'm", hint:"'I am' + age", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'Hi! I'm name is Carlos.'", answer:"Hi! My name is Carlos.", hint:"Use 'My name is' or 'I'm'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'Good ___ ! How are you?' (It's 8am.) (morning/afternoon/evening)", answer:"morning", hint:"'Good morning' is used in the early part of the day", difficulty:"easy" },
      { type:"finish the sentence", question:"'A: How are you? B: I'm ___, thank you!'", answer:"fine / good / great / well", hint:"Common positive replies to 'How are you?'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'Nice meet you!'", answer:"Nice to meet you!", hint:"'Nice to meet you' — don't forget 'to'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ your name?' 'It's Jake.' (What's/Where's/How's)", answer:"What's", hint:"'What's your name?' = 'What is your name?'", difficulty:"easy" },
      { type:"finish the sentence", question:"'A: What's your name? B: ___ name is Sofia.'", answer:"My", hint:"'My name is...' — use the possessive 'my'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'Where you are from?'", answer:"Where are you from?", hint:"In questions, the verb comes before the subject", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ to meet you! I'm Jamie.' (Nice/Good/Happy)", answer:"Nice", hint:"'Nice to meet you' is the most common fixed phrase", difficulty:"easy" },
      { type:"finish the sentence", question:"'Good ___! I'm leaving now. See you tomorrow!'", answer:"bye / goodbye", hint:"'Goodbye' or 'bye' to say farewell", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'How old you are?'", answer:"How old are you?", hint:"Question word order: How old + are + you?", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"Greetings & Introductions", spyTopic:"Saying Goodbye", crewmatePrompt:"Say hello to the group! Tell us: your name, where you are from, and how old you are. Example: 'Hi! My name is Ana. I'm from Brazil. I'm 20 years old. Nice to meet you!'", spyPrompt:"Say goodbye to the group! Use goodbye words like: 'Goodbye!', 'See you later!', 'Have a good day!', 'Take care!' Try to use two or three.", explanation:"Crewmates say hello and introduce themselves. The spy says goodbye instead of hello.", spyGuessOptions:["Saying Hello & Introducing Yourself","Saying Goodbye","Asking Questions","Talking About Your Day"] },
      { crewmateTopic:"Greetings & Introductions", spyTopic:"Asking About Likes", crewmatePrompt:"Meet your classmates! Ask them: 'What is your name?', 'Where are you from?', and 'How old are you?' Then answer their questions about you.", spyPrompt:"Ask your classmates what they like! Say things like: 'Do you like pizza?', 'Do you like football?', 'What is your favourite colour?' Ask two or three questions.", explanation:"Crewmates ask name, country, and age questions. The spy asks about likes and preferences instead.", spyGuessOptions:["Greeting & Asking Names","Asking About Likes","Talking About School","Asking About Family"] },
      { crewmateTopic:"Greetings & Introductions", spyTopic:"Asking How Someone Is", crewmatePrompt:"Introduce yourself to the group. Say your name, your country, and your age. Example: 'Hello! I am Marco. I am from Italy. I am 18 years old. Nice to meet you all!'", spyPrompt:"Ask everyone how they are feeling today! Say: 'How are you?' Then listen to the answer. Say: 'I am fine, thank you!' or 'I am great!' Share how you feel too.", explanation:"Crewmates tell the group who they are. The spy asks how people are feeling instead.", spyGuessOptions:["Saying Your Name and Country","Asking How Someone Is","Saying Goodbye","Counting and Numbers"] },
      { crewmateTopic:"Greetings & Introductions", spyTopic:"Talking About Your Day", crewmatePrompt:"Say 'Good morning!' or 'Good afternoon!' to the group. Then say your name, where you are from, and ask: 'What is your name?' to one person.", spyPrompt:"Tell the group about your day! Say what time you woke up, what you had for breakfast, and how you came to school. Use simple sentences.", explanation:"Crewmates greet people and share their name and country. The spy talks about their daily routine instead.", spyGuessOptions:["Greetings & Introductions","Talking About Your Day","Saying Goodbye","Describing Places"] },
    ],
    minefieldGrid: {
      topic: "Greetings & Introductions",
      instructions: "Students combine the greeting situation (top) with the phrase starter (side) to make a natural introduction — then complete it with their own details.",
      colLabels: ["Meeting someone new at school", "Seeing a friend in the morning", "Meeting your teacher", "Talking to someone at a party", "Saying goodbye to a classmate"],
      rowLabels: ["Hi! My name is …", "Nice to meet you! I'm …", "Good morning! How …", "I'm from … and I'm …", "See you …! Goodbye!"],
    },
    hotSeatWords: [
      {word:"hello"},{word:"goodbye"},{word:"name"},{word:"age"},
      {word:"country"},{word:"city"},{word:"morning"},{word:"afternoon"},
      {word:"evening"},{word:"introduce"},{word:"meet"},{word:"friend"},
      {word:"welcome"},{word:"nice"},{word:"please"},{word:"thank you"},
      {word:"question"},{word:"answer"},{word:"smile"},{word:"wave"},
    ],
    hotPotatoPrompts: [
      {prompt:"Say hello to someone you've never met.", answer:"Hi! / Hello!", spanish:"Di hola a alguien que no conoces."},
      {prompt:"'___ to meet you!' (first meeting)", answer:"Nice / Pleased"},
      {prompt:"Ask someone their name.", answer:"What's your name?", spanish:"Pregunta cómo se llama alguien."},
      {prompt:"'Where ___ you from?'", answer:"are"},
      {prompt:"Reply to 'How are you?'", answer:"I'm fine, thanks!"},
      {prompt:"'Good ___!' (10am)", answer:"morning"},
      {prompt:"'Good ___!' (3pm)", answer:"afternoon"},
      {prompt:"Say your name and country in one sentence.", answer:"I'm [name], I'm from [country].", spanish:"Di tu nombre y tu país en una frase."},
      {prompt:"'How ___ are you?' (asking age)", answer:"old"},
      {prompt:"Say goodbye to a friend.", answer:"Bye! / See you later!", spanish:"Di adiós a un amigo."},
      {prompt:"'___ to meet you' — one word.", answer:"Nice / Good / Pleased"},
      {prompt:"Ask someone how old they are.", answer:"How old are you?", spanish:"Pregunta la edad de alguien."},
      {prompt:"'I ___ from Spain.' (to be)", answer:"am"},
      {prompt:"'My ___ is Anna.' (what you're called)", answer:"name"},
      {prompt:"Greet your teacher in the morning.", answer:"Good morning!", spanish:"Saluda a tu profesor/a por la mañana."},
      {prompt:"Say 'see you tomorrow' in English.", answer:"See you tomorrow!", spanish:"Di \"hasta mañana\" en inglés."},
      {prompt:"'___ your name?' (question form)", answer:"What's"},
      {prompt:"'Thank ___!' ", answer:"you"},
      {prompt:"Say please and thank you in a sentence.", answer:"(free answer)", spanish:"Di \"por favor\" y \"gracias\" en una frase."},
      {prompt:"Ask a classmate where they are from.", answer:"Where are you from?", spanish:"Pregunta a un compañero de dónde es."},
    ],
    auctionSentences: [
      { sentence:"My name is Carlos. Nice to meet you!", isCorrect:true, explanation:"'My name is' + name is correct. 'Nice to meet you' is the standard phrase." },
      { sentence:"I name is Carlos. Nice to meet you!", isCorrect:false, explanation:"Use 'My name is' not 'I name is' — the possessive 'my' is needed." },
      { sentence:"Where are you from? I'm from Japan.", isCorrect:true, explanation:"Correct question form: 'Where are you from?' + answer with 'I'm from'." },
      { sentence:"Where you from? I'm from Japan.", isCorrect:false, explanation:"'Where are you from?' — don't omit the verb 'are'." },
      { sentence:"How old are you? I'm nineteen years old.", isCorrect:true, explanation:"'How old are you?' is correct. 'I'm + number + years old' is the answer." },
      { sentence:"How old you are? I'm nineteen years old.", isCorrect:false, explanation:"Question order: 'How old are you?' — verb before subject." },
      { sentence:"Nice to meet you! I'm from Brazil.", isCorrect:true, explanation:"'Nice to meet you' is a fixed phrase. 'I'm from + country' is correct." },
      { sentence:"Nice meet you! I'm from Brazil.", isCorrect:false, explanation:"The full phrase is 'Nice to meet you' — don't omit 'to'." },
      { sentence:"Good morning! How are you today?", isCorrect:true, explanation:"'Good morning' + 'How are you?' are standard greetings." },
      { sentence:"I'm from Mexico. I have twenty years old.", isCorrect:false, explanation:"In English, say 'I am twenty years old' — not 'I have twenty years'." },
    ],
    cardTasks: [
      { task:"Say hello and introduce yourself: your name, where you're from, and your age." },
      { task:"Ask your partner their name and where they are from. Answer their questions too." },
      { task:"Greet your partner with 'Good morning/afternoon' and ask how they are." },
      { task:"Introduce yourself to an imaginary new classmate — name, country, and age." },
      { task:"Say goodbye to your partner using at least two different farewell phrases." },
      { task:"Ask your partner 'How old are you?' and answer with your own age." },
      { task:"Say 'Nice to meet you!' and tell your partner one thing about yourself." },
      { task:"Ask your partner 'Where are you from?' and respond naturally." },
      { task:"Use 'Good morning' or 'Good evening' in a short dialogue with your partner." },
      { task:"Introduce yourself completely: name, age, and country." },
      { task:"Ask your partner three questions: name, age, and origin." },
      { task:"Say hello, ask how your partner is, and respond to their answer." },
      { task:"Use 'Excuse me' to start a conversation and introduce yourself." },
      { task:"Say your name and spell it out loud letter by letter." },
      { task:"Ask 'What's your name?' and then say 'Nice to meet you, [name]!'." },
      { task:"Say goodbye using 'See you later' and 'Have a good day!'." },
      { task:"Tell your partner your name and ask if they speak English." },
      { task:"Introduce yourself and ask your partner one personal question." },
      { task:"Use 'Thank you' and 'You're welcome' naturally in a short exchange." },
      { task:"Start with 'Hi, I'm…' and introduce yourself to two different classmates." },
    ],
  },

  introducing_others: {
    label: "Introducing Other People",
    category: "grammar",
    questions: [
      { type:"finish the sentence", question:"'This is Ana. ___ name is Ana.' (Her/His/My)", answer:"Her", hint:"Ana is a woman — use 'her'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'This is Tom. ___ is my friend.' (He/She/They)", answer:"He", hint:"Tom is male — use 'he'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'This is my friend. Her name are Sofia.'", answer:"Her name is Sofia.", hint:"'Her name' is singular — use 'is'", difficulty:"easy" },
      { type:"finish the sentence", question:"'___ is my brother. His name is Marco.'", answer:"This / He", hint:"'This is my brother' introduces him", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ is my sister. Her name is Lisa.' (He/This/They)", answer:"This", hint:"'This is' introduces someone", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'This is David. His name are David.'", answer:"His name is David.", hint:"'His name' is singular — use 'is'", difficulty:"easy" },
      { type:"finish the sentence", question:"'This is Emma. ___ is my classmate.'", answer:"She", hint:"Emma is female — use 'she'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'This is ___ teacher, Mr. Kim.' (my/me/I)", answer:"my", hint:"'My teacher' — use the possessive adjective", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'This is Jake. He name is Jake.'", answer:"His name is Jake.", hint:"Use 'his', not 'he', before a noun", difficulty:"easy" },
      { type:"finish the sentence", question:"'This is Maria. ___ is from Spain.'", answer:"She", hint:"Maria is female — use 'she'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ name is Carlos and he is my friend.' (His/Her/My)", answer:"His", hint:"Carlos is male — use 'his'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'This is my friend. She name is Ana.'", answer:"Her name is Ana.", hint:"Use 'her', not 'she', before a noun", difficulty:"easy" },
      { type:"finish the sentence", question:"'This is our teacher. ___ name is Mr. Brown.'", answer:"His", hint:"Mr. Brown is male — use 'his'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'Nice to meet you! ___ is my friend Tom.' (This/He/His)", answer:"This", hint:"Use 'This is...' when introducing someone", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'These is my friends.'", answer:"These are my friends.", hint:"'These' is plural — use 'are'", difficulty:"easy" },
      { type:"finish the sentence", question:"'This is ___ mother. Her name is Sara.' (my/me/I)", answer:"my", hint:"Possessive adjective: 'my mother'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'This is Mia. ___ is a student.' (She/Her/Hers)", answer:"She", hint:"Subject pronoun for a female: 'she'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'This is our friend. His name are Alex.'", answer:"His name is Alex.", hint:"'His name' is singular — use 'is'", difficulty:"easy" },
      { type:"finish the sentence", question:"'This is ___ brother Paulo. His name is Paulo.'", answer:"my / her / his / our", hint:"Possessive adjective before a family member", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ are my parents.' (These/This/They)", answer:"These", hint:"'These are' for introducing multiple people", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"Introducing Others", spyTopic:"Describing What People Look Like", crewmatePrompt:"Introduce a friend or family member to the group. Say: 'This is my friend. His/Her name is [name]. He/She is my [sister/classmate/etc.].' Do this for two or three people.", spyPrompt:"Describe what two or three people look like! Say: 'She has long hair.', 'He is tall.', 'She has brown eyes.' You can talk about real people or people in the room.", explanation:"Crewmates say names and relationships. The spy describes what people look like instead.", spyGuessOptions:["Introducing People","Describing Appearance","Talking About Family","Saying Where People Are From"] },
      { crewmateTopic:"Introducing Others", spyTopic:"Talking About Family", crewmatePrompt:"Tell the group about two or three people you know. Say: 'This is my [mum/friend/teacher]. Her/His name is [name].' Use 'his name' for a boy and 'her name' for a girl.", spyPrompt:"Tell the group about your family. Say how many people are in your family. Example: 'I have a mum, a dad, and one brother. My brother's name is Carlos. He is 15 years old.'", explanation:"Crewmates introduce people using 'This is'. The spy talks about family members in general.", spyGuessOptions:["Introducing People","Talking About Family","Describing Personality","Asking Questions"] },
      { crewmateTopic:"Introducing Others", spyTopic:"Saying What Belongs to Who", crewmatePrompt:"Introduce two people to the group. Say: 'This is [name]. She is my friend. Her bag is red.' or 'This is [name]. He is my brother. His phone is new.' Use 'his' or 'her' + a noun.", spyPrompt:"Tell the group who things belong to. Point to things and say: 'This is my pen.', 'That is her book.', 'These are his keys.' or 'Those are our bags.' Use 'my, your, his, her, our'.", explanation:"Crewmates introduce people and say 'his bag / her phone'. The spy says who things belong to without introducing anyone.", spyGuessOptions:["Introducing People with His/Her","Saying What Belongs to Who","Talking About School","Describing Things"] },
      { crewmateTopic:"Introducing Others", spyTopic:"Greetings & Meeting People", crewmatePrompt:"Introduce two or three people to the class. Say: 'These are my friends. Their names are [name] and [name].' or 'This is my teacher. His/Her name is [name].' Use 'this is' and 'these are'.", spyPrompt:"Meet your classmates! Say hello to two or three people. Tell them your name and ask their name. Say: 'Hi! I'm [name]. Nice to meet you! What's your name?' Then answer their questions.", explanation:"Crewmates introduce other people using 'This is / These are'. The spy meets people and introduces themselves instead.", spyGuessOptions:["Introducing Other People","Meeting and Greeting","Talking About School","Saying What You Like"] },
    ],
    minefieldGrid: {
      topic: "Introducing Others & Possessives",
      instructions: "Students combine the person (top) with the introduction phrase (side) — completing the sentence with real or imaginary details.",
      colLabels: ["… my friend (female) …", "… my brother …", "… my teacher (female) …", "… my classmate (male) …", "… my parents …"],
      rowLabels: ["This is … Her/His name is …", "He/She is from …", "His/Her name is … and he/she is …", "These are … Their names are …", "Meet …! He/She is my …"],
    },
    hotSeatWords: [
      {word:"family"},{word:"friend"},{word:"brother"},{word:"sister"},
      {word:"mother"},{word:"father"},{word:"teacher"},{word:"classmate"},
      {word:"name"},{word:"his"},{word:"her"},{word:"their"},
      {word:"introduce"},{word:"meet"},{word:"group"},{word:"team"},
      {word:"my"},{word:"your"},{word:"our"},{word:"share"},
    ],
    hotPotatoPrompts: [
      {prompt:"'___ is my friend Ana.' (introducing her)", answer:"This"},
      {prompt:"'___ name is Marco.' (he)", answer:"His"},
      {prompt:"'___ name is Sofia.' (she)", answer:"Her"},
      {prompt:"'These ___ my parents.'", answer:"are"},
      {prompt:"Introduce your brother using 'This is...'", answer:"This is my brother.", spanish:"Presenta a tu hermano usando \"This is...\"."},
      {prompt:"'His name ___ Tom.'", answer:"is"},
      {prompt:"'___ are my friends.' (more than one)", answer:"These"},
      {prompt:"'___ names are Ana and Carlos.' (they)", answer:"Their"},
      {prompt:"'My ___ is Carlos.' (teacher is male)", answer:"teacher's name"},
      {prompt:"'Her bag is ___.' (colour — you choose)", answer:"(any colour)"},
      {prompt:"'This is ___.' (introduce someone)", answer:"(a name)"},
      {prompt:"'___ is my sister.' — which word introduces?", answer:"This"},
      {prompt:"'His/Her/Their' — what type of word?", answer:"possessive adjective"},
      {prompt:"'Their house is big.' — how many people?", answer:"more than one"},
      {prompt:"Introduce two friends at once.", answer:"These are my friends...", spanish:"Presenta a dos amigos al mismo tiempo."},
      {prompt:"'Meet ___! She is my ___.' (introduce a female)", answer:"(free answer)"},
      {prompt:"'___ phone is new.' (Marco)", answer:"His"},
      {prompt:"'___ bag is red.' (Ana)", answer:"Her"},
      {prompt:"'___ teacher is kind.' (our class)", answer:"Our"},
      {prompt:"Use 'his' in a sentence about a male classmate.", answer:"(free answer)"},
    ],
    auctionSentences: [
      { sentence:"This is my friend. Her name is Sofia.", isCorrect:true, explanation:"'This is my friend' introduces her. 'Her name is' uses the possessive adjective correctly." },
      { sentence:"This is my friend. She name is Sofia.", isCorrect:false, explanation:"Use the possessive adjective 'her name', not the subject pronoun 'she name'." },
      { sentence:"This is Tom. He is my classmate.", isCorrect:true, explanation:"'This is Tom' introduces him. 'He is' uses the correct subject pronoun." },
      { sentence:"This is Tom. Him is my classmate.", isCorrect:false, explanation:"'He is' — use the subject pronoun 'he', not the object pronoun 'him'." },
      { sentence:"These are my parents. Their names are Ana and Carlos.", isCorrect:true, explanation:"'These are' for multiple people. 'Their names' uses the correct plural possessive." },
      { sentence:"This are my parents. Their names are Ana and Carlos.", isCorrect:false, explanation:"'These are my parents' — 'this' is for one person, 'these' for more than one." },
      { sentence:"His name is Marco and he is from Italy.", isCorrect:true, explanation:"'His name' (possessive adjective) and 'he is' (subject pronoun) are both correct." },
      { sentence:"His name is Marco and his is from Italy.", isCorrect:false, explanation:"'He is from Italy' — use the subject pronoun 'he', not the possessive 'his'." },
      { sentence:"This is our teacher. Her name is Ms. Park.", isCorrect:true, explanation:"'Our teacher' uses possessive 'our'. 'Her name' is correct for a female teacher." },
      { sentence:"This is our teacher. Hers name is Ms. Park.", isCorrect:false, explanation:"'Her name' — the possessive adjective 'her' comes before a noun. 'Hers' stands alone." },
    ],
    cardTasks: [
      { task:"Introduce an imaginary friend to your partner. Use 'This is… Her/His name is…'" },
      { task:"Say: 'This is my brother/sister. His/Her name is…' Use a real or imaginary name." },
      { task:"Use 'These are my friends' to introduce two imaginary classmates." },
      { task:"Say 'His name is…' and 'Her name is…' — use two different names." },
      { task:"Introduce your teacher to a new student using 'This is our teacher…'" },
      { task:"Say: 'This is [name]. He/She is my…' — use a family member or friend." },
      { task:"Use 'my', 'his', and 'her' in three different sentences about people you know." },
      { task:"Introduce two people: one male, one female. Use 'his name' and 'her name'." },
      { task:"Say 'Meet [name]! He/She is my…' and give one detail about them." },
      { task:"Use 'their names are…' to introduce two people at the same time." },
      { task:"Point to three things in the room and say who they belong to using 'my/his/her'." },
      { task:"Introduce your partner to the class using 'This is… His/Her name is…'" },
      { task:"Say three sentences using 'my', 'your', and 'our' about people in the class." },
      { task:"Use 'This is my friend. He/She is from…' to introduce an imaginary person." },
      { task:"Make a short sentence using 'their' — for example about two friends." },
      { task:"Introduce yourself and a classmate: 'I'm… and this is my friend…'" },
      { task:"Say 'His/Her name is… and he/she is … years old.'" },
      { task:"Use all six possessive adjectives (my, your, his, her, our, their) in six short sentences." },
      { task:"Introduce an imaginary famous person using 'This is…. His/Her name is…'" },
      { task:"Say 'These are my… Their names are…' about a group of people." },
    ],
  },

  present_simple: {
    label: "Present Simple",
    category: "grammar",
    questions: [
      { type:"choose correct grammar", question:"'She ___ to school every day.' (go/goes/going)", answer:"goes", hint:"Third person singular adds -s or -es", difficulty:"easy" },
      { type:"finish the sentence", question:"'I ___ (live) in Madrid.'", answer:"live", hint:"First person: no extra -s needed", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'He don't like coffee.'", answer:"He doesn't like coffee.", hint:"Third person negative: doesn't + base verb", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ she speak English?' (Do/Does/Is)", answer:"Does", hint:"Questions with he/she/it use 'does'", difficulty:"easy" },
      { type:"finish the sentence", question:"'They ___ (not/watch) TV in the morning.'", answer:"don't watch", hint:"Plural negative: don't + base verb", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She work in a hospital.'", answer:"She works in a hospital.", hint:"Third person singular: add -s to the verb", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ you live near school?' (Do/Does/Are)", answer:"Do", hint:"Questions with I/you/we/they use 'do'", difficulty:"easy" },
      { type:"finish the sentence", question:"'He ___ (study) English on Mondays.'", answer:"studies", hint:"Verbs ending in -y → change to -ies", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'Do she like music?'", answer:"Does she like music?", hint:"Third person question: 'does' not 'do'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'We ___ lunch at 1pm every day.' (have/has/haves)", answer:"have", hint:"First person plural: no -s needed", difficulty:"easy" },
      { type:"finish the sentence", question:"'My father ___ (work) in a bank.'", answer:"works", hint:"Third person singular: add -s", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She doesn't goes to the gym.'", answer:"She doesn't go to the gym.", hint:"After 'doesn't', use the base form of the verb", difficulty:"easy" },
      { type:"choose correct grammar", question:"'He ___ three languages.' (speak/speaks/speaking)", answer:"speaks", hint:"Third person singular needs -s", difficulty:"easy" },
      { type:"finish the sentence", question:"'___ (Do/Does) your brother play football?'", answer:"Does", hint:"'Your brother' = third person singular → 'does'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I doesn't understand.'", answer:"I don't understand.", hint:"'I' uses 'don't', not 'doesn't'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'She always ___ breakfast at 7am.' (have/has/haves)", answer:"has", hint:"'Has' is the third person form of 'have'", difficulty:"easy" },
      { type:"finish the sentence", question:"'We ___ (not/live) in London.'", answer:"don't live", hint:"Plural/I/you: negative = don't + base verb", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'Does he plays tennis?'", answer:"Does he play tennis?", hint:"After 'does', use the base form — no -s", difficulty:"easy" },
      { type:"choose correct grammar", question:"'My sister ___ English and French.' (study/studies/studys)", answer:"studies", hint:"Verb ending in consonant + -y → -ies", difficulty:"easy" },
      { type:"finish the sentence", question:"'___ you drink coffee? No, I ___ drink coffee.'", answer:"Do … don't", hint:"Question: Do + you; Negative: don't + base verb", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"Present Simple (Daily Routine)", spyTopic:"What You Are Doing Right Now", crewmatePrompt:"Tell the group about your normal day. Say what you do EVERY day. Example: 'I wake up at 7. I eat breakfast. I go to school. I study English. I go to bed at 11.' Use simple sentences.", spyPrompt:"Tell the group what you are doing RIGHT NOW or today. Example: 'Now I am sitting in class. I am listening to music. My teacher is talking. My friend is writing.' Say 3 or 4 things.", explanation:"Crewmates talk about what they ALWAYS do (wake up, eat, go). The spy talks about what is happening RIGHT NOW (am sitting, is talking).", spyGuessOptions:["What You Do Every Day","What You Are Doing Now","What You Did Yesterday","What You Will Do Tomorrow"] },
      { crewmateTopic:"Present Simple (Daily Routine)", spyTopic:"What You Don't Do", crewmatePrompt:"Tell the group about three things you do every day. Say sentences like: 'I eat breakfast every morning.', 'She goes to school.', 'He drinks coffee.' Keep it positive!", spyPrompt:"Tell the group about three things you DON'T do. Say sentences like: 'I don't eat meat.', 'She doesn't like coffee.', 'He doesn't play football.' Use 'don't' or 'doesn't'.", explanation:"Crewmates make positive sentences (I eat, she goes). The spy uses don't/doesn't to say what they do NOT do.", spyGuessOptions:["What You Do Every Day","What You Don't Do","What You Like","What You Did Yesterday"] },
      { crewmateTopic:"Present Simple (Daily Routine)", spyTopic:"How Often You Do Things", crewmatePrompt:"Describe your week. Say things like: 'I go to school every day.', 'She studies English.', 'He works in the morning.' Use simple verbs in the correct form.", spyPrompt:"Tell the group how often you do things. Use words like: ALWAYS, USUALLY, SOMETIMES, NEVER. Example: 'I always eat breakfast.', 'I sometimes watch TV.', 'I never go to bed late.'", explanation:"Crewmates say what they do (I go, she studies). The spy says HOW OFTEN they do it (always, sometimes, never).", spyGuessOptions:["What You Do Every Day","How Often You Do Things","What You Like","Where You Go"] },
      { crewmateTopic:"Present Simple (Daily Routine)", spyTopic:"What You Did Yesterday", crewmatePrompt:"Talk about your normal everyday routine. Say: 'Every morning I...', 'Every day she...', 'He usually...' Tell us 3 or 4 things you or someone you know does regularly.", spyPrompt:"Talk about what you did YESTERDAY. Say: 'Yesterday I woke up at 8.', 'I ate pizza for lunch.', 'I watched TV in the evening.', 'I went to bed at 10.' Tell us 3 or 4 things.", explanation:"Crewmates talk about what they do every day (present). The spy talks about what happened yesterday (past).", spyGuessOptions:["What You Do Every Day","What You Did Yesterday","What You Are Doing Now","What You Will Do"] },
    ],
    minefieldGrid: {
      topic: "Present Simple",
      instructions: "Students combine the subject (top) with the verb phrase (side) to make a correct present simple sentence — completing it with real details.",
      colLabels: ["I …", "She …", "He …", "We …", "They …"],
      rowLabels: ["… live in …", "… study … every day.", "… like / love …", "… don't / doesn't …", "… work / works in …"],
    },
    hotSeatWords: [
      {word:"routine"},{word:"habit"},{word:"daily"},{word:"regular"},
      {word:"always"},{word:"never"},{word:"usually"},{word:"sometimes"},
      {word:"breakfast"},{word:"school"},{word:"work"},{word:"sleep"},
      {word:"wake up"},{word:"exercise"},{word:"cook"},{word:"walk"},
      {word:"weekday"},{word:"weekend"},{word:"morning"},{word:"evening"},
    ],
    hotPotatoPrompts: [
      {prompt:"'She ___ to school.' (go — she)", answer:"goes"},
      {prompt:"'He ___ like coffee.' (negative)", answer:"doesn't"},
      {prompt:"'___ you speak English?' (question)", answer:"Do"},
      {prompt:"'___ she work here?' (question)", answer:"Does"},
      {prompt:"'They ___ (not) play football.'", answer:"don't"},
      {prompt:"'I ___ in Madrid.' (live)", answer:"live"},
      {prompt:"'She ___ early.' (wake up — she)", answer:"wakes up"},
      {prompt:"'He ___ English.' (teach — he)", answer:"teaches"},
      {prompt:"Present simple — for habits or now?", answer:"habits"},
      {prompt:"'Do' or 'does' for he/she/it?", answer:"does"},
      {prompt:"'She ___ a dog.' (have — she)", answer:"has"},
      {prompt:"'They ___ happy.' (be)", answer:"are"},
      {prompt:"Say something you do every day.", answer:"(free answer)", spanish:"Di algo que haces todos los días."},
      {prompt:"'He ___ TV every evening.' (watch)", answer:"watches"},
      {prompt:"'___ he like pizza?'", answer:"Does"},
      {prompt:"'She always ___ the bus.' (take)", answer:"takes"},
      {prompt:"'We ___ school on Sundays.' (not have)", answer:"don't have"},
      {prompt:"'I ___ coffee in the morning.' (drink)", answer:"drink"},
      {prompt:"'Does she ___?' — verb form after 'does'?", answer:"base form"},
      {prompt:"Say where someone you know works.", answer:"(free answer)", spanish:"Di dónde trabaja alguien que conoces."},
    ],
    auctionSentences: [
      { sentence:"She goes to school every day.", isCorrect:true, explanation:"Third person singular present simple: 'goes' is the correct form of 'go'." },
      { sentence:"She go to school every day.", isCorrect:false, explanation:"Third person singular needs -s: 'She goes', not 'She go'." },
      { sentence:"He doesn't like coffee.", isCorrect:true, explanation:"Third person singular negative: 'doesn't + base verb' is correct." },
      { sentence:"He don't like coffee.", isCorrect:false, explanation:"Use 'doesn't' for he/she/it, not 'don't'." },
      { sentence:"Does she speak English? Yes, she does.", isCorrect:true, explanation:"Third person singular question: 'Does + subject + base verb?' is correct." },
      { sentence:"Does she speaks English?", isCorrect:false, explanation:"After 'does', use the base verb without -s: 'speak', not 'speaks'." },
      { sentence:"We have lunch at one o'clock.", isCorrect:true, explanation:"'We have' is correct — no -s needed for we/you/they/I." },
      { sentence:"She studys English every day.", isCorrect:false, explanation:"Verbs ending in consonant + -y: change to -ies: 'studies', not 'studys'." },
      { sentence:"I don't understand the question.", isCorrect:true, explanation:"'I don't' is the correct negative form for first person." },
      { sentence:"I doesn't understand the question.", isCorrect:false, explanation:"'Doesn't' is only for he/she/it. Use 'I don't'." },
    ],
    cardTasks: [
      { task:"Say three things you do every day using the present simple." },
      { task:"Say three things your best friend does every day. Use 'he/she + verb'." },
      { task:"Make a negative sentence: 'I don't…' and 'She doesn't…'" },
      { task:"Ask your partner 'Do you…?' and answer their question too." },
      { task:"Say what time you wake up, eat breakfast, and go to school/work." },
      { task:"Use 'always', 'usually', and 'never' in three present simple sentences." },
      { task:"Ask your partner: 'Does your teacher speak Spanish?' Answer the question." },
      { task:"Make two sentences about a classmate: one positive, one negative." },
      { task:"Say five things your family does at the weekend." },
      { task:"Use 'he goes', 'she studies', and 'they play' in three sentences." },
      { task:"Ask three yes/no questions using 'Do you…?' to your partner." },
      { task:"Say what you do and don't do before school in the morning." },
      { task:"Describe your daily routine using at least five present simple sentences." },
      { task:"Make a sentence with 'Does he/she…?' and answer it yourself." },
      { task:"Use 'have/has' in a sentence about breakfast or lunch." },
      { task:"Say three things that are true about you using 'I + verb'." },
      { task:"Correct this sentence out loud: 'She go to the gym every day.'" },
      { task:"Use 'they study', 'we live', and 'I speak' in three sentences." },
      { task:"Ask your partner 'Do you like…?' — use three different nouns." },
      { task:"Say what your partner does and doesn't do, based on what they told you." },
    ],
  },

  likes_dislikes: {
    label: "Likes & Dislikes",
    category: "vocabulary",
    questions: [
      { type:"choose correct grammar", question:"'I like ___ music.' (listen/listening/to listening)", answer:"listening to", hint:"'Like' + gerund (-ing)", difficulty:"easy" },
      { type:"finish the sentence", question:"'She loves ___ (cook) for her family.'", answer:"cooking", hint:"'Love' is followed by -ing", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I like play football.'", answer:"I like playing football.", hint:"'Like' + verb-ing", difficulty:"easy" },
      { type:"choose correct grammar", question:"'He ___ swimming.' (love/loves/loving)", answer:"loves", hint:"Third person singular: 'loves'", difficulty:"easy" },
      { type:"finish the sentence", question:"'Do you like ___? Yes, I love it!'", answer:"it / (any activity)", hint:"'Do you like + noun/gerund?'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She doesn't likes chocolate.'", answer:"She doesn't like chocolate.", hint:"After 'doesn't', use the base form", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ you like spicy food?' (Are/Do/Does)", answer:"Do", hint:"Likes/dislikes questions with 'you' use 'do'", difficulty:"easy" },
      { type:"finish the sentence", question:"'I don't like ___ (get) up early.'", answer:"getting", hint:"'Don't like' + verb-ing", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'He hate vegetables.'", answer:"He hates vegetables.", hint:"Third person singular: 'hates'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'I ___ horror films. They're scary!' (hate/hates/hating)", answer:"hate", hint:"First person: 'hate' — no -s", difficulty:"easy" },
      { type:"finish the sentence", question:"'She ___ (not/like) watching sport on TV.'", answer:"doesn't like", hint:"Third person negative + like", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'Do she like pasta?'", answer:"Does she like pasta?", hint:"Third person question: 'does'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'We really ___ pizza!' (enjoy/enjoys/enjoying)", answer:"enjoy", hint:"We/I/you/they: 'enjoy' — no -s", difficulty:"easy" },
      { type:"finish the sentence", question:"'I ___ (love) going to the beach in summer.'", answer:"love", hint:"'I love' — first person, no -s", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She likes to listened to music.'", answer:"She likes to listen to music. / She likes listening to music.", hint:"'Like to + infinitive' or 'like + -ing'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'He ___ football, but he ___ tennis.' (likes/like … hates/hate)", answer:"likes … hates", hint:"Third person singular -s for both verbs", difficulty:"easy" },
      { type:"finish the sentence", question:"'___ (Do/Does) your sister like reading?'", answer:"Does", hint:"Your sister = third person → 'Does'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I doesn't like cold weather.'", answer:"I don't like cold weather.", hint:"'I' uses 'don't', not 'doesn't'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'They ___ playing video games after school.' (enjoy/enjoys/enjoyng)", answer:"enjoy", hint:"They: no -s on the verb", difficulty:"easy" },
      { type:"finish the sentence", question:"'What ___ you like doing at the weekend?'", answer:"do", hint:"'What do you like doing?' — use 'do' with 'you'", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"Likes & Dislikes", spyTopic:"What You Want to Do", crewmatePrompt:"Tell the group what you like and don't like. Say: 'I love pizza!', 'I like football.', 'I don't like horror films.', 'I hate waking up early!' Use LIKE, LOVE, DON'T LIKE, or HATE.", spyPrompt:"Tell the group what you WANT to do. Say: 'I want to eat pizza tonight.', 'I want to go to the beach.', 'I want to watch a film.' Use 'I WANT TO + verb'.", explanation:"Crewmates say what they like or hate (love, hate, don't like). The spy says what they WANT to do (I want to...).", spyGuessOptions:["What You Like and Hate","What You Want to Do","What You Do Every Day","What You Did Yesterday"] },
      { crewmateTopic:"Likes & Dislikes", spyTopic:"What You Think About Things", crewmatePrompt:"Tell the group what you like or don't like about food, music, sport, or films. Use: 'I love...!', 'I really like...', 'I don't like...', 'I hate...'. Say at least 3 things.", spyPrompt:"Tell the group what you think about food, music, sport, or films. Say: 'I think pizza is delicious!', 'I think football is boring.', 'I think English is fun!' Use 'I THINK... IS...'", explanation:"Crewmates say 'I love/like/hate'. The spy says 'I think... is...' to give an opinion.", spyGuessOptions:["What You Like and Don't Like","What You Think About Things","What You Want","What You Do Every Day"] },
      { crewmateTopic:"Likes & Dislikes", spyTopic:"What You Prefer", crewmatePrompt:"Tell the group about your likes and dislikes using LOVE, LIKE, DON'T LIKE, HATE + -ING. Example: 'I love swimming.', 'She likes cooking.', 'He hates cleaning.' Say 3 sentences.", spyPrompt:"Tell the group what you prefer! Compare two things. Example: 'I prefer tea to coffee.', 'I like dogs more than cats.', 'Pizza is better than pasta for me.' Say 2 or 3 sentences.", explanation:"Crewmates say 'I love/like + -ing'. The spy compares two things using 'prefer' or 'more than'.", spyGuessOptions:["What You Like (+ing)","What You Prefer (comparing)","What You Want","What You Did Yesterday"] },
      { crewmateTopic:"Likes & Dislikes", spyTopic:"Suggesting Things to Do", crewmatePrompt:"Tell the group what you and your friends like doing. Say: 'I like watching films.', 'My friend loves playing football.', 'We don't like studying.' Tell us about 3 activities.", spyPrompt:"Suggest activities to do together! Say: 'Why don't we watch a film?', 'Let's go to the park!', 'How about pizza tonight?', 'We should play football.' Give 2 or 3 suggestions.", explanation:"Crewmates say what they like doing. The spy makes suggestions for what to do together.", spyGuessOptions:["What You Like Doing","Suggesting Activities","What You Want to Do","What You Did Yesterday"] },
    ],
    minefieldGrid: {
      topic: "Likes & Dislikes",
      instructions: "Students combine the subject (top) with the like/dislike expression (side) to make a full sentence — adding their own activity or thing.",
      colLabels: ["I …", "She …", "He …", "We …", "They …"],
      rowLabels: ["… love/loves …ing", "… like/likes …ing", "… don't/doesn't like …", "… hate/hates …ing", "… enjoy/enjoys …"],
    },
    hotSeatWords: [
      {word:"pizza"},{word:"chocolate"},{word:"football"},{word:"music"},
      {word:"rain"},{word:"spiders"},{word:"Mondays"},{word:"homework"},
      {word:"swimming"},{word:"dancing"},{word:"singing"},{word:"cooking"},
      {word:"noise"},{word:"waiting"},{word:"dogs"},{word:"cats"},
      {word:"summer"},{word:"winter"},{word:"maths"},{word:"fast food"},
    ],
    hotPotatoPrompts: [
      {prompt:"'I love ___ing.' (name an activity)", answer:"(free answer)"},
      {prompt:"'She ___ football.' (like — she)", answer:"likes"},
      {prompt:"'I don't ___ getting up early.'", answer:"like"},
      {prompt:"'Like' + gerund: 'I like ___ing.' True or false?", answer:"true"},
      {prompt:"'He ___ horror films.' (hate)", answer:"hates"},
      {prompt:"Name something you love.", answer:"(free answer)", spanish:"Nombra algo que te encanta."},
      {prompt:"Name something you hate.", answer:"(free answer)", spanish:"Nombra algo que odias."},
      {prompt:"'___ you like spiders?' (question)", answer:"Do"},
      {prompt:"'She ___ coffee.' (not like)", answer:"doesn't like"},
      {prompt:"'I enjoy ___.' (name something)", answer:"(free — swimming, reading)"},
      {prompt:"'Love' is stronger than 'like' — true or false?", answer:"true"},
      {prompt:"'I ___ cleaning.' (hate)", answer:"hate"},
      {prompt:"'He loves ___ing.' (cook)", answer:"cooking"},
      {prompt:"'___ he like sport?' (question)", answer:"Does"},
      {prompt:"Name a food you love.", answer:"(free answer)", spanish:"Nombra una comida que te encanta."},
      {prompt:"Name a subject you don't like.", answer:"(free answer)", spanish:"Nombra una asignatura que no te gusta."},
      {prompt:"'I ___ like waiting.' (not)", answer:"don't"},
      {prompt:"'They ___ the film.' (not enjoy)", answer:"didn't enjoy"},
      {prompt:"Say what your best friend loves.", answer:"(free answer)", spanish:"Di qué le encanta a tu mejor amigo/a."},
      {prompt:"'I can't stand ___.' (name something)", answer:"(free answer)"},
    ],
    auctionSentences: [
      { sentence:"I like listening to music on the way to school.", isCorrect:true, explanation:"'Like + gerund (-ing)' is correct. 'Listening to music' is correctly formed." },
      { sentence:"I like listen to music on the way to school.", isCorrect:false, explanation:"After 'like', use the gerund: 'listening', not the base verb 'listen'." },
      { sentence:"She loves cooking for her family.", isCorrect:true, explanation:"'Love + gerund' is correct. Third person singular: 'loves'." },
      { sentence:"She love cooking for her family.", isCorrect:false, explanation:"Third person singular needs -s: 'loves', not 'love'." },
      { sentence:"Do you like pizza? Yes, I love it!", isCorrect:true, explanation:"'Do you like + noun?' is correct. 'I love it' is a natural, enthusiastic reply." },
      { sentence:"Does he like horror films? No, he hates them!", isCorrect:true, explanation:"Third person singular question: 'Does he like?' is correct. 'He hates' is correct." },
      { sentence:"He hate vegetables — he never eats them.", isCorrect:false, explanation:"Third person singular: 'hates', not 'hate'." },
      { sentence:"I doesn't like getting up early.", isCorrect:false, explanation:"'I' uses 'don't', not 'doesn't'. Correct: 'I don't like getting up early'." },
      { sentence:"We enjoy playing football at the weekend.", isCorrect:true, explanation:"'Enjoy + gerund' is correct. 'We enjoy' — no -s needed for 'we'." },
      { sentence:"What do you like doing at the weekend?", isCorrect:true, explanation:"'What do you like doing?' is a correct present simple question." },
    ],
    cardTasks: [
      { task:"Say three things you love doing and one thing you hate." },
      { task:"Ask your partner 'Do you like…?' about three different activities." },
      { task:"Say: 'I like…, but I don't like…' — give one example of each." },
      { task:"Describe what your best friend likes and dislikes." },
      { task:"Use 'love', 'like', 'don't like', and 'hate' in four sentences about food." },
      { task:"Ask 'Does she/he like…?' and answer for a classmate." },
      { task:"Say three activities you enjoy doing at the weekend." },
      { task:"Use 'I enjoy…ing' to talk about your favourite hobby." },
      { task:"Make a sentence: 'I like… but I hate…'" },
      { task:"Say what you liked as a child and what you like now." },
      { task:"Use 'Do you like…?' to find out two things your partner enjoys." },
      { task:"Say three things your family likes and one thing they don't like." },
      { task:"Use 'She loves…ing' to describe a famous person's hobby." },
      { task:"Make a true sentence using 'We all enjoy…' about your class." },
      { task:"Ask your partner 'What do you like doing at the weekend?'" },
      { task:"Say 'I don't like…, but I love…' — contrast two activities." },
      { task:"Use 'really like', 'quite like', and 'don't really like' in three sentences." },
      { task:"Describe your food likes and dislikes using at least four sentences." },
      { task:"Use 'he/she likes…ing' to describe a classmate's hobby." },
      { task:"Make a sentence using 'enjoy' about something you do with friends." },
    ],
  },

  what_do_you_do: {
    label: "What do you do? + Professions",
    category: "vocabulary",
    questions: [
      { type:"choose correct grammar", question:"'What ___ you do?' 'I'm a teacher.' (do/are/is)", answer:"do", hint:"'What do you do?' asks about someone's job", difficulty:"easy" },
      { type:"finish the sentence", question:"'She is ___ nurse. She works in a hospital.'", answer:"a", hint:"Use 'a' before a job that starts with a consonant sound", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'He is doctor.'", answer:"He is a doctor.", hint:"Use the article 'a' before a job/profession", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ does your father do?' 'He's an engineer.' (What/Where/Who)", answer:"What", hint:"'What does he/she do?' asks about their job", difficulty:"easy" },
      { type:"finish the sentence", question:"'I am ___ engineer. I work in an office.'", answer:"an", hint:"Use 'an' before a vowel sound (engineer starts with 'e')", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'What do he do?'", answer:"What does he do?", hint:"Third person question: 'does', not 'do'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'She is ___ actor. She works in films.' (a/an/the)", answer:"an", hint:"'Actor' starts with a vowel sound — use 'an'", difficulty:"easy" },
      { type:"finish the sentence", question:"'___ does she work? She works in a school.'", answer:"Where", hint:"'Where does she work?' asks about location", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I am a police.'", answer:"I am a police officer.", hint:"'Police officer' is the correct job title", difficulty:"easy" },
      { type:"choose correct grammar", question:"'He works ___ a hospital.' (at/in/on)", answer:"in", hint:"'Works in a hospital' — use 'in' for buildings", difficulty:"easy" },
      { type:"finish the sentence", question:"'She is a teacher. She ___ in a school.'", answer:"works / teaches", hint:"Describe what she does at her job", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'What does he works?'", answer:"What does he do?", hint:"'What does he do?' — don't use 'works' in the question", difficulty:"easy" },
      { type:"choose correct grammar", question:"'My mother is ___ artist. She paints.' (a/an/the)", answer:"an", hint:"'Artist' starts with a vowel — use 'an'", difficulty:"easy" },
      { type:"finish the sentence", question:"'He is a ___ . He takes care of sick animals.'", answer:"vet / veterinarian", hint:"A vet is a doctor for animals", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She a nurse. She works in a hospital.'", answer:"She is a nurse. She works in a hospital.", hint:"Don't forget the verb 'is'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ do you work?' 'I work in a café.' (Where/What/When)", answer:"Where", hint:"'Where do you work?' asks about location", difficulty:"easy" },
      { type:"finish the sentence", question:"'What ___ your brother do? He's a chef.'", answer:"does", hint:"Third person question: 'does'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'He is an cook.'", answer:"He is a cook.", hint:"'Cook' starts with a consonant — use 'a'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'She is a lawyer. ___ works in a law firm.' (She/Her/His)", answer:"She", hint:"Subject pronoun for a female: 'she'", difficulty:"easy" },
      { type:"finish the sentence", question:"'A pilot ___ aeroplanes.'", answer:"flies / drives", hint:"Describe what a pilot does", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"Jobs & Professions", spyTopic:"Daily Routines", crewmatePrompt:"Tell the group about different jobs. Say: 'A doctor works in a hospital.', 'A teacher works in a school.', 'A chef works in a restaurant.' Tell us about 3 jobs. Remember: say 'a' or 'an' before the job!", spyPrompt:"Tell the group about what people do every day. Say: 'In the morning I wake up at 7.', 'I eat breakfast.', 'I go to work/school.', 'In the evening I watch TV.' Tell us your daily routine!", explanation:"Crewmates name jobs and places (a doctor in a hospital). The spy describes a daily routine (wake up, eat, go) instead.", spyGuessOptions:["Jobs and Workplaces","Daily Routine","What People Can Do","Places in Town"] },
      { crewmateTopic:"Jobs & Professions", spyTopic:"Places in Town", crewmatePrompt:"Say what job different people have and where they work. Example: 'She is a nurse. She works in a hospital.', 'He is a pilot. He works at an airport.', 'She is a teacher. She works in a school.' Tell us about 2 or 3 jobs.", spyPrompt:"Tell the group about places in your town! Say: 'There is a big hospital.', 'The school is near my house.', 'There is a restaurant on my street.', 'I go to the supermarket.' Tell us about 2 or 3 places.", explanation:"Crewmates name a job AND its workplace together. The spy describes places in town without mentioning jobs.", spyGuessOptions:["Jobs and Where People Work","Places in Town","Daily Routine","What People Like"] },
      { crewmateTopic:"Jobs & Professions", spyTopic:"What People Can Do", crewmatePrompt:"Tell the group about different jobs. Say the job name and what the person does. Example: 'A chef cooks food.', 'A doctor helps sick people.', 'A teacher teaches students.' Use 'a/an' before the job.", spyPrompt:"Tell the group what you and people you know CAN do. Say: 'I can speak English.', 'My friend can cook very well.', 'My teacher can speak three languages.', 'I can't drive.' Use CAN or CAN'T.", explanation:"Crewmates name jobs and say what that person does at work. The spy uses 'can/can't' to talk about abilities.", spyGuessOptions:["Jobs and What People Do","What People Can/Can't Do","Daily Routine","Where People Work"] },
      { crewmateTopic:"Jobs & Professions", spyTopic:"Asking About Jobs", crewmatePrompt:"Ask and answer about jobs! Ask a classmate: 'What do you do?' They answer: 'I am a student!' or 'I want to be a doctor!' Also say: 'Where do you work/study?' Try with 2 or 3 people.", spyPrompt:"Ask your classmates questions about their life! Ask: 'Do you like school?', 'What time do you wake up?', 'Do you have a pet?', 'Do you like sport?' Ask 2 or 3 different questions.", explanation:"Crewmates ask 'What do you do?' and talk about jobs. The spy asks general questions about daily life instead.", spyGuessOptions:["Asking About Jobs","Asking About Daily Life","What People Like","Where People Are From"] },
    ],
    minefieldGrid: {
      topic: "What do you do? + Professions",
      instructions: "Students combine the question (top) with the job or workplace (side) to give a full, natural answer — adding real or imaginary details.",
      colLabels: ["What do you do?", "Where does she work?", "What does he do?", "Is she a…?", "What do they do?"],
      rowLabels: ["I'm a / an …", "She works in a …", "He is a … He …", "Yes, she is a … She …", "They are … They work …"],
    },
    hotSeatWords: [
      {word:"teacher"},{word:"doctor"},{word:"nurse"},{word:"chef"},
      {word:"pilot"},{word:"police officer"},{word:"firefighter"},{word:"dentist"},
      {word:"artist"},{word:"footballer"},{word:"singer"},{word:"actor"},
      {word:"driver"},{word:"farmer"},{word:"shop assistant"},{word:"waiter"},
      {word:"hospital"},{word:"school"},{word:"restaurant"},{word:"office"},
    ],
    hotPotatoPrompts: [
      {prompt:"'___ do you do?' (asking job)", answer:"What"},
      {prompt:"'I ___ a teacher.' (to be)", answer:"am"},
      {prompt:"'She is ___ nurse.' (article)", answer:"a"},
      {prompt:"'He is ___ engineer.' (article)", answer:"an"},
      {prompt:"Where does a doctor work?", answer:"hospital"},
      {prompt:"Where does a chef work?", answer:"restaurant / kitchen"},
      {prompt:"Where does a teacher work?", answer:"school"},
      {prompt:"'I work ___ a hospital.' (preposition)", answer:"in"},
      {prompt:"Name a job that helps sick people.", answer:"doctor / nurse", spanish:"Nombra un trabajo que ayuda a los enfermos."},
      {prompt:"Name a job that flies planes.", answer:"pilot", spanish:"Nombra un trabajo que conduce aviones."},
      {prompt:"'She ___ for a bank.' (work)", answer:"works"},
      {prompt:"'What does he ___?' (asking job)", answer:"do"},
      {prompt:"Name a job that teaches people.", answer:"teacher", spanish:"Nombra un trabajo que enseña a personas."},
      {prompt:"'___ is your job?' (question word)", answer:"What"},
      {prompt:"'He is a ___.' Name a job with uniform.", answer:"police officer / nurse / soldier"},
      {prompt:"Name a job that makes food.", answer:"chef / baker / cook", spanish:"Nombra un trabajo relacionado con la comida."},
      {prompt:"'Do you like your ___?' (asking about job)", answer:"job"},
      {prompt:"Name a job in a hospital that isn't a doctor.", answer:"nurse", spanish:"Nombra un trabajo en un hospital que no es médico."},
      {prompt:"'A' or 'an' before 'artist'?", answer:"an"},
      {prompt:"Say your dream job in a sentence.", answer:"I want to be a ___", spanish:"Di cuál es tu trabajo soñado en una frase."},
    ],
    auctionSentences: [
      { sentence:"What do you do? I'm a teacher.", isCorrect:true, explanation:"'What do you do?' correctly asks about someone's job. 'I'm a teacher' is correct." },
      { sentence:"What do you do? I'm teacher.", isCorrect:false, explanation:"Use the article 'a' before a job: 'I'm a teacher'." },
      { sentence:"She is an engineer. She works in an office.", isCorrect:true, explanation:"'An engineer' — 'an' before a vowel sound. 'Works in an office' is correct." },
      { sentence:"She is a engineer. She works in an office.", isCorrect:false, explanation:"'Engineer' starts with a vowel — use 'an engineer'." },
      { sentence:"What does he do? He's a doctor.", isCorrect:true, explanation:"Third person singular question: 'What does he do?' is correct." },
      { sentence:"What do he do? He's a doctor.", isCorrect:false, explanation:"Third person singular: 'What does he do?' — use 'does', not 'do'." },
      { sentence:"My father is a pilot. He flies aeroplanes.", isCorrect:true, explanation:"'A pilot' is correct. 'He flies' is third person singular present simple." },
      { sentence:"I am an cook. I work in a restaurant.", isCorrect:false, explanation:"'Cook' starts with a consonant — use 'a cook', not 'an cook'." },
      { sentence:"Where does she work? She works in a school.", isCorrect:true, explanation:"'Where does she work?' is a correct third person singular question." },
      { sentence:"He is doctor. He works in a hospital.", isCorrect:false, explanation:"Use the article 'a' before a profession: 'He is a doctor'." },
    ],
    cardTasks: [
      { task:"Say what you do (or want to do). Use 'I am a / an…'" },
      { task:"Describe a family member's job: 'My [relation] is a/an… She/He works in…'" },
      { task:"Ask your partner 'What do you do?' and answer their question." },
      { task:"Describe three different jobs using 'A … works in/at…'" },
      { task:"Use 'What does he/she do?' to ask about an imaginary person." },
      { task:"Say the jobs of five famous people using 'He/She is a/an…'" },
      { task:"Ask your partner 'Where do you work?' and answer for yourself." },
      { task:"Use 'a' and 'an' correctly: name three jobs with 'a' and two with 'an'." },
      { task:"Describe your dream job using present simple: 'I want to be a/an… I would…'" },
      { task:"Say what a doctor, teacher, and pilot do every day." },
      { task:"Ask 'Does your mother/father work?' and give an answer." },
      { task:"Describe a job without saying the name — your partner guesses." },
      { task:"Use 'What does she do?' and answer with a full sentence." },
      { task:"Say three jobs that work in a hospital." },
      { task:"Make a sentence: 'She is an … and she …s every day.'" },
      { task:"Ask your partner three questions about their job or future job." },
      { task:"Say what a chef does using three present simple sentences." },
      { task:"Describe your teacher's job using 'She/He is a teacher. She/He…'" },
      { task:"Use 'They are…s. They work in…' to describe two people with the same job." },
      { task:"Name five jobs and say whether each uses 'a' or 'an'." },
    ],
  },

  hobbies: {
    label: "Hobbies",
    category: "vocabulary",
    questions: [
      { type:"choose correct grammar", question:"'What ___ you do in your free time?' (do/are/does)", answer:"do", hint:"'What do you do in your free time?' asks about habits", difficulty:"easy" },
      { type:"finish the sentence", question:"'I love ___ (play) video games after school.'", answer:"playing", hint:"'Love' + gerund (-ing)", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'My hobby is play the guitar.'", answer:"My hobby is playing the guitar.", hint:"After 'is', use the gerund (-ing) form", difficulty:"easy" },
      { type:"choose correct grammar", question:"'She enjoys ___ in her free time.' (swim/swimming/to swim)", answer:"swimming", hint:"'Enjoy' is always followed by -ing", difficulty:"easy" },
      { type:"finish the sentence", question:"'He is interested ___ photography.'", answer:"in", hint:"'Interested in' + noun or gerund", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I go to hike every weekend.'", answer:"I go hiking every weekend.", hint:"'Go + verb-ing' for outdoor activities", difficulty:"easy" },
      { type:"choose correct grammar", question:"'They go ___ every Saturday morning.' (fish/fishing/to fish)", answer:"fishing", hint:"'Go + -ing' for sports/outdoor hobbies", difficulty:"easy" },
      { type:"finish the sentence", question:"'What ___ your hobby? I like painting.'", answer:"is / 's", hint:"'What is your hobby?' — use 'is' (singular)", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She like to read books in her free time.'", answer:"She likes to read books in her free time.", hint:"Third person singular: 'likes'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'I go ___ at the pool near my house.' (swim/swims/swimming)", answer:"swimming", hint:"'Go swimming' — activity after 'go'", difficulty:"easy" },
      { type:"finish the sentence", question:"'In my ___ time, I watch films and cook.'", answer:"free / spare", hint:"'Free time' or 'spare time' = time when you're not working", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'His hobby are collecting stamps.'", answer:"His hobby is collecting stamps.", hint:"'Hobby' is singular — use 'is'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'She ___ painting and drawing in her free time.' (like/likes/liking)", answer:"likes", hint:"Third person singular: 'likes'", difficulty:"easy" },
      { type:"finish the sentence", question:"'I love ___ (watch) sport on TV.'", answer:"watching", hint:"'Love' + verb-ing", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'He go cycling every Sunday.'", answer:"He goes cycling every Sunday.", hint:"Third person singular: 'goes cycling'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'What are ___ hobbies?' 'I like cooking and reading.' (your/you/yours)", answer:"your", hint:"Possessive adjective before a noun: 'your hobbies'", difficulty:"easy" },
      { type:"finish the sentence", question:"'She ___ (go) running every morning before school.'", answer:"goes", hint:"Third person singular: 'goes running'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I interested in learning languages.'", answer:"I am interested in learning languages.", hint:"Don't forget 'am' — 'I am interested in'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'He spends his free time ___ models.' (build/building/to build)", answer:"building", hint:"'Spend time + verb-ing'", difficulty:"easy" },
      { type:"finish the sentence", question:"'We go ___ (cycle) on weekends. We love it!'", answer:"cycling", hint:"'Go + verb-ing' for physical activities", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"Hobbies", spyTopic:"Sports", crewmatePrompt:"Tell the group about your hobbies! Use these words: GO + -ING (go swimming, go cycling), PLAY + sport (play football, play tennis), or MY HOBBY IS + -ING. Say 2 or 3 hobbies you have.", spyPrompt:"Tell the group about sports! Name 2 or 3 sports you like or watch. Say: 'I play football.', 'I watch tennis on TV.', 'My favourite sport is basketball.', 'I go running every day.'", explanation:"Crewmates say their hobbies (go swimming, my hobby is). The spy talks specifically about sports (I play, I watch).", spyGuessOptions:["Hobbies (go/play)","Sports","What You Like Doing","Daily Activities"] },
      { crewmateTopic:"Hobbies", spyTopic:"What You Like and Don't Like", crewmatePrompt:"Tell the group your hobbies! Say: 'I GO swimming.', 'I PLAY the guitar.', 'My hobby IS painting.' or 'I collect stamps.' Use GO, PLAY, or MY HOBBY IS to talk about 2 or 3 activities.", spyPrompt:"Tell the group what you LIKE and DON'T LIKE. Say: 'I LOVE cooking!', 'I LIKE reading.', 'I DON'T LIKE cleaning.', 'I HATE getting up early!' Tell us 3 things you feel strongly about.", explanation:"Crewmates name their hobbies (go + -ing, play + sport). The spy says what they love/like/hate without naming a specific hobby.", spyGuessOptions:["Hobbies (go/play)","What You Love and Hate","Sports","Daily Routine"] },
      { crewmateTopic:"Hobbies", spyTopic:"Weekend Plans", crewmatePrompt:"Tell the group about hobbies you do in your free time. Say when you do them. Example: 'At the weekend I go cycling.', 'In the evening I play video games.', 'On Sundays I go hiking.' Tell us 2 or 3.", spyPrompt:"Tell the group what you are GOING TO DO this weekend! Say: 'This weekend I am going to watch a film.', 'I am going to visit my family.', 'We are going to eat pizza.' Say 2 or 3 plans!", explanation:"Crewmates say what hobbies they DO (go, play). The spy says what they ARE GOING TO DO (going to + verb).", spyGuessOptions:["Hobbies You Do Regularly","Plans for the Weekend","Sports","What You Like Doing"] },
      { crewmateTopic:"Hobbies", spyTopic:"What You Can Do", crewmatePrompt:"Tell the group about 2 or 3 of your hobbies. Say: 'I love going to the cinema.', 'My hobby is drawing.', 'I go fishing every weekend.', 'I play the piano.' Use the correct hobby words.", spyPrompt:"Tell the group what you CAN do well or CAN'T do! Say: 'I can swim very well.', 'I can play the guitar a little.', 'I can't drive.', 'I can speak two languages.' Tell us 3 things!", explanation:"Crewmates say what their hobbies are. The spy says what they can or can't do.", spyGuessOptions:["Your Hobbies","What You Can and Can't Do","Sports","What You Like"] },
    ],
    minefieldGrid: {
      topic: "Hobbies",
      instructions: "Students combine the subject (top) with the hobby expression (side) to make a full sentence — adding their own hobby or details.",
      colLabels: ["I …", "She …", "He …", "We …", "My friend …"],
      rowLabels: ["… love/loves …ing", "… go/goes …ing", "… am/is interested in …", "… spend/spends time …ing", "… don't/doesn't like …ing"],
    },
    hotSeatWords: [
      {word:"swimming"},{word:"cycling"},{word:"fishing"},{word:"cooking"},
      {word:"guitar"},{word:"painting"},{word:"reading"},{word:"gaming"},
      {word:"dancing"},{word:"running"},{word:"football"},{word:"tennis"},
      {word:"shopping"},{word:"travelling"},{word:"singing"},{word:"drawing"},
      {word:"chess"},{word:"gardening"},{word:"hiking"},{word:"photography"},
    ],
    hotPotatoPrompts: [
      {prompt:"'I go ___.' (swimming — use go + -ing)", answer:"swimming"},
      {prompt:"'I play ___.' (name a sport)", answer:"(football / tennis / chess)"},
      {prompt:"'My hobby is ___.' (complete it)", answer:"(free answer)"},
      {prompt:"'I go ___ing at weekends.' (cycle)", answer:"cycling"},
      {prompt:"'She plays the ___.' (instrument)", answer:"(guitar / piano / violin)"},
      {prompt:"'Go' + sport or 'play' + sport? Swimming?", answer:"go swimming"},
      {prompt:"'Play' + sport or 'go' + sport? Football?", answer:"play football"},
      {prompt:"Name a hobby you do inside.", answer:"(free answer)", spanish:"Nombra un hobby que haces en casa."},
      {prompt:"Name a hobby you do outside.", answer:"(free answer)", spanish:"Nombra un hobby que haces al aire libre."},
      {prompt:"'I ___ reading.' (love)", answer:"love"},
      {prompt:"'He goes ___.' (fish — use go + -ing)", answer:"fishing"},
      {prompt:"'She plays ___.' (chess)", answer:"chess"},
      {prompt:"'In my free time I ___.'", answer:"(free answer)"},
      {prompt:"'Play' or 'go'? Tennis?", answer:"play tennis"},
      {prompt:"'Play' or 'go'? Skiing?", answer:"go skiing"},
      {prompt:"Name a hobby that uses a screen.", answer:"(gaming / watching films / photography)"},
      {prompt:"Name a hobby that uses your hands.", answer:"(cooking / painting / knitting)"},
      {prompt:"'She goes ___ in the mornings.' (run)", answer:"running"},
      {prompt:"'My favourite ___ is reading.' (hobby word)", answer:"hobby"},
      {prompt:"Say what you do at the weekend.", answer:"(free answer)", spanish:"Di qué haces el fin de semana."},
    ],
    auctionSentences: [
      { sentence:"My hobby is playing the guitar.", isCorrect:true, explanation:"'Hobby is + gerund' is correct. 'Playing' is the gerund form of 'play'." },
      { sentence:"My hobby is play the guitar.", isCorrect:false, explanation:"After 'is', use the gerund (-ing): 'playing the guitar'." },
      { sentence:"She goes running every morning before school.", isCorrect:true, explanation:"'Goes running' — 'go + gerund' for physical activities. Third person singular 'goes'." },
      { sentence:"She go running every morning before school.", isCorrect:false, explanation:"Third person singular: 'goes', not 'go'." },
      { sentence:"I go hiking every weekend. I love it!", isCorrect:true, explanation:"'Go hiking' is the correct form. 'I love it' is a natural, enthusiastic addition." },
      { sentence:"I go to hike every weekend. I love it!", isCorrect:false, explanation:"'Go + gerund': 'go hiking' — not 'go to hike'." },
      { sentence:"He is interested in learning new languages.", isCorrect:true, explanation:"'Interested in + gerund' is correct. 'Learning' is the gerund form." },
      { sentence:"He is interested on learning new languages.", isCorrect:false, explanation:"The correct preposition is 'interested in', not 'interested on'." },
      { sentence:"In my free time, I like watching films and cooking.", isCorrect:true, explanation:"'Like + gerund' is correct for both activities." },
      { sentence:"His hobbies is cooking and painting.", isCorrect:false, explanation:"'Hobbies' is plural — use 'are': 'His hobbies are cooking and painting'." },
    ],
    cardTasks: [
      { task:"Say three hobbies you have and one you would like to try." },
      { task:"Ask your partner 'What do you do in your free time?'" },
      { task:"Use 'go + -ing' to describe two outdoor activities you enjoy or want to try." },
      { task:"Say: 'My hobby is … I do it every …'" },
      { task:"Describe a classmate's hobby using 'He/She goes… / likes…ing'" },
      { task:"Use 'interested in' to talk about something you enjoy learning about." },
      { task:"Say what you do at the weekend using three different verbs." },
      { task:"Ask your partner 'Do you like…ing?' about three different hobbies." },
      { task:"Use 'spend time + -ing' to describe your favourite free-time activity." },
      { task:"Compare your hobbies with your partner: 'I like… but you like…'" },
      { task:"Say five hobbies and use 'go', 'play', or 'do' with each one correctly." },
      { task:"Describe someone famous and their hobbies: 'He/She loves…'" },
      { task:"Use 'In my free time, I…' to start three sentences about yourself." },
      { task:"Ask 'What are your hobbies?' and answer with three full sentences." },
      { task:"Say one hobby you love and one you hate, with reasons." },
      { task:"Use 'We both love…ing' to describe a shared hobby with a friend." },
      { task:"Make a sentence: 'My favourite hobby is… because…'" },
      { task:"Describe a hobby you had as a child using 'I used to…'" },
      { task:"Ask your partner about three activities: 'Do you go…ing?'" },
      { task:"Use 'He spends his free time…ing' to describe a friend or family member." },
    ],
  },

  personality: {
    label: "Personality Adjectives",
    category: "vocabulary",
    questions: [
      { type:"choose correct grammar", question:"'What ___ she like?' 'She's very friendly.' (is/does/are)", answer:"is", hint:"'What is she like?' asks about personality", difficulty:"easy" },
      { type:"finish the sentence", question:"'He is very ___ — he always helps his friends.'", answer:"kind / generous / friendly", hint:"Positive personality adjective", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'What does she like? She is friendly.'", answer:"What is she like? She is friendly.", hint:"'What is she like?' not 'What does she like?' — the second asks about preferences", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ is he like?' 'He's very funny and kind.' (What/How/Who)", answer:"What", hint:"'What is he like?' describes personality", difficulty:"easy" },
      { type:"finish the sentence", question:"'She is very ___ — she never stops talking!'", answer:"talkative / chatty", hint:"Adjective for someone who talks a lot", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'He is a very kindly person.'", answer:"He is a very kind person.", hint:"'Kind' is the adjective — 'kindly' is an adverb", difficulty:"easy" },
      { type:"choose correct grammar", question:"'She ___ very shy. She doesn't talk much.' (is/are/am)", answer:"is", hint:"Third person singular: 'is'", difficulty:"easy" },
      { type:"finish the sentence", question:"'My brother is very ___. He makes everyone laugh.'", answer:"funny / humorous / amusing", hint:"Adjective for someone who is entertaining", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'What is she like? She like meeting new people.'", answer:"What is she like? She likes meeting new people.", hint:"Third person singular: 'likes'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'He is very ___. He never arrives on time.' (punctual/lazy/talkative)", answer:"lazy", hint:"Lazy = doesn't do things, including being on time", difficulty:"easy" },
      { type:"finish the sentence", question:"'She is very ___. She works hard and never gives up.'", answer:"hardworking / determined / ambitious", hint:"Positive personality adjective for effort", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'What is your best friend like? She is a friendly.'", answer:"What is your best friend like? She is friendly.", hint:"Don't use 'a' before a standalone adjective", difficulty:"easy" },
      { type:"choose correct grammar", question:"'They are very ___. They give money to charity.' (generous/shy/impatient)", answer:"generous", hint:"Generous = happy to give or share", difficulty:"easy" },
      { type:"finish the sentence", question:"'What is your teacher ___?' 'She's strict but fair.'", answer:"like", hint:"'What is she like?' — the question word here is 'like'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'He is boring person.'", answer:"He is a boring person.", hint:"Use the article 'a' before adjective + noun", difficulty:"easy" },
      { type:"choose correct grammar", question:"'She is very ___. She gets angry quickly.' (patient/impatient/generous)", answer:"impatient", hint:"Impatient = can't wait, gets frustrated easily", difficulty:"easy" },
      { type:"finish the sentence", question:"'He is very ___. He always tells the truth.'", answer:"honest", hint:"Honest = always truthful", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'What he is like? He's very creative.'", answer:"What is he like? He's very creative.", hint:"Question order: What + is + he + like?", difficulty:"easy" },
      { type:"choose correct grammar", question:"'My mother is very ___. She understands my problems.' (patient/selfish/rude)", answer:"patient", hint:"Patient = calm, willing to wait and listen", difficulty:"easy" },
      { type:"finish the sentence", question:"'She is ___. She doesn't like being with many people.'", answer:"shy / introverted / quiet", hint:"Adjective for someone who prefers to be alone", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"Personality", spyTopic:"What People Look Like", crewmatePrompt:"Tell the group about someone you know — a friend, a classmate, or a family member. What are they LIKE as a person? Say: 'She is very KIND.', 'He is a bit SHY.', 'My friend is very FUNNY and TALKATIVE.'", spyPrompt:"Tell the group what someone looks like. Describe a friend, classmate, or family member. Say: 'She has long brown hair.', 'He is tall.', 'She has blue eyes and a big smile.' Say 3 or 4 things.", explanation:"Crewmates describe personality (kind, shy, funny). The spy describes appearance (tall, long hair) instead.", spyGuessOptions:["Personality (kind, funny, shy)","What People Look Like","How People Feel","What People Do"] },
      { crewmateTopic:"Personality", spyTopic:"How People Feel", crewmatePrompt:"Describe 2 or 3 people. Say what their personality is like. Example: 'My teacher is very PATIENT and HELPFUL.', 'My brother is quite LAZY but very FUNNY.', 'My friend is HARDWORKING and HONEST.'", spyPrompt:"Tell the group how you or your friends FEEL today or in different situations. Say: 'I feel HAPPY today!', 'Before an exam I feel NERVOUS.', 'When I am tired I feel ANGRY.' Say 3 feelings.", explanation:"Crewmates describe someone's personality (what they are always like). The spy describes feelings (how someone feels right now).", spyGuessOptions:["Personality Traits","How You Feel","What People Look Like","What People Like"] },
      { crewmateTopic:"Personality", spyTopic:"Comparing Two People", crewmatePrompt:"Describe 2 or 3 people using personality words. Say: 'My mum is very KIND.', 'My best friend is FUNNY and CREATIVE.', 'My brother is a bit LAZY but very GENEROUS.' Use personality adjectives.", spyPrompt:"Compare two people you know! Say: 'My sister is TALLER than me.', 'My friend is MORE PATIENT than my brother.', 'I am FUNNIER than my classmate!' Compare 2 or 3 things.", explanation:"Crewmates describe personality simply (she is kind). The spy compares two people using 'more' or '-er'.", spyGuessOptions:["Describing Personality","Comparing People","How People Feel","What People Look Like"] },
      { crewmateTopic:"Personality", spyTopic:"How People Do Things", crewmatePrompt:"Think of someone you know and tell the group about their personality. What are they like? Use words like: FUNNY, SHY, KIND, LAZY, HARDWORKING, QUIET, TALKATIVE, HONEST. Say 3 or 4 sentences.", spyPrompt:"Tell the group HOW people do things. Say: 'She speaks QUIETLY.', 'He works HARD.', 'She sings BEAUTIFULLY.', 'He drives CAREFULLY.', 'She dances BADLY!' Tell us about 2 or 3 people.", explanation:"Crewmates say what someone IS like (kind, patient). The spy says HOW someone does things (quietly, carefully).", spyGuessOptions:["Personality Adjectives","How People Do Things","Feelings","Comparing People"] },
    ],
    minefieldGrid: {
      topic: "Personality Adjectives",
      instructions: "Students combine the subject (top) with the personality phrase (side) to make a full sentence — completing it with a real or imaginary person and adjective.",
      colLabels: ["My best friend …", "My teacher …", "My brother/sister …", "A famous person …", "I …"],
      rowLabels: ["… is very … because …", "What is … like? He/She is …", "… is not very … but …", "… is really … and …", "He/She looks … but he/she is …"],
    },
    hotSeatWords: [
      {word:"friendly"},{word:"shy"},{word:"funny"},{word:"kind"},
      {word:"lazy"},{word:"hardworking"},{word:"patient"},{word:"impatient"},
      {word:"honest"},{word:"generous"},{word:"creative"},{word:"talkative"},
      {word:"boring"},{word:"outgoing"},{word:"serious"},{word:"confident"},
      {word:"stubborn"},{word:"cheerful"},{word:"ambitious"},{word:"caring"},
    ],
    hotPotatoPrompts: [
      {prompt:"'She is very ___.' (always helps people)", answer:"kind / helpful"},
      {prompt:"'He never speaks in class.' He is ___.", answer:"shy / quiet"},
      {prompt:"'She makes everyone laugh.' She is ___.", answer:"funny / humorous"},
      {prompt:"'He works 12 hours a day.' He is ___.", answer:"hardworking"},
      {prompt:"'She never does her homework.' She is ___.", answer:"lazy"},
      {prompt:"Opposite of 'lazy'?", answer:"hardworking"},
      {prompt:"Opposite of 'shy'?", answer:"outgoing / confident"},
      {prompt:"'He always tells the truth.' He is ___.", answer:"honest"},
      {prompt:"'She shares everything.' She is ___.", answer:"generous"},
      {prompt:"'He gets angry fast.' He is ___.", answer:"impatient"},
      {prompt:"Opposite of 'mean'?", answer:"generous / kind"},
      {prompt:"'She loves meeting new people.' She is ___.", answer:"outgoing / sociable"},
      {prompt:"'He talks all the time.' He is ___.", answer:"talkative"},
      {prompt:"'She thinks of new ideas.' She is ___.", answer:"creative"},
      {prompt:"Opposite of 'serious'?", answer:"funny / light-hearted"},
      {prompt:"'He never gets angry.' He is ___.", answer:"patient / calm"},
      {prompt:"Describe your best friend in one word.", answer:"(free answer)", spanish:"Describe a tu mejor amigo/a con una palabra."},
      {prompt:"'She always does her best.' She is ___.", answer:"ambitious / hardworking"},
      {prompt:"Opposite of 'confident'?", answer:"shy / insecure"},
      {prompt:"Describe yourself in one word.", answer:"(free answer)", spanish:"Descríbete a ti mismo/a con una palabra."},
    ],
    auctionSentences: [
      { sentence:"What is she like? She's very friendly and outgoing.", isCorrect:true, explanation:"'What is she like?' correctly asks about personality. The answer uses adjectives." },
      { sentence:"What does she like? She's very friendly and outgoing.", isCorrect:false, explanation:"'What does she like?' asks about preferences (food, films, etc.), not personality." },
      { sentence:"He is a very kind person. Everyone loves him.", isCorrect:true, explanation:"'A kind person' — adjective + noun, correctly using 'a'." },
      { sentence:"He is a very kindly person.", isCorrect:false, explanation:"'Kind' is the adjective. 'Kindly' is an adverb and cannot describe a person this way." },
      { sentence:"She is shy but very hardworking.", isCorrect:true, explanation:"Two adjectives correctly connected with 'but' to show contrast." },
      { sentence:"She is a shy but very hardworking.", isCorrect:false, explanation:"Don't use 'a' before adjectives alone. Use 'a' only before 'adjective + noun'." },
      { sentence:"What is your best friend like? He's funny and honest.", isCorrect:true, explanation:"'What is … like?' correctly asks about personality." },
      { sentence:"What is your best friend like? He's a funny and honest.", isCorrect:false, explanation:"No article before standalone adjectives — 'He's funny and honest'." },
      { sentence:"My teacher is strict but very fair.", isCorrect:true, explanation:"Two adjectives contrasted with 'but' — both correctly formed." },
      { sentence:"My brother are very talkative. He loves to chat!", isCorrect:false, explanation:"'My brother' is singular — use 'is', not 'are': 'My brother is very talkative'." },
    ],
    cardTasks: [
      { task:"Describe your best friend's personality using three adjectives." },
      { task:"Ask your partner 'What is your [family member] like?' and answer about yours." },
      { task:"Use 'What is he/she like?' to describe a famous person — don't say the name!" },
      { task:"Say two positive and one negative personality adjective about yourself." },
      { task:"Describe your teacher using at least two personality adjectives." },
      { task:"Use 'He/She is … but …' to describe someone with mixed personality traits." },
      { task:"Ask three classmates 'What are you like?' and remember their answers." },
      { task:"Describe an ideal friend using four personality adjectives." },
      { task:"Use 'kind', 'patient', and 'funny' in three separate sentences." },
      { task:"Say what personality you are NOT — 'I'm not very … but I am very …'" },
      { task:"Describe a character from a film or book using personality adjectives." },
      { task:"Use 'What is she like?' — your partner gives three adjectives, you guess who." },
      { task:"Say the opposite of: shy, kind, funny, lazy, and patient." },
      { task:"Use 'very', 'quite', and 'a bit' with three different personality adjectives." },
      { task:"Describe someone in your family: 'My … is very … He/She always …'" },
      { task:"Make a sentence: 'I am … but my friend is …' — use contrasting adjectives." },
      { task:"Guess your partner's personality from their description without saying names." },
      { task:"Use 'hardworking', 'creative', and 'honest' in sentences about real people." },
      { task:"Describe your own personality in four sentences, using 'but' once." },
      { task:"Ask 'What is your ideal partner like?' and answer with five adjectives." },
    ],
  },

  feelings: {
    label: "Feelings (Basic)",
    category: "vocabulary",
    questions: [
      { type:"choose correct grammar", question:"'How ___ you feel?' 'I feel tired.' (do/are/is)", answer:"do", hint:"'How do you feel?' asks about feelings", difficulty:"easy" },
      { type:"finish the sentence", question:"'I am very ___. I need to sleep.'", answer:"tired / sleepy / exhausted", hint:"Feeling = need sleep", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She feel sick today.'", answer:"She feels sick today.", hint:"Third person singular: 'feels'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'He ___ hungry. He wants to eat.' (is/are/am)", answer:"is", hint:"Third person singular: 'is'", difficulty:"easy" },
      { type:"finish the sentence", question:"'Are you okay? You look ___!'", answer:"sad / upset / worried / sick", hint:"Adjective to describe how someone looks", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I am boring. I don't know what to do.'", answer:"I am bored. I don't know what to do.", hint:"'Bored' = feeling; 'boring' = describes something dull", difficulty:"easy" },
      { type:"choose correct grammar", question:"'She ___ really happy today!' (look/looks/looking)", answer:"looks", hint:"Third person: 'looks' + adjective", difficulty:"easy" },
      { type:"finish the sentence", question:"'He isn't sad — he is ___! He got 100% on the test!'", answer:"happy / excited / delighted", hint:"Positive feeling after good news", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I feel very stress today.'", answer:"I feel very stressed today.", hint:"'Stressed' is the adjective form — not 'stress'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'Why are you ___? Did something bad happen?' (upset/boring/hunger)", answer:"upset", hint:"'Upset' is the feeling — the adjective", difficulty:"easy" },
      { type:"finish the sentence", question:"'She is ___ because she has an exam tomorrow.'", answer:"nervous / worried / anxious", hint:"Feeling before something important", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I am tire. I need a break.'", answer:"I am tired. I need a break.", hint:"'Tired' is the correct adjective form", difficulty:"easy" },
      { type:"choose correct grammar", question:"'He feels ___ after working all day.' (exhausting/exhausted/exhaust)", answer:"exhausted", hint:"'-ed' adjective = how the person feels", difficulty:"easy" },
      { type:"finish the sentence", question:"'She is ___ . She has a headache and a temperature.'", answer:"sick / ill / unwell", hint:"Feeling when you are not healthy", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'How do you feeling today?'", answer:"How do you feel today?", hint:"'How do you feel?' — use the base verb, not -ing", difficulty:"easy" },
      { type:"choose correct grammar", question:"'They are ___ — they have nothing to do.' (bored/boring/bore)", answer:"bored", hint:"'-ed' for feelings: 'bored' = how they feel", difficulty:"easy" },
      { type:"finish the sentence", question:"'I ate too much! Now I feel ___.'", answer:"full / sick / uncomfortable", hint:"Feeling after eating a lot", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She is scare of dogs.'", answer:"She is scared of dogs.", hint:"'Scared' is the adjective — 'scared of' + noun", difficulty:"easy" },
      { type:"choose correct grammar", question:"'I'm ___ I forgot your birthday!' (sorry/sad/angry)", answer:"sorry", hint:"'I'm sorry' expresses an apology or regret", difficulty:"easy" },
      { type:"finish the sentence", question:"'He is very ___. He is shouting and his face is red!'", answer:"angry / furious / upset", hint:"Strong negative feeling = anger", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"Feelings", spyTopic:"How Your Body Feels", crewmatePrompt:"Tell the group how you FEEL or how you feel in different situations. Use words like: HAPPY, SAD, TIRED, EXCITED, NERVOUS, BORED, SCARED, ANGRY. Example: 'Right now I feel HAPPY!', 'Before an exam I feel NERVOUS.'", spyPrompt:"Tell the group how your BODY feels right now or in different situations. Say: 'I feel HUNGRY — I want to eat!', 'I am HOT.', 'After sport I feel TIRED and THIRSTY.', 'I feel COLD today.' Use body words.", explanation:"Crewmates name emotions (happy, sad, nervous, bored). The spy talks about how the body feels (hungry, hot, cold, tired).", spyGuessOptions:["How You Feel (emotions)","How Your Body Feels","What You Look Like","What You Like"] },
      { crewmateTopic:"Feelings", spyTopic:"Saying Why You Feel Something", crewmatePrompt:"Tell the group how you feel in 3 different situations. Use: 'I FEEL...', 'I AM...', 'I LOOK...'. Example: 'At a party I feel EXCITED!', 'On Monday morning I feel TIRED.', 'On my birthday I am HAPPY!'", spyPrompt:"Tell the group why you feel something. Say: 'I feel happy BECAUSE it's Friday.', 'I am tired BECAUSE I slept late.', 'She is sad BECAUSE her dog is sick.' Use BECAUSE to explain the reason.", explanation:"Crewmates say the feeling (I feel excited). The spy says the feeling AND the reason using 'because'.", spyGuessOptions:["Naming Your Feelings","Explaining Why You Feel Something","Body Feelings","Personality"] },
      { crewmateTopic:"Feelings", spyTopic:"What Your Face and Body Do", crewmatePrompt:"Say how you feel in different situations. Use easy words: HAPPY, SAD, TIRED, EXCITED, BORED, ANGRY, NERVOUS, SCARED. Say 3 or 4 sentences about yourself or someone you know.", spyPrompt:"Describe how people look when they feel things! Say: 'When she is happy, she SMILES.', 'When he is sad, he CRIES.', 'When I am nervous, I shake.', 'She is YAWNING — she is tired!' Say 2 or 3.", explanation:"Crewmates name the feeling (she is happy). The spy describes what the face and body do (she smiles, he cries).", spyGuessOptions:["Naming Feelings","What Your Face and Body Do","Why You Feel Something","Personality"] },
      { crewmateTopic:"Feelings", spyTopic:"Personality", crewmatePrompt:"Tell the group how you feel in different situations. Use: 'When I am at school, I feel...', 'When I watch a scary film, I feel...', 'When I get good marks, I feel...' Name 3 feelings and when you feel them.", spyPrompt:"Tell the group about someone's personality! Say: 'My friend is very FUNNY.', 'My teacher is PATIENT and KIND.', 'My brother is quite LAZY.', 'I am TALKATIVE and CREATIVE.' Describe 2 or 3 people.", explanation:"Crewmates describe feelings (I feel happy/nervous). The spy describes personality (she is funny/kind) instead.", spyGuessOptions:["Feelings (happy, nervous)","Personality (funny, kind)","Body Feelings","What People Look Like"] },
    ],
    minefieldGrid: {
      topic: "Feelings",
      instructions: "Students combine the situation (top) with the feeling expression (side) to make a full, natural sentence about how someone feels.",
      colLabels: ["Before a big test …", "After a long day …", "On your birthday …", "When you are sick …", "When you are very hungry …"],
      rowLabels: ["I feel …", "She looks …", "He is very … because …", "I am … and I want to …", "They feel … and they need to …"],
    },
    hotSeatWords: [
      {word:"happy"},{word:"sad"},{word:"angry"},{word:"scared"},
      {word:"tired"},{word:"excited"},{word:"nervous"},{word:"bored"},
      {word:"hungry"},{word:"sick"},{word:"stressed"},{word:"upset"},
      {word:"embarrassed"},{word:"proud"},{word:"surprised"},{word:"confused"},
      {word:"jealous"},{word:"lonely"},{word:"relieved"},{word:"disgusted"},
    ],
    hotPotatoPrompts: [
      {prompt:"'I got 100% on my test!' I feel ___.", answer:"happy / excited"},
      {prompt:"'My dog died.' I feel ___.", answer:"sad"},
      {prompt:"'I have an exam tomorrow.' I feel ___.", answer:"nervous"},
      {prompt:"'Nothing is happening.' I feel ___.", answer:"bored"},
      {prompt:"'Someone took my lunch!' I feel ___.", answer:"angry"},
      {prompt:"'There's a spider on my arm!' I feel ___.", answer:"scared"},
      {prompt:"'I worked 10 hours.' I feel ___.", answer:"tired / exhausted"},
      {prompt:"'I haven't eaten all day.' I feel ___.", answer:"hungry"},
      {prompt:"Opposite of 'happy'?", answer:"sad"},
      {prompt:"Opposite of 'calm'?", answer:"nervous / stressed"},
      {prompt:"'She ___ happy today.' (to look)", answer:"looks"},
      {prompt:"'I feel ___.' (after finishing a big project)", answer:"relieved / proud"},
      {prompt:"'He ___ nervous before the presentation.'", answer:"felt"},
      {prompt:"Name a feeling you have on your birthday.", answer:"(free — happy, excited)", spanish:"Nombra un sentimiento que tienes en tu cumpleaños."},
      {prompt:"Name a feeling before an exam.", answer:"nervous / scared / stressed", spanish:"Nombra un sentimiento antes de un examen."},
      {prompt:"'You got the job!' How do you feel?", answer:"(free — happy, excited, relieved)", spanish:"¡Conseguiste el trabajo! ¿Cómo te sientes?"},
      {prompt:"'Embarrassed' — when do you feel this?", answer:"(free — making a mistake in public)", spanish:"\"Avergonzado\" — ¿cuándo sientes esto?"},
      {prompt:"'Proud' — when do you feel this?", answer:"(free — achieving something)", spanish:"\"Orgulloso\" — ¿cuándo sientes esto?"},
      {prompt:"How do you feel on Monday morning?", answer:"(free answer)", spanish:"¿Cómo te sientes el lunes por la mañana?"},
      {prompt:"How do you feel on Friday afternoon?", answer:"(free answer)", spanish:"¿Cómo te sientes el viernes por la tarde?"},
    ],
    auctionSentences: [
      { sentence:"I feel tired. I need to sleep.", isCorrect:true, explanation:"'Feel + adjective' is correct. 'Tired' is the correct feeling adjective." },
      { sentence:"I feel tire. I need to sleep.", isCorrect:false, explanation:"'Tired' is the adjective — 'tire' is a noun (like a car tyre) or a verb." },
      { sentence:"She looks very happy today!", isCorrect:true, explanation:"'Look + adjective' is correct for describing how someone appears." },
      { sentence:"She feels sick. She has a headache and a temperature.", isCorrect:true, explanation:"'Feel + adjective' correctly describes how she feels. Third person 'feels'." },
      { sentence:"She feel sick. She has a headache.", isCorrect:false, explanation:"Third person singular: 'feels', not 'feel'." },
      { sentence:"I am bored. There is nothing to do!", isCorrect:true, explanation:"'Bored' describes how the person feels — the correct -ed adjective." },
      { sentence:"I am boring. There is nothing to do!", isCorrect:false, explanation:"'Boring' describes the thing or situation that causes boredom. 'Bored' = how you feel." },
      { sentence:"He feels exhausted after a long day at work.", isCorrect:true, explanation:"'Exhausted' (the -ed form) describes how he feels — correct." },
      { sentence:"He feels exhausting after a long day at work.", isCorrect:false, explanation:"'-ing' adjectives describe what causes a feeling. 'Exhausting' describes the day, not the person." },
      { sentence:"How do you feel today? I'm not very well.", isCorrect:true, explanation:"'How do you feel?' is a correct question. 'I'm not very well' is a natural answer." },
    ],
    cardTasks: [
      { task:"Say how you feel right now and why." },
      { task:"Describe how you feel before an important exam." },
      { task:"Use 'I feel… because…' in three different sentences." },
      { task:"Ask your partner 'How do you feel today?' and answer their question." },
      { task:"Use 'tired', 'hungry', and 'happy' in three sentences about yourself." },
      { task:"Say how you feel when: it's your birthday / you are sick / you have no homework." },
      { task:"Describe how a classmate looks right now using 'He/She looks…'" },
      { task:"Use 'nervous', 'excited', and 'scared' in sentences about real situations." },
      { task:"Say 'I feel … when I …' — use three different feelings." },
      { task:"Use 'bored' and 'boring' correctly in two sentences." },
      { task:"Describe how you feel after: a big meal / a long run / a scary film." },
      { task:"Ask your partner 'Are you okay?' and respond as if you feel sick or tired." },
      { task:"Use 'stressed', 'worried', and 'nervous' — are they similar or different?" },
      { task:"Say what you do when you feel sad, angry, or tired." },
      { task:"Use 'He/She is … because …' to describe someone's feelings." },
      { task:"Make a sentence: 'I am hungry and I want to…'" },
      { task:"Use 'exhausted' and 'tired' — when would you use each one?" },
      { task:"Say 'I am scared of…' — name three things that make you scared." },
      { task:"Describe how a character in a film feels using 'She/He looks/feels…'" },
      { task:"Use 'I'm sorry' in a sentence where you express regret." },
    ],
  },

  appearance: {
    label: "What do you look like?",
    category: "vocabulary",
    questions: [
      { type:"choose correct grammar", question:"'What ___ he look like?' 'He's tall and has dark hair.' (does/is/do)", answer:"does", hint:"'What does he look like?' asks about appearance", difficulty:"easy" },
      { type:"finish the sentence", question:"'She ___ tall and slim.'", answer:"is", hint:"Use 'be' for height, build, and general appearance", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'He have blue eyes.'", answer:"He has blue eyes.", hint:"'Have' for physical features: third person = 'has'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'She ___ long, curly hair.' (have/has/is)", answer:"has", hint:"'Has' describes physical features for he/she/it", difficulty:"easy" },
      { type:"finish the sentence", question:"'He is about 1 metre 80. He is very ___.'", answer:"tall", hint:"Height adjective", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She is have green eyes.'", answer:"She has green eyes.", hint:"'Has' stands alone — no 'is' before it", difficulty:"easy" },
      { type:"choose correct grammar", question:"'What ___ she look like?' (does/is/do)", answer:"does", hint:"Third person singular question: 'does'", difficulty:"easy" },
      { type:"finish the sentence", question:"'He ___ short, black hair and brown eyes.'", answer:"has / 's got", hint:"'Has' or 'has got' for physical features", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She is has long, straight hair.'", answer:"She has long, straight hair.", hint:"'Has' doesn't need 'is' before it", difficulty:"easy" },
      { type:"choose correct grammar", question:"'My brother is ___ and athletic.' (tall/talls/tallly)", answer:"tall", hint:"Adjectives don't change form — no -s or -ly", difficulty:"easy" },
      { type:"finish the sentence", question:"'She has ___, dark hair and big, brown eyes.'", answer:"long / short / curly / straight", hint:"Adjective describing hair length or type", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'He is 30 years. He works as a chef.'", answer:"He is 30 years old. He works as a chef.", hint:"'Years old' — don't forget 'old'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'She ___ medium height with blue eyes.' (is/has/are)", answer:"is", hint:"'Is' for height and build descriptions", difficulty:"easy" },
      { type:"finish the sentence", question:"'What does she look ___? She has red hair and freckles.'", answer:"like", hint:"'What does she look like?' — the word 'like' ends the question", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'My sister have short, blonde hair.'", answer:"My sister has short, blonde hair.", hint:"Third person singular: 'has', not 'have'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'He has ___ hair and blue eyes.' (curly/curlies/a curly)", answer:"curly", hint:"Adjectives before nouns: 'curly hair'", difficulty:"easy" },
      { type:"finish the sentence", question:"'She ___ (be) about 1 metre 65 and she has brown hair.'", answer:"is", hint:"'Is' for height", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'He is slim and he have a beard.'", answer:"He is slim and he has a beard.", hint:"Third person singular: 'has'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'What does he look like? He ___ tall and has brown eyes.' (is/has/does)", answer:"is", hint:"'Is' for height and build", difficulty:"easy" },
      { type:"finish the sentence", question:"'She has ___ hair — it's not straight and not wavy.'", answer:"curly", hint:"Hair that forms ringlets = curly", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"What People Look Like", spyTopic:"Personality", crewmatePrompt:"Describe what someone looks like! Choose a person — a friend, family member, or someone famous. Say: 'She IS tall.', 'He HAS dark hair.', 'She HAS blue eyes.' Use IS for height and HAS for hair/eyes.", spyPrompt:"Describe what someone is LIKE as a person! Choose a friend, family member, or famous person. Say: 'She is very KIND.', 'He is FUNNY.', 'She is quite SHY.', 'He is HARDWORKING.' Say 3 or 4 things.", explanation:"Crewmates describe appearance (tall, dark hair, blue eyes). The spy describes personality (kind, funny, shy) instead.", spyGuessOptions:["What People Look Like","Personality","What People Are Wearing","How People Feel"] },
      { crewmateTopic:"What People Look Like", spyTopic:"What People Are Wearing", crewmatePrompt:"Describe someone's appearance without saying their name. Say what they look like — their hair, eyes, and height. Example: 'This person IS tall. They HAVE short brown hair and green eyes.' Your team guesses who!", spyPrompt:"Describe what someone is WEARING right now! Say: 'She IS WEARING a red jacket.', 'He IS WEARING blue jeans and a white T-shirt.', 'My teacher IS WEARING glasses today.' Describe 2 or 3 people.", explanation:"Crewmates say what someone looks like (tall, brown hair). The spy says what they are wearing (red jacket, blue jeans).", spyGuessOptions:["What People Look Like","What People Are Wearing","Personality","How People Feel"] },
      { crewmateTopic:"What People Look Like", spyTopic:"How Old People Are", crewmatePrompt:"Describe 2 or 3 people. Say what they look like. Use IS for height/build: 'She IS short and slim.', 'He IS tall.' Use HAS for hair and eyes: 'She HAS curly red hair.', 'He HAS brown eyes.'", spyPrompt:"Tell the group about the ages of 2 or 3 people you know. Say: 'My mum is 45 years old.', 'My little brother is 8.', 'My teacher looks about 30.', 'My grandfather is 70.' How old are the people in your life?", explanation:"Crewmates describe physical appearance (tall, curly hair). The spy talks about how old people are instead.", spyGuessOptions:["What People Look Like","How Old People Are","What People Are Wearing","Personality"] },
      { crewmateTopic:"What People Look Like", spyTopic:"Comparing Two People", crewmatePrompt:"Describe two people and say what they look like. Use: IS (tall, short, slim), HAS (long hair, blue eyes, a beard). Example: 'Person A IS tall and HAS dark hair. Person B IS short and HAS blonde hair.'", spyPrompt:"Compare two people! Say: 'My sister IS TALLER than me.', 'My friend HAS LONGER hair than me.', 'He IS OLDER than her.', 'She HAS DARKER eyes than her brother.' Compare 2 or 3 things.", explanation:"Crewmates describe appearance simply (she is tall, she has dark hair). The spy compares two people using 'taller than, longer than'.", spyGuessOptions:["Describing Appearance","Comparing Two People","Personality","What People Are Wearing"] },
    ],
    minefieldGrid: {
      topic: "What do you look like?",
      instructions: "Students combine the question (top) with the answer structure (side) to describe a person's appearance — real or imaginary.",
      colLabels: ["What does she look like?", "What does he look like?", "Describe your best friend.", "Describe someone in your family.", "Describe a famous person."],
      rowLabels: ["She/He is … (height/build) …", "She/He has … hair and … eyes.", "She/He is about … years old.", "She/He is … and has …", "She/He looks like …"],
    },
    hotSeatWords: [
      {word:"tall"},{word:"short"},{word:"slim"},{word:"fat"},
      {word:"young"},{word:"old"},{word:"curly hair"},{word:"straight hair"},
      {word:"blonde"},{word:"dark hair"},{word:"red hair"},{word:"bald"},
      {word:"beard"},{word:"glasses"},{word:"blue eyes"},{word:"brown eyes"},
      {word:"big nose"},{word:"long hair"},{word:"short hair"},{word:"smile"},
    ],
    hotPotatoPrompts: [
      {prompt:"'She ___ tall.' (to be)", answer:"is"},
      {prompt:"'He ___ dark hair.' (to have)", answer:"has"},
      {prompt:"'Is' or 'has'? She ___ blue eyes.", answer:"has"},
      {prompt:"'Is' or 'has'? He ___ short.", answer:"is"},
      {prompt:"Describe your hair in one sentence.", answer:"(free answer)", spanish:"Describe tu pelo en una frase."},
      {prompt:"'She has ___ hair.' (not straight)", answer:"curly / wavy"},
      {prompt:"'He is very ___.' (2 metres tall)", answer:"tall"},
      {prompt:"Opposite of 'tall'?", answer:"short"},
      {prompt:"'___ does she look like?' (question)", answer:"What"},
      {prompt:"Describe someone's eye colour.", answer:"She has ___ eyes."},
      {prompt:"'He has a ___.' (hair on his face)", answer:"beard"},
      {prompt:"'She wears ___.' (to see better)", answer:"glasses"},
      {prompt:"Describe your teacher's hair.", answer:"(free answer)", spanish:"Describe el pelo de tu profesor/a."},
      {prompt:"'She is ___.' (not fat, not thin)", answer:"slim / medium build"},
      {prompt:"'Blonde' describes?", answer:"hair colour"},
      {prompt:"'Tall' describes?", answer:"height"},
      {prompt:"Use 'has' to describe someone's hair.", answer:"(free answer)"},
      {prompt:"Use 'is' to describe someone's height.", answer:"(free answer)"},
      {prompt:"Describe a famous person's appearance.", answer:"(free answer)", spanish:"Describe el aspecto de una persona famosa."},
      {prompt:"'He is ___ height.' (not short, not tall)", answer:"medium"},
    ],
    auctionSentences: [
      { sentence:"She has long, curly hair and green eyes.", isCorrect:true, explanation:"'Has' for physical features — third person singular. Adjectives correctly placed before nouns." },
      { sentence:"She have long, curly hair and green eyes.", isCorrect:false, explanation:"Third person singular: 'has', not 'have'." },
      { sentence:"What does he look like? He's tall with short, dark hair.", isCorrect:true, explanation:"'What does he look like?' correctly asks about appearance." },
      { sentence:"What is he look like? He's tall with short, dark hair.", isCorrect:false, explanation:"Use 'does' not 'is' in this question: 'What does he look like?'" },
      { sentence:"He is thirty years old and has blue eyes.", isCorrect:true, explanation:"'Is thirty years old' correctly states age. 'Has blue eyes' correctly describes features." },
      { sentence:"He is thirty years and has blue eyes.", isCorrect:false, explanation:"Say 'thirty years old' — don't omit 'old'." },
      { sentence:"She is medium height and has a round face.", isCorrect:true, explanation:"'Is medium height' for build. 'Has a round face' for features — both correct." },
      { sentence:"She has medium height and has a round face.", isCorrect:false, explanation:"'Is medium height' — use 'is' for height and build, not 'has'." },
      { sentence:"My sister is slim and has straight, blonde hair.", isCorrect:true, explanation:"'Is slim' for build. 'Has straight, blonde hair' for features. Both correct." },
      { sentence:"My sister is slim and have straight, blonde hair.", isCorrect:false, explanation:"Third person singular: 'has', not 'have'." },
    ],
    cardTasks: [
      { task:"Describe what you look like using 'I am… and I have…'" },
      { task:"Ask your partner 'What do you look like?' and describe yourself in return." },
      { task:"Describe a classmate without saying their name — others guess who." },
      { task:"Use 'She has… and she is…' to describe a famous woman." },
      { task:"Use 'He has… and he is…' to describe a famous man." },
      { task:"Describe your best friend's appearance in four sentences." },
      { task:"Say the hair colour and type of three people in the room." },
      { task:"Use 'tall', 'short', 'slim', and 'medium height' in four sentences." },
      { task:"Describe someone in your family: their height, hair, and eyes." },
      { task:"Use 'What does she look like?' to ask about an imaginary person — your partner answers." },
      { task:"Describe your own eye and hair colour using 'I have…'" },
      { task:"Say how old someone looks using 'She/He looks about… years old.'" },
      { task:"Describe a cartoon or film character using appearance adjectives." },
      { task:"Use 'curly', 'straight', 'long', and 'short' to describe four different hairstyles." },
      { task:"Describe the teacher without saying their name — just appearance." },
      { task:"Use 'He is… and has…' to describe two different people." },
      { task:"Say 'She/He has … hair and … eyes' about a person you know." },
      { task:"Describe someone's appearance and add one personality adjective." },
      { task:"Use 'about … years old' to describe three people in the room." },
      { task:"Describe what an ideal superhero looks like using appearance language." },
    ],
  },

  clothes: {
    label: "I am wearing… (Clothes)",
    category: "vocabulary",
    questions: [
      { type:"choose correct grammar", question:"'What ___ you wearing?' 'I'm wearing jeans.' (are/do/is)", answer:"are", hint:"'What are you wearing?' — present continuous", difficulty:"easy" },
      { type:"finish the sentence", question:"'She ___ wearing a red dress.'", answer:"is / 's", hint:"Third person singular present continuous: 'is wearing'", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I wear a blue T-shirt right now.'", answer:"I am wearing a blue T-shirt right now.", hint:"'Right now' = use present continuous", difficulty:"easy" },
      { type:"choose correct grammar", question:"'He is wearing ___ jeans and a white shirt.' (a/—/the)", answer:"—", hint:"No article before plural nouns like 'jeans'", difficulty:"easy" },
      { type:"finish the sentence", question:"'They are ___ (wear) their school uniforms today.'", answer:"wearing", hint:"Present continuous: am/is/are + verb-ing", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She is wear a coat.'", answer:"She is wearing a coat.", hint:"Present continuous: is + wearing (not 'wear')", difficulty:"easy" },
      { type:"choose correct grammar", question:"'___ he wearing a suit?' 'Yes, he is.' (Is/Are/Does)", answer:"Is", hint:"Present continuous question: Is + subject + verb-ing?", difficulty:"easy" },
      { type:"finish the sentence", question:"'I am wearing ___ pair of trainers.'", answer:"a", hint:"'A pair of' + plural item", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'He wearing a hat and sunglasses.'", answer:"He is wearing a hat and sunglasses.", hint:"Don't forget 'is' in present continuous", difficulty:"easy" },
      { type:"choose correct grammar", question:"'She ___ a scarf and gloves today — it's cold!' (wear/is wearing/wears)", answer:"is wearing", hint:"Present continuous for what is happening right now", difficulty:"easy" },
      { type:"finish the sentence", question:"'What ___ he wearing? He's wearing a suit and tie.'", answer:"is", hint:"'What is he wearing?' — present continuous question", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'I am wearing a jeans.'", answer:"I am wearing jeans.", hint:"'Jeans' is always plural — no article 'a'", difficulty:"easy" },
      { type:"choose correct grammar", question:"'They are all ___ blue T-shirts today.' (wear/wears/wearing)", answer:"wearing", hint:"Present continuous: are + verb-ing", difficulty:"easy" },
      { type:"finish the sentence", question:"'She is wearing a ___ blouse and black trousers.'", answer:"white / red / blue (any colour)", hint:"Colour adjective before the clothing item", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'Are you wear a jacket?'", answer:"Are you wearing a jacket?", hint:"Present continuous: Are + you + wearing?", difficulty:"easy" },
      { type:"choose correct grammar", question:"'He is wearing ___ blue trousers.' (a/—/an)", answer:"—", hint:"No article before plural clothing items", difficulty:"easy" },
      { type:"finish the sentence", question:"'___ (be) you wearing a uniform at school?'", answer:"Are", hint:"Present continuous question: Are you wearing…?", difficulty:"easy" },
      { type:"correct grammar mistakes", question:"'She wearing a beautiful evening dress.'", answer:"She is wearing a beautiful evening dress.", hint:"'Is' is needed in present continuous: is wearing", difficulty:"easy" },
      { type:"choose correct grammar", question:"'What colour ___ his jacket?' (is/are/has)", answer:"is", hint:"'What colour is his jacket?' — use 'is' with singular", difficulty:"easy" },
      { type:"finish the sentence", question:"'He ___ (not/wear) a tie today. He's very casual!'", answer:"isn't wearing", hint:"Present continuous negative: isn't + wearing", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"What People Are Wearing", spyTopic:"What People Look Like", crewmatePrompt:"Look around the room and describe what people are wearing RIGHT NOW! Say: 'I AM WEARING a blue T-shirt and jeans.', 'My teacher IS WEARING a black jacket.', 'My classmate IS WEARING a red hoodie.' Describe 3 people.", spyPrompt:"Look around the room and describe what people LOOK LIKE! Say: 'She HAS long dark hair.', 'He IS tall.', 'She HAS brown eyes.', 'He IS wearing glasses.' Describe 2 or 3 people in the room.", explanation:"Crewmates say what people are wearing (is wearing a blue T-shirt). The spy describes appearance (has dark hair, is tall) instead.", spyGuessOptions:["What People Are Wearing Now","What People Look Like","What People Like","Personality"] },
      { crewmateTopic:"What People Are Wearing", spyTopic:"Clothes You Wear in General", crewmatePrompt:"Describe what 2 or 3 people in the room ARE WEARING today. Say: 'She IS WEARING a white dress.', 'He IS WEARING jeans and a grey T-shirt.', 'I AM WEARING my school uniform.' Use IS WEARING or AM WEARING.", spyPrompt:"Tell the group about clothes in general! Say when people wear things. Example: 'In winter people wear COATS.', 'At school we wear UNIFORMS.', 'On the beach people wear SHORTS.', 'For sport I wear TRAINERS.'", explanation:"Crewmates say what specific people are wearing right now. The spy talks about clothes people wear in general situations.", spyGuessOptions:["What People Are Wearing Now","Clothes in General","What People Look Like","Daily Routine"] },
      { crewmateTopic:"What People Are Wearing", spyTopic:"Colours Around You", crewmatePrompt:"Describe what someone in the room is wearing. Use colours! Example: 'She IS WEARING a RED jacket and BLACK trousers.', 'He IS WEARING a BLUE and WHITE T-shirt and GREY jeans.' Describe 2 or 3 people.", spyPrompt:"Look around the room and describe the COLOURS you can see! Say: 'The board IS BLACK.', 'The walls ARE WHITE.', 'My bag IS DARK BLUE.', 'Her pen IS RED.', 'The door IS BROWN.' Say 4 or 5 things.", explanation:"Crewmates describe clothes with colours (wearing a red jacket). The spy describes the colours of objects around them instead.", spyGuessOptions:["What People Are Wearing","Colours Around You","What People Look Like","Classroom Objects"] },
      { crewmateTopic:"What People Are Wearing", spyTopic:"Getting Dressed", crewmatePrompt:"Describe what different people in the room are wearing now. Say: 'I AM WEARING...', 'She IS WEARING...', 'He IS NOT WEARING a tie.' Talk about 3 people. Use IS WEARING and IS NOT WEARING.", spyPrompt:"Tell the group about getting dressed in the morning! Say: 'First I PUT ON my socks.', 'Then I WEAR my trousers.', 'I PUT ON my shoes.', 'Finally I TAKE OFF my pyjamas.' Tell us 3 or 4 steps.", explanation:"Crewmates say what people are wearing right now. The spy describes the steps of getting dressed in order.", spyGuessOptions:["What People Are Wearing Now","Getting Dressed (steps)","Clothes in General","Daily Routine"] },
    ],
    minefieldGrid: {
      topic: "I am wearing… (Clothes)",
      instructions: "Students combine the person (top) with the sentence frame (side) to describe what someone is wearing right now — adding colour and clothing items.",
      colLabels: ["I …", "She …", "He …", "My friend …", "The teacher …"],
      rowLabels: ["… am/is wearing a … and …", "… isn't/aren't wearing …", "What … wearing? He/She is …", "… am/is wearing … colour …", "… look(s) great in …"],
    },
    hotSeatWords: [
      {word:"T-shirt"},{word:"jeans"},{word:"dress"},{word:"skirt"},
      {word:"jacket"},{word:"coat"},{word:"shoes"},{word:"boots"},
      {word:"hat"},{word:"scarf"},{word:"suit"},{word:"shorts"},
      {word:"jumper"},{word:"shirt"},{word:"socks"},{word:"gloves"},
      {word:"uniform"},{word:"pyjamas"},{word:"swimsuit"},{word:"raincoat"},
    ],
    hotPotatoPrompts: [
      {prompt:"'She is ___ing a red dress.' (wear)", answer:"wearing"},
      {prompt:"'He is wearing ___.' (name any clothes)", answer:"(free answer)"},
      {prompt:"Name something you wear on your feet.", answer:"shoes / boots / socks"},
      {prompt:"Name something you wear in winter.", answer:"coat / scarf / gloves / jumper"},
      {prompt:"Name something you wear in summer.", answer:"shorts / T-shirt / sandals / dress"},
      {prompt:"'He is ___ a suit.' (wear — present continuous)", answer:"wearing"},
      {prompt:"Name something you wear on your head.", answer:"hat / cap"},
      {prompt:"Name something you wear around your neck.", answer:"scarf / tie / necklace"},
      {prompt:"'She is wearing a ___.' (formal work item)", answer:"suit / jacket / blouse"},
      {prompt:"'I am ___ jeans and a T-shirt.'", answer:"wearing"},
      {prompt:"'Is wearing' — what tense?", answer:"present continuous"},
      {prompt:"Describe what you're wearing now.", answer:"(free answer)", spanish:"Describe lo que llevas puesto ahora."},
      {prompt:"'He is ___ wearing a tie.' (negative)", answer:"not", spanish:"Él ___ lleva corbata. (negativo)"},
      {prompt:"Name a piece of clothing that's blue.", answer:"(free answer)", spanish:"Nombra una prenda de ropa azul."},
      {prompt:"Name a piece of clothing for sport.", answer:"trainers / shorts / T-shirt"},
      {prompt:"'She wears a ___.' (protection from rain)", answer:"raincoat"},
      {prompt:"Name a clothing item for cold hands.", answer:"gloves"},
      {prompt:"'They are wearing ___.' (school clothes)", answer:"uniforms"},
      {prompt:"What is your teacher wearing today?", answer:"(free answer)", spanish:"¿Qué lleva tu profesor/a hoy?"},
      {prompt:"'He is wearing a ___ jacket.' (colour)", answer:"(free answer)", spanish:"Él lleva una chaqueta ___. (color)"},
    ],
    auctionSentences: [
      { sentence:"I am wearing a blue T-shirt and jeans.", isCorrect:true, explanation:"'Am wearing' is the correct present continuous. 'Jeans' correctly has no article." },
      { sentence:"I wear a blue T-shirt right now.", isCorrect:false, explanation:"'Right now' requires the present continuous: 'I am wearing a blue T-shirt right now'." },
      { sentence:"She is wearing a red dress and black shoes.", isCorrect:true, explanation:"'Is wearing' is the correct present continuous for third person singular." },
      { sentence:"She is wear a red dress and black shoes.", isCorrect:false, explanation:"Present continuous: 'is wearing' — don't use the base verb 'wear' after 'is'." },
      { sentence:"What are you wearing? I'm wearing jeans and a white top.", isCorrect:true, explanation:"'What are you wearing?' is the correct present continuous question." },
      { sentence:"What do you wearing? I'm wearing jeans.", isCorrect:false, explanation:"Present continuous questions use 'are': 'What are you wearing?' not 'What do you wearing?'" },
      { sentence:"He is wearing a jacket and blue trousers.", isCorrect:true, explanation:"'Trousers' is plural — no article. 'Is wearing' is correct." },
      { sentence:"He is wearing a jacket and a blue trousers.", isCorrect:false, explanation:"'Trousers' is always plural — don't use 'a' before it." },
      { sentence:"They are all wearing their school uniforms today.", isCorrect:true, explanation:"'Are wearing' — present continuous. 'Their' is the correct possessive adjective." },
      { sentence:"She is wearing a jeans and a white blouse.", isCorrect:false, explanation:"'Jeans' is always plural — no article 'a': 'She is wearing jeans and a white blouse'." },
    ],
    cardTasks: [
      { task:"Describe what you are wearing right now using 'I am wearing…'" },
      { task:"Describe what your partner is wearing — full sentences with colours." },
      { task:"Ask your partner 'What are you wearing today?' and answer in return." },
      { task:"Describe what three people in the room are wearing." },
      { task:"Use 'She is wearing… and…' to describe a classmate without naming them." },
      { task:"Say what the teacher is wearing using 'The teacher is wearing…'" },
      { task:"Use 'He is not wearing…' to say what a classmate is NOT wearing." },
      { task:"Describe what someone famous is wearing in a famous photo or film." },
      { task:"Ask 'Is he/she wearing a…?' and answer yes or no." },
      { task:"Use three colours to describe what people in the room are wearing." },
      { task:"Say 'I am wearing a pair of…' for two items." },
      { task:"Describe your ideal outfit for a party using 'I would wear…'" },
      { task:"Use present continuous to describe a person in a photo (imaginary)." },
      { task:"Say what you usually wear to school/work vs. what you're wearing today." },
      { task:"Describe your favourite outfit: 'My favourite outfit is… I wear it when…'" },
      { task:"Use 'What colour is/are…?' to ask about two clothing items." },
      { task:"Say what you are wearing and what you are NOT wearing today." },
      { task:"Describe a superhero's outfit using 'He/She is wearing…'" },
      { task:"Ask a classmate 'Are you wearing…?' — use three different clothing items." },
      { task:"Describe the perfect outfit for cold/hot weather using 'I would wear…'" },
    ],
  },

  // ── SPEAKING TOPICS ────────────────────────────────────────────────────────
  working_from_home: {
    label: "Working from Home",
    category: "topic",
    questions: [
      { type:"finish the sentence", question:"One advantage of working from home is saving time on ___.", answer:"commuting / travel", hint:"Getting to the office", difficulty:"easy" },
      { type:"finish the sentence", question:"Many people find it hard to ___ when working from home.", answer:"focus / concentrate", hint:"Staying on task", difficulty:"easy" },
      { type:"finish the sentence", question:"Working from home makes it difficult to separate work and ___ life.", answer:"personal / home", hint:"Two areas of life", difficulty:"easy" },
      { type:"finish the sentence", question:"To stay productive at home, having a fixed ___ helps.", answer:"routine / schedule", hint:"Structure your day", difficulty:"easy" },
      { type:"finish the sentence", question:"One disadvantage of remote work is feeling ___.", answer:"isolated / lonely", hint:"Not being around people", difficulty:"easy" },
      { type:"finish the sentence", question:"Video calls have ___ many face-to-face meetings.", answer:"replaced", hint:"What happened to in-person meetings", difficulty:"easy" },
      { type:"finish the sentence", question:"Working from home requires strong ___ skills.", answer:"self-discipline / time management", hint:"Managing yourself", difficulty:"medium" },
      { type:"finish the sentence", question:"Some people prefer the office because they need more ___.", answer:"structure / social interaction", hint:"What offices provide", difficulty:"medium" },
      { type:"finish the sentence", question:"A home office should be quiet and free from ___.", answer:"distractions / noise", hint:"What gets in the way", difficulty:"easy" },
      { type:"finish the sentence", question:"Flexible working means employees can choose their own ___ hours.", answer:"working", hint:"When they work", difficulty:"easy" },
      { type:"finish the sentence", question:"Remote work increased significantly since the COVID-19 ___.", answer:"pandemic", hint:"The global health event", difficulty:"easy" },
      { type:"finish the sentence", question:"Employers worry that remote workers are less ___.", answer:"productive / visible", hint:"Doing enough work", difficulty:"medium" },
      { type:"finish the sentence", question:"Working from home saves money on ___ and work clothes.", answer:"transport / commuting", hint:"Getting to work", difficulty:"easy" },
      { type:"finish the sentence", question:"A good remote setup needs a comfortable chair and fast ___.", answer:"internet / Wi-Fi", hint:"Connectivity", difficulty:"easy" },
      { type:"finish the sentence", question:"Some jobs cannot be done remotely, like nursing or ___.", answer:"teaching / construction / cooking", hint:"Jobs needing physical presence", difficulty:"easy" },
      { type:"finish the sentence", question:"Working from home means spending more time with ___.", answer:"family / children / pets", hint:"Who is at home", difficulty:"easy" },
      { type:"finish the sentence", question:"To avoid burnout, remote workers should ___ at the end of the day.", answer:"log off / switch off", hint:"Stop and rest", difficulty:"easy" },
      { type:"finish the sentence", question:"Hybrid working means splitting time between home and the ___.", answer:"office", hint:"The other place people work", difficulty:"easy" },
      { type:"finish the sentence", question:"Working from home can improve ___ by cutting out commuting.", answer:"work-life balance / wellbeing", hint:"More time for yourself", difficulty:"medium" },
      { type:"finish the sentence", question:"The biggest challenge for managers is ___ remote teams.", answer:"managing / trusting / communicating with", hint:"Leading people they cannot see", difficulty:"medium" },
    ],
    spyRounds: [
      { crewmateTopic:"Advantages of Working from Home", spyTopic:"Disadvantages of Working from Home", crewmatePrompt:"Tell the group TWO good things about working from home. Give reasons. Example: 'You save time because you don't commute.' or 'You can work in comfortable clothes.'", spyPrompt:"Tell the group TWO problems with working from home. Give reasons. Example: 'It's hard to concentrate.' or 'You feel lonely without colleagues.'", explanation:"Crewmates gave advantages. The spy gave disadvantages.", spyGuessOptions:["Advantages of Working from Home","Disadvantages of Working from Home","Office Work Benefits","Working Hours"] },
      { crewmateTopic:"Daily Routine at Home", spyTopic:"Daily Routine in the Office", crewmatePrompt:"Describe what a typical work-from-home day looks like. Say when you start, what you do, and when you take breaks.", spyPrompt:"Describe what a typical office day looks like. Say how you get there, what the environment is like, and what you do.", explanation:"Crewmates described working from home. The spy described going to the office.", spyGuessOptions:["Working from Home Routine","Office Day Routine","Hybrid Work","Freelancing"] },
      { crewmateTopic:"Tools for Remote Work", spyTopic:"Office Equipment", crewmatePrompt:"Talk about the tools you need to work from home. Example: 'You need a laptop, fast internet, and video calling software.'", spyPrompt:"Talk about the equipment you find in an office. Example: 'An office has printers, meeting rooms, a kitchen, and a desk phone.'", explanation:"Crewmates talked about remote tools. The spy talked about office equipment.", spyGuessOptions:["Remote Work Tools","Office Equipment","Smart Home Devices","School Supplies"] },
      { crewmateTopic:"Work-Life Balance at Home", spyTopic:"Social Life Outside Work", crewmatePrompt:"Talk about how working from home affects your balance between work and personal life.", spyPrompt:"Talk about your social life and how you spend time with friends outside of work.", explanation:"Crewmates talked about work-life balance. The spy talked about their social life.", spyGuessOptions:["Work-Life Balance at Home","Social Life","Office Friendships","Free Time Activities"] },
    ],
    minefieldGrid: {
      topic: "Working from Home",
      instructions: "Combine the subject (top) with the phrase (side) to make a sentence about working from home — then add your opinion.",
      colLabels: ["Working from home…", "Remote workers…", "The biggest challenge…", "One advantage is that…", "I think companies should…"],
      rowLabels: ["… saves time because…", "… can be difficult when…", "… is better than the office because…", "… requires you to…", "… has changed since…"],
    },
    hotSeatWords: [
      {word:"commute"},{word:"remote"},{word:"flexible"},{word:"productive"},
      {word:"isolated"},{word:"deadline"},{word:"video call"},{word:"home office"},
      {word:"distraction"},{word:"routine"},{word:"balance"},{word:"colleague"},
      {word:"burnout"},{word:"log off"},{word:"hybrid"},{word:"self-discipline"},
      {word:"meeting"},{word:"focus"},{word:"internet"},{word:"workspace"},
    ],
    hotPotatoPrompts: [
      {prompt:"Name one advantage of working from home.", answer:"(free — no commute, flexible hours, save money)"},
      {prompt:"Name one disadvantage of working from home.", answer:"(free — lonely, distractions, hard to switch off)"},
      {prompt:"'Remote' means working from ___.", answer:"home / away from the office"},
      {prompt:"What do you need to work from home? Name two things.", answer:"laptop, internet, quiet space, etc."},
      {prompt:"'Commute' means travelling to ___.", answer:"work / the office"},
      {prompt:"'Hybrid work' means working sometimes at home and sometimes ___.", answer:"in the office"},
      {prompt:"Name a job that cannot be done from home.", answer:"(nurse, builder, chef, etc.)"},
      {prompt:"What does 'flexible hours' mean?", answer:"you choose when you start and finish"},
      {prompt:"'Burnout' means feeling too ___ from too much work.", answer:"tired / exhausted / stressed"},
      {prompt:"Name a video calling app used for remote work.", answer:"Zoom / Teams / Google Meet"},
      {prompt:"What does 'log off' mean?", answer:"stop working / turn off your computer"},
      {prompt:"Name one thing that makes it hard to concentrate at home.", answer:"(free — noise, family, TV)"},
      {prompt:"'Productive' means getting a lot of ___ done.", answer:"work"},
      {prompt:"Name something good about not commuting.", answer:"(free — save time, money, less stress)"},
      {prompt:"What is a 'home office'?", answer:"a room or space at home used for work"},
      {prompt:"Name one way to stay focused when working from home.", answer:"(free — routine, close social media)"},
      {prompt:"Would you prefer to work from home or in an office? Why?", answer:"(free answer)"},
      {prompt:"'Self-discipline' means controlling your own ___.", answer:"behaviour / work habits"},
      {prompt:"What does 'hybrid' working mean?", answer:"some days at home, some days in the office"},
      {prompt:"Name one benefit of working in an office.", answer:"(free — colleagues, structure, separation)"},
    ],
    auctionSentences: [
      { sentence:"Working from home allows employees to save time on commuting.", isCorrect:true, explanation:"'Allows + object + to + infinitive' is the correct structure." },
      { sentence:"Working from home allow employees to save time on commuting.", isCorrect:false, explanation:"'Working from home' is singular — use 'allows', not 'allow'." },
      { sentence:"Many people find it difficult to concentrate when they work from home.", isCorrect:true, explanation:"'Find it difficult to + infinitive' is correct." },
      { sentence:"Many people find it difficult to concentrating when they work from home.", isCorrect:false, explanation:"After 'to' use the infinitive: 'to concentrate', not 'concentrating'." },
      { sentence:"Remote workers often feel isolated from their colleagues.", isCorrect:true, explanation:"'Feel isolated from' is the correct collocation." },
      { sentence:"Remote workers often feel isolated of their colleagues.", isCorrect:false, explanation:"The correct preposition is 'from' — 'isolated from'." },
      { sentence:"Video calls have replaced many face-to-face meetings.", isCorrect:true, explanation:"Present perfect 'have replaced' correctly shows a change up to now." },
      { sentence:"Video calls have been replaced many face-to-face meetings.", isCorrect:false, explanation:"Use active here — video calls did the replacing. Remove 'been'." },
      { sentence:"Working from home requires a high level of self-discipline.", isCorrect:true, explanation:"'Require + noun' is the correct structure." },
      { sentence:"Working from home requires to have a high level of self-discipline.", isCorrect:false, explanation:"'Require + noun' — no 'to have' needed here." },
    ],
    cardTasks: [
      { task:"Say two advantages of working from home and explain each one." },
      { task:"Say two disadvantages of working from home and explain each one." },
      { task:"Would you prefer to work from home or in an office? Give three reasons." },
      { task:"Describe what a perfect home office would look like for you." },
      { task:"What challenges do managers face when their team works remotely?" },
      { task:"How do you think remote work has changed people's social lives?" },
      { task:"Do you think companies should offer flexible hours? Why or why not?" },
      { task:"What skills do you need to be a successful remote worker?" },
      { task:"How can someone avoid distractions when working from home?" },
      { task:"What does 'work-life balance' mean? Is it easier or harder from home?" },
      { task:"Describe a typical working-from-home day from morning to evening." },
      { task:"What types of jobs can be done remotely and which cannot?" },
      { task:"Would you find it easy or hard to work from home? Explain." },
      { task:"What technology is essential for working from home?" },
      { task:"How can remote workers stay connected with their colleagues?" },
      { task:"Do you think hybrid work is the best solution? Why?" },
      { task:"What are the environmental benefits of working from home?" },
      { task:"How might remote work affect young workers starting their first job?" },
      { task:"What would you miss most about the office?" },
      { task:"How has the rise of remote work changed cities and transport?" },
    ],
  },

  learning_language: {
    label: "Learning a Foreign Language",
    category: "topic",
    questions: [
      { type:"finish the sentence", question:"Learning a language helps you ___ with more people around the world.", answer:"communicate / connect", hint:"The main purpose of language", difficulty:"easy" },
      { type:"finish the sentence", question:"One of the best ways to practise is to ___ with native speakers.", answer:"speak / talk", hint:"Using the language in real life", difficulty:"easy" },
      { type:"finish the sentence", question:"Many people use language learning ___ like Duolingo daily.", answer:"apps", hint:"Tools on your phone", difficulty:"easy" },
      { type:"finish the sentence", question:"Immersion means surrounding yourself ___ the language.", answer:"with", hint:"Preposition", difficulty:"easy" },
      { type:"finish the sentence", question:"Learners often feel embarrassed about making ___ in front of others.", answer:"mistakes / errors", hint:"Getting things wrong", difficulty:"easy" },
      { type:"finish the sentence", question:"Listening to music in a foreign language can ___ your vocabulary.", answer:"improve / build / expand", hint:"Making it bigger", difficulty:"easy" },
      { type:"finish the sentence", question:"It is easier to learn a language if you start at a ___ age.", answer:"young / early", hint:"When you're a child", difficulty:"easy" },
      { type:"finish the sentence", question:"Being ___ is essential in language learning.", answer:"patient / persistent", hint:"Not giving up", difficulty:"easy" },
      { type:"finish the sentence", question:"Bilingual people can speak ___ languages fluently.", answer:"two", hint:"Bi- means two", difficulty:"easy" },
      { type:"finish the sentence", question:"A language exchange means practising with a native ___ of the other language.", answer:"speaker", hint:"Someone who grew up with it", difficulty:"easy" },
      { type:"finish the sentence", question:"The communicative approach focuses on ___ rather than grammar rules.", answer:"speaking / communication", hint:"Using the language", difficulty:"medium" },
      { type:"finish the sentence", question:"It is normal to feel ___ when speaking a new language in public.", answer:"nervous / embarrassed", hint:"Worried about what others think", difficulty:"easy" },
      { type:"finish the sentence", question:"Even ___ minutes of daily practice makes a big difference.", answer:"10 / 15 / 20", hint:"A small amount of time", difficulty:"easy" },
      { type:"finish the sentence", question:"The most motivating reason to learn a language is often a personal ___.", answer:"reason / goal / connection", hint:"Why YOU want to learn", difficulty:"medium" },
      { type:"finish the sentence", question:"Translation apps can make learners ___ on technology.", answer:"dependent / reliant", hint:"Using it as a crutch", difficulty:"medium" },
      { type:"finish the sentence", question:"A good language learner is not afraid to ___.", answer:"make mistakes / speak / try", hint:"Taking risks", difficulty:"easy" },
      { type:"finish the sentence", question:"Living in a country where the language is spoken is called language ___.", answer:"immersion", hint:"Being surrounded by it", difficulty:"medium" },
      { type:"finish the sentence", question:"Grammar rules are important, but ___ is what makes you sound natural.", answer:"fluency / practice", hint:"Constant use", difficulty:"medium" },
      { type:"finish the sentence", question:"Children learn languages faster because their brains are more ___.", answer:"flexible / plastic / receptive", hint:"Adaptable", difficulty:"medium" },
      { type:"finish the sentence", question:"Reading books in a foreign language helps you learn ___ words.", answer:"new / vocabulary", hint:"Expanding your knowledge", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"Benefits of Learning a Language", spyTopic:"Challenges of Learning a Language", crewmatePrompt:"Tell the group TWO benefits of learning a foreign language. 'It helps you communicate' or 'It opens career opportunities.'", spyPrompt:"Tell the group TWO challenges of learning a foreign language. 'It takes a long time' or 'Grammar is confusing' or 'You feel embarrassed speaking.'", explanation:"Crewmates discussed benefits. The spy discussed challenges.", spyGuessOptions:["Benefits of Learning a Language","Challenges of Learning a Language","Reasons to Travel","University Studies"] },
      { crewmateTopic:"How to Learn a Language", spyTopic:"How to Learn an Instrument", crewmatePrompt:"Give advice on how to learn a foreign language effectively. 'Watch films in the language', 'speak with native speakers', 'use an app every day.'", spyPrompt:"Give advice on how to learn a musical instrument. 'Practise scales daily', 'find a good teacher', 'listen to music carefully', 'be patient.'", explanation:"Crewmates gave language tips. The spy gave music tips.", spyGuessOptions:["How to Learn a Language","How to Learn an Instrument","How to Study for Exams","How to Get Fit"] },
      { crewmateTopic:"Learning English", spyTopic:"Learning Spanish", crewmatePrompt:"Talk about learning English — why people learn it, where it's useful, and what makes it easy or difficult.", spyPrompt:"Talk about learning Spanish — why people learn it, where it's spoken, and what makes it easy or difficult.", explanation:"Crewmates discussed learning English. The spy discussed learning Spanish.", spyGuessOptions:["Learning English","Learning Spanish","Learning French","Learning Mandarin"] },
      { crewmateTopic:"Language Apps and Technology", spyTopic:"Language Schools and Classes", crewmatePrompt:"Talk about using apps and technology to learn. Mention Duolingo, YouTube, podcasts. How effective are they?", spyPrompt:"Talk about taking classes or going to a language school. Mention teachers, classmates, and structured lessons.", explanation:"Crewmates discussed technology-based learning. The spy discussed classroom learning.", spyGuessOptions:["Language Apps and Technology","Language Schools and Classes","Private Tutoring","Self-Study Books"] },
    ],
    minefieldGrid: {
      topic: "Learning a Foreign Language",
      instructions: "Combine the subject (top) with the phrase (side) to make a sentence about language learning — then add your opinion or experience.",
      colLabels: ["Learning a language…", "The best way to practise…", "Making mistakes…", "Living abroad…", "I think bilingual people…"],
      rowLabels: ["… is difficult because…", "… helps you…", "… is important because…", "… is easier if you…", "… can improve your career because…"],
    },
    hotSeatWords: [
      {word:"fluent"},{word:"accent"},{word:"vocabulary"},{word:"grammar"},
      {word:"immersion"},{word:"bilingual"},{word:"translate"},{word:"native speaker"},
      {word:"practise"},{word:"mistake"},{word:"app"},{word:"confidence"},
      {word:"dialect"},{word:"motivated"},{word:"pronunciation"},{word:"exchange"},
      {word:"beginner"},{word:"advanced"},{word:"listen"},{word:"culture"},
    ],
    hotPotatoPrompts: [
      {prompt:"Name one reason why people learn English.", answer:"(free — work, travel, study)"},
      {prompt:"'Fluent' means you can speak a language ___.", answer:"very well / naturally"},
      {prompt:"'Bilingual' means you speak ___ languages.", answer:"two"},
      {prompt:"Name one good way to practise a language.", answer:"(free — speaking, films, apps)"},
      {prompt:"'Immersion' means surrounding yourself ___ the language.", answer:"with"},
      {prompt:"What does a 'language exchange' involve?", answer:"practising with a native speaker of the other language"},
      {prompt:"Why are children often better at learning languages?", answer:"(free — not afraid of mistakes, flexible brains)"},
      {prompt:"Name a popular language learning app.", answer:"Duolingo / Babbel"},
      {prompt:"Why is making mistakes important in language learning?", answer:"(free — you learn from them)"},
      {prompt:"'Pronunciation' is how you ___ words.", answer:"say / pronounce"},
      {prompt:"What is a 'native speaker'?", answer:"someone who grew up speaking that language"},
      {prompt:"Name one benefit of speaking more than one language.", answer:"(free — career, travel, communication)"},
      {prompt:"'Vocabulary' means the ___ you know.", answer:"words"},
      {prompt:"What makes English difficult to learn?", answer:"(free — spelling, irregular verbs, idioms)"},
      {prompt:"What does 'consistent practice' mean?", answer:"practising regularly, every day"},
      {prompt:"Name one thing that puts people off speaking a foreign language.", answer:"(free — embarrassment, fear of mistakes)"},
      {prompt:"What language would you most like to learn? Why?", answer:"(free answer)"},
      {prompt:"'Grammar' refers to the ___ of a language.", answer:"rules / structure"},
      {prompt:"Is it easier to learn a language you are motivated to learn?", answer:"(free — yes, motivation makes a big difference)"},
      {prompt:"What advice would you give someone just starting to learn English?", answer:"(free answer)"},
    ],
    auctionSentences: [
      { sentence:"Learning a foreign language opens up many career opportunities.", isCorrect:true, explanation:"Gerund subject 'Learning' takes singular verb 'opens'." },
      { sentence:"Learning a foreign language open up many career opportunities.", isCorrect:false, explanation:"Gerund subject is singular — use 'opens', not 'open'." },
      { sentence:"It is important to practise speaking every day.", isCorrect:true, explanation:"'It is important to + infinitive' is correct." },
      { sentence:"It is important practising speaking every day.", isCorrect:false, explanation:"After 'it is important', use 'to + infinitive': 'to practise'." },
      { sentence:"Many people feel embarrassed when they make mistakes in public.", isCorrect:true, explanation:"'Feel embarrassed' and 'make mistakes' are natural collocations." },
      { sentence:"Many people feel embarrassed when they do mistakes in public.", isCorrect:false, explanation:"'Make mistakes' is correct — not 'do mistakes'." },
      { sentence:"Children learn languages more easily than adults.", isCorrect:true, explanation:"'More easily' is the correct adverb comparative." },
      { sentence:"Children learn languages more easy than adults.", isCorrect:false, explanation:"Use the adverb form 'easily', not the adjective 'easy'." },
      { sentence:"Living abroad is one of the best ways to improve your language skills.", isCorrect:true, explanation:"'One of the best + plural noun' is the correct superlative structure." },
      { sentence:"Living abroad is one of the best way to improve your language skills.", isCorrect:false, explanation:"After 'one of the best', use the plural: 'ways'." },
    ],
    cardTasks: [
      { task:"Why do you think English is so widely spoken around the world?" },
      { task:"What is the most effective way to learn a foreign language? Give your top three tips." },
      { task:"Have you ever tried to learn a language? What was easy or difficult?" },
      { task:"Do you think translation apps are helpful or harmful for learners? Why?" },
      { task:"Should children learn foreign languages from a young age? Why?" },
      { task:"What do you think is more important — grammar or fluency?" },
      { task:"How does learning a language help you understand another culture?" },
      { task:"What motivates people to learn a new language? Give three reasons." },
      { task:"Describe what a language exchange is and whether you would like to do one." },
      { task:"Is living in a country the best way to learn its language?" },
      { task:"What language would you most like to learn and why?" },
      { task:"Why do some people give up learning a language? What could help them?" },
      { task:"How has technology changed the way people learn languages?" },
      { task:"Is it possible to become fluent without going to the country?" },
      { task:"What is the difference between being fluent and being good at a language?" },
      { task:"What are the advantages of being bilingual or multilingual?" },
      { task:"How do you feel when you make a mistake in English? What do you do?" },
      { task:"How important is pronunciation when learning a language?" },
      { task:"What advice would you give someone just starting to learn English?" },
      { task:"Do you think adults can become as fluent as children in a second language?" },
    ],
  },

  education_systems: {
    label: "Education Systems",
    category: "topic",
    questions: [
      { type:"finish the sentence", question:"Education helps people develop skills and ___ for their future.", answer:"knowledge / opportunities", hint:"What education prepares you for", difficulty:"easy" },
      { type:"finish the sentence", question:"In many countries, education is ___ for children between certain ages.", answer:"compulsory / mandatory", hint:"You have no choice", difficulty:"medium" },
      { type:"finish the sentence", question:"University fees can be very high, leaving students with large ___.", answer:"debts / loans", hint:"Money they owe", difficulty:"medium" },
      { type:"finish the sentence", question:"Private schools are different because students have to ___ to attend.", answer:"pay / pay fees", hint:"Money", difficulty:"easy" },
      { type:"finish the sentence", question:"A curriculum is the set of ___ students study during their education.", answer:"subjects / topics / courses", hint:"What is taught", difficulty:"easy" },
      { type:"finish the sentence", question:"Exams are used to ___ what students have learned.", answer:"test / assess / measure", hint:"Check knowledge", difficulty:"easy" },
      { type:"finish the sentence", question:"Some believe traditional education focuses too much on ___ and not creativity.", answer:"memorisation / exams / grades", hint:"Learning facts by heart", difficulty:"medium" },
      { type:"finish the sentence", question:"Lifelong learning means continuing to ___ throughout your whole life.", answer:"learn / study / develop", hint:"Education does not stop", difficulty:"easy" },
      { type:"finish the sentence", question:"A scholarship is financial ___ given to students based on ability or need.", answer:"support / help / aid", hint:"Money to help", difficulty:"medium" },
      { type:"finish the sentence", question:"Critical thinking means being able to ___ information rather than just accepting it.", answer:"analyse / question / evaluate", hint:"Not just believing everything", difficulty:"medium" },
      { type:"finish the sentence", question:"E-learning refers to education delivered through the ___ or digital devices.", answer:"internet / online", hint:"Digital technology", difficulty:"easy" },
      { type:"finish the sentence", question:"The ___ rate refers to the percentage of people who can read and write.", answer:"literacy", hint:"Being able to read and write", difficulty:"medium" },
      { type:"finish the sentence", question:"Gap years are taken between school and university to ___ or travel.", answer:"work / gain experience", hint:"Do something different", difficulty:"easy" },
      { type:"finish the sentence", question:"Teachers play a crucial role in ___ the next generation.", answer:"educating / shaping / inspiring", hint:"What teachers do", difficulty:"easy" },
      { type:"finish the sentence", question:"Mixed-ability classes include students of ___ skill levels.", answer:"different / varying / mixed", hint:"Not all the same", difficulty:"easy" },
      { type:"finish the sentence", question:"Homework is given to practise at ___ after school.", answer:"home", hint:"Where you go after school", difficulty:"easy" },
      { type:"finish the sentence", question:"A bachelor's degree is usually a three or four year ___ qualification.", answer:"university", hint:"What level it is", difficulty:"easy" },
      { type:"finish the sentence", question:"In Finland, students start formal schooling at ___, later than most countries.", answer:"seven / age 7", hint:"A specific age", difficulty:"medium" },
      { type:"finish the sentence", question:"Students who study abroad gain ___ experience and meet different cultures.", answer:"international / global", hint:"Experience beyond their country", difficulty:"medium" },
      { type:"finish the sentence", question:"Some people believe grades are less important than ___ skills for real life.", answer:"practical / life", hint:"Skills you actually use", difficulty:"medium" },
    ],
    spyRounds: [
      { crewmateTopic:"Advantages of Exams", spyTopic:"Disadvantages of Exams", crewmatePrompt:"Tell the group TWO reasons why exams are useful. 'Exams motivate students to study' or 'They show what a student has learned.'", spyPrompt:"Tell the group TWO problems with exams. 'Exams cause a lot of stress' or 'They don't test creativity' or 'Students just memorise facts.'", explanation:"Crewmates supported exams. The spy argued against them.", spyGuessOptions:["Advantages of Exams","Disadvantages of Exams","University Life","School Subjects"] },
      { crewmateTopic:"Private Schools", spyTopic:"State Schools", crewmatePrompt:"Talk about private schools — what they offer, who attends, and the advantages and disadvantages.", spyPrompt:"Talk about state schools — what they offer, who attends, and the advantages and disadvantages.", explanation:"Crewmates discussed private schools. The spy discussed state schools.", spyGuessOptions:["Private Schools","State Schools","Online Schools","International Schools"] },
      { crewmateTopic:"Education in Your Country", spyTopic:"Education in Another Country", crewmatePrompt:"Describe how the education system works in your own country. Talk about school age, subjects, exams, and university.", spyPrompt:"Describe how the education system works in a different country — maybe Finland, the USA, Japan, or the UK.", explanation:"Crewmates described their own system. The spy described a foreign system.", spyGuessOptions:["Education in Your Country","Education in Another Country","Homeschooling","Online Learning"] },
      { crewmateTopic:"The Role of Teachers", spyTopic:"The Role of Technology in Education", crewmatePrompt:"Talk about why teachers are important. What do they do beyond teaching? Mention motivation, role models, and relationships.", spyPrompt:"Talk about how technology has changed education. Mention online learning, apps, AI, and digital tools.", explanation:"Crewmates focused on teachers. The spy focused on technology.", spyGuessOptions:["The Role of Teachers","The Role of Technology","School Rules","Education Funding"] },
    ],
    minefieldGrid: {
      topic: "Education Systems",
      instructions: "Combine the subject (top) with the phrase (side) to make a sentence about education — then add your opinion or experience.",
      colLabels: ["Exams…", "Private schools…", "Teachers…", "University…", "The education system in my country…"],
      rowLabels: ["… are important because…", "… should be changed because…", "… help students by…", "… are better than before because…", "… need to improve in terms of…"],
    },
    hotSeatWords: [
      {word:"exam"},{word:"homework"},{word:"curriculum"},{word:"scholarship"},
      {word:"degree"},{word:"university"},{word:"teacher"},{word:"literacy"},
      {word:"compulsory"},{word:"private school"},{word:"grade"},{word:"subject"},
      {word:"tuition"},{word:"dropout"},{word:"graduate"},{word:"classroom"},
      {word:"e-learning"},{word:"gap year"},{word:"critical thinking"},{word:"state school"},
    ],
    hotPotatoPrompts: [
      {prompt:"What does 'compulsory education' mean?", answer:"education required by law"},
      {prompt:"Name two subjects usually taught in schools.", answer:"(free — maths, English, science, history)"},
      {prompt:"What is the difference between a private and a state school?", answer:"private costs money; state is free"},
      {prompt:"What is a 'scholarship'?", answer:"financial support given based on ability or need"},
      {prompt:"'Literacy' means the ability to ___ and ___.", answer:"read and write"},
      {prompt:"What does a bachelor's degree mean?", answer:"a first university qualification, usually 3-4 years"},
      {prompt:"Why do some students take a gap year?", answer:"(free — to travel, work, gain experience)"},
      {prompt:"Name one advantage of exams.", answer:"(free — they motivate students, show what's learned)"},
      {prompt:"Name one disadvantage of exams.", answer:"(free — stress, not testing creativity)"},
      {prompt:"What does 'e-learning' mean?", answer:"learning online / through digital devices"},
      {prompt:"What age do children start school in your country?", answer:"(free answer)"},
      {prompt:"What is 'critical thinking'?", answer:"analysing information rather than just accepting it"},
      {prompt:"Name one way schools have changed in the last 20 years.", answer:"(free — technology, online lessons)"},
      {prompt:"What does a teacher do apart from teaching the subject?", answer:"(free — motivates, supports, inspires)"},
      {prompt:"Should university be free for everyone? Give one reason.", answer:"(free answer)"},
      {prompt:"What is homework for?", answer:"to practise what was learned in class"},
      {prompt:"Name one thing that makes a good school.", answer:"(free — good teachers, resources, safe environment)"},
      {prompt:"What does 'lifelong learning' mean?", answer:"continuing to learn throughout your whole life"},
      {prompt:"Should schools teach more practical skills? Why?", answer:"(free answer)"},
      {prompt:"'Graduate' means someone who has ___ their studies.", answer:"completed / finished"},
    ],
    auctionSentences: [
      { sentence:"Education plays a vital role in preparing young people for the future.", isCorrect:true, explanation:"'Play a role in + -ing' is the correct collocation." },
      { sentence:"Education plays a vital role to prepare young people for the future.", isCorrect:false, explanation:"'Play a role in + -ing' — not 'to + infinitive'." },
      { sentence:"Many students struggle with the pressure of exams.", isCorrect:true, explanation:"'Struggle with' is the correct collocation." },
      { sentence:"Private schools often have smaller class sizes than state schools.", isCorrect:true, explanation:"Correct comparative: 'smaller than'." },
      { sentence:"Private schools often have more small class sizes than state schools.", isCorrect:false, explanation:"'Small' takes '-er': 'smaller', not 'more small'." },
      { sentence:"It is important for children to develop critical thinking skills.", isCorrect:true, explanation:"'It is important for + noun + to + infinitive' is correct." },
      { sentence:"It is important for children developing critical thinking skills.", isCorrect:false, explanation:"After 'for + noun', use 'to + infinitive', not '-ing'." },
      { sentence:"University fees have increased significantly over the past decade.", isCorrect:true, explanation:"Present perfect with 'over the past decade' is correct." },
      { sentence:"University fees increased significantly over the past decade.", isCorrect:false, explanation:"'Over the past decade' requires present perfect: 'have increased'." },
      { sentence:"Teachers have a huge influence on the lives of their students.", isCorrect:true, explanation:"'Have an influence on' is the correct collocation." },
    ],
    cardTasks: [
      { task:"Describe how the education system works in your country from start to finish." },
      { task:"Do you think exams are a fair way to judge a student's ability? Why?" },
      { task:"What are the advantages and disadvantages of private schools?" },
      { task:"Should university education be free for everyone?" },
      { task:"How important is it to go to university? Is it the only path to success?" },
      { task:"What subjects do you think should be compulsory in schools? Why?" },
      { task:"How has technology changed the way students learn?" },
      { task:"What makes a great teacher? Describe the qualities of your best teacher." },
      { task:"Should homework be banned? Give arguments for and against." },
      { task:"What are the advantages of studying abroad?" },
      { task:"Do you think the education system prepares students well for real life?" },
      { task:"What is 'lifelong learning' and why is it becoming more important?" },
      { task:"Is it better to specialise in one subject or study a wide range?" },
      { task:"How important are grades compared to actually learning?" },
      { task:"What practical skills should schools teach that they currently don't?" },
      { task:"Should schools group students by ability or teach mixed classes?" },
      { task:"What are the benefits of arts and creative subjects in school?" },
      { task:"How can schools better support students with different learning needs?" },
      { task:"Describe your ideal school — what would it look like?" },
      { task:"How do education systems differ between countries? Give examples." },
    ],
  },

  career_choices: {
    label: "Career Choices",
    category: "topic",
    questions: [
      { type:"finish the sentence", question:"When choosing a career, consider both your ___ and your interests.", answer:"skills / strengths", hint:"What you are good at", difficulty:"easy" },
      { type:"finish the sentence", question:"A job you are passionate about leads to greater ___ at work.", answer:"satisfaction / motivation", hint:"Feeling good about your work", difficulty:"easy" },
      { type:"finish the sentence", question:"Many young people feel ___ about choosing the right career path.", answer:"unsure / uncertain / pressured", hint:"Not knowing what to do", difficulty:"easy" },
      { type:"finish the sentence", question:"Work experience helps you ___ what a real job is like.", answer:"understand / discover", hint:"Learning firsthand", difficulty:"easy" },
      { type:"finish the sentence", question:"Networking means building ___ with people who can help your career.", answer:"connections / relationships", hint:"Professional friendships", difficulty:"medium" },
      { type:"finish the sentence", question:"Changing career in your 30s is sometimes called a career ___.", answer:"change / switch / pivot", hint:"Starting something different", difficulty:"medium" },
      { type:"finish the sentence", question:"A good CV highlights your skills, experience, and ___.", answer:"achievements / qualifications", hint:"What makes you stand out", difficulty:"easy" },
      { type:"finish the sentence", question:"Job security means knowing your ___ is unlikely to disappear.", answer:"job / position", hint:"Not worrying about being fired", difficulty:"easy" },
      { type:"finish the sentence", question:"Freelancers work ___ rather than for a single employer.", answer:"independently / for themselves", hint:"Their own boss", difficulty:"medium" },
      { type:"finish the sentence", question:"Many parents put ___ on children to choose a stable, well-paid career.", answer:"pressure", hint:"A strong force", difficulty:"easy" },
      { type:"finish the sentence", question:"Soft skills like communication and ___ are valued by most employers.", answer:"teamwork / leadership", hint:"Beyond technical knowledge", difficulty:"medium" },
      { type:"finish the sentence", question:"An internship is a ___ work placement, often done by students.", answer:"temporary / short-term", hint:"Not permanent", difficulty:"easy" },
      { type:"finish the sentence", question:"Salary is the ___ you receive for your work, usually monthly.", answer:"money / payment / income", hint:"What you get paid", difficulty:"easy" },
      { type:"finish the sentence", question:"Some people prioritise ___ over salary when choosing a job.", answer:"purpose / passion / flexibility", hint:"What the job means to them", difficulty:"medium" },
      { type:"finish the sentence", question:"A mentor is someone with more experience who gives you ___ and guidance.", answer:"advice / support", hint:"Help from an experienced person", difficulty:"easy" },
      { type:"finish the sentence", question:"The gig economy involves short-term and ___ work rather than permanent jobs.", answer:"flexible / freelance", hint:"Not fixed contracts", difficulty:"medium" },
      { type:"finish the sentence", question:"Being ___ means you can learn new skills and adapt to different roles.", answer:"adaptable / flexible", hint:"Changing to suit situations", difficulty:"medium" },
      { type:"finish the sentence", question:"Automation and AI are making ___ skills more important for future careers.", answer:"digital / technical", hint:"Skills for the modern world", difficulty:"medium" },
      { type:"finish the sentence", question:"A career counsellor helps people ___ which career suits their personality.", answer:"decide / discover / figure out", hint:"Making a decision with support", difficulty:"easy" },
      { type:"finish the sentence", question:"People often pursue a career in medicine because it is both respected and well-___.", answer:"paid", hint:"The salary", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"Choosing Based on Passion", spyTopic:"Choosing Based on Salary", crewmatePrompt:"Argue that you should choose a career based on what you love. Give reasons and examples.", spyPrompt:"Argue that you should choose a career based on how much it pays. Give reasons and examples.", explanation:"Crewmates argued for passion. The spy argued for salary.", spyGuessOptions:["Following Your Passion","Prioritising Salary","Job Security","Work-Life Balance"] },
      { crewmateTopic:"Traditional Careers", spyTopic:"Modern Digital Careers", crewmatePrompt:"Talk about traditional careers like doctor, lawyer, engineer, or teacher. Why do people choose these?", spyPrompt:"Talk about modern careers like content creator, app developer, or influencer. Why do people choose these?", explanation:"Crewmates discussed traditional careers. The spy discussed newer careers.", spyGuessOptions:["Traditional Careers","Modern Digital Careers","Part-time Jobs","Voluntary Work"] },
      { crewmateTopic:"Working for a Company", spyTopic:"Being Self-Employed", crewmatePrompt:"Talk about the benefits of working for an established company. Mention job security, salary, colleagues, and career progression.", spyPrompt:"Talk about the benefits of being self-employed or a freelancer. Mention freedom, flexibility, and being your own boss.", explanation:"Crewmates talked about employment in a company. The spy talked about being self-employed.", spyGuessOptions:["Working for a Company","Being Self-Employed","Volunteering","Studying"] },
      { crewmateTopic:"Career Advice for Young People", spyTopic:"Advice for Changing Career Later", crewmatePrompt:"Give advice to a young person just starting to think about their career. What should they consider?", spyPrompt:"Give advice to someone who wants to change their career in their 30s or 40s. How should they make the transition?", explanation:"Crewmates gave starting advice. The spy gave mid-life career change advice.", spyGuessOptions:["Starting a Career","Changing Career Later","Going Back to Education","Retirement Planning"] },
    ],
    minefieldGrid: {
      topic: "Career Choices",
      instructions: "Combine the subject (top) with the phrase (side) to make a sentence about careers — then add your opinion or experience.",
      colLabels: ["Choosing a career…", "Job satisfaction…", "Young people today…", "I think a good job should…", "Salary…"],
      rowLabels: ["… is important because…", "… depends on your…", "… is harder than before because…", "… should be based on…", "… can affect your wellbeing because…"],
    },
    hotSeatWords: [
      {word:"salary"},{word:"passion"},{word:"career"},{word:"internship"},
      {word:"CV"},{word:"interview"},{word:"promotion"},{word:"retirement"},
      {word:"freelancer"},{word:"networking"},{word:"mentor"},{word:"ambition"},
      {word:"qualification"},{word:"job security"},{word:"soft skills"},{word:"industry"},
      {word:"entrepreneur"},{word:"redundancy"},{word:"vocation"},{word:"employer"},
    ],
    hotPotatoPrompts: [
      {prompt:"What is a CV?", answer:"a document listing your experience and skills for a job"},
      {prompt:"Name one factor to consider when choosing a career.", answer:"(free — salary, passion, job security)"},
      {prompt:"What does 'job security' mean?", answer:"knowing your job is stable and unlikely to disappear"},
      {prompt:"What is a 'freelancer'?", answer:"someone who works independently for multiple clients"},
      {prompt:"What does 'networking' mean?", answer:"building professional connections and relationships"},
      {prompt:"Name one soft skill employers look for.", answer:"(free — communication, teamwork, problem-solving)"},
      {prompt:"What is an 'internship'?", answer:"a temporary work placement, often for students"},
      {prompt:"What is a 'mentor'?", answer:"an experienced person who gives advice and guidance"},
      {prompt:"Salary is the ___ you receive for your work.", answer:"money / payment"},
      {prompt:"What does 'career change' mean?", answer:"switching to a completely different type of job"},
      {prompt:"Name a job that requires a university degree.", answer:"(free — doctor, lawyer, engineer)"},
      {prompt:"Name a job that does not require a university degree.", answer:"(free — plumber, chef, electrician)"},
      {prompt:"Should you choose a job based on money or passion?", answer:"(free answer)"},
      {prompt:"What is 'job satisfaction'?", answer:"feeling happy and fulfilled in your work"},
      {prompt:"What does an employer look for in a job interview?", answer:"(free — skills, confidence, experience)"},
      {prompt:"What is the gig economy?", answer:"short-term, flexible work rather than permanent jobs"},
      {prompt:"Name one career you think will grow in the future.", answer:"(free answer)"},
      {prompt:"What would be your ideal job? Why?", answer:"(free answer)"},
      {prompt:"What is entrepreneurship?", answer:"starting and running your own business"},
      {prompt:"Name one advantage of being self-employed.", answer:"(free — flexibility, being your own boss)"},
    ],
    auctionSentences: [
      { sentence:"Choosing a career is one of the most important decisions you will ever make.", isCorrect:true, explanation:"'One of the most important + plural noun' is correct." },
      { sentence:"Choosing a career is one of the most important decision you will ever make.", isCorrect:false, explanation:"After 'one of the most', use the plural: 'decisions'." },
      { sentence:"Many young people feel pressured to choose a career before they are ready.", isCorrect:true, explanation:"'Feel pressured to + infinitive' is correct." },
      { sentence:"Job satisfaction is more important than a high salary for many people.", isCorrect:true, explanation:"Correct comparative: 'more important than'." },
      { sentence:"Job satisfaction is more important as a high salary for many people.", isCorrect:false, explanation:"Use 'than' in comparatives — not 'as'." },
      { sentence:"Gaining work experience before graduating can improve your job prospects.", isCorrect:true, explanation:"Gerund subject 'Gaining' with 'can improve' is correct." },
      { sentence:"Freelancers enjoy greater flexibility but less job security.", isCorrect:true, explanation:"'Less' is correct — 'security' is uncountable." },
      { sentence:"Freelancers enjoy greater flexibility but fewer job security.", isCorrect:false, explanation:"'Security' is uncountable — use 'less', not 'fewer'." },
      { sentence:"It is essential to update your CV regularly.", isCorrect:true, explanation:"'It is essential to + infinitive' is correct." },
      { sentence:"It is essential updating your CV regularly.", isCorrect:false, explanation:"'It is essential to + infinitive' — not '-ing'." },
    ],
    cardTasks: [
      { task:"What factors are most important when choosing a career? Rank them." },
      { task:"Should you follow your passion or choose a practical career?" },
      { task:"Describe your dream job and explain why it appeals to you." },
      { task:"What advice would you give to a 16-year-old choosing their career?" },
      { task:"What are the advantages and disadvantages of being self-employed?" },
      { task:"How has technology changed the types of jobs available?" },
      { task:"Do you think parents should influence their children's career choices?" },
      { task:"What soft skills are most valued by employers today?" },
      { task:"What is the most important thing in a job — money, passion, or stability?" },
      { task:"Describe what a job interview is like and how you would prepare." },
      { task:"Would you rather work for a big company or start your own business?" },
      { task:"How important is job security in today's world?" },
      { task:"What careers do you think will grow in the next 20 years?" },
      { task:"What is a career change and why might someone decide to make one?" },
      { task:"Is a university degree essential for a good career? Give examples." },
      { task:"How can networking help someone's career?" },
      { task:"What are the benefits of doing an internship?" },
      { task:"How do gender and background affect career opportunities?" },
      { task:"What does success in a career mean to you personally?" },
      { task:"How do cultural expectations affect career choices in your country?" },
    ],
  },

  work_life_balance: {
    label: "Work-Life Balance",
    category: "topic",
    questions: [
      { type:"finish the sentence", question:"Work-life balance means finding a healthy ___ between your job and personal life.", answer:"balance / equilibrium", hint:"An equal split", difficulty:"easy" },
      { type:"finish the sentence", question:"Burnout happens when someone is too ___ with no time to rest.", answer:"stressed / overworked", hint:"Working too much", difficulty:"easy" },
      { type:"finish the sentence", question:"Many companies offer ___ hours so employees can manage their time better.", answer:"flexible / flexi", hint:"Not fixed 9-to-5", difficulty:"easy" },
      { type:"finish the sentence", question:"Taking regular ___ helps prevent stress and improves productivity.", answer:"breaks / holidays", hint:"Stopping work temporarily", difficulty:"easy" },
      { type:"finish the sentence", question:"Some countries have introduced a four-day ___ to improve wellbeing.", answer:"working week", hint:"How many days people work", difficulty:"easy" },
      { type:"finish the sentence", question:"People who struggle with balance often find it hard to ___ after work.", answer:"switch off / relax", hint:"Stop thinking about work", difficulty:"easy" },
      { type:"finish the sentence", question:"Spending quality ___ with family is an important part of a healthy life.", answer:"time", hint:"Time that matters", difficulty:"easy" },
      { type:"finish the sentence", question:"The pressure to always be ___ on email makes it hard to disconnect.", answer:"available / online", hint:"Always accessible", difficulty:"medium" },
      { type:"finish the sentence", question:"A poor work-life balance can lead to health ___ like stress and insomnia.", answer:"problems / issues", hint:"Things that go wrong", difficulty:"medium" },
      { type:"finish the sentence", question:"Setting ___ means deciding what work you will not do outside hours.", answer:"boundaries / limits", hint:"Rules you set for yourself", difficulty:"medium" },
      { type:"finish the sentence", question:"In some cultures, working very long hours is seen as a sign of ___.", answer:"dedication / loyalty / commitment", hint:"Positive work attitude", difficulty:"medium" },
      { type:"finish the sentence", question:"The concept of hustle culture promotes working hard at the expense of ___.", answer:"health / wellbeing / personal life", hint:"What you sacrifice", difficulty:"medium" },
      { type:"finish the sentence", question:"A healthy work-life balance makes employees more ___ in the long run.", answer:"productive / motivated", hint:"Better at their job", difficulty:"easy" },
      { type:"finish the sentence", question:"Paid ___ leave allows employees to recover from illness.", answer:"sick", hint:"When you are not well", difficulty:"easy" },
      { type:"finish the sentence", question:"Meditation and ___ are popular ways to manage work-related stress.", answer:"mindfulness / yoga", hint:"Calming activities", difficulty:"medium" },
      { type:"finish the sentence", question:"Saying no to extra work is important for maintaining your ___.", answer:"wellbeing / health / balance", hint:"Taking care of yourself", difficulty:"easy" },
      { type:"finish the sentence", question:"Remote work can ___ work-life balance for some, but make it worse for others.", answer:"improve / help", hint:"Making it better", difficulty:"easy" },
      { type:"finish the sentence", question:"Exercise and hobbies outside work are important for mental ___.", answer:"health / wellbeing", hint:"How your mind feels", difficulty:"easy" },
      { type:"finish the sentence", question:"Employers who care about balance often offer mental ___ support.", answer:"health", hint:"Mind and emotional support", difficulty:"easy" },
      { type:"finish the sentence", question:"A good balance means working enough to be successful but not at the expense of ___.", answer:"health / relationships / happiness", hint:"What you lose if you overwork", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"Good Work-Life Balance", spyTopic:"Poor Work-Life Balance", crewmatePrompt:"Describe what life is like for someone who has a healthy work-life balance. How do they spend their time? How do they feel?", spyPrompt:"Describe what life is like for someone who has a very poor work-life balance. How do they feel? What consequences do they face?", explanation:"Crewmates described a healthy balance. The spy described an unhealthy, work-dominated life.", spyGuessOptions:["Good Work-Life Balance","Poor Work-Life Balance","Life in Retirement","Student Life"] },
      { crewmateTopic:"Benefits of a Four-Day Work Week", spyTopic:"Arguments Against a Four-Day Work Week", crewmatePrompt:"Argue in favour of a four-day working week. Say why it would benefit workers and businesses.", spyPrompt:"Argue against a four-day working week. Say why it could cause problems for businesses and the economy.", explanation:"Crewmates supported the four-day week. The spy argued against it.", spyGuessOptions:["For a Four-Day Work Week","Against a Four-Day Work Week","Longer Working Hours","Paid Overtime"] },
      { crewmateTopic:"Work Stress", spyTopic:"Personal Life Stress", crewmatePrompt:"Talk about the causes and effects of stress related to work. Mention deadlines, pressure, and workload.", spyPrompt:"Talk about the causes and effects of stress in personal life. Mention relationships, money worries, and family responsibilities.", explanation:"Crewmates discussed work stress. The spy discussed personal life stress.", spyGuessOptions:["Work Stress","Personal Life Stress","Study Stress","Financial Stress"] },
      { crewmateTopic:"Tips for Better Work-Life Balance", spyTopic:"Tips for Being More Productive", crewmatePrompt:"Give three practical tips for improving work-life balance. For example: set boundaries, take regular breaks, leave work on time.", spyPrompt:"Give three tips for being more productive during work hours. For example: make a to-do list, avoid distractions, batch similar tasks.", explanation:"Crewmates gave balance tips. The spy gave productivity tips.", spyGuessOptions:["Work-Life Balance Tips","Productivity Tips","Relaxation Techniques","Time Management Strategies"] },
    ],
    minefieldGrid: {
      topic: "Work-Life Balance",
      instructions: "Combine the subject (top) with the phrase (side) to make a sentence about work-life balance — then add your own view.",
      colLabels: ["A good work-life balance…", "Burnout…", "Flexible working hours…", "In my country, people…", "I think companies should…"],
      rowLabels: ["… is important because…", "… can happen when…", "… help workers by…", "… work too much because…", "… give employees more…"],
    },
    hotSeatWords: [
      {word:"burnout"},{word:"flexible"},{word:"boundary"},{word:"stress"},
      {word:"wellbeing"},{word:"holiday"},{word:"overtime"},{word:"disconnect"},
      {word:"mindfulness"},{word:"deadline"},{word:"break"},{word:"workload"},
      {word:"productivity"},{word:"exhaustion"},{word:"switch off"},{word:"hobby"},
      {word:"hustle"},{word:"balance"},{word:"routine"},{word:"rest"},
    ],
    hotPotatoPrompts: [
      {prompt:"What is work-life balance?", answer:"having a healthy split between work and personal life"},
      {prompt:"What does burnout mean?", answer:"extreme tiredness from overworking"},
      {prompt:"Name one sign of poor work-life balance.", answer:"(free — no time for hobbies, always tired)"},
      {prompt:"What does switching off after work mean?", answer:"stopping thinking about work and relaxing"},
      {prompt:"Name one activity that reduces work stress.", answer:"(free — exercise, meditation, reading)"},
      {prompt:"What are flexible hours?", answer:"choosing when you start and finish work"},
      {prompt:"What is overtime?", answer:"working more hours than contracted"},
      {prompt:"Name one benefit of a four-day working week.", answer:"(free — more rest, less stress)"},
      {prompt:"What does setting boundaries mean at work?", answer:"deciding what you will and will not do outside hours"},
      {prompt:"Wellbeing refers to physical and ___ health.", answer:"mental / emotional"},
      {prompt:"Name one thing that makes it hard to switch off.", answer:"(free — email, phone, always being contactable)"},
      {prompt:"Is it possible to be very successful AND have good balance?", answer:"(free answer)"},
      {prompt:"What is hustle culture?", answer:"the belief that you should always be working hard"},
      {prompt:"Name one health problem caused by too much stress.", answer:"(free — anxiety, insomnia, headaches)"},
      {prompt:"What could a company do to improve balance?", answer:"(free — flexible hours, mental health support)"},
      {prompt:"What do you do to relax after a long day?", answer:"(free answer)"},
      {prompt:"What is mindfulness?", answer:"focusing on the present moment to reduce stress"},
      {prompt:"Do you think people in your country work too much?", answer:"(free answer)"},
      {prompt:"Why are regular holidays important?", answer:"(free — rest, recharge, spend time with family)"},
      {prompt:"Should employees be allowed to ignore work emails after hours?", answer:"(free answer)"},
    ],
    auctionSentences: [
      { sentence:"Maintaining a good work-life balance is essential for long-term health.", isCorrect:true, explanation:"Gerund subject 'Maintaining' with 'is' is correct." },
      { sentence:"Employees who take regular breaks are often more productive.", isCorrect:true, explanation:"'Who' is correct for people in relative clauses." },
      { sentence:"Employees which take regular breaks are often more productive.", isCorrect:false, explanation:"Use 'who' for people — not 'which'." },
      { sentence:"Many people find it difficult to switch off from work after hours.", isCorrect:true, explanation:"'Find it difficult to + infinitive' and 'switch off from' are correct." },
      { sentence:"Many people find it difficult switching off from work after hours.", isCorrect:false, explanation:"'Find it difficult to + infinitive' — use 'to switch', not 'switching'." },
      { sentence:"Working long hours can have a negative impact on mental health.", isCorrect:true, explanation:"'Have an impact on' is the correct collocation." },
      { sentence:"Working long hours can have a negative impact in mental health.", isCorrect:false, explanation:"The correct preposition is 'on' — 'impact on mental health'." },
      { sentence:"A four-day working week would allow employees to spend more time with their families.", isCorrect:true, explanation:"'Allow + object + to + infinitive' is correct." },
      { sentence:"A four-day working week would allow employees spending more time with their families.", isCorrect:false, explanation:"'Allow + object + to + infinitive' — use 'to spend', not 'spending'." },
      { sentence:"Having hobbies outside of work is vital for mental wellbeing.", isCorrect:true, explanation:"Gerund subject 'Having' with 'is vital' is correct." },
    ],
    cardTasks: [
      { task:"Do you think you have a good work-life balance? Explain why or why not." },
      { task:"What are the signs that someone is suffering from burnout?" },
      { task:"Should companies force employees to take their full holiday allowance?" },
      { task:"What can individuals do to improve their own work-life balance?" },
      { task:"Should the four-day working week be introduced in your country?" },
      { task:"How does poor work-life balance affect relationships with family and friends?" },
      { task:"Is hustle culture a positive or negative thing? Give your opinion." },
      { task:"How can technology both help and harm work-life balance?" },
      { task:"What responsibilities do employers have for their workers' wellbeing?" },
      { task:"How does work-life balance differ between cultures?" },
      { task:"Describe someone who has a great work-life balance. What do they do?" },
      { task:"What would your ideal daily routine look like for a good balance?" },
      { task:"How important are hobbies and activities outside work for mental health?" },
      { task:"Why do some people find it hard to say no to extra work?" },
      { task:"Should employees be allowed to ignore work emails after hours?" },
      { task:"How has remote work changed work-life balance — for better or worse?" },
      { task:"What do you do to switch off and relax after a stressful day?" },
      { task:"Do people in your country work too much? What could change?" },
      { task:"How can parents with young children manage work-life balance?" },
      { task:"What is the relationship between work-life balance and productivity?" },
    ],
  },

  success_motivation: {
    label: "Success and Motivation",
    category: "topic",
    questions: [
      { type:"finish the sentence", question:"Success means different things to different people — for some it's wealth, for others it's ___.", answer:"happiness / family / freedom", hint:"What else people value", difficulty:"easy" },
      { type:"finish the sentence", question:"Setting clear ___ helps you stay focused and measure your progress.", answer:"goals / targets", hint:"What you aim for", difficulty:"easy" },
      { type:"finish the sentence", question:"Intrinsic motivation comes from ___, not from external rewards.", answer:"within / inside yourself", hint:"An internal drive", difficulty:"medium" },
      { type:"finish the sentence", question:"Fear of ___ can stop people from trying new things.", answer:"failure / rejection", hint:"When things go wrong", difficulty:"easy" },
      { type:"finish the sentence", question:"Successful people often talk about the importance of ___ after setbacks.", answer:"resilience / persistence", hint:"Not giving up", difficulty:"medium" },
      { type:"finish the sentence", question:"A growth ___ means believing your abilities can improve with effort.", answer:"mindset", hint:"How you think about learning", difficulty:"medium" },
      { type:"finish the sentence", question:"Procrastination means ___ tasks you should be doing.", answer:"delaying / avoiding / putting off", hint:"Not doing what you need to", difficulty:"easy" },
      { type:"finish the sentence", question:"Celebrating small ___ along the way keeps you motivated.", answer:"wins / successes / achievements", hint:"Little steps forward", difficulty:"easy" },
      { type:"finish the sentence", question:"A ___ model is someone whose success inspires you to work harder.", answer:"role", hint:"Someone you look up to", difficulty:"easy" },
      { type:"finish the sentence", question:"External motivation includes things like money, ___, or social status.", answer:"praise / recognition / awards", hint:"Rewards from outside", difficulty:"medium" },
      { type:"finish the sentence", question:"Failure is often seen as a stepping ___ to success.", answer:"stone", hint:"A fixed phrase", difficulty:"medium" },
      { type:"finish the sentence", question:"Positive thinking focuses on ___ rather than problems.", answer:"solutions", hint:"A constructive attitude", difficulty:"easy" },
      { type:"finish the sentence", question:"Discipline is doing what needs to be done even when you don't feel ___.", answer:"motivated / like it", hint:"Acting without the feeling", difficulty:"easy" },
      { type:"finish the sentence", question:"Comparing yourself to others can damage your ___ and reduce motivation.", answer:"confidence / self-esteem", hint:"How you feel about yourself", difficulty:"easy" },
      { type:"finish the sentence", question:"Having a strong ___ in life drives long-term motivation.", answer:"why / reason / purpose", hint:"The deeper reason behind your goals", difficulty:"medium" },
      { type:"finish the sentence", question:"Habits are the ___ of success — small actions done consistently lead to big results.", answer:"foundation / building blocks", hint:"What success is built on", difficulty:"medium" },
      { type:"finish the sentence", question:"Feedback — even negative feedback — helps you ___.", answer:"improve / grow / learn", hint:"Getting better", difficulty:"easy" },
      { type:"finish the sentence", question:"Being accountable to a ___ can help you stay on track.", answer:"friend / mentor / coach", hint:"Another person who checks progress", difficulty:"easy" },
      { type:"finish the sentence", question:"People who are self-___ set their own goals and work without being told.", answer:"motivated / driven / disciplined", hint:"Motivated from within", difficulty:"easy" },
      { type:"finish the sentence", question:"Success without ___ can feel empty — relationships and meaning matter too.", answer:"meaning / purpose / happiness", hint:"What makes success worthwhile", difficulty:"medium" },
    ],
    spyRounds: [
      { crewmateTopic:"What Success Means to You", spyTopic:"What Success Means to Society", crewmatePrompt:"Talk about what success means to you personally. What are your goals? What would make you feel successful in life?", spyPrompt:"Talk about what society generally considers success. What does your culture value — money, status, education, or family?", explanation:"Crewmates talked about personal success. The spy talked about society's definition.", spyGuessOptions:["Personal Success","Society's Definition of Success","Celebrity Success","Academic Success"] },
      { crewmateTopic:"Intrinsic Motivation", spyTopic:"Extrinsic Motivation", crewmatePrompt:"Talk about intrinsic motivation — being driven by personal satisfaction, passion, or curiosity. Give examples.", spyPrompt:"Talk about extrinsic motivation — being driven by rewards, money, grades, or praise. Give examples.", explanation:"Crewmates discussed internal motivation. The spy discussed external motivation.", spyGuessOptions:["Intrinsic Motivation","Extrinsic Motivation","Peer Pressure","Competition"] },
      { crewmateTopic:"A Growth Mindset", spyTopic:"A Fixed Mindset", crewmatePrompt:"Describe what it means to have a growth mindset. How does someone react to failure and challenges?", spyPrompt:"Describe what it means to have a fixed mindset. How does someone react to failure and challenges?", explanation:"Crewmates described a growth mindset. The spy described a fixed mindset.", spyGuessOptions:["Growth Mindset","Fixed Mindset","Competitive Mindset","Creative Mindset"] },
      { crewmateTopic:"Hard Work Leads to Success", spyTopic:"Luck Leads to Success", crewmatePrompt:"Argue that hard work is the most important factor in success. Give examples of people who succeeded through dedication.", spyPrompt:"Argue that luck and opportunity play a huge role in success. Give examples of how timing and connections matter.", explanation:"Crewmates emphasised hard work. The spy emphasised luck and circumstance.", spyGuessOptions:["Hard Work Leads to Success","Luck Leads to Success","Education Leads to Success","Natural Talent"] },
    ],
    minefieldGrid: {
      topic: "Success and Motivation",
      instructions: "Combine the subject (top) with the phrase (side) to make a sentence about success and motivation — then add your view.",
      colLabels: ["Success…", "Motivation…", "Failure…", "I feel most motivated when…", "A growth mindset means…"],
      rowLabels: ["… means different things because…", "… can disappear when…", "… is important because…", "… comes from…", "… helps you succeed by…"],
    },
    hotSeatWords: [
      {word:"goal"},{word:"ambition"},{word:"resilience"},{word:"failure"},
      {word:"procrastination"},{word:"discipline"},{word:"mindset"},{word:"achievement"},
      {word:"motivation"},{word:"role model"},{word:"persistence"},{word:"confidence"},
      {word:"success"},{word:"habit"},{word:"feedback"},{word:"challenge"},
      {word:"reward"},{word:"purpose"},{word:"growth"},{word:"optimism"},
    ],
    hotPotatoPrompts: [
      {prompt:"What does success mean to you?", answer:"(free answer)"},
      {prompt:"Name one thing that motivates you.", answer:"(free answer)"},
      {prompt:"What is procrastination?", answer:"putting off tasks you should be doing"},
      {prompt:"What does resilience mean?", answer:"the ability to recover from setbacks and keep going"},
      {prompt:"What is a growth mindset?", answer:"believing your abilities can improve with effort"},
      {prompt:"Name one quality of a successful person.", answer:"(free — hard work, determination, creativity)"},
      {prompt:"Intrinsic motivation comes from ___ yourself.", answer:"within / inside"},
      {prompt:"Name one thing that can kill motivation.", answer:"(free — failure, criticism, boredom)"},
      {prompt:"What is a role model?", answer:"someone whose success inspires you"},
      {prompt:"Discipline means doing what needs to be done even when you don't feel ___.", answer:"motivated / like it"},
      {prompt:"Name a famous person you consider successful. Why?", answer:"(free answer)"},
      {prompt:"What is the difference between a goal and a dream?", answer:"(free — a goal has a plan)"},
      {prompt:"Why is failure sometimes good for you?", answer:"(free — you learn from it)"},
      {prompt:"What does stepping stone mean in the context of success?", answer:"a failure that helps you reach success"},
      {prompt:"Name one habit of successful people.", answer:"(free — planning, reading, exercise)"},
      {prompt:"Is success about the destination or the journey?", answer:"(free answer)"},
      {prompt:"What does accountability mean?", answer:"being responsible for your own actions and progress"},
      {prompt:"How can comparing yourself to others affect motivation?", answer:"(free — can reduce self-esteem)"},
      {prompt:"What motivates you to learn English more?", answer:"(free answer)"},
      {prompt:"What would motivate you to work much harder?", answer:"(free answer)"},
    ],
    auctionSentences: [
      { sentence:"Success means different things to different people.", isCorrect:true, explanation:"'Success' is singular uncountable — uses 'means'." },
      { sentence:"Success mean different things to different people.", isCorrect:false, explanation:"'Success' is singular — use 'means', not 'mean'." },
      { sentence:"Setting clear goals helps you stay focused and motivated.", isCorrect:true, explanation:"Gerund subject 'Setting' takes singular verb 'helps'." },
      { sentence:"Setting clear goals help you stay focused and motivated.", isCorrect:false, explanation:"Gerund subjects are singular — use 'helps', not 'help'." },
      { sentence:"Failure is often the first step towards success.", isCorrect:true, explanation:"'The first step towards' is a natural expression." },
      { sentence:"People with a growth mindset see challenges as opportunities to learn.", isCorrect:true, explanation:"'See X as Y' is correct." },
      { sentence:"People with a growth mindset see challenges like opportunities to learn.", isCorrect:false, explanation:"'See X as Y' — use 'as', not 'like'." },
      { sentence:"It is important not to compare yourself to others too much.", isCorrect:true, explanation:"'It is important not to + infinitive' is correct." },
      { sentence:"It is important not comparing yourself to others too much.", isCorrect:false, explanation:"'It is important not to + infinitive' — use 'to compare'." },
      { sentence:"Discipline is doing what you need to do even when you don't feel like it.", isCorrect:true, explanation:"'Feel like it' is a natural expression." },
    ],
    cardTasks: [
      { task:"What does success mean to you personally? Has your definition changed?" },
      { task:"Do you think successful people are born talented or develop through hard work?" },
      { task:"Describe someone you admire who you consider very successful. Why?" },
      { task:"How important is money in your definition of success?" },
      { task:"What is a growth mindset and do you think you have one?" },
      { task:"How do you deal with failure? Give an example from your life." },
      { task:"What is procrastination and what can you do to overcome it?" },
      { task:"What motivates you most in your daily life? Give three things." },
      { task:"Does luck play a big role in success? Give examples." },
      { task:"Who is your role model and what can you learn from them?" },
      { task:"How can setting goals help you achieve more?" },
      { task:"What is the difference between being ambitious and being greedy?" },
      { task:"Why do some people give up on their goals? What could help them?" },
      { task:"How do habits contribute to long-term success?" },
      { task:"Can you be successful and still be unhappy? Explain." },
      { task:"What is the role of discipline in achieving goals?" },
      { task:"How does social media affect how we see success?" },
      { task:"What would motivate you to work much harder than you do now?" },
      { task:"Is it more important to achieve your own goals or make others proud?" },
      { task:"What is the relationship between confidence and success?" },
    ],
  },

  time_management: {
    label: "Time Management",
    category: "topic",
    questions: [
      { type:"finish the sentence", question:"Time management means organising your time so you can ___ your tasks efficiently.", answer:"complete / finish / do", hint:"Getting things done", difficulty:"easy" },
      { type:"finish the sentence", question:"A to-do list helps you ___ which tasks need to be done first.", answer:"prioritise / decide", hint:"Putting the most important first", difficulty:"easy" },
      { type:"finish the sentence", question:"Procrastination is one of the main ___ to good time management.", answer:"obstacles / barriers / enemies", hint:"Things that get in the way", difficulty:"easy" },
      { type:"finish the sentence", question:"The Pomodoro technique involves working for 25 minutes, then taking a short ___.", answer:"break", hint:"Stopping briefly", difficulty:"easy" },
      { type:"finish the sentence", question:"Saying ___ to unnecessary tasks frees up time for what really matters.", answer:"no", hint:"Refusing politely", difficulty:"easy" },
      { type:"finish the sentence", question:"Multitasking often reduces the ___ of your work because you cannot focus fully.", answer:"quality / effectiveness", hint:"How well you do it", difficulty:"medium" },
      { type:"finish the sentence", question:"People who manage their time well often feel less ___ and more in control.", answer:"stressed / overwhelmed", hint:"Negative feelings from pressure", difficulty:"easy" },
      { type:"finish the sentence", question:"Delegating means giving ___ to someone else to do.", answer:"tasks / work / responsibilities", hint:"Asking others to help", difficulty:"easy" },
      { type:"finish the sentence", question:"Digital ___ like your phone can waste a lot of time.", answer:"distractions", hint:"Things that take your attention away", difficulty:"easy" },
      { type:"finish the sentence", question:"Working ___ rather than harder means being more efficient.", answer:"smarter", hint:"The opposite of harder here", difficulty:"easy" },
      { type:"finish the sentence", question:"A ___ is a specific date or time by which a task must be finished.", answer:"deadline", hint:"When something must be done by", difficulty:"easy" },
      { type:"finish the sentence", question:"Planning your week at the start helps you feel prepared and ___.", answer:"organised / in control", hint:"Having everything in order", difficulty:"easy" },
      { type:"finish the sentence", question:"People with good time management achieve more while working ___ hours.", answer:"fewer / less", hint:"Not more hours", difficulty:"easy" },
      { type:"finish the sentence", question:"Urgent tasks need to be done ___, while important tasks need care.", answer:"immediately / now / soon", hint:"Right away", difficulty:"easy" },
      { type:"finish the sentence", question:"Setting ___ means not agreeing to do more than you can handle.", answer:"boundaries / limits", hint:"Rules to protect your time", difficulty:"medium" },
      { type:"finish the sentence", question:"A time ___ is a fixed period of time set aside for a specific task.", answer:"block / slot", hint:"A planned section of your day", difficulty:"medium" },
      { type:"finish the sentence", question:"Time ___ is the feeling that there is never enough time in the day.", answer:"pressure", hint:"Feeling rushed", difficulty:"easy" },
      { type:"finish the sentence", question:"If you ___ tasks effectively, you focus on high-impact work first.", answer:"prioritise", hint:"Deciding what is most important", difficulty:"easy" },
      { type:"finish the sentence", question:"Spending time on things that do not help your goals is called ___ time.", answer:"wasting / losing", hint:"Not using time wisely", difficulty:"easy" },
      { type:"finish the sentence", question:"The most productive time of day for most people is in the ___.", answer:"morning", hint:"When you first start the day", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"Good Time Management Habits", spyTopic:"Bad Time Management Habits", crewmatePrompt:"Tell the group three things that people with GOOD time management do. For example: they make a to-do list, they set deadlines, they avoid distractions.", spyPrompt:"Tell the group three things that people with POOR time management do. For example: they procrastinate, they say yes to everything, they don't plan ahead.", explanation:"Crewmates described good habits. The spy described bad habits.", spyGuessOptions:["Good Time Management","Bad Time Management","Relaxation Habits","Study Habits"] },
      { crewmateTopic:"Planning Your Day", spyTopic:"Going with the Flow", crewmatePrompt:"Argue in favour of planning your day in advance. Talk about to-do lists, schedules, and why structure helps productivity.", spyPrompt:"Argue in favour of being spontaneous and not over-planning. Talk about flexibility, creativity, and why rigid plans can be limiting.", explanation:"Crewmates advocated for planning. The spy advocated for flexibility.", spyGuessOptions:["Planning Ahead","Being Spontaneous","Multitasking","Working Long Hours"] },
      { crewmateTopic:"Managing Time at Work", spyTopic:"Managing Time as a Student", crewmatePrompt:"Talk about how you manage your time at work. Mention meetings, deadlines, priorities, email, and workload.", spyPrompt:"Talk about how you manage your time as a student. Mention revision, assignments, class schedules, and exam preparation.", explanation:"Crewmates talked about time management at work. The spy talked about it as a student.", spyGuessOptions:["Time Management at Work","Time Management as a Student","Time Management at Home","Time Management on Holiday"] },
      { crewmateTopic:"Digital Distractions", spyTopic:"People as Distractions", crewmatePrompt:"Talk about how phones and social media distract you from getting things done. How do you deal with them?", spyPrompt:"Talk about how other people — colleagues, friends, or family — distract you from getting things done. How do you deal with them?", explanation:"Crewmates discussed technology as a distraction. The spy discussed people as distractions.", spyGuessOptions:["Digital Distractions","People as Distractions","Environmental Distractions","Internal Distractions"] },
    ],
    minefieldGrid: {
      topic: "Time Management",
      instructions: "Combine the subject (top) with the phrase (side) to make a sentence about time management — then add your experience or opinion.",
      colLabels: ["Good time management…", "Procrastination…", "A to-do list…", "I find it hardest to focus when…", "Saying no to people…"],
      rowLabels: ["… helps you by…", "… happens when…", "… is useful because…", "… wastes time because…", "… is difficult because…"],
    },
    hotSeatWords: [
      {word:"deadline"},{word:"prioritise"},{word:"procrastinate"},{word:"schedule"},
      {word:"distraction"},{word:"to-do list"},{word:"focus"},{word:"efficient"},
      {word:"delegate"},{word:"multitask"},{word:"break"},{word:"productive"},
      {word:"routine"},{word:"goal"},{word:"urgent"},{word:"important"},
      {word:"plan"},{word:"time block"},{word:"discipline"},{word:"overwhelmed"},
    ],
    hotPotatoPrompts: [
      {prompt:"What is a deadline?", answer:"the date or time by which something must be finished"},
      {prompt:"What does prioritise mean?", answer:"decide which tasks are most important and do them first"},
      {prompt:"Name one thing that wastes your time.", answer:"(free — social media, TV, procrastinating)"},
      {prompt:"What is a to-do list?", answer:"a list of tasks you need to complete"},
      {prompt:"What is the Pomodoro technique?", answer:"work for 25 minutes then take a short break"},
      {prompt:"Delegating means giving your ___ to someone else.", answer:"tasks / work"},
      {prompt:"Name one sign that someone has poor time management.", answer:"(free — always late, misses deadlines)"},
      {prompt:"What does multitasking mean?", answer:"doing more than one thing at the same time"},
      {prompt:"Is multitasking effective?", answer:"(free — usually less effective, reduces quality)"},
      {prompt:"What does efficient mean?", answer:"doing something well without wasting time"},
      {prompt:"What is the difference between urgent and important?", answer:"urgent = needs doing now; important = high value"},
      {prompt:"Name one app or tool that helps with time management.", answer:"(free — calendar, Trello, timer)"},
      {prompt:"Why is saying no important?", answer:"it stops you taking on more than you can handle"},
      {prompt:"Procrastination means ___ tasks you should do.", answer:"putting off / delaying / avoiding"},
      {prompt:"Name your biggest time management challenge.", answer:"(free answer)"},
      {prompt:"What time of day are you most productive?", answer:"(free answer)"},
      {prompt:"Name one habit that saves time.", answer:"(free — planning ahead, batching tasks)"},
      {prompt:"How can a daily routine help?", answer:"(free — creates structure, builds habits)"},
      {prompt:"What would you do with an extra hour each day?", answer:"(free answer)"},
      {prompt:"What is a time block?", answer:"a scheduled period of time for a specific task"},
    ],
    auctionSentences: [
      { sentence:"Good time management helps you achieve more in less time.", isCorrect:true, explanation:"'Achieve more in less time' is natural and correct." },
      { sentence:"Procrastination is one of the biggest obstacles to productivity.", isCorrect:true, explanation:"'One of the biggest + plural noun' is correct superlative structure." },
      { sentence:"Procrastination is one of the biggest obstacle to productivity.", isCorrect:false, explanation:"After 'one of the biggest', use the plural: 'obstacles'." },
      { sentence:"It is important to prioritise tasks before starting your day.", isCorrect:true, explanation:"'It is important to + infinitive' is correct." },
      { sentence:"It is important prioritising tasks before starting your day.", isCorrect:false, explanation:"'It is important to + infinitive' — use 'to prioritise'." },
      { sentence:"People who plan their time effectively tend to feel less stressed.", isCorrect:true, explanation:"'Tend to + infinitive' is correct." },
      { sentence:"People who plan their time effectively tend feeling less stressed.", isCorrect:false, explanation:"'Tend to + infinitive' — use 'to feel', not 'feeling'." },
      { sentence:"Checking your phone constantly can seriously affect your focus.", isCorrect:true, explanation:"Gerund subject 'Checking' with 'can affect' is correct." },
      { sentence:"To check your phone constantly can seriously affect your focus.", isCorrect:false, explanation:"Gerund 'Checking' is more natural as a sentence subject here." },
      { sentence:"Working smarter, not harder, is the key to effective time management.", isCorrect:true, explanation:"'Working smarter, not harder' is used correctly here." },
    ],
    cardTasks: [
      { task:"Do you consider yourself a good time manager? Give examples." },
      { task:"What are the biggest time wasters in your daily life?" },
      { task:"Describe your daily routine. Is it well organised or chaotic?" },
      { task:"What is procrastination and why do people do it?" },
      { task:"Give three practical tips for managing your time better." },
      { task:"Does technology help or hurt time management?" },
      { task:"What is the difference between being busy and being productive?" },
      { task:"How do you decide what to do first when you have many tasks?" },
      { task:"Is multitasking effective? What does research suggest?" },
      { task:"How do you manage your time when you have an important deadline?" },
      { task:"Why is saying no important for time management?" },
      { task:"What time of day are you most productive and why?" },
      { task:"Describe what a perfectly organised day would look like for you." },
      { task:"How can poor time management affect your health and relationships?" },
      { task:"What tools or systems do you use to organise your time?" },
      { task:"What would you do with an extra two hours per day?" },
      { task:"How do you balance urgent tasks with long-term goals?" },
      { task:"What is the Pomodoro technique and would you try it?" },
      { task:"Why do some people always seem to have more time than others?" },
      { task:"How do students and workers have different time management challenges?" },
    ],
  },

  free_time_hobbies: {
    label: "Free Time and Hobbies",
    category: "topic",
    questions: [
      { type:"finish the sentence", question:"Hobbies give people a way to ___ after a long day of work or study.", answer:"relax / unwind / switch off", hint:"What hobbies help you do", difficulty:"easy" },
      { type:"finish the sentence", question:"Creative hobbies like painting or writing help you ___ your feelings.", answer:"express", hint:"Show what is inside", difficulty:"easy" },
      { type:"finish the sentence", question:"People who have fulfilling hobbies report higher levels of ___ with life.", answer:"satisfaction / happiness", hint:"Feeling good", difficulty:"medium" },
      { type:"finish the sentence", question:"Some hobbies like sport are good for your physical ___.", answer:"health / fitness / wellbeing", hint:"Your body", difficulty:"easy" },
      { type:"finish the sentence", question:"Many people use free time to ___ new skills, like cooking or music.", answer:"learn / develop / practise", hint:"Getting better at something", difficulty:"easy" },
      { type:"finish the sentence", question:"Social hobbies like team sports or book clubs help people build ___.", answer:"friendships / connections", hint:"Bonds with people", difficulty:"easy" },
      { type:"finish the sentence", question:"Having a hobby makes you better at your job because it ___ your mind.", answer:"refreshes / recharges / rests", hint:"A mental reset", difficulty:"medium" },
      { type:"finish the sentence", question:"The amount of free time people have depends on work hours and ___.", answer:"family responsibilities", hint:"Life demands", difficulty:"medium" },
      { type:"finish the sentence", question:"Outdoor activities like hiking or cycling connect people with ___.", answer:"nature", hint:"The natural world", difficulty:"easy" },
      { type:"finish the sentence", question:"Volunteering is a meaningful way to spend free time because it ___ your community.", answer:"helps / benefits", hint:"Making a difference", difficulty:"easy" },
      { type:"finish the sentence", question:"Some hobbies require significant ___ investment — like photography or golf.", answer:"financial / money", hint:"Costing a lot", difficulty:"easy" },
      { type:"finish the sentence", question:"Reading is a hobby that improves your ___ and general knowledge.", answer:"vocabulary / language / mind", hint:"What you know", difficulty:"easy" },
      { type:"finish the sentence", question:"Free time is essential for ___ and preventing burnout.", answer:"rest / recovery / recharging", hint:"Getting energy back", difficulty:"easy" },
      { type:"finish the sentence", question:"Children who have hobbies develop better ___, patience, and focus.", answer:"skills / concentration / discipline", hint:"Transferable life skills", difficulty:"medium" },
      { type:"finish the sentence", question:"A ___ is an activity done regularly for pleasure, not money.", answer:"hobby", hint:"The keyword", difficulty:"easy" },
      { type:"finish the sentence", question:"In today's busy world, many people say they don't have enough ___ time.", answer:"free / leisure", hint:"Time not for work", difficulty:"easy" },
      { type:"finish the sentence", question:"Spending too much free time ___ TV can become passive and unproductive.", answer:"watching", hint:"-ing form", difficulty:"easy" },
      { type:"finish the sentence", question:"A hobby turned into a business is sometimes called a ___ business.", answer:"passion / hobby", hint:"A business from something you love", difficulty:"medium" },
      { type:"finish the sentence", question:"Some people find it hard to ___ doing nothing because they feel guilty.", answer:"enjoy / relax while", hint:"Accepting rest", difficulty:"medium" },
      { type:"finish the sentence", question:"Mindless scrolling on social media is often not a ___ way to spend free time.", answer:"productive / fulfilling", hint:"Not beneficial", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"Active Hobbies", spyTopic:"Passive or Indoor Hobbies", crewmatePrompt:"Talk about active hobbies involving physical activity or being outdoors. What do you do? What are the benefits? Examples: running, football, hiking, yoga.", spyPrompt:"Talk about passive or relaxing hobbies done at home or quietly. What do you do? What are the benefits? Examples: reading, watching films, gaming, cooking.", explanation:"Crewmates discussed active physical hobbies. The spy discussed passive indoor hobbies.", spyGuessOptions:["Active Hobbies","Passive or Indoor Hobbies","Creative Hobbies","Social Hobbies"] },
      { crewmateTopic:"Solo Hobbies", spyTopic:"Social Hobbies", crewmatePrompt:"Talk about hobbies you do alone and enjoy by yourself. Why do you like these? Examples: reading, drawing, running, cooking.", spyPrompt:"Talk about hobbies you do with other people. Why do you enjoy the social aspect? Examples: team sports, book clubs, dance classes.", explanation:"Crewmates discussed solo hobbies. The spy discussed social group hobbies.", spyGuessOptions:["Solo Hobbies","Social Hobbies","Competitive Hobbies","Creative Hobbies"] },
      { crewmateTopic:"How You Spend Free Time Now", spyTopic:"How You Spent Free Time as a Child", crewmatePrompt:"Describe how you enjoy spending your free time as an adult. What do you do to relax and have fun now?", spyPrompt:"Describe how you used to spend your free time as a child. What games did you play? What activities did you enjoy?", explanation:"Crewmates described present free time. The spy described childhood activities.", spyGuessOptions:["Free Time as an Adult","Free Time as a Child","Free Time on Holiday","Free Time in the Future"] },
      { crewmateTopic:"Benefits of Hobbies", spyTopic:"Downsides of Hobbies", crewmatePrompt:"Talk about the positive effects of having hobbies. How do they improve health, happiness, skills, and social life?", spyPrompt:"Talk about potential downsides of hobbies. Can they be expensive, time-consuming, addictive, or cause conflict with responsibilities?", explanation:"Crewmates gave benefits. The spy gave potential negatives.", spyGuessOptions:["Benefits of Hobbies","Downsides of Hobbies","Turning a Hobby into a Job","Children and Hobbies"] },
    ],
    minefieldGrid: {
      topic: "Free Time and Hobbies",
      instructions: "Combine the subject (top) with the phrase (side) to make a sentence about free time and hobbies — then add your personal view.",
      colLabels: ["My favourite hobby…", "People who have hobbies…", "Spending free time well…", "I think outdoor activities…", "In my free time I usually…"],
      rowLabels: ["… helps me because…", "… are happier because…", "… is important because…", "… are better because…", "… but I'd like to try…"],
    },
    hotSeatWords: [
      {word:"relaxing"},{word:"creative"},{word:"outdoor"},{word:"sport"},
      {word:"reading"},{word:"cooking"},{word:"volunteering"},{word:"music"},
      {word:"travel"},{word:"photography"},{word:"painting"},{word:"gardening"},
      {word:"gaming"},{word:"yoga"},{word:"cinema"},{word:"hiking"},
      {word:"social"},{word:"collecting"},{word:"dancing"},{word:"meditation"},
    ],
    hotPotatoPrompts: [
      {prompt:"What is your favourite hobby? Why?", answer:"(free answer)"},
      {prompt:"Name one hobby that is good for your health.", answer:"(free — sport, yoga, hiking, cycling)"},
      {prompt:"What do you do to relax after a stressful week?", answer:"(free answer)"},
      {prompt:"Name one hobby that is also a social activity.", answer:"(free — team sport, book club, dance)"},
      {prompt:"What is volunteering?", answer:"giving your time to help others without being paid"},
      {prompt:"Name one expensive hobby.", answer:"(free — golf, skiing, photography)"},
      {prompt:"Name one cheap or free hobby.", answer:"(free — reading, running, drawing)"},
      {prompt:"How much free time do you have per week?", answer:"(free answer)"},
      {prompt:"Name a hobby that improves mental health.", answer:"(free — meditation, yoga, painting)"},
      {prompt:"What is the difference between a hobby and a job?", answer:"a hobby is for pleasure, a job is for money"},
      {prompt:"Name a hobby popular among young people today.", answer:"(free — gaming, fitness, photography)"},
      {prompt:"Why is it important to have hobbies?", answer:"(free — relaxation, connection, personal growth)"},
      {prompt:"What hobby would you like to start? Why?", answer:"(free answer)"},
      {prompt:"Name a hobby that requires patience.", answer:"(free — chess, fishing, gardening)"},
      {prompt:"Do you prefer active or passive hobbies? Why?", answer:"(free answer)"},
      {prompt:"How did you spend your free time as a child?", answer:"(free answer)"},
      {prompt:"Name a hobby that helps you learn something.", answer:"(free — reading, cooking, languages)"},
      {prompt:"Is watching TV a hobby? Give your opinion.", answer:"(free answer)"},
      {prompt:"Name one thing people do in free time that you think is a waste.", answer:"(free answer)"},
      {prompt:"Have you ever turned a hobby into something useful?", answer:"(free answer)"},
    ],
    auctionSentences: [
      { sentence:"Having a hobby is a great way to switch off from work.", isCorrect:true, explanation:"'A way to + infinitive' is correct." },
      { sentence:"Having a hobby is a great way for switching off from work.", isCorrect:false, explanation:"'A way to + infinitive' — not 'a way for + -ing'." },
      { sentence:"People who have hobbies tend to be happier and less stressed.", isCorrect:true, explanation:"'Tend to + infinitive' is correct." },
      { sentence:"People who have hobbies tend to being happier and less stressed.", isCorrect:false, explanation:"'Tend to + infinitive' — use 'to be'." },
      { sentence:"Outdoor activities such as hiking and cycling are beneficial for physical health.", isCorrect:true, explanation:"'Such as' correctly introduces examples." },
      { sentence:"Outdoor activities such as hiking and cycling is beneficial for physical health.", isCorrect:false, explanation:"'Activities' is plural — use 'are'." },
      { sentence:"Spending your free time creatively can improve your wellbeing.", isCorrect:true, explanation:"Gerund subject 'Spending' with 'can improve' is correct." },
      { sentence:"Spend your free time creatively can improve your wellbeing.", isCorrect:false, explanation:"Use gerund 'Spending' as the subject — not base form 'Spend'." },
      { sentence:"Many people struggle to find time for hobbies because of work commitments.", isCorrect:true, explanation:"'Struggle to find' and 'because of + noun phrase' are correct." },
      { sentence:"Many people struggle to find time for hobbies because of work committed.", isCorrect:false, explanation:"'Commitments' as a noun is needed — not 'committed' as an adjective." },
    ],
    cardTasks: [
      { task:"Describe your favourite hobby in detail. How did you start it and why do you love it?" },
      { task:"How do hobbies benefit mental and physical health? Give examples." },
      { task:"What hobbies are popular in your country and why?" },
      { task:"Is it possible to have too many hobbies? Why?" },
      { task:"How has technology changed the types of hobbies people have?" },
      { task:"Would you like to turn a hobby into your job? What are the risks?" },
      { task:"Describe someone with an unusual hobby. Why do they do it?" },
      { task:"How do children's hobbies differ from adults'?" },
      { task:"Is it better to have one hobby you love deeply or many different ones?" },
      { task:"How important is free time to a person's wellbeing?" },
      { task:"What would you do if you had a month of completely free time?" },
      { task:"Why do some people find it hard to relax and do nothing?" },
      { task:"What are the social benefits of joining a club or group hobby?" },
      { task:"How has your use of free time changed as you have got older?" },
      { task:"Do people today have more or less free time than 50 years ago?" },
      { task:"What is the difference between entertainment and a hobby?" },
      { task:"Should schools teach students how to use free time well?" },
      { task:"What is one new hobby you would like to try this year?" },
      { task:"How do you feel when you have nothing planned — do you enjoy it?" },
      { task:"What do you think is the most beneficial way to spend free time?" },
    ],
  },

  social_media: {
    label: "Social Media",
    category: "topic",
    questions: [
      { type:"finish the sentence", question:"Social media allows people to ___ with friends and family across the world.", answer:"connect / communicate", hint:"Keeping in contact", difficulty:"easy" },
      { type:"finish the sentence", question:"One major concern is the ___ of fake news and misinformation.", answer:"spread / sharing", hint:"Untrue information travelling fast", difficulty:"medium" },
      { type:"finish the sentence", question:"People often show only the ___ side of their life on social media.", answer:"positive / best / perfect", hint:"Not the full reality", difficulty:"easy" },
      { type:"finish the sentence", question:"Cyberbullying is when people use technology to ___ or intimidate others.", answer:"bully / harass / threaten", hint:"Causing harm online", difficulty:"easy" },
      { type:"finish the sentence", question:"An ___ is someone with a large following who influences buying decisions.", answer:"influencer", hint:"A modern job title", difficulty:"easy" },
      { type:"finish the sentence", question:"Too much social media can lead to feelings of ___ and loneliness.", answer:"anxiety / depression / inadequacy", hint:"Negative mental states", difficulty:"medium" },
      { type:"finish the sentence", question:"Businesses use social media as a powerful ___ tool to reach customers.", answer:"marketing", hint:"Promotion", difficulty:"easy" },
      { type:"finish the sentence", question:"A post ___ when millions of people share it within a short time.", answer:"goes viral", hint:"Something shared very fast", difficulty:"easy" },
      { type:"finish the sentence", question:"Social media ___ control what content users see through algorithms.", answer:"platforms / companies", hint:"The businesses behind the apps", difficulty:"medium" },
      { type:"finish the sentence", question:"Taking a social media ___ means temporarily stopping using all platforms.", answer:"detox / break", hint:"A period without social media", difficulty:"easy" },
      { type:"finish the sentence", question:"Hashtags help users find ___ about specific topics.", answer:"content / posts / information", hint:"What hashtags lead you to", difficulty:"easy" },
      { type:"finish the sentence", question:"Many people compare themselves to others online, which can damage their ___.", answer:"self-esteem / confidence / mental health", hint:"How they feel about themselves", difficulty:"easy" },
      { type:"finish the sentence", question:"Social media has given ordinary people a ___ — anyone can publish their views.", answer:"voice / platform", hint:"Ability to be heard", difficulty:"easy" },
      { type:"finish the sentence", question:"Political campaigns now rely heavily on social media to ___ voters.", answer:"reach / influence / target", hint:"Getting to people", difficulty:"medium" },
      { type:"finish the sentence", question:"Despite its problems, social media has been ___ in organising social movements.", answer:"powerful / influential / useful", hint:"It has made a positive impact", difficulty:"medium" },
      { type:"finish the sentence", question:"Privacy ___ are an important concern when sharing personal data online.", answer:"concerns / issues / settings", hint:"Worries about personal info", difficulty:"medium" },
      { type:"finish the sentence", question:"Screen time is the amount of time spent looking at a ___ or device.", answer:"screen / phone / computer", hint:"A digital device", difficulty:"easy" },
      { type:"finish the sentence", question:"Many parents worry about the amount of ___ content children can access online.", answer:"harmful / inappropriate", hint:"Not suitable for children", difficulty:"easy" },
      { type:"finish the sentence", question:"Social media ___ like likes and comments give people a sense of validation.", answer:"feedback / reactions / engagement", hint:"What others do with your posts", difficulty:"easy" },
      { type:"finish the sentence", question:"The average person spends over ___ hours per day on social media.", answer:"two / 2 / three / 3", hint:"A surprisingly large number", difficulty:"easy" },
    ],
    spyRounds: [
      { crewmateTopic:"Positive Effects of Social Media", spyTopic:"Negative Effects of Social Media", crewmatePrompt:"Tell the group TWO positive effects of social media. For example: it helps people stay connected, it helps small businesses, or it raises awareness of social issues.", spyPrompt:"Tell the group TWO negative effects of social media. For example: it spreads fake news, causes anxiety, or invades people's privacy.", explanation:"Crewmates gave positive effects. The spy gave negative effects.", spyGuessOptions:["Positive Effects of Social Media","Negative Effects of Social Media","The Future of Social Media","Social Media Regulation"] },
      { crewmateTopic:"Social Media and Young People", spyTopic:"Social Media and Adults and Businesses", crewmatePrompt:"Talk about how social media affects young people. Mention identity, friendships, mental health, and screen time.", spyPrompt:"Talk about how social media affects adults and businesses. Mention marketing, professional networking, and news.", explanation:"Crewmates focused on young people. The spy focused on adults and businesses.", spyGuessOptions:["Social Media and Young People","Social Media and Adults and Businesses","Social Media and Politics","Social Media and Mental Health"] },
      { crewmateTopic:"Real Life versus Social Media Life", spyTopic:"Online Identity versus Real Identity", crewmatePrompt:"Compare how people present themselves on social media versus real life. Why do people only show the best parts?", spyPrompt:"Talk about the difference between who you are online versus who you really are in person.", explanation:"Crewmates compared social media life with real life. The spy discussed online versus real identity.", spyGuessOptions:["Social Media Life vs Real Life","Online vs Real Identity","Public vs Private Life","Celebrities vs Normal People"] },
      { crewmateTopic:"Social Media Should Be More Regulated", spyTopic:"Social Media Should Be Less Regulated", crewmatePrompt:"Argue that governments should regulate social media more strictly. Talk about fake news, harmful content, and data privacy.", spyPrompt:"Argue that social media should be less regulated. Talk about freedom of speech, creativity, and the risk of censorship.", explanation:"Crewmates argued for more regulation. The spy argued for less.", spyGuessOptions:["More Social Media Regulation","Less Social Media Regulation","Banning Social Media","Making Social Media Free"] },
    ],
    minefieldGrid: {
      topic: "Social Media",
      instructions: "Combine the subject (top) with the phrase (side) to make a sentence about social media — then add your opinion or experience.",
      colLabels: ["Social media…", "Young people today…", "Influencers…", "Governments should…", "I think spending too much time online…"],
      rowLabels: ["… can be dangerous because…", "… use social media to…", "… have an effect because…", "… regulate social media because…", "… affects people by…"],
    },
    hotSeatWords: [
      {word:"influencer"},{word:"viral"},{word:"algorithm"},{word:"privacy"},
      {word:"cyberbullying"},{word:"fake news"},{word:"followers"},{word:"post"},
      {word:"screen time"},{word:"hashtag"},{word:"platform"},{word:"addiction"},
      {word:"comparison"},{word:"selfie"},{word:"filter"},{word:"engagement"},
      {word:"detox"},{word:"identity"},{word:"cancel culture"},{word:"trend"},
    ],
    hotPotatoPrompts: [
      {prompt:"Name one popular social media platform.", answer:"Instagram / TikTok / Twitter / Facebook / YouTube"},
      {prompt:"What is an influencer?", answer:"someone with a large following who influences others"},
      {prompt:"What does going viral mean?", answer:"being shared by millions of people very quickly"},
      {prompt:"What is fake news?", answer:"false or misleading information spread online"},
      {prompt:"What is cyberbullying?", answer:"bullying or harassing someone online"},
      {prompt:"How many hours a day do you spend on social media?", answer:"(free answer)"},
      {prompt:"Name one positive effect of social media.", answer:"(free — connection, awareness, business)"},
      {prompt:"Name one negative effect of social media.", answer:"(free — anxiety, fake news, addiction)"},
      {prompt:"What does screen time mean?", answer:"the amount of time spent looking at a digital screen"},
      {prompt:"What is a hashtag?", answer:"a symbol used to categorise content online"},
      {prompt:"Why do people only post the best parts of their life?", answer:"(free — to look good, get likes)"},
      {prompt:"What is a social media detox?", answer:"taking a break from using social media"},
      {prompt:"Should there be an age limit for social media?", answer:"(free answer)"},
      {prompt:"What is cancel culture?", answer:"publicly boycotting someone for their actions"},
      {prompt:"How has social media changed the way we get news?", answer:"(free — faster, more sources, less reliable)"},
      {prompt:"Name one job that social media has created.", answer:"influencer / content creator / social media manager"},
      {prompt:"Do you think social media is mostly good or mostly bad?", answer:"(free answer)"},
      {prompt:"What does algorithm mean in social media?", answer:"a system that decides what content you see"},
      {prompt:"How has social media affected politics?", answer:"(free — campaigns, influence, fake news)"},
      {prompt:"What would you miss if social media disappeared?", answer:"(free answer)"},
    ],
    auctionSentences: [
      { sentence:"Social media has changed the way people communicate.", isCorrect:true, explanation:"Present perfect 'has changed' shows a change affecting the present." },
      { sentence:"Social media have changed the way people communicate.", isCorrect:false, explanation:"'Social media' as a concept is treated as singular — use 'has'." },
      { sentence:"Spending too much time on social media can lead to anxiety.", isCorrect:true, explanation:"Gerund subject 'Spending' with 'can lead to' is correct." },
      { sentence:"Spend too much time on social media can lead to anxiety.", isCorrect:false, explanation:"Use the gerund 'Spending' as subject — not base form 'Spend'." },
      { sentence:"Many young people compare themselves to unrealistic images online.", isCorrect:true, explanation:"'Compare themselves to' is correct reflexive structure." },
      { sentence:"Many young people compare them to unrealistic images online.", isCorrect:false, explanation:"Use reflexive pronoun 'themselves' — not 'them'." },
      { sentence:"Social media platforms have been criticised for spreading misinformation.", isCorrect:true, explanation:"'Criticised for + -ing' is correct." },
      { sentence:"Social media platforms have been criticised for spread misinformation.", isCorrect:false, explanation:"After 'for', use the gerund: 'spreading' — not 'spread'." },
      { sentence:"It is difficult to know whether information found online is reliable.", isCorrect:true, explanation:"'Whether' correctly introduces indirect questions." },
      { sentence:"It is difficult to know weather information found online is reliable.", isCorrect:false, explanation:"'Whether' (choice) not 'weather' (climate) — a common spelling error." },
    ],
    cardTasks: [
      { task:"What social media platforms do you use most? Why?" },
      { task:"What are the biggest dangers of social media for young people?" },
      { task:"Does social media make people more or less connected in real life?" },
      { task:"How has social media changed the way we get news?" },
      { task:"Would you like to be a social media influencer? Why or why not?" },
      { task:"Should governments regulate social media content? Why?" },
      { task:"How does social media affect self-esteem and body image?" },
      { task:"Is fake news a serious problem? What can be done about it?" },
      { task:"Describe a time when social media had a positive impact on society." },
      { task:"Have you ever taken a break from social media? How did it feel?" },
      { task:"What do you think social media will look like in 20 years?" },
      { task:"How has social media changed the way businesses operate?" },
      { task:"Should there be an age limit for social media? What age?" },
      { task:"Is it possible to be private in the age of social media?" },
      { task:"How does social media contribute to political division?" },
      { task:"What does cancel culture mean and do you think it is fair?" },
      { task:"How do algorithms control what we see and think?" },
      { task:"Is social media addiction a real problem? Why?" },
      { task:"How do you decide what to share and what to keep private online?" },
      { task:"What are the positives and negatives of social media for small businesses?" },
    ],
  },

  technology_daily_life: {
    label: "Technology in Daily Life",
    category: "topic",
    questions: [
      { type:"finish the sentence", question:"Technology has made many everyday tasks ___ and more convenient.", answer:"easier / faster / simpler", hint:"Making life better", difficulty:"easy" },
      { type:"finish the sentence", question:"Smartphones allow people to access the internet, take photos, and ___ all in one device.", answer:"communicate / connect / message", hint:"Staying in touch", difficulty:"easy" },
      { type:"finish the sentence", question:"Artificial ___ is changing industries like healthcare, education, and transport.", answer:"Intelligence / AI", hint:"AI stands for Artificial Intelligence", difficulty:"easy" },
      { type:"finish the sentence", question:"Many people worry that too much technology is making us ___ human connection.", answer:"lose / neglect / miss", hint:"What is being lost", difficulty:"medium" },
      { type:"finish the sentence", question:"Smart home devices like voice assistants can control ___, heating, and security.", answer:"lights / appliances", hint:"Things in your home", difficulty:"easy" },
      { type:"finish the sentence", question:"E-commerce refers to buying and selling goods and services ___.", answer:"online / on the internet", hint:"Through digital means", difficulty:"easy" },
      { type:"finish the sentence", question:"Online ___ services like Netflix have replaced physical DVDs.", answer:"streaming", hint:"Watching online", difficulty:"easy" },
      { type:"finish the sentence", question:"Many jobs in factories have been replaced by ___, which do repetitive tasks faster.", answer:"robots / machines / automation", hint:"Automated machines", difficulty:"easy" },
      { type:"finish the sentence", question:"The ___ divide refers to the gap between people who have access to technology and those who don't.", answer:"digital", hint:"Relating to technology", difficulty:"medium" },
      { type:"finish the sentence", question:"Children who grow up with technology are called digital ___.", answer:"natives", hint:"Born into a digital world", difficulty:"easy" },
      { type:"finish the sentence", question:"GPS technology means we no longer need paper ___ to navigate.", answer:"maps", hint:"What we used before GPS", difficulty:"easy" },
      { type:"finish the sentence", question:"Working ___ has become possible because of advances in communication technology.", answer:"remotely / from home", hint:"Not in the office", difficulty:"easy" },
      { type:"finish the sentence", question:"Cybersecurity protects computers and networks from ___ attacks.", answer:"hacker / cyber / malicious", hint:"Attacks from criminals online", difficulty:"medium" },
      { type:"finish the sentence", question:"Renewable energy ___ like solar panels are becoming cheaper and more efficient.", answer:"technology / technologies", hint:"Green energy developments", difficulty:"medium" },
      { type:"finish the sentence", question:"Technology has made education more ___ by allowing students to learn from anywhere.", answer:"accessible / flexible", hint:"Available to more people", difficulty:"easy" },
      { type:"finish the sentence", question:"Electric ___ are becoming more common as countries try to reduce pollution.", answer:"cars / vehicles", hint:"Green transport", difficulty:"easy" },
      { type:"finish the sentence", question:"3D ___ allows objects to be created layer by layer from digital designs.", answer:"printing", hint:"A manufacturing technology", difficulty:"medium" },
      { type:"finish the sentence", question:"Screen ___ is increasing among all age groups, raising health concerns.", answer:"addiction / time", hint:"Using screens too much", difficulty:"easy" },
      { type:"finish the sentence", question:"___ technology may soon mean we do not need cash or cards to pay.", answer:"Contactless / Payment / Cashless", hint:"Paying without touching", difficulty:"medium" },
      { type:"finish the sentence", question:"Technology in healthcare means doctors can now perform ___ surgery using robots.", answer:"remote / robotic", hint:"From a distance using machines", difficulty:"medium" },
    ],
    spyRounds: [
      { crewmateTopic:"Technology Making Life Better", spyTopic:"Technology Making Life Worse", crewmatePrompt:"Tell the group TWO ways technology has improved daily life. For example: we communicate instantly, online shopping is convenient, or medical technology saves lives.", spyPrompt:"Tell the group TWO ways technology has made life worse. For example: we are addicted to phones, technology causes job losses, or we have less privacy.", explanation:"Crewmates gave positive impacts. The spy gave negative impacts.", spyGuessOptions:["Technology Improving Life","Technology Making Life Worse","Technology and the Environment","Technology and Young People"] },
      { crewmateTopic:"Technology in Education", spyTopic:"Technology in the Workplace", crewmatePrompt:"Talk about how technology is used in education — online learning, tablets, apps, AI tutors, and digital resources.", spyPrompt:"Talk about how technology is used in the workplace — emails, video calls, remote work tools, and AI software.", explanation:"Crewmates discussed technology in education. The spy discussed the workplace.", spyGuessOptions:["Technology in Education","Technology in the Workplace","Technology in Healthcare","Technology in Entertainment"] },
      { crewmateTopic:"Life With Technology", spyTopic:"Life Without Technology", crewmatePrompt:"Describe your daily life with technology. How do you use it from morning to night? What would you miss?", spyPrompt:"Imagine life without any technology — no phones, internet, or electricity. How would your daily life be different?", explanation:"Crewmates described modern life with technology. The spy described life without it.", spyGuessOptions:["Modern Life With Technology","Life Without Technology","Life in the Past","Life in the Future"] },
      { crewmateTopic:"Artificial Intelligence", spyTopic:"Robots and Automation", crewmatePrompt:"Talk about Artificial Intelligence — what it is, how it is used in daily life, and whether it excites or worries you.", spyPrompt:"Talk about robots and automation — how they replace jobs in factories and services, and what this means for workers.", explanation:"Crewmates discussed AI as software and decision-making. The spy discussed robots and physical automation.", spyGuessOptions:["Artificial Intelligence","Robots and Automation","Self-Driving Cars","Virtual Reality"] },
    ],
    minefieldGrid: {
      topic: "Technology in Daily Life",
      instructions: "Combine the subject (top) with the phrase (side) to make a sentence about technology — then add your experience or view.",
      colLabels: ["Smartphones…", "Artificial intelligence…", "In the future, technology…", "The biggest risk of technology is…", "Young people today…"],
      rowLabels: ["… have changed daily life by…", "… will affect jobs because…", "… will make life easier by…", "… affects privacy because…", "… use technology to…"],
    },
    hotSeatWords: [
      {word:"smartphone"},{word:"artificial intelligence"},{word:"robot"},{word:"internet"},
      {word:"app"},{word:"streaming"},{word:"electric car"},{word:"smart home"},
      {word:"cybersecurity"},{word:"automation"},{word:"digital"},{word:"virtual"},
      {word:"GPS"},{word:"cloud"},{word:"renewable energy"},{word:"online shopping"},
      {word:"3D printing"},{word:"screen time"},{word:"social media"},{word:"data"},
    ],
    hotPotatoPrompts: [
      {prompt:"Name one way technology has made daily life easier.", answer:"(free — communication, shopping, navigation)"},
      {prompt:"What does AI stand for?", answer:"Artificial Intelligence"},
      {prompt:"Name one example of AI in everyday life.", answer:"Siri / Alexa / Google / Netflix recommendations"},
      {prompt:"What is e-commerce?", answer:"buying and selling goods and services online"},
      {prompt:"What is streaming?", answer:"watching or listening to content online"},
      {prompt:"Name one negative effect of too much screen time.", answer:"(free — eye strain, sleep problems, addiction)"},
      {prompt:"What is a smart home?", answer:"a home with devices controlled automatically or by voice"},
      {prompt:"What does automation mean?", answer:"machines doing tasks humans used to do"},
      {prompt:"Name a job that technology has replaced or reduced.", answer:"(free — cashier, factory worker, bank teller)"},
      {prompt:"What is cybersecurity?", answer:"protecting computers and networks from online attacks"},
      {prompt:"What does digital divide mean?", answer:"the gap between people with and without access to technology"},
      {prompt:"How has technology changed the way we shop?", answer:"(free — online shopping, home delivery)"},
      {prompt:"Name one positive use of technology in healthcare.", answer:"(free — robot surgery, health apps, telemedicine)"},
      {prompt:"What is GPS?", answer:"Global Positioning System — shows your location"},
      {prompt:"Name one job that technology has created.", answer:"app developer / content creator / data analyst"},
      {prompt:"Should children have smartphones? Give a reason.", answer:"(free answer)"},
      {prompt:"What technology could you not live without?", answer:"(free answer)"},
      {prompt:"What is 3D printing?", answer:"creating physical objects from a digital design"},
      {prompt:"How might technology change education in 20 years?", answer:"(free answer)"},
      {prompt:"Does technology bring people together or push them apart?", answer:"(free answer)"},
    ],
    auctionSentences: [
      { sentence:"Technology has transformed the way we communicate and access information.", isCorrect:true, explanation:"'Has transformed' correctly shows a change affecting the present." },
      { sentence:"Technology have transformed the way we communicate and access information.", isCorrect:false, explanation:"'Technology' is singular — use 'has', not 'have'." },
      { sentence:"Many people are concerned about the impact of AI on employment.", isCorrect:true, explanation:"'Concerned about' and 'impact on' are correct collocations." },
      { sentence:"Many people are concerned about the impact of AI in employment.", isCorrect:false, explanation:"The correct preposition is 'on' — 'impact on'." },
      { sentence:"Automation has resulted in significant job losses in the manufacturing sector.", isCorrect:true, explanation:"'Result in' is the correct collocation." },
      { sentence:"Automation has resulted significant job losses in the manufacturing sector.", isCorrect:false, explanation:"'Result in' requires the preposition 'in' — do not omit it." },
      { sentence:"It is difficult to imagine life without the internet nowadays.", isCorrect:true, explanation:"'Difficult to imagine + -ing' is correct." },
      { sentence:"Electric cars are becoming increasingly popular as fuel prices rise.", isCorrect:true, explanation:"'Become increasingly + adjective' is correct for growing trends." },
      { sentence:"Electric cars are becoming more and more popular as fuel prices rise.", isCorrect:true, explanation:"Both 'increasingly' and 'more and more' correctly express a growing trend." },
      { sentence:"Technology is changing the way we live, work, and communicate.", isCorrect:true, explanation:"Parallel structure: three verbs in the same form after 'the way we'." },
    ],
    cardTasks: [
      { task:"How has technology changed your daily life compared to 10 years ago?" },
      { task:"What technology do you use most and why?" },
      { task:"Do you think we rely too much on technology? Give examples." },
      { task:"How is artificial intelligence changing everyday life?" },
      { task:"What are the risks of storing all our personal information online?" },
      { task:"How has technology changed the way we work?" },
      { task:"Would you like a self-driving car? What are the benefits and risks?" },
      { task:"How can technology help solve environmental problems?" },
      { task:"What technology do you think will be common in 20 years?" },
      { task:"Is it possible to live without technology? Would you want to?" },
      { task:"How has online shopping changed retail?" },
      { task:"What are the benefits and risks of smart home technology?" },
      { task:"How has technology improved healthcare?" },
      { task:"What is the digital divide and why is it a social issue?" },
      { task:"Should robots replace humans in dangerous jobs?" },
      { task:"How will technology change education in the future?" },
      { task:"Is technology making us more or less creative?" },
      { task:"What are the ethical concerns around artificial intelligence?" },
      { task:"Do you think children have too much screen time?" },
      { task:"Does technology bring people together or push them apart?" },
    ],
  },

};

const TOPIC_OPTIONS = [
  { value: "ai",                    label: "✨ AI Generated",              level: null,  focus: null       },
  { value: "so_neither",            label: "So do I / Neither do I",       level: "B1",  focus: "grammar"  },
  { value: "prefer_rather",         label: "I'd prefer vs I'd rather",     level: "B1",  focus: "grammar"  },
  { value: "passive_active",        label: "Passive vs Active",            level: "B1",  focus: "grammar"  },
  { value: "indefinite_pronouns",   label: "Indefinite Pronouns",          level: "B1",  focus: "grammar"  },
  { value: "future_in_past",        label: "Future in the Past",           level: "B1",  focus: "grammar"  },
  { value: "relative_clauses",      label: "Relative Clauses",             level: "B1",  focus: "grammar"  },
  { value: "adverbs",               label: "Adverbs",                      level: "B1",  focus: "grammar"  },
  { value: "double_comparatives",   label: "Double Comparatives",          level: "B1",  focus: "grammar"  },
  { value: "third_conditional",     label: "Third Conditional",            level: "B1",  focus: "grammar"  },
  { value: "giving_opinions",       label: "Giving Opinions",              level: "B1",  focus: "vocabulary"},
  { value: "greetings_introductions",label:"Greetings & Introductions",    level: "A1",  focus: "grammar"  },
  { value: "introducing_others",    label: "Introducing Other People",     level: "A1",  focus: "grammar"  },
  { value: "present_simple",        label: "Present Simple",               level: "A1",  focus: "grammar"  },
  { value: "likes_dislikes",        label: "Likes & Dislikes",             level: "A1",  focus: "grammar"  },
  { value: "what_do_you_do",        label: "What do you do? + Professions",level: "A1",  focus: "vocabulary"},
  { value: "hobbies",               label: "Hobbies",                      level: "A1",  focus: "vocabulary"},
  { value: "personality",           label: "Personality Adjectives",       level: "A1",  focus: "vocabulary"},
  { value: "feelings",              label: "Feelings (Basic)",              level: "A1",  focus: "vocabulary"},
  { value: "appearance",            label: "What do you look like?",       level: "A1",  focus: "vocabulary"},
  { value: "clothes",               label: "I am wearing… (Clothes)",      level: "A1",  focus: "vocabulary"},
  { value: "working_from_home",     label: "Working from Home",             level: "B1",  focus: "topic"     },
  { value: "learning_language",     label: "Learning a Foreign Language",   level: "B1",  focus: "topic"     },
  { value: "education_systems",     label: "Education Systems",             level: "B2",  focus: "topic"     },
  { value: "career_choices",        label: "Career Choices",                level: "B1",  focus: "topic"     },
  { value: "work_life_balance",     label: "Work-Life Balance",             level: "B2",  focus: "topic"     },
  { value: "success_motivation",    label: "Success and Motivation",        level: "B2",  focus: "topic"     },
  { value: "time_management",       label: "Time Management",               level: "B1",  focus: "topic"     },
  { value: "free_time_hobbies",     label: "Free Time and Hobbies",         level: "B1",  focus: "topic"     },
  { value: "social_media",          label: "Social Media",                  level: "B1",  focus: "topic"     },
  { value: "technology_daily_life", label: "Technology in Daily Life",      level: "B2",  focus: "topic"     },
];

// ─── API ──────────────────────────────────────────────────────────────────────
async function callAnthropic(prompt, maxTokens = 2000) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  const text = data.content?.map(i => i.text || "").join("") || "[]";
  return text.replace(/```json|```/g, "").trim();
}

// ── LEVEL & FOCUS GUIDELINES ───────────────────────────────────────────────────
function getLevelGuidelines(level, focus) {
  const focusNote = focus === "vocabulary"
    ? "The student input is VOCABULARY. Generate sentences that USE these words naturally in context. Test whether students understand the meaning and correct usage of these specific words."
    : "The student input is GRAMMAR. Generate sentences that TEST this specific grammar structure. Questions should require students to apply, identify, or correct this grammatical pattern.";

  const levelGuides = {
    A1: `CEFR Level A1 — Complete beginner.
- Use only the most basic, high-frequency vocabulary (colours, numbers, family, food, daily routines)
- Sentences must be very short (5–8 words maximum)
- Only present simple, present continuous, or 'to be' structures
- Questions and answers must be unambiguous and obvious
- No idiomatic expressions whatsoever`,

    A2: `CEFR Level A2 — Elementary.
- Use common everyday vocabulary, slightly broader than A1
- Sentences up to 10 words
- Allow past simple, future with 'going to', basic modal verbs (can, must, should)
- Grammar errors should be clear and easy to spot (e.g. wrong verb form, missing article)
- Avoid complex clauses`,

    B1: `CEFR Level B1 — Intermediate.
- Use intermediate vocabulary including some less common words
- Sentences of moderate complexity (10–15 words), may include one subordinate clause
- Allow present perfect, conditionals (1st and 2nd), passive voice, reported speech
- Grammar errors should be plausible learner mistakes (e.g. present perfect vs past simple confusion, wrong preposition)
- Avoid rare or advanced vocabulary`,

    B2: `CEFR Level B2 — Upper-intermediate.
- Use a wide range of vocabulary including some formal and idiomatic expressions
- More complex sentences with multiple clauses (15–20 words)
- Allow advanced tenses, 3rd conditional, complex passives, subjunctive
- Grammar errors should be subtle — things that sound almost right but are slightly off
- Include some collocations and fixed phrases`,

    C1: `CEFR Level C1 — Advanced.
- Use sophisticated, precise vocabulary including collocations, formal register, and nuanced word choice
- Complex multi-clause sentences (20+ words where appropriate)
- Test subtle distinctions: near-synonyms, formal vs informal register, natural vs unnatural phrasing
- Errors should be very subtle — native-speaker-level slips, unnatural collocations, or stylistic issues
- Avoid anything that would be obvious to an intermediate learner`,
  };

  return `${focusNote}\n\n${levelGuides[level] || levelGuides["B1"]}`;
}

async function generateQuestionsFromContent(lessonContent, count = 12, level = "B1", focus = "grammar") {
  const taskList = ["finish the sentence", "correct grammar mistakes", "use vocabulary in a sentence", "choose correct grammar", "rewrite sentences", "speaking task"].join(", ");
  const maxTokens = Math.min(4000, Math.max(1500, count * 120));
  const guidelines = getLevelGuidelines(level, focus);

  const prompt = `You are an expert language teacher creating classroom game questions calibrated to a specific CEFR level.

LESSON CONTENT:
${lessonContent}

LEVEL & FOCUS GUIDELINES:
${guidelines}

Generate exactly ${count} questions using these task types (spread them evenly): ${taskList}

For "speaking task" items: the "question" field should be a short open production prompt (e.g. "Use the third conditional to talk about a regret"). The "answer" should be "Open — teacher judges" and hint should explain what to listen for.

RULES:
- Every question MUST match the level guidelines above — difficulty, vocabulary, and sentence complexity must be appropriate
- Every question must be UNIQUE — no repeated vocabulary, grammar points, or sentence structures
- Cover as many different aspects of the lesson content as possible
- Vary difficulty slightly within the level: roughly 1/3 easier end, 1/3 core level, 1/3 harder end
- Do NOT repeat the same word, phrase, or grammar rule in more than 2 questions

Return ONLY a valid JSON array, no markdown fences, no preamble, no trailing text:
[
  {
    "type": "finish the sentence",
    "question": "She ___ to the store yesterday (go)",
    "answer": "went",
    "hint": "Past simple of 'go'",
    "difficulty": "easy"
  },
  {
    "type": "speaking task",
    "question": "Make a sentence using the third conditional about a past regret.",
    "answer": "Open — teacher judges",
    "hint": "Listen for: if + past perfect, would have + past participle",
    "difficulty": "medium"
  }
]

You MUST return exactly ${count} items in the array. Do not stop early.`;

  const clean = await callAnthropic(prompt, maxTokens);
  return JSON.parse(clean);
}

async function generateAuctionSentences(lessonContent, count = 10, level = "B1", focus = "grammar") {
  const maxTokens = Math.min(4000, Math.max(1500, count * 130));
  const guidelines = getLevelGuidelines(level, focus);

  const prompt = `You are an expert language teacher creating a "Sentence Auction" game calibrated to a specific CEFR level.

LESSON CONTENT:
${lessonContent}

LEVEL & FOCUS GUIDELINES:
${guidelines}

Generate exactly ${count} complete, natural-looking sentences for the auction. No blanks, no fill-in-the-gap, no incomplete sentences.

Roughly half should be grammatically CORRECT and half should contain a subtle grammar ERROR. The errors must:
- Match the level guidelines above — at A1/A2 errors should be more obvious; at C1 they should be very subtle
- Be plausible mistakes a learner at this level would actually make
- Vary in type — don't repeat the same error category more than twice

RULES:
- Every sentence must be UNIQUE — no repeated structures, vocabulary, or grammar points
- Cover as many different grammar rules and vocabulary items from the lesson as possible
- Sentence length and complexity MUST match the level guidelines
- You MUST return exactly ${count} items — do not stop early

Return ONLY a valid JSON array, no markdown, no preamble:
[
  {
    "sentence": "She has lived in Paris since five years.",
    "isCorrect": false,
    "explanation": "'Since' is used with a point in time. The correct form is 'for five years'."
  },
  {
    "sentence": "He has been studying English for three years.",
    "isCorrect": true,
    "explanation": "Correct use of present perfect continuous with 'for'."
  }
]`;

  const clean = await callAnthropic(prompt, maxTokens);
  return JSON.parse(clean);
}

async function generateHotSeatWords(lessonContent, count = 20, level = "B1", focus = "grammar") {
  const guidelines = getLevelGuidelines(level, focus);
  const maxTokens = Math.min(6000, Math.max(1500, count * 80));
  const prompt = `You are an expert language teacher creating a "Hot Seat" word-describing game.

LESSON CONTENT:
${lessonContent}

LEVEL & FOCUS GUIDELINES:
${guidelines}

Generate exactly ${count} items for the Hot Seat game. CRITICAL RULES:
- Every item must be a SINGLE WORD or very short phrase (2–3 words MAX)
- NEVER generate full sentences — not even short ones
- For grammar lessons: use VOCABULARY WORDS or CONCEPTS related to the grammar, NOT the grammar structure itself
  * Good: "regret", "past mistake", "if only", "missed chance"  (third conditional)
  * Good: "agreement", "same", "also", "both" (so do I / neither do I)
  * BAD: "If I had known", "would have gone", "so does she" — these are structures, not describable words
- For vocabulary lessons: use individual words from the topic
  * Good: "swimming", "jealous", "chef", "tattoo"
  * BAD: "she is swimming", "I feel jealous" — never use full sentences
- Items must be concrete and describable — a student can explain them without saying the word
- Match the CEFR level — simple concrete nouns/adjectives at A1/A2, more abstract concepts at B2/C1
- Every item must be UNIQUE

Return ONLY a valid JSON array, no markdown:
[
  { "word": "regret" },
  { "word": "swimming" },
  { "word": "chef" }
]

Return exactly ${count} items. No sentences. No grammar structures. Words and short concepts only.`;

  const clean = await callAnthropic(prompt, maxTokens);
  return JSON.parse(clean);
}

async function generateCardTasks(lessonContent, count = 20, level = "B1", focus = "grammar") {
  const guidelines = getLevelGuidelines(level, focus);
  const maxTokens = Math.min(4000, Math.max(1500, count * 80));
  const prompt = `You are an expert language teacher creating speaking/writing tasks for a card game calibrated to a specific CEFR level.

LESSON CONTENT:
${lessonContent}

LEVEL & FOCUS GUIDELINES:
${guidelines}

Generate exactly ${count} SHORT speaking/writing task prompts. Each prompt asks students to PRODUCE language — make a sentence, use a word, describe something using the target structure.

Examples of good tasks:
- "Make a sentence using the word: resilient"
- "Use the second conditional to talk about your life"
- "Describe your weekend using 'although'"
- "Use a phrasal verb with 'take' in a sentence"
- "Make a sentence with 'used to' about your childhood"

Rules:
- Every task must be DIFFERENT — vary the target word, structure, or topic
- Tasks must be open-ended enough that different students give different answers
- Match the level — simple prompts at A1/A2, more nuanced at C1
- Tasks should be completable in 15-30 seconds of speaking or one written sentence
- Focus on the vocabulary/grammar from the lesson content

Return ONLY a valid JSON array, no markdown:
[
  { "task": "Make a sentence using the word: resilient" },
  { "task": "Use the third conditional to express a regret" }
]

Return exactly ${count} items.`;

  const clean = await callAnthropic(prompt, maxTokens);
  return JSON.parse(clean);
}

async function generateSpyRounds(lessonContent, rounds = 4, level = "B1", focus = "grammar") {
  const guidelines = getLevelGuidelines(level, focus);
  const maxTokens = 3000;
  const prompt = `You are an expert language teacher creating a "Spy Among Us" speaking game.

LESSON CONTENT:
${lessonContent}

LEVEL & FOCUS GUIDELINES:
${guidelines}

Generate ${rounds} rounds. In each round:
- Most teams are CREWMATES — they get a prompt using the CORRECT grammar/vocabulary topic
- One team is the SPY — they get a SIMILAR but slightly different prompt (e.g. wrong tense, different structure)
- The spy must blend in during discussion, and then guess the real topic to win

Each round needs:
- "crewmateTopic": short name of the correct grammar/vocab point (e.g. "Past Simple")
- "spyTopic": the spy's slightly wrong version (e.g. "Present Simple") — clearly different but related
- "crewmatePrompt": a natural speaking prompt using the crewmate topic (e.g. "Talk about what you did last weekend using past simple verbs.")
- "spyPrompt": a similar prompt but using the spy topic — close enough to sound right (e.g. "Talk about your typical weekend using present simple verbs.")
- "explanation": one sentence explaining the key difference between the two topics
- "spyGuessOptions": array of 4 short topic names — one is the correct crewmateTopic, others are plausible distractors. The spy picks one to win.

Return ONLY valid JSON array, no markdown:
[
  {
    "crewmateTopic": "Past Simple",
    "spyTopic": "Present Simple",
    "crewmatePrompt": "Talk about what you did last weekend. Use past simple verbs like went, ate, and watched.",
    "spyPrompt": "Talk about what you usually do at the weekend. Use present simple verbs.",
    "explanation": "Crewmates used past simple (went, did, saw) — the spy used present simple (go, do, see).",
    "spyGuessOptions": ["Past Simple", "Present Perfect", "Past Continuous", "Future Simple"]
  }
]

Return exactly ${rounds} rounds. Make topics varied across rounds — don't repeat the same grammar point.`;

  const clean = await callAnthropic(prompt, maxTokens);
  return JSON.parse(clean);
}

async function generateMinefieldGrid(lessonContent, level = "B1", focus = "grammar") {
  const guidelines = getLevelGuidelines(level, focus);
  const prompt = `You are an expert language teacher designing a speaking game grid.

LESSON CONTENT:
${lessonContent}

LEVEL & FOCUS GUIDELINES:
${guidelines}

Create a 5×5 speaking "Minefield" grid. Students combine a COLUMN label (top axis) with a ROW label (side axis) to form the start of a sentence, then complete it with their own words.

Design the grid so that EVERY combination of a column + row produces a grammatically meaningful sentence starter that a student can complete naturally using the target language from the lesson.

- colLabels: 5 short sentence-starter fragments for the COLUMNS (top axis). These are the first part of the sentence — e.g. if-clauses, subjects, contexts, topics.
- rowLabels: 5 short continuations or grammar starters for the ROWS (side axis). These complete or extend the column fragment — e.g. result clauses, verb phrases, opinion openers.

The combination of col + row must ALWAYS make sense together and push the student to produce the target grammar/vocabulary.

Also provide:
- topic: a short name for this grammar/vocabulary point (e.g. "Third Conditional")
- instructions: one sentence telling students how to combine the labels and what to add

Return ONLY valid JSON, no markdown:
{
  "topic": "Third Conditional",
  "instructions": "Combine the if-clause (top) with the result starter (side) to make a full third conditional sentence — finish it with your own idea.",
  "colLabels": ["If she hadn't overslept,", "If we had left earlier,", "If he had studied harder,", "If they had listened,", "If I had known,"],
  "rowLabels": ["… she/we would have …", "… they wouldn't have …", "… everything could have …", "… it might have …", "… we would never have …"]
}`;

  const clean = await callAnthropic(prompt, 1200);
  return JSON.parse(clean);
}

async function generateHotPotatoPrompts(lessonContent, count = 30, level = "B1", focus = "grammar") {
  const guidelines = getLevelGuidelines(level, focus);
  const prompt = `You are an expert language teacher creating a fast-paced "Hot Potato" fluency game.

LESSON CONTENT:
${lessonContent}

LEVEL & FOCUS GUIDELINES:
${guidelines}

Generate exactly ${count} rapid-fire prompts. Each prompt must be answered in 3–5 seconds maximum.

RULES:
- Every prompt must be SHORT — one line only, under 12 words
- Sentence completions: leave a clear blank (use ___)
- Quick grammar questions: single answer expected
- Simple speaking triggers: "Name a...", "Say a sentence with..."
- Free answers are fine — mark them with "(free answer)"
- Mix types: completions, quick questions, vocabulary triggers
- Match the CEFR level — very simple at A1, more complex at B1

Examples:
{ "prompt": "'She ___ to school.' (go — she)", "answer": "goes" }
{ "prompt": "Opposite of 'lazy'?", "answer": "hardworking" }
{ "prompt": "Name something you wear in winter.", "answer": "(free — coat, scarf)" }
{ "prompt": "'If I had studied, I ___ passed.'", "answer": "would have" }

Return ONLY a valid JSON array, no markdown:
[{"prompt":"...", "answer":"..."}]

Return exactly ${count} items.`;

  const clean = await callAnthropic(prompt, 3000);
  return JSON.parse(clean);
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Confetti({ active }) {
  const colors = ["#EF4444","#3B82F6","#22C55E","#EAB308","#8B5CF6","#EC4899","#F59E0B"];
  if (!active) return null;
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,pointerEvents:"none",overflow:"hidden",zIndex:9999}}>
      {Array.from({length:40}).map((_,i) => (
        <div key={i} style={{
          position:"absolute",
          left:`${Math.random()*100}%`,
          top:`-20px`,
          width:"10px",height:"10px",
          background:colors[i%colors.length],
          borderRadius:Math.random()>0.5?"50%":"2px",
          animation:`confettiFall ${1.5+Math.random()*2}s ${Math.random()*1}s linear forwards`,
          transform:`rotate(${Math.random()*360}deg)`
        }}/>
      ))}
      <style>{`@keyframes confettiFall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}`}</style>
    </div>
  );
}

function ScoreBoard({ teams, highlight }) {
  const sorted = [...teams].sort((a,b)=>b.score-a.score);
  return (
    <div style={{display:"flex",gap:"8px",flexWrap:"wrap",justifyContent:"center"}}>
      {sorted.map((t,i) => (
        <div key={t.id} style={{
          background: highlight===t.id ? t.color.bg : t.color.light,
          border:`3px solid ${t.color.bg}`,
          borderRadius:"16px",
          padding:"12px 20px",
          textAlign:"center",
          minWidth:"120px",
          transform: highlight===t.id ? "scale(1.1)" : "scale(1)",
          transition:"all 0.3s",
          boxShadow: highlight===t.id ? `0 0 20px ${t.color.bg}80` : "none"
        }}>
          <div style={{fontSize:"24px"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":"🏅"}</div>
          <div style={{fontWeight:"800",fontSize:"15px",color: highlight===t.id?"white":t.color.dark}}>{t.name}</div>
          <div style={{fontWeight:"900",fontSize:"28px",color: highlight===t.id?"white":t.color.dark}}>{t.score}</div>
        </div>
      ))}
    </div>
  );
}

function Timer({ seconds, onEnd, running }) {
  const [left, setLeft] = useState(seconds);
  useEffect(()=>{ setLeft(seconds); },[seconds]);
  useEffect(()=>{
    if (!running) return;
    if (left<=0){onEnd?.();return;}
    const t=setTimeout(()=>setLeft(l=>l-1),1000);
    return ()=>clearTimeout(t);
  },[left,running]);
  const pct = (left/seconds)*100;
  const color = left>10?"#22C55E":left>5?"#EAB308":"#EF4444";
  return (
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:"48px",fontWeight:"900",color,fontVariantNumeric:"tabular-nums",lineHeight:1}}>{left}</div>
      <div style={{height:"8px",background:"#E5E7EB",borderRadius:"4px",margin:"8px 0",overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:color,transition:"width 1s linear",borderRadius:"4px"}}/>
      </div>
    </div>
  );
}

function QuestionCard({ question, showAnswer, onReveal }) {
  if (!question) return null;
  const isSpeaking = question.type === "speaking task";
  return (
    <div style={{background:"white",border:`3px solid ${isSpeaking ? "#F59E0B" : "#6366F1"}`,borderRadius:"20px",padding:"28px",textAlign:"center",boxShadow:`0 8px 32px ${isSpeaking ? "#F59E0B" : "#6366F1"}40`}}>
      <div style={{display:"inline-block",background: isSpeaking ? "#FEF3C7" : "#EEF2FF",color: isSpeaking ? "#92400E" : "#4F46E5",padding:"4px 14px",borderRadius:"20px",fontSize:"13px",fontWeight:"700",marginBottom:"12px",textTransform:"uppercase",letterSpacing:"0.05em"}}>
        {isSpeaking ? "💬 speaking prompt" : question.type}
      </div>
      <p style={{fontSize:"22px",fontWeight:"700",color:"#1E1B4B",margin:"0 0 16px",lineHeight:1.4}}>{question.question}</p>
      {isSpeaking ? (
        // Speaking tasks: no answer to reveal — teacher judges directly
        // Auto-call onReveal so parent shows ✅/❌ buttons immediately
        <div style={{background:"#FFFBEB",border:"2px solid #F59E0B",borderRadius:"12px",padding:"12px 16px",fontSize:"14px",color:"#92400E",fontWeight:"600"}}>
          🎙️ Open response — teacher listens and judges
        </div>
      ) : showAnswer ? (
        <div style={{background:"#ECFDF5",border:"2px solid #22C55E",borderRadius:"12px",padding:"14px",marginTop:"12px"}}>
          <div style={{fontWeight:"900",fontSize:"20px",color:"#14532D"}}>✅ {question.answer}</div>
          {question.hint && <div style={{color:"#166534",fontSize:"14px",marginTop:"6px"}}>💡 {question.hint}</div>}
        </div>
      ) : (
        <button onClick={onReveal} style={{background:"#6366F1",color:"white",border:"none",borderRadius:"12px",padding:"12px 28px",fontSize:"16px",fontWeight:"700",cursor:"pointer",marginTop:"8px"}}>
          👁 Reveal Answer
        </button>
      )}
    </div>
  );
}

// ─── SHARED TURN TIMER HOOK ───────────────────────────────────────────────────
// resetKey: change this value to force a full timer restart (e.g. pass activeTeamIdx)
function useTurnTimer(seconds, active, onExpire, resetKey = 0) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const timerRef = useRef(null);
  const onExpireRef = useRef(onExpire);

  // Keep onExpire ref fresh without causing restarts
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  const stop = useCallback(() => {
    clearInterval(timerRef.current);
  }, []);

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setTimeLeft(seconds);
  }, [seconds]);

  // Restart the timer whenever active flips to true, or resetKey changes
  useEffect(() => {
    clearInterval(timerRef.current);
    if (!active) {
      return;
    }
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          onExpireRef.current?.();
          return seconds;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [active, seconds, resetKey]); // resetKey forces restart on new team

  return { timeLeft, reset, stop };
}

function TurnTimerBar({ timeLeft, totalSeconds, color }) {
  const pct = (timeLeft / totalSeconds) * 100;
  const barColor = timeLeft > totalSeconds * 0.5 ? "#22C55E"
    : timeLeft > totalSeconds * 0.25 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
      <div style={{width:"80px",height:"8px",background:"rgba(255,255,255,0.25)",borderRadius:"4px",overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:barColor,borderRadius:"4px",transition:"width 1s linear"}}/>
      </div>
      <span style={{color:"white",fontWeight:"900",fontSize:"22px",minWidth:"28px",textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{timeLeft}</span>
    </div>
  );
}

// ─── GAME SCREENS ─────────────────────────────────────────────────────────────

function AuctionGame({ questions, teams, onUpdateScore, onEnd }) {
  const [qi, setQi] = useState(0);
  const [phase, setPhase] = useState("intro");
  const [bets, setBets] = useState({});
  const [resultMsg, setResultMsg] = useState([]);
  const [satOutLastRound, setSatOutLastRound] = useState(new Set());

  const s = questions[qi];
  if (!s) return null;

  const setBetField = (teamId, field, value) => {
    setBets(b => ({ ...b, [teamId]: { ...(b[teamId]||{}), [field]: value } }));
  };

  // A team is broke if score is 0 — they sit out this round
  const isBroke = (t) => t.score <= 0;
  const activeTeams = teams.filter(t => !isBroke(t));

  const allBetsPlaced = activeTeams.every(t => {
    const b = bets[t.id];
    return b && b.amount > 0 && (b.vote === "true" || b.vote === "false");
  });

  const resolveRound = () => {
    const msgs = [];
    const brokeThisRound = new Set();

    teams.forEach(t => {
      if (isBroke(t)) {
        // Sat out — record them, no bet processed
        brokeThisRound.add(t.id);
        msgs.push({ teamId: t.id, won: false, delta: 0, vote: null, amount: 0, satOut: true });
        return;
      }
      const b = bets[t.id] || {};
      const amount = b.amount || 0;
      const votedCorrect = b.vote === "true";
      const wasCorrect = s.isCorrect;
      const won = votedCorrect === wasCorrect;
      const delta = won ? amount : -amount;
      onUpdateScore(t.id, delta);
      msgs.push({ teamId: t.id, won, delta, vote: b.vote, amount, satOut: false });
    });

    setSatOutLastRound(brokeThisRound);
    setResultMsg(msgs);
    setPhase("result");
  };

  const nextRound = () => {
    // Revival: teams that sat out last round get 25pts to re-enter
    satOutLastRound.forEach(teamId => {
      onUpdateScore(teamId, 25);
    });

    if (qi + 1 >= questions.length) { onEnd(); return; }
    setQi(i => i + 1);
    setBets({});
    setResultMsg([]);
    setPhase("betting");
  };

  const BET_AMOUNTS = [25, 50, 100];

  if (phase === "intro") return (
    <div style={{textAlign:"center"}}>
      <div style={{background:"linear-gradient(135deg,#4C1D95,#7C3AED)",borderRadius:"20px",padding:"28px 24px",marginBottom:"10px",position:"relative",color:"white",maxWidth:"520px",margin:"0 auto 10px"}}>
        <div style={{fontSize:"36px",marginBottom:"10px"}}>🏛️</div>
        <div style={{fontWeight:"900",fontSize:"20px",marginBottom:"10px"}}>Sentence Auction</div>
        <div style={{fontSize:"15px",lineHeight:1.7,opacity:0.95}}>
          A sentence appears on screen — <strong>correct or incorrect?</strong><br/>
          Each team secretly picks their verdict and <strong>bets points</strong> on it.<br/>
          Win your bet and keep the points. Lose and they're gone!<br/>
          <strong>All In</strong> for big risk — <strong>25pts minimum</strong> to stay safe.
        </div>
        <div style={{position:"absolute",bottom:"-14px",left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"14px solid transparent",borderRight:"14px solid transparent",borderTop:"14px solid #7C3AED"}}/>
      </div>
      <div style={{marginTop:"24px",marginBottom:"20px",fontSize:"14px",color:"#6B7280",fontWeight:"600"}}>
        Each team starts with <strong>200 points</strong> to bet with. Minimum bet is 25 pts.
      </div>
      <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginBottom:"24px"}}>
        {teams.map(t => (<div key={t.id} style={{background:t.color.light,border:`3px solid ${t.color.bg}`,borderRadius:"14px",padding:"10px 18px",fontWeight:"800",fontSize:"14px",color:t.color.dark}}>{t.color.emoji} {t.name}</div>))}
      </div>
      <button onClick={() => setPhase("betting")} style={{background:"linear-gradient(135deg,#4C1D95,#7C3AED)",color:"white",border:"none",borderRadius:"16px",padding:"16px 48px",fontSize:"19px",fontWeight:"900",cursor:"pointer",boxShadow:"0 6px 24px rgba(124,58,237,0.4)"}}>
        🏛️ Start the Auction!
      </button>
    </div>
  );

  return (
    <div>
      {/* Sentence display */}
      <div style={{background:"#4C1D95",borderRadius:"18px",padding:"20px 24px",marginBottom:"18px",textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
          <span style={{background:"rgba(255,255,255,0.15)",color:"white",padding:"3px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"700"}}>Sentence {qi+1} of {questions.length}</span>
          <span style={{background:"rgba(255,255,255,0.15)",color:"white",padding:"3px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"700"}}>🏛️ Sentence Auction</span>
        </div>
        <p style={{fontSize:"clamp(16px,3vw,22px)",fontWeight:"800",color:"white",lineHeight:1.5,margin:"0 0 8px",fontStyle:"italic"}}>
          "{s.sentence}"
        </p>
        <p style={{color:"#C4B5FD",fontSize:"14px",margin:0}}>Is this sentence <strong style={{color:"#FCD34D"}}>correct</strong> or <strong style={{color:"#F87171"}}>incorrect</strong>?</p>
      </div>

      {/* Betting phase */}
      {phase === "betting" && (
        <div>
          <p style={{textAlign:"center",fontWeight:"800",color:"#374151",fontSize:"15px",marginBottom:"14px"}}>Each team: choose TRUE or FALSE, then place your bet</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"12px",marginBottom:"18px"}}>
            {teams.map(t => {
              const b = bets[t.id] || {};
              const broke = isBroke(t);
              const willRevive = satOutLastRound.has(t.id); // sat out prev round, about to get 25

              if (broke) {
                return (
                  <div key={t.id} style={{background:"#F3F4F6",border:`3px solid #D1D5DB`,borderRadius:"16px",padding:"14px",opacity:0.75,textAlign:"center"}}>
                    <div style={{fontWeight:"900",color:"#6B7280",fontSize:"15px",marginBottom:"8px"}}>{t.name} — 0 pts</div>
                    <div style={{fontSize:"28px",marginBottom:"6px"}}>💸</div>
                    <div style={{fontWeight:"800",color:"#6B7280",fontSize:"13px",marginBottom:"4px"}}>Sitting out this round</div>
                    <div style={{fontWeight:"700",color:"#22C55E",fontSize:"12px"}}>+25 pts revival next round!</div>
                  </div>
                );
              }

              return (
                <div key={t.id} style={{background:t.color.light,border:`3px solid ${t.color.bg}`,borderRadius:"16px",padding:"14px"}}>
                  <div style={{fontWeight:"900",color:t.color.dark,fontSize:"15px",marginBottom:"10px"}}>{t.name} — {t.score} pts</div>

                  {/* True/False vote */}
                  <div style={{display:"flex",gap:"8px",marginBottom:"10px"}}>
                    <button onClick={()=>setBetField(t.id,"vote","true")} style={{
                      flex:1,padding:"8px 4px",fontWeight:"800",fontSize:"14px",border:`2px solid ${t.color.bg}`,borderRadius:"10px",cursor:"pointer",
                      background: b.vote==="true" ? "#22C55E" : "white",
                      color: b.vote==="true" ? "white" : t.color.dark
                    }}>✅ TRUE</button>
                    <button onClick={()=>setBetField(t.id,"vote","false")} style={{
                      flex:1,padding:"8px 4px",fontWeight:"800",fontSize:"14px",border:`2px solid ${t.color.bg}`,borderRadius:"10px",cursor:"pointer",
                      background: b.vote==="false" ? "#EF4444" : "white",
                      color: b.vote==="false" ? "white" : t.color.dark
                    }}>❌ FALSE</button>
                  </div>

                  {/* Point bet */}
                  <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                    {BET_AMOUNTS.filter(amt => amt <= t.score).map(amt => (
                      <button key={amt} onClick={()=>setBetField(t.id,"amount",amt)} style={{
                        padding:"5px 10px",fontWeight:"700",fontSize:"13px",
                        border:`2px solid ${t.color.bg}`,borderRadius:"8px",cursor:"pointer",
                        background: b.amount===amt ? t.color.bg : "white",
                        color: b.amount===amt ? "white" : t.color.dark
                      }}>{amt}</button>
                    ))}
                    <button onClick={()=>setBetField(t.id,"amount",t.score)} style={{
                      padding:"5px 10px",fontWeight:"700",fontSize:"12px",
                      border:`2px solid ${t.color.bg}`,borderRadius:"8px",cursor:"pointer",
                      background: b.amount===t.score ? t.color.bg : "white",
                      color: b.amount===t.score ? "white" : t.color.dark
                    }}>ALL IN</button>
                  </div>

                  {b.vote && b.amount > 0 && (
                    <div style={{marginTop:"8px",fontSize:"12px",fontWeight:"700",color:t.color.dark,background:"rgba(0,0,0,0.06)",borderRadius:"8px",padding:"5px 8px"}}>
                      Betting {b.amount}pts on {b.vote==="true"?"TRUE ✅":"FALSE ❌"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{textAlign:"center"}}>
            <button onClick={resolveRound} disabled={!allBetsPlaced} style={{
              background: allBetsPlaced ? "#7C3AED" : "#D1D5DB",
              color:"white",border:"none",borderRadius:"14px",
              padding:"14px 36px",fontSize:"17px",fontWeight:"900",
              cursor: allBetsPlaced ? "pointer" : "not-allowed"
            }}>🔔 Reveal Answer</button>
            {!allBetsPlaced && <p style={{color:"#9CA3AF",fontSize:"13px",marginTop:"8px"}}>
              {activeTeams.length === 0 ? "All teams are out — proceed to next round!" : "All active teams must pick TRUE/FALSE and a bet amount"}
            </p>}
            {activeTeams.length === 0 && (
              <button onClick={resolveRound} style={{
                background:"#6366F1",color:"white",border:"none",borderRadius:"14px",
                padding:"14px 36px",fontSize:"17px",fontWeight:"900",cursor:"pointer",marginTop:"8px"
              }}>➡️ Skip to Revival Round</button>
            )}
          </div>
        </div>
      )}

      {/* Reveal phase */}
      {phase === "result" && (
        <div>
          {/* Answer reveal */}
          <div style={{
            background: s.isCorrect ? "#ECFDF5" : "#FEF2F2",
            border: `3px solid ${s.isCorrect ? "#22C55E" : "#EF4444"}`,
            borderRadius:"16px",padding:"16px 20px",textAlign:"center",marginBottom:"16px"
          }}>
            <div style={{fontSize:"32px",marginBottom:"6px"}}>{s.isCorrect ? "✅" : "❌"}</div>
            <div style={{fontWeight:"900",fontSize:"20px",color: s.isCorrect ? "#14532D" : "#991B1B",marginBottom:"8px"}}>
              This sentence is {s.isCorrect ? "CORRECT" : "INCORRECT"}
            </div>
            <p style={{color: s.isCorrect ? "#166534" : "#B91C1C",fontSize:"15px",margin:0,lineHeight:1.5}}>{s.explanation}</p>
          </div>

          {/* Per-team results */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"10px",marginBottom:"18px"}}>
            {resultMsg.map(r => {
              const t = teams.find(tm=>tm.id===r.teamId);
              if (r.satOut) {
                return (
                  <div key={r.teamId} style={{background:"#F3F4F6",border:"3px solid #D1D5DB",borderRadius:"14px",padding:"12px",textAlign:"center",opacity:0.75}}>
                    <div style={{fontWeight:"900",fontSize:"15px",color:"#6B7280",marginBottom:"6px"}}>{t.name}</div>
                    <div style={{fontSize:"22px",marginBottom:"4px"}}>💸</div>
                    <div style={{fontSize:"13px",color:"#6B7280",fontWeight:"700"}}>Sat out</div>
                    <div style={{fontSize:"12px",color:"#22C55E",fontWeight:"700",marginTop:"4px"}}>+25 pts next round!</div>
                  </div>
                );
              }
              return (
                <div key={r.teamId} style={{
                  background: r.won ? "#ECFDF5" : "#FEF2F2",
                  border:`3px solid ${r.won?"#22C55E":"#EF4444"}`,
                  borderRadius:"14px",padding:"12px",textAlign:"center"
                }}>
                  <div style={{fontWeight:"900",fontSize:"15px",color:t.color.dark,marginBottom:"6px"}}>{t.name}</div>
                  <div style={{fontSize:"13px",marginBottom:"6px",color:"#374151"}}>
                    Voted: <strong>{r.vote==="true"?"TRUE ✅":"FALSE ❌"}</strong> · Bet: <strong>{r.amount}pts</strong>
                  </div>
                  <div style={{fontWeight:"900",fontSize:"22px",color: r.won?"#14532D":"#991B1B"}}>
                    {r.won ? `+${r.delta}` : `${r.delta}`}
                  </div>
                  <div style={{fontSize:"13px",color: r.won?"#166534":"#B91C1C",fontWeight:"700"}}>{r.won?"Correct!":"Wrong!"}</div>
                </div>
              );
            })}
          </div>

          <div style={{textAlign:"center"}}>
            <button onClick={nextRound} style={{
              background:"#7C3AED",color:"white",border:"none",
              borderRadius:"14px",padding:"14px 36px",fontSize:"17px",fontWeight:"900",cursor:"pointer"
            }}>{qi+1 >= questions.length ? "🏁 End Game" : "➡️ Next Sentence"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MinefieldGame({ gridData, teams, onUpdateScore, onEnd }) {
  const ROWS = 5;
  const COLS = 5;
  const TOTAL = ROWS * COLS;
  const MINE_COUNT = 7;

  const mines = useRef(
    new Set([...Array(TOTAL)].map((_,i)=>i).sort(()=>Math.random()-0.5).slice(0,MINE_COUNT))
  ).current;

  const [revealed, setRevealed]     = useState(new Set());
  const [activeTeam, setActiveTeam] = useState(0);
  const [phase, setPhase]           = useState("intro");   // "intro" | "pick" | "speaking" | "judging"
  const [selectedTile, setSelectedTile] = useState(null);
  const [boom, setBoom]             = useState(null);
  const [lastResult, setLastResult] = useState(null);     // { correct, isMine, sentence }

  const t = teams[activeTeam];
  const safeRevealed = [...revealed].filter(i => !mines.has(i)).length;
  const totalSafe    = TOTAL - MINE_COUNT;

  if (!gridData) return (
    <div style={{textAlign:"center",padding:"40px",color:"#6B7280"}}>
      <div style={{fontSize:"40px",marginBottom:"12px"}}>⏳</div>
      <div style={{fontWeight:"700"}}>Loading grid…</div>
    </div>
  );

  const { colLabels, rowLabels, topic, instructions } = gridData;

  // Build the sentence prompt for a given tile index
  const getSentence = (idx) => {
    const ri = Math.floor(idx / COLS);
    const ci = idx % COLS;
    return { col: colLabels[ci], row: rowLabels[ri] };
  };

  const pickTile = (idx) => {
    if (revealed.has(idx) || phase !== "pick") return;
    setSelectedTile(idx);
    setLastResult(null);
    setPhase("speaking");
  };

  const afterJudge = (correct) => {
    const isMine = mines.has(selectedTile);
    const { col, row } = getSentence(selectedTile);
    setRevealed(r => new Set([...r, selectedTile]));
    setLastResult({ correct, isMine, col, row });

    if (isMine) {
      setBoom(true);
      onUpdateScore(teams[activeTeam].id, -75);
      setTimeout(() => setBoom(false), 2200);
    } else if (correct) {
      onUpdateScore(teams[activeTeam].id, 50);
    }

    setPhase("pick");
    setSelectedTile(null);
    setActiveTeam(at => (at + 1) % teams.length);

    if (safeRevealed + (isMine ? 0 : 1) >= totalSafe) onEnd();
  };

  // ── Tile sizing ──────────────────────────────────────────────────
  // Column labels can be long — we use a fixed tile height but flexible width via CSS grid
  const colLabelMaxLen = Math.max(...colLabels.map(l=>l.length));
  const rowLabelMaxLen = Math.max(...rowLabels.map(l=>l.length));
  const TILE_H = 58;
  const GAP    = 5;

  const selData = selectedTile !== null ? getSentence(selectedTile) : null;

  if (phase === "intro") return (
    <div style={{textAlign:"center"}}>
      <div style={{background:"linear-gradient(135deg,#4C1D95,#6D28D9)",borderRadius:"20px",padding:"28px 24px",marginBottom:"10px",position:"relative",color:"white",maxWidth:"520px",margin:"0 auto 10px"}}>
        <div style={{fontSize:"36px",marginBottom:"10px"}}>💣</div>
        <div style={{fontWeight:"900",fontSize:"20px",marginBottom:"10px"}}>Minefield</div>
        <div style={{fontSize:"15px",lineHeight:1.7,opacity:0.95}}>
          A grid of tiles hides <strong>7 mines</strong>. Teams take turns picking a square.<br/>
          Each square shows a <strong>sentence starter</strong> — combine the column and row,<br/>
          then <strong>speak a full sentence</strong> using the target language.<br/>
          The teacher judges: correct = <strong>+50 pts</strong>. Hit a mine = <strong>−75 pts</strong>!
        </div>
        <div style={{position:"absolute",bottom:"-14px",left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"14px solid transparent",borderRight:"14px solid transparent",borderTop:"14px solid #6D28D9"}}/>
      </div>
      <div style={{marginTop:"24px",marginBottom:"20px",fontSize:"14px",color:"#6B7280",fontWeight:"600"}}>
        Take turns picking squares — the team with the most points when all safe tiles are cleared wins!
      </div>
      <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginBottom:"24px"}}>
        {teams.map(t => (<div key={t.id} style={{background:t.color.light,border:`3px solid ${t.color.bg}`,borderRadius:"14px",padding:"10px 18px",fontWeight:"800",fontSize:"14px",color:t.color.dark}}>{t.color.emoji} {t.name}</div>))}
      </div>
      <button onClick={() => setPhase("pick")} style={{background:"linear-gradient(135deg,#4C1D95,#6D28D9)",color:"white",border:"none",borderRadius:"16px",padding:"16px 48px",fontSize:"19px",fontWeight:"900",cursor:"pointer",boxShadow:"0 6px 24px rgba(109,40,217,0.4)"}}>
        💣 Enter the Minefield!
      </button>
    </div>
  );

  return (
    <div>
      {/* ── Topic + instructions banner ── */}
      <div style={{
        background:"linear-gradient(135deg,#4C1D95,#6D28D9)",
        borderRadius:"14px", padding:"12px 18px", marginBottom:"14px", textAlign:"center"
      }}>
        <div style={{color:"#DDD6FE", fontWeight:"900", fontSize:"15px", marginBottom:"4px"}}>
          💣 {topic}
        </div>
        <div style={{color:"#C4B5FD", fontSize:"13px", lineHeight:1.5}}>
          {instructions}
        </div>
      </div>

      {/* ── Turn bar ── */}
      <div style={{
        background: t.color.bg, borderRadius:"14px", padding:"10px 18px",
        marginBottom:"14px", display:"flex", alignItems:"center",
        justifyContent:"space-between", flexWrap:"wrap", gap:"8px"
      }}>
        <span style={{color:"white", fontWeight:"900", fontSize:"17px"}}>
          {phase === "pick"     && `🎯 ${t.name} — Pick a square!`}
          {phase === "speaking" && `🗣️ ${t.name} — Say the sentence!`}
          {phase === "judging"  && `👂 Teacher — Judge the sentence`}
        </span>
        <div style={{
          background:"rgba(255,255,255,0.2)", borderRadius:"20px",
          padding:"4px 12px", color:"white", fontWeight:"700", fontSize:"13px"
        }}>
          {safeRevealed}/{totalSafe} safe ✅ &nbsp;|&nbsp; {MINE_COUNT} 💣
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{height:"8px", background:"#E5E7EB", borderRadius:"4px", overflow:"hidden", marginBottom:"14px"}}>
        <div style={{height:"100%", width:`${(safeRevealed/totalSafe)*100}%`, background:"#22C55E", borderRadius:"4px", transition:"width 0.4s ease"}}/>
      </div>

      {/* ── BOOM flash ── */}
      {boom && (
        <div style={{
          textAlign:"center", background:"#7F1D1D", border:"3px solid #EF4444",
          borderRadius:"14px", padding:"14px", marginBottom:"14px",
          animation:"boomPulse 0.3s ease-out"
        }}>
          <div style={{fontSize:"40px", marginBottom:"4px"}}>💥</div>
          <div style={{fontWeight:"900", fontSize:"20px", color:"#FCA5A5"}}>BOOM! Mine hit!</div>
          <div style={{color:"#FCA5A5", fontWeight:"700", fontSize:"14px", marginTop:"2px"}}>
            {lastResult && `"${lastResult.col} + ${lastResult.row}…" — ${teams[activeTeam < teams.length ? (activeTeam - 1 + teams.length) % teams.length : 0]?.name ?? t.name} loses 75 pts`}
          </div>
        </div>
      )}

      {/* ── Last result ── */}
      {!boom && lastResult && phase === "pick" && (
        <div style={{
          background: lastResult.correct && !lastResult.isMine ? "#ECFDF5" : lastResult.isMine ? "#FEF2F2" : "#FFF7ED",
          border: `2px solid ${lastResult.correct && !lastResult.isMine ? "#22C55E" : lastResult.isMine ? "#EF4444" : "#F97316"}`,
          borderRadius:"12px", padding:"10px 16px", marginBottom:"12px", textAlign:"center",
          fontSize:"13px", fontWeight:"700",
          color: lastResult.correct && !lastResult.isMine ? "#14532D" : lastResult.isMine ? "#991B1B" : "#7C2D12"
        }}>
          {lastResult.isMine
            ? "💥 Mine! −75 pts"
            : lastResult.correct
              ? "✅ Great sentence! +50 pts"
              : "❌ Incorrect — no points"}
        </div>
      )}

      {/* ── Speaking prompt (shown when a tile is selected) ── */}
      {phase === "speaking" && selData && (
        <div style={{
          background:"linear-gradient(135deg,#FEF3C7,#FDE68A)",
          border:"3px solid #F59E0B", borderRadius:"16px",
          padding:"20px", marginBottom:"14px", textAlign:"center"
        }}>
          <div style={{fontSize:"13px", fontWeight:"700", color:"#92400E", marginBottom:"10px", textTransform:"uppercase", letterSpacing:"0.05em"}}>
            🗣️ {t.name} — Combine these and complete the sentence:
          </div>
          <div style={{
            display:"flex", gap:"10px", justifyContent:"center",
            flexWrap:"wrap", marginBottom:"14px"
          }}>
            <div style={{
              background:"#7C3AED", color:"white", borderRadius:"12px",
              padding:"10px 16px", fontWeight:"800", fontSize:"16px",
              maxWidth:"260px", lineHeight:1.4
            }}>
              {selData.col}
            </div>
            <div style={{
              display:"flex", alignItems:"center",
              fontSize:"24px", fontWeight:"900", color:"#92400E"
            }}>+</div>
            <div style={{
              background:"#0891B2", color:"white", borderRadius:"12px",
              padding:"10px 16px", fontWeight:"800", fontSize:"16px",
              maxWidth:"260px", lineHeight:1.4
            }}>
              {selData.row}
            </div>
            <div style={{
              display:"flex", alignItems:"center",
              fontSize:"20px", color:"#92400E", fontWeight:"800"
            }}>+ …your idea</div>
          </div>
          <div style={{color:"#78350F", fontSize:"13px", fontWeight:"600", marginBottom:"14px"}}>
            Say the full sentence out loud — then your teacher will judge it!
          </div>
          <button
            onClick={() => setPhase("judging")}
            style={{
              background:"linear-gradient(135deg,#7C3AED,#6D28D9)",
              color:"white", border:"none", borderRadius:"12px",
              padding:"12px 32px", fontSize:"16px", fontWeight:"800", cursor:"pointer",
              boxShadow:"0 4px 16px rgba(124,58,237,0.35)"
            }}
          >
            👂 I've spoken — Teacher judges
          </button>
        </div>
      )}

      {/* ── Judging panel ── */}
      {phase === "judging" && selData && (
        <div style={{
          background:"#F8F7FF", border:"3px solid #6366F1",
          borderRadius:"16px", padding:"20px", marginBottom:"14px", textAlign:"center"
        }}>
          <div style={{fontSize:"13px", fontWeight:"700", color:"#4338CA", marginBottom:"8px", textTransform:"uppercase", letterSpacing:"0.05em"}}>
            👩‍🏫 Teacher — Did the student use the target language correctly?
          </div>
          <div style={{
            background:"#EEF2FF", borderRadius:"10px", padding:"10px 16px",
            marginBottom:"16px", fontStyle:"italic", color:"#3730A3", fontWeight:"700", fontSize:"15px"
          }}>
            "{selData.col} {selData.row} …"
          </div>
          <div style={{display:"flex", gap:"14px", justifyContent:"center"}}>
            <button
              onClick={() => afterJudge(true)}
              style={{
                background:"linear-gradient(135deg,#22C55E,#15803D)",
                color:"white", border:"none", borderRadius:"14px",
                padding:"14px 36px", fontSize:"18px", fontWeight:"900", cursor:"pointer",
                boxShadow:"0 4px 16px rgba(34,197,94,0.4)"
              }}
            >✅ Correct! +50</button>
            <button
              onClick={() => afterJudge(false)}
              style={{
                background:"linear-gradient(135deg,#EF4444,#B91C1C)",
                color:"white", border:"none", borderRadius:"14px",
                padding:"14px 36px", fontSize:"18px", fontWeight:"900", cursor:"pointer",
                boxShadow:"0 4px 16px rgba(239,68,68,0.4)"
              }}
            >❌ Wrong — 0 pts</button>
          </div>
          <div style={{fontSize:"12px", color:"#6B7280", marginTop:"10px", fontWeight:"600"}}>
            (Mine risk still applies regardless of answer)
          </div>
        </div>
      )}

      {/* ── THE GRID ── */}
      <div style={{overflowX:"auto", marginBottom:"8px"}}>
        <table style={{borderCollapse:"separate", borderSpacing:`${GAP}px`, margin:"0 auto"}}>
          <thead>
            <tr>
              {/* empty corner */}
              <th style={{width:"110px"}}></th>
              {colLabels.map((label, ci) => (
                <th key={ci} style={{
                  background:"linear-gradient(135deg,#4C1D95,#7C3AED)",
                  color:"white", fontWeight:"800", fontSize:"11px",
                  padding:"8px 6px", borderRadius:"10px",
                  textAlign:"center", lineHeight:1.35,
                  width:"90px", maxWidth:"90px",
                  wordBreak:"break-word", whiteSpace:"normal"
                }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((rowLabel, ri) => (
              <tr key={ri}>
                {/* Row label */}
                <td style={{
                  background:"linear-gradient(135deg,#0E7490,#0891B2)",
                  color:"white", fontWeight:"800", fontSize:"11px",
                  padding:"8px 10px", borderRadius:"10px",
                  textAlign:"center", lineHeight:1.35,
                  wordBreak:"break-word", whiteSpace:"normal"
                }}>
                  {rowLabel}
                </td>
                {/* Tiles */}
                {colLabels.map((_, ci) => {
                  const idx = ri * COLS + ci;
                  const isRev  = revealed.has(idx);
                  const isMine = isRev && mines.has(idx);
                  const isSel  = selectedTile === idx;
                  const disabled = isRev || phase !== "pick";

                  let bg, emoji, cursor;
                  if (isRev) {
                    bg     = isMine
                      ? "linear-gradient(135deg,#EF4444,#B91C1C)"
                      : "linear-gradient(135deg,#22C55E,#15803D)";
                    emoji  = isMine ? "💥" : "✅";
                    cursor = "default";
                  } else if (isSel) {
                    bg = "linear-gradient(135deg,#FCD34D,#F59E0B)";
                    emoji = "🎯";
                    cursor = "default";
                  } else {
                    bg = phase !== "pick"
                      ? "linear-gradient(135deg,#818CF8,#6366F1)"
                      : "linear-gradient(135deg,#6366F1,#4338CA)";
                    emoji = null;
                    cursor = disabled ? "default" : "pointer";
                  }

                  return (
                    <td key={ci} style={{padding:0}}>
                      <button
                        onClick={() => pickTile(idx)}
                        disabled={disabled}
                        style={{
                          width:"90px", height:`${TILE_H}px`,
                          border:"none", borderRadius:"12px",
                          fontSize: isRev ? 22 : 11,
                          fontWeight:"900", cursor,
                          transition:"all 0.15s",
                          transform: isSel ? "scale(1.1)" : (phase !== "pick" && !isRev) ? "scale(0.95)" : "scale(1)",
                          background: bg,
                          color:"white",
                          boxShadow: isSel ? "0 0 18px #FCD34D90" : isRev
                            ? (isMine ? "0 2px 8px #EF444460" : "0 2px 8px #22C55E60")
                            : "0 2px 6px rgba(99,102,241,0.35)",
                          opacity: (phase !== "pick" && !isRev && !isSel) ? 0.6 : 1,
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}
                      >
                        {isRev ? emoji : isSel ? emoji : "💣?"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{textAlign:"center", fontSize:"12px", color:"#9CA3AF", fontWeight:"600", marginTop:"6px"}}>
        {MINE_COUNT} mines hidden · Click a square → say the sentence → teacher judges
      </div>

      <style>{`
        @keyframes boomPulse {
          0%   { transform: scale(0.92); opacity: 0.6; }
          60%  { transform: scale(1.04); }
          100% { transform: scale(1);    opacity: 1;   }
        }
      `}</style>
    </div>
  );
}

// Generates a random set of ship coordinates for a 5x5 grid
// ── BATTLESHIP COLUMN DEFINITIONS ─────────────────────────────────────────────
// Each column maps to a question type. The 5th column (E) only appears for 2 teams.
const BATTLESHIP_COLS_5 = [
  { letter:"A", label:"Correct the mistake",   emoji:"✏️",  type:"correct grammar mistakes"       },
  { letter:"B", label:"Choose correct grammar", emoji:"🔤",  type:"choose correct grammar"          },
  { letter:"C", label:"Use in a sentence",      emoji:"💬",  type:"use vocabulary in a sentence"   },
  { letter:"D", label:"Finish the sentence",    emoji:"✍️",  type:"finish the sentence"             },
  { letter:"E", label:"Speaking challenge",     emoji:"🗣️",  type:"speaking task"                   },
];
const BATTLESHIP_COLS_4 = BATTLESHIP_COLS_5.slice(0, 4); // A–D only for 3-4 teams

// Build ships on an N×N grid (letters A–D or A–E, rows 1–N)
function generateShipsNxN(cols) {
  const all = [];
  [1,2,3,4,5].slice(0, cols.length).forEach(r =>
    cols.forEach(c => all.push(c.letter + r))
  );
  // ~30% of cells are ships
  const count = cols.length === 5 ? 7 : 5;
  return new Set(all.sort(() => Math.random() - 0.5).slice(0, count));
}

// Build a coordinate→question map so every coord has a fixed, unique question
// Column letter determines the question type; row number picks which question of that type
function buildCoordMap(questions, cols) {
  // Group questions by type
  const byType = {};
  cols.forEach(col => { byType[col.type] = []; });
  questions.forEach(q => {
    const t = q.type;
    if (byType[t] !== undefined) byType[t].push(q);
  });
  // For "speaking task" — synthesise from any question that has a task/question field
  if (byType["speaking task"] !== undefined && byType["speaking task"].length === 0) {
    byType["speaking task"] = questions.map(q => ({
      ...q,
      type: "speaking task",
      question: q.task || q.question || q.word || String(q),
      answer: "Open — teacher judges",
      hint: "Speak a full sentence using the target language",
    }));
  }

  const rows = cols.length; // 4 or 5
  const map = {};
  cols.forEach(col => {
    const pool = byType[col.type] || [];
    // Shuffle pool so each game is different
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (let r = 1; r <= rows; r++) {
      const coord = col.letter + r;
      map[coord] = shuffled[(r - 1) % Math.max(shuffled.length, 1)] || questions[0];
    }
  });
  return map;
}

function BattleshipGame({ questions, teams, onUpdateScore, onEnd }) {
  const TURN_SECONDS = 25;

  // 4×4 for 3-4 teams, 5×5 for 2 teams
  const COLS = teams.length === 2 ? BATTLESHIP_COLS_5 : BATTLESHIP_COLS_4;
  const ROWS = COLS.map((_, i) => i + 1); // [1,2,3,4] or [1,2,3,4,5]

  // Build shared coord→question map once (same for every team's board)
  const coordMap = useRef(buildCoordMap(questions, COLS)).current;

  // Each team gets their own random fleet on the same-sized grid
  const fleets = useRef(Object.fromEntries(teams.map(t => [t.id, [...generateShipsNxN(COLS)]]))).current;

  const [hits,   setHits]   = useState(() => Object.fromEntries(teams.map(t => [t.id, []])));
  const [misses, setMisses] = useState(() => Object.fromEntries(teams.map(t => [t.id, []])));

  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [phase,         setPhase]         = useState("intro");
  const [targetTeamId,  setTargetTeamId]  = useState(null);
  const [pendingCoord,  setPendingCoord]  = useState(null);
  const [showAns,       setShowAns]       = useState(false);

  const activeTeam = teams[activeTeamIdx];
  const currentQ   = pendingCoord ? coordMap[pendingCoord] : null;

  const isEliminated = useCallback((teamId, hitsOverride) => {
    const h = hitsOverride || hits;
    return fleets[teamId].every(s => (h[teamId] || []).includes(s));
  }, [hits, fleets]);

  const advanceTurn = useCallback((hitsOverride) => {
    setPhase("pick-target");
    setShowAns(false);
    setTargetTeamId(null);
    setPendingCoord(null);
    let next = (activeTeamIdx + 1) % teams.length;
    let tries = 0;
    while (isEliminated(teams[next].id, hitsOverride) && tries < teams.length) {
      next = (next + 1) % teams.length;
      tries++;
    }
    setActiveTeamIdx(next);
  }, [activeTeamIdx, teams, isEliminated]);

  const { timeLeft, stop } = useTurnTimer(
    TURN_SECONDS,
    phase === "pick-target" || phase === "pick-coord",
    () => advanceTurn(),
    activeTeamIdx
  );

  const pickTarget = (teamId) => {
    if (phase !== "pick-target" || isEliminated(teamId)) return;
    setTargetTeamId(teamId);
    setPhase("pick-coord");
  };

  const pickCoord = (coord) => {
    if (phase !== "pick-coord") return;
    if ((hits[targetTeamId] || []).includes(coord)) return;
    if ((misses[targetTeamId] || []).includes(coord)) return;
    stop();
    setPendingCoord(coord);
    setPhase("answer");
  };

  const resolve = (correct) => {
    const isShip = fleets[targetTeamId].includes(pendingCoord);
    let newHits = hits;

    if (correct && isShip) {
      newHits = { ...hits, [targetTeamId]: [...(hits[targetTeamId] || []), pendingCoord] };
      setHits(newHits);
      onUpdateScore(activeTeam.id, 100);
      if (isEliminated(targetTeamId, newHits)) {
        if (teams.filter(t => !isEliminated(t.id, newHits)).length <= 1) { onEnd(); return; }
      }
    } else if (correct && !isShip) {
      setMisses(m => ({ ...m, [targetTeamId]: [...(m[targetTeamId] || []), pendingCoord] }));
      onUpdateScore(activeTeam.id, 20);
    } else {
      setMisses(m => ({ ...m, [targetTeamId]: [...(m[targetTeamId] || []), pendingCoord] }));
    }

    advanceTurn(newHits);
  };

  // Resolve a speaking task — teacher judges directly
  const isSpeakingTask = currentQ?.type === "speaking task";

  // Column colour legend
  const colColor = (letter) => {
    const idx = COLS.findIndex(c => c.letter === letter);
    const palette = ["#7C3AED","#0891B2","#059669","#D97706","#DC2626"];
    return palette[idx] ?? "#6366F1";
  };

  if (phase === "intro") return (
        <div style={{textAlign:"center"}}>
          <div style={{background:"linear-gradient(135deg,#1E3A8A,#2563EB)",borderRadius:"20px",padding:"28px 24px",marginBottom:"10px",position:"relative",color:"white",maxWidth:"520px",margin:"0 auto 10px"}}>
            <div style={{fontSize:"36px",marginBottom:"10px"}}>⚓</div>
            <div style={{fontWeight:"900",fontSize:"20px",marginBottom:"10px"}}>Grammar Battleship</div>
            <div style={{fontSize:"15px",lineHeight:1.7,opacity:0.95}}>
              Each team has a hidden fleet of ships on their ocean grid.<br/>
              On your turn: <strong>pick an enemy team</strong>, then <strong>fire at a square</strong>.<br/>
              Each <strong>column is a different task type</strong> — answer correctly to fire!<br/>
              Hit a ship = <strong>+100 pts</strong>. Hit water and answer = <strong>+20 pts</strong>.<br/>
              Sink all of a team's ships to eliminate them. Last fleet wins!
            </div>
            <div style={{position:"absolute",bottom:"-14px",left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"14px solid transparent",borderRight:"14px solid transparent",borderTop:"14px solid #2563EB"}}/>
          </div>
          <div style={{marginTop:"24px",marginBottom:"20px",fontSize:"14px",color:"#6B7280",fontWeight:"600"}}>
            {teams.length === 2 ? "2 teams — 5x5 boards with a speaking challenge column (E)." : teams.length + " teams — 4x4 boards, columns A–D."}
          </div>
          <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginBottom:"24px"}}>
            {teams.map(t => (<div key={t.id} style={{background:t.color.light,border:"3px solid "+t.color.bg,borderRadius:"14px",padding:"10px 18px",fontWeight:"800",fontSize:"14px",color:t.color.dark}}>{t.color.emoji} {t.name}</div>))}
          </div>
          <button onClick={() => setPhase("pick-target")} style={{background:"linear-gradient(135deg,#1E3A8A,#2563EB)",color:"white",border:"none",borderRadius:"16px",padding:"16px 48px",fontSize:"19px",fontWeight:"900",cursor:"pointer",boxShadow:"0 6px 24px rgba(37,99,235,0.4)"}}>
            ⚓ Battle Stations!
          </button>
        </div>
  );

  return (
    <div>
      {/* Column legend */}
      <div style={{display:"flex",gap:"6px",flexWrap:"wrap",justifyContent:"center",marginBottom:"12px"}}>
        {COLS.map(col => (
          <div key={col.letter} style={{
            background:colColor(col.letter), color:"white",
            borderRadius:"10px", padding:"5px 12px",
            fontSize:"12px", fontWeight:"800",
            display:"flex", alignItems:"center", gap:"5px"
          }}>
            <span style={{fontWeight:"900"}}>{col.letter}</span>
            <span style={{opacity:0.85}}>{col.emoji} {col.label}</span>
          </div>
        ))}
      </div>

      {/* Turn header */}
      <div style={{background:activeTeam.color.bg,borderRadius:"14px",padding:"10px 16px",marginBottom:"14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
        <span style={{color:"white",fontWeight:"900",fontSize:"17px"}}>
          ⚓ {activeTeam.name} —{" "}
          {phase==="pick-target" && "Choose a team to attack!"}
          {phase==="pick-coord" && `Targeting ${teams.find(t=>t.id===targetTeamId)?.name} — pick a square!`}
          {phase==="answer"     && `Firing at ${teams.find(t=>t.id===targetTeamId)?.name} — ${pendingCoord}!`}
        </span>
        {(phase==="pick-target"||phase==="pick-coord") && <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS}/>}
      </div>

      {/* Target selector */}
      {phase==="pick-target" && (
        <div style={{display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap",marginBottom:"14px"}}>
          {teams.filter(t=>t.id!==activeTeam.id).map(t=>(
            <button key={t.id} onClick={()=>pickTarget(t.id)} disabled={isEliminated(t.id)} style={{
              background:isEliminated(t.id)?"#E5E7EB":t.color.bg,
              color:isEliminated(t.id)?"#9CA3AF":"white",
              border:"none",borderRadius:"12px",padding:"10px 20px",
              fontWeight:"800",fontSize:"15px",cursor:isEliminated(t.id)?"not-allowed":"pointer"
            }}>
              {isEliminated(t.id)?"💀":"🎯"} {t.name}
            </button>
          ))}
        </div>
      )}

      {/* ALL boards — 2×2 for 4 teams, auto for 2-3 */}
      <div style={{
        display:"grid",
        gridTemplateColumns: teams.length === 4 ? "1fr 1fr" : "repeat(auto-fit,minmax(220px,1fr))",
        gap:"12px",marginBottom:"14px"
      }}>
        {teams.map(team => {
          const teamHits   = hits[team.id]   || [];
          const teamMisses = misses[team.id] || [];
          const eliminated = isEliminated(team.id);
          const isTarget   = targetTeamId === team.id;
          const isActive   = team.id === activeTeam.id;
          const shipsLeft  = fleets[team.id].filter(s=>!teamHits.includes(s)).length;
          const totalShips = fleets[team.id].length;

          return (
            <div key={team.id} style={{
              background: eliminated
                ? "linear-gradient(135deg,#F3F4F6,#E5E7EB)"
                : isTarget
                  ? `linear-gradient(135deg,${team.color.light},white)`
                  : `linear-gradient(135deg,${team.color.light},white)`,
              border: `3px solid ${isTarget ? activeTeam.color.bg : eliminated ? "#D1D5DB" : team.color.bg}`,
              borderRadius:"18px", padding:"14px",
              opacity: eliminated ? 0.55 : 1,
              boxShadow: isTarget
                ? `0 0 0 3px ${activeTeam.color.bg}40, 0 8px 24px ${activeTeam.color.bg}30`
                : "0 2px 8px rgba(0,0,0,0.06)",
              transition:"all 0.25s"
            }}>
              {/* Board header */}
              <div style={{
                background: eliminated ? "#9CA3AF" : isActive ? team.color.bg : isTarget ? activeTeam.color.bg : team.color.bg,
                borderRadius:"10px", padding:"8px 12px", marginBottom:"10px",
                display:"flex", justifyContent:"space-between", alignItems:"center"
              }}>
                <span style={{fontWeight:"900",fontSize:"13px",color:"white"}}>
                  {eliminated ? "💀 SUNK" : isActive ? `🚢 ${team.name}` : isTarget ? `🎯 ${team.name}` : `🛡️ ${team.name}`}
                </span>
                <span style={{fontSize:"12px",color:"rgba(255,255,255,0.85)",display:"flex",gap:"2px",alignItems:"center"}}>
                  {Array.from({length:totalShips}).map((_,i) => (
                    <span key={i} style={{fontSize:"12px",opacity: i < shipsLeft ? 1 : 0.25}}>🚢</span>
                  ))}
                </span>
              </div>

              <div style={{display:"flex",justifyContent:"center"}}>
                <div>
                  {/* Column headers */}
                  <div style={{display:"flex",marginLeft:"22px",marginBottom:"3px",gap:"2px"}}>
                    {COLS.map(col=>(
                      <div key={col.letter} style={{
                        width:"34px",textAlign:"center",fontWeight:"900",fontSize:"11px",
                        color:"white", background:colColor(col.letter),
                        borderRadius:"4px", padding:"2px 0"
                      }}>{col.letter}</div>
                    ))}
                  </div>
                  {ROWS.map(r=>(
                    <div key={r} style={{display:"flex",alignItems:"center",gap:"2px",marginBottom:"2px"}}>
                      <div style={{width:"18px",textAlign:"center",fontWeight:"800",fontSize:"11px",color:team.color.dark,flexShrink:0}}>{r}</div>
                      {COLS.map(col=>{
                        const coord     = col.letter + r;
                        const isHit     = teamHits.includes(coord);
                        const isMiss    = teamMisses.includes(coord);
                        const isPending = pendingCoord === coord && isTarget;
                        const canFire   = phase==="pick-coord" && isTarget && !isHit && !isMiss && !eliminated && !isActive;
                        return (
                          <button key={coord} onClick={()=>canFire && pickCoord(coord)} style={{
                            width:"34px", height:"34px",
                            border:"none", borderRadius:"6px", fontSize:"14px",
                            cursor: canFire ? "pointer" : "default",
                            transition:"all 0.15s",
                            transform: isPending ? "scale(1.18)" : canFire ? "scale(1.02)" : "scale(1)",
                            background: isHit
                              ? "linear-gradient(135deg,#EF4444,#B91C1C)"
                              : isMiss
                              ? "#CBD5E1"
                              : isPending
                              ? "linear-gradient(135deg,#FCD34D,#F59E0B)"
                              : canFire
                              ? `linear-gradient(135deg,${colColor(col.letter)}44,${colColor(col.letter)}22)`
                              : "linear-gradient(135deg,#DBEAFE,#E0E7FF)",
                            boxShadow: isPending ? `0 0 12px #FCD34D` : isHit ? "0 2px 6px #EF444460" : "none",
                            outline: canFire ? `2px solid ${colColor(col.letter)}80` : "none",
                          }}>
                            {isHit ? "💥" : isMiss ? "·" : isPending ? "🎯" : canFire ? "🌊" : "🌊"}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Answer phase */}
      {phase==="answer" && currentQ && (
        <div style={{marginTop:"4px"}}>
          {/* Coordinate + type badge */}
          <div style={{textAlign:"center",marginBottom:"10px",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",flexWrap:"wrap"}}>
            <div style={{
              background:colColor(pendingCoord[0]), color:"white",
              borderRadius:"10px",padding:"5px 14px",fontWeight:"900",fontSize:"14px"
            }}>
              {pendingCoord} — {COLS.find(c=>c.letter===pendingCoord[0])?.emoji} {COLS.find(c=>c.letter===pendingCoord[0])?.label}
            </div>
            <span style={{fontWeight:"700",color:"#374151",fontSize:"14px"}}>
              Answer correctly to fire at <strong>{teams.find(t=>t.id===targetTeamId)?.name}</strong>!
            </span>
          </div>

          {isSpeakingTask ? (
            /* Speaking task — no reveal button, teacher judges directly */
            <div style={{background:"#EEF2FF",border:"3px solid #6366F1",borderRadius:"16px",padding:"20px",textAlign:"center"}}>
              <div style={{fontSize:"12px",fontWeight:"700",color:"#4338CA",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.05em"}}>
                🗣️ Speaking Challenge
              </div>
              <div style={{fontSize:"clamp(15px,2.5vw,19px)",fontWeight:"800",color:"#1E1B4B",lineHeight:1.5,marginBottom:"16px"}}>
                {currentQ.question}
              </div>
              <p style={{color:"#6B7280",fontSize:"13px",marginBottom:"14px"}}>Team speaks their answer — teacher judges.</p>
              <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
                <button onClick={()=>resolve(true)} style={{background:"#22C55E",color:"white",border:"none",borderRadius:"12px",padding:"12px 24px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>✅ Good! FIRE!</button>
                <button onClick={()=>resolve(false)} style={{background:"#EF4444",color:"white",border:"none",borderRadius:"12px",padding:"12px 24px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>❌ Not quite — Miss</button>
              </div>
            </div>
          ) : (
            <>
              <QuestionCard question={currentQ} showAnswer={showAns} onReveal={()=>setShowAns(true)}/>
              {(showAns || currentQ?.type === "speaking task") && (
                <div style={{display:"flex",gap:"10px",justifyContent:"center",marginTop:"12px"}}>
                  <button onClick={()=>resolve(true)} style={{background:"#22C55E",color:"white",border:"none",borderRadius:"12px",padding:"12px 24px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>✅ Correct! FIRE!</button>
                  <button onClick={()=>resolve(false)} style={{background:"#EF4444",color:"white",border:"none",borderRadius:"12px",padding:"12px 24px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>❌ Wrong — Miss</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CardShuffleGame({ questions, teams, onUpdateScore, onEnd }) {
  const TURN_SECONDS = 25;
  const NUM_CARDS = 4;
  const CARD_W = 120;
  const CARD_H = 160;
  const GAP = 14;
  const ROW_W = NUM_CARDS * CARD_W + (NUM_CARDS - 1) * GAP;
  const slotX = (i) => i * (CARD_W + GAP);

  // Build a round: 4 cards each with a DIFFERENT task, one is the star
  const buildRound = useCallback((roundIdx) => {
    const start = roundIdx * NUM_CARDS;
    const slice = questions.slice(start, start + NUM_CARDS);
    // Fallback: cycle if not enough questions
    const pool = Array.from({length: NUM_CARDS}, (_, i) => questions[(start + i) % questions.length]);
    const starIdx = Math.floor(Math.random() * NUM_CARDS);
    return pool.map((q, i) => ({ cid: i, isStar: i === starIdx, task: q.task || q.question || q.word || String(q) }));
  }, [questions]);

  const [roundCount, setRoundCount] = useState(0);
  const [cards, setCards] = useState(() => buildRound(0));
  const [cardSlots, setCardSlots] = useState([0, 1, 2, 3]);
  const [cardX, setCardX] = useState(() => [0, 1, 2, 3].map(slotX));
  const [phase, setPhase] = useState("intro"); // intro | preview | shuffling | picking | answering | reveal
  const [teamPicks, setTeamPicks] = useState({});
  const [answeringTeamIdx, setAnsweringTeamIdx] = useState(0);
  const [showAns, setShowAns] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const slotsRef = useRef([0, 1, 2, 3]);

  const slotToCard = (slot) => slotsRef.current.findIndex(s => s === slot);

  // Animate a single swap — moves cards visibly across screen
  const animateSwap = (cA, cB, duration) => new Promise(resolve => {
    const xA = slotX(slotsRef.current[cB]);
    const xB = slotX(slotsRef.current[cA]);
    setTransitioning(true);
    setCardX(prev => { const next=[...prev]; next[cA]=xA; next[cB]=xB; return next; });
    setTimeout(() => {
      const newSlots = [...slotsRef.current];
      [newSlots[cA], newSlots[cB]] = [newSlots[cB], newSlots[cA]];
      slotsRef.current = newSlots;
      setCardSlots([...newSlots]);
      setTransitioning(false);
      resolve();
    }, duration);
  });

  // Deterministic shuffle sequence — predictable swaps so attentive students CAN track
  // Pattern: rotate pairs slowly, then increase speed, short pause between early swaps
  // All durations scaled to 0.75× speed (×1.333 vs previous values)
  const runShuffle = async () => {
    setPhase("shuffling");
    slotsRef.current = [0, 1, 2, 3];
    setCardSlots([0, 1, 2, 3]);
    setCardX([0, 1, 2, 3].map(slotX));

    // Short pause before first movement so students can lock eyes on the star
    await new Promise(r => setTimeout(r, 600));

    // Build a swap sequence: pairs cycle in a pattern, not random chaos
    // Phases: slow trackable (667ms), medium (400ms), fast (187ms), blur (107ms)
    const swapSequence = [
      [0,3],[1,2],[0,2],[1,3],          // slow — 667ms each, clearly trackable
      [0,1],[2,3],[0,3],[1,2],          // medium — 400ms
      [0,2],[1,3],[0,1],[2,3],[0,3],    // fast — 187ms
      [1,2],[0,2],[1,3],[0,1],[2,3],[0,3],[1,2], // blur — 107ms
    ];
    const durations = [
      667,667,667,667,
      400,400,400,400,
      187,187,187,187,187,
      107,107,107,107,107,107,107,
    ];

    for (let i = 0; i < swapSequence.length; i++) {
      const [cA, cB] = swapSequence[i];
      await animateSwap(cA, cB, durations[i]);
      // Pause after slow swaps so eyes can follow
      if (durations[i] >= 500) await new Promise(r => setTimeout(r, 107));
    }

    setPhase("picking");
    setAnsweringTeamIdx(0);
  };

  const advanceAnsweringTeam = useCallback(() => {
    const nextIdx = answeringTeamIdx + 1;
    if (nextIdx >= teams.length) setPhase("reveal");
    else { setAnsweringTeamIdx(nextIdx); setShowAns(false); }
  }, [answeringTeamIdx, teams.length]);

  const { timeLeft, stop, reset: resetTimer } = useTurnTimer(
    TURN_SECONDS, phase === "picking", () => advanceAnsweringTeam(), answeringTeamIdx
  );

  const pickSlot = (slot) => {
    const currentTeam = teams[answeringTeamIdx];
    if (phase !== "picking" || teamPicks[currentTeam.id]) return;
    const cardIdx = slotToCard(slot);
    stop();
    setTeamPicks(p => ({ ...p, [currentTeam.id]: { cardIdx, slot, correct: false } }));
    setPhase("answering");
  };

  const resolveAnswer = (correct) => {
    const currentTeam = teams[answeringTeamIdx];
    setTeamPicks(p => ({ ...p, [currentTeam.id]: { ...p[currentTeam.id], correct } }));
    setShowAns(false);
    const nextIdx = answeringTeamIdx + 1;
    if (nextIdx >= teams.length) setPhase("reveal");
    else { setAnsweringTeamIdx(nextIdx); setPhase("picking"); resetTimer(); }
  };

  // Score on reveal
  const hasScored = useRef(false);
  useEffect(() => {
    if (phase !== "reveal" || hasScored.current) return;
    hasScored.current = true;
    teams.forEach(t => {
      const pick = teamPicks[t.id];
      if (!pick) return;
      if (cards[pick.cardIdx]?.isStar && pick.correct) onUpdateScore(t.id, 120);
      else if (!cards[pick.cardIdx]?.isStar && pick.correct) onUpdateScore(t.id, 30);
    });
  }, [phase]);
  useEffect(() => { if (phase === "preview") hasScored.current = false; }, [phase]);

  const nextRound = () => {
    const next = roundCount + 1;
    if (next * NUM_CARDS >= questions.length && next >= 5) { onEnd(); return; }
    const newCards = buildRound(next);
    setCards(newCards);
    slotsRef.current = [0, 1, 2, 3];
    setCardSlots([0, 1, 2, 3]);
    setCardX([0, 1, 2, 3].map(slotX));
    setTeamPicks({});
    setAnsweringTeamIdx(0);
    setShowAns(false);
    setRoundCount(next);
    setPhase("preview");
  };

  const currentTeam = teams[answeringTeamIdx];
  const myPickSlot = phase === "answering" ? teamPicks[currentTeam?.id]?.slot : undefined;
  const pickedCard = myPickSlot !== undefined ? cards[slotToCard(myPickSlot)] : null;
  const maxRounds = Math.min(5, Math.floor(questions.length / NUM_CARDS));

  if (phase === "intro") return (
        <div style={{textAlign:"center"}}>
          <div style={{background:"linear-gradient(135deg,#4338CA,#6366F1)",borderRadius:"20px",padding:"28px 24px",marginBottom:"10px",position:"relative",color:"white",maxWidth:"520px",margin:"0 auto 10px"}}>
            <div style={{fontSize:"36px",marginBottom:"10px"}}>🃏</div>
            <div style={{fontWeight:"900",fontSize:"20px",marginBottom:"10px"}}>Card Shuffle</div>
            <div style={{fontSize:"15px",lineHeight:1.7,opacity:0.95}}>
              Four cards appear — one has a <strong>⭐ star</strong>. Remember which one!<br/>
              The cards <strong>shuffle fast</strong> — try to track the star card.<br/>
              Each team picks a card and gets a <strong>speaking task</strong> to complete.<br/>
              Land on the <strong>star card = 120 pts</strong>. Any other card = 30 pts.
            </div>
            <div style={{position:"absolute",bottom:"-14px",left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"14px solid transparent",borderRight:"14px solid transparent",borderTop:"14px solid #6366F1"}}/>
          </div>
          <div style={{marginTop:"24px",marginBottom:"20px",fontSize:"14px",color:"#6B7280",fontWeight:"600"}}>
            All teams pick in the same round — the star card rotates every round!
          </div>
          <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginBottom:"24px"}}>
            {teams.map(t => (<div key={t.id} style={{background:t.color.light,border:"3px solid "+t.color.bg,borderRadius:"14px",padding:"10px 18px",fontWeight:"800",fontSize:"14px",color:t.color.dark}}>{t.color.emoji} {t.name}</div>))}
          </div>
          <button onClick={() => setPhase("preview")} style={{background:"linear-gradient(135deg,#4338CA,#6366F1)",color:"white",border:"none",borderRadius:"16px",padding:"16px 48px",fontSize:"19px",fontWeight:"900",cursor:"pointer",boxShadow:"0 6px 24px rgba(99,102,241,0.4)"}}>
            🃏 Deal the Cards!
          </button>
        </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{background:"#4338CA",borderRadius:"14px",padding:"10px 16px",marginBottom:"14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
        <span style={{color:"white",fontWeight:"900",fontSize:"16px"}}>
          🃏 Round {roundCount+1}/{maxRounds || 5} —{" "}
          {phase==="preview" && "⭐ Remember which card is the star — then we shuffle!"}
          {phase==="shuffling" && "👀 Watch carefully — track the star!"}
          {phase==="picking" && `${currentTeam.name} — pick your card!`}
          {phase==="answering" && `${currentTeam.name} — complete the task!`}
          {phase==="reveal" && "🌟 Reveal time!"}
        </span>
        {phase==="picking" && <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS}/>}
      </div>

      {/* Card animation stage */}
      <div style={{position:"relative",height:`${CARD_H}px`,width:`${ROW_W}px`,margin:"0 auto",marginBottom:"16px"}}>
        {cards.map((card, cardIdx) => {
          const x = cardX[cardIdx];
          const slot = cardSlots[cardIdx];
          const isPickedSlot = myPickSlot === slot || (phase==="reveal" && teams.some(t=>teamPicks[t.id]?.slot===slot));
          const pickerTeams = phase==="reveal" ? teams.filter(t=>teamPicks[t.id]?.slot===slot) : [];
          const transitionMs = transitioning ? (phase==="shuffling"?80:140) : 350;

          return (
            <div key={card.cid} style={{
              position:"absolute", top:0, left:`${x}px`,
              width:`${CARD_W}px`, height:`${CARD_H}px`,
              transition:`left ${transitionMs}ms ease-in-out`,
              zIndex: isPickedSlot ? 2 : 1,
            }}>
              <div
                onClick={() => phase==="picking" && !transitioning && pickSlot(slot)}
                style={{
                  width:"100%", height:"100%", borderRadius:"14px",
                  background: phase==="reveal" ? (card.isStar?"#FCD34D":"#6366F1") : "#6366F1",
                  border:`3px solid ${
                    isPickedSlot&&phase!=="reveal" ? "#22C55E" :
                    phase==="reveal" ? (card.isStar?"#F59E0B":"#4338CA") : "#4338CA"
                  }`,
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  cursor: phase==="picking"&&!transitioning ? "pointer" : "default",
                  boxSizing:"border-box", padding:"10px 8px",
                  position:"relative", userSelect:"none",
                }}
              >
                {/* PREVIEW: only show star badge on the star card — no tasks yet */}
                {phase==="preview" && (
                  <>
                    {card.isStar ? (
                      <div style={{fontSize:"36px"}}>⭐</div>
                    ) : (
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"7px",opacity:0.25}}>
                        <div style={{width:"56px",height:"2px",background:"white",borderRadius:"2px"}}/>
                        <div style={{width:"40px",height:"2px",background:"white",borderRadius:"2px"}}/>
                        <div style={{width:"50px",height:"2px",background:"white",borderRadius:"2px"}}/>
                      </div>
                    )}
                  </>
                )}

                {/* SHUFFLING / PICKING: identical backs — no tells */}
                {(phase==="shuffling"||phase==="picking") && (
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"7px",opacity:0.3}}>
                    <div style={{width:"56px",height:"2px",background:"white",borderRadius:"2px"}}/>
                    <div style={{width:"40px",height:"2px",background:"white",borderRadius:"2px"}}/>
                    <div style={{width:"50px",height:"2px",background:"white",borderRadius:"2px"}}/>
                  </div>
                )}

                {/* ANSWERING: highlight picked card */}
                {phase==="answering" && (
                  <div style={{opacity:0.3,display:"flex",flexDirection:"column",alignItems:"center",gap:"7px"}}>
                    <div style={{width:"56px",height:"2px",background:"white",borderRadius:"2px"}}/>
                    <div style={{width:"40px",height:"2px",background:"white",borderRadius:"2px"}}/>
                    <div style={{width:"50px",height:"2px",background:"white",borderRadius:"2px"}}/>
                  </div>
                )}

                {/* REVEAL: show star and task */}
                {phase==="reveal" && (
                  <>
                    {card.isStar && <div style={{fontSize:"22px",marginBottom:"4px"}}>⭐</div>}
                    <div style={{fontSize:"10px",fontWeight:"800",color:"white",textAlign:"center",lineHeight:1.4,padding:"0 4px"}}>
                      {card.task}
                    </div>
                    {pickerTeams.length > 0 && (
                      <div style={{position:"absolute",top:"-10px",right:"-10px",display:"flex",flexDirection:"column",gap:"2px"}}>
                        {pickerTeams.map(t=>(
                          <div key={t.id} style={{width:"20px",height:"20px",borderRadius:"50%",background:t.color.bg,border:"2px solid white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:"900",color:"white"}}>
                            {t.name[0]}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* No task labels during preview — tasks revealed only after picking */}

              {/* Reveal result */}
              {phase==="reveal" && pickerTeams.length > 0 && (
                <div style={{marginTop:"6px"}}>
                  {pickerTeams.map(t => {
                    const pick = teamPicks[t.id];
                    const won = card.isStar && pick.correct;
                    const partial = !card.isStar && pick.correct;
                    return (
                      <div key={t.id} style={{
                        background:won?"#ECFDF5":partial?"#EFF6FF":"#FEF2F2",
                        border:`2px solid ${won?"#22C55E":partial?"#3B82F6":"#EF4444"}`,
                        borderRadius:"8px",padding:"3px 6px",marginBottom:"3px",
                        textAlign:"center",fontSize:"11px",fontWeight:"800",
                        color:won?"#14532D":partial?"#1E3A8A":"#991B1B"
                      }}>
                        {t.name}: {won?"⭐ +120":partial?"+30":"0"}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview — remember the star, then shuffle */}
      {phase==="preview" && (
        <div style={{textAlign:"center",marginTop:"20px"}}>
          <p style={{color:"#374151",fontWeight:"700",fontSize:"14px",marginBottom:"4px"}}>
            One card has a <strong>⭐ star</strong> — remember which one!
          </p>
          <p style={{color:"#6B7280",fontSize:"13px",marginBottom:"14px"}}>
            After shuffling, pick a card. Your task will be revealed only then. Star card = bonus points!
          </p>
          <button onClick={runShuffle} style={{background:"#EF4444",color:"white",border:"none",borderRadius:"14px",padding:"14px 36px",fontSize:"17px",fontWeight:"900",cursor:"pointer"}}>
            🔀 Shuffle!
          </button>
        </div>
      )}

      {/* Picking prompt */}
      {phase==="picking" && (
        <div style={{background:currentTeam.color.light,border:`3px solid ${currentTeam.color.bg}`,borderRadius:"14px",padding:"14px",textAlign:"center",marginTop:"8px"}}>
          <div style={{fontWeight:"900",fontSize:"16px",color:currentTeam.color.dark,marginBottom:"4px"}}>
            {currentTeam.name} — pick a card to get your task!
          </div>
          <div style={{fontSize:"13px",color:currentTeam.color.dark,opacity:0.75}}>
            Your task is hidden until you choose · Star card = 120 pts · Other cards = 30 pts
          </div>
        </div>
      )}

      {/* Answering — show the task on the picked card */}
      {phase==="answering" && pickedCard && (
        <div style={{marginTop:"8px"}}>
          <div style={{
            background:"#EEF2FF",border:"3px solid #6366F1",borderRadius:"16px",
            padding:"20px",textAlign:"center",marginBottom:"14px"
          }}>
            <div style={{fontSize:"12px",fontWeight:"700",color:"#4338CA",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.05em"}}>
              🗣️ {currentTeam.name}'s task {pickedCard.isStar ? "⭐" : ""}
            </div>
            <div style={{fontSize:"clamp(14px,2.5vw,18px)",fontWeight:"800",color:"#1E1B4B",lineHeight:1.5}}>
              {pickedCard.task}
            </div>
          </div>
          {!showAns ? (
            <div style={{textAlign:"center"}}>
              <p style={{color:"#6B7280",fontSize:"13px",marginBottom:"10px"}}>Team speaks or writes their answer, then teacher judges.</p>
              <button onClick={()=>{stop();setShowAns(true);}} style={{background:"#6366F1",color:"white",border:"none",borderRadius:"12px",padding:"12px 28px",fontSize:"15px",fontWeight:"700",cursor:"pointer"}}>
                ✋ Ready to judge
              </button>
            </div>
          ) : (
            <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
              <button onClick={()=>resolveAnswer(true)} style={{background:"#22C55E",color:"white",border:"none",borderRadius:"12px",padding:"12px 28px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>✅ Correct</button>
              <button onClick={()=>resolveAnswer(false)} style={{background:"#EF4444",color:"white",border:"none",borderRadius:"12px",padding:"12px 28px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>❌ Wrong</button>
            </div>
          )}
        </div>
      )}

      {/* Reveal */}
      {phase==="reveal" && (
        <div style={{textAlign:"center",marginTop:"70px"}}>
          <div style={{background:"#FEF9C3",border:"3px solid #FCD34D",borderRadius:"14px",padding:"14px",marginBottom:"14px"}}>
            <div style={{fontSize:"22px",marginBottom:"6px"}}>⭐ Star card revealed!</div>
            <div style={{fontWeight:"900",color:"#713F12",fontSize:"15px"}}>
              {teams.filter(t=>{
                const pick=teamPicks[t.id];
                return pick && cards[pick.cardIdx]?.isStar && pick.correct;
              }).map(t=>t.name).join(", ") || "Nobody"} found the star!
            </div>
          </div>
          <button onClick={nextRound} style={{background:"#6366F1",color:"white",border:"none",borderRadius:"14px",padding:"14px 32px",fontSize:"16px",fontWeight:"900",cursor:"pointer"}}>
            {roundCount+1 >= (maxRounds||5) ? "🏁 End Game" : "➡️ Next Round"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── RPG CONSTANTS ──────────────────────────────────────────────────────────────
const LEVELS = [
  { level:1, label:"Lvl 1", xpNeeded:0,   nextXp:100, mult:1.0, color:"#6B7280" },
  { level:2, label:"Lvl 2", xpNeeded:100, nextXp:250, mult:1.6, color:"#3B82F6" },
  { level:3, label:"Lvl 3", xpNeeded:250, nextXp:Infinity, mult:2.5, color:"#F59E0B" },
];
const BASE_DAMAGE = 8;     // damage = roll × BASE_DAMAGE × levelMult
const XP_PER_ROLL  = 12;   // xp gained = roll × XP_PER_ROLL
const APPLE_CHANCE = 0.08; // 8% chance
const APPLE_HEAL   = 25;
const MAX_HP       = 100;

function StatBar({ value, max, color, bg, label, icon }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{marginBottom:"4px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"2px"}}>
        <span style={{fontSize:"11px",fontWeight:"700",color:"#374151"}}>{icon} {label}</span>
        <span style={{fontSize:"11px",fontWeight:"800",color:"#374151"}}>{Math.round(value)}/{max}</span>
      </div>
      <div style={{height:"10px",background:bg,borderRadius:"5px",overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:"5px",transition:"width 0.5s ease"}}/>
      </div>
    </div>
  );
}

function DiceRoller({ rolling, result }) {
  const faces = ["⚀","⚁","⚂","⚃","⚄","⚅"];
  return (
    <div style={{textAlign:"center",padding:"12px 0"}}>
      <div style={{
        fontSize:"72px",
        display:"inline-block",
        animation: rolling ? "spin 0.15s linear infinite" : "none",
        transition:"font-size 0.2s"
      }}>
        {result ? faces[result-1] : "🎲"}
      </div>
      {result && !rolling && (
        <div style={{fontWeight:"900",fontSize:"18px",color:"#1E1B4B",marginTop:"4px"}}>
          Rolled a {result}!
        </div>
      )}
      <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function CastleGame({ questions, teams, onUpdateScore, onEnd }) {
  const TURN_SECONDS = 25;

  // Per-team RPG state
  const [rpg, setRpg] = useState(() => Object.fromEntries(
    teams.map(t => [t.id, { hp: MAX_HP, xp: 0, level: 1 }])
  ));
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [qi, setQi] = useState(0);
  const [showAns, setShowAns] = useState(false);
  // phase: "answer" | "pick-target" | "rolling" | "result"
  const [phase, setPhase] = useState("intro");
  const [diceRoll, setDiceRoll] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [lastEvent, setLastEvent] = useState(null); // { damage, xpGained, apple, targetId, levelUp }

  const activeTeam = teams[activeTeamIdx];
  const q = questions[qi];

  const getLevelInfo = (xp) => [...LEVELS].reverse().find(l => xp >= l.xpNeeded) || LEVELS[0];
  const getNextLevelInfo = (xp) => {
    const cur = getLevelInfo(xp);
    return LEVELS.find(l => l.level === cur.level + 1) || null;
  };

  const isEliminated = (teamId) => rpg[teamId]?.hp <= 0;

  const advanceTurn = useCallback(() => {
    setPhase("answer"); setShowAns(false); setDiceRoll(null); setLastEvent(null);
    setQi(i => (i + 1) % questions.length);
    let next = (activeTeamIdx + 1) % teams.length;
    let tries = 0;
    while (isEliminated(teams[next].id) && tries < teams.length) { next = (next + 1) % teams.length; tries++; }
    setActiveTeamIdx(next);
  }, [activeTeamIdx, questions.length, teams, rpg]);

  const { timeLeft, stop } = useTurnTimer(TURN_SECONDS, phase === "pick-target", () => advanceTurn(), activeTeamIdx);


  if (phase === "intro") return (
    <div style={{textAlign:"center"}}>
      <div style={{background:"linear-gradient(135deg,#064E3B,#059669)",borderRadius:"20px",padding:"28px 24px",marginBottom:"10px",position:"relative",color:"white",maxWidth:"520px",margin:"0 auto 10px"}}>
        <div style={{fontSize:"36px",marginBottom:"10px"}}>🏰</div>
        <div style={{fontWeight:"900",fontSize:"20px",marginBottom:"10px"}}>Castle Defense</div>
        <div style={{fontSize:"15px",lineHeight:1.7,opacity:0.95}}>
          Answer a question correctly to <strong>attack an enemy castle</strong>!<br/>
          Roll the dice — the higher you roll, the more <strong>damage</strong> you deal.<br/>
          Gain <strong>XP</strong> from each roll to level up and <strong>multiply your damage</strong>.<br/>
          Watch out for <strong>🍎 healing apples</strong> that restore HP!<br/>
          The last castle standing wins!
        </div>
        <div style={{position:"absolute",bottom:"-14px",left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"14px solid transparent",borderRight:"14px solid transparent",borderTop:"14px solid #059669"}}/>
      </div>
      <div style={{marginTop:"24px",marginBottom:"20px",fontSize:"14px",color:"#6B7280",fontWeight:"600"}}>
        Each castle starts with 100 HP. Level 1 → 2 → 3 multiplies your dice damage!
      </div>
      <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginBottom:"24px"}}>
        {teams.map(t => (<div key={t.id} style={{background:t.color.light,border:"3px solid "+t.color.bg,borderRadius:"14px",padding:"10px 18px",fontWeight:"800",fontSize:"14px",color:t.color.dark}}>{t.color.emoji} {t.name}</div>))}
      </div>
      <button onClick={() => setPhase("answer")} style={{background:"linear-gradient(135deg,#064E3B,#059669)",color:"white",border:"none",borderRadius:"16px",padding:"16px 48px",fontSize:"19px",fontWeight:"900",cursor:"pointer",boxShadow:"0 6px 24px rgba(5,150,105,0.4)"}}>
        🏰 Prepare for Battle!
      </button>
    </div>
  );

  const handleReveal = () => { setShowAns(true); };

  const handleCorrect = () => {
    setShowAns(false);
    setPhase("pick-target");
  };

  const rollDice = (targetId) => {
    setPhase("rolling");
    setRolling(true);
    let ticks = 0;
    const totalTicks = 14;
    const tick = () => {
      setDiceRoll(Math.floor(Math.random() * 6) + 1);
      ticks++;
      if (ticks < totalTicks) {
        setTimeout(tick, 60 + ticks * 18);
      } else {
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceRoll(finalRoll);
        setRolling(false);
        applyRoll(finalRoll, targetId);
      }
    };
    setTimeout(tick, 80);
  };

  const applyRoll = (roll, targetId) => {
    const attackerRpg = rpg[activeTeam.id];
    const lvlInfo = getLevelInfo(attackerRpg.xp);
    const damage = Math.round(roll * BASE_DAMAGE * lvlInfo.mult);
    const xpGained = roll * XP_PER_ROLL;
    const gotApple = Math.random() < APPLE_CHANCE;
    const healAmount = gotApple ? APPLE_HEAL : 0;

    setRpg(prev => {
      const next = { ...prev };
      // Apply damage to target
      const newTargetHp = Math.max(0, next[targetId].hp - damage);
      next[targetId] = { ...next[targetId], hp: newTargetHp };
      // Apply XP + possible level up to attacker
      const newXp = next[activeTeam.id].xp + xpGained;
      const newLevel = getLevelInfo(newXp).level;
      // Apply apple heal to attacker
      const newHp = Math.min(MAX_HP, next[activeTeam.id].hp + healAmount);
      next[activeTeam.id] = { ...next[activeTeam.id], xp: newXp, level: newLevel, hp: newHp };
      return next;
    });

    const oldLevel = getLevelInfo(rpg[activeTeam.id].xp).level;
    const newLevel = getLevelInfo(rpg[activeTeam.id].xp + xpGained).level;
    const leveledUp = newLevel > oldLevel;

    onUpdateScore(activeTeam.id, roll * 15);

    setLastEvent({ damage, xpGained, apple: gotApple, targetId, leveledUp, roll });
    setPhase("result");

    // Check if target eliminated
    const newTargetHp = Math.max(0, rpg[targetId].hp - damage);
    const aliveAfter = teams.filter(t => {
      if (t.id === targetId) return newTargetHp > 0;
      return rpg[t.id].hp > 0;
    });
    if (aliveAfter.length <= 1) {
      setTimeout(() => onEnd(), 2200);
    }
  };

  const aliveEnemies = teams.filter(t => t.id !== activeTeam.id && !isEliminated(t.id));

  return (
    <div>
      {/* Castle status bars for all teams */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"10px",marginBottom:"16px"}}>
        {teams.map(tm => {
          const r = rpg[tm.id];
          const lvl = getLevelInfo(r.xp);
          const nextLvl = getNextLevelInfo(r.xp);
          const xpInLevel = r.xp - lvl.xpNeeded;
          const xpForNext = nextLvl ? (nextLvl.xpNeeded - lvl.xpNeeded) : 1;
          const dead = r.hp <= 0;
          return (
            <div key={tm.id} style={{
              background: dead ? "#F3F4F6" : tm.color.light,
              border:`3px solid ${dead?"#D1D5DB":tm.color.bg}`,
              borderRadius:"16px",padding:"12px",
              opacity: dead ? 0.5 : 1,
              transition:"all 0.4s"
            }}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
                <span style={{fontWeight:"900",fontSize:"14px",color:dead?"#9CA3AF":tm.color.dark}}>
                  {dead ? "💀" : "🏰"} {tm.name}
                </span>
                <span style={{
                  fontSize:"11px",fontWeight:"800",padding:"2px 8px",borderRadius:"20px",
                  background:lvl.color,color:"white"
                }}>{lvl.label} {lvl.level===3?"★":""}</span>
              </div>
              <StatBar value={r.hp} max={MAX_HP} color="#EF4444" bg="#FEE2E2" label="HP" icon="❤️"/>
              {!dead && nextLvl && (
                <StatBar value={xpInLevel} max={xpForNext} color={lvl.color} bg="#E5E7EB" label="XP" icon="⚡"/>
              )}
              {!dead && !nextLvl && (
                <div style={{fontSize:"11px",fontWeight:"800",color:"#F59E0B",textAlign:"center",marginTop:"4px"}}>⚡ MAX LEVEL ★</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Turn header */}
      <div style={{background:activeTeam.color.bg,borderRadius:"14px",padding:"10px 16px",marginBottom:"12px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
        <span style={{color:"white",fontWeight:"900",fontSize:"16px"}}>
          🏰 {activeTeam.name} —{" "}
          {phase==="answer" && "Answer to attack!"}
          {phase==="pick-target" && "Choose who to attack!"}
          {phase==="rolling" && "Rolling the dice..."}
          {phase==="result" && "Attack resolved!"}
        </span>
        {phase==="pick-target" && <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS}/>}
      </div>

      {/* Answer phase */}
      {phase==="answer" && (
        <>
          <QuestionCard question={q} showAnswer={showAns} onReveal={handleReveal}/>
          {(showAns || q?.type === "speaking task") && (
            <div style={{display:"flex",gap:"10px",justifyContent:"center",marginTop:"12px"}}>
              <button onClick={handleCorrect} style={{background:"#22C55E",color:"white",border:"none",borderRadius:"12px",padding:"12px 24px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>✅ Correct — Attack!</button>
              <button onClick={advanceTurn} style={{background:"#EF4444",color:"white",border:"none",borderRadius:"12px",padding:"12px 24px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>❌ Wrong</button>
            </div>
          )}
        </>
      )}

      {/* Pick target */}
      {phase==="pick-target" && (
        <div style={{textAlign:"center"}}>
          <p style={{fontWeight:"700",color:"#374151",marginBottom:"12px"}}>Pick a castle to attack:</p>
          <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap"}}>
            {aliveEnemies.map(tm => (
              <button key={tm.id} onClick={()=>rollDice(tm.id)} style={{
                background:tm.color.bg,color:"white",border:"none",
                borderRadius:"12px",padding:"12px 22px",fontWeight:"800",fontSize:"15px",cursor:"pointer"
              }}>
                ⚔️ {tm.name} ({Math.round(rpg[tm.id].hp)} HP)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dice roll animation */}
      {(phase==="rolling"||phase==="result") && (
        <DiceRoller rolling={rolling} result={diceRoll}/>
      )}

      {/* Result summary */}
      {phase==="result" && lastEvent && !rolling && (
        <div style={{marginTop:"4px"}}>
          {/* Attack result */}
          <div style={{background:"#FEF2F2",border:"2px solid #EF4444",borderRadius:"14px",padding:"14px",textAlign:"center",marginBottom:"10px"}}>
            <div style={{fontWeight:"900",fontSize:"17px",color:"#991B1B"}}>
              ⚔️ {activeTeam.name} dealt <span style={{fontSize:"22px"}}>{lastEvent.damage}</span> damage to {teams.find(t=>t.id===lastEvent.targetId)?.name}!
            </div>
            <div style={{color:"#6B7280",fontSize:"13px",marginTop:"4px"}}>
              Dice roll: {diceRoll} × {BASE_DAMAGE} × {getLevelInfo(rpg[activeTeam.id].xp - lastEvent.xpGained).mult}x = {lastEvent.damage} dmg
            </div>
          </div>

          {/* XP gained */}
          <div style={{background:"#EFF6FF",border:"2px solid #3B82F6",borderRadius:"12px",padding:"10px 14px",textAlign:"center",marginBottom:lastEvent.apple||lastEvent.leveledUp?"10px":"0"}}>
            <span style={{fontWeight:"800",color:"#1E40AF"}}>⚡ +{lastEvent.xpGained} XP gained</span>
          </div>

          {/* Level up! */}
          {lastEvent.leveledUp && (
            <div style={{background:"#FEF9C3",border:"2px solid #F59E0B",borderRadius:"12px",padding:"10px 14px",textAlign:"center",marginBottom:lastEvent.apple?"10px":"0"}}>
              <span style={{fontWeight:"900",fontSize:"17px",color:"#92400E"}}>🎉 LEVEL UP! {activeTeam.name} is now {getLevelInfo(rpg[activeTeam.id].xp).label}!</span>
            </div>
          )}

          {/* Apple! */}
          {lastEvent.apple && (
            <div style={{background:"#ECFDF5",border:"2px solid #22C55E",borderRadius:"12px",padding:"10px 14px",textAlign:"center",marginBottom:"10px"}}>
              <span style={{fontWeight:"900",color:"#14532D"}}>🍎 Lucky apple! {activeTeam.name} restored {APPLE_HEAL} HP!</span>
            </div>
          )}

          <div style={{textAlign:"center",marginTop:"12px"}}>
            <button onClick={advanceTurn} style={{background:"#6366F1",color:"white",border:"none",borderRadius:"12px",padding:"12px 28px",fontSize:"16px",fontWeight:"800",cursor:"pointer"}}>
              ➡️ Next Turn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── KING OF THE HILL CONSTANTS ─────────────────────────────────────────────────
const HILL_ZONES = [
  { id:"North",  icon:"⬆️", pts:3 },
  { id:"South",  icon:"⬇️", pts:3 },
  { id:"East",   icon:"➡️", pts:2 },
  { id:"West",   icon:"⬅️", pts:2 },
  { id:"Center", icon:"⭐", pts:5 },
];
const TOTAL_ROUNDS = 4;

function KingOfHillGame({ questions, teams, onUpdateScore, onEnd }) {
  const TURN_SECONDS = 20;

  const [owners, setOwners] = useState({});
  const [roundPoints, setRoundPoints] = useState(() => Object.fromEntries(teams.map(t=>[t.id,0])));
  const [round, setRound] = useState(1);
  // turnOrder: array of team indices in play order for this round
  const [turnOrder, setTurnOrder] = useState(() => teams.map((_,i)=>i));
  const [activeTeamIdx, setActiveTeamIdx] = useState(0); // index into turnOrder
  const [qi, setQi] = useState(0);

  // phase: "rolling" | "pick" | "answer" | "contested-answer" | "contested-roll" | "round-end"
  const [phase, setPhase] = useState("intro");
  const [chosenZone, setChosenZone] = useState(null);
  const [showAns, setShowAns] = useState(false);
  const [contest, setContest] = useState(null);
  const [roundSummary, setRoundSummary] = useState(null);

  // Rolling phase state: diceValues[teamIdx], rolling bool, finalOrder
  const [diceValues, setDiceValues] = useState(() => teams.map(()=>null));
  const [rollDone, setRollDone] = useState(false);
  const [finalOrder, setFinalOrder] = useState(null); // sorted team indices for display

  // Dice animation helper (shared)
  const rollDiceAnimated = (onResult) => {
    let ticks = 0;
    const totalTicks = 12;
    const tick = () => {
      ticks++;
      if (ticks < totalTicks) setTimeout(tick, 60 + ticks * 15);
      else onResult(Math.floor(Math.random() * 6) + 1);
    };
    setTimeout(tick, 60);
  };

  // ── ROUND ROLL ──────────────────────────────────────────────────────────────
  const runRoundRoll = useCallback((teamIndicesToRoll, existingRolls) => {
    // rolls[teamIdx] = number
    const rolls = { ...existingRolls };
    let settled = 0;

    // Reset dice display for teams being rolled
    setDiceValues(prev => {
      const next = [...prev];
      teamIndicesToRoll.forEach(i => { next[i] = null; });
      return next;
    });
    setRollDone(false);

    const TICKS = 8; // fast — ~700ms total
    let tick = 0;
    const intervals = teamIndicesToRoll.map(teamIdx => {
      return setInterval(() => {
        setDiceValues(prev => {
          const next = [...prev];
          next[teamIdx] = Math.floor(Math.random() * 6) + 1;
          return next;
        });
        tick++;
      }, 80);
    });

    setTimeout(() => {
      intervals.forEach(iv => clearInterval(iv));
      // Assign final values
      const finalVals = {};
      teamIndicesToRoll.forEach(i => {
        finalVals[i] = Math.floor(Math.random() * 6) + 1;
        rolls[i] = finalVals[i];
      });
      setDiceValues(prev => {
        const next = [...prev];
        Object.entries(finalVals).forEach(([i, v]) => { next[Number(i)] = v; });
        return next;
      });

      // Check for ties among the rolled teams
      const valueGroups = {};
      teamIndicesToRoll.forEach(i => {
        const v = rolls[i];
        if (!valueGroups[v]) valueGroups[v] = [];
        valueGroups[v].push(i);
      });
      const tiedGroups = Object.values(valueGroups).filter(g => g.length > 1);

      if (tiedGroups.length > 0) {
        // Re-roll tied teams after a short pause
        setTimeout(() => {
          tiedGroups.forEach(group => runRoundRoll(group, rolls));
        }, 900);
      } else {
        // All resolved — build final order (highest roll first = goes last, for strategy)
        // Actually: highest roll → picks FIRST (best position)
        const allTeamIndices = teams.map((_,i)=>i);
        // Merge rolls from previous re-rolls too
        const allRolls = { ...existingRolls, ...rolls };
        const ordered = [...allTeamIndices].sort((a,b) => (allRolls[b]||0) - (allRolls[a]||0));
        setTurnOrder(ordered);
        setFinalOrder(ordered.map(i => ({ teamIdx: i, roll: allRolls[i] })));
        setRollDone(true);
      }
    }, TICKS * 80 + 100);
  }, [teams]);

  // Kick off rolling on mount and each new round
  useEffect(() => {
    if (phase === "rolling") {
      const allIdx = teams.map((_,i)=>i);
      setDiceValues(teams.map(()=>null));
      setRollDone(false);
      setFinalOrder(null);
      setTimeout(() => runRoundRoll(allIdx, {}), 300);
    }
  }, [round, phase]);

  const activeTeamRealIdx = turnOrder[activeTeamIdx];
  const activeTeam = teams[activeTeamRealIdx];
  const q = questions[qi % questions.length];

  // ── TIMER ──
  const { timeLeft, stop } = useTurnTimer(TURN_SECONDS, phase === "pick", () => nextTeamTurn(false, owners), activeTeamIdx);

  // ── ADVANCE TURN ──
  const nextTeamTurn = useCallback((scored, ownersOverride) => {
    const nextIdx = (activeTeamIdx + 1) % teams.length;
    if (nextIdx === 0) {
      doRoundPayout(ownersOverride);
    } else {
      setActiveTeamIdx(nextIdx);
      setPhase("pick");
      setChosenZone(null);
      setShowAns(false);
      setContest(null);
      setQi(i => i + 1);
    }
  }, [activeTeamIdx, teams.length, owners, round]);

  // ── ROUND-END PAYOUT ──
  const doRoundPayout = useCallback((ownersOverride) => {
    const effectiveOwners = ownersOverride || owners;
    const summary = teams.map(t => {
      const owned = HILL_ZONES.filter(z => effectiveOwners[z.id] === t.id);
      const pts = owned.reduce((sum, z) => sum + z.pts, 0);
      return { teamId: t.id, zonesOwned: owned, ptsEarned: pts };
    });
    summary.forEach(s => {
      if (s.ptsEarned > 0) onUpdateScore(s.teamId, s.ptsEarned * 10);
    });
    setRoundPoints(prev => {
      const next = {...prev};
      summary.forEach(s => { next[s.teamId] = (next[s.teamId]||0) + s.ptsEarned; });
      return next;
    });
    setRoundSummary(summary);
    setPhase("round-end");
  }, [owners, teams, onUpdateScore]);

  const startNextRound = () => {
    if (round >= TOTAL_ROUNDS) { onEnd(); return; }
    setRound(r => r + 1);
    setActiveTeamIdx(0);
    setChosenZone(null);
    setShowAns(false);
    setContest(null);
    setRoundSummary(null);
    setQi(i => i + 1);
    setPhase("rolling"); // triggers useEffect to run the roll
  };

  // ── PICK ZONE ──
  const pickZone = (zoneId) => {
    if (phase !== "pick") return;
    stop();
    setChosenZone(zoneId);
    const currentOwner = owners[zoneId];
    if (currentOwner !== undefined && currentOwner !== activeTeam.id) {
      // Zone owned by enemy — contested!
      setContest({
        attackerId: activeTeam.id,
        defenderId: currentOwner,
        zoneId,
        attackerAnswered: false,
        defenderAnswered: false,
        attackerCorrect: false,
        defenderCorrect: false,
        attackerRoll: null,
        defenderRoll: null,
        step: "attacker-answer", // attacker answers first, then defender
      });
      setPhase("contested-answer");
    } else {
      setPhase("answer");
    }
  };

  // ── UNCONTESTED ANSWER ──
  const handleReveal = () => { stop(); setShowAns(true); };

  const resolveUncontested = (correct) => {
    let newOwners = owners;
    if (correct) {
      newOwners = {...owners, [chosenZone]: activeTeam.id};
      setOwners(newOwners);
    }
    nextTeamTurn(correct, newOwners);
  };

  // ── CONTESTED: attacker answers ──
  const resolveContestAttacker = (correct) => {
    setContest(c => ({...c, attackerAnswered: true, attackerCorrect: correct, step: "defender-answer"}));
    setShowAns(false);
    setQi(i => i + 1);
  };

  // ── CONTESTED: defender answers ──
  const resolveContestDefender = (correct) => {
    const updated = {...contest, defenderAnswered: true, defenderCorrect: correct};
    setContest(updated);
    // Decide what happens
    const aBoth = updated.attackerCorrect && updated.defenderCorrect;
    const neither = !updated.attackerCorrect && !updated.defenderCorrect;
    const attackerOnly = updated.attackerCorrect && !updated.defenderCorrect;
    const defenderOnly = !updated.attackerCorrect && updated.defenderCorrect;

    if (attackerOnly) {
      // Attacker wins outright
      setOwners(o => ({...o, [contest.zoneId]: contest.attackerId}));
      setContest({...updated, step:"result", winner: contest.attackerId, reason:"attacker-only"});
      setPhase("contested-roll");
    } else if (defenderOnly) {
      // Defender keeps it, bonus points
      onUpdateScore(contest.defenderId, 25);
      setContest({...updated, step:"result", winner: contest.defenderId, reason:"defender-only"});
      setPhase("contested-roll");
    } else if (neither) {
      // Zone stays, no change
      setContest({...updated, step:"result", winner: null, reason:"neither"});
      setPhase("contested-roll");
    } else if (aBoth) {
      // Both correct → dice roll!
      setContest({...updated, step:"rolling"});
      setPhase("contested-roll");
      doContestRoll({...updated});
    }
    setShowAns(false);
  };

  const doContestRoll = (c) => {
    let aRoll, dRoll;
    rollDiceAnimated(r => {
      aRoll = r;
      setContest(prev => ({...prev, attackerRoll: r}));
      rollDiceAnimated(r2 => {
        dRoll = r2;
        // Re-roll tie
        if (r === r2) {
          doContestRoll(c);
          return;
        }
        const winner = r > r2 ? c.attackerId : c.defenderId;
        setOwners(o => ({...o, [c.zoneId]: winner}));
        if (winner === c.attackerId) onUpdateScore(c.attackerId, 10);
        setContest(prev => ({...prev, defenderRoll: r2, step:"result", winner, reason:"dice"}));
      });
    });
  };

  const finishContest = () => {
    nextTeamTurn(false, owners);
  };


  if (phase === "intro") return (
    <div style={{textAlign:"center"}}>
      <div style={{background:"linear-gradient(135deg,#831843,#DB2777)",borderRadius:"20px",padding:"28px 24px",marginBottom:"10px",position:"relative",color:"white",maxWidth:"520px",margin:"0 auto 10px"}}>
        <div style={{fontSize:"36px",marginBottom:"10px"}}>👑</div>
        <div style={{fontWeight:"900",fontSize:"20px",marginBottom:"10px"}}>King of the Hill</div>
        <div style={{fontSize:"15px",lineHeight:1.7,opacity:0.95}}>
          A map of <strong>5 zones</strong> is up for grabs — each worth different points.<br/>
          Roll dice to set the <strong>turn order</strong>, then answer to <strong>claim zones</strong>.<br/>
          If two teams both answer correctly on one zone, <strong>dice decide the winner!</strong><br/>
          Score points for <strong>every zone you own</strong> at the end of each round.<br/>
          Game lasts <strong>{TOTAL_ROUNDS} rounds</strong> — highest score wins!
        </div>
        <div style={{position:"absolute",bottom:"-14px",left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"14px solid transparent",borderRight:"14px solid transparent",borderTop:"14px solid #DB2777"}}/>
      </div>
      <div style={{marginTop:"24px",marginBottom:"20px",fontSize:"14px",color:"#6B7280",fontWeight:"600"}}>
        The Center zone scores the most — expect fierce competition for it every round!
      </div>
      <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginBottom:"24px"}}>
        {teams.map(t => (<div key={t.id} style={{background:t.color.light,border:"3px solid "+t.color.bg,borderRadius:"14px",padding:"10px 18px",fontWeight:"800",fontSize:"14px",color:t.color.dark}}>{t.color.emoji} {t.name}</div>))}
      </div>
      <button onClick={() => setPhase("rolling")} style={{background:"linear-gradient(135deg,#831843,#DB2777)",color:"white",border:"none",borderRadius:"16px",padding:"16px 48px",fontSize:"19px",fontWeight:"900",cursor:"pointer",boxShadow:"0 6px 24px rgba(219,39,119,0.4)"}}>
        👑 Roll for Turn Order!
      </button>
    </div>
  );

  // ── ZONE MAP ──
  const ZoneGrid = () => (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"14px",maxWidth:"380px",margin:"0 auto 14px"}}>
      {/* Row 1: blank, North, blank */}
      <div/>
      {renderZone("North")}
      <div/>
      {/* Row 2: West, Center, East */}
      {renderZone("West")}
      {renderZone("Center")}
      {renderZone("East")}
      {/* Row 3: blank, South, blank */}
      <div/>
      {renderZone("South")}
      <div/>
    </div>
  );

  const renderZone = (zId) => {
    const z = HILL_ZONES.find(z=>z.id===zId);
    const ownerId = owners[zId];
    const owner = ownerId !== undefined ? teams.find(t=>t.id===ownerId) : null;
    const isChosen = chosenZone === zId;
    const isContested = contest?.zoneId === zId;
    const canPick = phase === "pick";
    return (
      <div key={zId} onClick={()=>canPick&&pickZone(zId)} style={{
        background: owner ? owner.color.light : "#F3F4F6",
        border:`3px solid ${isContested?"#EF4444":isChosen?activeTeam.color.bg:owner?owner.color.bg:"#D1D5DB"}`,
        borderRadius:"14px",padding:"10px 6px",textAlign:"center",
        cursor: canPick?"pointer":"default",
        transform: isChosen||isContested?"scale(1.06)":"scale(1)",
        transition:"all 0.2s",
        boxShadow: isContested?"0 0 14px #EF444460":isChosen?`0 0 12px ${activeTeam.color.bg}60`:"none"
      }}>
        <div style={{fontSize:"18px"}}>{z.icon}</div>
        <div style={{fontWeight:"900",fontSize:"13px",color:owner?owner.color.dark:"#374151"}}>{zId}</div>
        <div style={{fontWeight:"800",fontSize:"12px",color:"#F59E0B"}}>+{z.pts}/rnd</div>
        <div style={{fontSize:"11px",color:owner?owner.color.dark:"#9CA3AF",marginTop:"2px"}}>
          {owner ? owner.name : "Free"}
        </div>
      </div>
    );
  };

  // ── RENDER ──
  const DICE_FACES = ["⚀","⚁","⚂","⚃","⚄","⚅"];

  return (
    <div>

      {/* ── ROLLING PHASE ── */}
      {phase === "rolling" && (
        <div style={{textAlign:"center",padding:"16px 0"}}>
          <div style={{fontWeight:"900",fontSize:"17px",color:"#1E1B4B",marginBottom:"16px"}}>
            🎲 Rolling for turn order — Round {round}!
          </div>
          <div style={{display:"flex",gap:"16px",justifyContent:"center",flexWrap:"wrap",marginBottom:"16px"}}>
            {teams.map((t,i) => (
              <div key={t.id} style={{
                background:t.color.light,border:`3px solid ${t.color.bg}`,
                borderRadius:"16px",padding:"14px 20px",minWidth:"100px",textAlign:"center"
              }}>
                <div style={{fontWeight:"800",fontSize:"13px",color:t.color.dark,marginBottom:"6px"}}>{t.name}</div>
                <div style={{fontSize:"44px",lineHeight:1,minHeight:"48px"}}>
                  {diceValues[i] != null ? DICE_FACES[diceValues[i]-1] : "🎲"}
                </div>
                {rollDone && diceValues[i] != null && (
                  <div style={{fontWeight:"900",fontSize:"13px",color:t.color.dark,marginTop:"4px"}}>{diceValues[i]}</div>
                )}
              </div>
            ))}
          </div>
          {rollDone && finalOrder && (
            <div>
              <div style={{background:"#EEF2FF",border:"2px solid #6366F1",borderRadius:"12px",padding:"12px 20px",marginBottom:"14px",display:"inline-block"}}>
                <div style={{fontWeight:"700",fontSize:"13px",color:"#4338CA",marginBottom:"6px"}}>Turn order this round:</div>
                <div style={{display:"flex",gap:"8px",justifyContent:"center",alignItems:"center",flexWrap:"wrap"}}>
                  {finalOrder.map((entry, pos) => {
                    const t = teams[entry.teamIdx];
                    return (
                      <span key={entry.teamIdx} style={{display:"flex",alignItems:"center",gap:"4px"}}>
                        <span style={{fontWeight:"900",fontSize:"13px",color:"#6B7280"}}>{pos+1}.</span>
                        <span style={{background:t.color.bg,color:"white",borderRadius:"8px",padding:"3px 10px",fontWeight:"800",fontSize:"13px"}}>{t.name}</span>
                        {pos < finalOrder.length-1 && <span style={{color:"#9CA3AF"}}>→</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <button onClick={()=>setPhase("pick")} style={{background:"#6366F1",color:"white",border:"none",borderRadius:"12px",padding:"12px 28px",fontSize:"16px",fontWeight:"800",cursor:"pointer"}}>
                  ▶️ Start Round {round}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── NORMAL GAME PHASES ── */}
      {phase !== "rolling" && (<>
      {/* Header row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px",flexWrap:"wrap",gap:"8px"}}>
        <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
          <span style={{fontWeight:"900",color:"#1E1B4B",fontSize:"15px"}}>Round {round}/{TOTAL_ROUNDS}</span>
          <span style={{fontSize:"12px",color:"#6B7280",fontWeight:"600"}}>⭐ Center = 5pts/rnd · N/S = 3pts · E/W = 2pts</span>
        </div>
        {phase==="pick" && <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS}/>}
      </div>

      {/* Zone income totals per team */}
      <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"12px",justifyContent:"center"}}>
        {teams.map(t=>(
          <div key={t.id} style={{background:t.color.light,border:`2px solid ${t.color.bg}`,borderRadius:"10px",padding:"5px 12px",textAlign:"center"}}>
            <div style={{fontWeight:"900",fontSize:"12px",color:t.color.dark}}>{t.name}</div>
            <div style={{fontWeight:"800",fontSize:"14px",color:t.color.dark}}>
              {HILL_ZONES.filter(z=>owners[z.id]===t.id).reduce((s,z)=>s+z.pts,0)} pts/rnd
            </div>
          </div>
        ))}
      </div>

      {/* Zone map */}
      <ZoneGrid/>

      {/* Turn bar */}
      {phase !== "round-end" && (
        <div style={{background:activeTeam.color.bg,borderRadius:"14px",padding:"10px 16px",marginBottom:"12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px"}}>
          <span style={{color:"white",fontWeight:"900",fontSize:"16px"}}>
            👑 {activeTeam.name} —{" "}
            {phase==="pick" && "Pick a zone to capture!"}
            {phase==="answer" && (owners[chosenZone]===activeTeam.id ? "You own this — defend it!" : `Attacking ${chosenZone}!`)}
            {phase==="contested-answer" && contest?.step==="attacker-answer" && `${activeTeam.name} answers first!`}
            {phase==="contested-answer" && contest?.step==="defender-answer" && `${teams.find(t=>t.id===contest?.defenderId)?.name} defends!`}
            {phase==="contested-roll" && contest?.step==="rolling" && "Rolling dice to decide..."}
            {phase==="contested-roll" && contest?.step==="result" && "Zone contested — result:"}
          </span>
        </div>
      )}

      {/* Uncontested answer */}
      {phase==="answer" && (
        <>
          <QuestionCard question={q} showAnswer={showAns} onReveal={handleReveal}/>
          {(showAns || q?.type === "speaking task") && (
            <div style={{display:"flex",gap:"10px",justifyContent:"center",marginTop:"12px"}}>
              <button onClick={()=>resolveUncontested(true)} style={{background:"#22C55E",color:"white",border:"none",borderRadius:"12px",padding:"12px 24px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>✅ Correct! Claim!</button>
              <button onClick={()=>resolveUncontested(false)} style={{background:"#EF4444",color:"white",border:"none",borderRadius:"12px",padding:"12px 24px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>❌ Wrong</button>
            </div>
          )}
        </>
      )}

      {/* Contested: attacker answers */}
      {phase==="contested-answer" && contest?.step==="attacker-answer" && (
        <div>
          <div style={{background:"#FEF2F2",border:"2px solid #EF4444",borderRadius:"12px",padding:"10px",textAlign:"center",marginBottom:"10px",fontWeight:"700",color:"#991B1B"}}>
            ⚔️ {teams.find(t=>t.id===contest.attackerId)?.name} is attacking <strong>{contest.zoneId}</strong> (owned by {teams.find(t=>t.id===contest.defenderId)?.name})!
          </div>
          <QuestionCard question={q} showAnswer={showAns} onReveal={()=>{stop();setShowAns(true);}}/>
          {(showAns || q?.type === "speaking task") && (
            <div style={{display:"flex",gap:"10px",justifyContent:"center",marginTop:"12px"}}>
              <button onClick={()=>resolveContestAttacker(true)} style={{background:"#22C55E",color:"white",border:"none",borderRadius:"12px",padding:"12px 24px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>✅ Attacker Correct</button>
              <button onClick={()=>resolveContestAttacker(false)} style={{background:"#EF4444",color:"white",border:"none",borderRadius:"12px",padding:"12px 24px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>❌ Attacker Wrong</button>
            </div>
          )}
        </div>
      )}

      {/* Contested: defender answers */}
      {phase==="contested-answer" && contest?.step==="defender-answer" && (
        <div>
          <div style={{background:"#EFF6FF",border:"2px solid #3B82F6",borderRadius:"12px",padding:"10px",textAlign:"center",marginBottom:"10px",fontWeight:"700",color:"#1E40AF"}}>
            🛡️ {teams.find(t=>t.id===contest.defenderId)?.name} must defend <strong>{contest.zoneId}</strong>!
          </div>
          <QuestionCard question={questions[(qi+1)%questions.length]} showAnswer={showAns} onReveal={()=>setShowAns(true)}/>
          {(showAns || questions[(qi+1)%questions.length]?.type === "speaking task") && (
            <div style={{display:"flex",gap:"10px",justifyContent:"center",marginTop:"12px"}}>
              <button onClick={()=>resolveContestDefender(true)} style={{background:"#22C55E",color:"white",border:"none",borderRadius:"12px",padding:"12px 24px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>✅ Defender Correct</button>
              <button onClick={()=>resolveContestDefender(false)} style={{background:"#EF4444",color:"white",border:"none",borderRadius:"12px",padding:"12px 24px",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>❌ Defender Wrong</button>
            </div>
          )}
        </div>
      )}

      {/* Contested roll / result */}
      {phase==="contested-roll" && (
        <div style={{textAlign:"center"}}>
          {contest?.step==="rolling" && (
            <div>
              <p style={{fontWeight:"700",color:"#374151",marginBottom:"8px"}}>Both answered correctly — dice decides! 🎲</p>
              <div style={{display:"flex",justifyContent:"center",gap:"40px"}}>
                <div>
                  <div style={{fontSize:"13px",fontWeight:"700",color:teams.find(t=>t.id===contest.attackerId)?.color.dark,marginBottom:"4px"}}>{teams.find(t=>t.id===contest.attackerId)?.name}</div>
                  <div style={{fontSize:"56px"}}>{contest.attackerRoll ? ["⚀","⚁","⚂","⚃","⚄","⚅"][contest.attackerRoll-1] : "🎲"}</div>
                </div>
                <div>
                  <div style={{fontSize:"13px",fontWeight:"700",color:teams.find(t=>t.id===contest.defenderId)?.color.dark,marginBottom:"4px"}}>{teams.find(t=>t.id===contest.defenderId)?.name}</div>
                  <div style={{fontSize:"56px"}}>{contest.defenderRoll ? ["⚀","⚁","⚂","⚃","⚄","⚅"][contest.defenderRoll-1] : "🎲"}</div>
                </div>
              </div>
            </div>
          )}
          {contest?.step==="result" && (
            <div>
              {/* Dice result if applicable */}
              {contest.reason==="dice" && (
                <div style={{display:"flex",justifyContent:"center",gap:"40px",marginBottom:"12px"}}>
                  {[{id:contest.attackerId,roll:contest.attackerRoll},{id:contest.defenderId,roll:contest.defenderRoll}].map(side=>{
                    const tm=teams.find(t=>t.id===side.id);
                    return (
                      <div key={side.id}>
                        <div style={{fontSize:"12px",fontWeight:"700",color:tm.color.dark,marginBottom:"4px"}}>{tm.name}</div>
                        <div style={{fontSize:"52px"}}>{["⚀","⚁","⚂","⚃","⚄","⚅"][side.roll-1]}</div>
                        <div style={{fontWeight:"900",fontSize:"16px",color:tm.color.dark}}>{side.roll}</div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Outcome banner */}
              <div style={{
                background: contest.winner ? teams.find(t=>t.id===contest.winner)?.color.light : "#F3F4F6",
                border:`3px solid ${contest.winner ? teams.find(t=>t.id===contest.winner)?.color.bg : "#D1D5DB"}`,
                borderRadius:"14px",padding:"14px",marginBottom:"14px"
              }}>
                {contest.reason==="attacker-only" && <div style={{fontWeight:"900",fontSize:"16px",color:teams.find(t=>t.id===contest.winner)?.color.dark}}>⚔️ {teams.find(t=>t.id===contest.winner)?.name} captured {contest.zoneId}!</div>}
                {contest.reason==="defender-only" && <div style={{fontWeight:"900",fontSize:"16px",color:teams.find(t=>t.id===contest.winner)?.color.dark}}>🛡️ {teams.find(t=>t.id===contest.winner)?.name} defended {contest.zoneId}! +25 bonus pts</div>}
                {contest.reason==="neither" && <div style={{fontWeight:"900",fontSize:"16px",color:"#374151"}}>🤝 Both failed — {contest.zoneId} stays unchanged!</div>}
                {contest.reason==="dice" && <div style={{fontWeight:"900",fontSize:"16px",color:teams.find(t=>t.id===contest.winner)?.color.dark}}>🎲 {teams.find(t=>t.id===contest.winner)?.name} wins the dice roll and takes {contest.zoneId}!</div>}
              </div>
              <button onClick={finishContest} style={{background:"#6366F1",color:"white",border:"none",borderRadius:"12px",padding:"12px 28px",fontSize:"16px",fontWeight:"800",cursor:"pointer"}}>➡️ Next Turn</button>
            </div>
          )}
        </div>
      )}

      {/* Round-end payout */}
      {phase==="round-end" && roundSummary && (
        <div>
          <div style={{background:"#FEF9C3",border:"3px solid #F59E0B",borderRadius:"16px",padding:"16px",marginBottom:"14px"}}>
            <div style={{textAlign:"center",fontWeight:"900",fontSize:"18px",color:"#92400E",marginBottom:"12px"}}>💰 End of Round {round} — Zone Income!</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {roundSummary.map(s=>{
                const tm=teams.find(t=>t.id===s.teamId);
                return (
                  <div key={s.teamId} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"white",borderRadius:"10px",padding:"8px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                      <div style={{width:"12px",height:"12px",borderRadius:"50%",background:tm.color.bg}}/>
                      <span style={{fontWeight:"800",color:tm.color.dark}}>{tm.name}</span>
                      {s.zonesOwned.length>0 && <span style={{fontSize:"12px",color:"#6B7280"}}>{s.zonesOwned.map(z=>z.icon).join(" ")}</span>}
                    </div>
                    <span style={{fontWeight:"900",fontSize:"16px",color:s.ptsEarned>0?"#15803D":"#9CA3AF"}}>
                      {s.ptsEarned>0?`+${s.ptsEarned*10} pts`:"no zones"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{textAlign:"center"}}>
            <button onClick={startNextRound} style={{background:"#6366F1",color:"white",border:"none",borderRadius:"14px",padding:"14px 36px",fontSize:"17px",fontWeight:"900",cursor:"pointer"}}>
              {round>=TOTAL_ROUNDS?"🏁 End Game":`▶️ Start Round ${round+1}`}
            </button>
          </div>
        </div>
      )}
      </>)}
    </div>
  );
}

// ─── HOT SEAT GAME ────────────────────────────────────────────────────────────
function HotSeatGame({ questions, teams, onUpdateScore, onEnd }) {
  const ROUND_SECONDS = 45;
  const [qi, setQi] = useState(0);
  const [phase, setPhase] = useState("intro"); // intro | play | roundend
  const [winner, setWinner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const timerRef = useRef(null);

  // Each team gets a DIFFERENT word from the pool
  const wordsForTeams = questions.slice(qi * teams.length, qi * teams.length + teams.length);
  const hasMore = (qi + 1) * teams.length < questions.length;

  // Start/reset timer only when a new round begins (qi changes) or play starts
  useEffect(() => {
    if (phase !== "play") return;
    setTimeLeft(ROUND_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (!roundEndedRef.current) {
            roundEndedRef.current = true;
            setPhase("roundend"); // time ran out, no winner
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qi, phase === "play"]); // eslint-disable-line

  const roundEndedRef = useRef(false);

  // Reset the guard whenever a new round starts
  useEffect(() => {
    roundEndedRef.current = false;
  }, [qi]);

  const markCorrect = (teamId) => {
    if (roundEndedRef.current) return; // already ended (timer beat the button)
    roundEndedRef.current = true;
    clearInterval(timerRef.current);
    const elapsed = ROUND_SECONDS - timeLeft;
    const pts = Math.max(20, 100 - elapsed * 2);
    onUpdateScore(teamId, Math.round(pts));
    setWinner(teamId);
    setPhase("roundend");
  };

  const nextRound = () => {
    if (!hasMore) { onEnd(); return; }
    setQi(i => i + 1);
    setWinner(null);
    setPhase("intro");
  };

  const [showLegend, setShowLegend] = useState(false);

  const timerPct = (timeLeft / ROUND_SECONDS) * 100;
  const timerColor = timeLeft > 20 ? "#22C55E" : timeLeft > 10 ? "#F59E0B" : "#EF4444";

  // All unique words in this game's pool (for the legend)
  const allWords = [...new Map(questions.map(q => [q.word, q])).values()].map(q => q.word);

  return (
    <div>
      {/* ── INTRO SCREEN ── */}
      {phase === "intro" && (
        <div style={{textAlign:"center"}}>
          {/* Big speech bubble */}
          <div style={{
            background:"linear-gradient(135deg,#7C3AED,#DB2777)",
            borderRadius:"20px", padding:"28px 24px", marginBottom:"10px",
            position:"relative", color:"white"
          }}>
            <div style={{fontSize:"32px",marginBottom:"10px"}}>🔥</div>
            <div style={{fontWeight:"900",fontSize:"20px",marginBottom:"10px"}}>Hot Seat — Round {qi + 1}</div>
            <div style={{fontSize:"15px",lineHeight:1.7,opacity:0.95,maxWidth:"480px",margin:"0 auto"}}>
              One player per team <strong>faces away from the screen.</strong><br/>
              Teammates describe their word — <strong>no spelling, no saying it directly!</strong>
            </div>
            {/* Speech bubble tail */}
            <div style={{
              position:"absolute", bottom:"-14px", left:"50%",
              transform:"translateX(-50%)",
              width:0, height:0,
              borderLeft:"14px solid transparent",
              borderRight:"14px solid transparent",
              borderTop:"14px solid #DB2777"
            }}/>
          </div>

          <div style={{marginTop:"24px",marginBottom:"16px",fontSize:"14px",color:"#6B7280",fontWeight:"600"}}>
            📋 Each team chooses who sits in the hot seat — they face away now!
          </div>

          {/* Word legend toggle */}
          <div style={{marginBottom:"20px"}}>
            <button
              onClick={() => setShowLegend(v => !v)}
              style={{
                background: showLegend ? "#1E1B4B" : "white",
                color: showLegend ? "white" : "#1E1B4B",
                border: "2px solid #1E1B4B",
                borderRadius:"10px", padding:"8px 20px",
                fontWeight:"800", fontSize:"13px", cursor:"pointer",
                transition:"all 0.15s"
              }}
            >
              {showLegend ? "🙈 Hide word list" : "👁️ Show all words in this game"}
            </button>

            {showLegend && (
              <div style={{
                background:"white", border:"2px solid #E0E7FF",
                borderRadius:"14px", padding:"16px", marginTop:"12px",
                textAlign:"left"
              }}>
                <div style={{fontWeight:"800",color:"#1E1B4B",fontSize:"13px",marginBottom:"10px"}}>
                  📚 All words in this game ({allWords.length} total)
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                  {allWords.sort().map((w, i) => (
                    <span key={i} style={{
                      background:"#EEF2FF", color:"#4338CA",
                      borderRadius:"6px", padding:"4px 10px",
                      fontSize:"13px", fontWeight:"700"
                    }}>{w}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Team ready indicators */}
          <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginBottom:"24px"}}>
            {teams.map(t => (
              <div key={t.id} style={{
                background:t.color.light, border:`3px solid ${t.color.bg}`,
                borderRadius:"14px", padding:"10px 18px",
                fontWeight:"800", fontSize:"14px", color:t.color.dark
              }}>
                {t.color.emoji} {t.name}
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase("play")}
            style={{
              background:"linear-gradient(135deg,#7C3AED,#DB2777)",
              color:"white", border:"none", borderRadius:"16px",
              padding:"16px 48px", fontSize:"19px", fontWeight:"900",
              cursor:"pointer", boxShadow:"0 6px 24px rgba(124,58,237,0.4)"
            }}
          >
            ✅ Everyone's ready — Start!
          </button>
        </div>
      )}

      {/* ── PLAY / ROUNDEND ── */}
      {phase !== "intro" && (
        <div>
          {/* Instructions banner */}
          <div style={{background:"linear-gradient(135deg,#7C3AED,#DB2777)",borderRadius:"14px",padding:"12px 16px",marginBottom:"16px",textAlign:"center",color:"white"}}>
            <div style={{fontWeight:"900",fontSize:"16px",marginBottom:"4px"}}>🔥 Hot Seat — Round {qi + 1}</div>
            <div style={{fontSize:"13px",opacity:.85}}>One player per team faces away from the screen. Teammates describe their word — no spelling, no saying it directly!</div>
          </div>

          {/* Timer — circular countdown */}
          {phase === "play" && (
            <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"16px",background:"white",border:"2px solid #E0E7FF",borderRadius:"14px",padding:"12px 16px"}}>
              <div style={{position:"relative",width:"72px",height:"72px",flexShrink:0}}>
                <svg width="72" height="72" style={{transform:"rotate(-90deg)"}}>
                  <circle cx="36" cy="36" r="30" fill="none" stroke="#E5E7EB" strokeWidth="6"/>
                  <circle cx="36" cy="36" r="30" fill="none"
                    stroke={timerColor} strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - timerPct / 100)}`}
                    strokeLinecap="round"
                    style={{transition:"stroke-dashoffset 1s linear, stroke 0.3s"}}
                  />
                </svg>
                <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"900",fontSize:"20px",color:timerColor,fontVariantNumeric:"tabular-nums"}}>{timeLeft}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:"800",color:"#374151",fontSize:"14px",marginBottom:"6px"}}>
                  {timeLeft > 20 ? "🟢 Keep describing!" : timeLeft > 10 ? "🟡 Speed up!" : "🔴 Last chance!"}
                </div>
                <div style={{height:"8px",background:"#E5E7EB",borderRadius:"4px",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${timerPct}%`,background:timerColor,borderRadius:"4px",transition:"width 1s linear, background 0.3s"}}/>
                </div>
              </div>
            </div>
          )}

          {/* Team word cards */}
          <div style={{
            display:"grid",
            gridTemplateColumns: teams.length === 4 ? "1fr 1fr" : "repeat(auto-fit,minmax(200px,1fr))",
            gap:"12px",marginBottom:"16px"
          }}>
            {teams.map((team, i) => {
              const item = wordsForTeams[i];
              if (!item) return null;
              const won = winner !== null && winner === team.id;
              return (
                <div key={team.id} style={{
                  background: won ? "linear-gradient(135deg,#ECFDF5,#D1FAE5)" : `linear-gradient(135deg,${team.color.light},white)`,
                  border: `3px solid ${won ? "#22C55E" : team.color.bg}`,
                  borderRadius:"18px", overflow:"hidden",
                  transform: won ? "scale(1.04)" : "scale(1)",
                  transition:"all 0.35s",
                  boxShadow: won ? "0 8px 32px #22C55E40" : "0 2px 8px rgba(0,0,0,0.06)"
                }}>
                  <div style={{background: won ? "#22C55E" : team.color.bg, padding:"8px 14px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                    <span style={{fontWeight:"900",fontSize:"13px",color:"white"}}>{team.color.emoji} {team.name}</span>
                    {won && <span style={{fontSize:"18px"}}>🏆</span>}
                  </div>
                  <div style={{padding:"14px 12px",textAlign:"center"}}>
                    <div style={{
                      background: won ? "white" : "rgba(255,255,255,0.8)",
                      borderRadius:"12px", padding:"14px 10px",
                      fontWeight:"900", fontSize:"clamp(16px,3vw,22px)",
                      color: won ? "#14532D" : team.color.dark,
                      lineHeight:1.3, marginBottom:"12px", minHeight:"56px",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      border: `2px solid ${won ? "#22C55E" : team.color.bg}33`,
                    }}>
                      {item.word}
                    </div>
                    {phase === "play" && winner === null && (
                      <button onClick={() => markCorrect(team.id)} style={{
                        background:`linear-gradient(135deg,${team.color.bg},${team.color.dark})`,
                        color:"white", border:"none",
                        borderRadius:"10px", padding:"10px 16px",
                        fontWeight:"800", fontSize:"14px",
                        cursor:"pointer", width:"100%",
                        boxShadow:`0 4px 12px ${team.color.bg}50`
                      }}>✅ Guessed it!</button>
                    )}
                    {won && <div style={{fontWeight:"900",color:"#14532D",fontSize:"15px"}}>🎉 +{Math.max(20, 100 - (ROUND_SECONDS - timeLeft) * 2)} pts!</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Round end */}
          {phase === "roundend" && (
            <div style={{textAlign:"center"}}>
              {winner !== null ? (
                <div style={{background:"#ECFDF5",border:"2px solid #22C55E",borderRadius:"14px",padding:"14px",marginBottom:"14px"}}>
                  <div style={{fontWeight:"900",fontSize:"17px",color:"#14532D"}}>
                    🏆 {teams.find(t=>t.id===winner)?.name} guessed correctly!
                  </div>
                </div>
              ) : (
                <div style={{background:"#FEF9C3",border:"2px solid #F59E0B",borderRadius:"14px",padding:"14px",marginBottom:"14px"}}>
                  <div style={{fontWeight:"900",fontSize:"17px",color:"#92400E"}}>⏰ Time's up! No team guessed in time.</div>
                </div>
              )}
              <button onClick={nextRound} style={{background:"#7C3AED",color:"white",border:"none",borderRadius:"14px",padding:"12px 32px",fontSize:"16px",fontWeight:"900",cursor:"pointer"}}>
                {hasMore ? "➡️ Next Words" : "🏁 End Game"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SPY AMONG US GAME ────────────────────────────────────────────────────────
function SpyAmongUsGame({ questions, teams, onUpdateScore, onEnd }) {
  const DISCUSS_SECONDS = 30;

  const [ri, setRi]           = useState(0);
  const [spyTeamIdx, setSpyTeamIdx] = useState(() => Math.floor(Math.random() * teams.length));
  // phase: "peek" | "discuss" | "speak" | "vote" | "spy-guess" | "reveal"
  const [phase, setPhase]     = useState("peek");
  const [peekIdx, setPeekIdx] = useState(0);      // which team is currently peeking
  const [revealed, setRevealed] = useState(false); // has this team flipped their card?
  const [votes, setVotes]     = useState({});
  const [spyGuess, setSpyGuess] = useState(null);
  const [speakIdx, setSpeakIdx]     = useState(0);    // which team is currently speaking
  const [speakOrder, setSpeakOrder] = useState(() => [...teams].sort(() => Math.random() - 0.5));
  const [timeLeft, setTimeLeft] = useState(DISCUSS_SECONDS);
  const timerRef = useRef(null);

  const round = questions[ri];
  if (!round) return <div style={{textAlign:"center",padding:"32px",fontWeight:"700",color:"#374151"}}>No rounds available.</div>;

  const spyTeam    = teams[spyTeamIdx];
  const peekTeam   = teams[peekIdx];
  const isSpy      = (teamId) => teamId === spyTeam.id;
  const speakTeam  = speakOrder[speakIdx];

  // Timer for discuss phase
  useEffect(() => {
    if (phase !== "discuss") { clearInterval(timerRef.current); return; }
    setTimeLeft(DISCUSS_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const nextRound = () => {
    if (ri + 1 >= questions.length) { onEnd(); return; }
    setRi(r => r + 1);
    setSpyTeamIdx(Math.floor(Math.random() * teams.length));
    setPhase("peek");
    setPeekIdx(0);
    setRevealed(false);
    setVotes({});
    setSpyGuess(null);
    setSpeakIdx(0);
    setSpeakOrder([...teams].sort(() => Math.random() - 0.5));
  };

  // ── SCORING ──
  const resolveVotes = () => {
    // Count votes for each team
    const voteCounts = {};
    teams.forEach(t => { voteCounts[t.id] = 0; });
    Object.values(votes).forEach(v => { if (v !== null && v !== undefined) voteCounts[v] = (voteCounts[v]||0) + 1; });
    const maxVotes = Math.max(...Object.values(voteCounts));
    const mostVoted = teams.filter(t => voteCounts[t.id] === maxVotes).map(t => t.id);
    const spyCaught = mostVoted.includes(spyTeam.id) && mostVoted.length === 1;

    if (spyCaught) {
      // Spy caught — move to spy guess phase
      setPhase("spy-guess");
    } else {
      // Spy escaped — spy gets points, reveal
      onUpdateScore(spyTeam.id, 120);
      setPhase("reveal");
    }
  };

  const resolveSpyGuess = () => {
    const guessedCorrectly = spyGuess === round.crewmateTopic;
    if (guessedCorrectly) {
      // Spy guessed the topic — spy wins even though caught
      onUpdateScore(spyTeam.id, 80);
    } else {
      // Spy was caught AND guessed wrong — crewmates win big
      teams.filter(t => !isSpy(t.id)).forEach(t => onUpdateScore(t.id, 100));
    }
    setPhase("reveal");
  };

  const castVote = (voterId, suspectId) => {
    setVotes(v => ({...v, [voterId]: suspectId}));
  };

  const allVoted = teams.every(t => votes[t.id] !== undefined);
  const timerPct = (timeLeft / DISCUSS_SECONDS) * 100;
  const timerColor = timeLeft > 15 ? "#22C55E" : timeLeft > 8 ? "#F59E0B" : "#EF4444";

  // Vote counts for display
  const voteCounts = {};
  teams.forEach(t => { voteCounts[t.id] = 0; });
  Object.values(votes).forEach(v => { if (v !== null && v !== undefined) voteCounts[v] = (voteCounts[v]||0) + 1; });

  const PHASES = {
    peek:      "🔍 Phase 1: Secret Peek",
    discuss:   "💬 Phase 2: Discuss",
    speak:     "🗣️ Phase 3: Speak",
    vote:      "🗳️ Phase 4: Vote",
    "spy-guess": "🕵️ Spy's Last Chance",
    reveal:    "🎭 Reveal",
  };

  return (
    <div>
      {/* Phase header */}
      <div style={{background:"linear-gradient(135deg,#1F2937,#374151)",borderRadius:"14px",padding:"12px 20px",marginBottom:"14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
        <span style={{color:"white",fontWeight:"900",fontSize:"16px"}}>🕵️ Spy Among Us — Round {ri+1}/{questions.length}</span>
        <span style={{background:"rgba(255,255,255,0.15)",color:"white",padding:"4px 14px",borderRadius:"20px",fontWeight:"700",fontSize:"13px"}}>{PHASES[phase]}</span>
      </div>

      {/* ── PEEK PHASE ── One team at a time sees their role */}
      {phase === "peek" && (
        <div style={{textAlign:"center"}}>
          <div style={{
            background: peekTeam.color.light,
            border: `4px solid ${peekTeam.color.bg}`,
            borderRadius:"20px", padding:"24px", maxWidth:"480px", margin:"0 auto 20px"
          }}>
            <div style={{fontWeight:"900",fontSize:"22px",color:peekTeam.color.dark,marginBottom:"12px"}}>
              {peekTeam.color.emoji} {peekTeam.name} — your turn to look!
            </div>
            <div style={{fontSize:"14px",color:"#6B7280",marginBottom:"16px"}}>
              Everyone else: eyes down! 👇
            </div>

            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                style={{
                  background: peekTeam.color.bg, color:"white",
                  border:"none", borderRadius:"14px",
                  padding:"16px 40px", fontSize:"18px", fontWeight:"900", cursor:"pointer",
                  boxShadow:`0 4px 20px ${peekTeam.color.bg}60`
                }}
              >
                👁️ Reveal my role
              </button>
            ) : (
              <div>
                {/* Role card */}
                <div style={{
                  background: isSpy(peekTeam.id)
                    ? "linear-gradient(135deg,#1F2937,#374151)"
                    : "linear-gradient(135deg,#1E3A8A,#2563EB)",
                  borderRadius:"16px", padding:"20px", marginBottom:"16px", color:"white"
                }}>
                  <div style={{fontSize:"36px",marginBottom:"8px"}}>
                    {isSpy(peekTeam.id) ? "🕵️" : "👨‍🚀"}
                  </div>
                  <div style={{fontWeight:"900",fontSize:"20px",marginBottom:"6px"}}>
                    {isSpy(peekTeam.id) ? "You are the SPY!" : "You are a CREWMATE"}
                  </div>
                  <div style={{
                    background:"rgba(255,255,255,0.15)", borderRadius:"12px",
                    padding:"14px", fontSize:"15px", lineHeight:1.6,
                    fontWeight:"700", marginBottom:"6px"
                  }}>
                    {isSpy(peekTeam.id) ? round.spyPrompt : round.crewmatePrompt}
                  </div>
                  {isSpy(peekTeam.id) && (
                    <div style={{fontSize:"12px",opacity:0.8,marginTop:"6px"}}>
                      ⚠️ You have a different topic — blend in! Try to guess the real topic to win if caught.
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setRevealed(false);
                    if (peekIdx + 1 < teams.length) {
                      setPeekIdx(i => i + 1);
                    } else {
                      setPhase("discuss");
                    }
                  }}
                  style={{
                    background:"#374151", color:"white",
                    border:"none", borderRadius:"12px",
                    padding:"12px 28px", fontSize:"15px", fontWeight:"800", cursor:"pointer"
                  }}
                >
                  ✅ Okay, I've read it — head down!
                  {peekIdx + 1 < teams.length
                    ? ` (Next: ${teams[peekIdx + 1].name})`
                    : " (Start discussion!)"}
                </button>
              </div>
            )}
          </div>

          {/* Progress dots */}
          <div style={{display:"flex",gap:"8px",justifyContent:"center"}}>
            {teams.map((t,i) => (
              <div key={t.id} style={{
                width:"12px",height:"12px",borderRadius:"50%",
                background: i < peekIdx ? "#22C55E" : i === peekIdx ? t.color.bg : "#D1D5DB"
              }}/>
            ))}
          </div>
        </div>
      )}

      {/* ── DISCUSS PHASE ── 30 seconds to prepare */}
      {phase === "discuss" && (
        <div>
          <div style={{background:"#F0F9FF",border:"2px solid #0EA5E9",borderRadius:"14px",padding:"18px",marginBottom:"16px",textAlign:"center"}}>
            <div style={{fontWeight:"900",fontSize:"17px",color:"#0C4A6E",marginBottom:"6px"}}>💬 Prepare your answer!</div>
            <p style={{color:"#0369A1",fontSize:"14px",margin:"0 0 14px"}}>
              Each team thinks about what they'll say. Discuss quietly with your team — <strong>don't say your topic out loud!</strong>
            </p>
            {/* Timer */}
            <div style={{maxWidth:"300px",margin:"0 auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",fontWeight:"700",color:"#6B7280",marginBottom:"4px"}}>
                <span>Preparation time</span>
                <span style={{color:timerColor,fontWeight:"900",fontSize:"18px"}}>{timeLeft}s</span>
              </div>
              <div style={{height:"10px",background:"#E5E7EB",borderRadius:"5px",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${timerPct}%`,background:timerColor,borderRadius:"5px",transition:"width 1s linear"}}/>
              </div>
            </div>
          </div>
          <div style={{textAlign:"center"}}>
            <button
              onClick={() => { clearInterval(timerRef.current); setSpeakIdx(0); setSpeakOrder([...teams].sort(() => Math.random() - 0.5)); setPhase("speak"); }}
              style={{background:"#374151",color:"white",border:"none",borderRadius:"12px",padding:"12px 28px",fontSize:"15px",fontWeight:"800",cursor:"pointer"}}
            >
              🗣️ Ready — Start Speaking!
            </button>
          </div>
        </div>
      )}

      {/* ── SPEAK PHASE ── One team at a time answers */}
      {phase === "speak" && (
        <div>
          <div style={{
            background: speakTeam.color.light,
            border: `3px solid ${speakTeam.color.bg}`,
            borderRadius:"16px", padding:"20px", textAlign:"center", marginBottom:"14px"
          }}>
            <div style={{fontWeight:"900",fontSize:"20px",color:speakTeam.color.dark,marginBottom:"8px"}}>
              {speakTeam.color.emoji} {speakTeam.name} — speak now!
            </div>
            <div style={{fontSize:"14px",color:"#6B7280",marginBottom:"14px"}}>
              Answer your prompt. Other teams: listen carefully for anything that seems… off.
            </div>
            <button
              onClick={() => {
                if (speakIdx + 1 < speakOrder.length) {
                  setSpeakIdx(i => i + 1);
                } else {
                  setPhase("vote");
                }
              }}
              style={{
                background: speakTeam.color.bg, color:"white",
                border:"none", borderRadius:"12px",
                padding:"12px 28px", fontSize:"15px", fontWeight:"800", cursor:"pointer"
              }}
            >
              ✅ Done — {speakIdx + 1 < speakOrder.length ? `Next: ${speakOrder[speakIdx + 1].name}` : "Go to vote!"}
            </button>
          </div>

          {/* Progress */}
          <div style={{display:"flex",gap:"8px",justifyContent:"center"}}>
            {speakOrder.map((t,i) => (
              <div key={t.id} style={{
                display:"flex",alignItems:"center",gap:"4px",
                background: i < speakIdx ? "#ECFDF5" : i === speakIdx ? t.color.light : "#F3F4F6",
                border: `2px solid ${i < speakIdx ? "#22C55E" : i === speakIdx ? t.color.bg : "#E5E7EB"}`,
                borderRadius:"8px", padding:"4px 10px",
                fontSize:"12px", fontWeight:"800",
                color: i < speakIdx ? "#14532D" : t.color.dark
              }}>
                {i < speakIdx ? "✅" : i === speakIdx ? "🗣️" : "⏳"} {t.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VOTE PHASE ── */}
      {phase === "vote" && (
        <div>
          <p style={{textAlign:"center",fontWeight:"700",color:"#374151",fontSize:"15px",marginBottom:"14px"}}>
            🕵️ Who do you think is the spy? Each team votes!
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"16px"}}>
            {teams.map(voter => (
              <div key={voter.id} style={{background:voter.color.light,border:`2px solid ${voter.color.bg}`,borderRadius:"12px",padding:"12px 14px"}}>
                <div style={{fontWeight:"800",color:voter.color.dark,fontSize:"14px",marginBottom:"8px"}}>
                  {voter.color.emoji} {voter.name} suspects:
                </div>
                <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                  {teams.filter(t => t.id !== voter.id).map(suspect => (
                    <button key={suspect.id} onClick={() => castVote(voter.id, suspect.id)} style={{
                      background: votes[voter.id] === suspect.id ? suspect.color.bg : "white",
                      color: votes[voter.id] === suspect.id ? "white" : suspect.color.dark,
                      border:`2px solid ${suspect.color.bg}`, borderRadius:"8px",
                      padding:"6px 14px", fontWeight:"700", fontSize:"13px", cursor:"pointer"
                    }}>
                      🕵️ {suspect.name}
                      {voteCounts[suspect.id] > 0 && ` (${voteCounts[suspect.id]})`}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center"}}>
            <button onClick={resolveVotes} disabled={!allVoted} style={{
              background: allVoted ? "#DC2626" : "#D1D5DB", color:"white",
              border:"none", borderRadius:"12px", padding:"12px 28px", fontSize:"15px", fontWeight:"800",
              cursor: allVoted ? "pointer" : "not-allowed"
            }}>🎭 Count the votes!</button>
            {!allVoted && <p style={{color:"#9CA3AF",fontSize:"13px",marginTop:"6px"}}>Waiting for all teams to vote</p>}
          </div>
        </div>
      )}

      {/* ── SPY GUESS PHASE ── Spy was caught — can they name the real topic? */}
      {phase === "spy-guess" && (
        <div style={{textAlign:"center"}}>
          <div style={{background:"linear-gradient(135deg,#1F2937,#374151)",borderRadius:"16px",padding:"24px",marginBottom:"16px",color:"white"}}>
            <div style={{fontSize:"36px",marginBottom:"10px"}}>🕵️</div>
            <div style={{fontWeight:"900",fontSize:"20px",marginBottom:"8px"}}>
              {spyTeam.name} — you've been caught!
            </div>
            <div style={{fontSize:"14px",opacity:0.85,marginBottom:"16px"}}>
              But you can still win! Guess the real topic the other teams were using.
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px",maxWidth:"320px",margin:"0 auto 16px"}}>
              {round.spyGuessOptions.map(opt => (
                <button key={opt} onClick={() => setSpyGuess(opt)} style={{
                  background: spyGuess === opt ? "#6366F1" : "rgba(255,255,255,0.1)",
                  color:"white",
                  border: `2px solid ${spyGuess === opt ? "#818CF8" : "rgba(255,255,255,0.2)"}`,
                  borderRadius:"10px", padding:"10px 16px",
                  fontWeight:"800", fontSize:"15px", cursor:"pointer"
                }}>
                  {opt}
                </button>
              ))}
            </div>
            <button
              onClick={resolveSpyGuess}
              disabled={!spyGuess}
              style={{
                background: spyGuess ? "#EF4444" : "#6B7280",
                color:"white", border:"none", borderRadius:"12px",
                padding:"12px 28px", fontSize:"15px", fontWeight:"900",
                cursor: spyGuess ? "pointer" : "not-allowed"
              }}
            >
              🎯 Lock in my answer!
            </button>
          </div>
        </div>
      )}

      {/* ── REVEAL PHASE ── */}
      {phase === "reveal" && (
        <div>
          {/* Who was the spy */}
          <div style={{textAlign:"center",marginBottom:"14px"}}>
            <div style={{fontSize:"40px",marginBottom:"8px"}}>🕵️</div>
            <div style={{fontWeight:"900",fontSize:"20px",color:"#1E1B4B",marginBottom:"4px"}}>
              The spy was {spyTeam.name}!
            </div>
          </div>

          {/* Topic comparison */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
            <div style={{background:"#EFF6FF",border:"2px solid #3B82F6",borderRadius:"12px",padding:"14px"}}>
              <div style={{fontWeight:"800",fontSize:"12px",color:"#1E3A8A",marginBottom:"8px"}}>👨‍🚀 CREWMATE TOPIC</div>
              <div style={{fontWeight:"900",fontSize:"16px",color:"#1E3A8A",marginBottom:"8px"}}>{round.crewmateTopic}</div>
              <div style={{fontSize:"13px",color:"#1D4ED8",lineHeight:1.5,fontStyle:"italic"}}>"{round.crewmatePrompt}"</div>
            </div>
            <div style={{background:"#1F2937",border:"2px solid #374151",borderRadius:"12px",padding:"14px"}}>
              <div style={{fontWeight:"800",fontSize:"12px",color:"#9CA3AF",marginBottom:"8px"}}>🕵️ SPY TOPIC</div>
              <div style={{fontWeight:"900",fontSize:"16px",color:"#F9FAFB",marginBottom:"8px"}}>{round.spyTopic}</div>
              <div style={{fontSize:"13px",color:"#D1D5DB",lineHeight:1.5,fontStyle:"italic"}}>"{round.spyPrompt}"</div>
            </div>
          </div>

          {/* Explanation */}
          <div style={{background:"#FEF9C3",border:"2px solid #F59E0B",borderRadius:"12px",padding:"12px",marginBottom:"14px"}}>
            <div style={{fontWeight:"800",fontSize:"13px",color:"#92400E",marginBottom:"4px"}}>💡 The difference</div>
            <div style={{color:"#713F12",fontSize:"14px"}}>{round.explanation}</div>
          </div>

          {/* Spy guess result if applicable */}
          {spyGuess && (
            <div style={{
              background: spyGuess === round.crewmateTopic ? "#FEF2F2" : "#ECFDF5",
              border:`2px solid ${spyGuess === round.crewmateTopic ? "#EF4444" : "#22C55E"}`,
              borderRadius:"12px",padding:"12px",marginBottom:"14px",textAlign:"center"
            }}>
              {spyGuess === round.crewmateTopic
                ? <div style={{fontWeight:"900",color:"#991B1B"}}>🕵️ {spyTeam.name} guessed "{spyGuess}" — correct! Spy earns 80 pts despite being caught.</div>
                : <div style={{fontWeight:"900",color:"#14532D"}}>👨‍🚀 {spyTeam.name} guessed "{spyGuess}" — wrong! Crewmates win +100 pts each.</div>
              }
            </div>
          )}

          {/* Vote summary */}
          <div style={{background:"#F3F4F6",borderRadius:"12px",padding:"12px",marginBottom:"14px"}}>
            <div style={{fontWeight:"800",fontSize:"13px",color:"#374151",marginBottom:"8px"}}>🗳️ Vote results:</div>
            {teams.map(t => {
              const accused = teams.find(x => x.id === votes[t.id]);
              const correct = votes[t.id] === spyTeam.id;
              return (
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px",fontSize:"13px"}}>
                  <span style={{fontWeight:"700",color:t.color.dark}}>{t.name}:</span>
                  <span style={{color:correct?"#16A34A":"#DC2626",fontWeight:"700"}}>
                    {correct?"✅":"❌"} voted {accused?.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{textAlign:"center"}}>
            <button onClick={nextRound} style={{background:"#374151",color:"white",border:"none",borderRadius:"12px",padding:"12px 28px",fontSize:"15px",fontWeight:"800",cursor:"pointer"}}>
              {ri+1 >= questions.length ? "🏁 End Game" : "➡️ Next Round"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BRIDGE BUILDER GAME ──────────────────────────────────────────────────────
// Each segment of the bridge corresponds to a question type.
// Teams must answer all 4 types to build a complete bridge.
const BRIDGE_SEGMENT_TYPES = [
  { type:"correct grammar mistakes",     label:"Correct the mistake", emoji:"✏️",  color:"#7C3AED" },
  { type:"correct grammar mistakes",     label:"Correct the mistake", emoji:"✏️",  color:"#7C3AED" },
  { type:"choose correct grammar",       label:"Choose correct",      emoji:"🔤",  color:"#0891B2" },
  { type:"choose correct grammar",       label:"Choose correct",      emoji:"🔤",  color:"#0891B2" },
  { type:"finish the sentence",          label:"Finish the sentence",  emoji:"✍️",  color:"#D97706" },
  { type:"finish the sentence",          label:"Finish the sentence",  emoji:"✍️",  color:"#D97706" },
  { type:"speaking task",                label:"Speaking task",        emoji:"🗣️",  color:"#059669" },
  { type:"speaking task",                label:"Speaking task",        emoji:"🗣️",  color:"#059669" },
];

// Topic-focused segment types — escalate from simple to extended speaking
const BRIDGE_TOPIC_SEGMENT_TYPES = [
  { type:"speaking task", label:"One word answer",      emoji:"💬",  color:"#0891B2", prompt_prefix:"Give one word that relates to: " },
  { type:"speaking task", label:"One word answer",      emoji:"💬",  color:"#0891B2", prompt_prefix:"Give one word that relates to: " },
  { type:"speaking task", label:"One sentence",         emoji:"🗣️",  color:"#059669", prompt_prefix:"Answer in one sentence: " },
  { type:"speaking task", label:"One sentence",         emoji:"🗣️",  color:"#059669", prompt_prefix:"Answer in one sentence: " },
  { type:"speaking task", label:"Give your opinion",    emoji:"💭",  color:"#D97706", prompt_prefix:"Give your opinion: " },
  { type:"speaking task", label:"Give your opinion",    emoji:"💭",  color:"#D97706", prompt_prefix:"Give your opinion: " },
  { type:"speaking task", label:"Extended answer",      emoji:"🎤",  color:"#7C3AED", prompt_prefix:"Speak for 30 seconds about: " },
  { type:"speaking task", label:"Extended answer",      emoji:"🎤",  color:"#7C3AED", prompt_prefix:"Speak for 30 seconds about: " },
];

function BridgeBuilderGame({ questions, teams, onUpdateScore, onEnd }) {
  const SEGMENTS = 8;

  // Detect topic mode: all questions are speaking tasks (set by startGame when focus==="topic")
  const isTopicMode = questions.length > 0 && questions.every(q => q.type === "speaking task");
  const ACTIVE_SEGMENTS = isTopicMode ? BRIDGE_TOPIC_SEGMENT_TYPES : BRIDGE_SEGMENT_TYPES;

  const [progress, setProgress] = useState(() => Object.fromEntries(teams.map(t=>[t.id,0])));
  const [phase, setPhase] = useState("intro");
  const [showAns, setShowAns] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [finished, setFinished] = useState(null);
  const [qIdx, setQIdx] = useState(0); // simple index for topic mode

  // Group questions by type for grammar mode
  const qByType = useRef(null);
  if (!qByType.current && !isTopicMode) {
    const map = {};
    BRIDGE_SEGMENT_TYPES.forEach(s => { if (!map[s.type]) map[s.type] = []; });
    questions.forEach(q => {
      const t = q.type;
      if (map[t] !== undefined) map[t].push(q);
      if (t === "speaking task" || q.task) {
        if (map["speaking task"]) map["speaking task"].push({
          ...q,
          type: "speaking task",
          question: q.task || q.question,
          answer: "Open — teacher judges",
          hint: "Speak a full sentence using the target language"
        });
      }
    });
    Object.keys(map).forEach(t => {
      if (map[t].length === 0) {
        map[t] = questions.map(q => ({...q, type: t}));
      }
    });
    qByType.current = map;
  }

  const [typeIdx, setTypeIdx] = useState(() => Object.fromEntries(
    [...new Set(BRIDGE_SEGMENT_TYPES.map(s => s.type))].map(t => [t, 0])
  ));

  // Drive current question
  const maxProgress = Math.max(...teams.map(t => (progress[t.id] ?? 0)));
  const currentSegIdx = Math.min(maxProgress, SEGMENTS - 1);
  const currentSegDef = ACTIVE_SEGMENTS[currentSegIdx];
  const currentType = currentSegDef.type;

  let currentQ;
  if (isTopicMode) {
    // Topic mode: cycle through questions simply, apply segment prompt prefix
    const raw = questions[qIdx % Math.max(questions.length, 1)];
    currentQ = {
      ...raw,
      type: "speaking task",
      question: (currentSegDef.prompt_prefix || "") + raw.question,
    };
  } else {
    const typePool = qByType.current?.[currentType] || questions;
    currentQ = typePool[(typeIdx[currentType] ?? 0) % Math.max(typePool.length, 1)];
  }

  const awardTeam = (teamId, correct) => {
    const teamProgress = progress[teamId] ?? 0;
    setLastResult({teamId, correct, segIdx: teamProgress});

    if (correct) {
      const newProg = Math.min(SEGMENTS, teamProgress + 1);
      setProgress(prev => ({...prev, [teamId]: newProg}));
      onUpdateScore(teamId, 40);
      if (isTopicMode) {
        setQIdx(i => i + 1);
      } else {
        setTypeIdx(prev => ({...prev, [currentType]: (prev[currentType] ?? 0) + 1}));
      }
      if (newProg >= SEGMENTS) {
        setFinished(teamId);
        onUpdateScore(teamId, 100);
        return;
      }
    }
    setShowAns(false);
    setLastResult(null);
  };

  const skip = () => {
    setShowAns(false);
    setLastResult(null);
    if (isTopicMode) {
      setQIdx(i => i + 1);
    } else {
      setTypeIdx(prev => ({...prev, [currentType]: (prev[currentType] ?? 0) + 1}));
    }
  };

  // Draw bridge SVG
  const BridgeViz = ({teamId}) => {
    const segs = progress[teamId] ?? 0;
    const t = teams.find(t=>t.id===teamId);
    const W = 200, H = 60;
    const segW = (W - 20) / SEGMENTS;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:"200px",display:"block",margin:"0 auto"}}>
        <rect x={10} y={40} width={W-20} height={18} fill="#E5E7EB" rx="2"/>
        <rect x={10} y={40} width={W-20} height={3} fill="#9CA3AF"/>
        {Array.from({length:segs}).map((_,i)=>(
          <rect key={i} x={10+i*segW} y={32} width={segW-1} height={10}
            fill={ACTIVE_SEGMENTS[i]?.color || t.color.bg} rx="2"/>
        ))}
        {Array.from({length:SEGMENTS-segs}).map((_,i)=>(
          <rect key={i} x={10+(segs+i)*segW} y={35} width={segW-1} height={4} fill="#D1D5DB" rx="1"/>
        ))}
        <rect x={4} y={24} width={8} height={34} fill="#6B7280" rx="2"/>
        <rect x={W-12} y={24} width={8} height={34} fill="#6B7280" rx="2"/>
        {segs > 0 && segs < SEGMENTS && (
          <>
            <line x1={10+segs*segW} y1={10} x2={10+segs*segW} y2={32} stroke={t.color.bg} strokeWidth="2"/>
            <polygon points={`${10+segs*segW},10 ${10+segs*segW+10},16 ${10+segs*segW},22`} fill={t.color.bg}/>
          </>
        )}
        {segs >= SEGMENTS && (
          <text x={W/2} y={20} textAnchor="middle" fontSize="14" fill={t.color.bg}>🏆</text>
        )}
      </svg>
    );
  };

  // Check finished !== null (not falsy) so Red (id=0) triggers win screen
  if (finished !== null) {
    const winner = teams.find(t=>t.id===finished);
    return (
      <div style={{textAlign:"center",padding:"20px"}}>
        <div style={{fontSize:"48px",marginBottom:"12px"}}>🌉</div>
        <div style={{fontWeight:"900",fontSize:"24px",color:"#1E1B4B",marginBottom:"6px"}}>{winner?.name} built the bridge!</div>
        <div style={{marginBottom:"20px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"10px"}}>
          {teams.map(t=>(
            <div key={t.id} style={{background:t.color.light,border:`3px solid ${t.color.bg}`,borderRadius:"14px",padding:"10px"}}>
              <div style={{fontWeight:"800",color:t.color.dark,fontSize:"13px",marginBottom:"6px"}}>{t.name}</div>
              <BridgeViz teamId={t.id}/>
              <div style={{fontWeight:"700",fontSize:"12px",color:t.color.dark,marginTop:"4px"}}>{progress[t.id] ?? 0}/{SEGMENTS} segments</div>
            </div>
          ))}
        </div>
        <button onClick={onEnd} style={{background:"#0EA5E9",color:"white",border:"none",borderRadius:"12px",padding:"12px 28px",fontSize:"16px",fontWeight:"800",cursor:"pointer"}}>🏁 End Game</button>
      </div>
    );
  }

  if (phase === "intro") return (
    <div style={{textAlign:"center"}}>
      <div style={{background:"linear-gradient(135deg,#0C4A6E,#0EA5E9)",borderRadius:"20px",padding:"28px 24px",marginBottom:"10px",position:"relative",color:"white",maxWidth:"520px",margin:"0 auto 10px"}}>
        <div style={{fontSize:"36px",marginBottom:"10px"}}>🌉</div>
        <div style={{fontWeight:"900",fontSize:"20px",marginBottom:"10px"}}>Bridge Builder</div>
        <div style={{fontSize:"15px",lineHeight:1.7,opacity:0.95}}>
          Every team builds a bridge — <strong>first to 8 segments wins!</strong><br/>
          Each segment has a <strong>fixed task type</strong> — colour-coded on the bridge.<br/>
          Any team can answer — buzz in and complete the task to add a segment.<br/>
          Answer all 4 types to build a complete, well-rounded bridge!
        </div>
        <div style={{position:"absolute",bottom:"-14px",left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"14px solid transparent",borderRight:"14px solid transparent",borderTop:"14px solid #0EA5E9"}}/>
      </div>
      {/* Segment type legend */}
      <div style={{display:"flex",gap:"6px",justifyContent:"center",flexWrap:"wrap",margin:"24px 0 16px"}}>
        {[...new Map(BRIDGE_SEGMENT_TYPES.map(s=>[s.type,s])).values()].map((s,i) => (
          <div key={i} style={{background:s.color,color:"white",borderRadius:"8px",padding:"5px 12px",fontSize:"12px",fontWeight:"800"}}>
            {s.emoji} {s.label} (×2)
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginBottom:"24px"}}>
        {teams.map(t => (<div key={t.id} style={{background:t.color.light,border:`3px solid ${t.color.bg}`,borderRadius:"14px",padding:"10px 18px",fontWeight:"800",fontSize:"14px",color:t.color.dark}}>{t.color.emoji} {t.name}</div>))}
      </div>
      <button onClick={() => setPhase("question")} style={{background:"linear-gradient(135deg,#0C4A6E,#0EA5E9)",color:"white",border:"none",borderRadius:"16px",padding:"16px 48px",fontSize:"19px",fontWeight:"900",cursor:"pointer",boxShadow:"0 6px 24px rgba(14,165,233,0.4)"}}>
        🌉 Start Building!
      </button>
    </div>
  );

  return (
    <div>
      {/* Current task type banner */}
      <div style={{
        background: currentSegDef.color,
        borderRadius:"14px", padding:"12px 16px", marginBottom:"14px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexWrap:"wrap", gap:"8px"
      }}>
        <div style={{color:"white",fontWeight:"900",fontSize:"16px"}}>
          {currentSegDef.emoji} {currentSegDef.label}
          <span style={{opacity:0.75,fontWeight:"600",fontSize:"13px",marginLeft:"8px"}}>
            — Segment {currentSegIdx + 1} of {SEGMENTS}
          </span>
        </div>
        <div style={{background:"rgba(255,255,255,0.2)",color:"white",borderRadius:"8px",padding:"3px 10px",fontSize:"12px",fontWeight:"700"}}>
          Raise your hand to answer! 🙋
        </div>
      </div>

      {/* Bridges */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"10px",marginBottom:"16px"}}>
        {teams.map(t => {
          const segs = progress[t.id] || 0;
          const nextSeg = ACTIVE_SEGMENTS[segs];
          return (
            <div key={t.id} style={{
              background:t.color.light, border:`3px solid ${t.color.bg}`,
              borderRadius:"14px", padding:"10px", textAlign:"center",
              transform: lastResult?.teamId===t.id&&lastResult?.correct ? "scale(1.05)" : "scale(1)",
              transition:"transform 0.3s"
            }}>
              <div style={{fontWeight:"800",fontSize:"13px",color:t.color.dark,marginBottom:"4px"}}>
                {t.name} — {segs}/{SEGMENTS}
              </div>
      {nextSeg && segs < SEGMENTS && (
                <div style={{fontSize:"10px",fontWeight:"700",color:nextSeg.color,marginBottom:"4px"}}>
                  Next: {nextSeg.emoji} {nextSeg.label}
                </div>
              )}
              <BridgeViz teamId={t.id}/>
              {lastResult?.teamId===t.id && (
                <div style={{marginTop:"4px",fontWeight:"700",fontSize:"12px",color:lastResult.correct?"#16A34A":"#DC2626"}}>
                  {lastResult.correct?"✅ +1 segment!":"❌ No progress"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Question */}
      <QuestionCard question={currentQ} showAnswer={showAns} onReveal={()=>setShowAns(true)}/>

      {/* Award buttons */}
      {(showAns || currentQ?.type === "speaking task") && (
        <div style={{marginTop:"14px"}}>
          <p style={{textAlign:"center",fontWeight:"700",color:"#374151",marginBottom:"10px",fontSize:"14px"}}>Which team answered first?</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"8px",marginBottom:"10px"}}>
            {teams.map(t=>(
              <button key={t.id} onClick={()=>awardTeam(t.id,true)} style={{
                background:t.color.bg,color:"white",border:"none",borderRadius:"10px",
                padding:"10px 8px",fontWeight:"800",fontSize:"14px",cursor:"pointer"
              }}>✅ {t.name}</button>
            ))}
          </div>
          <div style={{textAlign:"center"}}>
            <button onClick={skip} style={{
              background:"#9CA3AF",color:"white",border:"none",borderRadius:"10px",
              padding:"8px 20px",fontWeight:"700",fontSize:"13px",cursor:"pointer"
            }}>⏭️ Skip / No answer</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HOT POTATO GAME ──────────────────────────────────────────────────────────
function HotPotatoGame({ questions, teams, onUpdateScore, onEnd, level }) {
  const showSpanish = level === "A1" || level === "A2";
  const TOTAL_ROUNDS  = 5;
  const ROUND_SECONDS = 40;
  const Q_SECONDS     = 10;
  const PENALTY_PTS   = 50;

  const [phase, setPhase]           = useState("intro"); // intro | play | roundend | gameover
  const [round, setRound]           = useState(1);
  const [qi, setQi]                 = useState(0);
  const [holderIdx, setHolderIdx]   = useState(0);
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS); // display only
  const [qTimeLeft, setQTimeLeft]   = useState(Q_SECONDS);
  const [showAnswer, setShowAnswer] = useState(false);
  const [passing, setPassing]       = useState(false);
  const [history, setHistory]       = useState([]);

  // Refs so timers don't close over stale state
  const roundTimeRef  = useRef(ROUND_SECONDS); // source of truth for round time
  const timerPaused   = useRef(false);          // pause without stopping interval
  const roundTimerRef = useRef(null);
  const qTimerRef     = useRef(null);
  const roundEndedRef = useRef(false);
  const holderIdxRef  = useRef(0);              // mirror of holderIdx for timer callbacks

  // Keep holderIdxRef in sync
  useEffect(() => { holderIdxRef.current = holderIdx; }, [holderIdx]);

  // Penalty via effect, never in render
  useEffect(() => {
    if (phase === "roundend") {
      onUpdateScore(teams[holderIdxRef.current].id, -PENALTY_PTS);
    }
  }, [phase, round]); // eslint-disable-line

  // ── Round timer ──
  // Split into two effects: one resets on new round, one starts/stops on phase
  useEffect(() => {
    // Runs when a new round starts — reset the time
    roundTimeRef.current = ROUND_SECONDS;
    roundEndedRef.current = false;
    timerPaused.current = false;
    setRoundTimeLeft(ROUND_SECONDS);
  }, [round]); // eslint-disable-line

  useEffect(() => {
    if (phase !== "play") {
      clearInterval(roundTimerRef.current);
      return;
    }
    clearInterval(roundTimerRef.current);
    roundTimerRef.current = setInterval(() => {
      if (timerPaused.current) return;
      roundTimeRef.current -= 1;
      setRoundTimeLeft(roundTimeRef.current);
      if (roundTimeRef.current <= 0) {
        clearInterval(roundTimerRef.current);
        if (!roundEndedRef.current) {
          roundEndedRef.current = true;
          const loser = teams[holderIdxRef.current];
          setHistory(h => [...h, { round, holderName: loser.name, holderId: loser.id }]);
          setPhase("roundend");
        }
      }
    }, 1000);
    return () => clearInterval(roundTimerRef.current);
  }, [phase, round]); // eslint-disable-line

  // ── Per-question timer — resets only when qi changes ──
  useEffect(() => {
    // Don't run during intro/roundend/gameover
    if (phase !== "play") return;
    setQTimeLeft(Q_SECONDS);
    setShowAnswer(false);
    clearInterval(qTimerRef.current);
    qTimerRef.current = setInterval(() => {
      setQTimeLeft(t => {
        if (t <= 1) {
          clearInterval(qTimerRef.current);
          timerPaused.current = true;
          setShowAnswer(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(qTimerRef.current);
  }, [qi]); // eslint-disable-line — keyed ONLY on qi, phase excluded

  const revealAnswer = () => {
    // Teacher presses to reveal early — stop q timer, pause round timer
    clearInterval(qTimerRef.current);
    timerPaused.current = true;
    setShowAnswer(true);
  };

  const confirmPass = () => {
    // Correct — animate pass, resume round timer, next question
    setPassing(true);
    setTimeout(() => {
      setPassing(false);
      setHolderIdx(i => (i + 1) % teams.length);
    }, 650);
    setShowAnswer(false);
    timerPaused.current = false; // resume round timer
    setQi(i => i + 1);
  };

  const confirmKeep = () => {
    // Wrong/slow — keep potato, resume round timer, next question
    setShowAnswer(false);
    timerPaused.current = false;
    setQi(i => i + 1);
  };

  const startNextRound = () => {
    if (round >= TOTAL_ROUNDS) { setPhase("gameover"); return; }
    setShowAnswer(false);
    setRound(r => r + 1);
    setPhase("play");
  };

  // ── Geometry ──
  const CIRCLE_R = 88, CX = 128, CY = 128, SVG_SIZE = 256;
  const n = teams.length;
  const teamPos = teams.map((_, i) => {
    const a = -Math.PI/2 + (2*Math.PI*i)/n;
    return { x: CX + CIRCLE_R*Math.cos(a), y: CY + CIRCLE_R*Math.sin(a) };
  });
  const potatoX = passing ? teamPos[(holderIdx+1)%n].x : teamPos[holderIdx].x;
  const potatoY = passing ? teamPos[(holderIdx+1)%n].y : teamPos[holderIdx].y;

  const roundTimePct = (roundTimeLeft / ROUND_SECONDS) * 100;
  const qTimePct     = (qTimeLeft / Q_SECONDS) * 100;
  const qColor       = qTimeLeft > 6 ? "#22C55E" : qTimeLeft > 3 ? "#F59E0B" : "#EF4444";
  const holder       = teams[holderIdx];
  const q            = questions[qi % Math.max(questions.length, 1)];

  // ── INTRO ──
  if (phase === "intro") return (
    <div style={{textAlign:"center"}}>
      <div style={{background:"linear-gradient(135deg,#EA580C,#F97316)",borderRadius:"20px",padding:"28px 24px",marginBottom:"10px",position:"relative",color:"white",maxWidth:"520px",margin:"0 auto 10px"}}>
        <div style={{fontSize:"40px",marginBottom:"10px"}}>🥔</div>
        <div style={{fontWeight:"900",fontSize:"20px",marginBottom:"10px"}}>Hot Potato</div>
        <div style={{fontSize:"15px",lineHeight:1.8,opacity:0.95}}>
          <strong>5 rounds × 40 seconds.</strong> One team holds the potato.<br/>
          Each team has <strong>10 seconds</strong> to answer — timer auto-reveals.<br/>
          Teacher judges: <strong>✅ Answered in time → Pass it on!</strong><br/>
          <strong>❌ Too slow or wrong → Keep the potato!</strong><br/>
          Round timer keeps running — whoever holds it at 0 <strong>loses {PENALTY_PTS} pts 🔥</strong>
        </div>
        <div style={{position:"absolute",bottom:"-14px",left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"14px solid transparent",borderRight:"14px solid transparent",borderTop:"14px solid #F97316"}}/>
      </div>
      <div style={{marginTop:"24px",marginBottom:"20px",fontSize:"14px",color:"#6B7280",fontWeight:"600"}}>
        Pass the potato as fast as possible — the clock is always ticking!
      </div>
      <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginBottom:"24px"}}>
        {teams.map(t => (<div key={t.id} style={{background:t.color.light,border:`3px solid ${t.color.bg}`,borderRadius:"14px",padding:"10px 18px",fontWeight:"800",fontSize:"14px",color:t.color.dark}}>{t.color.emoji} {t.name}</div>))}
      </div>
      <button onClick={() => setPhase("play")} style={{background:"linear-gradient(135deg,#EA580C,#F97316)",color:"white",border:"none",borderRadius:"16px",padding:"16px 48px",fontSize:"19px",fontWeight:"900",cursor:"pointer",boxShadow:"0 6px 24px rgba(249,115,22,0.4)"}}>
        🥔 Start Round 1!
      </button>
    </div>
  );

  // ── ROUND END ──
  if (phase === "roundend") {
    const lastEntry = history[history.length - 1];
    return (
      <div style={{textAlign:"center",padding:"10px"}}>
        <div style={{fontSize:"52px",marginBottom:"8px"}}>🔥</div>
        <div style={{fontWeight:"900",fontSize:"22px",color:"#C2410C",marginBottom:"6px"}}>Round {round} Over!</div>
        <div style={{background:"linear-gradient(135deg,#FEF2F2,#FEE2E2)",border:"3px solid #EF4444",borderRadius:"16px",padding:"16px",marginBottom:"16px"}}>
          <div style={{fontWeight:"800",fontSize:"16px",color:"#991B1B",marginBottom:"4px"}}>
            🥔 {lastEntry?.holderName} was holding the potato!
          </div>
          <div style={{fontWeight:"900",fontSize:"24px",color:"#DC2626"}}>−{PENALTY_PTS} pts</div>
        </div>
        {history.length > 0 && (
          <div style={{background:"#F9FAFB",border:"2px solid #E5E7EB",borderRadius:"14px",padding:"12px",marginBottom:"16px",textAlign:"left"}}>
            <div style={{fontWeight:"800",fontSize:"13px",color:"#374151",marginBottom:"8px"}}>Round history:</div>
            {history.map((h, i) => {
              const t = teams.find(tm => tm.id === h.holderId);
              return (
                <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:"4px",fontSize:"13px"}}>
                  <span style={{color:"#6B7280",fontWeight:"600"}}>Round {h.round}</span>
                  <span style={{fontWeight:"800",color:t?.color.dark ?? "#374151"}}>🥔 {h.holderName} −{PENALTY_PTS}pts</span>
                </div>
              );
            })}
          </div>
        )}
        {round < TOTAL_ROUNDS ? (
          <button onClick={startNextRound} style={{background:"linear-gradient(135deg,#EA580C,#F97316)",color:"white",border:"none",borderRadius:"16px",padding:"14px 40px",fontSize:"17px",fontWeight:"900",cursor:"pointer",boxShadow:"0 6px 20px rgba(249,115,22,0.4)"}}>
            ▶️ Start Round {round + 1}
          </button>
        ) : (
          <button onClick={() => setPhase("gameover")} style={{background:"linear-gradient(135deg,#1E1B4B,#4338CA)",color:"white",border:"none",borderRadius:"16px",padding:"14px 40px",fontSize:"17px",fontWeight:"900",cursor:"pointer"}}>
            🏁 See Final Results
          </button>
        )}
      </div>
    );
  }

  // ── GAME OVER ──
  if (phase === "gameover") {
    const penaltyCounts = {};
    teams.forEach(t => { penaltyCounts[t.id] = 0; });
    history.forEach(h => { penaltyCounts[h.holderId] = (penaltyCounts[h.holderId] || 0) + 1; });
    const sorted = [...teams].sort((a, b) => penaltyCounts[a.id] - penaltyCounts[b.id]);
    return (
      <div style={{textAlign:"center",padding:"10px"}}>
        <div style={{fontSize:"52px",marginBottom:"8px"}}>🥔</div>
        <div style={{fontWeight:"900",fontSize:"24px",color:"#1E1B4B",marginBottom:"16px"}}>Game Over!</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"10px",marginBottom:"20px"}}>
          {sorted.map(t => {
            const count = penaltyCounts[t.id] || 0;
            const isWorst = count === Math.max(...Object.values(penaltyCounts));
            return (
              <div key={t.id} style={{background: isWorst?"linear-gradient(135deg,#FEF2F2,#FEE2E2)":t.color.light,border:`3px solid ${isWorst?"#EF4444":t.color.bg}`,borderRadius:"16px",padding:"14px",textAlign:"center"}}>
                <div style={{fontSize:"28px",marginBottom:"4px"}}>{count===0?"🏆":isWorst?"🥔":"😬"}</div>
                <div style={{fontWeight:"800",color:isWorst?"#991B1B":t.color.dark,fontSize:"14px",marginBottom:"4px"}}>{t.name}</div>
                <div style={{fontSize:"12px",fontWeight:"700",color:"#6B7280"}}>Held potato {count}×</div>
                <div style={{fontWeight:"900",color:isWorst?"#DC2626":"#374151",fontSize:"15px",marginTop:"4px"}}>−{count*PENALTY_PTS} pts</div>
              </div>
            );
          })}
        </div>
        <div style={{background:"#F9FAFB",border:"2px solid #E5E7EB",borderRadius:"14px",padding:"12px",marginBottom:"20px",textAlign:"left"}}>
          <div style={{fontWeight:"800",fontSize:"13px",color:"#374151",marginBottom:"8px"}}>Full history:</div>
          {history.map((h, i) => {
            const t = teams.find(tm => tm.id === h.holderId);
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:"4px",fontSize:"13px"}}>
                <span style={{color:"#6B7280",fontWeight:"600"}}>Round {h.round}</span>
                <span style={{fontWeight:"800",color:t?.color.dark??"#374151"}}>🥔 {h.holderName} −{PENALTY_PTS}pts</span>
              </div>
            );
          })}
        </div>
        <button onClick={onEnd} style={{background:"linear-gradient(135deg,#F97316,#EF4444)",color:"white",border:"none",borderRadius:"16px",padding:"16px 48px",fontSize:"18px",fontWeight:"900",cursor:"pointer",boxShadow:"0 6px 24px rgba(249,115,22,0.4)"}}>🏁 End Game</button>
      </div>
    );
  }

  // ── PLAY ──
  return (
    <div>
      {/* Header: round label + vague round timer bar */}
      <div style={{background:"linear-gradient(135deg,#EA580C,#F97316)",borderRadius:"14px",padding:"12px 16px",marginBottom:"14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
        <div style={{color:"white"}}>
          <div style={{fontWeight:"900",fontSize:"16px"}}>🥔 Round {round} / {TOTAL_ROUNDS}</div>
          <div style={{fontSize:"12px",opacity:0.8}}>Pass it before time runs out!</div>
        </div>
        {/* Vague bar — no number, just fading */}
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <div style={{width:"90px",height:"8px",background:"rgba(255,255,255,0.25)",borderRadius:"4px",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${roundTimePct}%`,background:"white",borderRadius:"4px",transition:"width 1s linear"}}/>
          </div>
          <span style={{color:"rgba(255,255,255,0.65)",fontSize:"11px",fontWeight:"700"}}>???</span>
        </div>
      </div>

      {/* Circular team diagram */}
      <div style={{display:"flex",justifyContent:"center",marginBottom:"12px"}}>
        <svg width={SVG_SIZE} height={SVG_SIZE} style={{overflow:"visible"}}>
          <circle cx={CX} cy={CY} r={CIRCLE_R} fill="none" stroke="#E0E7FF" strokeWidth="2" strokeDasharray="6 4"/>
          {teams.map((_, i) => {
            const from=teamPos[i], to=teamPos[(i+1)%n];
            const mx=(from.x+to.x)/2, my=(from.y+to.y)/2;
            const dx=mx-CX, dy=my-CY, mag=Math.sqrt(dx*dx+dy*dy)||1;
            const ax=CX+(dx/mag)*CIRCLE_R, ay=CY+(dy/mag)*CIRCLE_R;
            const ang=Math.atan2(to.y-from.y,to.x-from.x)*180/Math.PI;
            return <text key={i} x={ax} y={ay} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#94A3B8" transform={`rotate(${ang},${ax},${ay})`}>›</text>;
          })}
          {teams.map((t, i) => {
            const pos=teamPos[i], isHolder=i===holderIdx;
            return (
              <g key={t.id}>
                <circle cx={pos.x} cy={pos.y} r={isHolder?33:27}
                  fill={isHolder?t.color.bg:t.color.light} stroke={t.color.bg} strokeWidth={isHolder?3:2}
                  style={{filter:isHolder?`drop-shadow(0 0 9px ${t.color.bg}95)`:"none",transition:"all 0.4s"}}/>
                <text x={pos.x} y={pos.y-(isHolder?5:3)} textAnchor="middle" dominantBaseline="middle"
                  fontSize={isHolder?"13":"11"} fontWeight="800" fill={isHolder?"white":t.color.dark}
                  style={{userSelect:"none",pointerEvents:"none"}}>
                  {t.name.length>7?t.name.slice(0,6)+"…":t.name}
                </text>
                {isHolder&&<text x={pos.x} y={pos.y+10} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.85)" fontWeight="700" style={{userSelect:"none"}}>HOLDING</text>}
              </g>
            );
          })}
          <g style={{transition:passing?"transform 0.65s cubic-bezier(0.34,1.56,0.64,1)":"transform 0s"}} transform={`translate(${potatoX},${potatoY})`}>
            <circle r="20" fill="#F97316" opacity="0.12"/>
            <text x="0" y="1" textAnchor="middle" dominantBaseline="middle" fontSize="24" style={{userSelect:"none",filter:passing?"drop-shadow(0 0 8px #F97316)":"none"}}>🥔</text>
          </g>
        </svg>
      </div>

      {/* Per-question timer + prompt */}
      <div style={{background:"white",border:"2px solid #E0E7FF",borderRadius:"16px",padding:"18px",marginBottom:"14px"}}>
        {/* Q timer row */}
        {!showAnswer && (
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"14px"}}>
            <div style={{position:"relative",width:"48px",height:"48px",flexShrink:0}}>
              <svg width="48" height="48" style={{transform:"rotate(-90deg)"}}>
                <circle cx="24" cy="24" r="20" fill="none" stroke="#E5E7EB" strokeWidth="5"/>
                <circle cx="24" cy="24" r="20" fill="none" stroke={qColor} strokeWidth="5"
                  strokeDasharray={`${2*Math.PI*20}`}
                  strokeDashoffset={`${2*Math.PI*20*(1-qTimePct/100)}`}
                  strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear,stroke 0.3s"}}/>
              </svg>
              <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"900",fontSize:"15px",color:qColor}}>{qTimeLeft}</div>
            </div>
            <div style={{flex:1,fontWeight:"700",color:"#374151",fontSize:"13px"}}>
              {holder.color.emoji} <strong>{holder.name}</strong> — answer now!<br/>
              <span style={{color:qColor,fontSize:"12px"}}>{qTimeLeft>6?"⏱️ Take your time…":qTimeLeft>3?"⚡ Hurry!":"🔴 Last seconds!"}</span>
            </div>
          </div>
        )}
        {/* Prompt */}
        <div style={{fontWeight:"900",fontSize:"clamp(17px,3vw,22px)",color:"#1E1B4B",lineHeight:1.5,textAlign:"center",marginBottom: (showSpanish && q?.spanish) || showAnswer ? "10px" : "0"}}>
          {q?.prompt}
        </div>
        {/* Spanish translation for A1/A2 */}
        {showSpanish && q?.spanish && (
          <div style={{textAlign:"center",marginBottom:showAnswer?"10px":"0"}}>
            <span style={{display:"inline-block",background:"#FEF9C3",border:"1px solid #FCD34D",borderRadius:"8px",padding:"4px 12px",fontSize:"13px",fontWeight:"700",color:"#92400E"}}>
              🇪🇸 {q.spanish}
            </span>
          </div>
        )}
        {/* Answer reveal */}
        {showAnswer && (
          <div style={{background:"#F0F9FF",border:"2px solid #0EA5E9",borderRadius:"10px",padding:"10px 14px",marginTop:"4px",textAlign:"center"}}>
            <div style={{fontSize:"11px",fontWeight:"800",color:"#0369A1",marginBottom:"4px",textTransform:"uppercase",letterSpacing:"0.06em"}}>💡 Expected answer</div>
            <div style={{fontWeight:"800",color:"#0C4A6E",fontSize:"16px"}}>{q?.answer}</div>
          </div>
        )}
      </div>

      {/* Controls */}
      {!showAnswer ? (
        <button onClick={revealAnswer} style={{width:"100%",background:"#F8F7FF",color:"#4338CA",border:"2px solid #C4B5FD",borderRadius:"12px",padding:"13px",fontSize:"15px",fontWeight:"800",cursor:"pointer"}}>
          👁️ Reveal answer early
        </button>
      ) : (
        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={confirmPass} style={{flex:1,background:"linear-gradient(135deg,#16A34A,#22C55E)",color:"white",border:"none",borderRadius:"12px",padding:"14px 8px",fontSize:"14px",fontWeight:"900",cursor:"pointer",boxShadow:"0 4px 14px #22C55E40"}}>
            ✅ Answered in time<br/><span style={{fontSize:"12px",opacity:0.85}}>Pass potato →</span>
          </button>
          <button onClick={confirmKeep} style={{flex:1,background:"linear-gradient(135deg,#DC2626,#EF4444)",color:"white",border:"none",borderRadius:"12px",padding:"14px 8px",fontSize:"14px",fontWeight:"900",cursor:"pointer",boxShadow:"0 4px 14px #EF444440"}}>
            ❌ Too slow / wrong<br/><span style={{fontSize:"12px",opacity:0.85}}>Keep potato 🥔</span>
          </button>
        </div>
      )}
    </div>
  );
}



// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function LessonGamesGenerator() {
  const [screen, setScreen] = useState("welcome");
  const [lessonContent, setLessonContent] = useState("");
  const [numTeams, setNumTeams] = useState(2);
  const [teamNames, setTeamNames] = useState(["Team Red","Team Blue","Team Green","Team Yellow"]);
  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionCount, setQuestionCount] = useState(12);
  const [level, setLevel] = useState("B1");
  const [focus, setFocus] = useState("grammar");
  const [topic, setTopic] = useState("ai");
  const [loadingGame, setLoadingGame] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [scores, setScores] = useState({});
  const [confetti, setConfetti] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [minefieldGridData, setMinefieldGridData] = useState(null);
  const appRef = useRef(null);

  // Keep isFullscreen in sync with browser fullscreen state
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      (appRef.current || document.documentElement).requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const updateScore = useCallback((teamId, delta) => {
    setTeams(ts=>ts.map(t=>t.id===teamId?{...t,score:Math.max(0,t.score+delta)}:t));
  }, []);

  const handleSetup = () => {
    if (topic === "ai" && !lessonContent.trim()) { setError("Please paste your lesson content first!"); return; }
    setError("");
    const builtTeams = teamNames.slice(0, numTeams).map((name, i) => ({
      id: i, name, color: TEAM_COLORS[i], score: 200
    }));
    setTeams(builtTeams);
    setScreen("game-select");
  };

  const startGame = async (mode) => {
    setSelectedGame(mode);
    setLoadingGame(true);
    setLoadError("");
    try {
      let qs;
      const lib = topic !== "ai" ? TOPIC_LIBRARY[topic] : null;

      // Minefield is handled entirely differently — it uses a speaking grid, not Q&A
      if (mode.id === "minefield") {
        let grid;
        if (lib && lib.minefieldGrid) {
          grid = lib.minefieldGrid;
        } else {
          grid = await generateMinefieldGrid(lessonContent, level, focus);
        }
        setMinefieldGridData(grid);
        setQuestions([]);
        setScreen("game");
        return;
      }

      if (lib) {
        // Use built-in library — fixed amounts per game type
        // Helper: convert cardTasks to speaking-prompt question format
        const cardTasksAsQuestions = (tasks) =>
          [...tasks].sort(() => Math.random() - 0.5).map(ct => ({
            type: "speaking task",
            question: ct.task,
            answer: "Open — teacher judges",
            hint: null,
            difficulty: "medium"
          }));

        if (mode.id === "auction") {
          qs = [...lib.auctionSentences].sort(() => Math.random() - 0.5);
        } else if (mode.id === "cards") {
          qs = [...lib.cardTasks].sort(() => Math.random() - 0.5);
        } else if (mode.id === "spy") {
          qs = [...lib.spyRounds].sort(() => Math.random() - 0.5);
        } else if (mode.id === "hotseat") {
          const pool = [...lib.hotSeatWords].sort(() => Math.random() - 0.5);
          qs = Array.from({length: 20 * numTeams}, (_, i) => pool[i % pool.length]);
        } else if (mode.id === "hotpotato") {
          qs = [...(lib.hotPotatoPrompts || [])].sort(() => Math.random() - 0.5);
        } else if (mode.id === "battleship") {
          if (focus === "topic" && lib.cardTasks) {
            // Topic focus: all speaking prompts, no grammar Q&A
            qs = cardTasksAsQuestions(lib.cardTasks);
          } else {
            const baseQs = [...lib.questions];
            const speakingQs = lib.cardTasks
              ? lib.cardTasks.map(ct => ({ type:"speaking task", question: ct.task, answer:"Open — teacher judges", hint: null, difficulty:"medium" }))
              : [];
            qs = [...baseQs, ...speakingQs];
          }
        } else {
          // castle, hill, bridge
          if (focus === "topic" && lib.cardTasks) {
            // Topic focus: use card tasks as speaking prompts throughout
            // Bridge also gets them — all segments become speaking tasks
            qs = cardTasksAsQuestions(lib.cardTasks);
          } else {
            const baseQs = [...lib.questions].sort(() => Math.random() - 0.5);
            if (mode.id === "bridge" && lib.cardTasks) {
              const speakingQs = lib.cardTasks.map(ct => ({
                type:"speaking task", question: ct.task,
                answer:"Open — teacher judges", hint: null, difficulty:"medium"
              }));
              qs = [...baseQs, ...speakingQs];
            } else {
              qs = baseQs;
            }
          }
        }
      } else {
        // AI generation
        if (mode.id === "auction") {
          qs = await generateAuctionSentences(lessonContent, questionCount, level, focus);
        } else if (mode.id === "cards") {
          qs = await generateCardTasks(lessonContent, 20, level, focus);
        } else if (mode.id === "hotseat") {
          qs = await generateHotSeatWords(lessonContent, 20 * numTeams, level, focus);
        } else if (mode.id === "hotpotato") {
          qs = await generateHotPotatoPrompts(lessonContent, 30, level, focus);
        } else if (mode.id === "spy") {
          qs = await generateSpyRounds(lessonContent, 4, level, focus);
        } else if (mode.id === "battleship") {
          if (focus === "topic") {
            // Topic: generate open speaking tasks
            const tasks = await generateCardTasks(lessonContent, 25, level, focus);
            qs = tasks.map(ct => ({ type:"speaking task", question: ct.task, answer:"Open — teacher judges", hint: null, difficulty:"medium" }));
          } else {
            const needed = numTeams === 2 ? 25 : 20;
            qs = await generateQuestionsFromContent(lessonContent, needed, level, focus);
          }
        } else {
          // castle, hill, bridge
          if (focus === "topic") {
            const tasks = await generateCardTasks(lessonContent, 20, level, focus);
            qs = tasks.map(ct => ({ type:"speaking task", question: ct.task, answer:"Open — teacher judges", hint: null, difficulty:"medium" }));
          } else {
            qs = await generateQuestionsFromContent(lessonContent, 20, level, focus);
          }
        }
        if (mode.id !== "spy") qs = [...qs].sort(() => Math.random() - 0.5);
      }

      setQuestions(qs);
      setScreen("game");
    } catch (e) {
      setLoadError("Failed to generate questions. Please try again.");
    } finally {
      setLoadingGame(false);
    }
  };

  const handleGameEnd = () => {
    setConfetti(true);
    setScreen("results");
    setTimeout(()=>setConfetti(false),4000);
  };

  const winner = teams.length ? [...teams].sort((a,b)=>b.score-a.score)[0] : null;

  // ── WELCOME ──
  if(screen==="welcome") return (
    <div ref={appRef} style={{minHeight:"100vh",background:"linear-gradient(160deg,#1E1B4B 0%,#312E81 45%,#4C1D95 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 20px 24px",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{maxWidth:"680px",width:"100%",textAlign:"center",flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>

        {/* Title */}
        <div style={{marginBottom:"28px"}}>
          <div style={{fontSize:"64px",marginBottom:"14px",filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.4))"}}>🎮</div>
          <h1 style={{fontSize:"clamp(30px,5.5vw,52px)",fontWeight:"900",color:"white",margin:"0 0 10px",letterSpacing:"-0.02em",lineHeight:1.1,textShadow:"0 2px 24px rgba(0,0,0,0.4)"}}>
            Lesson Games<br/><span style={{color:"#FCD34D"}}>Generator</span>
          </h1>
          <p style={{color:"#C4B5FD",fontSize:"clamp(15px,2.5vw,18px)",margin:"0",lineHeight:1.7,maxWidth:"500px",marginLeft:"auto",marginRight:"auto"}}>
            30+ built-in topics across Grammar, Vocabulary & Speaking.<br/>
            11 competitive game modes. Zero prep. Ready in seconds.
          </p>
        </div>

        {/* Stat pills */}
        <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginBottom:"28px"}}>
          {[
            {icon:"🎯", label:"11 Game Modes"},
            {icon:"📚", label:"30+ Built-in Topics"},
            {icon:"🏆", label:"Up to 4 Teams"},
            {icon:"✨", label:"AI — No Key Needed"},
          ].map(s => (
            <div key={s.label} style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"20px",padding:"8px 16px",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",gap:"7px"}}>
              <span style={{fontSize:"16px"}}>{s.icon}</span>
              <span style={{color:"white",fontWeight:"700",fontSize:"13px"}}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Game mode grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:"8px",marginBottom:"32px"}}>
          {GAME_MODES.map(g=>(
            <div key={g.id} style={{background:"rgba(255,255,255,0.08)",borderRadius:"12px",padding:"10px 12px",border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",gap:"9px",backdropFilter:"blur(6px)"}}>
              <span style={{fontSize:"20px",flexShrink:0}}>{g.icon}</span>
              <span style={{color:"rgba(255,255,255,0.9)",fontWeight:"600",fontSize:"13px",textAlign:"left",lineHeight:1.3}}>{g.name}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div>
          <button onClick={()=>setScreen("setup")} style={{
            background:"linear-gradient(135deg,#F59E0B,#EF4444)",
            color:"white",border:"none",borderRadius:"16px",
            padding:"18px 56px",fontSize:"20px",fontWeight:"900",cursor:"pointer",
            boxShadow:"0 8px 32px rgba(239,68,68,0.45)",
            letterSpacing:"0.01em"
          }}>🚀 Start a Game</button>
          <p style={{color:"rgba(196,181,253,0.6)",fontSize:"12px",marginTop:"14px",marginBottom:"0"}}>
            No account needed · Works on any device · Free to use
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{marginTop:"24px",color:"rgba(196,181,253,0.45)",fontSize:"12px",textAlign:"center",lineHeight:1.8}}>
        Made with ❤️ by <span style={{color:"rgba(196,181,253,0.7)",fontWeight:"700"}}>Teacher Chris</span>
      </div>
    </div>
  );

  // ── SETUP ──
  if(screen==="setup") {
    // Derive filtered topics based on current level + focus selections
    const builtInTopics = TOPIC_OPTIONS.filter(o => o.value !== "ai");
    const filteredTopics = builtInTopics.filter(o =>
      (!level || o.level === level) &&
      (!focus || o.focus === focus)
    );

    const LEVELS_META = [
      {id:"A1",desc:"Beginner",   color:"#22C55E", dark:"#14532D"},
      {id:"A2",desc:"Elementary", color:"#84CC16", dark:"#365314"},
      {id:"B1",desc:"Intermediate",color:"#F59E0B",dark:"#78350F"},
      {id:"B2",desc:"Upper-Int.", color:"#F97316", dark:"#7C2D12"},
      {id:"C1",desc:"Advanced",   color:"#EF4444", dark:"#7F1D1D"},
    ];

    return (
    <div style={{minHeight:"100vh",background:"#F8F7FF",padding:"20px",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{maxWidth:"720px",margin:"0 auto"}}>
        <button onClick={()=>setScreen("welcome")} style={{background:"none",border:"2px solid #6366F1",color:"#6366F1",borderRadius:"10px",padding:"8px 16px",cursor:"pointer",fontWeight:"700",marginBottom:"20px"}}>← Back</button>
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <h2 style={{fontSize:"32px",fontWeight:"900",color:"#1E1B4B",margin:0}}>⚙️ Game Setup</h2>
          <p style={{color:"#6B7280",marginTop:"8px"}}>Set up your class, then pick a topic and game</p>
        </div>

        {/* ── STEP 1: LEVEL ── */}
        <div style={{background:"white",border:"2px solid #E0E7FF",borderRadius:"16px",padding:"20px",marginBottom:"16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}>
            <div style={{background:"#6366F1",color:"white",borderRadius:"50%",width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"900",fontSize:"14px",flexShrink:0}}>1</div>
            <div>
              <div style={{fontWeight:"800",color:"#1E1B4B",fontSize:"16px"}}>What level is your class?</div>
              <div style={{color:"#6B7280",fontSize:"12px",marginTop:"2px"}}>Filters the topic list below</div>
            </div>
          </div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {LEVELS_META.map(l => (
              <button key={l.id} onClick={() => {
                setLevel(l.id);
                // If current topic doesn't match new level, reset it
                const cur = TOPIC_OPTIONS.find(o => o.value === topic);
                if (cur && cur.level && cur.level !== l.id) setTopic("ai");
              }} style={{
                background: level===l.id ? l.color : "white",
                color: level===l.id ? "white" : "#374151",
                border: `3px solid ${level===l.id ? l.color : "#D1D5DB"}`,
                borderRadius:"12px", padding:"10px 16px", cursor:"pointer",
                textAlign:"center", minWidth:"72px", transition:"all 0.15s",
                fontWeight: level===l.id ? "900" : "700"
              }}>
                <div style={{fontSize:"18px",fontWeight:"900"}}>{l.id}</div>
                <div style={{fontSize:"11px",opacity:0.85,marginTop:"2px"}}>{l.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── STEP 2: FOCUS ── */}
        <div style={{background:"white",border:"2px solid #E0E7FF",borderRadius:"16px",padding:"20px",marginBottom:"16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}>
            <div style={{background:"#6366F1",color:"white",borderRadius:"50%",width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"900",fontSize:"14px",flexShrink:0}}>2</div>
            <div>
              <div style={{fontWeight:"800",color:"#1E1B4B",fontSize:"16px"}}>Grammar, Vocabulary, or Topics?</div>
              <div style={{color:"#6B7280",fontSize:"12px",marginTop:"2px"}}>Filters the topic list below</div>
            </div>
          </div>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            {[
              {id:"grammar",   icon:"📐", label:"Grammar",    desc:"Structures & rules"},
              {id:"vocabulary",icon:"📖", label:"Vocabulary", desc:"Words in context"},
              {id:"topic",     icon:"💬", label:"Topics",     desc:"Speaking about real themes"},
            ].map(f => (
              <button key={f.id} onClick={() => {
                setFocus(f.id);
                const cur = TOPIC_OPTIONS.find(o => o.value === topic);
                if (cur && cur.focus && cur.focus !== f.id) setTopic("ai");
              }} style={{
                flex:1, minWidth:"120px", background: focus===f.id ? "#6366F1" : "white",
                color: focus===f.id ? "white" : "#374151",
                border: `3px solid ${focus===f.id ? "#6366F1" : "#D1D5DB"}`,
                borderRadius:"12px", padding:"14px 12px", cursor:"pointer",
                textAlign:"left", transition:"all 0.15s"
              }}>
                <div style={{fontWeight:"800",fontSize:"16px"}}>{f.icon} {f.label}</div>
                <div style={{fontSize:"12px",opacity:0.75,marginTop:"3px"}}>{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── STEP 3: TOPIC ── */}
        <div style={{background:"white",border:"2px solid #E0E7FF",borderRadius:"16px",padding:"20px",marginBottom:"16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}>
            <div style={{background:"#6366F1",color:"white",borderRadius:"50%",width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"900",fontSize:"14px",flexShrink:0}}>3</div>
            <div>
              <div style={{fontWeight:"800",color:"#1E1B4B",fontSize:"16px"}}>Choose a topic</div>
              <div style={{color:"#6B7280",fontSize:"12px",marginTop:"2px"}}>
                {filteredTopics.length > 0
                  ? `${filteredTopics.length} topic${filteredTopics.length!==1?"s":""} available`
                  : "No built-in topics match — use AI or change filters above"}
              </div>
            </div>
          </div>

          {/* Built-in topic buttons */}
          {filteredTopics.length > 0 && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:"8px",marginBottom:"12px"}}>
              {filteredTopics.map(o => {
                const isSelected = topic === o.value;
                const levelColor = LEVELS_META.find(l => l.id === o.level)?.color || "#6366F1";
                return (
                  <button key={o.value} onClick={() => {
                    setTopic(o.value);
                    if (o.level) setLevel(o.level);
                    if (o.focus) setFocus(o.focus);
                  }} style={{
                    background: isSelected ? levelColor : "#F8F7FF",
                    color: isSelected ? "white" : "#1E1B4B",
                    border: `2px solid ${isSelected ? levelColor : "#E0E7FF"}`,
                    borderRadius:"10px", padding:"10px 14px",
                    cursor:"pointer", textAlign:"left", transition:"all 0.15s",
                    fontWeight: isSelected ? "800" : "700", fontSize:"13px",
                    lineHeight:1.4
                  }}>
                    {o.focus === "grammar" ? "📐" : o.focus === "vocabulary" ? "📖" : "💬"} {o.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Divider */}
          <div style={{display:"flex",alignItems:"center",gap:"10px",margin:"12px 0"}}>
            <div style={{flex:1,height:"1px",background:"#E0E7FF"}}/>
            <span style={{fontSize:"12px",color:"#9CA3AF",fontWeight:"600"}}>or</span>
            <div style={{flex:1,height:"1px",background:"#E0E7FF"}}/>
          </div>

          {/* AI option */}
          <button onClick={() => setTopic("ai")} style={{
            width:"100%", background: topic==="ai" ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "white",
            color: topic==="ai" ? "white" : "#374151",
            border: `2px solid ${topic==="ai" ? "#6366F1" : "#D1D5DB"}`,
            borderRadius:"10px", padding:"12px 16px",
            cursor:"pointer", textAlign:"left", transition:"all 0.15s",
            fontWeight:"800", fontSize:"14px"
          }}>
            ✨ AI Generated — paste your own lesson content
          </button>

          {/* AI inputs */}
          {topic === "ai" && (
            <div style={{marginTop:"14px"}}>
              <div style={{background:"#EEF2FF",border:"1px solid #C4B5FD",borderRadius:"10px",padding:"10px 14px",marginBottom:"10px",fontSize:"13px",color:"#4338CA",fontWeight:"600"}}>
                ✨ Powered by Claude AI — no API key needed
              </div>
              <textarea
                value={lessonContent}
                onChange={e=>setLessonContent(e.target.value)}
                placeholder="Paste your lesson content here — grammar rules, vocab lists, example sentences…"
                style={{
                  width:"100%",minHeight:"140px",padding:"14px",fontSize:"14px",
                  border:"2px solid #C4B5FD",borderRadius:"12px",outline:"none",
                  resize:"vertical",boxSizing:"border-box",fontFamily:"inherit",
                  background:"white",color:"#1E1B4B",lineHeight:1.6
                }}
              />
            </div>
          )}
        </div>

        {/* ── STEP 4: TEAMS ── */}
        <div style={{background:"white",border:"2px solid #E0E7FF",borderRadius:"16px",padding:"20px",marginBottom:"16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}>
            <div style={{background:"#6366F1",color:"white",borderRadius:"50%",width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"900",fontSize:"14px",flexShrink:0}}>4</div>
            <div style={{fontWeight:"800",color:"#1E1B4B",fontSize:"16px"}}>How many teams?</div>
          </div>
          <div style={{display:"flex",gap:"10px",marginBottom:"14px"}}>
            {[2,3,4].map(n=>(
              <button key={n} onClick={()=>setNumTeams(n)} style={{
                background:numTeams===n?"#6366F1":"white",
                color:numTeams===n?"white":"#374151",
                border:`3px solid ${numTeams===n?"#6366F1":"#D1D5DB"}`,
                borderRadius:"12px",padding:"10px 24px",fontSize:"18px",fontWeight:"800",cursor:"pointer"
              }}>{n}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"10px"}}>
            {Array.from({length:numTeams}).map((_,i)=>(
              <input key={i} value={teamNames[i]} onChange={e=>{const n=[...teamNames];n[i]=e.target.value;setTeamNames(n);}} style={{
                padding:"10px 14px",fontSize:"15px",fontWeight:"700",
                border:`3px solid ${TEAM_COLORS[i].bg}`,borderRadius:"12px",
                color:TEAM_COLORS[i].dark,background:TEAM_COLORS[i].light,outline:"none",boxSizing:"border-box"
              }}/>
            ))}
          </div>
        </div>

        {error && <div style={{background:"#FEE2E2",border:"2px solid #EF4444",borderRadius:"12px",padding:"12px",color:"#991B1B",fontWeight:"700",marginBottom:"16px"}}>{error}</div>}

        <button onClick={handleSetup} style={{
          width:"100%",
          background:"linear-gradient(135deg,#6366F1,#8B5CF6)",
          color:"white",border:"none",borderRadius:"16px",padding:"18px",
          fontSize:"20px",fontWeight:"900",cursor:"pointer",
          boxShadow:"0 8px 24px rgba(99,102,241,0.4)"
        }}>
          🎮 Choose a Game!
        </button>
      </div>
    </div>
    );
  }

  // ── GAME SELECT ──
  if(screen==="game-select") return (
    <div style={{minHeight:"100vh",background:"#F8F7FF",padding:"20px",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{maxWidth:"760px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"24px"}}>
          <h2 style={{fontSize:"28px",fontWeight:"900",color:"#1E1B4B",margin:"0 0 8px"}}>Choose Your Game</h2>
          <div style={{display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap",marginBottom:"10px"}}>
            <span style={{background:"#EEF2FF",border:"2px solid #6366F1",borderRadius:"20px",padding:"4px 14px",fontWeight:"700",fontSize:"13px",color:"#4338CA"}}>
              {topic === "ai" ? `✨ AI · ${level || "any level"}` : `${TOPIC_OPTIONS.find(o=>o.value===topic)?.level || ""} · ${TOPIC_OPTIONS.find(o=>o.value===topic)?.label || topic}`}
            </span>
            <span style={{background:"#F0FDF4",border:"2px solid #22C55E",borderRadius:"20px",padding:"4px 14px",fontWeight:"700",fontSize:"13px",color:"#15803D"}}>
              Focus: {focus === "grammar" ? "📐 Grammar" : focus === "vocabulary" ? "📖 Vocabulary" : "💬 Topics"}
            </span>
            <button onClick={()=>setScreen("setup")} style={{background:"none",border:"2px solid #D1D5DB",borderRadius:"20px",padding:"4px 14px",fontWeight:"700",fontSize:"13px",color:"#6B7280",cursor:"pointer"}}>
              ✏️ Change
            </button>
          </div>
          <p style={{color:"#6B7280",fontSize:"13px",marginBottom:"16px"}}>Questions generate fresh each time you start a game ✨</p>
          <ScoreBoard teams={teams} />
        </div>

        {/* Question count — only relevant for AI generation */}
        {topic === "ai" && (
          <div style={{background:"white",border:"2px solid #E0E7FF",borderRadius:"16px",padding:"18px 22px",marginBottom:"20px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
              <div>
                <div style={{fontWeight:"800",fontSize:"15px",color:"#1E1B4B"}}>📋 Questions to generate</div>
                <div style={{fontSize:"12px",color:"#6B7280",marginTop:"2px"}}>Only applies to AI-generated content</div>
              </div>
              <div style={{background:"#6366F1",color:"white",borderRadius:"10px",padding:"6px 16px",fontWeight:"900",fontSize:"20px",minWidth:"52px",textAlign:"center"}}>
                {questionCount}
              </div>
            </div>
            <input
              type="range" min="5" max="20" step="1" value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              style={{width:"100%",accentColor:"#6366F1"}}
            />
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",color:"#9CA3AF",marginTop:"4px",fontWeight:"600"}}>
              <span>5 — Quick</span>
              <span>12 — Standard</span>
              <span>20 — Full class</span>
            </div>
          </div>
        )}

        {loadError && (
          <div style={{background:"#FEE2E2",border:"2px solid #EF4444",borderRadius:"12px",padding:"12px",color:"#991B1B",fontWeight:"700",marginBottom:"16px",textAlign:"center"}}>
            {loadError}
          </div>
        )}

        {/* Game mode cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"14px"}}>
          {GAME_MODES.map(g=>(
            <div key={g.id} onClick={()=>!loadingGame&&startGame(g)} style={{
              background:"white",border:`3px solid ${g.color}`,borderRadius:"18px",
              padding:"20px",cursor:loadingGame?"not-allowed":"pointer",transition:"all 0.2s",
              boxShadow:"0 4px 16px rgba(0,0,0,0.08)",
              opacity: loadingGame&&selectedGame?.id!==g.id ? 0.5 : 1
            }}>
              <div style={{fontSize:"40px",marginBottom:"10px"}}>{g.icon}</div>
              <div style={{fontWeight:"900",fontSize:"17px",color:"#1E1B4B",marginBottom:"4px"}}>{g.name}</div>
              <div style={{display:"inline-block",background:`${g.color}18`,color:g.color,borderRadius:"6px",padding:"2px 8px",fontSize:"11px",fontWeight:"700",marginBottom:"7px",letterSpacing:"0.02em"}}>
                {g.tag}
              </div>
              <div style={{fontSize:"13px",color:"#6B7280",lineHeight:1.4}}>{g.desc}</div>
              {loadingGame && selectedGame?.id===g.id && (
                <div style={{marginTop:"10px",fontWeight:"700",fontSize:"13px",color:g.color}}>
                  ✨ Setting up game…
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── GAME ──
  if(screen==="game" && selectedGame) {
    const GameComponent = {
      battleship: BattleshipGame,
      cards: CardShuffleGame, castle: CastleGame, hill: KingOfHillGame,
      hotseat: HotSeatGame, spy: SpyAmongUsGame, bridge: BridgeBuilderGame,
      hotpotato: HotPotatoGame
    }[selectedGame.id];

    return (
      <div ref={appRef} style={{minHeight:"100vh",background:"#0F0A2E",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
        <div style={{background:"linear-gradient(90deg,#6366F1,#8B5CF6)",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <span style={{fontSize:"28px"}}>{selectedGame.icon}</span>
            <span style={{color:"white",fontWeight:"900",fontSize:"20px"}}>{selectedGame.name}</span>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <button onClick={toggleFullscreen} style={{background:"rgba(255,255,255,0.15)",color:"white",border:"none",borderRadius:"8px",padding:"6px 12px",cursor:"pointer",fontWeight:"700",fontSize:"16px"}} title={isFullscreen?"Exit fullscreen":"Enter fullscreen"}>
              {isFullscreen ? "⛶" : "⛶"}
              <span style={{fontSize:"13px",marginLeft:"6px"}}>{isFullscreen ? "Exit" : "Fullscreen"}</span>
            </button>
            <button onClick={()=>setScreen("game-select")} style={{background:"rgba(255,255,255,0.15)",color:"white",border:"none",borderRadius:"8px",padding:"6px 12px",cursor:"pointer",fontWeight:"700"}}>🔄 Change Game</button>
          </div>
        </div>
        <div style={{padding:"16px",maxWidth:"900px",margin:"0 auto"}}>
          <ScoreBoard teams={teams}/>
          <div style={{background:"white",borderRadius:"20px",padding:"20px",marginTop:"16px",boxShadow:"0 8px 40px rgba(0,0,0,0.3)"}}>
            {selectedGame.id === "auction" ? (
              <AuctionGame
                questions={questions}
                teams={teams}
                onUpdateScore={updateScore}
                onEnd={handleGameEnd}
              />
            ) : selectedGame.id === "minefield" ? (
              <MinefieldGame
                gridData={minefieldGridData}
                teams={teams}
                onUpdateScore={updateScore}
                onEnd={handleGameEnd}
              />
            ) : selectedGame.id === "hotseat" ? (
              <HotSeatGame
                questions={questions}
                teams={teams}
                onUpdateScore={updateScore}
                onEnd={handleGameEnd}
              />
            ) : selectedGame.id === "spy" ? (
              <SpyAmongUsGame
                questions={questions}
                teams={teams}
                onUpdateScore={updateScore}
                onEnd={handleGameEnd}
              />
            ) : (
              <GameComponent
                questions={questions}
                teams={teams}
                onUpdateScore={updateScore}
                onEnd={handleGameEnd}
                lessonContent={lessonContent}
                level={level}
              />
            )}
          </div>
          <div style={{textAlign:"center",marginTop:"12px"}}>
            <button onClick={handleGameEnd} style={{background:"rgba(255,255,255,0.1)",color:"white",border:"2px solid rgba(255,255,255,0.3)",borderRadius:"10px",padding:"8px 20px",cursor:"pointer",fontWeight:"700"}}>
              🏁 End Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if(screen==="results") {
    const sorted = [...teams].sort((a,b)=>b.score-a.score);
    return (
      <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1E1B4B,#312E81)",padding:"20px",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
        <Confetti active={confetti}/>
        <div style={{maxWidth:"600px",margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:"80px",margin:"20px 0"}}>🏆</div>
          <h1 style={{color:"white",fontSize:"clamp(24px,5vw,40px)",fontWeight:"900",margin:"0 0 8px"}}>Game Over!</h1>
          <p style={{color:"#C4B5FD",fontSize:"18px",marginBottom:"28px"}}>{winner?.name} wins! 🎉</p>
          <div style={{background:"rgba(255,255,255,0.08)",borderRadius:"20px",padding:"24px",backdropFilter:"blur(10px)",marginBottom:"24px"}}>
            {sorted.map((t,i)=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:"16px",padding:"12px 0",borderBottom:i<sorted.length-1?"1px solid rgba(255,255,255,0.1)":"none"}}>
                <div style={{fontSize:"32px"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":"4️⃣"}</div>
                <div style={{flex:1,textAlign:"left"}}>
                  <div style={{fontWeight:"900",color:"white",fontSize:"20px"}}>{t.name}</div>
                </div>
                <div style={{fontWeight:"900",fontSize:"28px",color:t.color.bg}}>{t.score}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>{setScreen("game-select");setTeams(t=>t.map(tm=>({...tm,score:200})));}} style={{
              background:"linear-gradient(135deg,#22C55E,#16A34A)",color:"white",border:"none",
              borderRadius:"14px",padding:"14px 28px",fontSize:"17px",fontWeight:"800",cursor:"pointer"
            }}>🎮 Play Again</button>
            <button onClick={()=>setScreen("setup")} style={{
              background:"linear-gradient(135deg,#6366F1,#8B5CF6)",color:"white",border:"none",
              borderRadius:"14px",padding:"14px 28px",fontSize:"17px",fontWeight:"800",cursor:"pointer"
            }}>📚 New Lesson</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
