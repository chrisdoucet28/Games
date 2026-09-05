import { TOPIC_LIBRARY } from "./topics";
import { LESSONS } from "./lessons";

// Round-out exercise content for the Lesson Plans feature (see LessonPlanScreen.tsx) — the one
// deliberately-chosen extra practice format per topic that rounds out a ~30-minute PPP sequence,
// sitting right before the speaking wrap-up. Everything else in a lesson plan (Presentation,
// controlled practice, open production, speaking) is assembled live from lessons.ts/topics.ts —
// this file holds only the piece that can't be, plus a helper for the one format (Unscramble)
// that's generated at render time instead of hand-authored.
//
// Scope: A1 only, all 25 topics — a deliberate test run before deciding whether to extend further.
// Every key here must match a topics.ts / lessons.ts topic id (both already required to match
// each other — see CLAUDE.md's Learn/topics parity rule).
export type RoundOut =
  | { kind: "paragraphCloze"; segments: (string | { blank: string; base: string })[] }
  | { kind: "matching"; pairs: { term: string; definition: string }[] }
  | { kind: "errorPassage"; text: string; corrected: string; fixes: string[] }
  | { kind: "scenario"; prompts: { situation: string; instruction: string; sample: string }[] }
  | { kind: "unscramble" };

export const LESSON_PLANS: Record<string, RoundOut> = {
  greetings_introductions: {
    kind: "scenario",
    prompts: [
      { situation: "Someone smiles and says: “Hi! Nice to meet you!”", instruction: "How do you respond?", sample: "Nice to meet you too!" },
      { situation: "A new classmate asks: “What's your name?”", instruction: "How do you respond?", sample: "My name is ... . What's yours?" },
      { situation: "Someone asks: “How are you today?”", instruction: "How do you respond?", sample: "I'm fine, thanks! How are you?" },
      { situation: "A tourist you just met asks: “Where are you from?”", instruction: "How do you respond?", sample: "I'm from ... ." },
      { situation: "You are leaving a party and want to say goodbye politely.", instruction: "What do you say?", sample: "It was nice meeting you. See you later!" },
    ],
  },

  introducing_others: {
    kind: "scenario",
    prompts: [
      { situation: "Your friend Marco is standing next to you, and your teacher has never met him.", instruction: "Introduce Marco to your teacher.", sample: "This is my friend Marco. He's from Italy." },
      { situation: "Your sister Elena has just arrived at a party where you already know everyone else.", instruction: "Introduce Elena to the group.", sample: "This is my sister Elena. She's a doctor." },
      { situation: "You want to introduce two friends, Tom and Sara, who have never met each other.", instruction: "Introduce them to each other.", sample: "Tom, this is Sara. Sara, this is Tom." },
      { situation: "A classmate points at your friend across the room and asks: “Who's that?”", instruction: "How do you respond?", sample: "That's my friend Ana. She's in my English class." },
    ],
  },

  feelings: {
    kind: "scenario",
    prompts: [
      { situation: "A friend asks: “How do you feel today?”", instruction: "Answer using a feeling adjective.", sample: "I feel happy today." },
      { situation: "You just finished a long day of classes and a friend says you look tired.", instruction: "Agree and explain why, using 'feel' or 'be'.", sample: "Yes, I feel tired. I had four classes today." },
      { situation: "Your friend has a big exam tomorrow.", instruction: "Ask how they feel about it, and give a sample answer using a feeling + preposition (e.g. worried about).", sample: "How do you feel about the exam? — I'm worried about it." },
      { situation: "Your classmate is talking about a spider on the wall.", instruction: "Say how you feel about spiders, using a feeling + preposition (afraid of / scared of).", sample: "I'm afraid of spiders!" },
      { situation: "Your team just won a game.", instruction: "Say how you feel about your team, using a feeling + preposition (proud of).", sample: "I'm proud of my team!" },
    ],
  },

  present_simple: {
    kind: "paragraphCloze",
    segments: [
      "Marta ", { blank: "gets up", base: "get up" }, " at seven o'clock every morning. She ",
      { blank: "has", base: "have" }, " breakfast, and then she ", { blank: "goes", base: "go" },
      " to work by bus. She ", { blank: "works", base: "work" },
      " in a hospital, so she ", { blank: "doesn't finish", base: "not finish" },
      " until six in the evening. She ", { blank: "doesn't cook", base: "not cook" },
      " dinner every day — sometimes her husband ", { blank: "cooks", base: "cook" },
      " instead. On Saturdays, Marta and her husband ", { blank: "don't work", base: "not work" },
      ". They ", { blank: "go", base: "go" }, " to the market together, and in the evening they usually ",
      { blank: "watch", base: "watch" }, " a film.",
    ],
  },

  auxiliary_verbs_be_do: {
    kind: "errorPassage",
    text: "A: Hi! Are you a new student here?\nB: Yes, I am! I are very excited to start.\nA: Great! Do you like the school so far?\nB: Yes, I does! Everyone is really friendly.\nA: Is you free this weekend? We're all going to the park.\nB: I don't sure yet — I need to check with my family first.\nA: No problem! Does you have my phone number?\nB: No, I doesn't. Can you give it to me?",
    corrected: "A: Hi! Are you a new student here?\nB: Yes, I am! I am very excited to start.\nA: Great! Do you like the school so far?\nB: Yes, I do! Everyone is really friendly.\nA: Are you free this weekend? We're all going to the park.\nB: I'm not sure yet — I need to check with my family first.\nA: No problem! Do you have my phone number?\nB: No, I don't. Can you give it to me?",
    fixes: [
      "'I are very excited' → 'I am very excited' (be, not do)",
      "'Yes, I does!' → 'Yes, I do!' ('I' takes 'do', not 'does')",
      "'Is you free...?' → 'Are you free...?' ('you' takes 'are')",
      "'I don't sure yet' → 'I'm not sure yet' ('sure' is an adjective — use 'be')",
      "'Does you have...?' → 'Do you have...?' ('you' takes 'do')",
      "'No, I doesn't.' → 'No, I don't.' ('I' takes 'don't', not 'doesn't')",
    ],
  },

  likes_dislikes: {
    kind: "errorPassage",
    text: "My name is Diego, and I really love play video games in my free time. My sister like reading books, but she don't likes sports at all — she hate running because she says it's boring! I don't like to swimming in cold water, but I love going to the beach in summer. My best friend is really into collect old coins, and he can't stand to wait for the mail to arrive.",
    corrected: "My name is Diego, and I really love playing video games in my free time. My sister likes reading books, but she doesn't like sports at all — she hates running because she says it's boring! I don't like swimming in cold water, but I love going to the beach in summer. My best friend is really into collecting old coins, and he can't stand waiting for the mail to arrive.",
    fixes: [
      "'love play video games' → 'love playing video games' ('love' + -ing)",
      "'My sister like reading' → 'My sister likes reading' (third person singular needs -s)",
      "'she don't likes sports' → 'she doesn't like sports' ('doesn't' + base verb)",
      "'she hate running' → 'she hates running' (third person singular needs -s)",
      "'don't like to swimming' → 'don't like swimming' (don't combine 'to' with -ing)",
      "'into collect old coins' → 'into collecting old coins' ('into' + -ing)",
      "'can't stand to wait' → 'can't stand waiting' ('can't stand' + -ing)",
    ],
  },

  what_do_you_do: {
    kind: "matching",
    pairs: [
      { term: "teacher", definition: "Someone who works at a school and teaches students" },
      { term: "nurse", definition: "Someone who takes care of sick people in a hospital" },
      { term: "pilot", definition: "Someone who flies planes" },
      { term: "chef", definition: "Someone who cooks food in a restaurant" },
      { term: "firefighter", definition: "Someone whose job is to put out fires" },
      { term: "vet", definition: "A doctor for animals" },
      { term: "lawyer", definition: "Someone who helps people with legal problems" },
      { term: "mechanic", definition: "Someone who fixes cars" },
    ],
  },

  hobbies: {
    kind: "matching",
    pairs: [
      { term: "hiking", definition: "Walking long distances outdoors, often in the mountains" },
      { term: "photography", definition: "Taking pictures as a hobby" },
      { term: "collecting stamps", definition: "Gathering and keeping stamps from different places" },
      { term: "painting", definition: "Creating pictures using paint" },
      { term: "gardening", definition: "Growing plants and flowers" },
      { term: "knitting", definition: "Making clothes using wool and knitting needles" },
      { term: "fishing", definition: "Catching fish, often as a relaxing outdoor activity" },
      { term: "cycling", definition: "Riding a bicycle for fun or exercise" },
    ],
  },

  personality: {
    kind: "matching",
    pairs: [
      { term: "kind", definition: "Caring and helpful to other people" },
      { term: "shy", definition: "Nervous or quiet around people you don't know well" },
      { term: "funny", definition: "Able to make people laugh" },
      { term: "generous", definition: "Happy to give or share what you have" },
      { term: "stubborn", definition: "Unwilling to change your mind or opinion" },
      { term: "outgoing", definition: "Sociable and confident meeting new people" },
      { term: "honest", definition: "Always telling the truth" },
      { term: "patient", definition: "Able to stay calm and wait without getting annoyed" },
    ],
  },

  appearance: {
    kind: "matching",
    pairs: [
      { term: "tall", definition: "Having a greater than average height" },
      { term: "slim", definition: "Thin, in a healthy-looking way" },
      { term: "curly hair", definition: "Hair that forms rings or curls, not straight" },
      { term: "freckles", definition: "Small light-brown spots on the skin, often on the face" },
      { term: "a beard", definition: "Hair that grows on a man's chin and cheeks" },
      { term: "wavy hair", definition: "Hair that is not straight and not fully curly" },
      { term: "medium height", definition: "Neither tall nor short" },
      { term: "wears glasses", definition: "Wears lenses over the eyes to help you see" },
    ],
  },

  house_objects_rooms_there_is_are: {
    kind: "matching",
    pairs: [
      { term: "kitchen", definition: "The room where you cook food" },
      { term: "wardrobe", definition: "Furniture where you hang your clothes" },
      { term: "fridge", definition: "A kitchen appliance that keeps food cold" },
      { term: "sofa", definition: "A long, soft seat in the living room" },
      { term: "mirror", definition: "An object you look at to see your reflection" },
      { term: "staircase", definition: "The steps that connect two floors of a house" },
      { term: "garage", definition: "The room where you keep your car" },
      { term: "hallway", definition: "The narrow space that connects rooms in a house" },
    ],
  },

  clothes: { kind: "unscramble" },
  what_time_is_it: { kind: "unscramble" },
  basic_word_order: { kind: "unscramble" },

  there_is_are: {
    kind: "paragraphCloze",
    segments: [
      "Welcome to my new flat! ", { blank: "There is", base: "there be" },
      " a small kitchen and a big living room. In the living room, ", { blank: "there is", base: "there be" },
      " a comfortable sofa and a television. ", { blank: "There are", base: "there be" },
      " two bedrooms — one for me and one for my sister. ", { blank: "There isn't", base: "there be not" },
      " a garden, but ", { blank: "there is", base: "there be" },
      " a small balcony with some plants. In the bathroom, ", { blank: "there are", base: "there be" },
      " two mirrors and a big bathtub. ", { blank: "There aren't", base: "there be not" },
      " any pictures on the walls yet — we just moved in! How many rooms ", { blank: "are there", base: "there be" },
      " in your house?",
    ],
  },

  can_cant: {
    kind: "scenario",
    prompts: [
      { situation: "A friend asks: “Can you swim?”", instruction: "Answer honestly, using can or can't.", sample: "Yes, I can. / No, I can't, but I'd like to learn." },
      { situation: "You are in a museum and want to know if you're allowed to take photos.", instruction: "Ask for permission.", sample: "Can I take photos here?" },
      { situation: "Your friend wants to borrow your phone for a minute.", instruction: "They ask you a question — what do they say, and how do you answer?", sample: "Can I borrow your phone? — Yes, of course you can." },
      { situation: "A classmate asks: “What's something you can't do yet, but you'd like to learn?”", instruction: "Answer using can't.", sample: "I can't ski, but I'd like to learn." },
    ],
  },

  present_continuous_a1: {
    kind: "paragraphCloze",
    segments: [
      "Look out of the window! It ", { blank: "is raining", base: "rain" },
      " outside, but the children ", { blank: "are playing", base: "play" },
      " in the garden anyway. My brother ", { blank: "is sitting", base: "sit" },
      " at the table, and he ", { blank: "is writing", base: "write" },
      " a letter to his grandmother. My mother ", { blank: "is cooking", base: "cook" },
      " lunch in the kitchen, and she ", { blank: "isn't watching", base: "not watch" },
      " the news today because she's too busy. I ", { blank: "am sitting", base: "sit" },
      " on the sofa, and I ", { blank: "am reading", base: "read" },
      " a very interesting book.",
    ],
  },

  possessive_s: {
    kind: "errorPassage",
    text: "A: Excuse me, is this your bag?\nB: No, I think it's my sisters bag. She left it here yesterday.\nA: And is this jacket Toms?\nB: Yes, that's Toms jacket — he's my classmate.\nA: Whose car is that outside?\nB: That's my parents car.\nA: Wow, and look at all those toys on the lawn!\nB: Yes, the childrens toys are always everywhere. Even the boys bikes are out there.",
    corrected: "A: Excuse me, is this your bag?\nB: No, I think it's my sister's bag. She left it here yesterday.\nA: And is this jacket Tom's?\nB: Yes, that's Tom's jacket — he's my classmate.\nA: Whose car is that outside?\nB: That's my parents' car.\nA: Wow, and look at all those toys on the lawn!\nB: Yes, the children's toys are always everywhere. Even the boys' bikes are out there.",
    fixes: [
      "'my sisters bag' → 'my sister's bag' (singular possessive needs an apostrophe before the s)",
      "'Toms' → 'Tom's' (a name is a singular possessive too — never drop the apostrophe)",
      "'my parents car' → 'my parents' car' (plural noun already ending in -s just needs the apostrophe)",
      "'the childrens toys' → 'the children's toys' ('children' isn't already plural-with-s, so it takes 's, not s')",
      "'the boys bikes' → 'the boys' bikes' (plural possessive needs the apostrophe after the s)",
    ],
  },

  days_dates_prepositions_time: {
    kind: "paragraphCloze",
    segments: [
      "My English class is ", { blank: "on", base: "day" }, " Monday, and it starts ",
      { blank: "at", base: "time" }, " six o'clock ", { blank: "in", base: "part of day" },
      " the evening. My birthday is ", { blank: "in", base: "month" }, " July, ",
      { blank: "on", base: "date" }, " the 15th (the fifteenth). This year, my birthday party is ",
      { blank: "on", base: "day" }, " Saturday, and it starts ", { blank: "at", base: "time" },
      " midday. We usually meet ", { blank: "in", base: "part of day" },
      " the morning for coffee, but the final exam is ", { blank: "on", base: "date" },
      " June 3rd (the third), and it starts ", { blank: "at", base: "time" }, " nine o'clock.",
    ],
  },

  possessive_adjectives_pronouns: {
    kind: "matching",
    pairs: [
      { term: "This is my book.", definition: "This book is mine." },
      { term: "Is this your phone?", definition: "Is this phone yours?" },
      { term: "That is her jacket.", definition: "That jacket is hers." },
      { term: "This is our house.", definition: "This house is ours." },
      { term: "That is their car.", definition: "That car is theirs." },
      { term: "Whose bag is this?", definition: "It's mine." },
    ],
  },

  prepositions_place: { kind: "unscramble" },

  family_members: {
    kind: "matching",
    pairs: [
      { term: "aunt", definition: "Your mother's or father's sister" },
      { term: "uncle", definition: "Your mother's or father's brother" },
      { term: "cousin", definition: "Your aunt or uncle's child" },
      { term: "niece", definition: "Your sibling's daughter" },
      { term: "nephew", definition: "Your sibling's son" },
      { term: "sibling", definition: "A general word for a brother or sister" },
      { term: "in-laws", definition: "Family you gain through marriage, like a husband's or wife's parents" },
      { term: "take after", definition: "To resemble an older relative in looks or personality" },
    ],
  },

  weather_temperature_seasons: {
    kind: "paragraphCloze",
    segments: [
      "Yesterday it ", { blank: "rained", base: "rain" }, " all day, so we stayed inside. Today ",
      { blank: "is", base: "be" }, " different — it ", { blank: "is", base: "be" },
      " sunny and warm. In fact, today ", { blank: "is", base: "be" },
      " even hotter than yesterday. My favorite season is summer, because it ", { blank: "is", base: "be" },
      " usually hot and sunny here. But in winter, it often ", { blank: "snows", base: "snow" },
      ", and it ", { blank: "gets", base: "get" },
      " very cold. Right now it ", { blank: "isn't snowing", base: "not / snow" },
      " — it's only autumn, and the leaves are just starting to fall. Look outside — it ",
      { blank: "is starting", base: "start" }, " to get windy!",
    ],
  },

  daily_routines_frequency: {
    kind: "errorPassage",
    text: "My sister has a very busy schedule. She wake up at six o'clock every morning, and she has breakfast on the morning before work. She go always to the gym after breakfast. She never am late for her job — she is very responsible. After work, she go home at six and cooks dinner for the family.",
    corrected: "My sister has a very busy schedule. She wakes up at six o'clock every morning, and she has breakfast in the morning before work. She always goes to the gym after breakfast. She is never late for her job — she is very responsible. After work, she goes home at six and cooks dinner for the family.",
    fixes: [
      "'She wake up' → 'She wakes up' (third person singular needs -s)",
      "'breakfast on the morning' → 'breakfast in the morning' ('in' with parts of the day, not 'on')",
      "'she go always to the gym' → 'she always goes to the gym' (the frequency adverb goes before the main verb)",
      "'She never am late' → 'She is never late' (with 'be', the adverb goes after it)",
      "'she go home' → 'she goes home' (third person singular needs -s — the mistake students make far more than the reverse)",
    ],
  },

  giving_directions: {
    kind: "scenario",
    prompts: [
      { situation: "A tourist stops you and asks: “Excuse me, how do I get to the train station?” It's straight ahead, then left at the lights.", instruction: "Give them directions.", sample: "Go straight ahead, then turn left at the traffic lights. It's just around the corner." },
      { situation: "Someone asks if the museum is far from where you're standing — it's about a five-minute walk.", instruction: "Answer their question about distance.", sample: "No, it isn't far — it's about a five-minute walk from here." },
      { situation: "A driver at a roundabout asks you which way to go for the hospital — they need the second exit.", instruction: "Tell them which exit to take.", sample: "Go round the roundabout and take the second exit." },
      { situation: "Someone describes a place to you: “The café is on your left, right here.” Your friend then asks you what to do.", instruction: "Turn their description into an instruction for your friend.", sample: "Turn left for the café." },
      { situation: "Someone is about to cross a busy road in the wrong place, right in front of you.", instruction: "Warn them not to, using a negative instruction.", sample: "Don't cross the road here — use the crossing over there." },
    ],
  },
};

