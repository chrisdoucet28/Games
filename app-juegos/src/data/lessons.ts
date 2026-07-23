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
};
