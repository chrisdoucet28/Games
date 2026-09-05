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
          "Many common verbs are irregular and don't take -ed at all (go → went, eat → ate, see → saw).",
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
      {
        heading: "Questions with a question word",
        body: [
          "A yes/no question is Did + subject + base verb?",
          "To ask for specific information, put the question word (What/Where/When/Why/Who) before 'did'.",
        ],
        examples: [
          "**Did** she cook dinner? (yes/no)",
          "**What did** she cook? (asks what the food was)",
          "**Where did** they travel last summer?",
          "**Why did** he leave the party early?",
        ],
      },
      {
        heading: "Joining two past events in one sentence",
        body: [
          "'When', 'before', 'after', 'because', and 'although' can join two past simple clauses into one sentence.",
          "When the joining word starts the sentence, put a comma after the first clause.",
        ],
        examples: [
          "**When** the rain started, we didn't finish the match.",
          "**Before** he left, he didn't lock the door.",
          "**Although** she studied hard, she didn't pass the exam.",
          "We didn't finish the match **when** the rain started. (no comma needed if the joining word comes in the middle)",
        ],
      },
    ],
    commonMistakes: [
      "❌ She goed to school. → ✅ She went to school. (irregular verb)",
      "❌ Did you called her? → ✅ Did you call her? (base verb after 'did', no -ed)",
      "❌ I didn't went. → ✅ I didn't go. (base verb after 'didn't')",
      "❌ He studyed all night. → ✅ He studied all night. (y → i before -ed)",
      "❌ What she cooked? → ✅ What did she cook? (question word still needs 'did' + base verb)",
      "❌ When the rain started we didn't finish the match. → ✅ When the rain started, we didn't finish the match. (comma after a fronted 'when' clause)",
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
    ],
    commonMistakes: [
      "❌ Where does she works? → ✅ Where does she work? (base verb after 'does')",
      "❌ What you did yesterday? → ✅ What did you do yesterday?",
      "❌ How long does it takes? → ✅ How long does it take? (base verb after 'does')",
      "❌ Where you are going on holiday? → ✅ Where are you going on holiday? (auxiliary before the subject)",
    ],
  },

  subject_object_questions: {
    title: "Subject vs Object Questions",
    intro: "Every sentence has a subject (who or what does the action) and often an object (who or what receives the action). When you turn a sentence into a question about the SUBJECT, you don't add do/does/did. When you ask about the OBJECT, you do.",
    sections: [
      {
        heading: "The rule",
        body: [
          "Statement: SUBJECT + verb + OBJECT.",
          "Subject question: ask about the subject → question word + verb (+ object). No do/does/did.",
          "Object question: ask about the object → question word + do/does/did + subject + base verb.",
        ],
        examples: [
          "Someone broke the window. → **Who broke** the window? (subject question)",
          "You broke something. → **What did you break**? (object question)",
        ],
      },
      {
        heading: "Subject questions — present simple",
        body: [
          "The question word takes the place of the subject, so the verb still needs its normal present-simple ending (-s for he/she/it).",
        ],
        examples: [
          "**Who owns** this house?",
          "**What makes** you happy?",
          "**Which team wins** most matches?",
        ],
      },
      {
        heading: "Subject questions — other tenses",
        body: [
          "Past simple: question word + past verb (no 'did').",
          "Present perfect: question word + has/have + past participle (no 'did').",
          "Modals and 'will': question word + modal/will + base verb (nothing extra).",
        ],
        examples: [
          "**Who called** you last night?",
          "**Who has visited** the most countries?",
          "**Who will win** the election?",
          "**What can go** wrong?",
        ],
      },
      {
        heading: "Object questions — every tense needs the auxiliary",
        body: [
          "Present simple: question word + do/does + subject + base verb.",
          "Past simple: question word + did + subject + base verb.",
          "Present perfect: question word + have/has + subject + past participle.",
          "Modals and 'will': question word + modal/will + subject + base verb.",
        ],
        examples: [
          "**Who do** you see every day?",
          "**Who did** you call at the party?",
          "**Who have** you met that's famous?",
          "**Who will** you vote for?",
        ],
      },
      {
        heading: "'Which' can be a subject or an object question",
        body: [
          "'Which' is usually followed by a noun ('which team', 'which book'). That noun stays in the question either way — only the auxiliary changes.",
        ],
        examples: [
          "**Which team won** the championship? (subject — no auxiliary)",
          "**Which book did** she recommend? (object — needs 'did')",
        ],
      },
    ],
    commonMistakes: [
      "❌ Who did break the window? → ✅ Who broke the window? (subject question — no 'did')",
      "❌ What happens does at the end? → ✅ What happens at the end? (subject question — don't add 'does' as well as the -s)",
      "❌ Who you called last night? → ✅ Who did you call last night? (object question — needs 'did' before the subject)",
      "❌ Which book she recommended? → ✅ Which book did she recommend? (object question — needs 'did' before the subject)",
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

  comparatives: {
    title: "Comparatives",
    intro: "Comparatives compare two things — the ending or word you add depends on how long the adjective is.",
    sections: [
      {
        heading: "Short adjectives (1 syllable, or 2 ending in -y)",
        body: [
          "Adjective + -er + than.",
          "Spelling: y → i; double the final consonant after a short vowel; just add -r after silent -e.",
        ],
        examples: [
          "tall → **taller than**",
          "happy → **happier than**",
          "big → **bigger than**",
          "nice → **nicer than**",
        ],
      },
      {
        heading: "Long adjectives (2+ syllables)",
        body: ["More + adjective + than."],
        examples: [
          "**more interesting** than",
          "**more expensive** than",
          "**more difficult** than",
        ],
      },
      {
        heading: "Irregular forms",
        body: ["A handful of common adjectives don't follow either pattern."],
        examples: [
          "good → **better**",
          "bad → **worse**",
          "far → **further/farther**",
        ],
      },
      {
        heading: "Equality: as...as",
        body: ["To say two things are equal (or not), use 'as + adjective + as' instead of -er/more — it's a softer, non-ranking way to compare."],
        examples: [
          "She **is as tall as** her brother. (equal)",
          "This book **isn't as interesting as** the film. (not equal)",
        ],
      },
    ],
    commonMistakes: [
      "❌ more tall → ✅ taller (short adjectives use -er, not 'more')",
      "❌ gooder / more good → ✅ better (irregular)",
      "❌ This is more big than that one. → ✅ This is bigger than that one. (double the final consonant: big → bigger)",
      "❌ My phone is fast than yours. → ✅ My phone is faster than yours. (short adjectives need -er, not just 'than')",
      "❌ as tall than her brother → ✅ as tall as her brother ('as...as' for equality, not 'than')",
    ],
  },

  superlatives: {
    title: "Superlatives",
    intro: "Superlatives pick out the number one in a group of three or more — the ending or word you add depends on how long the adjective is.",
    sections: [
      {
        heading: "Short adjectives (1 syllable, or 2 ending in -y)",
        body: [
          "The + adjective + -est.",
          "Spelling: y → i; double the final consonant after a short vowel; just add -st after silent -e.",
        ],
        examples: [
          "tall → **the tallest**",
          "happy → **the happiest**",
          "big → **the biggest**",
          "nice → **the nicest**",
        ],
      },
      {
        heading: "Long adjectives (2+ syllables)",
        body: ["The most + adjective."],
        examples: [
          "**the most interesting**",
          "**the most expensive**",
          "**the most difficult**",
        ],
      },
      {
        heading: "Irregular forms",
        body: ["The same adjectives that are irregular in the comparative are irregular here too."],
        examples: [
          "good → **the best**",
          "bad → **the worst**",
          "far → **the furthest/farthest**",
        ],
      },
      {
        heading: "\"One of the...\" + superlative",
        body: ["A very common pattern: 'one of the' + superlative + a plural noun — it softens the claim from 'the single best' to 'among the best'."],
        examples: ["This is **one of the best restaurants** in town."],
      },
    ],
    commonMistakes: [
      "❌ the most tall → ✅ the tallest (short adjectives use -est, not 'the most')",
      "❌ the goodest / more good → ✅ the best (irregular)",
      "❌ tallest building in the city → ✅ the tallest building in the city (superlatives always need 'the')",
      "❌ This is the most big house. → ✅ This is the biggest house. (short adjectives use -est, not 'the most')",
      "❌ This is one of the best restaurant in town. → ✅ This is one of the best restaurants in town. ('one of the' + superlative needs a plural noun)",
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

  quantifiers: {
    title: "Quantifiers (Much/Many/A Lot/A Few/A Little)",
    intro: "English has different words for 'how much of something' depending on whether the noun is countable (books, people) or uncountable (coffee, money), and whether the quantity is large, small, or zero.",
    sections: [
      {
        heading: "Much vs many",
        body: [
          "Many + countable plural noun. Much + uncountable noun.",
          "We normally only use much/many in negative sentences and questions, not in affirmative sentences.",
        ],
        examples: [
          "There isn't **much coffee** in the jar.",
          "Were there **many people** at the party?",
        ],
      },
      {
        heading: "How much / how many",
        body: [
          "How many + plural noun; how much + uncountable noun, both to ask about quantity.",
          "'How much is/are...?' also asks about price.",
        ],
        examples: [
          "**How many books** did you read last semester?",
          "**How much coffee** do you drink every day?",
          "'**How much is it**?' 'It's 43 pounds.'",
        ],
      },
      {
        heading: "A lot of / lots of",
        body: [
          "A lot of (and the more informal lots of) works with both countable and uncountable nouns, mainly in affirmative sentences — though it's fine in negatives and questions too.",
          "'A lot of' always needs 'of' before a noun. Drop 'of' when 'a lot' comes at the end of a sentence or stands alone in a short answer.",
          "'Quite a lot of' means a medium-to-large quantity.",
        ],
        examples: [
          "She spends **a lot of time** watching TV.",
          "We had **lots of** good moments together.",
          "'How many beers did you have?' 'I had **a lot**.'",
          "I like her **a lot**.",
        ],
      },
      {
        heading: "A few vs a little",
        body: [
          "A few + countable plural noun. A little + uncountable noun. Both describe a small quantity, and both work in affirmative, negative, and question sentences.",
          "'Not many' and 'not much' mean roughly the same as 'a few' and 'a little'.",
        ],
        examples: [
          "I have to do **a few things** this afternoon.",
          "I always put **a little milk** in my tea.",
          "I don't have to do **many things** this afternoon. (= a few)",
        ],
      },
      {
        heading: "No / not...any / none",
        body: [
          "No + noun and not...any + noun both express zero quantity — the meaning is the same, just a different structure.",
          "In short answers, use 'none' alone.",
        ],
        examples: [
          "I have **no time** today.",
          "I don't have **any time** today.",
          "'How much time do you have?' '**None**.'",
        ],
      },
    ],
    commonMistakes: [
      "❌ There isn't many coffee. → ✅ There isn't much coffee. ('coffee' is uncountable)",
      "❌ How much books did you read? → ✅ How many books did you read? ('books' is countable)",
      "❌ She spends a lot time watching TV. → ✅ She spends a lot of time watching TV. ('a lot of' always needs 'of' before a noun)",
      "❌ I don't have no time today. → ✅ I don't have any time today. (don't combine 'don't' and 'no')",
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
    intro: "Talking about being ill or injured uses a small set of fixed phrases and collocations — most mistakes come from the wrong preposition, a missing 'to', or mixing up 'have' with 'hurt/ache'.",
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
        heading: "'Have' a symptom vs a body part that hurts/aches",
        body: [
          "'have' + a symptom noun (a headache, a stomachache, a sore throat) names the problem.",
          "a body part + 'hurts' or 'aches' says that part is in pain — the body part is the subject, and a plural body part (feet, eyes, ears) takes 'hurt'/'ache', not 'hurts'/'aches'.",
          "Both describe the same kind of problem — pick whichever fits the sentence you're building.",
        ],
        examples: [
          "I **have a headache**. = My **head hurts**. (same meaning, different structure)",
          "My **back aches** after a long day. (singular body part — 'aches')",
          "Her **feet hurt** from the new shoes. (plural body part — 'hurt', no -s)",
          "His **stomach hurts**. (not 'His stomach have pain')",
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
      "❌ My feet hurts. → ✅ My feet hurt. (plural body part, no -s on the verb)",
      "❌ My stomach have pain. → ✅ My stomach hurts. ('hurt/ache' takes the body part as subject, not 'have')",
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
      {
        heading: "More polite requests",
        body: ["Other useful ways to ask staff for information or a favour."],
        examples: [
          "**Do you have any** vegan options?",
          "**Could you tell me if** the soup contains nuts?",
          "**Would it be possible to** have separate bills?",
          "**Could you ask** the chef what he recommends?",
          "**Is it customary to** leave a tip here?",
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
        body: [
          "result + because + cause, in past simple.",
          "cause + so + result is the flip side — the cause comes first, and 'so' introduces the consequence.",
        ],
        examples: [
          "I arrived late for work **because** I missed the bus.",
          "She missed the meeting **because** she had a family emergency.",
          "I missed the bus, **so** I arrived late for work.",
        ],
      },
      {
        heading: "Asking for someone's excuse",
        body: ["Why + did/couldn't + subject + base verb...? is how you ask someone to explain what happened."],
        examples: [
          "**Why did** she miss the meeting?",
          "**Why couldn't** he call you back?",
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
    intro: "Talking about your daily routine is mostly present simple with time expressions — but this topic also drills a set of classic mistakes learners make when describing everyday life.",
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
      {
        heading: "Talking about routines in the past",
        body: ["Past simple: regular verbs add -ed; many everyday-routine verbs are irregular (go → went, get → got, have → had, wake → woke)."],
        examples: [
          "She **woke up** late yesterday.",
          "They **cleaned** the house last weekend.",
          "He **went** to the gym yesterday.",
        ],
      },
      {
        heading: "What's happening right now",
        body: ["Present continuous: am/is/are + verb-ing, for an action in progress at this exact moment."],
        examples: [
          "She **is cooking** dinner right now.",
          "They **are cleaning** the house at the moment.",
          "I **am getting ready** for school right now.",
        ],
      },
      {
        heading: "Obligation — what you have to do",
        body: ["have to / must + base verb (obligation); should + base verb (advice); don't have to (no obligation, it's optional); mustn't / shouldn't (prohibition or strong advice against)."],
        examples: [
          "She **has to wake up** early for school.",
          "She **doesn't have to wake up** early on Saturdays.",
          "You **shouldn't go to bed** late.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I have 20 years old. → ✅ I am 20 years old. ('to be' + age, not 'to have' — a direct Spanish translation trap)",
      "❌ I am agree with my sister. → ✅ I agree with my sister. ('agree' is a verb on its own, no 'am')",
      "❌ I like to listen music. → ✅ I like to listen to music. ('listen to' + thing)",
      "❌ I have a house big with a garden. → ✅ I have a big house with a garden. (adjective before the noun in English)",
      "❌ I don't do nothing on Sundays. → ✅ I don't do anything on Sundays. (only one negative per clause)",
      "❌ She goed to the gym yesterday. → ✅ She went to the gym yesterday. ('go' is irregular in the past simple)",
    ],
  },

  food_and_eating: {
    title: "Food & Eating",
    intro: "This topic mixes everyday food vocabulary with a set of classic mistakes learners make when talking about meals, restaurants, and diet.",
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
      {
        heading: "Talking about meals in the past",
        body: ["Past simple: regular verbs add -ed; many food-related verbs are irregular (eat → ate, drink → drank, have → had)."],
        examples: [
          "I **ate** breakfast yesterday.",
          "She **drank** coffee after dinner last night.",
          "We **had** pasta for dinner last night.",
        ],
      },
      {
        heading: "What's happening right now",
        body: ["Present continuous: am/is/are + verb-ing, for an action in progress at this exact moment."],
        examples: [
          "He **is cooking** dinner right now.",
          "She **is drinking** coffee at the moment.",
          "They **are eating out** tonight.",
        ],
      },
      {
        heading: "Obligation — what you have to do about food",
        body: ["have to / must + base verb (obligation); should + base verb (advice); don't have to (no obligation, it's optional); mustn't / shouldn't (prohibition or strong advice against)."],
        examples: [
          "She **must drink** more water.",
          "You **don't have to finish** your vegetables.",
          "You **shouldn't skip** breakfast.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I have 25 years. → ✅ I am 25 years old. ('to be' + age, not 'to have')",
      "❌ We arrived to the restaurant late. → ✅ We arrived at the restaurant late. ('arrive at/in a place', never 'arrive to')",
      "❌ The people in that restaurant is friendly. → ✅ The people in that restaurant are friendly. ('people' takes a plural verb)",
      "❌ I have eaten paella yesterday. → ✅ I ate paella yesterday. (a finished time word like 'yesterday' needs past simple)",
      "❌ The queue was so large. → ✅ The queue was so long. ('large' = big in size; 'long' describes a queue or line)",
      "❌ She eated meat yesterday. → ✅ She ate meat yesterday. ('eat' is irregular in the past simple)",
    ],
  },

  school_and_study: {
    title: "School and Study",
    intro: "School vocabulary comes with its own obligation grammar (must/have to) and a set of classic mistakes learners make when talking about classes and studying.",
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
      {
        heading: "Talking about school in the past",
        body: ["Past simple: regular verbs add -ed; several school-related verbs are irregular (bring → brought, do → did, take → took, buy → bought, be → were)."],
        examples: [
          "She **handed in** her essay yesterday.",
          "He **brought** his textbook yesterday.",
          "They **took** an exam at the end of last term.",
        ],
      },
      {
        heading: "What's happening right now",
        body: ["Present continuous: am/is/are + verb-ing, for an action in progress at this exact moment."],
        examples: [
          "She **is handing in** her essay right now.",
          "The students **are revising** for the exam at the moment.",
          "We **are attending** the extra class right now.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I have to assist my classes. → ✅ I have to attend my classes. ('assist' means to help; 'attend' means to go to')",
      "❌ I have 15 years old. → ✅ I am 15 years old. ('to be' + age, not 'to have')",
      "❌ I always avoid to talk in class. → ✅ I always avoid talking in class. ('avoid' + gerund, never 'to')",
      "❌ We have to listen the teacher. → ✅ We have to listen to the teacher. ('listen to' + person/thing)",
      "❌ I don't have no homework today. → ✅ I don't have any homework today. (only one negative per clause)",
      "❌ He bringed his textbook yesterday. → ✅ He brought his textbook yesterday. ('bring' is irregular in the past simple)",
    ],
  },

  friends_and_family: {
    title: "Friends and Family",
    intro: "Describing relationships leans on present perfect ('have been friends since…') and a handful of fixed phrasal expressions — plus another set of classic learner mix-ups.",
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
      {
        heading: "Talking about family in the past",
        body: ["Past simple: regular verbs add -ed; several family-related verbs are irregular (meet → met, send → sent, get → got)."],
        examples: [
          "My parents **met** in university.",
          "My cousins **visited** us last Christmas.",
          "His aunt **sent** him a birthday card last week.",
        ],
      },
      {
        heading: "What's happening right now",
        body: ["Present continuous: am/is/are + verb-ing, for an action in progress at this exact moment."],
        examples: [
          "She **is calling** her grandmother right now.",
          "Her parents **are arguing** right now.",
          "His aunt **is visiting** us this week.",
        ],
      },
      {
        heading: "Obligation — what you have to do for family",
        body: ["have to / must + base verb (obligation); should + base verb (advice); don't have to (no obligation, it's optional); mustn't / shouldn't (prohibition or strong advice against)."],
        examples: [
          "You **have to respect** your parents.",
          "You **don't have to agree** with your siblings all the time.",
          "You **mustn't forget** your grandmother's birthday.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I have 24 years. → ✅ I am 24 years old. ('to be' + age, not 'to have')",
      "❌ My cousin is married with a doctor. → ✅ My cousin is married to a doctor. ('married to', not 'married with')",
      "❌ I assisted to my grandparents' party. → ✅ I attended my grandparents' party. ('assist' means to help; 'attend' means to go to')",
      "❌ My aunt is very sympathetic. → ✅ My aunt is very friendly/likeable. ('sympathetic' means compassionate about a problem, not friendly)",
      "❌ I know my best friend since we were children. → ✅ I have known my best friend since we were children. ('since' needs present perfect)",
      "❌ My parents meeted in university. → ✅ My parents met in university. ('meet' is irregular in the past simple)",
    ],
  },

  free_time_a2: {
    title: "Free Time and Interests",
    intro: "Talking about hobbies mostly needs 'enjoy'/'like' + gerund and 'prefer X to Y' — plus a few classic learner slips worth watching for.",
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
      {
        heading: "Talking about free time in the past",
        body: ["Past simple: regular verbs add -ed; several free-time verbs are irregular (go → went, meet → met, read → read)."],
        examples: [
          "I **watched** TV yesterday.",
          "They **went** cycling last weekend.",
          "We **met up** with friends last weekend.",
        ],
      },
      {
        heading: "What's happening right now",
        body: ["Present continuous: am/is/are + verb-ing, for an action in progress at this exact moment."],
        examples: [
          "He **is playing** football at the moment.",
          "She **is playing** video games right now.",
          "We **are playing** board games right now.",
        ],
      },
      {
        heading: "Obligation — what you have to do",
        body: ["have to / must + base verb (obligation); should + base verb (advice); don't have to (no obligation, it's optional); mustn't / shouldn't (prohibition or strong advice against)."],
        examples: [
          "You **have to practise** every day.",
          "You **don't have to join** a sports club.",
          "You **mustn't swim** without a lifeguard.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I make sport every weekend. → ✅ I do sport every weekend. (English says 'do sport/exercise', never 'make sport')",
      "❌ I like to listen music. → ✅ I like to listen to music. ('listen to' + thing)",
      "❌ My brother has ten years. → ✅ My brother is ten years old. ('to be' + age, not 'to have')",
      "❌ I am boring when I have nothing to do. → ✅ I am bored when I have nothing to do. (use the -ed form for how you feel)",
      "❌ I assist to a dance class. → ✅ I attend a dance class. ('assist' means to help; 'attend' means to go to')",
      "❌ They goed cycling last weekend. → ✅ They went cycling last weekend. ('go' is irregular in the past simple)",
    ],
  },

  my_town_city: {
    title: "My Town and City",
    intro: "Describing a place uses 'there is/are', comparatives/superlatives, and passive voice for history ('was built') — plus a last round of classic learner slips.",
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
        body: ["Passive voice for history: was/were + past participle. Active past simple works too when the doer matters: regular verbs add -ed; 'build' and 'grow' are irregular (build → built, grow → grew)."],
        examples: [
          "The cathedral **was built** hundreds of years ago.",
          "They **built** a new bridge last year.",
          "The population **grew** quickly last decade.",
        ],
      },
      {
        heading: "What's happening right now",
        body: ["Present continuous: am/is/are + verb-ing, for an action in progress at this exact moment."],
        examples: [
          "The city **is building** a new shopping centre right now.",
          "The council **is building** a new bridge at the moment.",
          "My town **is getting** more crowded these days.",
        ],
      },
      {
        heading: "Obligation — rules in a town or city",
        body: ["have to / must + base verb (obligation); should + base verb (advice); don't have to (no obligation, it's optional); mustn't / shouldn't (prohibition or strong advice against)."],
        examples: [
          "You **have to pay** for parking in the city centre.",
          "You **don't have to pay** to enter the park.",
          "You **mustn't litter** in the park.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I like to make photos of old buildings. → ✅ I like to take photos of old buildings. (English 'takes' a photo, never 'makes' one)",
      "❌ Tourists arrive to my city by train. → ✅ Tourists arrive in my city by train. ('arrive in/at a place', never 'arrive to')",
      "❌ My town has market in the centre. → ✅ My town has a market in the centre. (don't drop 'a' before a singular countable noun)",
      "❌ There is a good library where you can buy books. → ✅ There is a good bookshop where you can buy books. ('library' = borrow books; 'librería' in Spanish is false friend for bookshop)",
      "❌ There isn't nothing interesting to do. → ✅ There isn't anything interesting to do. (only one negative per clause)",
      "❌ They builded a new bridge last year. → ✅ They built a new bridge last year. ('build' is irregular in the past simple)",
    ],
  },

  present_perfect: {
    title: "Present Perfect: Just, Already, Yet & Unfinished Time",
    intro: "Present perfect (have/has + past participle) links a past action to the present moment. This lesson covers the specific time words that trigger it — just, already, yet, ever, never, how long — plus the idea of an 'unfinished' time period like this week or so far.",
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
          "Answer 'How long' with 'for' + a length of time, or 'since' + a starting point in time.",
          "Superlative + ever → present perfect.",
        ],
        examples: [
          "**Have** you **ever tried** sushi?",
          "I **have never been** to Japan.",
          "**How long have you known** her? I've known her **for** ten years. / I've known her **since** 2015.",
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
      "❌ I have lived here since ten years. → ✅ I have lived here for ten years. ('for' + a length of time; 'since' + a starting point)",
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

  understanding_get: {
    title: "Understanding 'Get'",
    intro: "'Get' is one of the most common verbs in English, and it changes meaning completely depending on what comes after it. This lesson covers its most useful everyday meanings.",
    sections: [
      {
        heading: "Get = obtain, receive, or buy",
        body: [
          "The most basic meaning: something comes into your possession.",
        ],
        examples: [
          "I **got** a new laptop for my birthday. (received)",
          "I **got** this jacket from a small shop. (bought)",
          "Did you **get** my message? (receive)",
        ],
      },
      {
        heading: "Get = arrive or reach",
        body: [
          "'Get to' + a place means arrive there.",
        ],
        examples: [
          "We **got to** the airport just in time.",
          "What time did you **get** home last night?",
        ],
      },
      {
        heading: "Get + adjective = become",
        body: [
          "'Get' + an adjective (or a comparative adjective) describes a change of state.",
        ],
        examples: [
          "It's **getting** dark outside.",
          "He **got** really angry when he heard the news.",
          "She's **getting** better at tennis every week.",
        ],
      },
      {
        heading: "Common 'get' phrasal verbs",
        body: [
          "'Get' combines with particles for everyday actions — each combination has its own specific meaning.",
        ],
        examples: [
          "**get up** = leave your bed",
          "**get on/off** = board/leave a bus, train, or plane",
          "**get in/out of** = enter/leave a car",
          "**get back** = return",
          "**get together** = meet socially",
          "**get into** (trouble) = end up in a bad situation",
        ],
      },
      {
        heading: "Get + past participle = an informal passive",
        body: [
          "In everyday spoken English, 'get' + past participle is a common informal alternative to 'be' + past participle for things that happen to someone.",
        ],
        examples: [
          "She **got promoted** last month.",
          "He **got injured** playing football.",
          "They **got married** last summer.",
          "My bag **got stolen** on the train.",
        ],
      },
      {
        heading: "Get + object + past participle = arrange for a service",
        body: [
          "This pattern means you arrange for someone else to do something for you, not that you did it yourself.",
        ],
        examples: [
          "I **got my hair cut** yesterday. (a hairdresser cut it, not me)",
          "We **got the car fixed** at the garage.",
        ],
      },
    ],
    commonMistakes: [
      "❌ She promoted last month. → ✅ She got promoted last month. (informal passive needs 'get' + past participle)",
      "❌ I got my hair cutting. → ✅ I got my hair cut. ('get + object + past participle' — not '-ing')",
      "❌ Did you got my message? → ✅ Did you get my message? (after 'did', use the base form 'get')",
      "❌ It get really cold at night. → ✅ It gets really cold at night. (third person singular needs 'gets')",
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

  used_to_past: {
    title: "I Used To... (Past Habits)",
    intro: "'Used to' + base verb describes a repeated action or state in the past that isn't true anymore — it always signals a contrast with the present.",
    sections: [
      {
        heading: "Form",
        body: [
          "Affirmative: subject + used to + base verb.",
          "Negative: subject + didn't use to + base verb (no -d on 'use').",
          "Question: Did + subject + use to + base verb? (no -d on 'use').",
        ],
        examples: [
          "I **used to play** the guitar.",
          "She **didn't use to like** vegetables.",
          "**Did you use to live** here?",
        ],
      },
      {
        heading: "Meaning: a finished past habit or state",
        body: [
          "'Used to' describes something that happened repeatedly, or was true, over a period in the past — and is now different.",
          "It's not for a single, one-time past action — use past simple for that instead.",
        ],
        examples: [
          "I **used to visit** my grandmother every summer. (repeated, now stopped)",
          "I **visited** my grandmother last summer. (one specific visit — past simple)",
          "This street **used to be** full of shops.",
        ],
      },
      {
        heading: "No present form",
        body: [
          "There's no present form of 'used to' — for a habit you have now, use present simple with a frequency adverb instead.",
          "Don't confuse this with 'be used to' or 'get used to', which describe how familiar something feels (and can be present, past, or future) rather than a repeated past action.",
        ],
        examples: [
          "❌ I use to play tennis every weekend. → ✅ I **play** tennis every weekend. (present habit)",
          "I **am used to** waking up early now. (current familiarity — a different structure)",
        ],
      },
    ],
    commonMistakes: [
      "❌ I didn't used to like coffee. → ✅ I didn't use to like coffee. (no -d after 'use' in the negative)",
      "❌ Did you used to live here? → ✅ Did you use to live here? (no -d after 'use' in questions)",
      "❌ I use to play tennis every weekend. → ✅ I used to play tennis every weekend. (positive statements need 'used to', with -d)",
      "❌ I used to went to school by bus. → ✅ I used to go to school by bus. ('used to' + base verb, not the past form)",
      "❌ He used to living in Berlin. → ✅ He used to live in Berlin. ('used to' + base verb, not -ing)",
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
        ],
        examples: [
          "**Everybody was** invited.",
          "**Nothing was** said.",
        ],
      },
      {
        heading: "Whoever / whatever / wherever / whichever (open choice)",
        body: [
          "whoever = any person who",
          "whatever = any thing that",
          "wherever = any place that",
          "whichever = any one, out of a limited set",
          "All of these take a singular verb, just like the other indefinite pronouns above.",
        ],
        examples: [
          "**Whoever calls**, tell them I'm busy.",
          "You can choose **whatever** topping you like.",
          "**Wherever** we go, my dog wants to come too.",
          "You can take **whichever** seat is free.",
        ],
      },
      {
        heading: "Neither (two people or things)",
        body: [
          "neither = not one and not the other, of two — always singular",
          "Its positive opposite is both = the two together, always plural.",
        ],
        examples: [
          "**Neither of us** wanted to cook, so we ordered takeout.",
          "**Both of my parents** work in the same hospital.",
        ],
      },
    ],
    commonMistakes: [
      "❌ Nobody doesn't want to leave. → ✅ Nobody wants to leave. (no double negative)",
      "❌ There is anyone in the office. → ✅ There is someone in the office. ('anyone' is for questions/negatives, not positives)",
      "❌ Everything are ready. → ✅ Everything is ready. (indefinite pronouns are always singular)",
      "❌ I don't want nothing to eat. → ✅ I don't want anything to eat. (avoid double negatives)",
      "❌ I can't find it nowhere. → ✅ I can't find it anywhere. ('anywhere' with a negative verb, not 'nowhere')",
      "❌ Whoever call, tell them I'm in a meeting. → ✅ Whoever calls, tell them I'm in a meeting. ('whoever' takes a singular verb)",
      "❌ Both of my parents works in the same hospital. → ✅ Both of my parents work in the same hospital. ('both' is plural, unlike 'neither')",
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
    intro: "The most common mix-up is using an adjective where an adverb belongs, or the other way round — adjectives describe nouns, adverbs describe verbs (and adjectives/other adverbs).",
    sections: [
      {
        heading: "Adjective or adverb? The core rule",
        body: [
          "Use an **adjective** to describe a noun or pronoun — it usually sits before the noun, or after a linking verb like 'be', 'seem', or 'look' that describes the subject.",
          "Use an **adverb** to describe a verb (how an action happens) — it usually sits after the verb, or before an adjective it strengthens.",
          "The same idea word often has two forms: one for describing the noun, one for describing the action.",
        ],
        examples: [
          "She is a **careful** driver. (adjective describes the noun 'driver')",
          "She drives **carefully**. (adverb describes the verb 'drives')",
          "He **looks happy**. (adjective after linking verb 'looks') / He **smiled happily**. (adverb after action verb 'smiled')",
        ],
      },
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
      "❌ She is a carefully driver. → ✅ She is a careful driver. (adjectives, not adverbs, describe nouns)",
      "❌ He drives careful. → ✅ He drives carefully. (adverbs, not adjectives, describe verbs)",
      "❌ She looks happily today. → ✅ She looks happy today. ('look' is a linking verb — describe the subject with an adjective)",
      "❌ She sings beautiful. → ✅ She sings beautifully. (adverbs modify verbs — add '-ly')",
      "❌ He did good in the exam. → ✅ He did well in the exam. ('well' is the adverb form of 'good')",
      "❌ She always is late. → ✅ She is always late. (frequency adverb goes after 'be')",
      "❌ This soup tastes wonderfully. → ✅ This soup tastes wonderful. (adjective after sense verbs, not adverb)",
      "❌ I am not enough strong. → ✅ I am not strong enough. ('enough' comes after the adjective)",
    ],
  },

  intensifiers_so_such_enough: {
    title: "Intensifiers (So, Such & Enough)",
    intro: "So, such, and enough all make a quality stronger or describe whether there's the right amount of it — but each one follows its own fixed word order, and mixing them up is the most common mistake.",
    sections: [
      {
        heading: "So vs such — the basic rule",
        body: ["'So' goes directly before an adjective or adverb, with no noun at all.", "'Such (a/an)' goes before an adjective + a noun — use 'such a/an' with a singular countable noun, and 'such' (no article) with a plural or uncountable noun."],
        examples: [
          "The traffic was **so** bad this morning. (no noun)",
          "It was **such an** amazing concert. (singular noun)",
          "They are **such** generous people. (plural noun)",
        ],
      },
      {
        heading: "So...that / such...that — result clauses",
        body: ["Add 'that' + a clause after 'so'/'such' to explain the RESULT of an extreme quality.", "The 'so' or 'such' rule from above still applies — it just depends on whether a noun follows."],
        examples: [
          "The exam was **so difficult that** nobody finished on time.",
          "It was **such a difficult exam that** nobody finished on time.",
          "He drove **so fast that** he got a speeding ticket.",
        ],
      },
      {
        heading: "So much / so many",
        body: ["'So much' intensifies an uncountable noun; 'so many' intensifies a countable plural noun — same countable/uncountable rule as elsewhere in English."],
        examples: [
          "She has **so much** energy in the mornings.",
          "He has **so many** friends that he can't remember all their names.",
        ],
      },
      {
        heading: "Enough — a fixed word order that never changes",
        body: ["'Enough' means 'a sufficient amount' — a different idea from 'so'/'such', which just intensify.", "Before a noun: 'enough' + noun.", "After an adjective or adverb: adjective/adverb + 'enough'.", "Add 'to' + a verb to say exactly what the amount is (or isn't) sufficient for."],
        examples: [
          "We don't have **enough chairs** for everyone. (before the noun)",
          "She's not tall **enough** to reach the shelf. (after the adjective)",
          "He's old **enough to vote** now. (adjective + enough + to)",
        ],
      },
    ],
    commonMistakes: [
      "❌ It was so boring film. → ✅ It was such a boring film. ('such a' + adjective + singular noun, not 'so')",
      "❌ She's such talented. → ✅ She's so talented. ('so' + adjective, no noun)",
      "❌ I don't have money enough. → ✅ I don't have enough money. ('enough' goes BEFORE a noun)",
      "❌ She isn't enough old to drive. → ✅ She isn't old enough to drive. ('enough' goes AFTER an adjective)",
      "❌ He has such many friends. → ✅ He has so many friends. ('so many/so much', never 'such many')",
      "❌ It was a such cold day. → ✅ It was such a cold day. ('such a', never 'a such')",
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
      {
        heading: "Asking for someone's opinion",
        body: [
          "'Do you think that + clause?' works with a full clause, but several other common openers take a noun instead — 'what's your' + opinion/view/take + 'on', or 'how do you feel about'.",
        ],
        examples: [
          "**Do you think that** homework is useless?",
          "**What's your opinion on** the new policy?",
          "**What's your view on** working from home?",
          "**How do you feel about** the changes?",
          "**Do you have any thoughts on** this idea?",
          "**What's your take on** the situation?",
        ],
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
          "**So what you're saying is** we need to redo the whole presentation?",
        ],
      },
      {
        heading: "More clarification phrases",
        body: ["Other useful ways to ask for more detail, confirm you understood, or ask about spelling."],
        examples: [
          "**Could you be more specific** about what time you need the report?",
          "**I'm not sure I follow** — could you go back to your first point?",
          "**Could you spell that for me?** I've never heard that surname before.",
          "**Could you give me an example of** that?",
          "**Could you confirm** the time of the meeting?",
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
          "**I agree with you up to a point**, but not completely.",
        ],
      },
      {
        heading: "More ways to agree or push back",
        body: [
          "Acknowledging without agreeing: 'I see where you're coming from', 'that's one way to look at it', 'you have a point there', 'I take your point, but...'.",
          "Firmer but still polite disagreement: 'I'd actually argue that...', 'it's hard to argue with that', 'I'm not so sure about that', 'that's debatable'.",
          "Casual acceptance: 'fair enough'. Strong certainty: 'there's no doubt about it'. Reluctant agreement: 'I can't deny that...'.",
        ],
        examples: [
          "**I see where you're coming from**, but I still think we should wait.",
          "**Fair enough**, let's do it your way.",
          "**I'd actually argue that** the opposite is true.",
          "**That's debatable** — not everyone would agree.",
          "**I can't deny that** the results are impressive.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I'm agree that we need to change our approach. → ✅ I agree that we need to change our approach. ('agree' is a verb — not 'I'm agree')",
      "❌ I'm afraid I disagree you on that. → ✅ I'm afraid I disagree with you on that. ('disagree with' someone)",
      "❌ I can't agree more with your position. → ✅ I couldn't agree more with your position. ('couldn't agree more' — negative form for maximum agreement)",
      "❌ I disagree on your interpretation. → ✅ I disagree with your interpretation. ('disagree with', not 'disagree on')",
      "❌ With all do respect, I think you're mistaken. → ✅ With all due respect, I think you're mistaken. (fixed phrase is 'due respect')",
      "❌ I see from where you're coming. → ✅ I see where you're coming from. (fixed word order — 'from' goes at the end)",
      "❌ I can't deny the results are impressive. → ✅ I can't deny that the results are impressive. (needs 'that' before the clause)",
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
          "within walking distance of / a short drive from / a short walk from",
          "close to / connected to / in the heart of / on the outskirts of",
        ],
        examples: [
          "The village is **situated in** the mountains.",
          "The old town is **surrounded by** a stone wall.",
          "The hotel is **within walking distance of** the beach.",
          "The airport is a **short drive from** the city centre.",
          "The village is **close to** the border.",
          "The cathedral is **in the heart of** the old city.",
          "The factory is **on the outskirts of** town.",
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
      {
        heading: "Passive voice — who does the task doesn't matter",
        body: ["am/is/are + past participle (present); was/were + past participle (past) — common for describing workplace processes."],
        examples: [
          "The weekly report **is sent** by her every Friday.",
          "The meeting **was cancelled** because of a technical problem.",
        ],
      },
      {
        heading: "First conditional — a likely result of a work habit",
        body: ["If + present simple, ... will + base verb — a realistic future result."],
        examples: [
          "If you **set** clear boundaries, you**'ll feel** less stressed.",
          "If the team **communicates** well, projects **will run** more smoothly.",
        ],
      },
      {
        heading: "Comparatives — comparing office and remote work",
        body: ["more/-er + adjective + than compares two working styles."],
        examples: [
          "Remote work **is more flexible than** office work.",
          "A quiet home office **is better than** a noisy open-plan office.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I am agree that working from home saves time. → ✅ I agree that working from home saves time. ('agree' is a verb, no 'am')",
      "❌ How productive you are depends of your self-discipline. → ✅ ...depends on your self-discipline. ('depend on', not 'depend of')",
      "❌ Actually, I work from home three days a week. → ✅ Currently, I work from home three days a week. ('actually' means 'in fact', not 'currently')",
      "❌ She is remote worker who manages her own schedule. → ✅ She is a remote worker... (article needed before a job noun)",
      "❌ I have bought a new desk last week. → ✅ I bought a new desk last week. (specific past time → past simple)",
      "❌ If you will set clear boundaries, you'll feel less stressed. → ✅ If you set clear boundaries... (no 'will' in the if-clause)",
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
      {
        heading: "First conditional — a likely result of practice",
        body: ["If + present simple, ... will + base verb — a realistic future result of a study habit."],
        examples: [
          "If you **practise** every day, you**'ll improve** faster.",
          "If she **immerses** herself in the language, she**'ll learn** faster.",
        ],
      },
      {
        heading: "Passive voice — how material is taught and corrected",
        body: ["am/is/are + past participle (present); was/were + past participle (past)."],
        examples: [
          "Grammar rules **are taught** by the teacher.",
          "My pronunciation **was corrected** by the tutor.",
        ],
      },
      {
        heading: "Comparatives — which method works better",
        body: ["more/-er + adjective + than compares two learning methods."],
        examples: [
          "Immersion **is more effective than** classroom learning.",
          "Learning as a child **is easier than** learning as an adult.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I assisted to an English class. → ✅ I attended an English class. ('assist' means to help; 'attend' means to go to')",
      "❌ Don't be afraid to make questions. → ✅ Don't be afraid to ask questions. (English 'asks' a question, never 'makes' one)",
      "❌ I improve my listening by listening music. → ✅ ...by listening to music. ('listen to' + thing)",
      "❌ I am beginner. → ✅ I am a beginner. (article needed before a role/level noun)",
      "❌ I have started learning English when I was eight. → ✅ I started learning English when I was eight. (specific past time point → past simple)",
      "❌ If you will practise every day, you'll improve. → ✅ If you practise every day... (no 'will' in the if-clause)",
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
      {
        heading: "First conditional — a likely career result",
        body: ["If + present simple, ... will + base verb — a realistic future outcome of a career decision."],
        examples: [
          "If you **update** your CV, you**'ll have** a better chance.",
          "If he **negotiates** his salary, he**'ll earn** more.",
        ],
      },
      {
        heading: "Passive voice — recruitment processes",
        body: ["am/is/are + past participle (present); was/were + past participle (past)."],
        examples: [
          "All applications **are reviewed** by HR.",
          "Two employees **were promoted** by the manager.",
        ],
      },
      {
        heading: "Comparatives — comparing jobs and career paths",
        body: ["more/-er + adjective + than compares two jobs, offers, or working styles."],
        examples: [
          "Freelancing **is more flexible than** a full-time job.",
          "Her new salary **is better than** her old one.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I am agree that soft skills are important. → ✅ I agree that soft skills are important. ('agree' is a verb, no 'am')",
      "❌ Your success depends of how hard you work. → ✅ ...depends on how hard you work. ('depend on', not 'depend of')",
      "❌ I couldn't assist the job interview. → ✅ I couldn't attend the job interview. ('assist' means to help; 'attend' means to go to')",
      "❌ My brother is engineer at a tech company. → ✅ My brother is an engineer... (article needed before a profession)",
      "❌ I have started my new job last Monday. → ✅ I started my new job last Monday. (specific past time → past simple)",
      "❌ If you will update your CV, you'll have a better chance. → ✅ If you update your CV... (no 'will' in the if-clause)",
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
      {
        heading: "First conditional — a likely result of good (or bad) habits",
        body: ["If + present simple, ... will + base verb — describes a realistic future result of an action."],
        examples: [
          "If she **plans** her day every morning, she**'ll get** more done.",
          "If you **avoid** distractions, you**'ll finish** faster.",
        ],
      },
      {
        heading: "Present perfect — habits and progress up to now",
        body: ["Has/have + past participle for something done (or not done) within an unfinished period like 'this week'."],
        examples: [
          "She **has planned** her day every morning this week.",
          "He **has delegated** several tasks this quarter.",
        ],
      },
      {
        heading: "Passive voice — the process, not who does it",
        body: ["am/is/are + past participle (present); was/were + past participle (past) — used when the task matters more than who did it."],
        examples: [
          "The meeting **is scheduled** by the manager.",
          "A new time-tracking system **was introduced** by the company last year.",
        ],
      },
      {
        heading: "Comparatives — which method works better",
        body: ["more/-er + adjective + than compares two approaches to managing time."],
        examples: [
          "A to-do list **is more effective than** a mental checklist.",
          "Her time management **is better than** his.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I have to assist a time-management workshop. → ✅ I have to attend a time-management workshop. ('assist' means to help; 'attend' means to go to')",
      "❌ The team meeting has place every Monday. → ✅ The team meeting takes place every Monday. ('take place', not 'have place')",
      "❌ I eventually check my emails two or three times. → ✅ I occasionally check my emails... ('eventually' means 'in the end'; Spanish 'eventualmente' means 'occasionally')",
      "❌ Good time manager always makes a schedule. → ✅ A good time manager always makes a schedule. (article needed before a role noun)",
      "❌ She has completed the report yesterday. → ✅ She completed the report yesterday. (specific past time → past simple)",
      "❌ If she will plan her day, she'll get more done. → ✅ If she plans her day... (no 'will' in the if-clause of a first conditional)",
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
      {
        heading: "First conditional — a likely benefit of a hobby",
        body: ["If + present simple, ... will + base verb — a realistic future result of taking up or practising a hobby."],
        examples: [
          "If you **take up** a hobby, you**'ll feel** happier.",
          "If she **practises** yoga regularly, she**'ll feel** more relaxed.",
        ],
      },
      {
        heading: "Passive voice — who organizes and runs activities",
        body: ["am/is/are + past participle (present); was/were + past participle (past)."],
        examples: [
          "A hiking trip **is organized** by the club.",
          "The yoga class **was led** by the teacher yesterday.",
        ],
      },
      {
        heading: "Comparatives — comparing hobbies",
        body: ["more/-er + adjective + than compares two free-time activities."],
        examples: [
          "Yoga **is more calming than** running.",
          "Hiking **is better than** staying indoors.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I realized a painting course last year. → ✅ I did a painting course last year. ('realize' means to become aware of, not to carry out)",
      "❌ In my opinion I think that hiking is the best hobby. → ✅ In my opinion, hiking is the best hobby. (don't combine 'in my opinion' and 'I think')",
      "❌ Whether I go hiking depends of the weather. → ✅ ...depends on the weather. ('depend on', not 'depend of')",
      "❌ I am painter in my free time. → ✅ I am a painter in my free time. (article needed before a role noun)",
      "❌ I have taken up painting three years ago. → ✅ I took up painting three years ago. (specific past time → past simple)",
      "❌ If you will take up a hobby, you'll feel happier. → ✅ If you take up a hobby... (no 'will' in the if-clause)",
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
      {
        heading: "Present perfect — recent or ongoing online activity",
        body: ["Has/have + past participle for something within an unfinished period ('today', 'since 2019') or an experience with no specific time given."],
        examples: [
          "He **has posted** a photo today.",
          "She **has had** this account since 2019.",
          "They **have never experienced** cyberbullying.",
        ],
      },
      {
        heading: "First conditional — a likely online consequence",
        body: ["If + present simple, ... will + base verb — a realistic future result of an online choice."],
        examples: [
          "If you **spend** less time online, you**'ll feel** happier.",
          "If she **shares** her location, strangers **will find** her.",
        ],
      },
      {
        heading: "Passive voice — who controls and decides",
        body: ["am/is/are + past participle (present); was/were + past participle (past) — for describing how platforms and algorithms operate."],
        examples: [
          "The content **is decided** by the algorithm.",
          "That product **was promoted** by influencers last month.",
        ],
      },
      {
        heading: "Comparatives — comparing platforms, content, and habits",
        body: ["more + adjective + than (longer adjectives); adjective + -er + than (short adjectives); good → better is irregular."],
        examples: [
          "This platform **is more popular than** the old one.",
          "Real friendships **are better than** online followers.",
        ],
      },
    ],
    commonMistakes: [
      "❌ Social media have changed how businesses reach customers. → ✅ Social media has changed... ('social media' takes a singular verb)",
      "❌ The people is worried about fake news. → ✅ People are worried about fake news. ('people' is plural in English)",
      "❌ I am agree that social media can be dangerous. → ✅ I agree that social media can be dangerous. ('agree' is a verb, no 'am')",
      "❌ Whether a post goes viral depends of the algorithm. → ✅ ...depends on the algorithm. ('depend on', not 'depend of')",
      "❌ I have posted that photo yesterday. → ✅ I posted that photo yesterday. (specific past time → past simple)",
      "❌ If you will spend less time online, you'll feel happier. → ✅ If you spend less time online... (no 'will' in the if-clause)",
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
      {
        heading: "First conditional — a likely result of a reading habit",
        body: ["If + present simple, ... will + base verb — a realistic future result of a reading choice."],
        examples: [
          "If you **read** every day, you**'ll improve** your vocabulary.",
          "If she **joins** a book club, she**'ll meet** new people.",
        ],
      },
      {
        heading: "Passive voice — who writes, publishes, and sells books",
        body: ["am/is/are + past participle (present); was/were + past participle (past) — for describing how books are made and sold."],
        examples: [
          "The novel **is published** by the publisher.",
          "The class novel **was chosen** by the teacher.",
        ],
      },
      {
        heading: "Comparatives — comparing books and reading formats",
        body: ["more + adjective + than (longer adjectives); adjective + -er + than (short adjectives); good → better is irregular."],
        examples: [
          "This novel **is more gripping than** the one I read last month.",
          "The sequel **is better than** the first book.",
        ],
      },
    ],
    commonMistakes: [
      "❌ He has read that novel when he was at university. → ✅ He read that novel when he was at university. (specific past time → past simple)",
      "❌ I am agree that this book deserves its awards. → ✅ I agree that this book deserves its awards. ('agree' is a verb, no 'am')",
      "❌ Whether I like a book depends of the characters. → ✅ ...depends on the characters. ('depend on', not 'depend of')",
      "❌ She is avid reader who finishes a book every week. → ✅ She is an avid reader... (article needed before a role noun)",
      "❌ I bought this novel at the library. → ✅ I bought this novel at the bookshop. ('library' = borrow books; Spanish 'librería' is a false friend for bookshop)",
      "❌ If you will read every day, you'll improve your vocabulary. → ✅ If you read every day... (no 'will' in the if-clause)",
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
      {
        heading: "The + comparative, the + comparative — two things changing together",
        body: ["This double-comparative structure links two changes: as one increases or decreases, so does the other."],
        examples: [
          "**The bigger** the city gets, **the worse** the traffic gets.",
          "**The further** you move from the city, **the cleaner** the air becomes.",
        ],
      },
      {
        heading: "First conditional — a likely result of a choice",
        body: ["If + present simple, ... will + base verb — a realistic future result of choosing city or country life."],
        examples: [
          "If you **move** to the countryside, you**'ll find** more peace and quiet.",
          "If rent **keeps** rising, fewer people **will afford** to live in the city.",
        ],
      },
      {
        heading: "Present perfect — recent change up to now",
        body: ["Has/have + past participle for a change within an unfinished period like 'this year' or 'recently'."],
        examples: [
          "The city **has grown** rapidly in recent years.",
          "Rent **has risen** sharply in the last five years.",
        ],
      },
      {
        heading: "Passive voice — who plans and builds",
        body: ["am/is/are + past participle (present); was/were + past participle (past) — for describing planning and construction."],
        examples: [
          "New housing **is built** by the council.",
          "The new suburb **was designed** by developers last year.",
        ],
      },
    ],
    commonMistakes: [
      "❌ When you arrive to the countryside... → ✅ When you arrive in the countryside... ('arrive in/at', never 'arrive to')",
      "❌ I live in countryside. → ✅ I live in the countryside. (needs 'the', unlike Spanish)",
      "❌ The people in my village is very friendly. → ✅ The people in my village are very friendly. ('people' is plural in English)",
      "❌ The commute is very large. → ✅ The commute is very long. ('large' = big in size; 'long' describes time/distance)",
      "❌ I have moved to the city two years ago. → ✅ I moved to the city two years ago. (specific past time → past simple)",
      "❌ If rent will keep rising, fewer people will afford the city. → ✅ If rent keeps rising... (no 'will' in the if-clause)",
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
      {
        heading: "First conditional — a likely result of a travel choice",
        body: ["If + present simple, ... will + base verb — a realistic future result of a decision about a trip."],
        examples: [
          "If you **book** early, you**'ll save** money.",
          "If he **loses** his passport, he**'ll need** a new one.",
        ],
      },
      {
        heading: "Passive voice — who organizes and provides travel services",
        body: ["am/is/are + past participle (present); was/were + past participle (past) — for describing how trips are arranged and run."],
        examples: [
          "The trip **is organized** by the agency.",
          "The flight **was delayed** by the airline.",
        ],
      },
      {
        heading: "Comparatives — comparing trips, hotels, and travel styles",
        body: ["more + adjective + than (longer adjectives); adjective + -er + than (short adjectives); good → better is irregular."],
        examples: [
          "This hotel **is more expensive than** the one we stayed in last year.",
          "The exchange rate **is better than** last year's rate.",
        ],
      },
    ],
    commonMistakes: [
      "❌ We arrived to the airport two hours early. → ✅ We arrived at the airport two hours early. ('arrive at' for small places)",
      "❌ It was a large flight, almost twelve hours. → ✅ It was a long flight... ('large' = big in size; 'long' describes duration)",
      "❌ I'm looking forward to visit the pyramids. → ✅ ...to visiting the pyramids. ('look forward to' + gerund)",
      "❌ She is tour guide who knows the city well. → ✅ She is a tour guide... (article needed before a role noun)",
      "❌ I have visited Rome last year. → ✅ I visited Rome last year. (specific past time → past simple)",
      "❌ If you will book early, you'll save money. → ✅ If you book early... (no 'will' in the if-clause)",
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

  passive_reporting_structures: {
    title: "Passive Reporting Structures",
    intro: "News reports and academic writing often need to state a claim without saying exactly who made it — 'people say', 'experts believe', 'sources report'. English has two fixed passive structures for this, both built from a reporting verb like say/believe/think/report/know/understand/estimate/claim in its passive form.",
    sections: [
      {
        heading: "Impersonal: It is + reporting verb + that + clause",
        body: ["Start with 'It', the passive form of the reporting verb, then 'that' + a full clause.", "This is the most common and flexible pattern — it works for almost any claim."],
        examples: [
          "**It is said that** the company will merge with a rival.",
          "**It is believed that** the fire started accidentally.",
          "**It is estimated that** the project will cost millions.",
        ],
      },
      {
        heading: "Personal, present: Subject + is + reporting verb + to + base verb",
        body: ["The subject of the claim moves to the front of the sentence instead of using 'it'.", "For a PRESENT state or habit, use 'to' + the base form of the verb."],
        examples: [
          "**The area is believed to contain** oil reserves.",
          "**He is known to dislike** interviews.",
          "**The virus is thought to spread** through contact.",
        ],
      },
      {
        heading: "Personal, past: Subject + is + reporting verb + to have + past participle",
        body: ["For a COMPLETED past action or state, use 'to have' + the past participle instead of the base verb.", "If the subject didn't do the action itself (a passive event), add 'been': 'to have been' + past participle."],
        examples: [
          "**He is believed to have fled** the country.",
          "**The suspect is said to have confessed.**",
          "**The painting is thought to have been stolen** decades ago.",
        ],
      },
      {
        heading: "Shifting the whole report into the past",
        body: ["Change 'is'/'are' to 'was'/'were' to show that the report itself was made in the past, not now.", "The clause after 'that' often needs the past perfect too, since the reported event happened even earlier."],
        examples: [
          "**It was said that** the castle was haunted.",
          "**It was reported that** hundreds had been injured.",
        ],
      },
    ],
    commonMistakes: [
      "❌ It is say that the company will merge. → ✅ It is said that... ('said', the past participle, not 'say')",
      "❌ The suspect is said have fled the country. → ✅ ...is said TO have fled... (never drop 'to')",
      "❌ He is known to has strong opinions. → ✅ ...to have strong opinions. ('to have', not 'to has' — the infinitive never conjugates)",
      "❌ It were said that the castle was haunted. → ✅ It was said... ('it' always takes 'was', never 'were')",
      "❌ She is said to resigned from her position. → ✅ ...is said to HAVE resigned... (a completed past action needs 'to have' + past participle)",
      "❌ The building is reported being unsafe. → ✅ ...is reported TO BE unsafe. ('reported to be', not 'reported being')",
    ],
  },

  causative_verbs: {
    title: "Causative Verbs (have/get/make/let)",
    intro: "Have/get + something + done means you arrange for someone else to do it; make/let + someone + base verb is about forcing or permitting — and this topic also drills a distinctive mistake where learners add an unnecessary 'that' clause after make/let.",
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
      {
        heading: "The 'that' trap: no clause after make/let",
        body: [
          "A very common mistake is treating 'make' and 'let' like reporting verbs (e.g. 'say that', 'think that') and adding a 'that' clause after them.",
          "This produces a sentence with no equivalent in correct English grammar: make/let are NEVER followed by 'that'. Always use object + bare infinitive instead, with no separate subject and no 'that'.",
        ],
        examples: [
          "❌ Our teacher made us that we had to finish our homework. → ✅ Our teacher **made us finish** our homework.",
          "❌ My mother didn't let that I went to the party. → ✅ My mother **didn't let me go** to the party.",
          "❌ The rain made that we stayed inside all day. → ✅ The rain **made us stay** inside all day.",
        ],
      },
    ],
    commonMistakes: [
      "❌ Our teacher made us that we had to finish our homework. → ✅ Our teacher made us finish our homework. (no 'that + clause' after 'make' — use object + bare infinitive)",
      "❌ My mother didn't let that I went to the party. → ✅ My mother didn't let me go to the party. (no 'that + clause' after 'let' — use object + bare infinitive)",
      "❌ The teacher made us to sit in silence. → ✅ The teacher made us sit in silence. ('make' + bare infinitive, no 'to')",
      "❌ She got the plumber fix the leak. → ✅ She got the plumber to fix the leak. ('get' + person + to-infinitive)",
      "❌ I need to have my shoes repair. → ✅ I need to have my shoes repaired. ('have' + object + past participle)",
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
        body: ["enjoy, finish, suggest, avoid, consider, admit, keep, deny + -ing"],
        examples: [
          "I **enjoy visiting** new places.",
          "I **finished doing** my homework.",
          "He **suggested taking** a break.",
        ],
      },
      {
        heading: "Always infinitive",
        body: ["decide, agree, hope, promise, manage, refuse, afford, offer + to + base verb"],
        examples: [
          "She **decided to leave** her job.",
          "They **agreed to accept** the plan.",
          "We **managed to meet** the deadline.",
        ],
      },
      {
        heading: "Verbs that can take either, with no real difference",
        body: [
          "like, love, hate, prefer + -ing OR + to + base verb — both forms are correct, with little or no difference in meaning.",
        ],
        examples: [
          "I **like reading** before bed. / I **like to read** before bed. (both correct)",
          "She **loves cooking** for her family. / She **loves to cook** for her family.",
          "He **hates waiting** in long queues. / He **hates to wait** in long queues.",
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
      {
        heading: "Turning a verb sentence into a noun sentence",
        body: [
          "'There was a/an + adjective + noun + in + X' rewrites a verb sentence as a noun sentence. Use 'There has been a/an...' instead when the change is still relevant now (present perfect).",
          "The adverb becomes the matching adjective (sharply → sharp, dramatically → dramatic, gradually → gradual, suddenly → sudden, steadily → steady).",
          "Most verbs share the same noun form (rise → rise, increase → increase, fall → fall, decline → decline, drop → drop, surge → surge); some change more (grow → growth, weaken → weakening, recover → recovery, double → a doubling of, stabilise → a stabilisation, lose → a loss of, plummet → a plunge).",
        ],
        examples: [
          "Prices rose sharply. → **There was a sharp rise in prices.**",
          "Sales increased by 10%. → **There was a 10% increase in sales.**",
          "Profits grew steadily. → **There was steady growth in profits.**",
          "The economy has recovered quickly. → **There has been a quick recovery in the economy.**",
          "The company has lost market share recently. → **There has been a loss of market share recently.**",
        ],
      },
      {
        heading: "Describing how data was produced",
        body: [
          "Reports, surveys, and figures are usually described with the passive voice, since who produced them matters less than the data itself.",
          "was/were + past participle — often followed by 'by' to name the source (analysts, experts, researchers).",
        ],
        examples: [
          "The survey **was conducted** among 1,000 people.",
          "The report **was released** last week.",
          "The drop **was predicted by** experts.",
          "The data **was collected** over six months.",
          "The results **were published** this morning.",
        ],
      },
    ],
    commonMistakes: [
      "❌ Prices raised sharply last year. → ✅ Prices rose sharply last year. ('rise' is intransitive)",
      "❌ The government rose taxes. → ✅ The government raised taxes. ('raise' needs an object)",
      "❌ Sales increased of 10%. → ✅ Sales increased by 10%. ('increase by', not 'of')",
      "❌ Prices have rose steadily. → ✅ Prices have risen steadily. (present perfect needs 'risen')",
      "❌ The number of tourists have doubled. → ✅ The number of tourists has doubled. ('the number of' takes a singular verb)",
      "❌ There was a rise sharp in prices. → ✅ There was a sharp rise in prices. (adjective before the noun)",
      "❌ There was a growth steady in profits. → ✅ There was steady growth in profits. ('growth' is uncountable — no article)",
      "❌ The survey conducted among 1,000 people. → ✅ The survey was conducted among 1,000 people. (passive needs 'was/were')",
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
      {
        heading: "More workplace collocations",
        body: [
          "hand over a task (give it to a colleague), call in sick, get promoted, make a good impression, build rapport (with someone), cover someone's shift.",
          "sign off on something (approve), let someone go (fire), book annual leave, clock in, burn the midnight oil (work very late), pull your weight (do your fair share).",
          "put someone on a warning, put in for a transfer, have a word with someone (a short serious talk), keep someone posted (keep them updated), take the lead on something, reach a compromise.",
        ],
        examples: [
          "She **handed over a task** to a colleague before her holiday.",
          "He **called in sick** and stayed home.",
          "The whole team **burned the midnight oil** to finish the project.",
          "Please **keep me posted** on how the project is going.",
          "The two departments finally **reached a compromise**.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I need to scheduling a meeting. → ✅ I need to schedule a meeting. (base verb after 'need to')",
      "❌ She hand in her notice last week. → ✅ She handed in her notice last week. (past simple needs -ed)",
      "❌ We meet the deadline last week. → ✅ We met the deadline last week. (irregular past simple 'met')",
      "❌ She finally got a rise pay. → ✅ She finally got a pay rise. (fixed word order: 'pay rise')",
      "❌ He received a job offer of the company. → ✅ He received a job offer from the company. ('offer from', not 'of')",
      "❌ She signed off the new proposal. → ✅ She signed off on the new proposal. ('sign off on', not just 'sign off')",
      "❌ He didn't pull his weight enough. → ✅ He didn't pull his weight. (fixed phrase — no 'enough' needed)",
    ],
  },

  advanced_idioms_expressions: {
    title: "Advanced Idioms & Expressions",
    intro: "These idioms are fixed phrases with their own exact wording and prepositions — the meaning is figurative, so you can't guess it from the individual words.",
    sections: [
      {
        heading: "Starting, restarting, and effort",
        body: ["Idioms about beginning tasks, starting over, and working hard."],
        examples: [
          "Let's **get the ball rolling** on this project. (start something)",
          "After the failure, they went **back to the drawing board**. (start over)",
          "He **pulled an all-nighter** to finish the report. (stayed up all night working)",
          "She always **goes the extra mile** for her clients. (makes more effort than expected)",
        ],
      },
      {
        heading: "Facing difficulty, risk, and giving up",
        body: ["Idioms about tough decisions, risk, and quitting."],
        examples: [
          "They **cut corners** to finish faster, and quality suffered. (do something badly to save time/money)",
          "He's already **on thin ice** with his boss. (in a risky/precarious situation)",
          "If you don't apply soon, you might **miss the boat**. (lose an opportunity)",
          "After months of trying, they finally **threw in the towel**. (gave up)",
        ],
      },
      {
        heading: "Communication and hidden meaning",
        body: ["Idioms about how people talk to each other and what they really mean."],
        examples: [
          "I think we're all **on the same page**. (in agreement)",
          "Stop **beating around the bush** and tell me. (avoiding saying something directly)",
          "If you **read between the lines**, you'll see she isn't happy. (understand an unstated meaning)",
        ],
      },
      {
        heading: "Describing situations",
        body: ["Idioms describing surprise, scale, and attention."],
        examples: [
          "The news came completely **out of the blue**. (unexpectedly)",
          "The company prefers to stay **under the radar**. (without attracting attention)",
          "These complaints are just **the tip of the iceberg**. (a small part of a much bigger problem)",
        ],
      },
      {
        heading: "Mistakes, secrets, and honesty",
        body: ["Idioms about saying the wrong thing, revealing secrets, and being exactly right."],
        examples: [
          "He **put his foot in his mouth** at dinner. (said something embarrassing by accident)",
          "She accidentally **spilled the beans** about the surprise. (revealed a secret)",
          "He **let the cat out of the bag** before the announcement. (accidentally revealed a secret)",
          "You **hit the nail on the head** with that answer. (were exactly right)",
          "Take what he says **with a grain of salt**. (don't fully believe it)",
        ],
      },
      {
        heading: "Tough decisions and consequences",
        body: ["Idioms about facing hard choices, making things worse, and failure."],
        examples: [
          "He finally **bit the bullet** and had the surgery. (faced something unpleasant with courage)",
          "Many companies **jumped on the bandwagon** once the trend became popular. (joined something popular)",
          "Criticizing her in public only **added fuel to the fire**. (made a bad situation worse)",
          "Without funding, the plan **went down in flames**. (failed dramatically)",
          "She **burned her bridges** when she quit angrily. (destroyed a relationship, especially by leaving badly)",
        ],
      },
      {
        heading: "Shared situations and timing",
        body: ["Idioms about responsibility, rarity, and dealing with problems."],
        examples: [
          "The ball is in **your court** now — it's your decision. (it's your turn to act)",
          "We're all **in the same boat** with this deadline. (facing the same difficult situation)",
          "I only see her **once in a blue moon**. (very rarely)",
          "Nobody wanted to mention **the elephant in the room**. (an obvious problem everyone avoids discussing)",
          "We'll **cross that bridge when we come to it**. (deal with a problem only when it happens)",
          "He told a joke to **break the ice**. (relieve tension, help people feel comfortable)",
          "Losing that job was **a blessing in disguise**. (something that seemed bad but turned out good)",
        ],
      },
    ],
    commonMistakes: [
      "❌ We need to threw in the towel. → ✅ We need to throw in the towel. (base verb after 'need to')",
      "❌ They prefer to stay on the radar. → ✅ They prefer to stay under the radar. ('under', not 'on')",
      "❌ I think we're in the same page. → ✅ I think we're on the same page. ('on', not 'in')",
      "❌ They went back at the drawing board. → ✅ They went back to the drawing board. ('back to', not 'back at')",
      "❌ She always go the extra mile. → ✅ She always goes the extra mile. (third person singular needs -s)",
      "❌ He put his foot in the mouth. → ✅ He put his foot in his mouth. (possessive 'his', not 'the')",
      "❌ The ball is on your court. → ✅ The ball is in your court. ('in', not 'on')",
      "❌ She burned the bridges with her boss. → ✅ She burned her bridges with her boss. (possessive 'her', not 'the')",
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
      {
        heading: "Other useful discourse openers",
        body: ["Fixed comma-phrases that open a sentence, softening or framing the opinion that follows."],
        examples: [
          "**To a certain extent**, she has a good point.",
          "**That said**, we should still consider other options.",
          "**At the end of the day**, the cost is too high.",
        ],
      },
      {
        heading: "Reporting what someone argued",
        body: ["Reported speech backshifts the tense when you report someone's opinion or position: present simple → past simple, present perfect → past perfect, will → would, can → could."],
        examples: [
          "'I agree with the proposal,' he said. → He said (that) he **agreed** with the proposal.",
          "'We will consider the risks,' they said. → They said (that) they **would consider** the risks.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I'd argue what the policy has failed. → ✅ I'd argue that the policy has failed. ('argue that', not 'what')",
      "❌ On the one hand...; in the other, it's slower. → ✅ ...on the other, it's slower. ('on the other', not 'in the other')",
      "❌ I agree with a certain extent. → ✅ I agree to a certain extent. ('to a certain extent')",
      "❌ I'm not entire convinced. → ✅ I'm not entirely convinced. (adverb 'entirely', not adjective 'entire')",
      "❌ With all due respects... → ✅ With all due respect... (fixed singular 'respect')",
      "❌ 'We will consider the risks,' they said. → They said they will consider the risks. → ✅ ...they would consider the risks. ('will' backshifts to 'would' in reported speech)",
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
      {
        heading: "Present perfect continuous — an ongoing process, not just a result",
        body: ["Has/have been + -ing emphasises that something has been happening over a period and is still going, or just stopped — the focus is on the duration or the process, not a finished result.", "Compare with the present perfect simple above: 'has changed' reports the change itself; 'has been changing' pictures the process happening over time."],
        examples: [
          "The government **has been reforming** the curriculum for the past three years.",
          "Students **have been taking** more online courses since the pandemic.",
          "The ministry **has been discussing** new funding since January.",
        ],
      },
      {
        heading: "Passive voice — present, past, perfect, and future",
        body: ["Use the passive when the action matters more than who does it: am/is/are + past participle (present), was/were + past participle (past), has/have been + past participle (perfect), will be + past participle (future)."],
        examples: [
          "Extra classes **are offered** on Saturdays. (present)",
          "The curriculum **was reformed** in 2015. (past)",
          "The exam results **have been reviewed** by the committee. (perfect — a completed process, result matters now)",
          "A new curriculum **will be introduced** next year. (future)",
        ],
      },
      {
        heading: "Relative clauses — adding extra information about a noun",
        body: ["Who/which/that add a clause right after the noun they describe. Defining clauses (no commas) identify exactly which one; non-defining clauses (with commas) just add extra detail about something already identified."],
        examples: [
          "Students **who take national exams every year** feel a lot of pressure. (defining — specifies which students)",
          "The ministry, **which introduced a new curriculum in 2015**, wants better results. (non-defining — the ministry is already identified by name)",
          "The school **that offers extra classes on Saturdays** is very popular.",
        ],
      },
      {
        heading: "Second conditional — an unreal or unlikely present situation",
        body: ["If + past simple, ... would + base verb — describes a hypothetical situation now and its imagined result, not something you expect to actually happen."],
        examples: [
          "If the school **offered** extra classes on Saturdays, more students **would attend**.",
          "If this country **invested** more money in public schools, results **would improve**.",
          "If private schools **charged** lower fees, more families **would enrol**.",
        ],
      },
      {
        heading: "Embedded and reported questions — asking more politely, or reporting a question",
        body: ["Embed a question inside a polite phrase ('Do you know if...?', 'Could you tell me...?') using statement word order, not question word order — drop 'do/does/did' and don't invert the subject and verb.", "Report someone else's question the same way: 'asked if/whether' + statement word order."],
        examples: [
          "**Do you know if** the university offers scholarships to international students? (not 'does the university offer')",
          "**Could you tell me** why the government reformed the curriculum? (not 'did the government reform')",
          "She **asked whether** the school offered extra classes on Saturdays.",
        ],
      },
    ],
    commonMistakes: [
      "❌ During the lecture, students made questions. → ✅ ...students asked questions. (English 'asks' a question, never 'makes' one)",
      "❌ Your grade depends of how well you do. → ✅ ...depends on how well you do. ('depend on', not 'depend of')",
      "❌ My mother is teacher at a primary school. → ✅ My mother is a teacher... (article needed before a profession)",
      "❌ Students should avoid to fail. → ✅ Students should avoid failing. ('avoid' + gerund)",
      "❌ I have finished my degree in 2020. → ✅ I finished my degree in 2020. (specific past time → past simple)",
      "❌ The student which studies hardest usually succeeds. → ✅ The student who studies hardest... ('who' for people, not 'which')",
      "❌ If the school offers more classes, more students would attend. → ✅ If the school offered more classes... (past simple in the if-clause, not present)",
      "❌ Do you know does the university offer scholarships? → ✅ Do you know if the university offers scholarships? (statement word order, no second 'does')",
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
      {
        heading: "Present perfect continuous — a process building up over time",
        body: ["Has/have been + -ing focuses on an ongoing process or its recent, still-felt effects, rather than a single completed result."],
        examples: [
          "She **has been feeling** exhausted since the new project started.",
          "He **has been working** overtime every weekend this month.",
          "More companies **have been offering** flexible hours since the pandemic.",
        ],
      },
      {
        heading: "Passive voice — perfect and future",
        body: ["Has/have been + past participle emphasises a completed process whose result matters now; will be + past participle describes a future passive action."],
        examples: [
          "Mental health support **has been offered** by more employers recently.",
          "A four-day week **will be introduced** by several companies next year.",
        ],
      },
      {
        heading: "Relative clauses — whose, who, that",
        body: ["'Whose' shows possession; 'who'/'that' identify people or things directly. Defining clauses (no commas) narrow down which one; non-defining clauses (with commas) add extra detail."],
        examples: [
          "Employees **whose** boundaries are clear tend to feel less stressed. (possession)",
          "Employees **who work remotely** still need clear boundaries. (defining)",
          "Her manager, **who never takes a lunch break**, seems constantly stressed. (non-defining)",
        ],
      },
      {
        heading: "Embedded and reported questions",
        body: ["Embed a question inside a polite phrase using statement word order — no 'do/does/did', no inverted subject and verb. Report someone's question with 'asked if/whether' the same way."],
        examples: [
          "**Do you know if** her company offers mental health support? (not 'does her company offer')",
          "**Could you tell me why** he struggles to switch off? (not 'does he struggle')",
          "She **asked whether** he had learned to set boundaries.",
        ],
      },
    ],
    commonMistakes: [
      "❌ She was embarrassed with her first child. → ✅ She was pregnant with her first child. ('embarrassed' ≠ 'pregnant' — a false friend)",
      "❌ My boss is very sympathetic. → ✅ My boss is very friendly. ('sympathetic' means compassionate about a problem, not friendly)",
      "❌ I always make a pause at midday. → ✅ I always take a break at midday. ('take a break', not 'make a pause')",
      "❌ I am agree that companies should offer flexible hours. → ✅ I agree that... ('agree' is a verb, no 'am')",
      "❌ I am working too much hours. → ✅ I am working too many hours. ('too many' with countable plural nouns)",
      "❌ Employees which boundaries are unclear feel overwhelmed. → ✅ Employees whose boundaries are unclear... ('whose' for possession, not 'which')",
      "❌ Do you know does she work overtime? → ✅ Do you know if she works overtime? (statement word order, no second 'does')",
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
      {
        heading: "Present perfect continuous — the ongoing effort itself",
        body: ["Has/have been + -ing pictures the process of working toward something, not just the result — useful for describing sustained motivation or a habit you're building."],
        examples: [
          "She **has been working** toward her goal for two years.",
          "He **has been trying** to build a successful business since he graduated.",
        ],
      },
      {
        heading: "Passive voice — perfect and future",
        body: ["Has/have been + past participle for a completed process that matters now; will be + past participle for something planned or expected in the future."],
        examples: [
          "Her goal **has been achieved**.",
          "The sales target **will be reached** by the end of the quarter.",
        ],
      },
      {
        heading: "Relative clauses — who, which, whose",
        body: ["Add extra information right after the noun. Defining clauses (no commas) identify which one; non-defining clauses (with commas) add extra detail about something already identified."],
        examples: [
          "People **who have a growth mindset** embrace failure as a learning opportunity. (defining)",
          "The entrepreneur, **who achieved her goal last year**, inspires many others. (non-defining)",
          "People **whose persistence never fails** usually reach their goals. (possession)",
        ],
      },
      {
        heading: "Second conditional — an unreal or unlikely present situation",
        body: ["If + past simple, ... would + base verb — a hypothetical present situation and its imagined result."],
        examples: [
          "If she **believed** in herself more, she **would achieve** more.",
          "If he **had** a mentor, he **would develop** faster.",
        ],
      },
      {
        heading: "Embedded and reported questions",
        body: ["Embed a question inside a polite phrase using statement word order — no 'do/does/did', no inverted subject and verb."],
        examples: [
          "**Do you know if** she believes in hard work? (not 'does she believe')",
          "**Could you tell me how** he overcame his fear of failure? (not 'did he overcome')",
        ],
      },
    ],
    commonMistakes: [
      "❌ My coach is very sensible about my feelings. → ✅ My coach is very sensitive about my feelings. ('sensible' means practical/wise; 'sensitive' is about emotions)",
      "❌ After finishing his career, he got a job. → ✅ After finishing his degree, he got a job. ('career' ≠ 'degree' — false friend)",
      "❌ Successful people don't avoid to fail. → ✅ ...don't avoid failing. ('avoid' + gerund)",
      "❌ She is very interested on personal development. → ✅ ...interested in personal development. ('interested in', not 'on')",
      "❌ I have achieved this goal last year. → ✅ I achieved this goal last year. (specific past time → past simple)",
      "❌ People which have a growth mindset embrace failure. → ✅ People who have a growth mindset... ('who' for people, not 'which')",
      "❌ Do you know does she believe in hard work? → ✅ Do you know if she believes in hard work? (statement word order, no second 'does')",
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
      {
        heading: "Relative clauses — adding extra information with 'which'",
        body: ["'Which' adds a clause right after a thing, idea, or custom to describe or explain it further."],
        examples: [
          "Eye contact is a gesture **which is considered polite** in this culture.",
          "This is a tradition **which puzzles foreign visitors**.",
          "She has lived in three countries **which have very different customs**.",
        ],
      },
      {
        heading: "Present perfect continuous — an ongoing process of change",
        body: ["Has/have been + -ing focuses on the process of adapting or learning over time, not just the result."],
        examples: [
          "She **has been adapting** to a new culture for months.",
          "He **has been learning** local etiquette since his arrival.",
        ],
      },
      {
        heading: "Passive voice — perfect and future",
        body: ["Has/have been + past participle for a completed process that matters now; will be + past participle for a future passive action."],
        examples: [
          "The tradition **has been passed down** for generations.",
          "The festival **will be celebrated** by the whole community next month.",
        ],
      },
      {
        heading: "Second conditional — a hypothetical improvement",
        body: ["If + past simple, ... would + base verb — an unreal or unlikely present situation and its imagined result."],
        examples: [
          "If she **understood** local etiquette, she **would avoid** embarrassing mistakes.",
          "If tourists **researched** local customs first, they **would avoid** causing offence.",
        ],
      },
      {
        heading: "Embedded and reported questions",
        body: ["Embed a question inside a polite phrase using statement word order — no 'do/does/did', no inverted subject and verb."],
        examples: [
          "**Do you know if** eye contact is considered polite here? (not 'is eye contact considered')",
          "**Could you tell me why** people avoid eye contact here? (not 'do people avoid')",
        ],
      },
    ],
    commonMistakes: [
      "❌ In my country, we make a big party. → ✅ ...we have a big party. ('have/throw a party', never 'make a party')",
      "❌ Table manners are very different of Spain. → ✅ ...different from Spain. ('different from', not 'different of')",
      "❌ My host family was very sympathetic. → ✅ My host family was very kind. ('sympathetic' means compassionate about a problem, not friendly)",
      "❌ I look forward to visit different countries. → ✅ ...to visiting different countries. ('look forward to' + gerund)",
      "❌ I have visited Japan last year. → ✅ I visited Japan last year. (specific past time → past simple)",
      "❌ Do you know does she understand etiquette? → ✅ Do you know if she understands etiquette? (statement word order, no second 'does')",
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
        body: ["Passive voice is common when describing what's being done, rather than who is doing it. Has/have been + past participle for a completed process that matters now; will be + past participle for the future."],
        examples: [
          "Carbon emissions **can be reduced** through renewable energy investment.",
          "Global temperatures **have been monitored** closely by scientists for years.",
          "Stricter emissions targets **will be implemented** by experts by 2030.",
        ],
      },
      {
        heading: "Relative clauses — adding a consequence or extra fact with 'which'",
        body: ["'Which' can add a defining or non-defining clause about a thing just mentioned — often used to state a consequence. 'Who'/'that' identify a person or thing directly — no commas needed."],
        examples: [
          "Factories produce large amounts of carbon dioxide, **which traps heat** in the atmosphere.",
          "Coral reefs, **which support thousands of marine species**, are dying.",
          "People **who recycle their waste** help protect the environment.",
          "Cars **that run on electricity** produce no emissions.",
        ],
      },
      {
        heading: "Present perfect continuous — an ongoing trend",
        body: ["Has/have been + -ing describes a process that has been happening over time and is often still continuing."],
        examples: [
          "Temperatures **have been rising** steadily for the last century.",
          "Scientists **have been warning** about rising temperatures for decades.",
        ],
      },
      {
        heading: "Second conditional — an unreal or unlikely present solution",
        body: ["If + past simple, ... would + base verb — a hypothetical action now and its imagined result."],
        examples: [
          "If governments **invested** more in renewable energy, emissions **would fall**.",
          "If people **used** public transport more, air quality **would improve**.",
        ],
      },
      {
        heading: "Embedded and reported questions",
        body: ["Embed a question inside a polite phrase using statement word order — no 'do/does/did', no inverted subject and verb."],
        examples: [
          "**Do you know if** renewable energy reduces emissions? (not 'does renewable energy reduce')",
          "**Could you tell me why** deforestation causes biodiversity loss? (not 'does deforestation cause')",
        ],
      },
    ],
    commonMistakes: [
      "❌ We should avoid to use single-use plastic. → ✅ ...avoid using single-use plastic. ('avoid' + gerund)",
      "❌ Factories are responsible of emissions. → ✅ ...responsible for emissions. ('responsible for', not 'responsible of')",
      "❌ Some governments don't do nothing. → ✅ ...don't do anything. (only one negative per clause)",
      "❌ The pollution is destroying our planet. → ✅ Pollution is destroying our planet. (no article for general/abstract nouns)",
      "❌ Scientists have discovered new evidence last month. → ✅ Scientists discovered new evidence last month. (specific past time → past simple)",
      "❌ Do you know does renewable energy reduce emissions? → ✅ Do you know if renewable energy reduces emissions? (statement word order, no second 'does')",
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
      {
        heading: "Present perfect continuous — a rising trend",
        body: ["Has/have been + -ing describes a trend that's been building over time."],
        examples: [
          "More shoppers **have been choosing** second-hand clothes recently.",
          "The brand **has been losing** customers for months.",
        ],
      },
      {
        heading: "Passive voice — perfect and future",
        body: ["Has/have been + past participle for a completed process that matters now; will be + past participle for the future."],
        examples: [
          "Unsold stock **has been destroyed** by several major brands.",
          "A new recycling scheme **will be launched** by the company next year.",
        ],
      },
      {
        heading: "Relative clauses — adding a consequence with 'which'",
        body: ["'Which' can add extra information or a consequence about a thing just mentioned."],
        examples: [
          "The brand releases a new collection every month, **which creates** huge amounts of waste.",
          "Fast fashion, **which relies on cheap labour**, has been widely criticised.",
        ],
      },
      {
        heading: "Embedded and reported questions",
        body: ["Embed a question inside a polite phrase using statement word order — no 'do/does/did', no inverted subject and verb."],
        examples: [
          "**Do you know if** this brand uses sustainable materials? (not 'does this brand use')",
          "**Could you tell me why** workers don't receive fair wages? (not 'don't workers receive')",
        ],
      },
    ],
    commonMistakes: [
      "❌ Consumers try to avoid to buy unethical clothes. → ✅ ...avoid buying unethical clothes. ('avoid' + gerund)",
      "❌ Young consumers are more interested on sustainable fashion. → ✅ ...interested in sustainable fashion. ('interested in', not 'on')",
      "❌ My aunt works in factory. → ✅ My aunt works in a factory. (article needed before a singular countable noun)",
      "❌ Brands own fabrics in countries where labour is cheap. → ✅ ...own factories... ('fabric' ≠ 'factory' — false friend)",
      "❌ Fast fashion has become popular in the 1990s. → ✅ Fast fashion became popular in the 1990s. (specific past decade → past simple)",
      "❌ Do you know does this brand use sustainable materials? → ✅ Do you know if this brand uses sustainable materials? (statement word order, no second 'does')",
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
      {
        heading: "Present perfect continuous — a growing trend",
        body: ["Has/have been + -ing focuses on a process that's been building over time."],
        examples: [
          "More people **have been using** smart home devices recently.",
          "This app **has been growing** in popularity for months.",
        ],
      },
      {
        heading: "Relative clauses — a consequence with 'which'",
        body: ["'Which' can add extra information or a consequence about something just mentioned."],
        examples: [
          "Smartphones make life easier, **which explains their popularity**.",
          "Artificial intelligence, **which is developing fast**, is changing many industries.",
        ],
      },
      {
        heading: "Second conditional — an imagined improvement",
        body: ["If + past simple, ... would + base verb — a hypothetical present situation and its imagined result."],
        examples: [
          "If companies **invested** more in cybersecurity, fewer people **would be hacked**.",
          "If phones **were** less addictive, people **would sleep** better.",
        ],
      },
      {
        heading: "Embedded and reported questions",
        body: ["Embed a question inside a polite phrase using statement word order — no 'do/does/did', no inverted subject and verb."],
        examples: [
          "**Do you know if** this app tracks your location? (not 'does this app track')",
          "**Could you tell me why** the update failed? (not 'did the update fail')",
        ],
      },
    ],
    commonMistakes: [
      "❌ Actually, most people use their phone for social media. → ✅ Nowadays, most people use their phone... ('actually' means 'in fact', not 'nowadays'/'currently')",
      "❌ My phone battery lasts a large time. → ✅ ...lasts a long time. ('large' = big in size; 'long' describes duration)",
      "❌ I have this laptop since five years. → ✅ I have had this laptop for five years. ('for' + duration, and 'have had' not 'have')",
      "❌ Many people listen music while they commute. → ✅ ...listen to music... ('listen to' + thing)",
      "❌ She has downloaded that app last week. → ✅ She downloaded that app last week. (specific past time → past simple)",
      "❌ Do you know does this app track my location? → ✅ Do you know if this app tracks my location? (statement word order, no second 'does')",
    ],
  },

  present_simple: {
    title: "Present Simple",
    intro: "The foundation of present simple: add -s for he/she/it, and use do/does for negatives and questions — never both at once.",
    sections: [
      {
        heading: "Positive form",
        body: [
          "Add -s (or -es) to the verb for he/she/it; no ending for I/you/we/they.",
          "Verbs ending in -o, -ch, -sh, -ss, -x, or -z add -es instead of just -s.",
        ],
        examples: [
          "She **goes** to school every day. (verb ends in -o → add -es)",
          "He **watches** TV after dinner. (verb ends in -ch → add -es)",
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

  auxiliary_verbs_be_do: {
    title: "Auxiliary Verbs (Be vs Do)",
    intro: "English has two different 'helper' patterns for negatives and questions, and beginners often mix them up. The trick is simple: look at what comes after the subject. An adjective, a job, or a place needs 'be' (am/is/are). An action verb needs 'do/does'.",
    sections: [
      {
        heading: "Use 'be' for adjectives, jobs, and places",
        body: [
          "If the sentence describes a feeling, a job/role, or where someone is, the main verb is already 'be' — use am/is/are directly, don't add 'do/does' as well.",
        ],
        examples: [
          "**Are** you happy?",
          "**Is** she a teacher?",
          "**Are** they at home?",
        ],
      },
      {
        heading: "Use 'do/does' for action verbs",
        body: [
          "If the sentence has an action verb (like, live, work, study, play...), that verb needs 'do/does' for questions and negatives — never 'be'.",
        ],
        examples: [
          "**Do** you like pizza?",
          "**Does** she work here?",
          "**Do** they play football?",
        ],
      },
      {
        heading: "Negatives",
        body: [
          "'Be' negative: am not / isn't / aren't.",
          "Action verb negative: don't / doesn't + base verb.",
        ],
        examples: [
          "I **am not** tired.",
          "He **isn't** hungry.",
          "I **don't** like loud music.",
          "He **doesn't** eat meat.",
        ],
      },
      {
        heading: "Never combine the two",
        body: [
          "A sentence never needs both 'be' and 'do/does' together — pick the one that matches the main verb.",
        ],
        examples: [
          "❌ She is has a car. → ✅ She has a car.",
          "❌ He don't is tired. → ✅ He isn't tired.",
        ],
      },
    ],
    commonMistakes: [
      "❌ Do you happy? → ✅ Are you happy? ('happy' is an adjective — use 'be', not 'do')",
      "❌ Is she like music? → ✅ Does she like music? ('like' is an action verb — use 'does', not 'is')",
      "❌ Are you speak English? → ✅ Do you speak English? ('speak' is an action verb — use 'do', not 'are')",
      "❌ Does she a nurse? → ✅ Is she a nurse? (a profession uses 'be', not 'does')",
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
      "❌ She cans speak English. → ✅ She can speak English. ('can' never takes -s, even with 'she')",
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

  present_continuous_a2: {
    title: "Present Continuous (Temporary Situations)",
    intro: "Present continuous isn't only for 'right now' — it also describes temporary situations happening around this period of time, and a small group of verbs almost never use it at all.",
    sections: [
      {
        heading: "Temporary situations (not just this second)",
        body: [
          "Present continuous can describe something true for a limited period around now — this week, this month, these days — even if it's not happening at this exact second.",
        ],
        examples: [
          "I'**m reading** a great book at the moment. (not literally reading right now)",
          "She'**s staying** with her parents this month.",
          "We'**re working** on a new project this week.",
        ],
      },
      {
        heading: "Present simple vs continuous: permanent vs temporary",
        body: ["Present simple describes permanent facts and routines; present continuous describes a temporary situation, even a fairly long one."],
        examples: [
          "I **live** in Madrid. (permanent) vs I'**m living** with a friend until I find my own place. (temporary)",
          "He **works** at a bank. (permanent job) vs He'**s working** from home this week. (temporary arrangement)",
        ],
      },
      {
        heading: "State verbs: verbs that don't normally take -ing",
        body: [
          "A small group of verbs describe states, not actions, and are almost never used in the continuous form — even when talking about now.",
          "Common ones: like, love, hate, want, need, know, understand, believe, remember, belong, own, seem.",
          "Note: 'have' can be continuous when it means an activity ('having lunch', 'having a shower'), but not when it means possession ('I have a car', not 'I am having a car').",
        ],
        examples: [
          "❌ I am liking this song. → ✅ I **like** this song.",
          "❌ She is knowing the answer. → ✅ She **knows** the answer.",
          "I **understand** the question. (not 'I am understanding')",
        ],
      },
    ],
    commonMistakes: [
      "❌ I am liking this song. → ✅ I like this song. (state verbs don't take -ing)",
      "❌ She is knowing the answer. → ✅ She knows the answer. (state verb)",
      "❌ I am wanting a coffee. → ✅ I want a coffee. (state verb)",
      "❌ He is having a nice car. → ✅ He has a nice car. ('have' meaning possession is a state verb, unlike 'having lunch')",
      "❌ This book is belonging to the library. → ✅ This book belongs to the library. (state verb)",
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
      {
        heading: "Ordinal numbers in dates",
        body: [
          "Dates use ordinal numbers (1st, 2nd, 3rd, 4th...), not cardinal numbers (one, two, three).",
          "Most ordinals just add -th to the number (four → fourth). 1st, 2nd, and 3rd are irregular, and that same irregular pattern repeats after 20 (21st, 22nd, 23rd), before going back to -th (24th).",
        ],
        examples: [
          "My birthday is on May **1st** (the first).",
          "The meeting is on June **3rd** (the third).",
          "The exam is on October **21st** (the twenty-first) — not '21th'.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I go to English class in Friday. → ✅ ...on Friday. ('on' with days)",
      "❌ My birthday is on July. → ✅ My birthday is in July. ('in' with months)",
      "❌ The lesson starts in 8 o'clock. → ✅ ...at 8 o'clock. ('at' with clock times)",
      "❌ Christmas is in December 25th. → ✅ Christmas is on December 25th. ('on' with a specific date)",
      "❌ We meet at the morning. → ✅ We meet in the morning. ('in' with parts of the day)",
      "❌ The party is on May 5. → ✅ The party is on May 5th. (dates need the ordinal ending, not the plain number)",
      "❌ Her birthday is on June 3th. → ✅ ...June 3rd. ('3rd' is irregular, not '3th')",
    ],
  },

  what_time_is_it: {
    title: "What Time is It?",
    intro: "English tells clock time using fixed phrases built around the hour — 'o'clock', 'half past', 'quarter past/to', and minutes 'past' or 'to'. Once you know the pattern for each type, you can say any time on the clock.",
    sections: [
      {
        heading: "Asking and answering",
        body: ["'What time is it?' and 'What's the time?' mean exactly the same thing.", "Always start your answer with 'It's'."],
        examples: [
          "**What time is it?** It's three o'clock.",
          "**What's the time?** It's half past six.",
        ],
      },
      {
        heading: "O'clock — exact hours",
        body: ["Use 'o'clock' only when the time is an exact hour, with no minutes."],
        examples: [
          "It's **six o'clock**. (6:00)",
          "The film starts at **eight o'clock**. (8:00)",
        ],
      },
      {
        heading: "Half past, quarter past, quarter to",
        body: ["'Half past' + the hour = 30 minutes after it.", "'Quarter past' + the hour = 15 minutes after it.", "'Quarter to' + the NEXT hour = 15 minutes before it — the hour number jumps forward."],
        examples: [
          "It's **half past three**. (3:30)",
          "It's **quarter past four**. (4:15)",
          "It's **quarter to five**. (4:45 — 15 minutes before FIVE, not four)",
        ],
      },
      {
        heading: "Minutes past and minutes to",
        body: ["For minutes 1-29 after the hour, say the number, then 'past', then the hour.", "For minutes 31-59, count forward to the NEXT hour instead, using 'to'.", "The switch happens exactly at the half hour (30 minutes)."],
        examples: [
          "It's **ten past two**. (2:10)",
          "It's **twenty past two**. (2:20)",
          "It's **ten to three**. (2:50 — 10 minutes before THREE)",
        ],
      },
      {
        heading: "Midday, midnight, and the parts of the day",
        body: ["'Midday' and 'noon' both mean 12:00 in the daytime; 'midnight' means 12:00 at night — both are used alone, with no 'o'clock'.", "Add 'in the morning/afternoon/evening' or 'at night' after a time to make it clear which part of the day you mean.", "Always use 'at' before a clock time."],
        examples: [
          "We're meeting for lunch at **midday**.",
          "The party finished at **midnight**.",
          "I wake up **at seven in the morning**.",
        ],
      },
    ],
    commonMistakes: [
      "❌ It's three and a half. → ✅ It's half past three. (never 'and a half' for time)",
      "❌ What hour is it? → ✅ What time is it? (we ask 'what time', not 'what hour')",
      "❌ It's ten to past six. → ✅ It's ten past six. (never combine 'to' and 'past')",
      "❌ It's o'clock eight. → ✅ It's eight o'clock. (the number always comes before 'o'clock')",
      "❌ It's quarter to nine o'clock. → ✅ It's quarter to nine. (don't add 'o'clock' after 'past'/'to' times)",
      "❌ My class starts on nine o'clock. → ✅ ...at nine o'clock. (clock times always use 'at')",
    ],
  },

  house_objects_rooms_there_is_are: {
    title: "Objects and Rooms in the House",
    intro: "This topic is about the vocabulary for rooms and furniture — what each room is for and what objects belong in it — with 'there is/are' and basic place prepositions used only as supporting tools to describe them.",
    sections: [
      {
        heading: "Rooms and what they're for",
        body: ["Each room in a house has its own name and its own purpose."],
        examples: [
          "**kitchen** (cooking), **bedroom** (sleeping), **bathroom** (washing)",
          "**living room** (relaxing), **dining room** (eating meals), **garage** (parking a car)",
          "**hallway** (connects rooms), **garden** (outdoor area)",
        ],
      },
      {
        heading: "Furniture and objects",
        body: ["Common objects found around the house, grouped by what they're used for."],
        examples: [
          "**sofa**, **table**, **chair**, **bed** — furniture for sitting or sleeping",
          "**fridge**, **sink**, **lamp**, **mirror**, **clock**, **plates**, **cushions** — everyday objects with a clear job",
          "**wardrobe**, **shelf**, **curtains**, **cupboard** — for storing or covering things",
          "**plants**, **rug** — for decorating a room",
        ],
      },
      {
        heading: "Describing where things are",
        body: [
          "'There is' + singular noun; 'there are' + plural noun, to say what a room contains.",
          "in = inside something; on = on a surface; under = below something.",
        ],
        examples: [
          "**There is** a fridge in the kitchen.",
          "**There are** two chairs in the kitchen.",
          "The lamp is **on** the table. The shoes are **under** the bed.",
        ],
      },
      {
        heading: "Some vs any",
        body: [
          "Use **some** in positive sentences with plural nouns.",
          "Use **any** instead of 'some' in negatives and questions.",
        ],
        examples: [
          "**There are some** books on the bookshelf.",
          "**There aren't any** books on the bookshelf. (not 'there aren't some')",
          "**Are there any** books on the bookshelf? (not 'are there some')",
        ],
      },
    ],
    commonMistakes: [
      "❌ The fridge is on the kitchen. → ✅ The fridge is in the kitchen. (use 'in' for a room, not 'on')",
      "❌ I keep my car in the bedroom. → ✅ I keep my car in the garage. (cars belong in the garage)",
      "❌ You wash the dishes in the wardrobe. → ✅ You wash the dishes in the sink. (a wardrobe stores clothes, not dishes)",
      "❌ The lamp is in the table. → ✅ The lamp is on the table. ('on' for a surface)",
      "❌ There are a table in the dining room. → ✅ There is a table in the dining room. (singular noun → 'there is')",
      "❌ There aren't some books on the shelf. → ✅ There aren't any books on the shelf. ('some' becomes 'any' in negatives)",
    ],
  },

  possessive_adjectives_pronouns: {
    title: "Possessive Adjectives vs Possessive Pronouns",
    intro: "Possessive adjectives (my, your, her) go before a noun; possessive pronouns (mine, yours, hers) stand completely alone, with no noun after them; 'whose' asks the question that a possessive pronoun answers.",
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
      {
        heading: "Asking about ownership: whose?",
        body: [
          "'Whose' asks who something belongs to: **whose** + noun + is/are + this/that/these/those?",
          "Answer a 'whose' question with a possessive pronoun, not a possessive adjective.",
          "Don't confuse 'whose' (asks about ownership) with 'who's' (short for 'who is' or 'who has') — they sound identical but mean different things.",
        ],
        examples: [
          "**Whose bag is this?** It's mine.",
          "**Whose shoes are these?** They're hers.",
          "**Whose** house is that? (not 'Who's house is that?')",
        ],
      },
    ],
    commonMistakes: [
      "❌ This is mine pen. → ✅ This is my pen. (use 'my' before a noun)",
      "❌ That jacket is her. → ✅ That jacket is hers. (use 'hers' with no noun after it)",
      "❌ It is your. → ✅ It is yours. (use 'yours' with no noun after it)",
      "❌ This is theirs house. → ✅ This is their house. (use 'their' before a noun)",
      "❌ Who's bag is this? → ✅ Whose bag is this? ('whose' asks about ownership; 'who's' means 'who is')",
      "❌ Whose bag is this? It's my. → ✅ It's mine. (answer a 'whose' question with a possessive pronoun)",
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

  dependent_prepositions: {
    title: "Dependent Prepositions",
    intro: "Many English adjectives and verbs are always followed by one particular preposition — not the one your own language might use, and not one you can choose freely. There's no shortcut rule for which preposition goes with which word; the pairs simply have to be learned together, as a single fixed phrase.",
    sections: [
      {
        heading: "Adjective + preposition",
        body: ["Certain adjectives always take the same preposition before the noun or -ing form that follows them.", "'in' → interested in", "'at' → good at, bad at", "'of' → afraid of, proud of, tired of, aware of", "'for' → famous for, responsible for", "'to' → married to, similar to", "'about' → worried about, excited about"],
        examples: [
          "I've always been **interested in** photography.",
          "My brother is really **good at** chess.",
          "My little sister is **afraid of** the dark.",
          "She's been **married to** Anna for five years.",
          "I'm **worried about** my exam results.",
        ],
      },
      {
        heading: "Verb + preposition",
        body: ["Certain verbs always take the same preposition before their object — dropping it, or swapping it for another one, is a common learner mistake.", "'on' → depend on", "'to' → listen to", "'in' → believe in", "'for' → wait for, look for, apologize for", "'with' → agree with", "'about' → complain about"],
        examples: [
          "Our plans **depend on** the weather.",
          "I always **listen to** music while I study.",
          "She doesn't **believe in** ghosts.",
          "We **waited for** the bus in the rain.",
          "The neighbors **complained about** the noise.",
        ],
      },
      {
        heading: "'Different from', 'congratulate ... on', 'arrive at/in'",
        body: ["'Different' is followed by 'from' in careful, standard English.", "'Congratulate' someone is followed by 'on' + the reason.", "'Arrive' has no single fixed preposition — use 'at' for a building or specific point, and 'in' for a city or country."],
        examples: [
          "Living abroad is very **different from** visiting on holiday.",
          "We **congratulated** her **on** passing her exams.",
          "We **arrived at** the airport two hours early.",
          "They **arrived in** Japan on a Monday morning.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I'm interested for learning Japanese. → ✅ ...interested in learning Japanese. ('interested' takes 'in')",
      "❌ She's very good in maths. → ✅ ...good at maths. ('good' takes 'at' for a skill)",
      "❌ This plan depends of the weather. → ✅ ...depends on the weather. ('depend' takes 'on')",
      "❌ Please listen me carefully. → ✅ Please listen to me carefully. ('listen' always needs 'to')",
      "❌ Who's responsible of this mess? → ✅ Who's responsible for this mess? ('responsible' takes 'for')",
      "❌ She's been married with him for ten years. → ✅ ...married to him... ('married' takes 'to')",
      "❌ Let's congratulate her for her new job. → ✅ ...congratulate her on her new job. ('congratulate' takes 'on')",
      "❌ What time does the train arrive to the station? → ✅ ...arrive at the station. ('arrive' never takes 'to')",
    ],
  },

  conjunctions: {
    title: "Conjunctions",
    intro: "Conjunctions join words, phrases, and clauses together. Coordinating conjunctions (and, but, or, so) join two equal ideas; subordinating conjunctions (although, because, when, if) attach a smaller clause to a main one — and each one has its own rules about position and punctuation.",
    sections: [
      {
        heading: "Coordinating conjunctions: and, but, or, so",
        body: ["'and' adds a similar idea; 'but' shows contrast; 'or' shows an alternative; 'so' shows a result.", "Use a comma before the conjunction when joining two full sentences (each with its own subject and verb)."],
        examples: [
          "She's smart **and** hardworking.",
          "The film was long, **but** really enjoyable.",
          "We can watch a film **or** go for a walk.",
          "It was late, **so** we called a taxi.",
        ],
      },
      {
        heading: "Because vs so — reason and result point in opposite directions",
        body: ["'Because' introduces the REASON (why something happened).", "'So' introduces the RESULT (what happened because of it).", "Don't mix them up — the clause after each one has to match its own direction."],
        examples: [
          "We stayed inside **because** it was raining. (reason)",
          "It was raining, **so** we stayed inside. (result)",
        ],
      },
      {
        heading: "Although / though / even though / whereas — never with 'but'",
        body: ["These all introduce a surprising or contrasting clause — but they already mean 'contrast', so never add 'but' as well in the same sentence.", "'Even though' is a stronger version of 'although'.", "'Whereas' is a more formal way to contrast two separate facts.", "'Though' can informally go at the very end of a sentence."],
        examples: [
          "**Although** it was raining, we went for a walk. (not '...raining, but we went...')",
          "**Even though** he trained for months, he didn't win.",
          "City life is fast-paced, **whereas** country life is calm.",
          "The house is small. It's very cozy, **though**.",
        ],
      },
      {
        heading: "When / if + present tense for the future",
        body: ["After 'when' and 'if', use the present tense even when the meaning is future — never 'will'."],
        examples: [
          "**When** you finish your homework, you can watch TV. (not 'When you will finish...')",
          "**If** it rains tomorrow, we'll cancel the trip. (not 'If it will rain...')",
        ],
      },
    ],
    commonMistakes: [
      "❌ Although it was raining, but we went for a walk. → ✅ Although it was raining, we went for a walk. (never 'although' + 'but' together)",
      "❌ It was raining, because we stayed inside. → ✅ It was raining, so we stayed inside. ('so' for a result)",
      "❌ We stayed inside so it was raining. → ✅ We stayed inside because it was raining. ('because' for a reason)",
      "❌ When you will finish your homework... → ✅ When you finish your homework... (no 'will' after 'when')",
      "❌ If it will rain tomorrow... → ✅ If it rains tomorrow... (no 'will' after 'if')",
      "❌ She likes reading, write, and painting. → ✅ She likes reading, writing, and painting. (keep the same form in a list)",
    ],
  },

  articles: {
    title: "Articles (a/an/the/no article)",
    intro: "English articles trip learners up in two opposite directions: adding 'the' to a general statement where English needs no article at all, and dropping 'a/an' before a singular countable noun where English always needs one. This lesson covers both directions.",
    sections: [
      {
        heading: "'A/an' for new information, 'the' for known information",
        body: ["Use 'a/an' the first time you mention a singular countable noun.", "Use 'the' once both speakers know exactly which one you mean — including the second time you mention the same thing."],
        examples: [
          "I bought **a** new laptop yesterday. **The** laptop is amazing.",
          "She works as **a** nurse.",
        ],
      },
      {
        heading: "No article for general statements",
        body: ["When you're talking about a whole category (not specific examples), English uses NO article at all — not even 'the'.", "This applies to plural nouns and to abstract/uncountable nouns used generally.", "This is one of the most common article mistakes: adding 'the' to a general statement when it should have no article at all."],
        examples: [
          "**Dogs** are loyal animals. (not 'The dogs are loyal animals')",
          "**Money** can't buy happiness. (not 'The money can't buy happiness')",
          "**France** is a beautiful country. (not 'The France')",
        ],
      },
      {
        heading: "Never drop 'a/an' before a singular countable noun",
        body: ["It can be tempting to skip 'a' and 'the' completely, but English always needs 'a/an' before a singular countable noun — professions, objects, first mentions — with no exceptions.", "'A/an' depends on the SOUND that follows, not the spelling: 'an hour' (silent h), but 'a university' (sounds like 'yoo-')."],
        examples: [
          "She is **a** teacher. (not 'She is teacher')",
          "I have **a** dog. (not 'I have dog')",
          "It took **an** hour. / He's **a** university student.",
        ],
      },
      {
        heading: "Fixed no-article expressions",
        body: ["No article for meals (have breakfast/lunch/dinner), for methods of transport after 'by' (by bus/car/train), and for institutions used in their general sense (go to bed/school/work/prison).", "Use 'the' when you mean the specific building instead of the institution's purpose."],
        examples: [
          "We have **dinner** at eight. I go to work **by train**.",
          "I go to **bed** at eleven. (routine) vs. I sat on **the bed**. (the object)",
          "His brother is in **prison**. (he's a convict) vs. I visited **the prison**. (the building)",
        ],
      },
      {
        heading: "'The' for unique things, superlatives, and plural-form countries",
        body: ["'The' for things there's only one of (the sun, the internet, the moon).", "'The' after superlatives (the best, the worst, the tallest).", "'The' before country names that are plural or contain 'of' (the United States, the Netherlands, the Philippines) — most other countries take no article."],
        examples: [
          "**The** sun was setting over the mountains.",
          "That was **the** best meal I've ever had.",
          "**The** United States has fifty states, but Japan has none.",
        ],
      },
    ],
    commonMistakes: [
      "❌ The dogs are loyal animals. → ✅ Dogs are loyal animals. (a general statement about a whole category needs no article)",
      "❌ The money can't buy happiness. → ✅ Money can't buy happiness. (abstract noun in general = no article)",
      "❌ I have dog. / She is teacher. → ✅ I have a dog. / She is a teacher. (never drop 'a/an' before a singular countable noun)",
      "❌ It took hour to get there. → ✅ It took an hour to get there. ('hour' starts with a vowel sound)",
      "❌ She's an university student. → ✅ She's a university student. ('university' starts with a consonant sound)",
      "❌ The France is a beautiful country. → ✅ France is a beautiful country. (most country names take no article)",
      "❌ We visited a United States. → ✅ We visited the United States. (plural-form country names need 'the')",
      "❌ This is a best restaurant in town. → ✅ This is the best restaurant in town. (superlatives always need 'the')",
    ],
  },

  clauses_of_purpose: {
    title: "Clauses of Purpose",
    intro: "A clause of purpose explains WHY someone does something — the goal or intention behind an action. English splits this idea across two different words, 'to' and 'for', depending on whether a verb or a noun follows — and mixing the two up is the most common mistake.",
    sections: [
      {
        heading: "To + verb — the standard way to express purpose",
        body: ["'To' + base verb is the normal, neutral way to say why you did something specific.", "'For' only works before a noun, never before a verb — this is where the two connectors are most often mixed up."],
        examples: [
          "I went to the store **to buy** milk. (not 'for buy milk')",
          "She's learning English **to get** a better job. (not 'for get')",
          "I'm calling **to book** a table. (not 'for book')",
        ],
      },
      {
        heading: "For + noun / for + -ing — never 'for' + base verb",
        body: ["'For' + a noun states the thing you're getting or the beneficiary — no verb involved.", "'For' + -ing describes the general function of an object or product, not one specific action."],
        examples: [
          "I went to the bakery **for** some bread. (thing, no verb)",
          "This knife is **for cutting** bread. (general function)",
          "I used this knife **to cut** the bread just now. (one specific action — needs 'to')",
        ],
      },
      {
        heading: "In order to / so as to — more formal versions of 'to'",
        body: ["Both mean the same as 'to', but sound more formal — common in writing.", "Negative purpose: 'in order not to' / 'so as not to' — never just 'to not'."],
        examples: [
          "We arrived early **in order to** get good seats.",
          "She spoke slowly **so as to** be understood clearly.",
          "He left quietly **in order not to** wake anyone.",
        ],
      },
      {
        heading: "So that + subject + verb — when the subject changes, or you need a modal",
        body: ["'To' requires the SAME subject doing both actions. When the person benefiting is different, or you need a modal like can/could/would, use 'so that' + a full clause instead."],
        examples: [
          "I studied hard **to** pass the exam. (I studied, I pass — same subject)",
          "She whispered **so that** no one would hear her. (she whispered, but 'no one' is a different subject)",
          "I'm leaving early **so that** I can catch my flight.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I went to the store for buy milk. → ✅ I went to the store to buy milk. (never 'for' + verb — use 'to' + verb)",
      "❌ This knife is to cutting bread. → ✅ This knife is for cutting bread. (general function = 'for' + -ing)",
      "❌ I turned off my phone for not to be disturbed. → ✅ ...in order not to be disturbed. (negative purpose = 'in order not to')",
      "❌ He whispered to no one would hear him. → ✅ He whispered so that no one would hear him. ('so that' when the subject changes)",
      "❌ I'm calling for book a table. → ✅ I'm calling to book a table. ('to' + verb for a specific action)",
      "❌ This app is to tracking your expenses. → ✅ This app is for tracking your expenses. ('for' + -ing for a product's function)",
    ],
  },

  clauses_of_reason: {
    title: "Clauses of Reason",
    intro: "A clause of reason explains WHY something happened — the cause. English has several ways to say this, and they split cleanly into two grammatical groups: some are followed by a full clause (subject + verb), others by just a noun. Mixing the two up is the most common mistake at this level.",
    sections: [
      {
        heading: "Because + clause vs because of + noun",
        body: ["'Because' is followed by a full clause — its own subject and verb.", "'Because of' is followed by a noun or -ing form — never a full clause.", "This is the single most common mistake: using 'because of' before a clause, or 'because' before just a noun."],
        examples: [
          "We stayed home **because** it was raining. (clause)",
          "We stayed home **because of** the rain. (noun)",
          "The trip was cancelled **because of** the airline going on strike. (-ing form)",
        ],
      },
      {
        heading: "Due to / owing to — formal versions of 'because of'",
        body: ["Both mean the same as 'because of', but sound more formal — common in news reports and written announcements.", "Like 'because of', they're followed by a noun, not a full clause."],
        examples: [
          "The delay was **due to** a technical problem.",
          "The event was postponed **owing to** bad weather.",
        ],
      },
      {
        heading: "As / since — a reason your listener already knows",
        body: ["'As' and 'since' work like 'because', but they introduce a reason the listener probably already knows or expects — usually at the start of the sentence.", "Careful: 'since' also means 'from a point in time' — this is a different, unrelated meaning."],
        examples: [
          "**As** you're already here, let's start the meeting.",
          "**Since** you're new here, let me show you around. (reason, not time)",
          "I haven't seen her **since** Monday. (time, not reason)",
        ],
      },
      {
        heading: "Considering — and answering 'why?'",
        body: ["'Considering' + noun/clause means 'taking this into account'.", "Whatever the situation, always answer a direct 'why' question with 'because' — never 'since' or 'as'."],
        examples: [
          "**Considering** the weather, the event went really well.",
          "\"Why are you tired?\" \"**Because** I didn't sleep well.\" (not 'Since I didn't sleep well')",
        ],
      },
    ],
    commonMistakes: [
      "❌ I was late because of I missed the bus. → ✅ I was late because I missed the bus. ('because' + clause, not 'because of' + clause)",
      "❌ The match was cancelled because the rain. → ✅ ...because of the rain. ('because of' + noun, not 'because' + noun)",
      "❌ Due to the traffic was heavy, we were late. → ✅ Due to the heavy traffic, we were late. ('due to' needs a noun phrase, not a full clause)",
      "❌ \"Why were you late?\" \"Since I missed the bus.\" → ✅ ...\"Because I missed the bus.\" (always answer 'why' with 'because')",
      "❌ Considering of the weather... / As of he was tired... → ✅ Considering the weather... / As he was tired... ('considering' and 'as' stand alone, no 'of')",
    ],
  },

  clauses_of_contrast: {
    title: "Clauses of Contrast",
    intro: "A clause of contrast connects two surprising or opposite ideas — a fact and a result you might not expect from it. English has several ways to do this, and they split into two grammatical groups: some join two ideas inside ONE sentence, others start a brand new sentence. Mixing the two up is the most common mistake at this level.",
    sections: [
      {
        heading: "Although / even though / though — a full clause, inside one sentence",
        body: ["'Although' and 'even though' are followed by a full clause (subject + verb) and join it to the main sentence.", "'Even though' is a stronger version of 'although'.", "'Though' means the same thing and can even go at the very end of a sentence, informally."],
        examples: [
          "**Although** it was raining, we went for a walk.",
          "**Even though** he apologized, she was still upset.",
          "The house is old. It's very charming, **though**.",
        ],
      },
      {
        heading: "Despite / in spite of — a noun or gerund, never a clause",
        body: ["'Despite' and 'in spite of' mean the same as 'although', but they're followed by a noun or a gerund (-ing) — never a full clause directly.", "'In spite of' always needs 'of' right after it; 'despite' never takes 'of' at all.", "To use 'despite'/'in spite of' with a full clause, add the bridge phrase 'the fact that'."],
        examples: [
          "**Despite** the heavy traffic, we arrived on time. (not 'despite it was heavy traffic')",
          "**In spite of** losing the final, the team celebrated.",
          "**Despite the fact that** she was tired, she finished the project.",
        ],
      },
      {
        heading: "However / nevertheless / nonetheless — a brand new sentence",
        body: ["These all mean a similar thing to 'although', but they don't join a clause the way 'although'/'despite' do — they start a completely new sentence, usually followed by a comma.", "A comma alone before 'however' is not enough to join two clauses — that's a common mistake called a comma splice."],
        examples: [
          "The film was boring. **However**, the soundtrack was excellent.",
          "The traffic was terrible. **Nevertheless**, we made it on time.",
          "The odds were against her. **Nonetheless**, she won.",
        ],
      },
      {
        heading: "Yet — a coordinating contrast word, like 'but'",
        body: ["'Yet' can join two contrasting clauses in one sentence, working just like 'but' — with a comma before it, not a full stop."],
        examples: [
          "She's brilliant, **yet** she's incredibly humble.",
          "He looks intimidating, **yet** he's the gentlest person I know.",
        ],
      },
    ],
    commonMistakes: [
      "❌ Despite it was raining, we went out. → ✅ Despite the rain, we went out. ('despite' + noun/gerund, never a clause)",
      "❌ In spite the traffic, we arrived early. → ✅ In spite of the traffic, we arrived early. ('in spite of' — never 'in spite' alone)",
      "❌ Despite of his apology, she stayed angry. → ✅ Despite his apology, she stayed angry. ('despite' never takes 'of')",
      "❌ She passed the exam, however she didn't study much. → ✅ She passed the exam. However, she didn't study much. ('however' starts a new sentence, not a comma splice)",
      "❌ Although he was tired, but he kept working. → ✅ Although he was tired, he kept working. (never combine 'although' with 'but')",
      "❌ Despite the fact she was scared, she spoke up. → ✅ Despite the fact THAT she was scared... ('despite the fact that' needs 'that')",
    ],
  },

  gerunds: {
    title: "Gerunds",
    intro: "A gerund is the -ing form of a verb used as a noun. This lesson covers the situations where English always requires a gerund: as the subject of a sentence, and after a preposition — including fixed expressions where a small word ('to', 'for', 'of') that looks like part of an infinitive is actually a preposition in disguise.",
    sections: [
      {
        heading: "Gerund as the subject or complement of a sentence",
        body: ["A gerund (never the bare verb) can be the subject of a sentence.", "A gerund can also complete the verb 'be', describing what a hobby or activity is."],
        examples: [
          "**Learning** a new language takes time and patience. (not 'Learn a new language...')",
          "**Exercising** every day keeps you healthy.",
          "My favorite hobby is **painting**.",
        ],
      },
      {
        heading: "After any preposition — always a gerund, never a to-infinitive",
        body: ["This is the single biggest source of mistakes here: after words like 'without', 'for', 'instead of', 'by', 'after', 'before' — always use the -ing form, never 'to + verb'.", "Many languages use an infinitive after a preposition, which can pull learners toward the wrong English form here."],
        examples: [
          "She left **without saying** goodbye. (not 'without to say')",
          "Thank you **for helping** me. (not 'for to help')",
          "**By practicing** every day, she became fluent.",
          "**Instead of complaining**, try to find a solution.",
        ],
      },
      {
        heading: "'Look forward to' — 'to' here is a preposition, not part of an infinitive",
        body: ["It looks exactly like an infinitive marker, but in 'look forward to', 'to' is a preposition — so the verb after it must be a gerund."],
        examples: [
          "I'm **looking forward to seeing** you next week. (not 'to see')",
        ],
      },
      {
        heading: "Fixed expressions that always take a gerund",
        body: ["'It's no use', 'there's no point (in)', 'can't help', 'feel like', 'spend/waste time', and 'be busy' are always followed by a gerund — never a to-infinitive."],
        examples: [
          "**It's no use complaining** — nothing will change.",
          "**There's no point in worrying** about things you can't control.",
          "I **can't help laughing** every time I see that photo.",
          "Do you **feel like going** for a walk?",
        ],
      },
      {
        heading: "Negative gerund",
        body: ["Put 'not' directly before the gerund to make it negative."],
        examples: [
          "**Not smoking** indoors is the rule here.",
        ],
      },
    ],
    commonMistakes: [
      "❌ She left without to say goodbye. → ✅ She left without saying goodbye. (preposition + gerund, never infinitive)",
      "❌ I'm looking forward to see you. → ✅ I'm looking forward to seeing you. ('to' here is a preposition)",
      "❌ It's no use to complain. → ✅ It's no use complaining. (fixed expression + gerund)",
      "❌ I can't help to cry. → ✅ I can't help crying. ('can't help' + gerund)",
      "❌ Swim is my favorite way to relax. → ✅ Swimming is my favorite way to relax. (gerund, not the bare verb, as subject)",
      "❌ By study hard, she passed. → ✅ By studying hard, she passed. ('by' + gerund)",
    ],
  },

  present_perfect_continuous: {
    title: "Present Perfect Continuous",
    intro: "Present perfect continuous (have/has been + -ing) links a past action to now, just like present perfect simple — but it puts the focus on the ONGOING ACTIVITY and its duration, instead of on a finished result or a count. Choosing the wrong one is one of the most common mistakes at this level, especially with 'for' and 'since'.",
    sections: [
      {
        heading: "Continuous = duration/activity, simple = result/count",
        body: ["Present perfect continuous emphasizes HOW LONG something has been happening, or draws attention to the activity itself.", "Present perfect simple emphasizes the completed result, or counts how many times something happened."],
        examples: [
          "I**'ve been waiting** here for over an hour. (the activity, and how long)",
          "I**'ve finished** the report. (the result)",
          "She**'s written** three novels. (a count/total)",
        ],
      },
      {
        heading: "Stative verbs never take the continuous — even with 'for/since'",
        body: ["Verbs like know, believe, want, love, understand, and belong describe a state, not an action — they never take the -ing form, in any tense.", "This means a dynamic verb ('work', 'study', 'live') naturally pairs with the continuous for duration, while a stative verb ('know', 'want') stays in the simple form for the exact same 'for/since' structure."],
        examples: [
          "I**'ve known** her for ten years. (not 'have been knowing')",
          "He**'s been working** here since 2020. (dynamic verb — continuous is natural)",
          "I**'ve wanted** to visit Japan for years. (not 'have been wanting')",
        ],
      },
      {
        heading: "Visible present evidence of a recent activity",
        body: ["Use the continuous to explain a person's current state by pointing to something they were recently doing — even without mentioning an exact duration."],
        examples: [
          "You look exhausted — **have you been running**?",
          "My hands are covered in paint — I**'ve been painting** the fence.",
        ],
      },
      {
        heading: "'How long...?' + continuous vs 'How many times...?' + simple",
        body: ["'How long' naturally asks about an ongoing activity, so it pairs with the continuous (for a dynamic verb).", "'How many times' asks for a count, so it always pairs with the simple form."],
        examples: [
          "**How long have you been learning** English? (ongoing activity)",
          "**How many times have you visited** Paris? (a count)",
        ],
      },
    ],
    commonMistakes: [
      "❌ I have been knowing him for ten years. → ✅ I have known him for ten years. (stative verbs never take the continuous)",
      "❌ He works here since 2020. → ✅ He has been working here since 2020. (an action continuing from the past needs present perfect, not present simple)",
      "❌ How many books have you been reading this year? → ✅ How many books have you read this year? (a count needs the simple form)",
      "❌ I have been losing my keys. → ✅ I have lost my keys. (a single completed event needs the simple form, not the continuous)",
      "❌ She has been finishing her homework already. → ✅ She has finished her homework already. ('already' + a completed action = simple form)",
    ],
  },

  basic_word_order: {
    title: "Basic Word Order",
    intro: "English sentence order is stricter than many other languages. Many languages allow you to drop a subject or object pronoun when it's obvious from context, and allow the verb to come before the subject in certain statements. English allows almost none of that — the basic subject + verb + object order, with an explicit subject and object every time, is fixed.",
    sections: [
      {
        heading: "Subject + verb + object — and never drop the subject",
        body: ["English statements follow subject + verb + object order.", "English can never leave the subject out — even when there's no real 'thing' doing the action (weather, time, general statements), use the dummy subject 'it'."],
        examples: [
          "She reads a book every night. (subject + verb + object)",
          "**It's raining.** (not just 'Is raining')",
          "**It's important to study every day.** (not just 'Is important...')",
        ],
      },
      {
        heading: "Never drop the object pronoun either",
        body: ["Many languages let you leave out an object pronoun that's obvious from context. English can't — a transitive verb always needs its object stated, even in a short answer."],
        examples: [
          "\"Do you like coffee?\" \"Yes, I like **it**.\" (not just 'Yes, I like.')",
          "\"Have you seen my keys?\" \"No, I haven't seen **them**.\"",
        ],
      },
      {
        heading: "No verb-before-subject inversion in statements — use 'there is/are' for existence",
        body: ["Some languages put the verb before the subject to say something exists. English keeps subject-before-verb order in statements — inversion is reserved for questions only.", "To say something exists, use 'there is/are' instead of inverting the main verb."],
        examples: [
          "**There is** a solution to this problem. (not 'Exists a solution')",
          "**There are** many reasons for this. (not 'Exist many reasons')",
          "A solution **exists**. (subject before verb — this order is also fine)",
        ],
      },
      {
        heading: "Never separate the verb and its object with an adverb",
        body: ["Adverbs of frequency (always, often, never) go between the subject and the main verb — but after the verb 'be'.", "Other adverbs (manner, degree) go at the end of the sentence, after the object — never squeezed in between the verb and its object."],
        examples: [
          "She **often calls** her mother. / He **is always** on time.",
          "I like chocolate **very much**. (not 'I like very much chocolate')",
          "My father speaks three languages **fluently**. (not 'speaks fluently three languages')",
        ],
      },
    ],
    commonMistakes: [
      "❌ Is raining today. → ✅ It is raining today. (English always needs an explicit subject)",
      "❌ \"Do you like coffee?\" \"Yes, I like.\" → ✅ ...\"Yes, I like it.\" (never drop the object pronoun)",
      "❌ Exists a solution to this problem. → ✅ There is a solution to this problem. (no verb-subject inversion in statements — use 'there is/are')",
      "❌ I like very much chocolate. → ✅ I like chocolate very much. (never separate the verb and object with an adverb)",
      "❌ She arrives often late. → ✅ She often arrives late. (adverbs of frequency go before the main verb)",
    ],
  },

  prefixes_suffixes_adjectives: {
    title: "Prefixes & Suffixes (Adjectives)",
    intro: "A prefix is a group of letters added to the BEGINNING of a word to change its meaning; a suffix is a group of letters added to the END of a word to change its meaning or grammatical function. Together, they let you turn a plain verb or noun into a precise, professional-sounding adjective — and mixing up which one to use is the most common mistake.",
    sections: [
      {
        heading: "Negative prefixes: un-, dis-, in-",
        body: ["'Un-' and 'dis-' both mean 'not' or 'the opposite of' — which one a word takes has to be learned with the word itself.", "'In-' is the default 'not' prefix for most other adjectives that don't take 'un-' or 'dis-'."],
        examples: [
          "**un**fortunate, **un**equal, **un**usual",
          "**dis**loyal, **dis**similar, **dis**honest",
          "**in**convenient, **in**active, **in**expensive",
        ],
      },
      {
        heading: "in- changes shape: im-, ir-, il-",
        body: ["'In-' changes its spelling to match the sound that follows it.", "Use 'im-' before a word starting with 'm' or 'p'.", "Use 'ir-' before a word starting with 'r'.", "Use 'il-' before a word starting with 'l'.", "Use 'in-' before most other words."],
        examples: [
          "mature → **im**mature / polite → **im**polite",
          "rational → **ir**rational / regular → **ir**regular",
          "legal → **il**legal / logical → **il**logical",
          "convenient → **in**convenient / active → **in**active",
        ],
      },
      {
        heading: "Adjective-forming suffixes",
        body: ["'-able' → able to (adaptable, comfortable)", "'-al' → relating to (inspirational, national)", "'-ent' → being in a specified state (persistent, excellent)", "'-ful' → full of (careful, beautiful)", "'-ive' → having the nature of / performing toward an action (innovative, effective)", "'-less' → without (careless, endless)", "'-ous' → possessing or characterized by (dangerous, famous)"],
        examples: [
          "adapt → adapt**able** — 'capable of adapting'",
          "innovate → innovat**ive** — 'having the nature of innovation'",
          "care → care**ful** vs. care**less** — the same root, opposite meanings",
        ],
      },
      {
        heading: "Combining a prefix and a suffix on the same root",
        body: ["You can add a suffix to a noun or verb to form an adjective, then add a negative prefix to that adjective to flip its meaning."],
        examples: [
          "act → act**ive** → **in**active",
          "comfort → comfort**able** → **un**comfortable",
        ],
      },
      {
        heading: "Bonus prefixes: self-, over-, non-",
        body: ["'Self-' means 'oneself'.", "'Over-' (or 'overly' as an adverb) means 'too much'.", "'Non-' also means 'not', often written with a hyphen."],
        examples: [
          "She's very **self**-aware.",
          "He can be **overly** critical of his own work.",
          "The offer is **non**-negotiable.",
        ],
      },
    ],
    commonMistakes: [
      "❌ She's very inmature for her age. → ✅ She's very immature for her age. ('im-' before 'm')",
      "❌ That's totally inlegal. → ✅ That's totally illegal. ('il-' before 'l')",
      "❌ His argument was inrational. → ✅ His argument was irrational. ('ir-' before 'r')",
      "❌ He gave a very inspirationful speech. → ✅ He gave a very inspirational speech. ('-al', not '-ful')",
      "❌ She gave a very innovateful presentation. → ✅ She gave a very innovative presentation. ('-ive', not '-ful')",
      "❌ He's extremely persistful about this project. → ✅ He's extremely persistent about this project. ('-ent', not '-ful')",
    ],
  },

  greetings_introductions: {
    title: "Greetings & Introductions",
    intro: "The first phrases you need for any conversation: saying hello, asking how someone is, and giving basic personal information.",
    sections: [
      {
        heading: "Saying hello and asking how someone is",
        body: [
          "Use 'Good morning/afternoon/evening' depending on the time of day.",
          "'How are you?' is answered with 'I'm fine, thank you' — don't forget the comma before 'thank you'.",
          "In everyday conversation people also answer with 'I'm good', 'Not bad', 'Pretty good', or 'So-so' (meaning average — neither good nor bad).",
        ],
        examples: [
          "**Good morning**! How are you?",
          "I'm **fine, thank you**. And you?",
          "I'm **good**, thanks! / **Not bad**, thanks! / **So-so** — a bit tired today.",
          "**Nice to meet you**! (not 'Nice meet you')",
        ],
      },
      {
        heading: "Basic personal information",
        body: ["'What's your name?' / 'My name is...'", "'Where are you from?' / 'I'm from + country' — keep subject-verb order in the question.", "Age uses 'be', not 'have': **I am** ___ years old."],
        examples: [
          "**What's your name?** My name is Ana.",
          "**Where are you from?** I'm from Spain. (not 'Where you are from?')",
          "**How old are you?** I am fourteen years old.",
        ],
      },
      {
        heading: "Saying goodbye",
        body: ["'Goodbye' or 'Bye' for leaving; 'See you later' for a casual, temporary goodbye.", "'Take care!' is another casual, friendly way to say goodbye."],
        examples: [
          "**Goodbye**! Have a nice day.",
          "**See you later**!",
          "**Bye! Take care!**",
        ],
      },
    ],
    commonMistakes: [
      "❌ I have twenty years old. → ✅ I am twenty years old. (age uses 'be', not 'have')",
      "❌ Nice meet you! → ✅ Nice to meet you! (don't forget 'to')",
      "❌ Where you are from? → ✅ Where are you from? (question word order: are + you)",
      "❌ I am fine, thank. → ✅ I'm fine, thank you. (don't drop 'you')",
    ],
  },

  introducing_others: {
    title: "Introducing Other People",
    intro: "Introducing someone else uses a possessive adjective (his/her/their) before their name or noun — a different pattern from talking about yourself.",
    sections: [
      {
        heading: "This is... / possessive adjectives",
        body: ["'This is [name]' introduces one person; 'These are' introduces more than one.", "Use **his/her/their** + noun, not the subject pronoun he/she/they, before a noun."],
        examples: [
          "**This is** Marco. **His** name is Marco.",
          "**These are** my classmates. **Their** names are Ana and Leo.",
          "This is my sister. **Her** name is Clara. (not 'She name is Clara')",
        ],
      },
      {
        heading: "More natural ways to introduce people",
        body: ["'I'd like you to meet...' and 'Let me introduce you to...' are more polite/formal ways to introduce someone.", "'Have you met...?' checks if two people already know each other."],
        examples: [
          "**I'd like you to meet** my colleague, Sofia.",
          "**Let me introduce you to** a friend of mine.",
          "**Have you met** my brother?",
        ],
      },
      {
        heading: "Two ways to say 'this is'",
        body: [
          "When you're just presenting one person to your listener, start straight with 'This is...' / 'These are...'.",
          "When you're introducing two people to each other for the first time, name your listener first, then say 'this is'/'these are' — this makes clear who is meeting whom.",
        ],
        examples: [
          "**This is** my colleague, David. (presenting David to whoever you're talking to)",
          "**Sarah, this is** my colleague, David. (introducing Sarah and David to each other)",
          "**Tom, these are** my cousins, Mia and Sam.",
        ],
      },
    ],
    commonMistakes: [
      "❌ He name is Marco. → ✅ His name is Marco. (possessive adjective before a noun, not subject pronoun)",
      "❌ His name are Marco and Leo. → ✅ Their names are Marco and Leo. (plural subject needs 'their'/'are')",
      "❌ This is my friends. → ✅ These are my friends. (plural people need 'these are')",
      "❌ She is a friend of me. → ✅ She is a friend of mine. ('a friend of' + possessive pronoun)",
      "❌ This is Sarah, my colleague, David. → ✅ Sarah, this is my colleague, David. (name the listener first, before 'this is')",
    ],
  },

  likes_dislikes: {
    title: "Likes & Dislikes",
    intro: "'Like', 'love', and 'hate' can be followed by either the -ing form or 'to' + verb, with little difference in meaning — but 'enjoy' only ever takes the -ing form.",
    sections: [
      {
        heading: "Like/love/hate + gerund or infinitive; enjoy + gerund only",
        body: ["'Like', 'love', and 'hate' can take either verb-**ing** or **to** + verb — both are correct.", "'Enjoy' is the exception: always verb-**ing**, never 'to' + verb.", "Third person singular needs -s: likes, loves, hates, enjoys.", "Never combine 'to' and '-ing' together on the same verb."],
        examples: [
          "I **love playing** video games. / I **love to play** video games. (both correct — not 'love to playing')",
          "She **enjoys swimming** in her free time. (not 'enjoys to swim')",
          "He **hates waiting** in long queues. / He **hates to wait** in long queues. (both correct)",
        ],
      },
      {
        heading: "Questions with do/does",
        body: ["Use do/does + subject + base verb for questions about likes."],
        examples: [
          "**Do you like** pizza?",
          "**Does she like** cooking?",
        ],
      },
      {
        heading: "More natural expressions",
        body: ["'can't stand' + gerund = hate strongly.", "'not keen on' + noun/gerund = don't like.", "'be into' + gerund = like a lot (informal); 'not really into' negates it.", "'prefer X to Y' (not 'than').", "'be a big fan of' (not 'for')."],
        examples: [
          "I **can't stand waiting** in traffic.",
          "She's **not keen on** spicy food.",
          "He's really **into playing** the guitar.",
          "He's **not really into** cooking.",
          "I **prefer tea to** coffee. (not 'prefer tea than coffee')",
          "I'm **a big fan of** this band. (not 'a big fan for')",
        ],
      },
    ],
    commonMistakes: [
      "❌ I like to swimming. → ✅ I like swimming. / I like to swim. (don't combine 'to' and '-ing' together — pick one)",
      "❌ I enjoy to swim. → ✅ I enjoy swimming. ('enjoy' only takes '-ing', never 'to' + verb)",
      "❌ She like cooking. → ✅ She likes cooking. (third person singular needs -s)",
      "❌ I prefer tea than coffee. → ✅ I prefer tea to coffee. ('prefer X to Y', not 'than')",
      "❌ I'm a big fan for this band. → ✅ I'm a big fan of this band.",
    ],
  },

  what_do_you_do: {
    title: "What Do You Do? (Jobs)",
    intro: "Talking about jobs means getting three things right: the article before the job noun, third-person 'does', and the preposition after 'work'.",
    sections: [
      {
        heading: "What do you do? / I'm a...",
        body: ["'What do you do?' asks about someone's job.", "Always use **a/an** before a job noun — choose based on the sound, not the spelling."],
        examples: [
          "**What do you do?** I'm **a** teacher. / I'm **an** engineer.",
          "She's **an** actor. He's **a** dentist.",
        ],
      },
      {
        heading: "Third person and questions",
        body: ["'What does he/she do?' — only one 'does' is needed in the question, don't repeat it in the answer."],
        examples: [
          "**What does she do?** She's a nurse. (not 'What does she does')",
          "**Where does he work?** He works **in** a hospital. (not 'on a hospital')",
        ],
      },
      {
        heading: "Talking about wanting a job",
        body: ["After 'want to', use the base verb 'be', not 'being'."],
        examples: [
          "I **want to be** a pilot. (not 'want to being')",
          "She **works as a** vet.",
        ],
      },
      {
        heading: "Common job titles",
        body: [
          "A wide range of everyday jobs: teacher, doctor, nurse, dentist, waiter, chef, cook, lawyer, pilot, manager, firefighter, farmer, and police officer.",
          "A few common jobs start with a vowel sound and take 'an' instead of 'a': engineer, actor, artist, electrician.",
        ],
        examples: [
          "I'm **a** nurse. My sister is **a** lawyer. My uncle is **a** farmer.",
          "He's **an** engineer. She's **an** artist. My cousin is **an** electrician.",
        ],
      },
    ],
    commonMistakes: [
      "❌ He is doctor. → ✅ He is a doctor. (don't forget the article before a job)",
      "❌ She works on a hospital. → ✅ She works in a hospital. ('in' for buildings, not 'on')",
      "❌ What does she does? → ✅ What does she do? (only one 'does' is needed)",
      "❌ They is farmers. → ✅ They are farmers. (plural subject needs 'are')",
    ],
  },

  hobbies: {
    title: "Hobbies & Free Time",
    intro: "Talking about hobbies relies on two patterns: 'go' + gerund for outdoor/sport activities, and verbs like 'love/enjoy/be interested in' followed by a gerund.",
    sections: [
      {
        heading: "Go + gerund",
        body: ["For outdoor and sport activities, use **go** + verb-**ing**, with no 'to' in between."],
        examples: [
          "I **go hiking** every weekend. (not 'go to hike')",
          "She **goes swimming** at the pool. (not 'go to swim')",
          "They **go fishing** on Saturdays.",
        ],
      },
      {
        heading: "Love/enjoy/be interested in + gerund",
        body: ["'Be interested in' + noun or gerund — never 'interested to'.", "'Spend time' + gerund; 'take up' + gerund (start a new hobby)."],
        examples: [
          "He **is interested in** photography.",
          "She **spends** her weekends **painting**.",
          "He **took up learning** the violin last year.",
        ],
      },
      {
        heading: "Play, do, or go?",
        body: [
          "**Play** + sports, games, and musical instruments (add 'the' before instruments).",
          "**Do** + individual activities, exercise, and martial arts.",
          "**Go** + outdoor or movement activities ending in -ing.",
        ],
        examples: [
          "She **plays tennis**. He **plays chess**. I **play the guitar**.",
          "We **do yoga**. He **does karate**.",
          "They **go swimming**. She **goes cycling**.",
        ],
      },
      {
        heading: "More natural expressions",
        body: ["'be really into' + gerund = love a hobby (informal).", "'in my spare/free time' introduces a hobby sentence."],
        examples: [
          "I'm **really into** rock climbing.",
          "**In my spare time**, I like practising yoga.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I go to hike every weekend. → ✅ I go hiking every weekend. ('go' + gerund, no 'to')",
      "❌ His hobby are collecting stamps. → ✅ His hobby is collecting stamps. ('hobby' is singular)",
      "❌ I interested in learning languages. → ✅ I am interested in learning languages. (don't forget 'am')",
      "❌ What is your hobbies? → ✅ What are your hobbies? ('hobbies' is plural)",
      "❌ She does tennis every weekend. → ✅ She plays tennis every weekend. (sports/games use 'play', not 'do')",
      "❌ He plays karate on Tuesdays. → ✅ He does karate on Tuesdays. (martial arts use 'do', not 'play')",
      "❌ They do cycling at the weekend. → ✅ They go cycling at the weekend. (outdoor -ing activities use 'go')",
    ],
  },

  personality: {
    title: "Personality Adjectives",
    intro: "Describing personality uses 'What is [someone] like?' — a completely different question from 'What does [someone] like?', which asks about preferences.",
    sections: [
      {
        heading: "What is ... like?",
        body: ["'What is she/he like?' asks about personality; 'What does she/he like?' asks about preferences — don't confuse them."],
        examples: [
          "**What is she like?** She's very friendly. (not 'What does she like?')",
          "**What are they like?** They're outgoing and kind.",
        ],
      },
      {
        heading: "A wide range of personality adjectives",
        body: [
          "Positive: kind, generous, friendly, funny, honest, patient, hardworking, ambitious, creative, confident, cheerful, caring, outgoing, calm, polite, brave, reliable, fair.",
          "Negative: lazy, impatient, stubborn, selfish, boring, rude, moody.",
          "Neutral — can be positive or negative depending on the situation: shy, quiet, serious, talkative, strict, curious, flexible, easy-going.",
        ],
        examples: [
          "He's always **polite** to strangers.",
          "It's **rude** to interrupt someone.",
          "She was **brave** enough to speak in front of the whole class.",
          "You can always count on him — he's very **reliable**.",
          "She's a bit **moody** in the mornings.",
          "Our new teacher is quite **strict**, but she's fair.",
          "My little brother is endlessly **curious** about everything.",
          "He's very **easy-going** — nothing ever bothers him.",
          "She's **flexible** about changing plans at the last minute.",
        ],
      },
      {
        heading: "Adjective, not adverb or noun",
        body: ["After 'be', use the plain adjective — not the '-ly' adverb form or the noun form."],
        examples: [
          "He is very **kind**. (not 'kindly')",
          "She is **confident**. (not 'confidence')",
          "They are very **creative people**. (not 'creative persons')",
        ],
      },
      {
        heading: "Comparing personalities",
        body: ["Short adjectives take -er + than; don't add 'more' as well."],
        examples: [
          "She is **shyer than** her brother. (not 'more shyer')",
          "He is **more patient than** his brother.",
        ],
      },
    ],
    commonMistakes: [
      "❌ What does she like? She is friendly. → ✅ What is she like? She is friendly.",
      "❌ He is a very kindly person. → ✅ He is a very kind person. ('kind' is the adjective)",
      "❌ She is more shyer than her brother. → ✅ She is shyer than her brother. (don't double the comparative)",
      "❌ They are very creative persons. → ✅ They are very creative people. (irregular plural)",
    ],
  },

  feelings: {
    title: "Feelings (Basic)",
    intro: "Talk about how you feel using 'be' or 'feel' plus a simple adjective — and remember the third-person -s for 'she/he feels'.",
    sections: [
      {
        heading: "Be / feel + adjective",
        body: ["Use **am/is/are** or **feel/feels** followed by an adjective to say how someone feels.", "Third person singular (he/she/it) needs an -s: 'feels'."],
        examples: [
          "I **am** happy today.",
          "She **feels** tired after school.",
          "They **are** excited about the trip.",
        ],
      },
      {
        heading: "How do you feel?",
        body: ["Ask about feelings with 'How do you feel?' or 'How are you?'", "'Look' + adjective describes how someone appears."],
        examples: [
          "**How do you feel?** I feel hungry.",
          "You **look** tired — are you okay?",
        ],
      },
      {
        heading: "Common A1 feelings",
        body: ["happy, sad, angry, tired, hungry, thirsty, excited, scared, bored, sick, hot, cold, worried, nervous — the most common feelings words."],
        examples: [
          "I am **hungry**. I want to eat.",
          "He is **thirsty**. He wants some water.",
          "She is **nervous** before the test.",
        ],
      },
      {
        heading: "Feeling + preposition",
        body: [
          "Many feelings need a fixed preposition before the cause — the wrong one is a very common mistake.",
          "afraid of / scared of + noun. interested in + noun. worried about / excited about + noun. proud of + noun. angry with + person. tired of + noun/gerund.",
        ],
        examples: [
          "He is **afraid of** spiders.",
          "They are **interested in** video games.",
          "She is **worried about** the exam.",
          "He is **proud of** his team.",
          "She is **angry with** her brother. (not 'angry of')",
          "I am **tired of** studying. (not 'tired to study')",
        ],
      },
      {
        heading: "More feeling + preposition pairs",
        body: [
          "The same fixed-preposition rule applies to many more feelings — learn each pair together, not the feeling word alone.",
          "nervous about, confused about, upset about, curious about, embarrassed about, concerned about + noun. bored of, sick of, ashamed of, jealous of, terrified of, fed up with + noun. surprised at + noun. pleased with, satisfied with, disappointed with, delighted with, content with + noun. keen on + noun/gerund.",
        ],
        examples: [
          "She is **nervous about** the interview.",
          "He is **confused about** the instructions.",
          "They are **bored of** the movie.",
          "We are **surprised at** the result.",
          "He is **pleased with** his grades.",
          "I am **ashamed of** my mistake. She is **jealous of** her sister.",
          "He is **fed up with** his job. She is **keen on** cooking.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I are happy. → ✅ I am happy. ('I' takes 'am')",
      "❌ She feel tired. → ✅ She feels tired. (third person singular needs -s)",
      "❌ They is excited. → ✅ They are excited. ('they' takes 'are')",
      "❌ I am hungry, I want drink water. → ✅ I am hungry. I want to drink water. (don't forget 'to' before the verb)",
      "❌ He is afraid from spiders. → ✅ He is afraid of spiders. ('afraid of', not 'afraid from')",
      "❌ She is angry of her brother. → ✅ She is angry with her brother. ('angry with' a person)",
      "❌ They are interested of video games. → ✅ They are interested in video games. ('interested in', not 'interested of')",
      "❌ We are surprised of the result. → ✅ We are surprised at the result. ('surprised at', not 'surprised of')",
      "❌ He is pleased of his grades. → ✅ He is pleased with his grades. ('pleased with', not 'pleased of')",
    ],
  },

  appearance: {
    title: "What Do You Look Like?",
    intro: "Describing appearance splits between 'be' (for height, build, age) and 'have/has' (for hair, eyes, and other features) — mixing them up is the most common mistake.",
    sections: [
      {
        heading: "Be vs have/has",
        body: ["Use **be** for height, build, and age.", "Use **have/has** for hair, eyes, and other features — never add 'is' before 'has'."],
        examples: [
          "She **is** tall and slim.",
          "He **has** blue eyes and short hair. (not 'is have blue eyes')",
          "He **is** 30 years old. (not 'has 30 years')",
        ],
      },
      {
        heading: "What does he/she look like?",
        body: ["'What does he/she look like?' asks about appearance; answer with 'is' or 'has' depending on the feature."],
        examples: [
          "**What does she look like?** She's tall and has curly hair.",
          "**What do they look like?** They have dark hair.",
        ],
      },
      {
        heading: "More appearance vocabulary",
        body: ["'looks like' + noun (not 'looks as'); 'in his/her twenties' for approximate age; 'resembles' is a more formal way to say 'looks like'."],
        examples: [
          "She **looks like** her mother. (not 'looks like as')",
          "He's **in his late twenties**.",
          "My cousin **resembles** his father.",
        ],
      },
      {
        heading: "What someone is wearing",
        body: ["For glasses and other accessories that can be on or off, use 'be' + wearing — not 'have' or 'be' + adjective."],
        examples: [
          "He **is wearing glasses**. (not 'he has wearing glasses')",
          "Is she **wearing** a hat today?",
        ],
      },
    ],
    commonMistakes: [
      "❌ He have blue eyes. → ✅ He has blue eyes. (third person: 'has')",
      "❌ She is have green eyes. → ✅ She has green eyes. ('has' stands alone)",
      "❌ She has 25 years old. → ✅ She is 25 years old. (age uses 'be', not 'have')",
      "❌ My grandfather has tall and thin. → ✅ My grandfather is tall and thin. (height/build use 'be')",
    ],
  },

  clothes: {
    title: "I Am Wearing... (Clothes)",
    intro: "Talking about clothes uses different tenses depending on when — present continuous for right now, present simple for habits, past simple for something already finished — and several clothing words are always plural, with no article before them.",
    sections: [
      {
        heading: "Present continuous for what you're wearing now",
        body: ["'What are you wearing?' uses present continuous — don't forget 'is/are' before 'wearing'."],
        examples: [
          "**What are you wearing?** I'm wearing jeans.",
          "She **is wearing** a red dress. (not 'She wear' or 'She wearing')",
        ],
      },
      {
        heading: "Present simple, continuous, or past?",
        body: [
          "Use present simple for a habit or routine — what someone usually wears.",
          "Use present continuous for right now, in this moment.",
          "Use past simple for a specific occasion that's already finished.",
        ],
        examples: [
          "He **wears** a suit to the office every day. (habit — present simple)",
          "He **is wearing** a suit right now, in this photo. (happening now — present continuous)",
          "He **wore** a suit to the interview yesterday. (finished, in the past — past simple)",
        ],
      },
      {
        heading: "Always-plural clothing words",
        body: ["jeans, trousers, shorts, glasses, gloves, socks, boots, pyjamas are always plural — never use 'a' before them."],
        examples: [
          "He is wearing **jeans**. (not 'a jeans')",
          "She isn't wearing **gloves**. (not 'a gloves')",
        ],
      },
      {
        heading: "Adjective order and articles",
        body: ["Colour/size adjectives go before the noun; choose a/an by sound."],
        examples: [
          "She is wearing a **long green** dress.",
          "I bought **an** elegant evening gown. (vowel sound)",
        ],
      },
    ],
    commonMistakes: [
      "❌ I wear a blue T-shirt right now. → ✅ I am wearing a blue T-shirt right now. ('right now' needs present continuous)",
      "❌ I am wearing a jeans. → ✅ I am wearing jeans. ('jeans' is always plural)",
      "❌ She is wear a coat. → ✅ She is wearing a coat. (don't forget 'is')",
      "❌ We are wearing shorts blue today. → ✅ We are wearing blue shorts today. (adjective before noun)",
      "❌ Every day she is wearing a uniform. → ✅ Every day she wears a uniform. (a habit needs present simple, not continuous)",
      "❌ She wear a black dress at the party last night. → ✅ She wore a black dress at the party last night. (a finished past event needs past simple)",
    ],
  },

  family_members: {
    title: "Family Members",
    intro: "Family vocabulary is mostly about matching the right word to the right relationship, plus keeping subject-verb agreement correct for singular vs plural family members.",
    sections: [
      {
        heading: "Family relationship words",
        body: ["aunt/uncle (parent's sibling), cousin (aunt/uncle's child), niece/nephew (sibling's daughter/son), grandparents (parents' parents)."],
        examples: [
          "My mother's sister is my **aunt**.",
          "My brother's son is my **nephew**.",
          "My aunt's children are my **cousins**.",
        ],
      },
      {
        heading: "Have/has and is/are agreement",
        body: ["Singular family members (my brother, my aunt) take is/has; plural (my parents, my cousins) take are/have."],
        examples: [
          "My parents **have** two cars. My brother **has** a car. (not 'My parents has')",
          "My cousins **are** funny. My sister **is** ten. (not 'My cousins is')",
        ],
      },
      {
        heading: "More family vocabulary",
        body: [
          "'only child' (no siblings), 'sibling' (brother or sister), 'stepmother/stepfather', 'in-laws', 'take after' (resemble a relative).",
          "'grandson/granddaughter' (a child's son/daughter). Marriage relatives use '-in-law': 'sister-in-law', 'brother-in-law', 'mother-in-law', 'father-in-law', 'parents-in-law' — all plural family words (in-laws, parents-in-law) still take 'are'/'have'.",
        ],
        examples: [
          "She is **an only child**.",
          "I **take after** my mother — we both love cooking.",
          "My brother's wife is my **sister-in-law**.",
          "My **in-laws are** very welcoming. (not 'is')",
        ],
      },
    ],
    commonMistakes: [
      "❌ My parents has two cars. → ✅ My parents have two cars. ('parents' is plural)",
      "❌ My brother are tall. → ✅ My brother is tall. (singular subject needs 'is')",
      "❌ I am an only children. → ✅ I am an only child. ('child' is singular after 'an only')",
      "❌ My niece and nephew is twins. → ✅ My niece and nephew are twins. (compound subject is plural)",
      "❌ My in-laws is very kind. → ✅ My in-laws are very kind. ('in-laws' is always plural)",
    ],
  },

  weather_temperature_seasons: {
    title: "Weather, Temperature & Seasons",
    intro: "Weather sentences use 'it is' + a weather adjective (sunny, rainy, cold) — not the noun form of the word.",
    sections: [
      {
        heading: "It is + weather adjective",
        body: ["Weather descriptions use **it is** + adjective (sunny, rainy, cloudy, windy, cold, hot, freezing) — not the plain noun."],
        examples: [
          "**It is sunny** today. (not 'It is sun')",
          "**It is cloudy**. (not 'It is cloud')",
          "**It is raining** / **It is rainy**. (not 'It is rain')",
        ],
      },
      {
        heading: "The four seasons",
        body: ["spring, summer, autumn, winter — summer is usually hot, winter is usually cold."],
        examples: [
          "The four seasons are spring, summer, **autumn**, and **winter**.",
          "**In winter**, it is often cold.",
        ],
      },
      {
        heading: "Comparing weather",
        body: ["Short adjectives (hot, cold) form comparatives with -er."],
        examples: [
          "Today is **hotter** than yesterday.",
          "It usually **rains** a lot in April.",
        ],
      },
      {
        heading: "Choosing how to describe the weather",
        body: [
          "Static description right now (it/the weather/the sky + adjective): 'be' + adjective — sunny, cloudy, windy, cold.",
          "An action happening right now: 'be' + verb-ing — raining, snowing, changing.",
          "A general truth or habit about a place or season: present simple, not continuous — rains, snows, gets, wear.",
        ],
        examples: [
          "**It is sunny** today. (description right now)",
          "**It is raining** outside. (action happening right now)",
          "**It rains** a lot in winter. (general truth about the season)",
        ],
      },
    ],
    commonMistakes: [
      "❌ Today is very heat. → ✅ Today is very hot. (use the adjective 'hot', not the noun 'heat')",
      "❌ It is rain today. → ✅ It is rainy today. / It is raining today.",
      "❌ The weather is sun. → ✅ The weather is sunny.",
      "❌ It is cloud today. → ✅ It is cloudy today.",
      "❌ It is raining a lot in winter. → ✅ It rains a lot in winter. (a general truth about the season needs present simple, not continuous)",
    ],
  },

  daily_routines_frequency: {
    title: "Daily Routines, Times & Frequency",
    intro: "Talking about routines combines present simple (with correct third-person -s) with adverbs of frequency (always, usually, never) and the right time prepositions (at/in/on).",
    sections: [
      {
        heading: "Adverb of frequency position",
        body: ["With ordinary verbs, the frequency adverb goes **before** the main verb.", "With 'be', the frequency adverb goes **after** it."],
        examples: [
          "I **always brush** my teeth in the morning. (not 'brush always')",
          "I **am never** late. (not 'I never am late')",
          "She **is usually** tired after work.",
        ],
      },
      {
        heading: "The frequency scale, and asking 'how often'",
        body: [
          "From 100% of the time to 0% of the time, in order: **always** → **usually** → **often** → **sometimes** → **rarely** → **never**.",
          "To ask about frequency, use **'How often...?'** + do/does + subject + base verb.",
        ],
        examples: [
          "I **always** eat breakfast, but I **rarely** eat a big lunch.",
          "She **usually** walks to work, and she **sometimes** takes the bus.",
          "**How often** do you exercise? I exercise **often** — about four times a week.",
        ],
      },
      {
        heading: "Present simple third person",
        body: ["He/she/it takes the -s form of the verb: goes, has, wakes, gets."],
        examples: [
          "He **goes** to work at 8. (not 'go')",
          "She **has** breakfast at 7.",
          "She **wakes** up at seven every morning.",
        ],
      },
      {
        heading: "Common daily routine verbs",
        body: [
          "Everyday routine actions, roughly in order: wake up, get up, get dressed, brush your teeth, take a shower, have breakfast/lunch/dinner, go to school, go to work, go home, go to bed.",
        ],
        examples: [
          "I **wake up**, **get dressed**, and **have breakfast** before I **go to school**.",
          "He **takes a shower** in the morning and **goes to work** at 8.",
          "She **goes home** at 5 and **goes to bed** at 11.",
        ],
      },
      {
        heading: "Time prepositions: at/in/on",
        body: ["'at' + a specific time or 'night' (at night, at 7 o'clock); 'in' + a part of the day (in the morning/afternoon/evening)."],
        examples: [
          "I go to bed **at** night.",
          "We study **in** the afternoon.",
        ],
      },
    ],
    commonMistakes: [
      "❌ I go always to bed at 11. → ✅ I always go to bed at 11. (adverb before the main verb)",
      "❌ I never am late. → ✅ I am never late. (with 'be', the adverb goes after it)",
      "❌ He wake up at 6 o'clock. → ✅ He wakes up at 6 o'clock. (third person needs -s)",
      "❌ She go home at 5. → ✅ She goes home at 5. ('she' needs -s — this is the mistake students make far more than the reverse)",
    ],
  },

  giving_directions: {
    title: "Giving Directions",
    intro: "Giving directions relies on a set of fixed phrases and prepositions — 'turn left', 'on your right', 'at the traffic lights' — that don't translate word-for-word from other languages.",
    sections: [
      {
        heading: "Basic direction verbs",
        body: ["turn left/right, go straight ahead, cross the road, go past, walk along, follow this road, keep going + verb-ing.", "You can chain two steps together with 'then': give the first instruction, then the second."],
        examples: [
          "**Turn left** at the traffic lights. (not 'turn on the left')",
          "**Go straight ahead** until you see the bank. (not 'go direct')",
          "**Cross the road** at the crossing. (not 'pass the road')",
          "**Walk along** this street until you reach the square.",
          "**Keep going** until you reach the lights.",
          "**Go straight ahead, then turn left** for the station. (two steps, joined with 'then')",
        ],
      },
      {
        heading: "Take the first/second street, and roundabouts",
        body: ["Ordinal number + 'street' names a specific turn: 'the first street', 'the second street'.", "For a roundabout, use 'go round' + 'take the first/second/third exit'."],
        examples: [
          "**Take the second street** on your left.",
          "**Go round** the roundabout and **take the third exit**.",
        ],
      },
      {
        heading: "Fixed prepositions and location phrases",
        body: ["'on your left/right' (not 'in'); 'at the traffic lights/end of the road' (not 'in'); 'on the corner' (not 'in'); 'opposite' = directly across from; 'just around the corner' = very close."],
        examples: [
          "The bank is **on your left**. (not 'in your left')",
          "The hotel is **at the end of** the road. (not 'on the end of')",
          "The museum is **on the corner**. (not 'in the corner')",
          "The park is **opposite** the supermarket.",
          "The bus stop is **just around the corner**.",
        ],
      },
      {
        heading: "Asking about directions and distance",
        body: ["'How do I get to...?' is the standard way to ask for directions.", "'Is it far from here?' asks about distance; 'a five-minute walk' answers it; 'you can't miss it' reassures someone it's easy to find."],
        examples: [
          "Excuse me, **how do I get to** the station? (not 'how do I go to')",
          "**Is it far** from here? (not 'is it long')",
          "It's about **a five-minute walk** from here.",
          "**You can't miss it**! (not 'you can't miss that')",
        ],
      },
      {
        heading: "Turning an instruction into a negative or a question",
        body: [
          "Negative imperative: Don't + base verb.",
          "Present simple question (to confirm a direction): Do + subject + base verb?",
        ],
        examples: [
          "**Don't cross** the road here.",
          "**Do I turn** left at the lights?",
        ],
      },
      {
        heading: "Turning a description into an instruction",
        body: [
          "Someone else's description of where a place is tells you which instruction to give: 'on your left/right' → turn left/right; 'straight down this road' or 'still on this road' → go straight ahead.",
          "Chain two steps together with 'then' when the description needs both.",
        ],
        examples: [
          "'The café is on your left, right here.' → **Turn left** for the café.",
          "'The church is straight down this road, no turning.' → **Go straight ahead** to the church.",
          "'The pool is straight ahead first, then on your right after the roundabout.' → **Go straight ahead, then turn right** after the roundabout.",
        ],
      },
      {
        heading: "Correcting the wrong direction",
        body: ["Rule out the wrong side or turn first with 'It isn't on your...' or 'It isn't around the corner', then give the correct instruction."],
        examples: [
          "**It isn't on your right** — turn left for the café.",
          "**It isn't around the corner** — go straight ahead to the church.",
        ],
      },
    ],
    commonMistakes: [
      "❌ Turn on the left at the lights. → ✅ Turn left at the lights. (no 'on' before left/right)",
      "❌ How do I go to the station? → ✅ How do I get to the station? (fixed phrase: 'get to')",
      "❌ The bank is in your left. → ✅ The bank is on your left.",
      "❌ Is it long from here? → ✅ Is it far from here? (distance uses 'far', not 'long')",
    ],
  },

  inversion: {
    title: "Inversion",
    intro: "Inversion moves the auxiliary verb before the subject for dramatic or formal emphasis — triggered by fronting a negative or limiting adverbial like 'never', 'rarely', or 'not until'.",
    sections: [
      {
        heading: "Negative adverbials + auxiliary + subject",
        body: ["After never, rarely, hardly, seldom, little, not only, at no point, under no circumstances — invert to auxiliary + subject.", "Match the auxiliary to the tense: have/has for present perfect, did for past simple, do/does for present simple."],
        examples: [
          "**Never have I** seen such a beautiful view.",
          "**Rarely does she** go to bed before midnight.",
          "**Not only did she** win the award, but she also gave a speech.",
        ],
      },
      {
        heading: "Hardly/no sooner + past perfect",
        body: ["'Hardly had' pairs with **when**; 'no sooner had' pairs with **than** — don't mix them up."],
        examples: [
          "**Hardly had I** sat down **when** the alarm went off.",
          "**No sooner had** we left the house **than** it started to rain.",
        ],
      },
      {
        heading: "So/such + be + that",
        body: ["'So + adjective + was/were + subject + that' and 'Such + was/were + noun + that' front the description or noun for dramatic emphasis."],
        examples: [
          "**So tired was he** that he fell asleep at his desk.",
          "**Such was the panic** that people ran for the exits.",
        ],
      },
    ],
    commonMistakes: [
      "❌ Never I have seen such a view. → ✅ Never have I seen such a view. (invert auxiliary and subject)",
      "❌ Hardly had we arrived than the storm began. → ✅ ...when the storm began. ('hardly had' pairs with 'when', not 'than')",
      "❌ Little did he knew about the dangers. → ✅ Little did he know... (base verb after 'did', not past tense)",
      "❌ So proud was them that... → ✅ So proud were they that... (subject pronoun 'they', plural 'were')",
    ],
  },

  mixed_conditionals: {
    title: "Mixed Conditionals",
    intro: "Mixed conditionals combine a condition from one time with a result from another — usually a past cause with a present result, or a present state with a past result.",
    sections: [
      {
        heading: "Past cause, present result",
        body: ["If + past perfect, + would + base verb — a past action or decision explains a present state."],
        examples: [
          "**If she had studied** medicine, she **would be** a doctor today.",
          "**If I had taken** that job, I **would be** in Paris now.",
        ],
      },
      {
        heading: "Present state, past result",
        body: ["If + past simple (or 'were'), + would have + past participle — an ongoing trait or state explains a missed past action."],
        examples: [
          "**If he weren't** so shy, he **would have spoken up** at the meeting.",
          "**If I were** more confident, I **would have applied** for that position.",
        ],
      },
      {
        heading: "No 'would' in the if-clause",
        body: ["Never put 'would' in the if-clause of any conditional — use past perfect or past simple/'were' instead."],
        examples: [
          "**If I had taken** that scholarship, I would be studying in London now. (not 'If I would have taken')",
        ],
      },
    ],
    commonMistakes: [
      "❌ If I would have taken that job, I would be in Paris now. → ✅ If I had taken that job... (no 'would' in the if-clause)",
      "❌ If she hadn't missed that flight, she is here with us now. → ✅ ...she would be here with us now. (result clause needs 'would be')",
      "❌ If she was a native speaker, she would have got that job. → ✅ If she were a native speaker... (formal 'were', not 'was')",
      "❌ If they had saved more money, they will own a house by now. → ✅ ...they would own a house by now. ('would', not 'will')",
    ],
  },

  advanced_vocabulary: {
    title: "Advanced Vocabulary & Collocation",
    intro: "At this level, precision means using the verb that naturally collocates with a noun — 'make a decision' and 'have an impact', not the literal translation of 'do'.",
    sections: [
      {
        heading: "Make/have/take + noun collocations",
        body: ["'Make' a decision, contribution, impression, effort, argument.", "'Have' an impact/effect on.", "'Take' a stance, into account/consideration."],
        examples: [
          "She **made a strong impression** on the committee. (not 'did an impression')",
          "Her presentation **had a huge impact** on our approach. (not 'did an impact')",
          "The committee **took into consideration** all the evidence. (not 'made into consideration')",
        ],
      },
      {
        heading: "Fixed collocations with other verbs",
        body: ["shed light on, reach a consensus/stalemate, draw criticism/a conclusion, raise questions, strike a balance, cast doubt on, set a precedent."],
        examples: [
          "The report **sheds light on** how the accident happened.",
          "The findings **cast doubt on** his account of events.",
          "They finally **reached a consensus** on the budget.",
        ],
      },
      {
        heading: "Prepositions after fixed phrases",
        body: ["'Based on' (not 'in'); 'implications for' (not 'to'); 'effect on' (not 'in')."],
        examples: [
          "The argument was **based on** solid evidence. (not 'based in')",
          "This has serious **implications for** future research. (not 'implications to')",
        ],
      },
      {
        heading: "Formal register: swapping everyday words for advanced ones",
        body: [
          "At C1, formal or academic writing avoids everyday verbs in favour of a more precise, formal synonym — the meaning stays the same, but the register goes up.",
          "big→substantial, show→demonstrate, get→obtain, use→utilise, help→facilitate, start→commence, end→conclude, think about→contemplate, say→state, ask about→inquire about, tell→inform, buy→purchase, give→provide, change→modify, keep→retain, stop→cease, try→attempt, need→require, want→desire.",
          "find out→ascertain, put off→postpone, go up→increase, go down→decrease, speed up→expedite, put together→compile, come up with→devise, deal with→address, point out→highlight, leave out→omit, look into→investigate, bring about→engender, get worse→deteriorate, take part in→participate in, talk about→discuss, cut down on→reduce, bring up→raise, go through→undergo, put up with→tolerate, carry out→conduct.",
        ],
        examples: [
          "The team **utilised** new software for the project. (not 'used')",
          "The board **postponed** the decision until next quarter. (not 'put off')",
          "The researchers **conducted** a thorough investigation. (not 'carried out')",
          "The region **underwent** a period of rapid change. (not 'went through')",
        ],
      },
    ],
    commonMistakes: [
      "❌ He did a strong impression on the committee. → ✅ He made a strong impression... ('make an impression', not 'do')",
      "❌ The company did a significant loss. → ✅ The company suffered/incurred a significant loss.",
      "❌ The report made several conclusions. → ✅ The report drew several conclusions. ('draw a conclusion')",
      "❌ The professor's argument was based in evidence. → ✅ ...based on evidence. (preposition 'on', not 'in')",
      "❌ The workshop facilitates to communication. → ✅ The workshop facilitates communication. ('facilitate' takes a direct object, no 'to')",
      "❌ The scientists attempt to a new approach. → ✅ The scientists attempted a new approach. ('attempt' + noun/verb, no 'to' before a noun)",
    ],
  },

  cleft_sentences: {
    title: "Cleft Sentences",
    intro: "Cleft sentences split a simple sentence into two clauses to shift emphasis onto one specific element — using 'It was... who/that', 'What... is', or 'All... is'.",
    sections: [
      {
        heading: "It-clefts",
        body: ["'It + be + [emphasised element] + who' (for people) or 'that' (for things, times, places, reasons)."],
        examples: [
          "**It was Maria who** solved the problem, not James.",
          "**It's not the money that** bothers me — it's the principle.",
          "**It was in 2019 that** the company first launched the product.",
        ],
      },
      {
        heading: "What-clefts",
        body: ["'What + clause + is/was + [emphasised element]' — the what-clause is treated as singular, so use is/was even if the emphasised noun is plural-sounding."],
        examples: [
          "**What I really need is** a good night's sleep.",
          "**What surprised me most was** how calm she stayed.",
          "A proper apology **is what** she deserves. (reversed order)",
        ],
      },
      {
        heading: "All-clefts",
        body: ["'All + clause + is/was + [emphasised element]' presents something as the only thing that matters."],
        examples: [
          "**All she wants is** a little appreciation.",
          "**All he did was** ask a simple question.",
        ],
      },
    ],
    commonMistakes: [
      "❌ It Maria who solved the problem. → ✅ It was Maria who solved the problem. (don't forget 'was' after 'It')",
      "❌ What I need it a break. → ✅ What I need is a break. (needs 'is', not 'it')",
      "❌ It weren't until Monday that we found out. → ✅ It wasn't until Monday... ('it' is singular: wasn't)",
      "❌ What impressed the judges were her confidence. → ✅ ...was her confidence. (singular subject takes 'was')",
    ],
  },

  globalisation: {
    title: "Globalisation",
    intro: "Discussing globalisation means handling abstract, mostly-singular subjects (globalisation, trade, wages) correctly, plus a set of topic-specific vocabulary for its causes and effects.",
    sections: [
      {
        heading: "Key vocabulary",
        body: ["multinational corporation, migration, outsourcing, supply chain, cultural homogenisation, trade barriers, protectionism, brain drain."],
        examples: [
          "Coca-Cola is a **multinational corporation** operating in almost every country.",
          "Many brands rely on **outsourcing** to countries where labour is cheaper.",
          "Critics worry about **cultural homogenisation** as local traditions disappear.",
        ],
      },
      {
        heading: "Subject-verb agreement with abstract nouns",
        body: ["'Globalisation' and 'trade' are singular (has/is); 'corporations', 'wages', 'agreements' are plural (are/have)."],
        examples: [
          "**Globalisation has** lifted millions of people out of poverty. (not 'have')",
          "**Multinational corporations are** often criticised for exploiting cheap labour.",
          "Since the 1990s, world **trade has** grown enormously.",
        ],
      },
      {
        heading: "Finished time → past simple",
        body: ["With a specific finished time period (e.g. 'in the 1990s'), use past simple, not present perfect."],
        examples: [
          "Globalisation **increased** trade a lot **in the 1990s**. (not 'has increased')",
        ],
      },
      {
        heading: "Reported speech — backshifting tenses",
        body: ["When reporting what someone said, tenses usually shift one step back: present simple → past simple, present perfect → past perfect, will → would, can → could."],
        examples: [
          "'Globalisation has reduced poverty,' said the economist. → The economist said (that) globalisation **had reduced** poverty.",
          "'We will protect local industries,' said the minister. → The minister said (that) they **would protect** local industries.",
        ],
      },
      {
        heading: "Inversion — fronting a negative adverb for emphasis",
        body: ["Rarely / Never before / Not only...but also / No sooner...than / Under no circumstances + auxiliary + subject + verb — moving a negative adverbial to the front inverts the normal subject-verb order, like in a question."],
        examples: [
          "**Rarely does** globalisation benefit every country equally.",
          "**Never before has** a country faced such economic interdependence.",
          "**Not only do** multinational corporations create jobs, **but they also** increase inequality.",
        ],
      },
      {
        heading: "Third conditional — an unreal past result",
        body: ["If + past perfect, ... would have + past participle — imagining a different outcome for something that already happened and can't be changed."],
        examples: [
          "If the WTO **hadn't existed**, trade disputes **would have escalated** more often.",
          "If governments **had acted** sooner, the recession **would have hit** less hard.",
        ],
      },
      {
        heading: "Mixed conditional — a past cause, a present result",
        body: ["If + past perfect, ... would + base verb — a past action or decision explains a situation that is still true now."],
        examples: [
          "If the country **hadn't opened** its borders decades ago, it **wouldn't be** so wealthy today.",
          "If the company **hadn't outsourced** production years ago, it **wouldn't be** so profitable today.",
        ],
      },
      {
        heading: "Advanced passive — modal and modal perfect passive",
        body: ["modal + be + past participle (present/future obligation or possibility); modal + have been + past participle (a judgement or guess about the past)."],
        examples: [
          "Multinational corporations **must be regulated** by governments.",
          "The job losses **could have been prevented** by the government.",
          "The outdated tariffs **need reforming**.",
        ],
      },
    ],
    commonMistakes: [
      "❌ Delegates assisted to the trade summit. → ✅ ...attended the trade summit. ('assist' means 'to help'; 'attend' for going to an event)",
      "❌ Companies depend of cheap labour. → ✅ ...depend on cheap labour. (preposition 'on', not 'of')",
      "❌ Globalisation has increased trade a lot in the 1990s. → ✅ Globalisation increased trade... (finished time needs past simple)",
      "❌ Critics say globalisation doesn't help nobody. → ✅ ...doesn't help anybody. (avoid double negatives)",
      "❌ 'We will protect local industries,' said the minister. → The minister said they **will** protect local industries. → ✅ ...they **would** protect local industries. ('will' backshifts to 'would' in reported speech)",
      "❌ Rarely globalisation benefits every country equally. → ✅ Rarely **does** globalisation benefit... (inversion needs the auxiliary before the subject)",
    ],
  },

  business_professional_vocabulary: {
    title: "Business & Professional Vocabulary",
    intro: "Professional English relies heavily on fixed phrases (touch base, bottom line, in the pipeline) and precise verbs (streamline, leverage, spearhead) rather than generic words like 'do' or 'make'.",
    sections: [
      {
        heading: "Fixed business phrases",
        body: ["touch base, circle back, bottom line, red tape, in the pipeline, low-hanging fruit, conflict of interest, due diligence."],
        examples: [
          "Let's **touch base** next week once the figures are in.",
          "At the end of the day, it comes down to the **bottom line**.",
          "The investors carried out full **due diligence** before signing.",
        ],
      },
      {
        heading: "Precise business verbs",
        body: ["streamline (simplify a process), delegate (assign a task), leverage (use to advantage), spearhead (lead a project), upskill (train to a higher level)."],
        examples: [
          "We need to **streamline** our processes to cut costs.",
          "She was chosen **to spearhead** the new initiative.",
          "The company is investing in training to **upskill** its workforce.",
        ],
      },
      {
        heading: "People and structures",
        body: ["stakeholders, severance package, onboarding, cross-functional team — all take standard plural/singular agreement."],
        examples: [
          "All key **stakeholders were** consulted before the decision.",
          "New hires **go through** a two-week **onboarding** programme.",
        ],
      },
      {
        heading: "More fixed business idioms",
        body: [
          "get the ball rolling (start something), go back to the drawing board (start over), cut corners (do something poorly to save time/money), hit the ground running (start quickly and effectively).",
          "keep someone in the loop (keep informed), go the extra mile (put in more effort than required), raise the bar (increase standards), on the same page (in agreement), give the green light (approve), all hands on deck (everyone needs to help).",
          "a ballpark figure (a rough estimate), get up to speed (become informed/updated), move the needle (make a meaningful difference), climb the corporate ladder (advance in one's career), take something off someone's plate (reduce their workload), put something on the back burner (deprioritise it), cut to the chase (get straight to the point), think outside the box (be creative).",
        ],
        examples: [
          "Let's **get the ball rolling** on the new project.",
          "The design failed testing, so it's **back to the drawing board**.",
          "The whole team is finally **on the same page**.",
          "The manager **took some tasks off** her assistant's **plate**.",
          "Stop explaining and **cut to the chase**.",
        ],
      },
    ],
    commonMistakes: [
      "❌ She delegate the task to her assistant. → ✅ She delegated the task... (past simple needs -ed)",
      "❌ The company is streamline its processes. → ✅ ...is streamlining its processes. (present continuous needs -ing)",
      "❌ It all comes down to the bottom lines. → ✅ ...the bottom line. (fixed singular phrase)",
      "❌ Small businesses struggle of red tape. → ✅ ...struggle with red tape. (correct preposition is 'with')",
      "❌ We are in the same page about the plan. → ✅ We are on the same page about the plan. (fixed phrase uses 'on', not 'in')",
      "❌ The board gave the green light for the new project. → ✅ ...gave the green light to the new project. ('green light to', not 'for')",
    ],
  },

  media_misinformation: {
    title: "Media & Misinformation",
    intro: "Discussing media and misinformation combines specialised vocabulary (echo chamber, deepfake, disinformation) with advanced structures like inversion and cleft sentences for emphasis.",
    sections: [
      {
        heading: "Key vocabulary",
        body: ["echo chamber, filter bubble, fake news, clickbait, confirmation bias, fact-check, media literacy, deepfake, disinformation (deliberate) vs misinformation (accidental)."],
        examples: [
          "Social media can trap people in an **echo chamber** of similar opinions.",
          "The article turned out to be **fake news** designed to provoke outrage.",
          "The report accused the group of spreading **disinformation**.",
        ],
      },
      {
        heading: "Agreement with collective/abstract subjects",
        body: ["'Algorithms', 'journalists', 'people' are plural (are/do); 'trust', 'confirmation bias', 'the algorithm', 'the platform' are singular (has/is/makes)."],
        examples: [
          "Social media **algorithms are** designed to maximise engagement. (not 'is')",
          "**Confirmation bias makes** people less likely to question their views. (not 'make')",
          "**Trust** in mainstream media **has** declined significantly. (not 'have')",
        ],
      },
      {
        heading: "Advanced emphasis structures — inversion",
        body: ["Rarely / Never before / Not only...but also / No sooner...than / Under no circumstances + auxiliary + subject + verb — fronting a negative adverbial inverts the normal subject-verb order, like in a question."],
        examples: [
          "**Not only was** the story false, but it was also misleading.",
          "**Rarely does** a deepfake fool trained experts.",
          "**Never before had** anyone seen such convincing propaganda.",
        ],
      },
      {
        heading: "Reported speech — backshifting tenses",
        body: ["When reporting what someone said, tenses usually shift one step back: present simple → past simple, present perfect → past perfect, will → would, can → could."],
        examples: [
          "'This story is completely fake,' said the journalist. → The journalist said (that) the story **was** completely fake.",
          "'We will fact-check every claim,' promised the editor. → The editor promised (that) they **would fact-check** every claim.",
        ],
      },
      {
        heading: "Third conditional — an unreal past result",
        body: ["If + past perfect, ... would have + past participle — imagining a different outcome for something that already happened and can't be changed."],
        examples: [
          "If the source **had verified** the claim, the rumour **wouldn't have spread** so quickly.",
          "If she **hadn't shared** the article, it **wouldn't have gone** viral.",
        ],
      },
      {
        heading: "Mixed conditional — a past cause, a present result",
        body: ["If + past perfect, ... would + base verb — a past action or decision explains a situation that is still true now."],
        examples: [
          "If the platform **hadn't removed** fake accounts years ago, it **wouldn't be** so trusted today.",
          "If he **hadn't fallen** for that fake news story, he **wouldn't be** so cautious online now.",
        ],
      },
      {
        heading: "Advanced passive — modal and modal perfect passive",
        body: ["modal + be + past participle (present/future obligation or possibility); modal + have been + past participle (a judgement or guess about the past)."],
        examples: [
          "Fake accounts **must be removed** by platforms.",
          "The spread of misinformation **could have been prevented** by the platform.",
          "The outdated policy **needs reforming**.",
        ],
      },
    ],
    commonMistakes: [
      "❌ Social media algorithms is designed to... → ✅ ...algorithms are designed to... (plural subject)",
      "❌ The platform have been criticised... → ✅ The platform has been criticised... (singular subject 'platform')",
      "❌ Not only the story was false... → ✅ Not only was the story false... ('not only' triggers inversion)",
      "❌ It is often the headlines which spread fastest. → ✅ ...headlines that spread fastest. (it-clefts use 'that')",
      "❌ 'We will fact-check every claim,' promised the editor. → The editor promised they **will** fact-check every claim. → ✅ ...they **would** fact-check every claim. ('will' backshifts to 'would' in reported speech)",
      "❌ If the source verified the claim, the rumour wouldn't have spread so quickly. → ✅ If the source **had verified** the claim... (third conditional needs past perfect in the if-clause)",
    ],
  },
};