// A short, real sentence pool used only by "unscramble" topics — pulled live from data that
// already exists (a topic's own question answers, filtered to clean single sentences), never
// hand-authored. Deliberately conservative filtering: no embedded quotes/dialogue (rules out
// question-and-reply answers like "'What's your name?' 'I'm Ana.'"), no bracket placeholders
// (rules out free-answer items like "(free - e.g. ...)"), a plain 3-9 word sentence.
function isCleanSentence(s: string): boolean {
  if (!s || s.includes("'") || s.includes("’") || s.includes("(") || s.includes("/")) return false;
  const wordCount = s.trim().split(/\s+/).length;
  return wordCount >= 3 && wordCount <= 9;
}

export type UnscrambleItem = { words: string[]; answer: string };

// Builds `count` unscramble items for a topic by shuffling the words of real sentences already in
// that topic's own data (its question-bank answers, falling back to its Lesson's own example
// sentences) — nothing here is hand-written. Re-shuffles fresh on every call, so replaying the
// same lesson plan doesn't always show the same word order.
export function buildUnscrambleItems(topicId: string, count: number): UnscrambleItem[] {
  const topic = (TOPIC_LIBRARY as Record<string, { questions: { answer?: string }[] }>)[topicId];
  const fromQuestions = (topic?.questions ?? [])
    .map(q => q.answer)
    .filter((a): a is string => !!a && isCleanSentence(a));
  const fromLesson = (LESSONS[topicId]?.sections ?? [])
    .flatMap(s => s.examples ?? [])
    .map(ex => ex.replace(/\*\*/g, ""))
    .filter(isCleanSentence);

  const pool = [...new Set([...fromQuestions, ...fromLesson])];
  const chosen = [...pool].sort(() => Math.random() - 0.5).slice(0, count);

  return chosen.map(answer => {
    const words = answer.replace(/[.!?]$/, "").split(/\s+/);
    let shuffled = words;
    // Reshuffle if it happens to land back in the original order (only matters for very short
    // sentences) so the exercise never accidentally hands the student the answer already solved.
    do {
      shuffled = [...words].sort(() => Math.random() - 0.5);
    } while (words.length > 1 && shuffled.join(" ") === words.join(" "));
    return { words: shuffled, answer };
  });
}
