// Short, teach-it-in-ten-minutes grammar explanations — modelled on the concise style of sites
// like test-english.com. Deliberately NOT exhaustive: each lesson covers the rules and traps the
// games themselves actually test (see topics.ts), so a teacher can hand this to a student before
// or after playing and it lines up with what they'll be asked to do. Keyed by the same topic
// `value` used in TOPIC_OPTIONS/TOPIC_LIBRARY, so a lesson is trivial to look up from anywhere a
// topic id is already in scope.
//
// Each section separates the RULE (body, short prose/bullets) from labelled EXAMPLE sentences
// (examples, rendered in their own highlighted box) — the key form in each example is wrapped in
// **double asterisks**, parsed as bold by LearnScreen.
export type LessonSection = {
  heading: string;
  body: string[];
  examples?: string[];
};

export type Lesson = {
  title: string;
  intro: string;
  sections: LessonSection[];
  commonMistakes: string[];
};

export const LESSONS: Record<string, Lesson> = {
  past_simple: {
    title: "Past Simple",
    intro: "Use the past simple for actions and situations that are completely finished — usually with a time word like yesterday, last week, or in 2019.",
    sections: [
      {
        heading: "Form",
        body: [
          "Regular verbs: add -ed to the base form.",
          "Negative: didn't + base verb.",
          "Question: Did + subject + base verb?",
          "Many common verbs are irregular (go → went, eat → ate) — see the Irregular Verbs lesson.",
        ],
        examples: [
          "She **didn't call**.",
          "They **didn't arrive**.",
          "**Did** you call her?",
          "**Did** they arrive on time?",
        ],
      },
      {
        heading: "Spelling of regular -ed forms",
        body: [
          "Most verbs: just add -ed.",
          "Verb ends in -e: add -d only.",
          "Consonant + -y: change y to i, then add -ed.",
          "Short verb ending consonant-vowel-consonant: double the last letter.",
        ],
        examples: [
          "walk → **walked**, play → **played**",
          "live → **lived**, dance → **danced**",
          "study → **studied**, carry → **carried**",
          "stop → **stopped**, plan → **planned**",
        ],
      },
      {
        heading: "Use",
        body: [
          "A finished action at a specific time.",
          "A sequence of finished past events.",
          "A past habit or state that isn't true anymore.",
        ],
        examples: [
          "I **visited** my grandmother last weekend.",
          "We **watched** a film on Saturday.",
          "He **woke up**, **got dressed**, and **left**.",
          "I **lived** in Rome for two years.",
          "She **played** tennis every week as a child.",
        ],
      },
    ],
    commonMistakes: [
      "❌ She goed to school. → ✅ She went to school. (irregular verb)",
      "❌ Did you called her? → ✅ Did you call her? (base verb after 'did', no -ed)",
      "❌ I didn't went. → ✅ I didn't go. (base verb after 'didn't')",
      "❌ He studyed all night. → ✅ He studied all night. (y → i before -ed)",
    ],
  },

  present_simple_vs_continuous: {
    title: "Present Simple vs Continuous",
    intro: "Present simple describes routines and facts; present continuous describes what's happening right now or around this period of time.",
    sections: [
      {
        heading: "Form",
        body: [
          "Present simple: I/you/we/they + base verb; he/she/it + verb-s.",
          "Spelling of -s: most verbs add -s; -ch/-sh/-ss/-x/-o add -es; consonant + -y changes to -ies.",
          "Present continuous: am/is/are + verb-ing.",
          "Negative/question: don't/doesn't + base verb; am/is/are + not + verb-ing.",
        ],
        examples: [
          "She **works**. They **work**.",
          "watch → **watches**, go → **goes**, study → **studies**",
          "I'm **working**. She's **working**. They're **working**.",
        ],
      },
      {
        heading: "Use present simple for…",
        body: [
          "Routines and habits.",
          "Facts and general truths.",
          "Schedules and timetables (even for future events).",
          "Frequency adverbs (always, usually, often, sometimes, never) go before the main verb.",
        ],
        examples: [
          "I **get up** at 7am every day.",
          "She **goes** to the gym on Mondays.",
          "Water **boils** at 100°C.",
          "The sun **rises** in the east.",
          "The train **leaves** at 6pm.",
          "I **always check** my email in the morning.",
        ],
      },
      {
        heading: "Use present continuous for…",
        body: [
          "Something happening right now.",
          "A temporary situation around now, not necessarily this exact second.",
          "A fixed future arrangement, already planned.",
          "A changing or developing situation.",
        ],
        examples: [
          "She's **reading** a book (at this moment).",
          "I'm **studying** French this year.",
          "We're **meeting** him on Friday.",
          "The climate **is getting** warmer.",
        ],
      },
      {
        heading: "Watch out for",
        body: ["Stative verbs (about thoughts, feelings, and senses) aren't usually continuous."],
        examples: ["I **want**, I **know**, I **like**, I **understand**, I **believe**, I **own** (not 'I am wanting')."],
      },
    ],
    commonMistakes: [
      "❌ She work every day. → ✅ She works every day. (-s for he/she/it)",
      "❌ I am understanding it now. → ✅ I understand it now. ('understand' is stative)",
      "❌ Look! She swims. → ✅ Look! She's swimming. (happening right now = continuous)",
      "❌ He go to work by bus. → ✅ He goes to work by bus. (-es after a consonant + o)",
    ],
  },

  irregular_verbs: {
    title: "Irregular Verbs",
    intro: "Many of the most common English verbs don't follow the regular -ed pattern in the past. There's no shortcut — they just have to be learned, usually in small groups by pattern.",
    sections: [
      {
        heading: "Some very common ones",
        body: ["Base — past simple — past participle:"],
        examples: [
          "go → went → gone",
          "eat → ate → eaten",
          "see → saw → seen",
          "buy → bought → bought",
          "take → took → taken",
          "write → wrote → written",
          "break → broke → broken",
          "come → came → come",
          "give → gave → given",
          "find → found → found",
          "know → knew → known",
          "think → thought → thought",
        ],
      },
      {
        heading: "Patterns that make them easier",
        body: [
          "All three forms the same.",
          "Past simple and past participle the same.",
          "All three forms different.",
        ],
        examples: [
          "put → put → put, cut → cut → cut, cost → cost → cost",
          "buy → bought → bought, find → found → found, think → thought → thought",
          "go → went → gone, see → saw → seen, take → took → taken",
        ],
      },
      {
        heading: "Where you'll meet them",
        body: [
          "Past simple uses the middle form.",
          "Present perfect uses the last form, with have/has/had.",
        ],
        examples: [
          "Yesterday I **went** to the shops (not 'goed').",
          "I have never **seen** that film (not 'seed' or 'saw').",
        ],
      },
    ],
    commonMistakes: [
      "❌ She buyed a new phone. → ✅ She bought a new phone.",
      "❌ I have went there before. → ✅ I have been there before. (perfect uses the 3rd form)",
      "❌ He has ate already. → ✅ He has eaten already.",
      "❌ They have took the bus. → ✅ They have taken the bus. (3rd form after have/has)",
    ],
  },

  future_will_going_to: {
    title: "Future: Will and Going To",
    intro: "Both talk about the future, but they answer different questions: was this decided just now, or was it planned already?",
    sections: [
      {
        heading: "Form",
        body: [
          "will + base verb (short forms: 'll, won't)",
          "am/is/are + going to + base verb",
        ],
        examples: [
          "I**'ll help** you. / She **won't come**.",
          "I**'m going to help** you. / They **aren't going to come**.",
        ],
      },
      {
        heading: "Use 'will' for…",
        body: [
          "A decision made at the moment of speaking.",
          "A prediction with no real evidence, just an opinion.",
          "Promises and offers.",
        ],
        examples: [
          "The phone's ringing — I**'ll get** it!",
          "I think it**'ll be** sunny tomorrow.",
          "I**'ll carry** that for you.",
          "I promise I**'ll call** you.",
        ],
      },
      {
        heading: "Use 'going to' for…",
        body: [
          "A plan or intention decided before now.",
          "A prediction based on evidence you can see right now.",
          "Something already arranged, even without visible evidence.",
        ],
        examples: [
          "I**'m going to visit** my parents this weekend.",
          "Look at those clouds — it**'s going to rain**.",
          "She**'s going to start** a new job next month.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I go to call you tomorrow. → ✅ I'm going to call you tomorrow. (need 'am/is/are')",
      "❌ Look at the sky, it will rain. → ✅ Look at the sky, it's going to rain. (visible evidence now)",
      "❌ I'm going to help you (deciding right now) → ✅ I'll help you (spontaneous decisions use 'will')",
      "❌ She wills come later. → ✅ She'll come later. (modal 'will' never takes -s)",
    ],
  },

  zero_conditional: {
    title: "Zero Conditional",
    intro: "Use the zero conditional for things that are always true — general facts, scientific truths, and things that always happen under certain conditions.",
    sections: [
      {
        heading: "Form",
        body: [
          "If + present simple, + present simple.",
          "Either clause can come first, with no change in meaning.",
          "'When' can replace 'if' with no change in meaning here (unlike other conditionals).",
        ],
        examples: [
          "**If** you heat ice, it **melts**.",
          "Ice **melts** if you heat it.",
          "**When** you heat ice, it melts.",
        ],
      },
      {
        heading: "Use",
        body: [
          "Scientific or general facts.",
          "Things that are always/generally true.",
          "Instructions and rules.",
        ],
        examples: [
          "If you mix red and blue, you **get** purple.",
          "Plants **die** if they don't get water.",
          "If it rains, the streets **get** wet.",
          "If the alarm goes off, everyone **leaves** the building.",
        ],
      },
      {
        heading: "Zero vs first conditional",
        body: ["Zero conditional = always true, no exceptions (a rule or fact). First conditional = one likely situation in the future, with a result using 'will'."],
        examples: [
          "If you heat water to 100°C, it **boils** (always true).",
          "If you heat the soup, I**'ll eat** it (one specific future situation).",
        ],
      },
    ],
    commonMistakes: [
      "❌ If you heat ice, it will melt. → ✅ If you heat ice, it melts. (no 'will' — this isn't first conditional)",
      "❌ If it rains, the ground get wet. → ✅ If it rains, the ground gets wet. (present simple in both clauses)",
      "❌ If you don't water plants, they died. → ✅ If you don't water plants, they die. (present simple, not past)",
    ],
  },

  first_conditional: {
    title: "First Conditional",
    intro: "Use the first conditional for real, likely situations in the future — if this happens, that will be the result.",
    sections: [
      {
        heading: "Form",
        body: [
          "If + present simple, + will + base verb.",
          "The if-clause NEVER uses 'will' — that's the #1 rule to remember.",
          "The main clause can also use can, might, or should instead of 'will'.",
        ],
        examples: [
          "**If** it rains, we**'ll cancel** the trip.",
          "If it rains, we **might stay** home.",
          "If you're tired, you **should rest**.",
        ],
      },
      {
        heading: "Other words instead of 'if'",
        body: [
          "unless = if...not",
          "as long as / provided that = only if",
        ],
        examples: [
          "**Unless** you hurry, you'll be late. = If you don't hurry, you'll be late.",
          "You can go out **as long as** you finish your homework.",
        ],
      },
      {
        heading: "Use",
        body: [
          "A real possibility with a likely result.",
          "Warnings.",
          "Promises and offers.",
        ],
        examples: [
          "If she **studies** hard, she**'ll pass** the exam.",
          "If you don't leave now, you**'ll miss** the train.",
          "If you help me move, I**'ll buy** you dinner.",
        ],
      },
    ],
    commonMistakes: [
      "❌ If you will study, you'll pass. → ✅ If you study, you'll pass. (never 'will' in the if-clause)",
      "❌ Unless you don't hurry... → ✅ Unless you hurry... ('unless' already means 'if not')",
      "❌ If it rains, we cancel the trip. → ✅ If it rains, we'll cancel the trip. (main clause needs 'will')",
      "❌ If he trains harder, he will wins. → ✅ If he trains harder, he will win. (bare infinitive after 'will')",
    ],
  },

  making_questions: {
    title: "Making Questions",
    intro: "Most English questions need an auxiliary verb (do/does/did/have/etc.) before the subject — the trickiest part is remembering it, and not adding an extra one.",
    sections: [
      {
        heading: "Yes/No questions",
        body: [
          "Present: Do/Does + subject + base verb?",
          "Past: Did + subject + base verb?",
        ],
        examples: [
          "**Does** she live near the school?",
          "**Do** you understand?",
          "**Did** you go last weekend?",
        ],
      },
      {
        heading: "Wh- questions",
        body: [
          "Wh-word + do/does/did + subject + base verb?",
          "What vs Which: 'what' is an open choice; 'which' is a limited choice.",
          "How many + countable noun; how much for uncountable/price; how often for frequency; how long for duration.",
        ],
        examples: [
          "**Where does** she work?",
          "**What did** you do?",
          "What's your favourite colour? (open)",
          "**Which** one do you want — red or blue? (limited)",
          "**How many** brothers do you have?",
          "**How much** does it cost?",
        ],
      },
      {
        heading: "Subject vs object questions",
        body: [
          "If the question word IS the subject, don't add do/does/did — just use the normal word order.",
          "If the question word is the OBJECT, you need the auxiliary.",
        ],
        examples: [
          "**Who called** you?",
          "**What happened**?",
          "**Who did** you call?",
          "**What did** you see?",
        ],
      },
    ],
    commonMistakes: [
      "❌ Where does she works? → ✅ Where does she work? (base verb after 'does')",
      "❌ What you did yesterday? → ✅ What did you do yesterday?",
      "❌ Who did called you? → ✅ Who called you? ('who' as subject needs no 'did')",
      "❌ How long does it takes? → ✅ How long does it take? (base verb after 'does')",
    ],
  },

  present_perfect_vs_past_simple: {
    title: "Present Perfect vs Past Simple",
    intro: "Past simple is for a finished action at a specific, named time. Present perfect is for experiences or situations connected to now, with no exact time given.",
    sections: [
      {
        heading: "Form",
        body: [
          "Past simple: subject + past simple verb.",
          "Present perfect: have/has + past participle.",
        ],
        examples: [
          "I **visited**, she **went**, they **saw**.",
          "I **have visited**, she **has gone**, they **have seen**.",
        ],
      },
      {
        heading: "Use past simple when there's a specific time",
        body: ["Signal words: yesterday, last night, last week, in 2022, when...?"],
        examples: [
          "I **called** my sister yesterday evening.",
          "**When did** you start learning English?",
        ],
      },
      {
        heading: "Use present perfect when there's no specific time",
        body: [
          "ever, never, just, already, yet — for experiences and recent/incomplete actions.",
          "since + a starting point, for + a length of time — for something that started in the past and continues now.",
          "how long — asking about an ongoing situation.",
        ],
        examples: [
          "**Have** you **ever been** to Spain?",
          "She **hasn't done** her homework **yet**.",
          "I**'ve just finished**.",
          "I**'ve lived** here **since** 2019.",
          "I**'ve known** him **for** ten years.",
          "**How long have** you **known** her?",
        ],
      },
    ],
    commonMistakes: [
      "❌ I have seen him yesterday. → ✅ I saw him yesterday. ('yesterday' = specific time → past simple)",
      "❌ Did you ever been to Spain? → ✅ Have you ever been to Spain? ('ever' → present perfect)",
      "❌ I lived here since 2015. → ✅ I have lived here since 2015. ('since' → present perfect)",
      "❌ I have bought this bag in 2022. → ✅ I bought this bag in 2022. (a specific year → past simple)",
    ],
  },

  comparatives_superlatives: {
    title: "Comparatives & Superlatives",
    intro: "Comparatives compare two things; superlatives pick out the number one in a group. The spelling rule depends on how long the adjective is.",
    sections: [
      {
        heading: "Short adjectives (1 syllable, or 2 ending in -y)",
        body: [
          "Comparative: adjective + -er + than.",
          "Superlative: the + adjective + -est.",
          "Spelling: y → i; double the final consonant after a short vowel; just add -r/-st after silent -e.",
        ],
        examples: [
          "tall → **taller** than",
          "tall → **the tallest**",
          "happy → **happier** / **happiest**",
          "big → **bigger** / **biggest**",
          "nice → **nicer** / **nicest**",
        ],
      },
      {
        heading: "Long adjectives (2+ syllables)",
        body: [
          "Comparative: more + adjective + than.",
          "Superlative: the most + adjective.",
          "Adverbs work the same way as long adjectives.",
        ],
        examples: [
          "**more interesting** than",
          "**the most expensive**",
          "**more clearly**, **more carefully**",
        ],
      },
      {
        heading: "Irregular forms",
        body: ["A handful of common adjectives don't follow either pattern."],
        examples: [
          "good → **better** → **the best**",
          "bad → **worse** → **the worst**",
          "far → **further/farther** → **the furthest/farthest**",
        ],
      },
    ],
    commonMistakes: [
      "❌ more tall → ✅ taller (short adjectives use -er, not 'more')",
      "❌ the most old → ✅ the oldest",
      "❌ gooder / more good → ✅ better (irregular)",
      "❌ She is more young than her sister. → ✅ She is younger than her sister. (short adjective: add -er)",
    ],
  },

  too_much_many: {
    title: "Too vs Too much / Too many",
    intro: "All three mean 'more than is good or wanted' — which one you use depends on what comes after it.",
    sections: [
      {
        heading: "The three-way rule",
        body: [
          "too + adjective/adverb (no noun)",
          "too much + uncountable noun",
          "too many + countable plural noun",
        ],
        examples: [
          "It's **too hot**. He drives **too fast**. This shirt is **too small**.",
          "**too much sugar**, **too much traffic**, **too much homework**",
          "**too many people**, **too many mistakes**, **too many cars**",
        ],
      },
      {
        heading: "Quick check",
        body: ["Can you count it one by one? Use 'too many'. Can't count it? Use 'too much'. No noun at all, just an adjective or adverb? Use 'too' alone."],
      },
    ],
    commonMistakes: [
      "❌ It's too much hot. → ✅ It's too hot. (adjective — no noun, so just 'too')",
      "❌ There's too many sugar. → ✅ There's too much sugar. ('sugar' is uncountable)",
      "❌ There are too much people. → ✅ There are too many people. ('people' is countable plural)",
      "❌ She talks too much quietly. → ✅ She talks too quietly. (adverb — no noun, so just 'too')",
    ],
  },

  modals_obligation: {
    title: "Modals of Obligation",
    intro: "Must, have to, mustn't, and don't have to all sound similar but mean quite different things — mixing up 'mustn't' and 'don't have to' is the classic trap.",
    sections: [
      {
        heading: "The four meanings",
        body: [
          "must / have to → it's necessary.",
          "mustn't → it's forbidden.",
          "don't have to / doesn't have to → it's not necessary (but not forbidden either).",
        ],
        examples: [
          "Students **must wear** a uniform.",
          "I **have to finish** this by Friday.",
          "You **mustn't smoke** here.",
          "You **don't have to pay** — it's free.",
        ],
      },
      {
        heading: "Must vs have to",
        body: [
          "'Must' often feels like the speaker's own rule; 'have to' often comes from someone/something else.",
          "Questions and third person almost always use 'have to'/'has to', not 'must'.",
          "'Have to' changes with the subject like a normal verb; 'must'/'mustn't' never change and never need 'to' after them.",
        ],
        examples: [
          "**Do** you **have to** book in advance?",
          "She **has to** leave early.",
        ],
      },
    ],
    commonMistakes: [
      "❌ We mustn't bring food (meaning it's optional) → ✅ We don't have to bring food. ('mustn't' = forbidden, not just unnecessary)",
      "❌ Students must to wear a uniform. → ✅ Students must wear a uniform. (no 'to' after must)",
      "❌ She have to leave early. → ✅ She has to leave early. (3rd person: has to)",
      "❌ Do you must arrive early? → ✅ Do you have to arrive early? (questions use 'have to', not 'must')",
    ],
  },

  modals_possibility: {
    title: "Modals of Possibility",
    intro: "These modals let you guess how likely something is, based on the evidence you have — from 'maybe' all the way to 'this must be true'.",
    sections: [
      {
        heading: "The scale",
        body: [
          "might / could / may + base verb → a weak, uncertain possibility.",
          "must + base verb → a strong, confident deduction based on evidence.",
          "can't + base verb → something is logically impossible given the evidence.",
        ],
        examples: [
          "It **might rain** later.",
          "That **could be** John.",
          "He **must be** tired — he's been working all day.",
          "She **can't be** at home — the lights are off and her car's gone.",
        ],
      },
      {
        heading: "Remember",
        body: [
          "All of these are followed by the bare infinitive — never 'to', never -ing, never -s.",
          "These are guesses about now, not facts.",
        ],
        examples: ["She's at work (a fact) vs. She **might be** at work (a guess)."],
      },
    ],
    commonMistakes: [
      "❌ It might to rain. → ✅ It might rain. (no 'to')",
      "❌ She musts be tired. → ✅ She must be tired. (modals never take -s)",
      "❌ He can't being at home. → ✅ He can't be at home. (bare infinitive, not -ing)",
      "❌ It could to be true. → ✅ It could be true. (no 'to' after 'could')",
    ],
  },

  invitations: {
    title: "Invitations: Asking, Accepting, Rejecting",
    intro: "Inviting someone, saying yes, and saying no politely each have their own set phrases — mixing up the grammar that follows them is the most common trap.",
    sections: [
      {
        heading: "Making an invitation",
        body: [
          "Would you like to + base verb?",
          "Are you free + time?",
          "Do you fancy + -ing? ('fancy' is British informal)",
          "How about / What about + -ing?",
          "Why don't you/we + base verb? / Shall we + base verb?",
        ],
        examples: [
          "**Would you like to** come to my party?",
          "**Are you free** on Saturday?",
          "**Do you fancy** going to the cinema?",
          "**How about** going bowling tonight?",
          "**Why don't we** try that new café?",
          "**Shall we** meet at six?",
        ],
      },
      {
        heading: "Accepting",
        body: [
          "Enthusiastic yes.",
          "Informal enthusiastic yes.",
          "Casual confirmation.",
        ],
        examples: [
          "**That sounds great**!",
          "**I'd love to**! / **Count me in**! / **I'm in**!",
          "**Sounds like a plan**!",
        ],
      },
      {
        heading: "Declining politely",
        body: [
          "'Make it' = attend.",
          "Note the word order: 'already' before the verb.",
          "Softens the 'no' and leaves the door open.",
        ],
        examples: [
          "**I'm afraid I can't make it** — I have other plans.",
          "I'd love to, but **I already have** plans that evening.",
          "Thanks for the invite, but… / **Maybe another time**?",
        ],
      },
      {
        heading: "Formal vs informal",
        body: ["Formal invitations sound official; informal ones sound relaxed and casual."],
        examples: [
          "**Would you like to** join us for…? / We **would be delighted** if you could attend…",
          "**Do you fancy**…? / **How about**…? / **Are you up for it**?",
        ],
      },
    ],
    commonMistakes: [
      "❌ Would you like come to dinner? → ✅ Would you like to come to dinner? ('would like to' + infinitive)",
      "❌ Do you fancy to go hiking? → ✅ Do you fancy going hiking? ('fancy' + gerund, not 'to')",
      "❌ I'm afraid I can't to come. → ✅ I'm afraid I can't come. ('can't' is already a modal — no 'to')",
      "❌ I'd love to, but I have already plans. → ✅ I'd love to, but I already have plans. ('already' goes before the verb)",
      "❌ Why don't you to join us? → ✅ Why don't you join us? (base verb directly after 'why don't you')",
    ],
  },

  telling_stories: {
    title: "Telling a Story",
    intro: "A good spoken story leans on a small set of scene-setting and linking words — get these right and the grammar (mostly past simple and past continuous) does the rest.",
    sections: [
      {
        heading: "Starting a story",
        body: [
          "One day / One night / One evening…",
          "Once upon a time… (classic, storybook opener)",
          "Set the scene with past continuous for background.",
        ],
        examples: [
          "**One day**, I was walking home when something strange happened.",
          "I **was cooking** dinner when the smoke alarm went off.",
        ],
      },
      {
        heading: "Sequencing events",
        body: [
          "First, … Then, … Next, … After that, … Finally, …",
          "Use past simple for the events themselves, in the order they happened.",
        ],
        examples: ["**First** we packed our bags. **Then** we called a taxi."],
      },
      {
        heading: "Adding drama",
        body: [
          "Suddenly, … / All of a sudden, … — an unexpected event.",
          "Luckily, … / Unfortunately, … — a lucky or unlucky turn.",
          "Eventually, … / At last, … — something that took a long time to happen.",
          "To make things worse, … — adding a second problem.",
          "so + adjective + that / such a + adjective + noun + that.",
        ],
        examples: [
          "She was **so tired that** she fell asleep.",
          "It was **such a scary film that** I couldn't sleep.",
        ],
      },
      {
        heading: "Ending a story",
        body: [
          "In the end, … / Finally, … — introduces the outcome.",
          "As a result, … — introduces a consequence of what just happened.",
        ],
      },
    ],
    commonMistakes: [
      "❌ One day, I am walking when I heard a noise. → ✅ One day, I was walking when I heard a noise. (background action = past continuous)",
      "❌ All of sudden, the lights went off. → ✅ All of a sudden, the lights went off. (don't drop the 'a')",
      "❌ To make things worst, the car broke down. → ✅ To make things worse, the car broke down. (comparative 'worse', not 'worst')",
      "❌ Despite the rain was heavy, we continued. → ✅ Despite the heavy rain, we continued. ('despite' + noun phrase, not a clause)",
      "❌ It was so a scary film. → ✅ It was such a scary film. ('such a' + adjective + noun, not 'so a')",
    ],
  },

  health_and_body: {
    title: "Health & the Body",
    intro: "Talking about being ill or injured uses a small set of fixed phrases and collocations — most mistakes come from the wrong preposition or a missing 'to'.",
    sections: [
      {
        heading: "Symptoms and illness",
        body: [
          "Naming a symptom.",
          "catch a cold",
          "be allergic to + thing / suffer from + illness",
        ],
        examples: [
          "I have **a headache** / **a sore throat** / **a fever** / **a cough**.",
          "I **feel dizzy**. I've been **feeling unwell** lately.",
          "I **caught a cold** last week.",
          "I'm **allergic to** penicillin.",
          "He is **suffering from** a bad cold.",
        ],
      },
      {
        heading: "Injuries",
        body: [
          "sprain/twist + body part.",
          "break + body part (past: broke, participle: broken).",
        ],
        examples: [
          "She **sprained** her ankle playing tennis.",
          "He **broke** his arm. / He **has broken** his arm.",
          "**cut myself**, **a bruise**, **be out of breath**",
        ],
      },
      {
        heading: "Seeing a doctor",
        body: [
          "make an appointment (to see the doctor/dentist)",
          "The doctor examines you, then prescribes medicine.",
          "Giving advice/instructions: should/must + base verb (no 'to').",
          "Passive: modal + be + past participle.",
        ],
        examples: [
          "You **should rest**. You **must rest**.",
          "This medicine **should be taken** twice a day.",
        ],
      },
      {
        heading: "For vs since",
        body: [
          "for + a length of time",
          "since + a starting point",
        ],
        examples: [
          "I've had this cough **for** three days.",
          "My throat has been sore **since** Monday.",
        ],
      },
    ],
    commonMistakes: [
      "❌ He is allergic at penicillin. → ✅ He is allergic to penicillin. ('allergic to')",
      "❌ He is suffering of a cold. → ✅ He is suffering from a cold. ('suffer from')",
      "❌ I've had this cough since three days. → ✅ I've had this cough for three days. ('for' + duration)",
      "❌ He should stopped smoking. → ✅ He should stop smoking. (modal + base verb, no '-ed')",
      "❌ I have broke my arm. → ✅ I have broken my arm. (past participle 'broken', not 'broke')",
    ],
  },

  ordering_food: {
    title: "Ordering Food and Drink",
    intro: "Restaurant English runs on a handful of polite fixed phrases — the tricky part is which preposition or verb form follows each one.",
    sections: [
      {
        heading: "Polite requests",
        body: [
          "Could I have… ? / I'd like… / Can I get… ?",
          "'I'll have' is more natural than 'I'll take' in a restaurant.",
        ],
        examples: [
          "**Could I have** the pasta, please?",
          "**I'll have** the pasta, please.",
          "**Are you ready to order**? **What would you like**?",
        ],
      },
      {
        heading: "Talking about the meal",
        body: [
          "starter → main course → dessert",
          "Does it come with…? — asking what's included",
          "swap X for Y",
        ],
        examples: [
          "**Does it come with** rice?",
          "**Could I swap** the chips **for** a salad?",
          "**Could I have** it **without** onions, please?",
        ],
      },
      {
        heading: "Dietary needs",
        body: ["Asking whether a dish fits a dietary requirement."],
        examples: [
          "Is this dish **vegetarian**/**vegan**/**gluten-free**?",
          "I'm **allergic to** nuts, so could you check the ingredients?",
        ],
      },
      {
        heading: "Finishing up",
        body: [
          "Asking to pay.",
          "book a table (in advance)",
        ],
        examples: [
          "**Could we have the bill**, please?",
          "I'd like to **book a table** for two.",
        ],
      },
    ],
    commonMistakes: [
      "❌ Could I have a water? → ✅ Could I have a glass of water? ('water' is uncountable)",
      "❌ Can I having the menu? → ✅ Can I have the menu? (base verb after 'can')",
      "❌ Does this soup contains nuts? → ✅ Does this soup contain nuts? (base verb after 'does')",
      "❌ Is there some vegetarian options? → ✅ Are there any vegetarian options? (plural noun → 'are'/'any')",
      "❌ There is a problem to my order. → ✅ There is a problem with my order. ('problem with')",
    ],
  },

  making_excuses: {
    title: "Making Excuses",
    intro: "Explaining lateness or a missed plan leans on a set of fixed phrases for the excuse itself, plus 'should have' for admitting you were wrong.",
    sections: [
      {
        heading: "Common excuses",
        body: [
          "Fixed excuse phrases for lateness.",
          "A vague, general excuse.",
          "'It slipped my mind' = I forgot.",
        ],
        examples: [
          "I **missed the bus**. I **got stuck in traffic**.",
          "My alarm **didn't go off**. I **overslept**.",
          "**Something came up** at the last minute.",
          "My phone **died**. I **completely forgot**. It **slipped my mind**.",
          "I had **a family emergency** / **a prior commitment**.",
        ],
      },
      {
        heading: "Joining the excuse to the result",
        body: ["…because + reason, in past simple."],
        examples: [
          "I arrived late for work **because** I missed the bus.",
          "She missed the meeting **because** she had a family emergency.",
        ],
      },
      {
        heading: "Admitting you were wrong",
        body: [
          "should have + past participle",
          "This is a past regret — you didn't do it, and now you wish you had.",
        ],
        examples: ["I **should have called** you earlier. I'm sorry."],
      },
      {
        heading: "Apologising formally",
        body: ["Formal apology phrases."],
        examples: [
          "I **apologise for** being late.",
          "Please **accept my apologies**.",
          "**Sorry for** the inconvenience.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I had a traffic. → ✅ I was stuck in traffic / There was a lot of traffic. ('traffic' is uncountable, no article)",
      "❌ I should have call you. → ✅ I should have called you. ('should have' + past participle)",
      "❌ It slipped of my mind. → ✅ It slipped my mind. (no preposition — fixed phrase)",
      "❌ I forget my phone at home. → ✅ I forgot my phone at home. (irregular past simple)",
      "❌ My car wouldn't started. → ✅ My car wouldn't start. (modal + base verb, no '-ed')",
    ],
  },

  making_suggestions: {
    title: "Making Suggestions",
    intro: "There are many ways to suggest something in English — the challenge is that each starter needs a different verb form after it.",
    sections: [
      {
        heading: "Base verb, no 'to' — casual suggestions",
        body: [
          "Let's + base verb",
          "Shall we + base verb?",
          "Why don't we/you + base verb?",
          "Why not + base verb (no subject)?",
        ],
        examples: [
          "**Let's** take a break.",
          "**Shall we** meet at six?",
          "**Why don't we** try that new café?",
          "**Why not** take a taxi?",
        ],
      },
      {
        heading: "-ing form — 'about' suggestions and verbs like suggest/recommend",
        body: [
          "How about / What about + -ing?",
          "I suggest / I recommend + -ing",
          "Have you considered / thought about + -ing?",
          "It might be worth + -ing",
        ],
        examples: [
          "**How about** going for a walk?",
          "I **suggest postponing** the meeting.",
          "**Have you considered asking** for help?",
          "It **might be worth checking** the reviews.",
        ],
      },
      {
        heading: "Softer or more formal suggestions",
        body: [
          "You should/could try… — 'should' is stronger, 'could' is gentler and optional.",
          "If I were you, I'd… — friendly advice using second conditional.",
          "What if + past simple?",
          "May I suggest…? / I'd propose… — formal, often in meetings.",
        ],
        examples: [
          "**What if** we went camping this year?",
          "**May I suggest**…? / **I'd propose**…",
        ],
      },
    ],
    commonMistakes: [
      "❌ How about go to the beach? → ✅ How about going to the beach? ('how about' + gerund)",
      "❌ I suggest to have the meeting on Monday. → ✅ I suggest having the meeting on Monday. ('suggest' + gerund)",
      "❌ Let's to watch a film. → ✅ Let's watch a film. (no 'to' after 'let's')",
      "❌ Why not we ask for a discount? → ✅ Why not ask for a discount? ('why not' + base verb, no subject)",
      "❌ Shall we to meet at the station? → ✅ Shall we meet at the station? (no 'to' after 'shall we')",
    ],
  },

  daily_life_a2: {
    title: "Daily Life & Routines",
    intro: "Talking about your daily routine is mostly present simple with time expressions — but this topic also drills a set of classic mistakes Spanish speakers make when describing everyday life.",
    sections: [
      {
        heading: "Describing a routine",
        body: [
          "wake up → get up → have breakfast → commute/go to work or school",
          "Third person needs -s.",
          "Sequence with first, then, after that, finally.",
        ],
        examples: [
          "**do** the housework/chores, **relax**/**unwind**, **go to bed**, **fall asleep**",
          "She **wakes up** at seven. He **catches** the bus at 7:45.",
          "**First** I have a shower. **Then** I get dressed.",
        ],
      },
      {
        heading: "Frequency and time",
        body: [
          "always / usually / often / sometimes / never — goes before the main verb, but after 'be'.",
          "free time / spare time — time that's yours, not work or school",
        ],
        examples: [
          "I **usually go** to the gym.",
          "I am **usually tired**.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I have 20 years old. → ✅ I am 20 years old. ('to be' + age, not 'to have' — a direct Spanish translation trap)",
      "❌ I am agree with my sister. → ✅ I agree with my sister. ('agree' is a verb on its own, no 'am')",
      "❌ I like to listen music. → ✅ I like to listen to music. ('listen to' + thing)",
      "❌ I have a house big with a garden. → ✅ I have a big house with a garden. (adjective before the noun in English)",
      "❌ I don't do nothing on Sundays. → ✅ I don't do anything on Sundays. (only one negative per clause)",
    ],
  },

  food_and_eating: {
    title: "Food & Eating",
    intro: "This topic mixes everyday food vocabulary with a set of classic mistakes Spanish speakers make when talking about meals, restaurants, and diet.",
    sections: [
      {
        heading: "Talking about food and diet",
        body: [
          "vegetarian / vegan — don't eat meat/fish, or any animal products",
          "be allergic to + food",
          "Comparing food (short adjective + -er)",
        ],
        examples: [
          "She is **allergic to** nuts.",
          "**be on a diet**, **lose weight**, **eat out**",
          "This curry is **spicier** than that one.",
        ],
      },
      {
        heading: "At a restaurant",
        body: ["Common restaurant vocabulary."],
        examples: [
          "**menu**, **bill**, **waiter**, **portion**, **starter**, **main course**, **dessert**",
          "This dish is **suitable for vegetarians**.",
          "**Does it come with** rice?",
        ],
      },
    ],
    commonMistakes: [
      "❌ I have 25 years. → ✅ I am 25 years old. ('to be' + age, not 'to have')",
      "❌ We arrived to the restaurant late. → ✅ We arrived at the restaurant late. ('arrive at/in a place', never 'arrive to')",
      "❌ The people in that restaurant is friendly. → ✅ The people in that restaurant are friendly. ('people' takes a plural verb)",
      "❌ I have eaten paella yesterday. → ✅ I ate paella yesterday. (a finished time word like 'yesterday' needs past simple)",
      "❌ The queue was so large. → ✅ The queue was so long. ('large' = big in size; 'long' describes a queue or line)",
    ],
  },

  school_and_study: {
    title: "School and Study",
    intro: "School vocabulary comes with its own obligation grammar (must/have to) and a set of classic mistakes Spanish speakers make when talking about classes and studying.",
    sections: [
      {
        heading: "Talking about school",
        body: [
          "Common school vocabulary.",
          "be good at + subject",
        ],
        examples: [
          "**subject**, **exam**, **homework**, **grade**/**mark**, **library**, **classmate**, **timetable**",
          "She is **good at** maths.",
          "**hand in** homework, **pass**/**fail** an exam, **take notes**",
        ],
      },
      {
        heading: "Obligation at school",
        body: [
          "must/have to + base verb (no 'to' after 'must')",
          "Passive with a modal: modal + be + past participle.",
        ],
        examples: [
          "Students **must arrive** on time.",
          "The essay **must be handed in** by Friday.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I have to assist my classes. → ✅ I have to attend my classes. ('assist' means to help; 'attend' means to go to')",
      "❌ I have 15 years old. → ✅ I am 15 years old. ('to be' + age, not 'to have')",
      "❌ I always avoid to talk in class. → ✅ I always avoid talking in class. ('avoid' + gerund, never 'to')",
      "❌ We have to listen the teacher. → ✅ We have to listen to the teacher. ('listen to' + person/thing)",
      "❌ I don't have no homework today. → ✅ I don't have any homework today. (only one negative per clause)",
    ],
  },

  friends_and_family: {
    title: "Friends and Family",
    intro: "Describing relationships leans on present perfect ('have been friends since…') and a handful of fixed phrasal expressions — plus another set of classic Spanish-speaker mix-ups.",
    sections: [
      {
        heading: "Talking about relationships",
        body: [
          "get on/along with someone (= have a good relationship)",
          "take after someone (= look/act like them)",
          "Present perfect + since = started in the past, still true now.",
          "who for people in relative clauses",
        ],
        examples: [
          "**keep in touch**, **close-knit** family, **only child**, **rely on** someone",
          "We **have been friends since** primary school.",
          "My uncle, **who** lives in Canada, is visiting us.",
        ],
      },
      {
        heading: "Comparing people in a family",
        body: [
          "Short adjectives.",
          "Superlative for 3+ people.",
        ],
        examples: [
          "**older**/**youngest** (not 'more old' or 'more young')",
          "She is **the youngest** child in the family.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I have 24 years. → ✅ I am 24 years old. ('to be' + age, not 'to have')",
      "❌ My cousin is married with a doctor. → ✅ My cousin is married to a doctor. ('married to', not 'married with')",
      "❌ I assisted to my grandparents' party. → ✅ I attended my grandparents' party. ('assist' means to help; 'attend' means to go to')",
      "❌ My aunt is very sympathetic. → ✅ My aunt is very friendly/likeable. ('sympathetic' means compassionate about a problem, not friendly)",
      "❌ I know my best friend since we were children. → ✅ I have known my best friend since we were children. ('since' needs present perfect)",
    ],
  },

  free_time_a2: {
    title: "Free Time and Interests",
    intro: "Talking about hobbies mostly needs 'enjoy'/'like' + gerund and 'prefer X to Y' — plus a few classic Spanish-speaker slips worth watching for.",
    sections: [
      {
        heading: "Talking about hobbies",
        body: [
          "Time expressions for habits.",
          "enjoy/like + -ing",
          "prefer X to Y",
          "would like to + infinitive",
        ],
        examples: [
          "**in my free time**, **at weekends**, **once a week**",
          "I **enjoy cooking**. (not 'enjoy to cook')",
          "I **prefer** swimming **to** running.",
          "I **would like to try** surfing one day.",
          "**join a club**, **take up** a hobby, **practise** a skill",
        ],
      },
      {
        heading: "Feelings about activities",
        body: ["-ed vs -ing adjectives."],
        examples: ["I am **bored** (how you feel) vs. The film is **boring** (what causes the feeling)."],
      },
    ],
    commonMistakes: [
      "❌ I make sport every weekend. → ✅ I do sport every weekend. (English says 'do sport/exercise', never 'make sport')",
      "❌ I like to listen music. → ✅ I like to listen to music. ('listen to' + thing)",
      "❌ My brother has ten years. → ✅ My brother is ten years old. ('to be' + age, not 'to have')",
      "❌ I am boring when I have nothing to do. → ✅ I am bored when I have nothing to do. (use the -ed form for how you feel)",
      "❌ I assist to a dance class. → ✅ I attend a dance class. ('assist' means to help; 'attend' means to go to')",
    ],
  },

  my_town_city: {
    title: "My Town and City",
    intro: "Describing a place uses 'there is/are', comparatives/superlatives, and passive voice for history ('was built') — plus a last round of classic Spanish-speaker slips.",
    sections: [
      {
        heading: "Describing your town",
        body: [
          "There is/are + noun",
          "be famous for + noun",
          "which for places/things in relative clauses",
          "Comparatives/superlatives.",
        ],
        examples: [
          "There **are** a lot of shops near my home.",
          "My town is **famous for** its old market.",
          "The old town, **which** is very famous, attracts tourists.",
          "**quieter than**, **busier than**, **the most beautiful**",
        ],
      },
      {
        heading: "Talking about the past of a place",
        body: ["Passive voice for history: was/were + past participle."],
        examples: ["The cathedral **was built** hundreds of years ago."],
      },
    ],
    commonMistakes: [
      "❌ I like to make photos of old buildings. → ✅ I like to take photos of old buildings. (English 'takes' a photo, never 'makes' one)",
      "❌ Tourists arrive to my city by train. → ✅ Tourists arrive in my city by train. ('arrive in/at a place', never 'arrive to')",
      "❌ My town has market in the centre. → ✅ My town has a market in the centre. (don't drop 'a' before a singular countable noun)",
      "❌ There is a good library where you can buy books. → ✅ There is a good bookshop where you can buy books. ('library' = borrow books; 'librería' in Spanish is false friend for bookshop)",
      "❌ There isn't nothing interesting to do. → ✅ There isn't anything interesting to do. (only one negative per clause)",
    ],
  },

  present_perfect: {
    title: "Present Perfect: Just, Already, Yet & Unfinished Time",
    intro: "You already know present perfect vs past simple with for/since — this builds on it with the time words that trigger present perfect and the 'unfinished period' idea.",
    sections: [
      {
        heading: "Recent actions",
        body: [
          "just → very recently",
          "already → sooner than expected, usually mid-sentence",
          "yet → in negatives and questions, usually at the end",
        ],
        examples: [
          "She **has just arrived**.",
          "I**'ve already finished** the report.",
          "I **haven't finished yet**.",
          "**Have** you **finished yet**?",
        ],
      },
      {
        heading: "Experience and duration",
        body: [
          "ever/never for life experience",
          "How long have you...? asks about a state that started in the past and continues now.",
          "Superlative + ever → present perfect.",
        ],
        examples: [
          "**Have** you **ever tried** sushi?",
          "I **have never been** to Japan.",
          "**How long have you known** her?",
          "This is the best pizza I **have ever eaten**.",
        ],
      },
      {
        heading: "Unfinished time periods",
        body: [
          "this month/week/year, so far, up to now, recently — periods that haven't finished yet.",
          "A result affecting now.",
        ],
        examples: [
          "They **have met** three times **this month**.",
          "I **have lost** my keys! (I still can't find them)",
        ],
      },
    ],
    commonMistakes: [
      "❌ Already I have finished my report. → ✅ I have already finished my report. ('already' goes between have and the past participle)",
      "❌ How long you have known her? → ✅ How long have you known her? (need 'have' before the subject in questions)",
      "❌ They didn't arrive yet. → ✅ They haven't arrived yet. ('yet' signals present perfect, not past simple)",
      "❌ This is the most delicious cake I ever tasted. → ✅ This is the most delicious cake I have ever tasted. (superlative + ever needs present perfect)",
      "❌ She just has arrived. → ✅ She has just arrived. ('just' goes between have/has and the past participle)",
    ],
  },

  phrasal_verbs: {
    title: "Phrasal Verbs",
    intro: "Phrasal verbs (verb + particle) often change meaning completely from the base verb, and each one has its own fixed grammar — this is where most mistakes happen.",
    sections: [
      {
        heading: "Common phrasal verbs",
        body: ["A sample of common phrasal verbs and what they mean."],
        examples: [
          "He **gave up** smoking. (quit)",
          "She **looks after** her grandmother. (cares for)",
          "I can't **put up with** this noise. (tolerate)",
          "I **ran into** an old friend. (met by chance)",
          "It took weeks to **get over** the flu. (recover from)",
          "He couldn't **come up with** an excuse. (think of an idea)",
          "They **carried out** the experiment. (performed/completed)",
        ],
      },
      {
        heading: "Separable vs inseparable",
        body: [
          "Separable: can split, and must split with a pronoun.",
          "Inseparable: never split.",
        ],
        examples: [
          "**Pick me up** (not 'pick up me').",
          "**Hand it in**.",
          "**Look after** my dog (never 'look after for my dog').",
        ],
      },
      {
        heading: "Fixed prepositions",
        body: ["Some phrasal verbs need a specific preposition."],
        examples: [
          "**cut down on** sugar",
          "**keep up with** the news",
          "**fall out with** a friend",
          "**come up with** an idea",
        ],
      },
    ],
    commonMistakes: [
      "❌ He gave up to smoking. → ✅ He gave up smoking. ('give up' + gerund, no 'to')",
      "❌ Could you pick up me? → ✅ Could you pick me up? (pronoun splits a separable phrasal verb)",
      "❌ Can you look after for my dog? → ✅ Can you look after my dog? ('look after' is inseparable — no 'for')",
      "❌ We need to cut down of sugar. → ✅ We need to cut down on sugar. (fixed preposition 'on')",
      "❌ He couldn't come up an excuse. → ✅ He couldn't come up with an excuse. ('come up with' needs 'with')",
    ],
  },

  so_neither: {
    title: "So do I / Neither do I",
    intro: "Agreeing with someone in English needs an auxiliary verb and inverted word order — matching the right auxiliary is the whole challenge.",
    sections: [
      {
        heading: "The pattern",
        body: [
          "So + auxiliary + subject → agrees with a POSITIVE statement.",
          "Neither/Nor + auxiliary + subject → agrees with a NEGATIVE statement.",
          "Always invert: auxiliary comes before the subject.",
        ],
        examples: [
          "\"I love pizza.\" \"**So do I**.\"",
          "\"I don't like horror films.\" \"**Neither do I**.\"",
        ],
      },
      {
        heading: "Matching the auxiliary",
        body: ["Match whatever auxiliary was in the original."],
        examples: [
          "\"They've finished.\" \"**So have** we.\"",
          "\"He can't swim.\" \"**Neither can** I.\"",
          "\"I was confused.\" \"**So was** he.\"",
        ],
      },
    ],
    commonMistakes: [
      "❌ Neither do I don't. → ✅ Neither do I. (no double negative — 'neither' already makes it negative)",
      "❌ Neither I am. → ✅ Neither am I. (invert: auxiliary before subject)",
      "❌ So I do. → ✅ So do I. (invert: auxiliary before subject)",
      "❌ Neither do he. → ✅ Neither does he. ('he' needs 'does', not 'do')",
      "❌ Neither can't I. → ✅ Neither can I. ('neither' is already negative — don't add another negative)",
    ],
  },

  prefer_rather: {
    title: "I'd prefer vs I'd rather",
    intro: "Both express a preference, but they need completely different grammar afterward — 'rather' never takes 'to', and 'prefer' usually does.",
    sections: [
      {
        heading: "I'd rather",
        body: [
          "I'd rather + bare infinitive (no 'to')",
          "I'd rather X than Y (both bare infinitives)",
          "I'd rather + subject + past simple (a preference about someone else, present meaning)",
        ],
        examples: [
          "I**'d rather stay** home tonight.",
          "I**'d rather walk than** take the bus.",
          "I**'d rather** you **called** me first.",
        ],
      },
      {
        heading: "I'd prefer",
        body: [
          "I'd prefer to + infinitive",
          "I'd prefer + noun + to + noun",
          "I'd prefer to X rather than Y",
        ],
        examples: [
          "I**'d prefer to relax** at home.",
          "I**'d prefer** tea **to** coffee.",
          "She**'d prefer to walk rather than** drive.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I'd rather to go by train. → ✅ I'd rather go by train. (no 'to' after 'would rather')",
      "❌ I'd prefer go early. → ✅ I'd prefer to go early. ('prefer' needs 'to' before the infinitive)",
      "❌ She'd prefer coffee than tea. → ✅ She'd prefer coffee to tea. ('prefer X to Y', not 'than')",
      "❌ I'd rather you don't tell anyone. → ✅ I'd rather you didn't tell anyone. (past simple after 'would rather + subject' for a present request)",
      "❌ We'd rather driving than flying. → ✅ We'd rather drive than fly. (bare infinitive, not '-ing')",
    ],
  },

  passive_simple: {
    title: "Passive Voice — Simple Tenses",
    intro: "Use the passive when the action matters more than who did it — the object of the active sentence becomes the subject, and the verb becomes be + past participle.",
    sections: [
      {
        heading: "Form",
        body: [
          "Present simple passive: am/is/are + past participle",
          "Past simple passive: was/were + past participle",
          "Future simple passive: will be + past participle",
          "Add the agent with 'by' if it's useful to say who did it.",
        ],
        examples: [
          "English **is spoken** in over 50 countries.",
          "This bridge **was built** in 1950.",
          "The results **will be announced** tomorrow.",
          "This song **is sung by** millions of fans.",
        ],
      },
      {
        heading: "Common uses",
        body: ["Facts, rules, routines, history, and manufacturing."],
        examples: [
          "Homework **is checked** every Monday.",
          "These shoes **were made** in Italy.",
          "The telephone **was invented** in the 19th century.",
        ],
      },
    ],
    commonMistakes: [
      "❌ The cake was bake by my mother. → ✅ The cake was baked by my mother. (past participle needed after 'was')",
      "❌ The results will announced tomorrow. → ✅ The results will be announced tomorrow. (future passive needs 'be')",
      "❌ Mistakes were made from the team. → ✅ Mistakes were made by the team. (the agent follows 'by', not 'from')",
      "❌ The documents was signed yesterday. → ✅ The documents were signed yesterday. (plural subject needs 'were')",
      "❌ Homework are checked every Friday. → ✅ Homework is checked every Friday. ('homework' is uncountable and singular)",
    ],
  },

  get_used_to: {
    title: "Get Used To / Be Used To / Used To",
    intro: "These three look similar but mean very different things: a past habit, a current familiarity, and the process of becoming familiar.",
    sections: [
      {
        heading: "The three forms",
        body: [
          "used to + bare infinitive → a past habit that's now finished (negative/question: no 'd' — didn't use to / did you use to).",
          "be used to + noun/-ing → something that is (or was) already familiar/normal.",
          "get used to + noun/-ing → the process of becoming familiar with something over time.",
        ],
        examples: [
          "I **used to smoke**, but I quit.",
          "She **is used to working** under pressure.",
          "It took months, but I **got used to** the cold weather.",
        ],
      },
      {
        heading: "Telling them apart",
        body: ["'Used to' is about the past action itself repeating; 'be/get used to' is about how familiar something feels, and can be present, past, or future."],
      },
    ],
    commonMistakes: [
      "❌ She is used to work late every night. → ✅ She is used to working late every night. ('be used to' + gerund)",
      "❌ I didn't use to liked spicy food. → ✅ I didn't use to like spicy food. ('didn't use to' + bare infinitive)",
      "❌ She use to be very shy. → ✅ She used to be very shy. ('used to' with 'd' in positive statements)",
      "❌ Did you used to live in Spain? → ✅ Did you use to live in Spain? (after 'did', use 'use to' — no 'd')",
      "❌ We used to living in a small flat. → ✅ We used to live in a small flat. ('used to' + bare infinitive, not '-ing')",
    ],
  },

  reported_speech: {
    title: "Direct & Reported Speech",
    intro: "Reporting what someone said usually shifts the tense one step into the past ('backshifting') and always uses statement word order, even for questions.",
    sections: [
      {
        heading: "Backshifting tenses",
        body: [
          "am/is/are → was/were",
          "will → would; can → could; must → had to",
          "present perfect → past perfect",
          "Time words shift too.",
        ],
        examples: [
          "\"I am tired.\" → She said she **was** tired.",
          "\"I will call you.\" → He said he **would** call.",
          "\"I have never been to Japan.\" → He said he **had** never **been** to Japan.",
          "tomorrow → **the next day**, today → **that day**, this → **that**",
        ],
      },
      {
        heading: "Say vs tell",
        body: ["say (no object) / tell + object"],
        examples: [
          "She **said** (that) she was hungry.",
          "She **told me** (that) she was hungry.",
        ],
      },
      {
        heading: "Reported questions and requests",
        body: [
          "Yes/no questions use if/whether, no inversion.",
          "Wh-questions keep the wh-word but statement order.",
          "Commands/requests: told/asked + object + (not) to + infinitive.",
        ],
        examples: [
          "She **asked if** I **had eaten**. (not 'had I eaten')",
          "He **asked where** I **lived**. (not 'where did I live')",
          "The teacher **told us to open** the window.",
          "She **told him not to touch** her things.",
        ],
      },
    ],
    commonMistakes: [
      "❌ She said me that she was hungry. → ✅ She told me that she was hungry. ('tell' needs an object; 'say' doesn't)",
      "❌ She asked me where was the station. → ✅ She asked me where the station was. (statement word order, no inversion)",
      "❌ He said he will finish tomorrow. → ✅ He said he would finish the next day. ('will' → 'would'; 'tomorrow' → 'the next day')",
      "❌ They asked if did she agree. → ✅ They asked if she agreed. (no inversion after 'if')",
      "❌ She told me to don't worry. → ✅ She told me not to worry. (negative imperative: 'told + object + not to')",
    ],
  },

  indefinite_pronouns: {
    title: "Indefinite Pronouns",
    intro: "Some-/any-/no-/every- combine with -one, -body, -thing, and -where — the trick is knowing which prefix fits positive statements, negatives, and questions.",
    sections: [
      {
        heading: "The four groups",
        body: [
          "some- → positive statements",
          "any- → questions and negatives",
          "no- → already negative, don't add another negative",
          "every- → always singular",
        ],
        examples: [
          "**Somebody** left their umbrella here.",
          "**Is anybody** home? I didn't say **anything**.",
          "**Nobody wants** to leave. (not 'Nobody doesn't want')",
          "**Everyone was** invited. **Everything is** ready.",
        ],
      },
      {
        heading: "Grammar to remember",
        body: [
          "All indefinite pronouns take a singular verb.",
          "whoever/whatever (= any person/thing who/that) also take a singular verb.",
        ],
        examples: [
          "**Everybody was** invited.",
          "**Nothing was** said.",
          "**Whoever calls**, tell them I'm busy.",
        ],
      },
    ],
    commonMistakes: [
      "❌ Nobody doesn't want to leave. → ✅ Nobody wants to leave. (no double negative)",
      "❌ There is anyone in the office. → ✅ There is someone in the office. ('anyone' is for questions/negatives, not positives)",
      "❌ Everything are ready. → ✅ Everything is ready. (indefinite pronouns are always singular)",
      "❌ I don't want nothing to eat. → ✅ I don't want anything to eat. (avoid double negatives)",
      "❌ I can't find it nowhere. → ✅ I can't find it anywhere. ('anywhere' with a negative verb, not 'nowhere')",
    ],
  },

  relative_clauses: {
    title: "Relative Clauses",
    intro: "Relative clauses add information about a noun using who, which, that, whose, where, when, or why — picking the right one, and never doubling the pronoun, is the key skill.",
    sections: [
      {
        heading: "Which pronoun for what",
        body: [
          "who → people",
          "which/that → things",
          "whose → possession",
          "where → places",
          "when → time",
          "why → after 'reason'",
        ],
        examples: [
          "The woman **who** called is my sister.",
          "The car **that/which** I bought broke down.",
          "The student **whose** bag was stolen reported it.",
          "This is the café **where** we met.",
          "2005 was the year **when** everything changed.",
          "The reason **why** she left is unclear.",
        ],
      },
      {
        heading: "Defining vs non-defining",
        body: [
          "Defining (no commas, identifies which one)",
          "Non-defining (commas, extra info, can't use 'that')",
        ],
        examples: [
          "I have a friend **who lives in Paris**.",
          "My brother, **who lives in Canada**, is visiting us.",
        ],
      },
      {
        heading: "Common trap",
        body: ["Never repeat the pronoun the relative clause already replaces."],
        examples: ["The book **which** I told you about (not 'about it')."],
      },
    ],
    commonMistakes: [
      "❌ The doctor which treated me was kind. → ✅ The doctor who treated me was kind. ('who' for people)",
      "❌ The book which I told you about it. → ✅ The book which I told you about. (don't repeat the pronoun)",
      "❌ This is the park which we play football. → ✅ This is the park where we play football. ('where' for places)",
      "❌ The concert, that starts at eight... → ✅ The concert, which starts at eight... (non-defining clauses use 'which', not 'that')",
      "❌ She's the girl who's bag I found. → ✅ She's the girl whose bag I found. ('whose' = possession; 'who's' = 'who is')",
    ],
  },

  adverbs: {
    title: "Adverbs",
    intro: "Most adverbs of manner are adjective + -ly, but a few common ones are irregular, and adverbs of frequency/degree have their own word order rules.",
    sections: [
      {
        heading: "Forming and using adverbs",
        body: [
          "adjective + -ly",
          "Irregular: good → well (not 'goodly'); fast, hard, late stay the same as the adjective.",
          "Frequency adverbs go before the main verb, but after 'be'.",
        ],
        examples: [
          "careful → **carefully**, quiet → **quietly**",
          "He plays the piano **well**.",
          "I **always drink** coffee. She **is always late**.",
        ],
      },
      {
        heading: "Comparatives and degree",
        body: [
          "Short adverbs: -er; long adverbs: more + adverb",
          "'Enough' comes AFTER the adjective.",
          "After sense verbs (smell, taste, look, sound, feel), use an adjective, not an adverb.",
        ],
        examples: [
          "**harder**, **more carefully**",
          "**clever enough**, not 'enough clever'",
          "This soup tastes **wonderful**. (not 'wonderfully')",
        ],
      },
    ],
    commonMistakes: [
      "❌ She sings beautiful. → ✅ She sings beautifully. (adverbs modify verbs — add '-ly')",
      "❌ He did good in the exam. → ✅ He did well in the exam. ('well' is the adverb form of 'good')",
      "❌ She always is late. → ✅ She is always late. (frequency adverb goes after 'be')",
      "❌ This soup tastes wonderfully. → ✅ This soup tastes wonderful. (adjective after sense verbs, not adverb)",
      "❌ I am not enough strong. → ✅ I am not strong enough. ('enough' comes after the adjective)",
    ],
  },

  double_comparatives: {
    title: "Double Comparatives",
    intro: "'The...the...' links two changes together — as one thing increases or decreases, so does another. Both halves need 'the' and a comparative form.",
    sections: [
      {
        heading: "Form",
        body: [
          "The + comparative, the + comparative",
          "Short adjectives: the + adjective-er",
          "Long adjectives: the more + adjective",
          "Irregular: good → the better, bad → the worse, little → the less",
        ],
        examples: [
          "**The harder** you work, **the better** your results.",
          "**The sooner**, **the better**.",
          "**The more crowded** the bus is, **the more uncomfortable** the ride.",
        ],
      },
    ],
    commonMistakes: [
      "❌ More you practice, the more fluent you become. → ✅ The more you practice, the more fluent you become. (both parts need 'the')",
      "❌ The quicker you finish, the more quicker you can leave. → ✅ The quicker you finish, the quicker you can leave. (don't add 'more' before a short -er comparative)",
      "❌ The more money you have, the gooder your life is. → ✅ The more money you have, the better your life is. ('good' is irregular: better)",
      "❌ The more expensive is the hotel, the better the service. → ✅ The more expensive the hotel, the better the service. (no 'is' inside the clause)",
      "❌ The higher we climbed, the more thin the air became. → ✅ The higher we climbed, the thinner the air became. (short adjectives take -er, not 'more')",
    ],
  },

  second_conditional: {
    title: "Second Conditional",
    intro: "Use the second conditional for hypothetical or unlikely situations in the present/future — imagining a different reality, not a real possibility (that's first conditional).",
    sections: [
      {
        heading: "Form",
        body: [
          "If + past simple, + would + base verb",
          "Use 'were' for all subjects in the if-clause (not 'was'), especially in 'If I were you...'",
          "Questions: Would + subject + base verb + if...?",
        ],
        examples: [
          "If I **had** more money, I **would travel** the world.",
          "If she **were** here, she would know what to do.",
          "What **would you do if** you **won** the lottery?",
        ],
      },
      {
        heading: "Second vs first conditional",
        body: ["First conditional = a real, likely future situation. Second conditional = hypothetical/unlikely, imagining now."],
        examples: [
          "If it rains, I'll take an umbrella. (first — likely)",
          "If I won the lottery, I would buy a house. (second — hypothetical)",
        ],
      },
    ],
    commonMistakes: [
      "❌ If I would win the lottery, I would buy a house. → ✅ If I won the lottery, I would buy a house. (never 'would' in the if-clause)",
      "❌ If I am you, I would apologise. → ✅ If I were you, I would apologise. (fixed phrase 'If I were you')",
      "❌ If they was here, they would know. → ✅ If they were here, they would know. ('were' for all subjects in the if-clause)",
      "❌ If we won the match, we would celebrating all night. → ✅ If we won the match, we would celebrate all night. (base verb after 'would')",
      "❌ If it rains tomorrow, we would stay home. → ✅ If it rained tomorrow, we would stay home. (if-clause needs past simple to match 'would')",
    ],
  },

  modal_verbs: {
    title: "Modals: Permission, Advice & Ability",
    intro: "Three different jobs, three families of modals: can/could/may for permission, should/ought to/had better for advice, and can/could/was able to for ability.",
    sections: [
      {
        heading: "Permission",
        body: [
          "Can I...? (informal)",
          "Could I...? (more polite)",
          "May I...? (formal)",
        ],
        examples: [
          "**Can I use** your phone?",
          "**Could I borrow** your pen?",
          "**May I leave** the room?",
        ],
      },
      {
        heading: "Advice",
        body: [
          "should/ought to",
          "had better (a stronger warning, often about consequences)",
        ],
        examples: [
          "You **should see** a doctor.",
          "You **had better hurry up**.",
        ],
      },
      {
        heading: "Ability",
        body: [
          "can → present ability",
          "could → general ability in the past",
          "was/were able to → one specific past achievement, not a general ability",
        ],
        examples: [
          "She **can speak** Spanish.",
          "I **could climb** trees when I was young.",
          "After months of training, she **was able to run** a marathon.",
        ],
      },
    ],
    commonMistakes: [
      "❌ She can to speak four languages. → ✅ She can speak four languages. (modals take a bare infinitive — no 'to')",
      "❌ He should works harder. → ✅ He should work harder. ('should' + bare infinitive, no -s)",
      "❌ She could speaked three languages. → ✅ She could speak three languages. (bare infinitive after 'could')",
      "❌ He had better to hurry up. → ✅ He had better hurry up. (no 'to' after 'had better')",
      "❌ She was able to speaked three languages. → ✅ She was able to speak three languages. ('was able to' + bare infinitive)",
    ],
  },

  past_continuous: {
    title: "Past Continuous",
    intro: "Use the past continuous for an action already in progress at a specific past moment — often the background to a shorter interrupting event in past simple.",
    sections: [
      {
        heading: "Form",
        body: [
          "was/were + verb-ing",
          "Negative/question: wasn't/weren't + -ing; Were you...ing?",
        ],
        examples: [
          "I **was watching** TV at 8pm.",
          "They **were playing** football.",
        ],
      },
      {
        heading: "Use",
        body: [
          "Background action interrupted by a shorter one (past simple).",
          "Two actions happening at the same time, often with 'while'.",
          "Setting the scene of a story.",
        ],
        examples: [
          "I **was cooking** dinner when the phone **rang**.",
          "While I **was studying**, my sister **was watching** a film.",
          "The sun **was shining** and the birds **were singing**.",
        ],
      },
    ],
    commonMistakes: [
      "❌ She were cooking when I arrived. → ✅ She was cooking when I arrived. (singular subject = 'was')",
      "❌ They were dance at the party. → ✅ They were dancing at the party. ('were' + verb-ing)",
      "❌ What you were doing at 7pm? → ✅ What were you doing at 7pm? (questions need 'were' before the subject)",
      "❌ While she reading, I was watching TV. → ✅ While she was reading, I was watching TV. (the 'while' clause also needs was/were + -ing)",
      "❌ I didn't was sleeping when you called. → ✅ I wasn't sleeping when you called. (negative is 'wasn't/weren't', not 'didn't was')",
    ],
  },

  past_perfect: {
    title: "Past Perfect (had + past participle)",
    intro: "Use the past perfect for the earlier of two past events — it shows what had already happened before another past moment.",
    sections: [
      {
        heading: "Form and use",
        body: [
          "had + past participle",
          "Explains the cause of a later past event.",
          "Often paired with 'by the time'.",
        ],
        examples: [
          "When I arrived, she **had already left**.",
          "She was tired because she **had worked** all night.",
          "By the time the teacher arrived, the students **had finished** the test.",
        ],
      },
      {
        heading: "Signal words",
        body: ["already, just, never, ever, before — all commonly appear with past perfect."],
        examples: [
          "I **had never seen** snow before that winter.",
          "She **had just finished** when her friend arrived.",
        ],
      },
    ],
    commonMistakes: [
      "❌ By the time I got there, they finished. → ✅ By the time I got there, they had finished. (the earlier action needs past perfect)",
      "❌ She was sad because she has lost her necklace. → ✅ She was sad because she had lost her necklace. ('had', not 'has')",
      "❌ I never had seen the ocean before that trip. → ✅ I had never seen the ocean before that trip. (word order: 'had never')",
      "❌ They had ate dinner before we got there. → ✅ They had eaten dinner before we got there. (past participle 'eaten', not 'ate')",
      "❌ He hadn't never travelled abroad. → ✅ He had never travelled abroad. (avoid double negatives)",
    ],
  },

  question_tags: {
    title: "Question Tags",
    intro: "A question tag turns a statement into a quick check ('...isn't it?') — the two rules are: flip positive/negative, and match the auxiliary that's already in the sentence.",
    sections: [
      {
        heading: "The core rule",
        body: [
          "Positive statement → negative tag.",
          "Negative statement → positive tag.",
          "Match the auxiliary already there; if there's no auxiliary, use do/does/did.",
        ],
        examples: [
          "She's a doctor, **isn't she**?",
          "You don't like coffee, **do you**?",
        ],
      },
      {
        heading: "Irregulars to memorise",
        body: [
          "I am → aren't I",
          "Let's... → shall we",
          "Imperatives → will you",
          "Have (possession, main verb) → do/does/did, not haven't",
          "Never/nobody/nothing (hidden negatives) → positive tag",
        ],
        examples: [
          "I'm right, **aren't I**?",
          "Let's have a break, **shall we**?",
          "Close the door, **will you**?",
          "You have a car, **don't you**?",
          "She never smiles, **does she**?",
          "Nobody called, **did they**?",
        ],
      },
    ],
    commonMistakes: [
      "❌ She is tired, is she? → ✅ She is tired, isn't she? (positive statement needs negative tag)",
      "❌ You don't smoke, don't you? → ✅ You don't smoke, do you? (negative statement needs positive tag)",
      "❌ He's from Canada, doesn't he? → ✅ He's from Canada, isn't he? (match the auxiliary 'is', not 'does')",
      "❌ You have a car, haven't you? → ✅ You have a car, don't you? ('have' as a main verb takes do/does, not haven't)",
      "❌ She never eats meat, doesn't she? → ✅ She never eats meat, does she? ('never' is already negative, so the tag is positive)",
    ],
  },

  ed_ing_adjectives: {
    title: "-ed vs -ing Adjectives",
    intro: "These adjective pairs (bored/boring, interested/interesting) look similar but describe two completely different things: how a person feels, versus what causes the feeling.",
    sections: [
      {
        heading: "The rule",
        body: [
          "-ed describes how a PERSON feels.",
          "-ing describes the THING that causes the feeling.",
        ],
        examples: [
          "I'm **interested** in history. I was **bored** during the meeting.",
          "History is **interesting**. The meeting was **boring**.",
          "excited/exciting, exhausted/exhausting, confused/confusing, disappointed/disappointing, annoyed/annoying, amazed/amazing, satisfied/satisfying",
        ],
      },
    ],
    commonMistakes: [
      "❌ I'm really interesting in this film. → ✅ I'm really interested in this film. (-ed for how you feel)",
      "❌ The lecture was so bored. → ✅ The lecture was so boring. (-ing for the thing causing the feeling)",
      "❌ She felt exciting about her results. → ✅ She felt excited about her results. (-ed for how she feels)",
      "❌ These instructions are very confused. → ✅ These instructions are very confusing. (-ing for the instructions themselves)",
      "❌ We were amazing by the tricks. → ✅ We were amazed by the tricks. (-ed for the audience's reaction)",
    ],
  },

  future_continuous: {
    title: "Future Continuous (will be + -ing)",
    intro: "Use the future continuous for an action that will already be in progress at a specific future moment — not a simple future decision or fact (that's just 'will').",
    sections: [
      {
        heading: "Form",
        body: [
          "will be + verb-ing",
          "Question: Will + subject + be + verb-ing?",
          "Negative: won't be + verb-ing",
        ],
        examples: [
          "This time tomorrow, I'**ll be flying** to Rome.",
          "**What will you be doing** at 10am tomorrow?",
          "I **won't be answering** my phone during the exam.",
        ],
      },
      {
        heading: "Use",
        body: [
          "An action in progress at a stated future time.",
          "Explaining why you can't do something.",
          "A polite assumption about someone's routine.",
        ],
        examples: [
          "At 8pm tonight, we **will be having** dinner.",
          "I can't meet at 3pm — I**'ll be seeing** a client then.",
          "He**'ll be working** late tonight, so don't wait for him.",
        ],
      },
    ],
    commonMistakes: [
      "❌ This time tomorrow, I will flying to Rome. → ✅ This time tomorrow, I will be flying to Rome. (need 'be' before the -ing verb)",
      "❌ At 8pm, we will having dinner. → ✅ At 8pm, we will be having dinner. (missing 'be')",
      "❌ Will you using the car tonight? → ✅ Will you be using the car tonight? (questions need 'be' after the subject)",
      "❌ He will be work late tonight. → ✅ He will be working late tonight. (the verb after 'will be' needs -ing)",
      "❌ The kids will probably sleeping by then. → ✅ The kids will probably be sleeping by then. ('probably' sits between 'will' and 'be', not instead of it)",
    ],
  },

  giving_opinions: {
    title: "Giving Opinions",
    intro: "Opinion-giving phrases each have their own fixed grammar — the classic trap is stacking two opinion openers together, like 'In my opinion, I think...'.",
    sections: [
      {
        heading: "Introducing your opinion",
        body: ["Common ways to introduce a personal opinion; 'I'm of the opinion that...' is a bit more formal."],
        examples: [
          "**In my opinion**, social media has both positive and negative effects.",
          "**From my point of view**, governments should invest more in renewable energy.",
          "**If you ask me**, fast food is convenient but not very healthy.",
          "I**'m of the opinion that** technology will replace many jobs.",
        ],
      },
      {
        heading: "Softening or strengthening an opinion",
        body: [
          "Cautious/softened opinions.",
          "Strong, confident opinions.",
        ],
        examples: [
          "**I tend to think** that working from home is more productive.",
          "**As far as I'm concerned**, honesty is the most important value.",
          "**I strongly believe** that every child deserves a good education.",
          "**To the best of my knowledge**, no one has raised this issue before.",
        ],
      },
      {
        heading: "Common trap: don't stack two openers",
        body: ["Pick ONE opinion opener — don't combine 'in my opinion' with 'I think', or 'for me' with 'I think'."],
        examples: ["**In my opinion**, we should ban plastic bags. (not 'In my opinion, I think we should...')"],
      },
    ],
    commonMistakes: [
      "❌ According to me, the film was brilliant. → ✅ In my opinion, the film was brilliant. ('according to' is for sources, not personal opinions)",
      "❌ I am agree with you about this issue. → ✅ I agree with you about this issue. ('agree' is a verb, no 'am')",
      "❌ In my point of view, the plan won't work. → ✅ From my point of view, the plan won't work. (fixed phrase is 'from my point of view')",
      "❌ What is your opinion for the current situation? → ✅ What is your opinion on/about the current situation? ('opinion on/about', not 'for')",
      "❌ In my opinion, I think we should ban plastic bags. → ✅ In my opinion, we should ban plastic bags. (don't combine 'in my opinion' and 'I think')",
    ],
  },

  asking_for_clarification: {
    title: "Asking for Clarification",
    intro: "When you don't understand something, English has a set of polite fixed phrases for asking someone to repeat, explain, or confirm what they meant.",
    sections: [
      {
        heading: "Asking someone to repeat or slow down",
        body: ["Common phrases for not hearing or catching something."],
        examples: [
          "Sorry, **could you repeat** that, please?",
          "Sorry, **I didn't quite catch** that — was the meeting at 3 or 4?",
          "**Could you say** that **more slowly**, please?",
          "**Pardon**? I didn't hear what you said.",
        ],
      },
      {
        heading: "Asking what something means",
        body: [
          "'Mean by' + the specific word or phrase.",
          "'Explain'/'clarify' + detail.",
        ],
        examples: [
          "**What do you mean by** 'flexible working hours'?",
          "**Could you explain** that **a bit more**?",
          "**Could you clarify** what you meant by 'immediate action'?",
          "**Could you put** that **in simpler terms**?",
        ],
      },
      {
        heading: "Checking you understood correctly",
        body: ["Rephrasing what you think someone meant, to confirm it."],
        examples: [
          "**Just to clarify**, are we meeting at nine or ten?",
          "**Are you saying that** the flight has been cancelled completely?",
          "**Let me get this straight** — you want the whole report by Monday?",
          "**In other words**, you think we should cancel the trip?",
        ],
      },
    ],
    commonMistakes: [
      "❌ What do you mean with that? → ✅ What do you mean by that? (fixed phrase: 'mean by')",
      "❌ Could you give me an example for that? → ✅ Could you give me an example of that? ('example of', not 'for')",
      "❌ Are you meaning that we have to start over? → ✅ Do you mean that we have to start over? ('mean' is a state verb — no continuous)",
      "❌ Could you explain me the instructions again? → ✅ Could you explain the instructions to me again? ('explain' needs 'to' before the person)",
      "❌ Would you mind to repeat the question? → ✅ Would you mind repeating the question? ('would you mind' + gerund)",
    ],
  },

  agreeing_disagreeing: {
    title: "Agreeing and Disagreeing",
    intro: "Agreeing and disagreeing politely both lean on 'agree'/'disagree' as ordinary verbs (never with 'am/is/are'), plus a set of softening phrases for disagreement.",
    sections: [
      {
        heading: "Agreeing",
        body: [
          "'Agree' is a normal verb — never 'I'm agree'.",
          "Strong agreement.",
        ],
        examples: [
          "I **completely agree** that we need more parks.",
          "**I couldn't agree more** — working from home really does improve productivity.",
          "**We're on the same page** about the new schedule.",
          "**Absolutely**, I couldn't have said it better myself.",
        ],
      },
      {
        heading: "Disagreeing politely",
        body: [
          "Soften disagreement rather than saying 'you're wrong'.",
          "Acknowledge first, then disagree with 'but'.",
        ],
        examples: [
          "**I'm afraid I disagree** — I think the plan is too risky.",
          "**I see your point**, but I still think we should wait.",
          "**That's a fair point, but** I think the costs outweigh the benefits.",
          "**I'm not entirely convinced** that this plan will work.",
          "**I beg to differ** — the data actually shows the opposite trend.",
        ],
      },
      {
        heading: "Partial agreement",
        body: ["Agreeing in part, not completely."],
        examples: [
          "**To some extent I agree**, but I don't think banning cars is realistic.",
          "**That's generally true, but** there are exceptions.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I'm agree that we need to change our approach. → ✅ I agree that we need to change our approach. ('agree' is a verb — not 'I'm agree')",
      "❌ I'm afraid I disagree you on that. → ✅ I'm afraid I disagree with you on that. ('disagree with' someone)",
      "❌ I can't agree more with your position. → ✅ I couldn't agree more with your position. ('couldn't agree more' — negative form for maximum agreement)",
      "❌ I disagree on your interpretation. → ✅ I disagree with your interpretation. ('disagree with', not 'disagree on')",
      "❌ With all do respect, I think you're mistaken. → ✅ With all due respect, I think you're mistaken. (fixed phrase is 'due respect')",
    ],
  },

  describing_locations: {
    title: "Describing Locations",
    intro: "Describing a place uses a small set of adjectives and fixed collocations (situated in, known for, home to) — most mistakes come from the wrong preposition or verb form.",
    sections: [
      {
        heading: "Where a place is",
        body: [
          "situated/located + in/on",
          "surrounded by",
          "within walking distance of / a short drive from",
        ],
        examples: [
          "The village is **situated in** the mountains.",
          "The old town is **surrounded by** a stone wall.",
          "The hotel is **within walking distance of** the beach.",
          "The airport is a **short drive from** the city centre.",
        ],
      },
      {
        heading: "What a place is known for",
        body: [
          "known for / famous for + noun",
          "home to + noun",
          "population of + number",
        ],
        examples: [
          "The city is **known for** its beautiful architecture.",
          "This region is **famous for** its vineyards.",
          "The city is **home to** over twenty museums.",
          "The town has a **population of** about 50,000.",
        ],
      },
      {
        heading: "Describing what a place feels like",
        body: ["Common descriptive adjectives, positive and negative."],
        examples: [
          "**remote**, **cosmopolitan**, **historic**, **spacious**, **peaceful**, **picturesque**",
          "**crowded**, **run-down**, **touristy**",
          "**up-and-coming**, **off the beaten track**, **well-connected**",
        ],
      },
    ],
    commonMistakes: [
      "❌ The village is situate in the mountains. → ✅ The village is situated in the mountains. ('situated' is the adjective form)",
      "❌ The hotel is in walking distance of the beach. → ✅ The hotel is within walking distance of the beach. ('within', not 'in')",
      "❌ This region is famous of its vineyards. → ✅ This region is famous for its vineyards. ('famous for', not 'famous of')",
      "❌ The city is house to over twenty museums. → ✅ The city is home to over twenty museums. ('home to', not 'house to')",
      "❌ The city is good connected by trains and buses. → ✅ The city is well connected by trains and buses. ('well' is the adverb, not 'good')",
    ],
  },

  common_idioms: {
    title: "Very Common Idioms",
    intro: "These idioms are fixed phrases — you can't swap in a similar word, so the exact wording (and which noun goes with which verb) is what matters.",
    sections: [
      {
        heading: "Easy, health, and cost",
        body: ["Idioms for describing difficulty, health, and cost."],
        examples: [
          "The driving test was **a piece of cake** for me. (very easy)",
          "I'm feeling a bit **under the weather** today. (slightly ill)",
          "That designer bag **cost an arm and a leg**. (very expensive)",
          "We only eat out **once in a blue moon** these days. (very rarely)",
        ],
      },
      {
        heading: "Talking, secrets, and social situations",
        body: ["Idioms about revealing information or easing tension."],
        examples: [
          "He told a funny story to **break the ice** at the meeting.",
          "My little sister always **spills the beans** about surprise gifts.",
          "He **let the cat out of the bag** about the surprise party by mistake.",
          "**Speak of the devil** — I was just telling everyone about your new job!",
        ],
      },
      {
        heading: "Decisions, effort, and outcomes",
        body: ["Idioms about facing challenges, being efficient, or finishing up."],
        examples: [
          "I finally **bit the bullet** and booked the dentist appointment.",
          "You **hit the nail on the head** when you said the problem was communication.",
          "By walking to work, I **kill two birds with one stone**.",
          "We've made great progress — **let's call it a day**.",
          "Missing that flight was actually **a blessing in disguise**.",
        ],
      },
    ],
    commonMistakes: [
      "❌ Don't worry, the exam is a slice of cake. → ✅ Don't worry, the exam is a piece of cake. (fixed idiom: 'a piece of cake')",
      "❌ He told a joke to hit the ice. → ✅ He told a joke to break the ice. (fixed idiom: 'break the ice')",
      "❌ Don't pour the beans about the party! → ✅ Don't spill the beans about the party! (fixed idiom: 'spill the beans')",
      "❌ It's time to eat the bullet. → ✅ It's time to bite the bullet. (fixed idiom: 'bite the bullet')",
      "❌ Now the ball is in your hands. → ✅ Now the ball is in your court. (fixed idiom: 'the ball is in your court')",
    ],
  },

  working_from_home: {
    title: "Working from Home",
    intro: "Talking about remote work leans on present perfect for change over time ('has become popular') and a set of fixed collocations — plus the same Spanish-L1 traps seen in other topics.",
    sections: [
      {
        heading: "Talking about remote work",
        body: [
          "Common remote-work vocabulary.",
          "concentrate ON + noun",
        ],
        examples: [
          "**commute**, **distraction**, **isolated**, **home office**, **hybrid working**, **log off**",
          "It's hard to **concentrate on** your work when the kids are at home.",
        ],
      },
      {
        heading: "Describing change over time",
        body: ["Present perfect for a change that started in the past and continues now, often with 'since'."],
        examples: [
          "Working from home **has become** popular since the pandemic began.",
          "Many face-to-face meetings **have been replaced** by video calls.",
        ],
      },
      {
        heading: "Common trap: verbs + gerund",
        body: ["enjoy/avoid + gerund, not infinitive."],
        examples: [
          "Many employees **enjoy working** from home.",
          "Some managers **avoid trusting** their remote employees.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I am agree that working from home saves time. → ✅ I agree that working from home saves time. ('agree' is a verb, no 'am')",
      "❌ How productive you are depends of your self-discipline. → ✅ ...depends on your self-discipline. ('depend on', not 'depend of')",
      "❌ Actually, I work from home three days a week. → ✅ Currently, I work from home three days a week. ('actually' means 'in fact', not 'currently')",
      "❌ She is remote worker who manages her own schedule. → ✅ She is a remote worker... (article needed before a job noun)",
      "❌ I have bought a new desk last week. → ✅ I bought a new desk last week. (specific past time → past simple)",
    ],
  },

  learning_language: {
    title: "Learning a Foreign Language",
    intro: "This topic mixes learning-strategy vocabulary with present perfect for ongoing duration ('has learned...for six years') — plus the recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Talking about learning strategies",
        body: [
          "Common phrases for learning a language.",
          "practise WITH someone",
        ],
        examples: [
          "**immerse yourself in** the language, **pick up** new words, **become fluent**, **mother tongue**",
          "I try to **practise with** native speakers every week.",
        ],
      },
      {
        heading: "Duration and change",
        body: ["Present perfect (continuous) for something that started in the past and continues."],
        examples: [
          "She **has learned** Spanish **for** six years and is now fluent.",
          "She **has been studying** Korean **since** January.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I assisted to an English class. → ✅ I attended an English class. ('assist' means to help; 'attend' means to go to')",
      "❌ Don't be afraid to make questions. → ✅ Don't be afraid to ask questions. (English 'asks' a question, never 'makes' one)",
      "❌ I improve my listening by listening music. → ✅ ...by listening to music. ('listen to' + thing)",
      "❌ I am beginner. → ✅ I am a beginner. (article needed before a role/level noun)",
      "❌ I have started learning English when I was eight. → ✅ I started learning English when I was eight. (specific past time point → past simple)",
    ],
  },

  career_choices: {
    title: "Career Choices",
    intro: "Career vocabulary comes with a set of fixed prepositions (apply for, interested in, good at) plus present perfect for career history — and the same recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Talking about careers",
        body: ["Common career vocabulary and fixed prepositions."],
        examples: [
          "**apply for** a job, **interested in**, **good at**, **qualifications**, **internship**, **mentor**",
          "She **has had** three different jobs **since** she graduated.",
        ],
      },
      {
        heading: "Verbs + gerund",
        body: ["consider/avoid + gerund; 'thinking about' + gerund."],
        examples: [
          "He is **considering switching** to a different industry.",
          "He **avoided talking** about his salary.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I am agree that soft skills are important. → ✅ I agree that soft skills are important. ('agree' is a verb, no 'am')",
      "❌ Your success depends of how hard you work. → ✅ ...depends on how hard you work. ('depend on', not 'depend of')",
      "❌ I couldn't assist the job interview. → ✅ I couldn't attend the job interview. ('assist' means to help; 'attend' means to go to')",
      "❌ My brother is engineer at a tech company. → ✅ My brother is an engineer... (article needed before a profession)",
      "❌ I have started my new job last Monday. → ✅ I started my new job last Monday. (specific past time → past simple)",
    ],
  },

  time_management: {
    title: "Time Management",
    intro: "Time-management vocabulary pairs naturally with modals of advice (should) and gerunds after avoid/depend — plus the recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Talking about managing time",
        body: ["Common time-management vocabulary and collocations."],
        examples: [
          "**prioritise**, **procrastination**, **deadline**, **delegate**, **to-do list**, **switch off**",
          "You **should set** a timer to stay focused.",
        ],
      },
      {
        heading: "Verbs + gerund",
        body: ["avoid + gerund; depend on + noun/gerund."],
        examples: [
          "Try to **avoid checking** your phone every five minutes.",
          "How much you achieve **depends on** how well you plan your day.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I have to assist a time-management workshop. → ✅ I have to attend a time-management workshop. ('assist' means to help; 'attend' means to go to')",
      "❌ The team meeting has place every Monday. → ✅ The team meeting takes place every Monday. ('take place', not 'have place')",
      "❌ I eventually check my emails two or three times. → ✅ I occasionally check my emails... ('eventually' means 'in the end'; Spanish 'eventualmente' means 'occasionally')",
      "❌ Good time manager always makes a schedule. → ✅ A good time manager always makes a schedule. (article needed before a role noun)",
      "❌ She has completed the report yesterday. → ✅ She completed the report yesterday. (specific past time → past simple)",
    ],
  },

  free_time_hobbies: {
    title: "Free Time and Hobbies",
    intro: "This B1 hobbies topic builds on gerunds after enjoy/spend time, plus present perfect for how long you've had a hobby — and the same recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Talking about hobbies and their benefits",
        body: ["Common hobby vocabulary."],
        examples: ["**unwind**, **acquire new skills**, **fulfilling**, **recharge**, **take up** a hobby, **passionate about**"],
      },
      {
        heading: "Duration and gerunds",
        body: [
          "Present perfect (continuous) + for/since for how long.",
          "enjoy/spend time/avoid + gerund; comparisons also use a gerund after 'than'.",
        ],
        examples: [
          "She **has been collecting** stamps **since** she was a child.",
          "I **enjoy reading** books in my free time.",
          "Painting is **more relaxing than watching** TV.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I realized a painting course last year. → ✅ I did a painting course last year. ('realize' means to become aware of, not to carry out)",
      "❌ In my opinion I think that hiking is the best hobby. → ✅ In my opinion, hiking is the best hobby. (don't combine 'in my opinion' and 'I think')",
      "❌ Whether I go hiking depends of the weather. → ✅ ...depends on the weather. ('depend on', not 'depend of')",
      "❌ I am painter in my free time. → ✅ I am a painter in my free time. (article needed before a role noun)",
      "❌ I have taken up painting three years ago. → ✅ I took up painting three years ago. (specific past time → past simple)",
    ],
  },

  social_media: {
    title: "Social Media",
    intro: "'Social media' and 'people' are grammatically tricky (singular vs plural verb agreement), and this topic drills gerunds after 'addicted to' — plus the recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Talking about social media",
        body: [
          "'Social media' takes a singular verb, even though it sounds plural.",
          "'People' is always plural in English.",
          "addicted to + gerund",
        ],
        examples: [
          "Social media **has** changed how young people communicate.",
          "**People are** worried about fake news. (not 'the people is')",
          "My little brother is **addicted to checking** his phone.",
        ],
      },
      {
        heading: "Common vocabulary",
        body: ["Fixed terms for describing online behaviour."],
        examples: ["**goes viral**, **influencer**, **cyberbullying**, **social media detox**, **misinformation**"],
      },
    ],
    commonMistakes: [
      "❌ Social media have changed how businesses reach customers. → ✅ Social media has changed... ('social media' takes a singular verb)",
      "❌ The people is worried about fake news. → ✅ People are worried about fake news. ('people' is plural in English)",
      "❌ I am agree that social media can be dangerous. → ✅ I agree that social media can be dangerous. ('agree' is a verb, no 'am')",
      "❌ Whether a post goes viral depends of the algorithm. → ✅ ...depends on the algorithm. ('depend on', not 'depend of')",
      "❌ I have posted that photo yesterday. → ✅ I posted that photo yesterday. (specific past time → past simple)",
    ],
  },

  reading: {
    title: "Reading",
    intro: "Talking about books uses fixed prepositions (interested in, based on) and present perfect for lifetime reading experience — plus the recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Talking about books",
        body: ["Common vocabulary for discussing books and reading habits."],
        examples: [
          "**protagonist**, **plot**, **genre**, **gripping**, **bookworm**, **bestseller**",
          "This novel **is based on** a true story.",
          "She **is interested in** historical fiction.",
        ],
      },
      {
        heading: "Present perfect for experience",
        body: ["have/has + past participle for a lifetime experience or a count (e.g. how many times)."],
        examples: [
          "I **have read** that novel three times.",
          "This classic **has been translated** into over forty languages.",
        ],
      },
    ],
    commonMistakes: [
      "❌ He has read that novel when he was at university. → ✅ He read that novel when he was at university. (specific past time → past simple)",
      "❌ I am agree that this book deserves its awards. → ✅ I agree that this book deserves its awards. ('agree' is a verb, no 'am')",
      "❌ Whether I like a book depends of the characters. → ✅ ...depends on the characters. ('depend on', not 'depend of')",
      "❌ She is avid reader who finishes a book every week. → ✅ She is an avid reader... (article needed before a role noun)",
      "❌ I bought this novel at the library. → ✅ I bought this novel at the bookshop. ('library' = borrow books; Spanish 'librería' is a false friend for bookshop)",
    ],
  },

  city_vs_country: {
    title: "City Life vs. Country Life",
    intro: "Comparing city and country life relies on comparatives and fixed collocations (cost of living, sense of community) — plus the recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Comparing city and country life",
        body: ["Common vocabulary for describing each lifestyle."],
        examples: [
          "**cost of living**, **public transport**, **pollution**, **sense of community**, **peace and quiet**, **congestion**",
          "City life is **busier than** life in a small village.",
        ],
      },
      {
        heading: "Singular vs plural agreement",
        body: ["'City'/'countryside' are singular; 'people' and plural place-types take plural verbs."],
        examples: [
          "The **city has** more job opportunities.",
          "**Rural areas have** a stronger sense of community.",
        ],
      },
    ],
    commonMistakes: [
      "❌ When you arrive to the countryside... → ✅ When you arrive in the countryside... ('arrive in/at', never 'arrive to')",
      "❌ I live in countryside. → ✅ I live in the countryside. (needs 'the', unlike Spanish)",
      "❌ The people in my village is very friendly. → ✅ The people in my village are very friendly. ('people' is plural in English)",
      "❌ The commute is very large. → ✅ The commute is very long. ('large' = big in size; 'long' describes time/distance)",
      "❌ I have moved to the city two years ago. → ✅ I moved to the city two years ago. (specific past time → past simple)",
    ],
  },

  travel_and_holidays: {
    title: "Travel & Holidays",
    intro: "Travel vocabulary comes with fixed prepositions (arrive at, look forward to) and past simple for trip recounts — plus the recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Talking about a trip",
        body: ["Common travel vocabulary and fixed collocations."],
        examples: [
          "**pack**, **book in advance**, **take off**, **check in**, **boarding pass**, **jet lag**, **souvenir**",
          "We **arrived at** the airport two hours early.",
          "I'm **looking forward to seeing** the pyramids.",
        ],
      },
      {
        heading: "Talking about experiences",
        body: ["Present perfect for lifetime experience ('has been to'); past simple for a specific trip."],
        examples: [
          "**Have** you ever **been** to South America?",
          "We **went** to Spain last summer. (specific past time → past simple)",
        ],
      },
    ],
    commonMistakes: [
      "❌ We arrived to the airport two hours early. → ✅ We arrived at the airport two hours early. ('arrive at' for small places)",
      "❌ It was a large flight, almost twelve hours. → ✅ It was a long flight... ('large' = big in size; 'long' describes duration)",
      "❌ I'm looking forward to visit the pyramids. → ✅ ...to visiting the pyramids. ('look forward to' + gerund)",
      "❌ She is tour guide who knows the city well. → ✅ She is a tour guide... (article needed before a role noun)",
      "❌ I have visited Rome last year. → ✅ I visited Rome last year. (specific past time → past simple)",
    ],
  },

  passive_complex: {
    title: "Passive Voice — Complex Tenses",
    intro: "Beyond simple tenses, the passive can combine with continuous, perfect, modal, and reporting structures — the key is keeping 'be'/'been'/'being' in the right slot.",
    sections: [
      {
        heading: "Continuous and perfect passives",
        body: [
          "Present continuous passive: am/is/are + being + past participle",
          "Present perfect passive: has/have + been + past participle",
          "Past continuous passive: was/were + being + past participle",
          "Past perfect passive: had + been + past participle",
        ],
        examples: [
          "The suspect **is being questioned** by police.",
          "The project **has been completed**.",
          "Dinner **was being cooked** by my mum.",
          "By the time she arrived, the food **had been eaten**.",
        ],
      },
      {
        heading: "Modal passives",
        body: ["modal + be + past participle; modal + have been + past participle for the past."],
        examples: [
          "The homework **must be finished** by Friday.",
          "The package **might have been delivered** already.",
        ],
      },
      {
        heading: "Reporting passives",
        body: ["is said/thought/believed/reported + (to have) + past participle."],
        examples: [
          "The CEO **is reported to have resigned**.",
          "He **is believed to be living** abroad.",
        ],
      },
    ],
    commonMistakes: [
      "❌ The letters are been sent. → ✅ The letters are being sent. (present continuous passive: am/is/are + being)",
      "❌ The project has been completing. → ✅ The project has been completed. (past participle, not -ing)",
      "❌ The homework must finished by Friday. → ✅ The homework must be finished by Friday. (modal passive needs 'be')",
      "❌ The package might been delivered. → ✅ The package might have been delivered. (modal perfect passive needs 'have been')",
      "❌ He is thought to stole the money. → ✅ He is thought to have stolen the money. (perfect infinitive for past reference)",
    ],
  },

  causative_verbs: {
    title: "Causative Verbs (have/get/make/let)",
    intro: "Have/get + something + done means you arrange for someone else to do it; make/let + someone + base verb is about forcing or permitting — each pattern has its own fixed grammar.",
    sections: [
      {
        heading: "Arranging a service: have/get + object + past participle",
        body: ["Use when someone else does something for you."],
        examples: [
          "I **had my hair cut** yesterday.",
          "I need to **get my phone screen repaired**.",
        ],
      },
      {
        heading: "Directing a person: have/get + person + verb",
        body: [
          "have + person + bare infinitive",
          "get + person + to-infinitive",
        ],
        examples: [
          "I'**ll have the plumber check** the pipes tomorrow.",
          "She finally **got her brother to help** with the move.",
        ],
      },
      {
        heading: "Forcing or permitting: make/let + object + bare infinitive",
        body: ["make = force; let = permit — both take the bare infinitive, never 'to'."],
        examples: [
          "The teacher **made us sit** in silence.",
          "Our boss **lets us work** from home on Fridays.",
        ],
      },
    ],
    commonMistakes: [
      "❌ The teacher made us to sit in silence. → ✅ The teacher made us sit in silence. ('make' + bare infinitive, no 'to')",
      "❌ She got the plumber fix the leak. → ✅ She got the plumber to fix the leak. ('get' + person + to-infinitive)",
      "❌ My parents don't let me to stay out late. → ✅ ...don't let me stay out late. ('let' + bare infinitive, no 'to')",
      "❌ I need to have my shoes repair. → ✅ I need to have my shoes repaired. ('have' + object + past participle)",
      "❌ He had the electrician to check the wiring. → ✅ He had the electrician check the wiring. ('have' + person + bare infinitive, no 'to')",
    ],
  },

  embedded_questions: {
    title: "Embedded Questions",
    intro: "An embedded question (a question inside a longer sentence) always uses statement word order — the #1 rule is: never invert the subject and auxiliary.",
    sections: [
      {
        heading: "Form",
        body: [
          "Wh-question → statement word order, no 'do/does/did'.",
          "Yes/no question → if/whether + statement word order.",
        ],
        examples: [
          "**Do you know where** the post office **is**? (not 'where is the post office')",
          "**Could you tell me what time** the film **starts**? (not 'does the film start')",
          "**I'm not sure if** she**'s** coming.",
          "**I wonder whether** she has already left.",
        ],
      },
      {
        heading: "Common starters",
        body: ["Polite phrases that introduce an embedded question."],
        examples: ["**Do you know...**, **Could you tell me...**, **I wonder...**, **I'm not sure...**, **Do you have any idea...**"],
      },
    ],
    commonMistakes: [
      "❌ Do you know where is the nearest bank? → ✅ Do you know where the nearest bank is? (no inversion)",
      "❌ Can you tell me what does he want? → ✅ Can you tell me what he wants? (no auxiliary inversion)",
      "❌ She asked me if was I ready. → ✅ She asked me if I was ready. (statement word order after 'if')",
      "❌ Could you tell me where does he live? → ✅ Could you tell me where he lives? (drop 'does', statement order)",
      "❌ Could you explain me how does this work? → ✅ Could you explain how this works? ('explain' has no object here; no inversion)",
    ],
  },

  future_in_past: {
    title: "Future in the Past",
    intro: "Use these forms to describe the future as it looked from a point in the past — plans, imminent actions, and predictions that may or may not have come true.",
    sections: [
      {
        heading: "Plans and imminent actions",
        body: [
          "was/were going to + base verb — a past plan (often unfulfilled)",
          "was/were about to + base verb — something about to happen",
        ],
        examples: [
          "I **was going to go** for a run, but it started raining.",
          "I **was about to leave** the house when the phone rang.",
        ],
      },
      {
        heading: "Reported predictions and promises",
        body: ["'Will' backshifts to 'would' when reporting what someone thought or said about the future."],
        examples: [
          "She said she **would call** me back later.",
          "I never thought I **would live** abroad one day.",
        ],
      },
    ],
    commonMistakes: [
      "❌ She said she will call me. → ✅ She said she would call me. ('will' → 'would' in reported speech)",
      "❌ They was about to leave. → ✅ They were about to leave. (plural subject needs 'were')",
      "❌ I was going study medicine. → ✅ I was going to study medicine. ('going to' needs 'to')",
      "❌ We would to visit Rome. → ✅ We were going to visit Rome. (use 'was/were going to' for plans, not 'would to')",
      "❌ I knew she is going to win. → ✅ I knew she was going to win. (backshift 'is going to' → 'was going to')",
    ],
  },

  third_conditional: {
    title: "Third Conditional",
    intro: "Use the third conditional to imagine a different past — something that didn't happen, and what would have resulted if it had.",
    sections: [
      {
        heading: "Form",
        body: [
          "If + past perfect, + would have + past participle.",
          "Formal inversion: Had + subject + past participle (drops 'if').",
        ],
        examples: [
          "If she **had studied**, she **would have passed**.",
          "**Had** I **been** more careful, the accident wouldn't have happened.",
        ],
      },
      {
        heading: "Variations",
        body: ["might have / could have instead of 'would have' for a less certain result."],
        examples: [
          "If the fire alarm hadn't gone off, we **might not have escaped** in time.",
          "If you had told me, I **could have helped**.",
        ],
      },
    ],
    commonMistakes: [
      "❌ If she studied, she would passed. → ✅ If she had studied, she would have passed. (past perfect in if-clause, 'would have' + participle in result)",
      "❌ If they would have called, we would have known. → ✅ If they had called, we would have known. (never 'would have' in the if-clause)",
      "❌ If I had knew the answer... → ✅ If I had known the answer... (past participle 'known', not 'knew')",
      "❌ The project would been a success... → ✅ The project would have been a success... (don't drop 'have')",
      "❌ What would have you done...? → ✅ What would you have done...? (word order: subject before 'have')",
    ],
  },

  future_perfect: {
    title: "Future Perfect (will have + past participle)",
    intro: "Use the future perfect for an action that will already be completed before a specific point in the future — always with 'will have' + past participle.",
    sections: [
      {
        heading: "Form",
        body: [
          "will have + past participle, often with 'by' + a future time.",
          "Negative: won't have + past participle.",
          "Question: Will + subject + have + past participle?",
        ],
        examples: [
          "By June, she **will have finished** the course.",
          "She **won't have finished** her thesis by the deadline.",
          "**Will** they **have arrived** before the ceremony starts?",
        ],
      },
    ],
    commonMistakes: [
      "❌ By next year, I will finished my degree. → ✅ By next year, I will have finished my degree. (don't drop 'have')",
      "❌ She will has graduated by June. → ✅ She will have graduated by June. ('have', not 'has', after 'will')",
      "❌ They will have finish the project by Friday. → ✅ ...will have finished the project... (past participle after 'have')",
      "❌ By 2030, I have graduated from university. → ✅ By 2030, I will have graduated from university. (future deadline needs future perfect, not present perfect)",
      "❌ Will have she completed the report by Monday? → ✅ Will she have completed the report by Monday? (word order: Will + subject + have)",
    ],
  },

  wish_if_only: {
    title: "I wish / If only",
    intro: "Wish/if only follow the same three patterns as second and third conditionals — the tense you use signals whether you're wishing about now, the past, or someone's annoying behaviour.",
    sections: [
      {
        heading: "Wishing about now",
        body: [
          "wish/if only + past simple → a present regret.",
          "wish/if only + were (all persons, formal) → an unreal present state.",
          "wish/if only + could → a present ability you don't have.",
        ],
        examples: [
          "I **wish I had** more free time.",
          "If only **I were** taller!",
          "If only **I could speak** French!",
        ],
      },
      {
        heading: "Wishing about the past",
        body: ["wish/if only + past perfect → a regret about something that already happened."],
        examples: [
          "I **wish I had studied** harder for the exam last week.",
          "If only **I had known** what I know now back then!",
        ],
      },
      {
        heading: "Wishing someone/something would change",
        body: ["wish + would + base verb → criticising an annoying repeated behaviour or situation."],
        examples: [
          "I **wish you would stop** interrupting me.",
          "I **wish it would stop** raining.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I wish I have more free time. → ✅ I wish I had more free time. (past simple, not present simple)",
      "❌ If only I can speak French! → ✅ If only I could speak French! ('could', not 'can')",
      "❌ I wish you will stop interrupting me. → ✅ I wish you would stop interrupting me. ('would', not 'will')",
      "❌ If only she was here right now. → ✅ If only she were here right now. ('were' for all persons in formal style)",
      "❌ I wish I studied harder for the exam last week. → ✅ I wish I had studied harder... (past perfect for a past regret)",
    ],
  },

  gerunds_infinitives: {
    title: "Gerunds vs Infinitives",
    intro: "Some verbs are always followed by a gerund, others always by an infinitive, and a few (remember, stop, try) change meaning depending on which one follows.",
    sections: [
      {
        heading: "Always gerund",
        body: ["enjoy, finish, suggest, avoid, consider, admit, keep + -ing"],
        examples: [
          "I **enjoy visiting** new places.",
          "I **finished doing** my homework.",
          "He **suggested taking** a break.",
        ],
      },
      {
        heading: "Always infinitive",
        body: ["decide, agree, hope, promise, manage, refuse, afford + to + base verb"],
        examples: [
          "She **decided to leave** her job.",
          "They **agreed to accept** the plan.",
          "We **managed to meet** the deadline.",
        ],
      },
      {
        heading: "Verbs that change meaning",
        body: [
          "remember + -ing = recall a past action; remember + to = a future task not to forget.",
          "stop + -ing = stop an activity; stop + to = pause in order to do something else.",
          "try + -ing = experiment with a solution; try + to = make an effort at something difficult.",
        ],
        examples: [
          "I **remember watching** that film years ago. / Please **remember to lock** the door.",
          "She **stopped walking** to answer her phone. / He **stopped to buy** a coffee.",
          "**Try turning** the lights off to save energy. / I **tried to open** the window, but it was too high.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I enjoy to visit new places. → ✅ I enjoy visiting new places. ('enjoy' + gerund)",
      "❌ She decided leaving her job. → ✅ She decided to leave her job. ('decide' + infinitive)",
      "❌ He suggested to take a break. → ✅ He suggested taking a break. ('suggest' + gerund)",
      "❌ Please remember locking the door. → ✅ Please remember to lock the door. ('remember + infinitive' for a future task)",
      "❌ He stopped to walk when his phone rang, then carried on. → ✅ He stopped walking... ('stop + gerund' = stop the activity)",
    ],
  },

  past_modals_deduction: {
    title: "Past Modals of Deduction",
    intro: "Use modal + have + past participle to guess about the past — how confident you are (must/might/can't) or whether you regret an action (should/shouldn't have).",
    sections: [
      {
        heading: "Deductions about the past",
        body: [
          "must have + past participle → a strong, confident guess.",
          "might/could have + past participle → an uncertain possibility.",
          "can't have + past participle → something is impossible given the evidence.",
        ],
        examples: [
          "The lights are off — she **must have left** already.",
          "He wasn't at the party — he **might have forgotten** about it.",
          "She **can't have known** about the surprise — she looked so shocked.",
        ],
      },
      {
        heading: "Regrets and criticism",
        body: ["should have / shouldn't have + past participle → a past mistake or regret."],
        examples: [
          "I **should have studied** harder — I failed the exam.",
          "You **shouldn't have driven** so fast — you could have crashed!",
        ],
      },
    ],
    commonMistakes: [
      "❌ She must has left already. → ✅ She must have left already. ('have', not 'has')",
      "❌ He must have leave already. → ✅ He must have left already. (past participle, not base verb)",
      "❌ I might have went to the wrong address. → ✅ I might have gone to the wrong address. (irregular past participle 'gone')",
      "❌ You should have tell me earlier. → ✅ You should have told me earlier. (past participle 'told')",
      "❌ They must to have missed the bus. → ✅ They must have missed the bus. (no 'to' — it's just 'must have')",
    ],
  },

  describing_trends_data: {
    title: "Describing Trends & Data",
    intro: "Talking about graphs and statistics needs a specific set of verbs for change (rise vs raise), the right prepositions (by/to/from), and adjectives of degree.",
    sections: [
      {
        heading: "Verbs of change",
        body: [
          "rise/fall (intransitive, no object) vs raise (transitive, needs an object).",
          "Other verbs for change: increase, decrease, soar, plummet, fluctuate, recover, level off.",
        ],
        examples: [
          "House prices **rose** sharply last year. (not 'raised')",
          "The government **raised** taxes last year.",
          "Stock prices **plummeted** after the scandal.",
          "Sales grew fast, then **levelled off**.",
        ],
      },
      {
        heading: "Prepositions with numbers",
        body: [
          "increase/rise BY + amount of change",
          "rise TO + the new figure",
          "grow FROM X TO Y",
        ],
        examples: [
          "Sales increased **by** 15% last quarter.",
          "Prices rose **to** $50.",
          "Revenue grew **from** $2 million **to** $5 million.",
        ],
      },
      {
        heading: "Describing the shape of a trend",
        body: ["Adjectives/nouns for describing patterns."],
        examples: ["**an upward/downward trend**, **a sharp increase/decline**, **a slight increase**, **remain stable**, **reach a peak**, **hit a record low**"],
      },
    ],
    commonMistakes: [
      "❌ Prices raised sharply last year. → ✅ Prices rose sharply last year. ('rise' is intransitive)",
      "❌ The government rose taxes. → ✅ The government raised taxes. ('raise' needs an object)",
      "❌ Sales increased of 10%. → ✅ Sales increased by 10%. ('increase by', not 'of')",
      "❌ Prices have rose steadily. → ✅ Prices have risen steadily. (present perfect needs 'risen')",
      "❌ The number of tourists have doubled. → ✅ The number of tourists has doubled. ('the number of' takes a singular verb)",
    ],
  },

  workplace_professional_vocabulary: {
    title: "Workplace & Professional Vocabulary",
    intro: "Professional English runs on fixed collocations (hand in your notice, meet a deadline, pay rise) — getting the exact word pairing right matters more than the individual words.",
    sections: [
      {
        heading: "Applying, starting, and leaving a job",
        body: ["Fixed phrases for the stages of employment."],
        examples: [
          "**apply for** a promotion, a **job interview**, a **job offer**, a **probation period**",
          "She **handed in her notice** after accepting a new job.",
          "He decided to **resign** from his position.",
        ],
      },
      {
        heading: "Day-to-day work vocabulary",
        body: ["Common collocations for describing your working life."],
        examples: [
          "**schedule a meeting**, **meet a deadline**, **work overtime**, **take sick leave**, **give feedback**, **workload**",
          "You can always **count on** him — he's very **reliable**.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I need to scheduling a meeting. → ✅ I need to schedule a meeting. (base verb after 'need to')",
      "❌ She hand in her notice last week. → ✅ She handed in her notice last week. (past simple needs -ed)",
      "❌ We meet the deadline last week. → ✅ We met the deadline last week. (irregular past simple 'met')",
      "❌ She finally got a rise pay. → ✅ She finally got a pay rise. (fixed word order: 'pay rise')",
      "❌ He received a job offer of the company. → ✅ He received a job offer from the company. ('offer from', not 'of')",
    ],
  },

  advanced_idioms_expressions: {
    title: "Advanced Idioms & Expressions",
    intro: "These idioms are fixed phrases with their own exact wording and prepositions — the meaning is figurative, so you can't guess it from the individual words.",
    sections: [
      {
        heading: "Starting, deciding, and finishing",
        body: ["Idioms about beginning, agreeing, and stopping."],
        examples: [
          "Let's **get the ball rolling** on this project. (start something)",
          "I think we're all **on the same page**. (in agreement)",
          "After the failure, they went **back to the drawing board**. (start over)",
          "It's 6pm — let's **call it a day**. (stop working)",
        ],
      },
      {
        heading: "Facing difficulty and taking risks",
        body: ["Idioms about tough decisions and consequences."],
        examples: [
          "We need to **bite the bullet** and tell him the bad news. (face something difficult)",
          "They **cut corners** to finish faster, and quality suffered. (do something badly to save time/money)",
          "He's already **on thin ice** with his boss. (in a risky/precarious situation)",
          "If you don't apply soon, you might **miss the boat**. (lose an opportunity)",
        ],
      },
      {
        heading: "Describing situations",
        body: ["Idioms describing frequency, cost, and surprise."],
        examples: [
          "He visits his hometown **once in a blue moon**. (very rarely)",
          "That holiday **cost an arm and a leg**! (very expensive)",
          "The news came completely **out of the blue**. (unexpectedly)",
          "Working from home gives her **the best of both worlds**.",
        ],
      },
    ],
    commonMistakes: [
      "❌ We need to bit the bullet. → ✅ We need to bite the bullet. (base verb after 'need to')",
      "❌ He visits us once in the blue moon. → ✅ He visits us once in a blue moon. ('a', not 'the')",
      "❌ I think we're in the same page. → ✅ I think we're on the same page. ('on', not 'in')",
      "❌ They went back at the drawing board. → ✅ They went back to the drawing board. ('back to', not 'back at')",
      "❌ Let's call it the day. → ✅ Let's call it a day. ('a day', not 'the day')",
    ],
  },

  persuading_disagreeing_advanced: {
    title: "Persuading & Disagreeing (Advanced)",
    intro: "These are formal, essay- and debate-style phrases for arguing a point, conceding partially, and disagreeing politely — each is a fixed expression with its own exact wording.",
    sections: [
      {
        heading: "Presenting an argument",
        body: ["Formal ways to introduce an opinion or weigh two sides."],
        examples: [
          "**I'd argue that** remote work has made teams more productive.",
          "**It could be argued that** the policy was rushed.",
          "**On the one hand**, it saves money; **on the other hand**, it risks quality.",
        ],
      },
      {
        heading: "Conceding before disagreeing",
        body: ["Acknowledge the other view first, then add a contrast with 'but'."],
        examples: [
          "**I take your point, but** I still think we should wait.",
          "**That's a fair point, but** it doesn't account for long-term costs.",
          "**I see where you're coming from**, but I still see it differently.",
        ],
      },
      {
        heading: "Polite and formal disagreement",
        body: ["Softened or formal ways to say 'I disagree'."],
        examples: [
          "**I'm not entirely convinced** by that argument.",
          "**I beg to differ** — the data suggests the opposite.",
          "**With all due respect**, I think you're mistaken.",
          "Let's just **agree to disagree** on this one.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I'd argue what the policy has failed. → ✅ I'd argue that the policy has failed. ('argue that', not 'what')",
      "❌ On the one hand...; in the other, it's slower. → ✅ ...on the other, it's slower. ('on the other', not 'in the other')",
      "❌ I agree with a certain extent. → ✅ I agree to a certain extent. ('to a certain extent')",
      "❌ I'm not entire convinced. → ✅ I'm not entirely convinced. (adverb 'entirely', not adjective 'entire')",
      "❌ With all due respects... → ✅ With all due respect... (fixed singular 'respect')",
    ],
  },

  education_systems: {
    title: "Education Systems",
    intro: "Education vocabulary comes with fixed collocations (focus on, responsible for) and present perfect for change over time — plus the recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Talking about education systems",
        body: ["Common education vocabulary."],
        examples: [
          "**compulsory** education, **curriculum**, **scholarship**, **tuition fees**, **vocational training**, **critical thinking**",
          "The curriculum **focuses on** practical skills as well as theory.",
        ],
      },
      {
        heading: "Change over time",
        body: ["Present perfect for change continuing to now."],
        examples: [
          "Tuition fees **have increased** sharply in the last decade.",
          "Finland **has changed** its education system significantly over the past decade.",
        ],
      },
    ],
    commonMistakes: [
      "❌ During the lecture, students made questions. → ✅ ...students asked questions. (English 'asks' a question, never 'makes' one)",
      "❌ Your grade depends of how well you do. → ✅ ...depends on how well you do. ('depend on', not 'depend of')",
      "❌ My mother is teacher at a primary school. → ✅ My mother is a teacher... (article needed before a profession)",
      "❌ Students should avoid to fail. → ✅ Students should avoid failing. ('avoid' + gerund)",
      "❌ I have finished my degree in 2020. → ✅ I finished my degree in 2020. (specific past time → past simple)",
    ],
  },

  work_life_balance: {
    title: "Work-Life Balance",
    intro: "This topic pairs workplace vocabulary with fixed phrasal verbs (switch off, set boundaries) — plus the recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Talking about balance and burnout",
        body: ["Common work-life balance vocabulary."],
        examples: [
          "**burnout**, **flexible hours**, **switch off**, **set boundaries**, **four-day working week**, **hustle culture**",
          "It's important to **switch off** at the end of the day.",
        ],
      },
      {
        heading: "Advice and consequence",
        body: ["should for advice; second conditional for a hypothetical improvement."],
        examples: [
          "You **should take** regular breaks to avoid burnout.",
          "If companies offered more flexibility, employees **would feel** less stressed.",
        ],
      },
    ],
    commonMistakes: [
      "❌ She was embarrassed with her first child. → ✅ She was pregnant with her first child. ('embarrassed' ≠ 'pregnant' — a false friend)",
      "❌ My boss is very sympathetic. → ✅ My boss is very friendly. ('sympathetic' means compassionate about a problem, not friendly)",
      "❌ I always make a pause at midday. → ✅ I always take a break at midday. ('take a break', not 'make a pause')",
      "❌ I am agree that companies should offer flexible hours. → ✅ I agree that... ('agree' is a verb, no 'am')",
      "❌ I am working too much hours. → ✅ I am working too many hours. ('too many' with countable plural nouns)",
    ],
  },

  success_motivation: {
    title: "Success and Motivation",
    intro: "Talking about goals and achievement uses present perfect for progress made so far, plus a set of fixed collocations (depend on, proud of) — and the recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Talking about goals and mindset",
        body: ["Common success/motivation vocabulary."],
        examples: [
          "**goals**, **role model**, **growth mindset**, **resilience**, **procrastination**, **stepping stone**",
          "Success often **depends on** persistence rather than talent alone.",
        ],
      },
      {
        heading: "Progress so far",
        body: ["Present perfect + for/since for ongoing effort."],
        examples: [
          "She **has worked** hard for this promotion **for** the last two years.",
          "He **has stayed** motivated **since** he started his own company.",
        ],
      },
    ],
    commonMistakes: [
      "❌ My coach is very sensible about my feelings. → ✅ My coach is very sensitive about my feelings. ('sensible' means practical/wise; 'sensitive' is about emotions)",
      "❌ After finishing his career, he got a job. → ✅ After finishing his degree, he got a job. ('career' ≠ 'degree' — false friend)",
      "❌ Successful people don't avoid to fail. → ✅ ...don't avoid failing. ('avoid' + gerund)",
      "❌ She is very interested on personal development. → ✅ ...interested in personal development. ('interested in', not 'on')",
      "❌ I have achieved this goal last year. → ✅ I achieved this goal last year. (specific past time → past simple)",
    ],
  },

  cultural_differences: {
    title: "Cultural Differences",
    intro: "Describing cultural differences uses fixed collocations (different from, aware of) and present perfect for lived experience — plus the recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Talking about cultural differences",
        body: ["Common vocabulary for discussing culture and customs."],
        examples: [
          "**culture shock**, **body language**, **etiquette**, **stereotypes**, **multicultural**, **adapt to**",
          "Table manners in Japan are very **different from** table manners in Spain.",
          "Travellers should be **aware of** local customs.",
        ],
      },
      {
        heading: "Talking about experience",
        body: ["Present perfect for accumulated life experience."],
        examples: ["She **has lived** in three different countries, so she understands cultural differences well."],
      },
    ],
    commonMistakes: [
      "❌ In my country, we make a big party. → ✅ ...we have a big party. ('have/throw a party', never 'make a party')",
      "❌ Table manners are very different of Spain. → ✅ ...different from Spain. ('different from', not 'different of')",
      "❌ My host family was very sympathetic. → ✅ My host family was very kind. ('sympathetic' means compassionate about a problem, not friendly)",
      "❌ I look forward to visit different countries. → ✅ ...to visiting different countries. ('look forward to' + gerund)",
      "❌ I have visited Japan last year. → ✅ I visited Japan last year. (specific past time → past simple)",
    ],
  },

  climate_change: {
    title: "Climate Change",
    intro: "Climate change vocabulary comes with fixed prepositions (responsible for, protect from) and passive voice for large-scale processes — plus the recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Talking about causes and effects",
        body: ["Common climate vocabulary."],
        examples: [
          "**greenhouse gases**, **fossil fuels**, **renewable energy**, **carbon footprint**, **deforestation**, **rising sea levels**",
          "Factories are **responsible for** a large percentage of emissions.",
        ],
      },
      {
        heading: "Passive voice for large-scale action",
        body: ["Passive voice is common when describing what's being done, rather than who is doing it."],
        examples: [
          "Carbon emissions **can be reduced** through renewable energy investment.",
          "Thousands of hectares of forest **have been destroyed** by wildfires this year.",
        ],
      },
    ],
    commonMistakes: [
      "❌ We should avoid to use single-use plastic. → ✅ ...avoid using single-use plastic. ('avoid' + gerund)",
      "❌ Factories are responsible of emissions. → ✅ ...responsible for emissions. ('responsible for', not 'responsible of')",
      "❌ Some governments don't do nothing. → ✅ ...don't do anything. (only one negative per clause)",
      "❌ The pollution is destroying our planet. → ✅ Pollution is destroying our planet. (no article for general/abstract nouns)",
      "❌ Scientists have discovered new evidence last month. → ✅ Scientists discovered new evidence last month. (specific past time → past simple)",
    ],
  },

  fast_fashion: {
    title: "Fast Fashion",
    intro: "Fast fashion vocabulary comes with fixed collocations (criticised for, accused of, alternative to) — plus the recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Talking about the fashion industry",
        body: ["Common fast fashion vocabulary."],
        examples: [
          "**landfill**, **second-hand**, **sustainable**, **capsule wardrobe**, **conscious consumer**, **greenwashing**",
          "Fast fashion has been **criticised for** exploiting workers.",
          "The company was **accused of** exploiting workers.",
        ],
      },
      {
        heading: "Hypothetical improvement",
        body: ["Second conditional for imagining a better outcome."],
        examples: ["If people bought fewer clothes, the industry **would produce** less waste."],
      },
    ],
    commonMistakes: [
      "❌ Consumers try to avoid to buy unethical clothes. → ✅ ...avoid buying unethical clothes. ('avoid' + gerund)",
      "❌ Young consumers are more interested on sustainable fashion. → ✅ ...interested in sustainable fashion. ('interested in', not 'on')",
      "❌ My aunt works in factory. → ✅ My aunt works in a factory. (article needed before a singular countable noun)",
      "❌ Brands own fabrics in countries where labour is cheap. → ✅ ...own factories... ('fabric' ≠ 'factory' — false friend)",
      "❌ Fast fashion has become popular in the 1990s. → ✅ Fast fashion became popular in the 1990s. (specific past decade → past simple)",
    ],
  },

  technology_daily_life: {
    title: "Technology in Daily Life",
    intro: "Technology vocabulary treats terms like 'artificial intelligence' as singular, and pairs with fixed prepositions (dependent on, protect from) — plus the recurring Spanish-L1 traps.",
    sections: [
      {
        heading: "Talking about technology",
        body: [
          "'Artificial intelligence' and similar mass concepts take a singular verb.",
          "Common technology vocabulary.",
        ],
        examples: [
          "Artificial intelligence **has changed** many industries. (not 'have changed')",
          "**digital natives**, **streaming**, **cybersecurity**, **digital divide**, **work remotely**",
          "Cybersecurity protects computers **from** hackers.",
        ],
      },
      {
        heading: "Present perfect passive for big changes",
        body: ["have/has been + past participle for changes affecting a whole industry."],
        examples: ["Many factory jobs **have been replaced** by robots and automated machines."],
      },
    ],
    commonMistakes: [
      "❌ Actually, most people use their phone for social media. → ✅ Nowadays, most people use their phone... ('actually' means 'in fact', not 'nowadays'/'currently')",
      "❌ My phone battery lasts a large time. → ✅ ...lasts a long time. ('large' = big in size; 'long' describes duration)",
      "❌ I have this laptop since five years. → ✅ I have had this laptop for five years. ('for' + duration, and 'have had' not 'have')",
      "❌ Many people listen music while they commute. → ✅ ...listen to music... ('listen to' + thing)",
      "❌ She has downloaded that app last week. → ✅ She downloaded that app last week. (specific past time → past simple)",
    ],
  },

  present_simple: {
    title: "Present Simple",
    intro: "The foundation of present simple: add -s for he/she/it, and use do/does for negatives and questions — never both at once.",
    sections: [
      {
        heading: "Positive form",
        body: ["Add -s (or -es) to the verb for he/she/it; no ending for I/you/we/they."],
        examples: [
          "She **goes** to school every day.",
          "He **studies** English on Mondays. (consonant + y → ies)",
          "I **live** in Madrid. (no -s for 'I')",
        ],
      },
      {
        heading: "Negative and questions",
        body: [
          "Negative: don't/doesn't + base verb.",
          "Question: Do/Does + subject + base verb?",
        ],
        examples: [
          "He **doesn't like** coffee.",
          "**Does** she **speak** English?",
          "They **don't watch** TV in the morning.",
        ],
      },
    ],
    commonMistakes: [
      "❌ He don't like coffee. → ✅ He doesn't like coffee. (he/she/it needs 'doesn't')",
      "❌ Do she like music? → ✅ Does she like music? (he/she/it needs 'does')",
      "❌ She doesn't goes to the gym. → ✅ She doesn't go to the gym. (base verb after 'doesn't', no -s)",
      "❌ I doesn't understand. → ✅ I don't understand. ('I' needs 'don't')",
      "❌ She don't never eat meat. → ✅ She never eats meat. (only one negative — don't combine 'don't' and 'never')",
    ],
  },

  there_is_are: {
    title: "There is / There are",
    intro: "Use 'there is/are' to say something exists — the choice between is/are depends on whether the noun after it is singular or plural.",
    sections: [
      {
        heading: "Positive and negative",
        body: [
          "There is + singular/uncountable noun.",
          "There are + plural noun.",
          "Negative: there isn't / there aren't (+ any).",
        ],
        examples: [
          "**There is** a cat in the garden.",
          "**There are** many students in the class.",
          "**There isn't** any bread left.",
          "**There aren't** any shops in this village.",
        ],
      },
      {
        heading: "Questions",
        body: ["Is there / Are there + noun?"],
        examples: [
          "**Is there** a bank near here?",
          "**Are there** any apples on the table?",
          "**How many rooms are there** in your house?",
        ],
      },
      {
        heading: "Past: there was/were",
        body: ["was for singular, were for plural — same pattern as is/are."],
        examples: [
          "**There was** a queue outside the shop.",
          "**There were** a lot of people at the concert.",
        ],
      },
    ],
    commonMistakes: [
      "❌ There are a big supermarket. → ✅ There is a big supermarket. (singular noun → 'there is')",
      "❌ Is there some apples? → ✅ Are there any apples? (plural → 'are there', and 'any' in questions)",
      "❌ There aren't no shops. → ✅ There aren't any shops. (only one negative)",
      "❌ It is a nice park near the school. → ✅ There is a nice park near the school. (use 'there is/are' to say something exists, not 'it is')",
      "❌ There was a lot of people. → ✅ There were a lot of people. ('people' is plural → 'were')",
    ],
  },

  can_cant: {
    title: "Can / Can't (Ability & Permission)",
    intro: "'Can' never changes form and is always followed by the bare infinitive — no 's', no 'to', in any sentence.",
    sections: [
      {
        heading: "Ability",
        body: ["can/can't + base verb, for what someone is/isn't able to do."],
        examples: [
          "I **can speak** two languages.",
          "She **can't drive** — she's only ten.",
          "**Can** you **swim**?",
        ],
      },
      {
        heading: "Permission",
        body: ["Can I/we...? to ask permission; can't for what's not allowed."],
        examples: [
          "**Can I** open the window?",
          "You **can't park** here. It's not allowed.",
        ],
      },
      {
        heading: "Past: could/couldn't",
        body: ["could/couldn't = the past form of can, for ability someone had (or didn't have) before."],
        examples: [
          "I **could** climb trees when I was young.",
          "I **couldn't swim** when I was five.",
        ],
      },
    ],
    commonMistakes: [
      "❌ He can to play piano. → ✅ He can play piano. (no 'to' after 'can')",
      "❌ I cans speak English. → ✅ I can speak English. ('can' never takes -s)",
      "❌ She can sings very well. → ✅ She can sing very well. (base verb after 'can', no -s)",
      "❌ Can he speaks French? → ✅ Can he speak French? (base verb, no -s, even in questions)",
      "❌ She can't to drive. → ✅ She can't drive. (no 'to' after 'can't')",
    ],
  },

  present_continuous_a1: {
    title: "Present Continuous (What are you doing?)",
    intro: "Use am/is/are + verb-ing for what's happening right now — the spelling of the -ing form has a few small rules worth knowing.",
    sections: [
      {
        heading: "Form",
        body: [
          "I + am; he/she/it + is; you/we/they + are, + verb-ing.",
          "Negative: am/is/are + not + verb-ing.",
          "Question: Am/Is/Are + subject + verb-ing?",
        ],
        examples: [
          "**I am writing** an email right now.",
          "**She is reading** a book.",
          "**They are not watching** TV.",
          "**What are you doing?**",
        ],
      },
      {
        heading: "Spelling of -ing",
        body: [
          "Most verbs: just add -ing.",
          "Short vowel + consonant: double the final consonant.",
          "Verb ends in -e: drop the -e, add -ing.",
          "Verb ends in -y: keep the y, just add -ing.",
        ],
        examples: [
          "watch → **watching**",
          "run → **running**, sit → **sitting**, swim → **swimming**",
          "dance → **dancing**",
          "cry → **crying**",
        ],
      },
    ],
    commonMistakes: [
      "❌ I am watch TV. → ✅ I am watching TV. (need -ing on the main verb)",
      "❌ He is sleeps. → ✅ He is sleeping. ('is' + verb-ing, not verb-s)",
      "❌ They is playing in the garden. → ✅ They are playing in the garden. (plural subject needs 'are')",
      "❌ She is runing. → ✅ She is running. (double the final consonant: run → running)",
      "❌ What you are doing right now? → ✅ What are you doing right now? (question word order: 'are' before the subject)",
    ],
  },

  possessive_s: {
    title: "Possessive 's",
    intro: "Add 's to a singular noun to show ownership; for a plural noun already ending in -s, just add the apostrophe — never double the s.",
    sections: [
      {
        heading: "Singular possessive: 's",
        body: ["Name/singular noun + 's + the thing owned."],
        examples: [
          "This is **my father's** car.",
          "**Tom's** new house",
          "the **teacher's** desk",
        ],
      },
      {
        heading: "Plural possessive: s'",
        body: ["Plural noun already ending in -s + just an apostrophe."],
        examples: [
          "**my parents'** house",
          "the **students'** notebooks",
          "the **boys'** bikes",
        ],
      },
      {
        heading: "Irregular plurals: still 's",
        body: ["A plural noun that doesn't end in -s (like 'children') takes 's, just like a singular noun."],
        examples: ["the **children's** room"],
      },
    ],
    commonMistakes: [
      "❌ This is my sisters cat. → ✅ This is my sister's cat. (missing apostrophe for a singular possessive)",
      "❌ This is my parents house. → ✅ This is my parents' house. (plural possessive needs an apostrophe after the s)",
      "❌ The childrens room is upstairs. → ✅ The children's room is upstairs. ('children' is already plural — it takes 's, not s')",
      "❌ This is my auntss house. → ✅ This is my aunt's house. (only ever add 's, never double s)",
      "❌ This is the sister of Tom. → ✅ This is Tom's sister. (use possessive 's for people, not 'of')",
    ],
  },

  days_dates_prepositions_time: {
    title: "Days and Dates + Prepositions of Time",
    intro: "Time prepositions follow a simple size pattern: 'at' for a precise point, 'on' for a day/date, 'in' for a longer period.",
    sections: [
      {
        heading: "The three prepositions",
        body: [
          "at + a clock time (a precise point).",
          "on + a day or a specific date.",
          "in + a month, year, or part of the day.",
        ],
        examples: [
          "The meeting is **at** 6 o'clock.",
          "My class is **on** Monday. / The party is **on** May 10th.",
          "My birthday is **in** July. / I study **in** the morning.",
        ],
      },
      {
        heading: "Exceptions to remember",
        body: ["When a part of the day is tied to one specific day, 'on' wins over 'in'."],
        examples: ["Her party is **on** Saturday morning. (not 'in Saturday morning')"],
      },
    ],
    commonMistakes: [
      "❌ I go to English class in Friday. → ✅ ...on Friday. ('on' with days)",
      "❌ My birthday is on July. → ✅ My birthday is in July. ('in' with months)",
      "❌ The lesson starts in 8 o'clock. → ✅ ...at 8 o'clock. ('at' with clock times)",
      "❌ Christmas is in December 25th. → ✅ Christmas is on December 25th. ('on' with a specific date)",
      "❌ We meet at the morning. → ✅ We meet in the morning. ('in' with parts of the day)",
    ],
  },

  house_objects_rooms_there_is_are: {
    title: "Objects and Rooms in the House",
    intro: "Describing your home combines 'there is/are' with basic place prepositions (in, on, under) and the vocabulary for rooms and furniture.",
    sections: [
      {
        heading: "Rooms and furniture",
        body: ["Common house vocabulary."],
        examples: [
          "**kitchen**, **living room**, **bedroom**, **bathroom**",
          "**sofa**, **table**, **lamp**, **bed**, **mirror**, **rug**, **chairs**",
        ],
      },
      {
        heading: "There is/are + in/on/under",
        body: [
          "There is + singular; there are + plural.",
          "in = inside something; on = on a surface; under = below something.",
        ],
        examples: [
          "**There is** a sofa in the living room.",
          "**There are** two chairs in the kitchen.",
          "The books are **in** the bag. The lamp is **on** the table. The rug is **under** the table.",
        ],
      },
    ],
    commonMistakes: [
      "❌ There are a table in the dining room. → ✅ There is a table in the dining room. (singular noun → 'there is')",
      "❌ There is two bedrooms. → ✅ There are two bedrooms. (plural noun → 'there are')",
      "❌ The lamp is in the table. → ✅ The lamp is on the table. ('on' for a surface)",
      "❌ Are there a bathroom upstairs? → ✅ Is there a bathroom upstairs? (singular → 'is there')",
      "❌ There aren't a sofa in the living room. → ✅ There isn't a sofa in the living room. (singular negative → 'isn't')",
    ],
  },

  possessive_adjectives_pronouns: {
    title: "Possessive Adjectives vs Possessive Pronouns",
    intro: "Possessive adjectives (my, your, her) go before a noun; possessive pronouns (mine, yours, hers) stand completely alone, with no noun after them.",
    sections: [
      {
        heading: "Before a noun: possessive adjectives",
        body: ["my, your, his, her, its, our, their + noun"],
        examples: [
          "This is **my** book.",
          "Is this **your** phone?",
          "That is **her** jacket.",
        ],
      },
      {
        heading: "Alone: possessive pronouns",
        body: ["mine, yours, his, hers, its, ours, theirs — no noun follows."],
        examples: [
          "This book is **mine**.",
          "The phone is **yours**.",
          "That jacket is **hers**.",
        ],
      },
    ],
    commonMistakes: [
      "❌ This is mine pen. → ✅ This is my pen. (use 'my' before a noun)",
      "❌ That jacket is her. → ✅ That jacket is hers. (use 'hers' with no noun after it)",
      "❌ It is your. → ✅ It is yours. (use 'yours' with no noun after it)",
      "❌ This is theirs house. → ✅ This is their house. (use 'their' before a noun)",
    ],
  },

  prepositions_place: {
    title: "Prepositions of Place",
    intro: "Prepositions of place describe exactly where something is — many are single words (under, behind, near), but a few are fixed multi-word phrases (next to, in front of, on top of) that always need their extra word.",
    sections: [
      {
        heading: "Single-word prepositions",
        body: ["under, on, in, above, near, behind, opposite"],
        examples: [
          "The cat is **under** the table.",
          "My keys are **in** my bag.",
          "There's a shelf **above** my desk.",
          "The cinema is **opposite** the shopping centre.",
        ],
      },
      {
        heading: "Fixed multi-word phrases",
        body: ["These always need their extra word — never drop it."],
        examples: [
          "The dog is sleeping **next to** the sofa. (not 'next the sofa')",
          "She's standing **in front of** the door. (not 'in front the door')",
          "I keep my keys **on top of** the fridge. (not 'on top the fridge')",
        ],
      },
      {
        heading: "Between vs next to vs near",
        body: ["'Between' needs two things around it; 'next to' means right beside; 'near' means not far away, less exact."],
        examples: [
          "The bakery is **between** the bank and the pharmacy.",
          "The board is **next to** the door.",
          "My house is **near** the train station.",
        ],
      },
    ],
    commonMistakes: [
      "❌ The cat is in the table. → ✅ The cat is under the table. ('under' for something below, not 'in')",
      "❌ The bank is next the supermarket. → ✅ ...next to the supermarket. ('next to' always needs 'to')",
      "❌ There's a lamp on top the desk. → ✅ ...on top of the desk. ('on top of' always needs 'of')",
      "❌ The car is parked behind of the house. → ✅ ...behind the house. ('behind' never needs 'of')",
      "❌ Look in side the box. → ✅ Look inside the box. ('inside' is one word)",
    ],
  },
};
