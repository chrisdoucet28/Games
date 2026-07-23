// Short, teach-it-in-ten-minutes grammar explanations — modelled on the concise style of sites
// like test-english.com. Deliberately NOT exhaustive: each lesson covers the rules and traps the
// games themselves actually test (see topics.ts), so a teacher can hand this to a student before
// or after playing and it lines up with what they'll be asked to do. Keyed by the same topic
// `value` used in TOPIC_OPTIONS/TOPIC_LIBRARY, so a lesson is trivial to look up from anywhere a
// topic id is already in scope.
export type LessonSection = {
  heading: string;
  body: string[];
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
          "Regular verbs: add -ed → walk → walked, play → played",
          "Negative: didn't + base verb → She didn't call. / They didn't arrive.",
          "Question: Did + subject + base verb? → Did you call her? / Did they arrive on time?",
          "Many common verbs are irregular (go → went, eat → ate) — see the Irregular Verbs lesson.",
        ],
      },
      {
        heading: "Spelling of regular -ed forms",
        body: [
          "Most verbs: just add -ed → walk → walked, play → played",
          "Verb ends in -e: add -d only → live → lived, dance → danced",
          "Consonant + -y: change y → i, add -ed → study → studied, carry → carried",
          "Short verb ending consonant-vowel-consonant: double the last letter → stop → stopped, plan → planned",
        ],
      },
      {
        heading: "Use",
        body: [
          "A finished action at a specific time: I visited my grandmother last weekend. / We watched a film on Saturday.",
          "A sequence of finished past events: He woke up, got dressed, and left.",
          "A past habit or state that isn't true anymore: I lived in Rome for two years. / She played tennis every week as a child.",
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
          "Present simple: I/you/we/they + base verb; he/she/it + verb-s → She works, They work.",
          "Spelling of -s: most verbs add -s (works); -ch/-sh/-ss/-x/-o add -es (watches, goes); consonant + -y changes to -ies (study → studies).",
          "Present continuous: am/is/are + verb-ing → I'm working, She's working, They're working.",
          "Negative/question: don't/doesn't + base verb; am/is/are + not + verb-ing.",
        ],
      },
      {
        heading: "Use present simple for…",
        body: [
          "Routines and habits: I get up at 7am every day. / She goes to the gym on Mondays.",
          "Facts and general truths: Water boils at 100°C. / The sun rises in the east.",
          "Schedules and timetables (even for future events): The train leaves at 6pm. / The film starts at 8.",
          "Frequency adverbs (always, usually, often, sometimes, never) go before the main verb: I always check my email in the morning.",
        ],
      },
      {
        heading: "Use present continuous for…",
        body: [
          "Something happening right now: She's reading a book (at this moment).",
          "A temporary situation around now, not necessarily this exact second: I'm studying French this year.",
          "A fixed future arrangement, already planned: We're meeting him on Friday.",
          "A changing or developing situation: The climate is getting warmer.",
        ],
      },
      {
        heading: "Watch out for",
        body: [
          "Stative verbs (about thoughts, feelings, and senses) aren't usually continuous: I want, I know, I like, I understand, I believe, I own (not 'I am wanting').",
        ],
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
        body: [
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
          "All three forms the same: put → put → put, cut → cut → cut, cost → cost → cost.",
          "Past simple and past participle the same: buy → bought → bought, find → found → found, think → thought → thought.",
          "All three forms different: go → went → gone, see → saw → seen, take → took → taken.",
        ],
      },
      {
        heading: "Where you'll meet them",
        body: [
          "Past simple: Yesterday I went to the shops (not 'goed').",
          "Present perfect: I have never seen that film (not 'seed' or 'saw').",
          "The middle form (went, ate, saw...) is for past simple; the last form (gone, eaten, seen...) is for perfect tenses with have/has/had.",
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
          "will + base verb → I'll help you. / She won't come. (short forms: 'll, won't)",
          "am/is/are + going to + base verb → I'm going to help you. / They aren't going to come.",
        ],
      },
      {
        heading: "Use 'will' for…",
        body: [
          "A decision made at the moment of speaking: The phone's ringing — I'll get it!",
          "A prediction with no real evidence, just an opinion: I think it'll be sunny tomorrow.",
          "Promises and offers: I'll carry that for you. / I promise I'll call you.",
        ],
      },
      {
        heading: "Use 'going to' for…",
        body: [
          "A plan or intention decided before now: I'm going to visit my parents this weekend.",
          "A prediction based on evidence you can see right now: Look at those clouds — it's going to rain.",
          "Something already arranged, even without visible evidence: She's going to start a new job next month.",
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
          "If + present simple, + present simple → If you heat ice, it melts.",
          "Either clause can come first, with no change in meaning: Ice melts if you heat it.",
          "'When' can replace 'if' with no change in meaning here (unlike other conditionals): When you heat ice, it melts.",
        ],
      },
      {
        heading: "Use",
        body: [
          "Scientific or general facts: If you mix red and blue, you get purple. / Plants die if they don't get water.",
          "Things that are always/generally true: If it rains, the streets get wet.",
          "Instructions and rules: If the alarm goes off, everyone leaves the building. / If you press this button, the machine starts.",
        ],
      },
      {
        heading: "Zero vs first conditional",
        body: [
          "Zero conditional = always true, no exceptions (a rule or fact). First conditional = one likely situation in the future, with a result using 'will'. Compare: If you heat water to 100°C, it boils (always true) vs If you heat the soup, I'll eat it (one specific future situation).",
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
          "If + present simple, + will + base verb → If it rains, we'll cancel the trip.",
          "The if-clause NEVER uses 'will' — that's the #1 rule to remember.",
          "The main clause can also use can, might, or should instead of 'will', for a less certain or different kind of result: If it rains, we might stay home. / If you're tired, you should rest.",
        ],
      },
      {
        heading: "Other words instead of 'if'",
        body: [
          "unless = if...not: Unless you hurry, you'll be late = If you don't hurry, you'll be late.",
          "as long as / provided that = only if: You can go out as long as you finish your homework.",
        ],
      },
      {
        heading: "Use",
        body: [
          "A real possibility with a likely result: If she studies hard, she'll pass the exam.",
          "Warnings: If you don't leave now, you'll miss the train.",
          "Promises and offers: If you help me move, I'll buy you dinner.",
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
          "Present: Do/Does + subject + base verb? → Does she live near the school? / Do you understand?",
          "Past: Did + subject + base verb? → Did you go last weekend?",
        ],
      },
      {
        heading: "Wh- questions",
        body: [
          "Wh-word + do/does/did + subject + base verb? → Where does she work? What did you do?",
          "What vs Which: 'what' is an open choice (What's your favourite colour?); 'which' is a limited choice (Which one do you want — red or blue?).",
          "How many + countable noun (How many brothers do you have?); how much for uncountable/price (How much does it cost?); how often for frequency; how long for duration or distance.",
        ],
      },
      {
        heading: "Subject vs object questions",
        body: [
          "If the question word IS the subject, don't add do/does/did — just use the normal word order: Who called you? / What happened?",
          "If the question word is the OBJECT, you need the auxiliary: Who did you call? / What did you see?",
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
          "Past simple: I visited, she went, they saw",
          "Present perfect: have/has + past participle → I have visited, she has gone, they have seen",
        ],
      },
      {
        heading: "Use past simple when there's a specific time",
        body: [
          "yesterday, last night, last week, in 2022, when...?",
          "I called my sister yesterday evening. / When did you start learning English?",
        ],
      },
      {
        heading: "Use present perfect when there's no specific time",
        body: [
          "ever, never, just, already, yet — for experiences and recent/incomplete actions: Have you ever been to Spain? / She hasn't done her homework yet. / I've just finished.",
          "since + a starting point in time, for + a length of time — for something that started in the past and continues now: I've lived here since 2019. / I've known him for ten years.",
          "how long — asking about an ongoing situation: How long have you known her?",
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
          "Comparative: adjective + -er + than → tall → taller than",
          "Superlative: the + adjective + -est → tall → the tallest",
          "Spelling: happy → happier / happiest (y → i); big → bigger / biggest (double the final consonant); nice → nicer / nicest (just add -r/-st after silent -e)",
        ],
      },
      {
        heading: "Long adjectives (2+ syllables)",
        body: [
          "Comparative: more + adjective + than → more interesting than",
          "Superlative: the most + adjective → the most expensive",
          "Adverbs work the same way as long adjectives: more clearly, more carefully",
        ],
      },
      {
        heading: "Irregular forms",
        body: [
          "good → better → the best",
          "bad → worse → the worst",
          "far → further/farther → the furthest/farthest",
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
          "too + adjective/adverb (no noun) → It's too hot. / He drives too fast. / This shirt is too small.",
          "too much + uncountable noun → too much sugar, too much traffic, too much homework, too much time",
          "too many + countable plural noun → too many people, too many mistakes, too many cars, too many apps",
        ],
      },
      {
        heading: "Quick check",
        body: [
          "Can you count it one by one (one car, two cars)? Use 'too many'. Can't count it (sugar, traffic, homework)? Use 'too much'. Is there no noun at all, just an adjective or adverb? Use 'too' alone.",
        ],
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
          "must / have to → it's necessary: Students must wear a uniform. / I have to finish this by Friday.",
          "mustn't → it's forbidden: You mustn't smoke here. / You mustn't run in the corridor.",
          "don't have to / doesn't have to → it's not necessary (but not forbidden either): You don't have to pay — it's free. / We don't have to hurry.",
        ],
      },
      {
        heading: "Must vs have to",
        body: [
          "'Must' often feels like the speaker's own rule or a very official one; 'have to' often comes from someone/something else (a boss, a law, a situation).",
          "Questions and third person almost always use 'have to'/'has to', not 'must': Do you have to book in advance? She has to leave early.",
          "'Have to' changes with the subject like a normal verb (has to, doesn't have to); 'must'/'mustn't' never change and never need 'to' after them.",
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
          "might / could / may + base verb → a weak, uncertain possibility: It might rain later. / That could be John.",
          "must + base verb → a strong, confident deduction based on evidence: He must be tired — he's been working all day.",
          "can't + base verb → something is logically impossible given the evidence: She can't be at home — the lights are off and her car's gone.",
        ],
      },
      {
        heading: "Remember",
        body: [
          "All of these are followed by the bare infinitive — never 'to', never -ing, never -s.",
          "These are guesses about now, not facts — compare 'She's at work' (a fact) with 'She might be at work' (a guess).",
        ],
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
          "Would you like to + base verb? → Would you like to come to my party?",
          "Are you free + time? → Are you free on Saturday?",
          "Do you fancy + -ing? → Do you fancy going to the cinema? ('fancy' is British informal)",
          "How about / What about + -ing? → How about going bowling tonight?",
          "Why don't you/we + base verb? / Shall we + base verb? → Why don't we try that new café? Shall we meet at six?",
        ],
      },
      {
        heading: "Accepting",
        body: [
          "That sounds great/fun/wonderful! — enthusiastic yes",
          "I'd love to! / Count me in! / I'm in! — informal enthusiastic yes",
          "Sounds like a plan! — casual confirmation",
        ],
      },
      {
        heading: "Declining politely",
        body: [
          "I'm afraid I can't make it — I have other plans. ('make it' = attend)",
          "I'd love to, but I already have plans that evening. (note the word order: 'already' before the verb)",
          "Thanks for the invite, but… / Maybe another time? (softens the 'no' and leaves the door open)",
        ],
      },
      {
        heading: "Formal vs informal",
        body: [
          "Formal: Would you like to join us for…? / We would be delighted if you could attend…",
          "Informal: Do you fancy…? / How about…? / Are you up for it?",
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
          "One day / One night / One evening… → One day, I was walking home when something strange happened.",
          "Once upon a time… (classic, storybook opener)",
          "Set the scene with past continuous for background: I was cooking dinner when the smoke alarm went off.",
        ],
      },
      {
        heading: "Sequencing events",
        body: [
          "First, … Then, … Next, … After that, … Finally, …",
          "Use past simple for the events themselves, in the order they happened: First we packed our bags. Then we called a taxi.",
        ],
      },
      {
        heading: "Adding drama",
        body: [
          "Suddenly, … / All of a sudden, … — an unexpected event",
          "Luckily, … / Unfortunately, … — a lucky or unlucky turn",
          "Eventually, … / At last, … — something that took a long time to happen",
          "To make things worse, … — adding a second problem",
          "so + adjective + that / such a + adjective + noun + that → She was so tired that she fell asleep. / It was such a scary film that I couldn't sleep.",
        ],
      },
      {
        heading: "Ending a story",
        body: [
          "In the end, … / Finally, … — introduces the outcome",
          "As a result, … — introduces a consequence of what just happened",
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
          "I have a headache / a sore throat / a fever / a cough / a stomachache.",
          "I feel dizzy. / I've been feeling unwell / tired lately.",
          "catch a cold — I caught a cold last week.",
          "be allergic to + thing → I'm allergic to penicillin. / suffer from + illness → He is suffering from a bad cold.",
        ],
      },
      {
        heading: "Injuries",
        body: [
          "sprain/twist + body part → She sprained her ankle playing tennis.",
          "break + body part (past: broke, participle: broken) → He broke his arm. / He has broken his arm.",
          "cut myself, a bruise, feel dizzy, be out of breath",
        ],
      },
      {
        heading: "Seeing a doctor",
        body: [
          "make an appointment (to see the doctor/dentist)",
          "The doctor examines you, then prescribes medicine.",
          "Giving advice/instructions: You should rest. / You must rest. (no 'to' after should/must)",
          "This medicine should be taken twice a day. (passive: modal + be + past participle)",
        ],
      },
      {
        heading: "For vs since",
        body: [
          "for + a length of time → I've had this cough for three days.",
          "since + a starting point → My throat has been sore since Monday.",
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
          "Could I have… ? / I'd like… / Can I get… ? — all common ways to order",
          "I'll have the pasta, please. (more natural than 'I'll take' in a restaurant)",
          "Waiter's questions: Are you ready to order? What would you like?",
        ],
      },
      {
        heading: "Talking about the meal",
        body: [
          "starter → main course → dessert",
          "Does it come with…? — asking what's included",
          "Could I swap the chips for a salad? ('swap X for Y')",
          "Could I have it without onions, please?",
        ],
      },
      {
        heading: "Dietary needs",
        body: [
          "Is this dish vegetarian/vegan/gluten-free? / suitable for vegetarians?",
          "I'm allergic to nuts, so could you check the ingredients?",
        ],
      },
      {
        heading: "Finishing up",
        body: [
          "Could we have the bill, please? / Could we have separate bills?",
          "book a table (in advance) → I'd like to book a table for two.",
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
          "I missed the bus. / I got stuck in traffic. / My alarm didn't go off. / I overslept.",
          "Something came up (at the last minute). — a vague, general excuse",
          "My phone died. / I completely forgot. / It slipped my mind. (= I forgot)",
          "I had a family emergency / a prior commitment.",
        ],
      },
      {
        heading: "Joining the excuse to the result",
        body: [
          "…because + reason → I arrived late for work because I missed the bus.",
          "Give the reason after 'because', in past simple: She missed the meeting because she had a family emergency.",
        ],
      },
      {
        heading: "Admitting you were wrong",
        body: [
          "should have + past participle → I should have called you earlier. I'm sorry.",
          "This is a past regret — you didn't do it, and now you wish you had.",
        ],
      },
      {
        heading: "Apologising formally",
        body: [
          "I apologise for being late. / Please accept my apologies.",
          "Sorry for the inconvenience.",
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
          "Let's + base verb → Let's take a break.",
          "Shall we + base verb? → Shall we meet at six?",
          "Why don't we/you + base verb? → Why don't we try that new café?",
          "Why not + base verb (no subject)? → Why not take a taxi?",
        ],
      },
      {
        heading: "-ing form — 'about' suggestions and verbs like suggest/recommend",
        body: [
          "How about / What about + -ing? → How about going for a walk?",
          "I suggest / I recommend + -ing → I suggest postponing the meeting.",
          "Have you considered / thought about + -ing? → Have you considered asking for help?",
          "It might be worth + -ing → It might be worth checking the reviews.",
        ],
      },
      {
        heading: "Softer or more formal suggestions",
        body: [
          "You should/could try… — 'should' is stronger, 'could' is gentler and optional",
          "If I were you, I'd… — friendly advice using second conditional",
          "What if + past simple? → What if we went camping this year?",
          "May I suggest…? / I'd propose… — formal, often in meetings",
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
          "do the housework/chores, relax/unwind, go to bed, fall asleep",
          "Third person needs -s: She wakes up at seven. He catches the bus at 7:45.",
          "Sequence with first, then, after that, finally: First I have a shower. Then I get dressed.",
        ],
      },
      {
        heading: "Frequency and time",
        body: [
          "always / usually / often / sometimes / never — goes before the main verb: I usually go to the gym. (but after 'be': I am usually tired.)",
          "free time / spare time — time that's yours, not work or school",
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
          "be allergic to + food → She is allergic to nuts.",
          "be on a diet, lose weight, eat out, cook/prepare food",
          "Comparing food: this curry is spicier than that one (short adjective + -er)",
        ],
      },
      {
        heading: "At a restaurant",
        body: [
          "menu, bill, waiter, portion, starter, main course, dessert",
          "This dish is suitable for vegetarians. / Does it come with rice?",
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
          "subject, exam, homework, grade/mark, library, classmate, timetable",
          "be good at + subject → She is good at maths. / revise for an exam",
          "hand in homework, pass/fail an exam, take notes",
        ],
      },
      {
        heading: "Obligation at school",
        body: [
          "must/have to + base verb → Students must arrive on time. (no 'to' after 'must')",
          "Passive with a modal: The essay must be handed in by Friday. (modal + be + past participle)",
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
          "get on/along with someone (= have a good relationship), take after someone (= look/act like them)",
          "keep in touch, close-knit family, only child, rely on someone",
          "We have been friends since primary school. (present perfect + since = started in the past, still true now)",
          "who for people in relative clauses → My uncle, who lives in Canada, is visiting us.",
        ],
      },
      {
        heading: "Comparing people in a family",
        body: [
          "Short adjectives: older/youngest (not 'more old' or 'more young')",
          "She is the youngest child in the family. (superlative for 3+ people)",
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
          "in my free time, at weekends, once a week — time expressions for habits",
          "enjoy/like + -ing → I enjoy cooking. (not 'enjoy to cook')",
          "prefer X to Y → I prefer swimming to running.",
          "would like to + infinitive → I would like to try surfing one day.",
          "join a club, take up a hobby, take a class, practise a skill",
        ],
      },
      {
        heading: "Feelings about activities",
        body: [
          "-ed vs -ing adjectives: I am bored (how you feel) vs. The film is boring (what causes the feeling)",
        ],
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
          "There is/are + noun → There are a lot of shops near my home. (plural noun needs 'are')",
          "be famous for + noun → My town is famous for its old market.",
          "which for places/things in relative clauses → The old town, which is very famous, attracts tourists.",
          "Comparatives/superlatives: quieter than, busier than, the most beautiful",
        ],
      },
      {
        heading: "Talking about the past of a place",
        body: [
          "Passive voice for history: The cathedral was built hundreds of years ago. (was/were + past participle)",
        ],
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
};
