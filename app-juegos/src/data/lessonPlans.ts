import { TOPIC_LIBRARY } from "./topics";
import { LESSONS } from "./lessons";

// Round-out exercise content for the Lesson Plans feature (see LessonPlanScreen.tsx) — the one
// deliberately-chosen extra practice format per topic that rounds out a ~30-minute PPP sequence,
// sitting right before the speaking wrap-up. Everything else in a lesson plan (Presentation,
// controlled practice, open production, speaking) is assembled live from lessons.ts/topics.ts —
// this file holds only the piece that can't be, plus a helper for the one format (Unscramble)
// that's generated at render time instead of hand-authored.
//
// Scope: all 5 CEFR levels — every topic in topics.ts/lessons.ts has a Lesson Plan.
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

  // --- A2 ---

  past_simple: {
    kind: "paragraphCloze",
    segments: [
      "Last Saturday, my friend Marco ", { blank: "arrived", base: "arrive" }, " at my house early. We ",
      { blank: "wanted", base: "want" }, " to visit the coast, so we ", { blank: "planned", base: "plan" },
      " our trip carefully. First, we ", { blank: "drove", base: "drive" }, " to the beach and parked the car near the sea. Marco ",
      { blank: "didn't bring", base: "not bring" }, " his swimsuit, so he ", { blank: "bought", base: "buy" },
      " one from a small shop. We ", { blank: "swam", base: "swim" }, " for an hour, and then we ",
      { blank: "ate", base: "eat" }, " fish and chips for lunch. Unfortunately, it ", { blank: "began", base: "begin" },
      " to rain in the afternoon, so we ", { blank: "didn't stay", base: "not stay" }, " much longer.",
    ],
  },

  present_simple_vs_continuous: {
    kind: "paragraphCloze",
    segments: [
      "My name is Elena, and I ", { blank: "work", base: "work" }, " as a nurse in a busy hospital. Every day I ",
      { blank: "start", base: "start" }, " my shift at seven o'clock. This month, though, I ",
      { blank: "am covering", base: "cover" }, " for a colleague on the night shift. Right now I ",
      { blank: "am sitting", base: "sit" }, " in the staff room, and I ", { blank: "am drinking", base: "drink" },
      " my coffee before the shift starts. I really ", { blank: "like", base: "like" },
      " the night shift — it's quieter. My manager ", { blank: "knows", base: "know" },
      " I prefer it, so these days she ", { blank: "is trying", base: "try" }, " to give me more night shifts.",
    ],
  },

  irregular_verbs: {
    kind: "matching",
    pairs: [
      { term: "go", definition: "past simple: went, past participle: gone" },
      { term: "eat", definition: "past simple: ate, past participle: eaten" },
      { term: "see", definition: "past simple: saw, past participle: seen" },
      { term: "buy", definition: "past simple: bought, past participle: bought" },
      { term: "take", definition: "past simple: took, past participle: taken" },
      { term: "write", definition: "past simple: wrote, past participle: written" },
      { term: "break", definition: "past simple: broke, past participle: broken" },
      { term: "know", definition: "past simple: knew, past participle: known" },
    ],
  },

  future_will_going_to: {
    kind: "scenario",
    prompts: [
      { situation: "The phone starts ringing right next to you, and no one else moves to answer it.", instruction: "Say what you'll do, using 'will'.", sample: "I'll get it!" },
      { situation: "You look outside and see huge dark clouds rolling in.", instruction: "Make a prediction using 'going to' (you have visible evidence).", sample: "It's going to rain." },
      { situation: "Your friend asks about your weekend — you decided last week to visit your parents.", instruction: "Answer using 'going to' (already planned).", sample: "I'm going to visit my parents this weekend." },
      { situation: "Your friend is carrying too many heavy bags and can't manage.", instruction: "Offer to help, using 'will'.", sample: "I'll carry that for you." },
      { situation: "A friend asks if you think it'll be sunny tomorrow — you have no real evidence, just a feeling.", instruction: "Give your opinion using 'will'.", sample: "I think it'll be sunny tomorrow." },
    ],
  },

  zero_conditional: {
    kind: "scenario",
    prompts: [
      { situation: "A child asks you what happens when you mix red and blue paint.", instruction: "Explain the rule, using the zero conditional.", sample: "If you mix red and blue, you get purple." },
      { situation: "Someone asks why their plants keep dying.", instruction: "Explain the general rule about plants and water.", sample: "Plants die if they don't get water." },
      { situation: "A friend asks what happens to ice when it gets warm.", instruction: "Explain the scientific fact, using the zero conditional.", sample: "If you heat ice, it melts." },
      { situation: "You're explaining the fire alarm procedure to a new colleague.", instruction: "Explain the rule, using the zero conditional.", sample: "If the alarm goes off, everyone leaves the building." },
      { situation: "Someone asks what happens to the streets in your city when it rains.", instruction: "Answer using the zero conditional.", sample: "If it rains, the streets get wet." },
    ],
  },

  first_conditional: {
    kind: "scenario",
    prompts: [
      { situation: "You're planning a picnic tomorrow, but the forecast looks uncertain.", instruction: "Say what will happen if it rains, using the first conditional.", sample: "If it rains, we'll cancel the trip." },
      { situation: "Your friend keeps putting off leaving for the station.", instruction: "Warn them about being late, using the first conditional.", sample: "If you don't leave now, you'll miss the train." },
      { situation: "Your friend is nervous about an upcoming exam.", instruction: "Reassure them about what will happen if they study hard, using the first conditional.", sample: "If you study hard, you'll pass the exam." },
      { situation: "A friend offers to help you move house if you buy them dinner in return.", instruction: "Make the same offer to another friend, using the first conditional.", sample: "If you help me move, I'll buy you dinner." },
      { situation: "You want to say a friend can go out only if they finish their homework first.", instruction: "Say it, using 'as long as'.", sample: "You can go out as long as you finish your homework." },
    ],
  },

  making_questions: {
    kind: "errorPassage",
    text: "A: Where does she works?\nB: She works at a hospital in the city centre.\nA: What you did yesterday?\nB: I stayed home and watched a film.\nA: How long does it takes to get there?\nB: About twenty minutes by bus.\nA: Where you are going on holiday this year?\nB: We're going to Portugal in July.",
    corrected: "A: Where does she work?\nB: She works at a hospital in the city centre.\nA: What did you do yesterday?\nB: I stayed home and watched a film.\nA: How long does it take to get there?\nB: About twenty minutes by bus.\nA: Where are you going on holiday this year?\nB: We're going to Portugal in July.",
    fixes: [
      "'Where does she works?' → 'Where does she work?' (base verb after 'does')",
      "'What you did yesterday?' → 'What did you do yesterday?' (need 'did' before the subject)",
      "'How long does it takes?' → 'How long does it take?' (base verb after 'does')",
      "'Where you are going...?' → 'Where are you going...?' (auxiliary before the subject)",
    ],
  },

  present_perfect_vs_past_simple: {
    kind: "paragraphCloze",
    segments: [
      "Let me tell you about my sister. She ", { blank: "has visited", base: "visit" }, " many countries — she ",
      { blank: "has been", base: "be" }, " to over twenty already! Last year, she ", { blank: "travelled", base: "travel" },
      " to Japan for a month. She ", { blank: "has never tried", base: "never / try" },
      " sushi before, but now she loves it. She ", { blank: "moved", base: "move" },
      " back home in December, and since then she ", { blank: "has started", base: "start" },
      " planning her next trip. She ", { blank: "has already booked", base: "already / book" },
      " her flights, but she ", { blank: "hasn't decided", base: "not / decide" }, " where to stay yet.",
    ],
  },

  comparatives_superlatives: {
    kind: "errorPassage",
    text: "My brother is more tall than me, but I am more fast than him. Our sister is the most young in the family, but she is the goodest student of the three of us. Our house is more big than our cousins' house, but it isn't the most old one on the street.",
    corrected: "My brother is taller than me, but I am faster than him. Our sister is the youngest in the family, but she is the best student of the three of us. Our house is bigger than our cousins' house, but it isn't the oldest one on the street.",
    fixes: [
      "'more tall' → 'taller' (short adjectives use -er, not 'more')",
      "'more fast' → 'faster' (short adjectives use -er, not 'more')",
      "'the most young' → 'the youngest' (short adjectives use -est, not 'the most')",
      "'the goodest' → 'the best' ('good' is irregular)",
      "'more big' → 'bigger' (double the final consonant: big → bigger)",
      "'the most old' → 'the oldest' (short adjectives use -est, not 'the most')",
    ],
  },

  comparatives: {
    kind: "scenario",
    prompts: [
      { situation: "Someone asks you to compare your height to your best friend's.", instruction: "Compare using a short adjective (+ -er).", sample: "I'm taller than my best friend." },
      { situation: "Someone asks you to compare two cities you know — one is more interesting to visit.", instruction: "Compare using a long adjective (+ more).", sample: "Barcelona is more interesting than my hometown." },
      { situation: "You want to say your cooking and your mother's cooking are equally good.", instruction: "Say it using 'as...as'.", sample: "My cooking is as good as my mother's." },
      { situation: "You want to say your phone isn't as expensive as your friend's phone.", instruction: "Say it using 'not as...as'.", sample: "My phone isn't as expensive as yours." },
      { situation: "Someone asks whether your English has improved compared to last year.", instruction: "Answer using a comparative.", sample: "My English is better than it was last year." },
    ],
  },

  superlatives: {
    kind: "paragraphCloze",
    segments: [
      "The Nile is ", { blank: "the longest", base: "long" }, " river in the world. Mount Everest is ",
      { blank: "the highest", base: "high" }, " mountain on Earth. Some scientists say the blue whale is ",
      { blank: "the biggest", base: "big" }, " animal that has ever lived. In my opinion, Japanese food is ",
      { blank: "the most delicious", base: "delicious" }, " food in the world, but my friend thinks Italian food is even better — for her, it's one of ",
      { blank: "the best", base: "good" }, " cuisines anywhere. My hometown isn't ", { blank: "the most famous", base: "famous" },
      " city in my country, but it's definitely ", { blank: "the friendliest", base: "friendly" }, " one I know.",
    ],
  },

  too_much_many: {
    kind: "errorPassage",
    text: "This city is too much crowded for me. There are too much tourists everywhere, and there's too many traffic on every street. The hotel room was too much small, and honestly, I paid too much many for it.",
    corrected: "This city is too crowded for me. There are too many tourists everywhere, and there's too much traffic on every street. The hotel room was too small, and honestly, I paid too much for it.",
    fixes: [
      "'too much crowded' → 'too crowded' (adjective — no noun, so just 'too')",
      "'too much tourists' → 'too many tourists' ('tourists' is countable plural)",
      "'too many traffic' → 'too much traffic' ('traffic' is uncountable)",
      "'too much small' → 'too small' (adjective — no noun, so just 'too')",
      "'too much many' → 'too much' (price/money — just 'too much', no extra 'many')",
    ],
  },

  modals_obligation: {
    kind: "scenario",
    prompts: [
      { situation: "Your school requires all students to wear a uniform — there's no choice.", instruction: "Say it using 'must' or 'have to'.", sample: "Students must wear a uniform." },
      { situation: "Smoking is completely forbidden inside your office building.", instruction: "Say it using 'mustn't'.", sample: "You mustn't smoke here." },
      { situation: "The museum is free, so visitors don't need to pay.", instruction: "Say it using 'don't have to'.", sample: "You don't have to pay — it's free." },
      { situation: "You want to ask a colleague whether booking a table in advance is necessary at a restaurant.", instruction: "Ask, using 'have to'.", sample: "Do you have to book in advance?" },
      { situation: "Your report is due by Friday — there's no way around it.", instruction: "Say it using 'have to'.", sample: "I have to finish this by Friday." },
    ],
  },

  modals_possibility: {
    kind: "matching",
    pairs: [
      { term: "It's very cloudy outside.", definition: "It might rain later." },
      { term: "Someone is knocking, but you don't recognize the knock.", definition: "That could be anyone." },
      { term: "He's been working all day without a break.", definition: "He must be tired." },
      { term: "The lights are off and her car is gone.", definition: "She can't be at home." },
      { term: "You're not sure if the story is true.", definition: "It might be true." },
      { term: "Someone seems tired and quiet, and you're not sure why.", definition: "She might be worried about something." },
    ],
  },

  invitations: {
    kind: "scenario",
    prompts: [
      { situation: "You want to invite a friend to your birthday party this weekend.", instruction: "Invite them, using 'would you like to'.", sample: "Would you like to come to my party?" },
      { situation: "A friend invites you to the cinema, and you're excited to go.", instruction: "Accept enthusiastically.", sample: "I'd love to! That sounds great." },
      { situation: "A friend invites you to dinner, but you already have plans that evening.", instruction: "Decline politely, without closing the door completely.", sample: "I'm afraid I can't make it — I already have plans. Maybe another time?" },
      { situation: "You want to suggest going bowling tonight, in a casual way.", instruction: "Suggest it, using 'how about'.", sample: "How about going bowling tonight?" },
      { situation: "You're organizing a formal work event and inviting a business partner.", instruction: "Invite them formally.", sample: "We would be delighted if you could attend." },
    ],
  },

  telling_stories: {
    kind: "paragraphCloze",
    segments: [
      "", { blank: "One day", base: "story opener" }, ", I was walking home from work when something strange happened. I ",
      { blank: "saw", base: "see" }, " a small dog sitting outside a shop, completely alone. ",
      { blank: "First", base: "sequence word" }, ", I looked around for its owner, but nobody was there. ",
      { blank: "Then", base: "sequence word" }, ", I decided to take the dog to the police station. ",
      { blank: "Suddenly", base: "unexpected event" }, ", the dog started running — straight towards a woman down the street! ",
      { blank: "Luckily", base: "lucky turn" }, ", she was the owner, and she was overjoyed to see her dog again. ",
      { blank: "In the end", base: "outcome" }, ", she thanked me and even invited me for coffee. It was ",
      { blank: "such a", base: "so / such" }, " surprising day that I told everyone about it for weeks.",
    ],
  },

  health_and_body: {
    kind: "errorPassage",
    text: "A: What's wrong?\nB: I have a bad cough, and I'm suffering of a cold too.\nA: Are you allergic at anything?\nB: Yes, I'm allergic at penicillin. I've had this cough since three days now.\nA: You should stopped talking so much, and you should rested your voice.\nB: Okay. My feet hurts too, actually — I have broke my toe last week and it still aches.",
    corrected: "A: What's wrong?\nB: I have a bad cough, and I'm suffering from a cold too.\nA: Are you allergic to anything?\nB: Yes, I'm allergic to penicillin. I've had this cough for three days now.\nA: You should stop talking so much, and you should rest your voice.\nB: Okay. My feet hurt too, actually — I have broken my toe last week and it still aches.",
    fixes: [
      "'suffering of a cold' → 'suffering from a cold' ('suffer from', not 'suffer of')",
      "'allergic at anything/penicillin' → 'allergic to anything/penicillin' ('allergic to')",
      "'since three days' → 'for three days' ('for' + a length of time)",
      "'should stopped / should rested' → 'should stop / should rest' (modal + base verb, no '-ed')",
      "'My feet hurts' → 'My feet hurt' (plural body part, no -s)",
      "'I have broke my toe' → 'I have broken my toe' (past participle 'broken')",
    ],
  },

  ordering_food: {
    kind: "scenario",
    prompts: [
      { situation: "The waiter asks if you're ready to order.", instruction: "Order politely, using 'I'd like' or 'could I have'.", sample: "Could I have the pasta, please?" },
      { situation: "You want to know if your dish comes with rice before you order.", instruction: "Ask the waiter.", sample: "Does it come with rice?" },
      { situation: "You'd prefer a salad instead of the chips that come with your meal.", instruction: "Ask to swap them.", sample: "Could I swap the chips for a salad?" },
      { situation: "You're allergic to nuts and want to check the soup is safe.", instruction: "Ask the waiter.", sample: "Could you tell me if the soup contains nuts?" },
      { situation: "You've finished eating and want to pay.", instruction: "Ask for the bill.", sample: "Could we have the bill, please?" },
    ],
  },

  making_excuses: {
    kind: "errorPassage",
    text: "A: Why were you late this morning?\nB: I'm so sorry! My alarm didn't go off, my car wouldn't started, and then I had a traffic on the way here.\nA: You should have call me to let me know.\nB: I know, I'm sorry. It slipped of my mind completely — I forget my phone at home too.\nA: Okay, don't worry. Just try not to let it happen again.",
    corrected: "A: Why were you late this morning?\nB: I'm so sorry! My alarm didn't go off, my car wouldn't start, and then I was stuck in traffic on the way here.\nA: You should have called me to let me know.\nB: I know, I'm sorry. It slipped my mind completely — I forgot my phone at home too.\nA: Okay, don't worry. Just try not to let it happen again.",
    fixes: [
      "'wouldn't started' → 'wouldn't start' (modal + base verb, no '-ed')",
      "'had a traffic' → 'was stuck in traffic' ('traffic' is uncountable, no article)",
      "'should have call' → 'should have called' ('should have' + past participle)",
      "'slipped of my mind' → 'slipped my mind' (no preposition — fixed phrase)",
      "'I forget my phone' → 'I forgot my phone' (irregular past simple)",
    ],
  },

  making_suggestions: {
    kind: "matching",
    pairs: [
      { term: "Let's", definition: "+ base verb: Let's take a break." },
      { term: "Shall we", definition: "+ base verb: Shall we meet at six?" },
      { term: "Why don't we", definition: "+ base verb: Why don't we try that café?" },
      { term: "How about", definition: "+ -ing: How about going for a walk?" },
      { term: "I suggest", definition: "+ -ing: I suggest postponing the meeting." },
      { term: "Have you considered", definition: "+ -ing: Have you considered asking for help?" },
      { term: "What if", definition: "+ past simple: What if we went camping?" },
    ],
  },

  daily_life_a2: {
    kind: "errorPassage",
    text: "Hi! My name is Sofia and I have 22 years old. Every day I wake up early and I am agree that mornings are the best part of the day. I like to listen music while I have breakfast. I have a house big with a garden, which I love. Yesterday, I goed to the gym after work. On Sundays, I don't do nothing special — I just relax at home.",
    corrected: "Hi! My name is Sofia and I am 22 years old. Every day I wake up early and I agree that mornings are the best part of the day. I like to listen to music while I have breakfast. I have a big house with a garden, which I love. Yesterday, I went to the gym after work. On Sundays, I don't do anything special — I just relax at home.",
    fixes: [
      "'I have 22 years old' → 'I am 22 years old' ('to be' + age, not 'to have')",
      "'I am agree that' → 'I agree that' ('agree' is a verb on its own, no 'am')",
      "'listen music' → 'listen to music' ('listen to' + thing)",
      "'a house big with a garden' → 'a big house with a garden' (adjective before the noun)",
      "'I goed to the gym' → 'I went to the gym' ('go' is irregular in the past simple)",
      "'I don't do nothing special' → 'I don't do anything special' (only one negative per clause)",
    ],
  },

  food_and_eating: {
    kind: "scenario",
    prompts: [
      { situation: "A friend asks what you ate for dinner last night.", instruction: "Answer using the past simple.", sample: "I had pasta for dinner last night." },
      { situation: "Someone offers you a dish that contains nuts, and you're allergic to them.", instruction: "Explain politely why you can't eat it.", sample: "I'm allergic to nuts, so I can't eat that, sorry." },
      { situation: "You're at a restaurant and want to know if a dish is suitable for vegetarians.", instruction: "Ask the waiter.", sample: "Is this dish suitable for vegetarians?" },
      { situation: "Your friend is trying to eat healthier and asks for your advice about breakfast.", instruction: "Give advice using 'shouldn't'.", sample: "You shouldn't skip breakfast." },
      { situation: "Someone asks if you're doing anything special with food this evening.", instruction: "Answer using the present continuous.", sample: "We're eating out tonight, actually." },
    ],
  },

  school_and_study: {
    kind: "matching",
    pairs: [
      { term: "hand in", definition: "To submit your homework or assignment to a teacher" },
      { term: "classmate", definition: "A student in the same class as you" },
      { term: "timetable", definition: "A schedule showing when each class happens" },
      { term: "grade / mark", definition: "The score you get for a piece of work or a test" },
      { term: "take notes", definition: "To write down key information during a class" },
      { term: "pass an exam", definition: "To succeed in a test" },
      { term: "fail an exam", definition: "To not succeed in a test" },
      { term: "be good at", definition: "To have a natural skill or talent for something" },
    ],
  },

  friends_and_family: {
    kind: "matching",
    pairs: [
      { term: "get on with", definition: "To have a good relationship with someone" },
      { term: "take after", definition: "To look or act like an older relative" },
      { term: "keep in touch", definition: "To stay in contact with someone" },
      { term: "close-knit", definition: "Very close and supportive, as a family" },
      { term: "rely on", definition: "To depend on someone for help or support" },
      { term: "only child", definition: "Someone with no brothers or sisters" },
    ],
  },

  free_time_a2: { kind: "unscramble" },

  my_town_city: { kind: "unscramble" },

  used_to_past: {
    kind: "errorPassage",
    text: "When I was a child, I use to play outside every day after school. I didn't used to like vegetables at all, but now I eat them all the time. Did you used to live near a park too? I used to went to the swimming pool every Saturday with my brother. Life used to being much simpler back then.",
    corrected: "When I was a child, I used to play outside every day after school. I didn't use to like vegetables at all, but now I eat them all the time. Did you use to live near a park too? I used to go to the swimming pool every Saturday with my brother. Life used to be much simpler back then.",
    fixes: [
      "'I use to play' → 'I used to play' (positive statements need 'used to', with -d)",
      "'didn't used to like' → 'didn't use to like' (no -d after 'use' in the negative)",
      "'Did you used to live' → 'Did you use to live' (no -d after 'use' in questions)",
      "'used to went' → 'used to go' ('used to' + base verb, not the past form)",
      "'used to being' → 'used to be' ('used to' + base verb, not -ing)",
    ],
  },

  present_continuous_a2: {
    kind: "matching",
    pairs: [
      { term: "believe", definition: "To think that something is true" },
      { term: "belong", definition: "To be owned by someone, or be a member of a group" },
      { term: "seem", definition: "To appear to be true, based on how something looks" },
      { term: "own", definition: "To possess something as yours" },
      { term: "understand", definition: "To know the meaning of something" },
      { term: "remember", definition: "To keep something in your memory" },
      { term: "need", definition: "To require something necessary" },
      { term: "know", definition: "To have information about something in your mind" },
    ],
  },

  conjunctions: {
    kind: "paragraphCloze",
    segments: [
      "Yesterday was a strange day. I wanted to go for a run, ", { blank: "but", base: "contrast" },
      " it was raining heavily. ", { blank: "Although", base: "contrast (starts the sentence)" },
      " it was raining, I decided to go anyway, ", { blank: "so", base: "result" },
      " I put on a warm jacket first. I love running in the rain, ", { blank: "whereas", base: "formal contrast" },
      " my sister refuses to leave the house in bad weather. I only run outside ",
      { blank: "if", base: "future condition — present tense, no 'will'" }, " it isn't freezing, ",
      { blank: "because", base: "reason" }, " I don't like getting sick. ", { blank: "When", base: "future time — present tense" },
      " I finish a run like that, I always feel fantastic — cold and wet, ", { blank: "though", base: "informal contrast at the end" }, "!",
    ],
  },

  // --- B1 ---

  subject_object_questions: { kind: "unscramble" },

  present_perfect: {
    kind: "errorPassage",
    text: "A: Already I have finished my report!\nB: Wow, that was fast. How long you have known about this deadline?\nA: Since Monday. I also just have called the client to confirm everything.\nB: Great. Did the team submit their sections yet?\nA: They didn't finish yet, actually — I'm still waiting on two people.",
    corrected: "A: I have already finished my report!\nB: Wow, that was fast. How long have you known about this deadline?\nA: Since Monday. I have also just called the client to confirm everything.\nB: Great. Did the team submit their sections yet?\nA: They haven't finished yet, actually — I'm still waiting on two people.",
    fixes: [
      "'Already I have finished' → 'I have already finished' ('already' goes between have and the past participle)",
      "'How long you have known' → 'How long have you known' (need 'have' before the subject in a question)",
      "'I also just have called' → 'I have also just called' ('just' goes between have/has and the past participle)",
      "'They didn't finish yet' → 'They haven't finished yet' ('yet' signals present perfect, not past simple)",
    ],
  },

  phrasal_verbs: {
    kind: "matching",
    pairs: [
      { term: "give up", definition: "To quit or stop doing something" },
      { term: "look after", definition: "To take care of someone or something" },
      { term: "put up with", definition: "To tolerate something annoying" },
      { term: "run into", definition: "To meet someone by chance" },
      { term: "get over", definition: "To recover from something" },
      { term: "come up with", definition: "To think of an idea or plan" },
      { term: "carry out", definition: "To perform or complete a task" },
    ],
  },

  so_neither: {
    kind: "matching",
    pairs: [
      { term: "I love pizza.", definition: "So do I." },
      { term: "I don't like horror films.", definition: "Neither do I." },
      { term: "They've finished.", definition: "So have we." },
      { term: "He can't swim.", definition: "Neither can I." },
      { term: "I was confused.", definition: "So was he." },
      { term: "She doesn't smoke.", definition: "Neither does he." },
    ],
  },

  prefer_rather: {
    kind: "errorPassage",
    text: "A: What do you want to do tonight?\nB: I'd rather to stay home, honestly. I'd prefer watch a film tonight.\nA: Really? I'd prefer going out than staying in.\nB: Well, I'd rather you don't tell everyone I'm boring!",
    corrected: "A: What do you want to do tonight?\nB: I'd rather stay home, honestly. I'd prefer to watch a film tonight.\nA: Really? I'd prefer going out to staying in.\nB: Well, I'd rather you didn't tell everyone I'm boring!",
    fixes: [
      "'I'd rather to stay home' → 'I'd rather stay home' (no 'to' after 'would rather')",
      "'I'd prefer watch a film' → 'I'd prefer to watch a film' ('prefer' needs 'to' before the infinitive)",
      "'I'd prefer going out than staying in' → 'I'd prefer going out to staying in' ('prefer X to Y', not 'than')",
      "'I'd rather you don't tell' → 'I'd rather you didn't tell' (past simple after 'would rather + subject' for a present request)",
    ],
  },

  passive_simple: {
    kind: "paragraphCloze",
    segments: [
      "The Eiffel Tower ", { blank: "was built", base: "build" }, " in 1889 and ", { blank: "was designed", base: "design" },
      " by Gustave Eiffel. Today, it ", { blank: "is visited", base: "visit" }, " by millions of tourists every year. Tickets ",
      { blank: "are sold", base: "sell" }, " both online and at the entrance, and the tower ", { blank: "is lit", base: "light" },
      " up every evening. Next year, a new elevator ", { blank: "will be installed", base: "install" },
      ", and the results of the project ", { blank: "will be announced", base: "announce" }, " in the spring.",
    ],
  },

  get_used_to: {
    kind: "errorPassage",
    text: "When I was younger, I use to be very shy, and I didn't use to liked meeting new people. I remember my sister asking me, 'Did you used to have many friends at school?' The truth is, we used to living in a small town, so I didn't meet many people. Now that I'm an adult, I am used to talk to strangers, and it feels completely normal.",
    corrected: "When I was younger, I used to be very shy, and I didn't use to like meeting new people. I remember my sister asking me, 'Did you use to have many friends at school?' The truth is, we used to live in a small town, so I didn't meet many people. Now that I'm an adult, I am used to talking to strangers, and it feels completely normal.",
    fixes: [
      "'I use to be very shy' → 'I used to be very shy' ('used to' needs -d in positive statements)",
      "'I didn't use to liked meeting' → 'I didn't use to like meeting' ('didn't use to' + bare infinitive)",
      "'Did you used to have' → 'Did you use to have' (no -d after 'did')",
      "'we used to living in a small town' → 'we used to live in a small town' ('used to' + bare infinitive, not -ing)",
      "'I am used to talk to strangers' → 'I am used to talking to strangers' ('be used to' + gerund)",
    ],
  },

  reported_speech: {
    kind: "scenario",
    prompts: [
      { situation: "Your friend said to you: “I am tired.”", instruction: "Report what she said, using reported speech.", sample: "She said she was tired." },
      { situation: "Your colleague said: “I will call you tomorrow.”", instruction: "Report what he said.", sample: "He said he would call me the next day." },
      { situation: "Your friend asked you: “Where do you live?”", instruction: "Report the question, using reported speech.", sample: "She asked me where I lived." },
      { situation: "Your teacher said to the class: “Open your books.”", instruction: "Report the instruction.", sample: "The teacher told us to open our books." },
      { situation: "Your friend said: “I have never been to Japan.”", instruction: "Report what she said.", sample: "She said she had never been to Japan." },
    ],
  },

  indefinite_pronouns: {
    kind: "errorPassage",
    text: "I looked around the office and there was anyone there — I think it was Tom working late. Nobody doesn't want to leave before finishing a project. I couldn't find my badge nowhere near my desk, and I didn't want nothing from the vending machine. Whoever call the office tonight, tell them I've already left.",
    corrected: "I looked around the office and there was someone there — I think it was Tom working late. Nobody wants to leave before finishing a project. I couldn't find my badge anywhere near my desk, and I didn't want anything from the vending machine. Whoever calls the office tonight, tell them I've already left.",
    fixes: [
      "'there was anyone there' → 'there was someone there' ('anyone' is for questions/negatives, not positive statements)",
      "'Nobody doesn't want to leave' → 'Nobody wants to leave' (no double negative)",
      "'I couldn't find my badge nowhere' → 'I couldn't find my badge anywhere' ('anywhere' with a negative verb, not 'nowhere')",
      "'I didn't want nothing' → 'I didn't want anything' (avoid double negatives)",
      "'Whoever call the office' → 'Whoever calls the office' ('whoever' takes a singular verb)",
    ],
  },

  relative_clauses: {
    kind: "matching",
    pairs: [
      { term: "who", definition: "for people: The woman who called is my sister." },
      { term: "which / that", definition: "for things: The car that I bought broke down." },
      { term: "whose", definition: "for possession: The student whose bag was stolen reported it." },
      { term: "where", definition: "for places: This is the café where we met." },
      { term: "when", definition: "for time: 2005 was the year when everything changed." },
      { term: "why", definition: "for a reason: The reason why she left is unclear." },
    ],
  },

  adverbs: {
    kind: "errorPassage",
    text: "My sister is a carefully driver, but yesterday she drove a bit careless in the rain. She looked happily when she arrived, and she sang beautiful in the car the whole way. Honestly, she did good on her driving test — this soup I made tastes wonderfully too, by the way!",
    corrected: "My sister is a careful driver, but yesterday she drove a bit carelessly in the rain. She looked happy when she arrived, and she sang beautifully in the car the whole way. Honestly, she did well on her driving test — this soup I made tastes wonderful too, by the way!",
    fixes: [
      "'a carefully driver' → 'a careful driver' (adjectives, not adverbs, describe nouns)",
      "'drove a bit careless' → 'drove a bit carelessly' (adverbs, not adjectives, describe verbs)",
      "'looked happily' → 'looked happy' ('look' is a linking verb — use an adjective)",
      "'sang beautiful' → 'sang beautifully' (adverbs modify verbs)",
      "'did good on her driving test' → 'did well on her driving test' ('well' is the adverb form of 'good')",
      "'tastes wonderfully' → 'tastes wonderful' (adjective after sense verbs, not adverb)",
    ],
  },

  intensifiers_so_such_enough: { kind: "unscramble" },

  double_comparatives: { kind: "unscramble" },

  second_conditional: {
    kind: "scenario",
    prompts: [
      { situation: "Someone asks what you would do if you won the lottery.", instruction: "Answer using the second conditional.", sample: "If I won the lottery, I would travel the world." },
      { situation: "A friend can't decide what to do and asks for your advice.", instruction: "Give advice, using 'if I were you'.", sample: "If I were you, I would apologise." },
      { situation: "Someone asks what you'd do if you could live anywhere in the world.", instruction: "Answer using the second conditional.", sample: "If I could live anywhere, I would live by the sea." },
      { situation: "A friend asks what would happen if you lost your phone right now.", instruction: "Answer using the second conditional.", sample: "If I lost my phone, I would panic." },
      { situation: "Someone asks you to imagine having no work or school tomorrow.", instruction: "Say what you would do, using the second conditional.", sample: "If I had no work tomorrow, I would sleep all day." },
    ],
  },

  modal_verbs: {
    kind: "scenario",
    prompts: [
      { situation: "You want to ask your teacher, very politely, if you can leave the room.", instruction: "Ask permission, using 'may'.", sample: "May I leave the room?" },
      { situation: "A friend has had a bad cough for two weeks.", instruction: "Give advice, using 'should'.", sample: "You should see a doctor." },
      { situation: "Your friend is about to miss their train if they don't hurry.", instruction: "Warn them, using 'had better'.", sample: "You had better hurry up." },
      { situation: "Someone asks if you can speak any other languages.", instruction: "Answer using 'can' for present ability.", sample: "I can speak a little French." },
      { situation: "Someone asks about a specific achievement — running a marathon after months of training.", instruction: "Answer using 'was able to' for one specific past achievement.", sample: "After months of training, I was able to run a marathon." },
    ],
  },

  past_continuous: {
    kind: "paragraphCloze",
    segments: [
      "Yesterday at 8pm, I ", { blank: "was cooking", base: "cook" }, " dinner when the phone ", { blank: "rang", base: "ring" },
      ". While I ", { blank: "was talking", base: "talk" }, " on the phone, my sister ", { blank: "was watching", base: "watch" },
      " TV in the next room. Outside, the sun ", { blank: "was shining", base: "shine" }, " and the birds ",
      { blank: "were singing", base: "sing" }, ". Suddenly, someone ", { blank: "knocked", base: "knock" },
      " on the door. I ", { blank: "wasn't expecting", base: "not expect" }, " any visitors, so I was a bit surprised.",
    ],
  },

  past_perfect: {
    kind: "paragraphCloze",
    segments: [
      "Before that day, I ", { blank: "had never been", base: "never / be" }, " late for a train. By the time I arrived at the station, though, the train ",
      { blank: "had already left", base: "already / leave" }, ". I was upset because I ", { blank: "had planned", base: "plan" },
      " the trip for weeks. It turned out my friend ", { blank: "had forgotten", base: "forget" },
      " to tell me about the schedule change — she ", { blank: "had just texted", base: "just / text" },
      " me the new time, but I hadn't checked my phone. By the time I finally got home, I ", { blank: "had missed", base: "miss" },
      " the whole event.",
    ],
  },

  question_tags: {
    kind: "matching",
    pairs: [
      { term: "She's a doctor,", definition: "isn't she?" },
      { term: "You don't like coffee,", definition: "do you?" },
      { term: "I'm right,", definition: "aren't I?" },
      { term: "Let's have a break,", definition: "shall we?" },
      { term: "Close the door,", definition: "will you?" },
      { term: "You have a car,", definition: "don't you?" },
      { term: "She never smiles,", definition: "does she?" },
    ],
  },

  ed_ing_adjectives: {
    kind: "scenario",
    prompts: [
      { situation: "A meeting went on for two hours with nothing interesting happening.", instruction: "Describe how you felt, using an -ed adjective.", sample: "I was so bored." },
      { situation: "You want to describe that same meeting itself, not how you felt.", instruction: "Describe the meeting, using an -ing adjective.", sample: "The meeting was so boring." },
      { situation: "You just found out you passed a difficult exam.", instruction: "Describe how you feel, using an -ed adjective.", sample: "I'm so excited!" },
      { situation: "Someone asks about a film that had a very complicated, hard-to-follow plot.", instruction: "Describe the film, using an -ing adjective.", sample: "The film was really confusing." },
      { situation: "You just watched a magic show with tricks you couldn't explain.", instruction: "Describe how you felt, using an -ed adjective.", sample: "We were amazed." },
    ],
  },

  future_continuous: {
    kind: "paragraphCloze",
    segments: [
      "This time tomorrow, I ", { blank: "will be flying", base: "fly" }, " to Rome for a work conference. At 8pm, my colleagues and I ",
      { blank: "will be having", base: "have" }, " dinner at a restaurant near the hotel. I can't take your call at 3pm — I ",
      { blank: "will be presenting", base: "present" }, " to a room full of clients then. Don't wait up for me on Friday night either, because I ",
      { blank: "will be working", base: "work" }, " late on the final report. What ", { blank: "will you be doing", base: "do" },
      " this time next week?",
    ],
  },

  giving_opinions: {
    kind: "scenario",
    prompts: [
      { situation: "Someone asks your opinion on whether social media is good or bad for society.", instruction: "Give your opinion, using a fixed opinion-opener.", sample: "In my opinion, social media has both positive and negative effects." },
      { situation: "You want to give a cautious, softened opinion about working from home.", instruction: "Give your opinion, using a softened phrase.", sample: "I tend to think that working from home is more productive." },
      { situation: "You feel very strongly that every child deserves a good education.", instruction: "Give a strong, confident opinion.", sample: "I strongly believe that every child deserves a good education." },
      { situation: "Someone asks: “Do you think homework is useless?”", instruction: "Answer with your own opinion.", sample: "If you ask me, homework does have some value, but not too much of it." },
      { situation: "You want to ask a classmate for their opinion about banning phones in schools.", instruction: "Ask them, using 'do you think that'.", sample: "Do you think that phones should be banned in schools?" },
    ],
  },

  asking_for_clarification: {
    kind: "scenario",
    prompts: [
      { situation: "Someone speaks too quickly and you didn't catch what they said.", instruction: "Ask them to repeat it.", sample: "Sorry, could you repeat that, please?" },
      { situation: "A colleague uses the phrase 'flexible working hours' and you're not sure exactly what it means.", instruction: "Ask them to explain.", sample: "What do you mean by 'flexible working hours'?" },
      { situation: "Someone gives you complicated instructions and you want to check you understood before they continue.", instruction: "Confirm what you think they meant.", sample: "Just to clarify, are we meeting at nine or ten?" },
      { situation: "You didn't hear a name properly and need it spelled out.", instruction: "Ask them to spell it.", sample: "Could you spell that for me? I've never heard that surname before." },
      { situation: "Someone explains something quickly and you lost track partway through.", instruction: "Ask them to slow down or clarify.", sample: "I'm not sure I follow — could you go back to your first point?" },
    ],
  },

  agreeing_disagreeing: {
    kind: "matching",
    pairs: [
      { term: "I couldn't agree more", definition: "Strong agreement" },
      { term: "I'm afraid I disagree", definition: "Polite disagreement" },
      { term: "To some extent I agree, but...", definition: "Partial agreement" },
      { term: "Fair enough", definition: "Casual acceptance" },
      { term: "I beg to differ", definition: "Firm disagreement" },
      { term: "There's no doubt about it", definition: "Strong certainty" },
      { term: "I can't deny that...", definition: "Reluctant agreement" },
    ],
  },

  describing_locations: {
    kind: "matching",
    pairs: [
      { term: "situated in", definition: "Located in a particular area" },
      { term: "surrounded by", definition: "With something all around it" },
      { term: "within walking distance of", definition: "Close enough to walk to" },
      { term: "home to", definition: "The place where something or someone is based" },
      { term: "on the outskirts of", definition: "At the edge of a town or city" },
      { term: "off the beaten track", definition: "Not well known or visited by tourists" },
      { term: "up-and-coming", definition: "Becoming more popular or successful" },
    ],
  },

  common_idioms: {
    kind: "matching",
    pairs: [
      { term: "a piece of cake", definition: "Very easy" },
      { term: "under the weather", definition: "Slightly ill" },
      { term: "cost an arm and a leg", definition: "Very expensive" },
      { term: "once in a blue moon", definition: "Very rarely" },
      { term: "break the ice", definition: "Ease tension in a new or awkward situation" },
      { term: "spill the beans", definition: "Reveal a secret" },
      { term: "bite the bullet", definition: "Face something difficult or unpleasant" },
      { term: "hit the nail on the head", definition: "Describe something exactly right" },
    ],
  },

  working_from_home: {
    kind: "errorPassage",
    text: "I am agree that working from home saves time. How productive you are depends of your self-discipline, honestly. Actually, I work from home three days a week — my manager is remote worker who trusts the team completely. I have bought a new desk last week, and if you will set clear boundaries, you'll feel less stressed too.",
    corrected: "I agree that working from home saves time. How productive you are depends on your self-discipline, honestly. Currently, I work from home three days a week — my manager is a remote worker who trusts the team completely. I bought a new desk last week, and if you set clear boundaries, you'll feel less stressed too.",
    fixes: [
      "'I am agree' → 'I agree' ('agree' is a verb, no 'am')",
      "'depends of your self-discipline' → 'depends on your self-discipline' ('depend on', not 'depend of')",
      "'Actually, I work from home' → 'Currently, I work from home' ('actually' means 'in fact', not 'currently')",
      "'is remote worker' → 'is a remote worker' (article needed before a job noun)",
      "'I have bought a new desk last week' → 'I bought a new desk last week' (specific past time → past simple)",
      "'if you will set clear boundaries' → 'if you set clear boundaries' (no 'will' in the if-clause)",
    ],
  },

  learning_language: {
    kind: "errorPassage",
    text: "I assisted to an English class every week last year. I am beginner, so I try not to be afraid to make questions in class. I improve my listening by listening music every day. I have started learning English when I was eight, and if you will practise every day, you'll improve faster.",
    corrected: "I attended an English class every week last year. I am a beginner, so I try not to be afraid to ask questions in class. I improve my listening by listening to music every day. I started learning English when I was eight, and if you practise every day, you'll improve faster.",
    fixes: [
      "'I assisted to an English class' → 'I attended an English class' ('assist' means to help; 'attend' means to go to')",
      "'I am beginner' → 'I am a beginner' (article needed before a role/level noun)",
      "'make questions in class' → 'ask questions in class' (English 'asks' a question, never 'makes' one)",
      "'listening music' → 'listening to music' ('listen to' + thing)",
      "'I have started learning English when I was eight' → 'I started learning English when I was eight' (specific past time point → past simple)",
      "'if you will practise every day' → 'if you practise every day' (no 'will' in the if-clause)",
    ],
  },

  career_choices: {
    kind: "errorPassage",
    text: "I am agree that soft skills are important in any job. Your success depends of how hard you work, in my experience. Unfortunately, I couldn't assist the job interview last week because I was sick. My brother is engineer at a tech company, and I have started my new job last Monday — if you will update your CV, you'll have a better chance next time.",
    corrected: "I agree that soft skills are important in any job. Your success depends on how hard you work, in my experience. Unfortunately, I couldn't attend the job interview last week because I was sick. My brother is an engineer at a tech company, and I started my new job last Monday — if you update your CV, you'll have a better chance next time.",
    fixes: [
      "'I am agree' → 'I agree' ('agree' is a verb, no 'am')",
      "'depends of how hard you work' → 'depends on how hard you work' ('depend on', not 'depend of')",
      "'I couldn't assist the job interview' → 'I couldn't attend the job interview' ('assist' means to help; 'attend' means to go to')",
      "'My brother is engineer' → 'My brother is an engineer' (article needed before a profession)",
      "'I have started my new job last Monday' → 'I started my new job last Monday' (specific past time → past simple)",
      "'if you will update your CV' → 'if you update your CV' (no 'will' in the if-clause)",
    ],
  },

  time_management: {
    kind: "scenario",
    prompts: [
      { situation: "A friend keeps missing deadlines and asks for advice.", instruction: "Give advice using time-management vocabulary.", sample: "You should prioritise your tasks and set a deadline for each one." },
      { situation: "Someone asks how you avoid procrastinating.", instruction: "Answer, using 'avoid' + gerund.", sample: "I avoid checking my phone every five minutes." },
      { situation: "A colleague is overwhelmed with too many tasks and needs to share the workload.", instruction: "Suggest what they should do.", sample: "You should delegate some of your tasks to the team." },
      { situation: "Someone asks what happens if you make a to-do list every morning.", instruction: "Answer using the first conditional.", sample: "If you make a to-do list every morning, you'll get more done." },
      { situation: "A friend wants to relax properly after work but can't stop checking emails.", instruction: "Give advice using 'switch off'.", sample: "You need to switch off after work — try leaving your phone in another room." },
    ],
  },

  free_time_hobbies: {
    kind: "matching",
    pairs: [
      { term: "unwind", definition: "To relax after a stressful day" },
      { term: "recharge", definition: "To restore your energy" },
      { term: "fulfilling", definition: "Giving a strong feeling of satisfaction" },
      { term: "take up a hobby", definition: "To start doing a new activity regularly" },
      { term: "passionate about", definition: "Having very strong enthusiasm for something" },
      { term: "acquire new skills", definition: "To learn abilities you didn't have before" },
    ],
  },

  social_media: {
    kind: "errorPassage",
    text: "Social media have changed how young people communicate with each other. The people is worried about fake news these days, and honestly, I am agree that misinformation spreads too fast. Whether a post goes viral depends of the algorithm, not just the content. I have posted that photo yesterday, and if you will spend less time online, you'll feel happier.",
    corrected: "Social media has changed how young people communicate with each other. People are worried about fake news these days, and honestly, I agree that misinformation spreads too fast. Whether a post goes viral depends on the algorithm, not just the content. I posted that photo yesterday, and if you spend less time online, you'll feel happier.",
    fixes: [
      "'Social media have changed' → 'Social media has changed' ('social media' takes a singular verb)",
      "'The people is worried' → 'People are worried' ('people' is plural in English)",
      "'I am agree that' → 'I agree that' ('agree' is a verb, no 'am')",
      "'depends of the algorithm' → 'depends on the algorithm' ('depend on', not 'depend of')",
      "'I have posted that photo yesterday' → 'I posted that photo yesterday' (specific past time → past simple)",
      "'if you will spend less time online' → 'if you spend less time online' (no 'will' in the if-clause)",
    ],
  },

  reading: {
    kind: "scenario",
    prompts: [
      { situation: "A friend asks for a book recommendation and wants to know what it's about.", instruction: "Recommend a book, describing the genre and plot briefly.", sample: "I'd recommend this thriller — the plot is really gripping, and the protagonist is fascinating." },
      { situation: "Someone asks if you've ever read a particular classic novel.", instruction: "Answer using the present perfect.", sample: "Yes, I've read that novel three times." },
      { situation: "A friend asks what kind of books you're interested in.", instruction: "Answer using 'interested in'.", sample: "I'm interested in historical fiction and true crime." },
      { situation: "Someone asks what would happen if you joined a book club.", instruction: "Answer using the first conditional.", sample: "If I joined a book club, I'd meet new people who love reading too." },
      { situation: "A friend asks you to compare a book to its film adaptation.", instruction: "Compare them using a comparative.", sample: "The book is much more gripping than the film." },
    ],
  },

  city_vs_country: {
    kind: "paragraphCloze",
    segments: [
      "My city ", { blank: "has changed", base: "change" }, " a lot in recent years. Rent ", { blank: "has risen", base: "rise" },
      " sharply, and the city ", { blank: "has grown", base: "grow" }, " rapidly too. ", { blank: "The bigger", base: "the + comparative" },
      " the city gets, ", { blank: "the worse", base: "the + comparative" }, " the traffic gets. If more people ",
      { blank: "move", base: "move" }, " to the countryside instead, city rents ", { blank: "will fall", base: "fall" },
      ". Meanwhile, new housing ", { blank: "is built", base: "build" }, " by the council every year to try to keep up.",
    ],
  },

  travel_and_holidays: {
    kind: "scenario",
    prompts: [
      { situation: "A travel agent asks if you've ever been to South America.", instruction: "Answer using the present perfect.", sample: "No, I've never been to South America, but I'd love to go." },
      { situation: "Someone asks about your last holiday specifically.", instruction: "Answer using the past simple.", sample: "We went to Spain last summer." },
      { situation: "A friend asks what happens if you book your flights early.", instruction: "Answer using the first conditional.", sample: "If you book early, you'll save money." },
      { situation: "You're excited about an upcoming trip to see the pyramids.", instruction: "Say so, using 'look forward to'.", sample: "I'm looking forward to seeing the pyramids." },
      { situation: "Someone asks how your flight was arranged.", instruction: "Answer using the passive voice.", sample: "The whole trip was organized by a travel agency." },
    ],
  },

  dependent_prepositions: {
    kind: "matching",
    pairs: [
      { term: "interested", definition: "in: interested in photography" },
      { term: "good", definition: "at: good at chess" },
      { term: "afraid", definition: "of: afraid of the dark" },
      { term: "married", definition: "to: married to Anna" },
      { term: "depend", definition: "on: depend on the weather" },
      { term: "listen", definition: "to: listen to music" },
      { term: "believe", definition: "in: believe in ghosts" },
      { term: "complain", definition: "about: complain about the noise" },
    ],
  },

  articles: {
    kind: "errorPassage",
    text: "The dogs are loyal animals, and the money can't buy happiness — that's what my grandmother always said. She was teacher for thirty years at a school near an university. It took hour every day just for her to commute there. She always dreamed of visiting a United States one day, and she always said her school was a best in the whole region.",
    corrected: "Dogs are loyal animals, and money can't buy happiness — that's what my grandmother always said. She was a teacher for thirty years at a school near a university. It took an hour every day just for her to commute there. She always dreamed of visiting the United States one day, and she always said her school was the best in the whole region.",
    fixes: [
      "'The dogs are loyal animals' → 'Dogs are loyal animals' (a general statement needs no article)",
      "'the money can't buy happiness' → 'money can't buy happiness' (abstract noun used generally needs no article)",
      "'She was teacher' → 'She was a teacher' (never drop 'a/an' before a singular countable noun)",
      "'near an university' → 'near a university' ('university' starts with a consonant sound)",
      "'It took hour' → 'It took an hour' ('hour' starts with a vowel sound)",
      "'visiting a United States' → 'visiting the United States' (plural-form country names need 'the')",
      "'her school was a best' → 'her school was the best' (superlatives always need 'the')",
    ],
  },

  clauses_of_purpose: {
    kind: "errorPassage",
    text: "I went to the store for buy milk this morning. Later, I called the dentist's office to book an appointment — actually, I called for book a table at a restaurant too, for my parents' anniversary. This new blender is to blending smoothies quickly. I turned off my phone for not to be disturbed during the meeting, and my colleague whispered to no one would hear him, but everyone still heard.",
    corrected: "I went to the store to buy milk this morning. Later, I called the dentist's office to book an appointment — actually, I called to book a table at a restaurant too, for my parents' anniversary. This new blender is for blending smoothies quickly. I turned off my phone in order not to be disturbed during the meeting, and my colleague whispered so that no one would hear him, but everyone still heard.",
    fixes: [
      "'for buy milk' → 'to buy milk' (never 'for' + verb — use 'to' + verb)",
      "'for book a table' → 'to book a table' ('to' + verb for a specific action)",
      "'is to blending smoothies' → 'is for blending smoothies' (general function = 'for' + -ing)",
      "'for not to be disturbed' → 'in order not to be disturbed' (negative purpose = 'in order not to')",
      "'whispered to no one would hear him' → 'whispered so that no one would hear him' ('so that' when the subject changes)",
    ],
  },

  clauses_of_reason: {
    kind: "scenario",
    prompts: [
      { situation: "Someone asks why you were late to the meeting.", instruction: "Explain the reason, using 'because'.", sample: "I was late because I missed the bus." },
      { situation: "You need to explain a flight delay in a formal announcement.", instruction: "Explain it, using 'due to'.", sample: "The flight was delayed due to bad weather." },
      { situation: "Your friend is already at the café, so there's no need to explain why you're going there too.", instruction: "Say it, using 'as' or 'since' (a reason they already expect).", sample: "As you're already there, I'll join you." },
      { situation: "You want to explain that, taking the circumstances into account, everything actually went well.", instruction: "Say it, using 'considering'.", sample: "Considering the weather, the event went really well." },
      { situation: "A match got cancelled because of heavy rain.", instruction: "Explain the cancellation, using 'because of'.", sample: "The match was cancelled because of the heavy rain." },
    ],
  },

  clauses_of_contrast: {
    kind: "errorPassage",
    text: "Despite it was raining all day, we still went to the beach. In spite the crowds, we found a quiet spot. Despite of the cold water, my brother went swimming anyway. The weather forecast was terrible, however we had a great time. Although the trip was short, but it was one of the best days of the summer.",
    corrected: "Despite the rain all day, we still went to the beach. In spite of the crowds, we found a quiet spot. Despite the cold water, my brother went swimming anyway. The weather forecast was terrible. However, we had a great time. Although the trip was short, it was one of the best days of the summer.",
    fixes: [
      "'Despite it was raining' → 'Despite the rain' ('despite' + noun/gerund, never a clause)",
      "'In spite the crowds' → 'In spite of the crowds' ('in spite of' — never 'in spite' alone)",
      "'Despite of the cold water' → 'Despite the cold water' ('despite' never takes 'of')",
      "'...terrible, however we had a great time' → '...terrible. However, we had a great time.' ('however' starts a new sentence, not a comma splice)",
      "'Although the trip was short, but it was...' → 'Although the trip was short, it was...' (never combine 'although' with 'but')",
    ],
  },

  gerunds: {
    kind: "paragraphCloze",
    segments: [
      "", { blank: "Learning", base: "learn" }, " a new language takes time and patience. She left without ", { blank: "saying", base: "say" },
      " goodbye, and thanked us for ", { blank: "helping", base: "help" }, " with the move. By ", { blank: "practising", base: "practise" },
      " every day, she became fluent much faster. I'm really looking forward to ", { blank: "seeing", base: "see" },
      " everyone again next month. Honestly, there's no point in ", { blank: "worrying", base: "worry" },
      " about things you can't control, and it's no use ", { blank: "complaining", base: "complain" },
      " about the weather. ", { blank: "Not smoking", base: "not / smoke" }, " indoors is the rule at every one of our offices now.",
    ],
  },

  // --- A2/B1 gap-fills (topics added by other sessions after the original A1-B1 pass) ---

  quantifiers: {
    kind: "errorPassage",
    text: "There isn't many coffee left in the jar, so I need to buy some more. How much books did you borrow from the library this week? I don't have no time today to go shopping, but she spends a lot time every weekend browsing the shops anyway.",
    corrected: "There isn't much coffee left in the jar, so I need to buy some more. How many books did you borrow from the library this week? I don't have any time today to go shopping, but she spends a lot of time every weekend browsing the shops anyway.",
    fixes: [
      "'isn't many coffee' → 'isn't much coffee' ('coffee' is uncountable)",
      "'How much books' → 'How many books' ('books' is countable)",
      "'don't have no time' → 'don't have any time' (don't combine 'don't' and 'no')",
      "'spends a lot time' → 'spends a lot of time' ('a lot of' always needs 'of' before a noun)",
    ],
  },

  understanding_get: {
    kind: "matching",
    pairs: [
      { term: "get up", definition: "Leave your bed" },
      { term: "get on / off", definition: "Board or leave a bus, train, or plane" },
      { term: "get in / out of", definition: "Enter or leave a car" },
      { term: "get back", definition: "Return" },
      { term: "get together", definition: "Meet socially" },
      { term: "get into (trouble)", definition: "End up in a bad situation" },
    ],
  },

  money_and_shopping: {
    kind: "matching",
    pairs: [
      { term: "receipt", definition: "Proof of purchase, needed for a refund" },
      { term: "discount", definition: "A reduction in the usual price" },
      { term: "refund", definition: "Money given back after a return" },
      { term: "bargain", definition: "Something bought for a very good price" },
      { term: "budget", definition: "A plan for how much you can spend" },
      { term: "afford", definition: "To have enough money for something" },
      { term: "checkout", definition: "Where you pay for your shopping" },
      { term: "price tag", definition: "The label showing how much something costs" },
    ],
  },

  sport_and_fitness: {
    kind: "scenario",
    prompts: [
      { situation: "Someone asks if you've ever run a marathon.", instruction: "Answer using the present perfect.", sample: "I have never run a marathon, but I'd like to try one day." },
      { situation: "A friend asks what will happen if they train every day.", instruction: "Answer using the first conditional.", sample: "If you train every day, you will get fitter." },
      { situation: "Someone asks how the championship is organised each year.", instruction: "Answer using the passive voice.", sample: "The championship is held every year in a different city." },
      { situation: "Someone asks you to compare your fitness now to last year.", instruction: "Compare using a comparative.", sample: "I'm fitter than I was last year." },
      { situation: "A friend didn't warm up before a game and got hurt.", instruction: "Explain what happens if you don't warm up, using the first conditional.", sample: "If you don't warm up, you will injure yourself." },
    ],
  },

  relationships_and_socialising: {
    kind: "matching",
    pairs: [
      { term: "keep in touch", definition: "To stay in contact with someone" },
      { term: "lose touch", definition: "To stop being in contact with someone" },
      { term: "fall out", definition: "To have an argument and stop being friends for a while" },
      { term: "make up", definition: "To become friends again after an argument" },
      { term: "acquaintance", definition: "Someone you know a little, but not a close friend" },
      { term: "bond", definition: "A close connection between people" },
      { term: "reunion", definition: "A gathering of people who haven't seen each other for a while" },
    ],
  },

  // --- B2 ---

  passive_complex: {
    kind: "errorPassage",
    text: "A: What's happening with the investigation?\nB: The suspect are been questioned right now, actually. The evidence has been completing already, and the report must finished by tomorrow.\nA: Really? I heard the package might been delivered to the wrong address.\nB: That's possible — he is thought to stole some documents too.",
    corrected: "A: What's happening with the investigation?\nB: The suspect is being questioned right now, actually. The evidence has been completed already, and the report must be finished by tomorrow.\nA: Really? I heard the package might have been delivered to the wrong address.\nB: That's possible — he is thought to have stolen some documents too.",
    fixes: [
      "'are been questioned' → 'is being questioned' (present continuous passive: am/is/are + being)",
      "'has been completing' → 'has been completed' (past participle, not -ing)",
      "'must finished' → 'must be finished' (modal passive needs 'be')",
      "'might been delivered' → 'might have been delivered' (modal perfect passive needs 'have been')",
      "'is thought to stole' → 'is thought to have stolen' (perfect infinitive for past reference)",
    ],
  },

  causative_verbs: {
    kind: "errorPassage",
    text: "Our teacher made us that we had to finish our homework before the weekend. My mother didn't let that I went to the party on Friday, which was so unfair. I need to have my shoes repair before the trip, and I finally got the plumber fix the leak in the kitchen.",
    corrected: "Our teacher made us finish our homework before the weekend. My mother didn't let me go to the party on Friday, which was so unfair. I need to have my shoes repaired before the trip, and I finally got the plumber to fix the leak in the kitchen.",
    fixes: [
      "'made us that we had to finish' → 'made us finish' (no 'that + clause' after 'make')",
      "'didn't let that I went' → 'didn't let me go' (no 'that + clause' after 'let')",
      "'have my shoes repair' → 'have my shoes repaired' ('have' + object + past participle)",
      "'got the plumber fix' → 'got the plumber to fix' ('get' + person + to-infinitive)",
    ],
  },

  embedded_questions: {
    kind: "errorPassage",
    text: "A: Do you know where is the nearest bank?\nB: I'm not sure, actually. Could you tell me what does he want first?\nA: She asked me if was I ready to go.\nB: Could you explain me how does this work? I'm confused.",
    corrected: "A: Do you know where the nearest bank is?\nB: I'm not sure, actually. Could you tell me what he wants first?\nA: She asked me if I was ready to go.\nB: Could you explain how this works? I'm confused.",
    fixes: [
      "'where is the nearest bank' → 'where the nearest bank is' (no inversion)",
      "'what does he want' → 'what he wants' (no auxiliary inversion)",
      "'if was I ready' → 'if I was ready' (statement word order after 'if')",
      "'Could you explain me how does this work' → 'Could you explain how this works' (no inversion; 'explain' has no object here)",
    ],
  },

  future_in_past: {
    kind: "scenario",
    prompts: [
      { situation: "You had planned to go for a run, but it started raining just as you were about to leave.", instruction: "Describe your interrupted plan, using 'was going to'.", sample: "I was going to go for a run, but it started raining." },
      { situation: "You were right at the door, ready to leave the house, when the phone suddenly rang.", instruction: "Describe it, using 'was about to'.", sample: "I was about to leave the house when the phone rang." },
      { situation: "A friend told you last week she would call you back later that day.", instruction: "Report what she said, using reported speech.", sample: "She said she would call me back later." },
      { situation: "As a child, you never thought you'd end up living in another country — but you do now.", instruction: "Describe that surprise, using 'would'.", sample: "I never thought I would live abroad one day." },
      { situation: "You had big plans for the weekend, but everything changed at the last minute.", instruction: "Describe your original plan and what actually happened.", sample: "I was going to visit my parents, but I got sick instead." },
    ],
  },

  third_conditional: {
    kind: "scenario",
    prompts: [
      { situation: "You failed an exam because you didn't study.", instruction: "Say what would have happened if you had studied, using the third conditional.", sample: "If I had studied, I would have passed." },
      { situation: "A friend wasn't careful and had an accident.", instruction: "Say what would have happened if they'd been more careful.", sample: "If you had been more careful, the accident wouldn't have happened." },
      { situation: "The fire alarm went off just in time, and everyone escaped.", instruction: "Say what might not have happened without the alarm, using 'might not have'.", sample: "If the fire alarm hadn't gone off, we might not have escaped in time." },
      { situation: "A friend didn't tell you about a problem, so you couldn't help.", instruction: "Say what you could have done if they'd told you, using 'could have'.", sample: "If you had told me, I could have helped." },
      { situation: "Someone missed a great opportunity because they were too nervous to apply.", instruction: "Say what would have happened if they'd applied, using the third conditional.", sample: "If she had applied, she would have gotten the job." },
    ],
  },

  future_perfect: {
    kind: "paragraphCloze",
    segments: [
      "By June, she ", { blank: "will have finished", base: "finish" }, " the course. By the end of this year, I ",
      { blank: "will have saved", base: "save" }, " enough money for a new car. By the time the ceremony starts, they ",
      { blank: "will have arrived", base: "arrive" }, " already. By next month, the team ", { blank: "will have completed", base: "complete" },
      " the whole project, so we should celebrate. She's worried she ", { blank: "won't have finished", base: "not / finish" },
      " her thesis by the deadline.",
    ],
  },

  wish_if_only: {
    kind: "matching",
    pairs: [
      { term: "You don't have much free time.", definition: "I wish I had more free time." },
      { term: "You can't speak French.", definition: "If only I could speak French!" },
      { term: "Someone won't stop interrupting you.", definition: "I wish you would stop interrupting me." },
      { term: "You aren't tall.", definition: "If only I were taller!" },
      { term: "You didn't study hard enough for last week's exam.", definition: "I wish I had studied harder for the exam." },
      { term: "It keeps raining and you want it to stop.", definition: "I wish it would stop raining." },
    ],
  },

  gerunds_infinitives: {
    kind: "matching",
    pairs: [
      { term: "enjoy", definition: "+ gerund: I enjoy visiting new places." },
      { term: "decide", definition: "+ infinitive: She decided to leave her job." },
      { term: "suggest", definition: "+ gerund: He suggested taking a break." },
      { term: "manage", definition: "+ infinitive: We managed to meet the deadline." },
      { term: "remember + gerund", definition: "Recall a past action: I remember watching that film." },
      { term: "remember + infinitive", definition: "A future task not to forget: Remember to lock the door." },
      { term: "stop + gerund", definition: "Stop an activity: She stopped walking." },
      { term: "stop + infinitive", definition: "Pause to do something else: He stopped to buy a coffee." },
    ],
  },

  past_modals_deduction: {
    kind: "scenario",
    prompts: [
      { situation: "The lights in your friend's house are off and her car is gone.", instruction: "Make a confident guess about where she is, using 'must have'.", sample: "She must have left already." },
      { situation: "Your friend wasn't at the party, and you're not sure why.", instruction: "Make an uncertain guess, using 'might have'.", sample: "He might have forgotten about it." },
      { situation: "Someone claims to have known about a surprise party in advance, but they looked completely shocked when it happened.", instruction: "Say it's impossible, using 'can't have'.", sample: "She can't have known about the surprise — she looked so shocked." },
      { situation: "You failed an exam because you didn't study enough.", instruction: "Express regret, using 'should have'.", sample: "I should have studied harder." },
      { situation: "A friend drove dangerously fast and nearly crashed.", instruction: "Criticize their choice, using 'shouldn't have'.", sample: "You shouldn't have driven so fast." },
    ],
  },

  present_perfect_continuous: {
    kind: "paragraphCloze",
    segments: [
      "I ", { blank: "have been waiting", base: "wait" }, " here for over an hour, and I'm getting impatient. I ",
      { blank: "have known", base: "know" }, " my best friend for ten years now. He ", { blank: "has been working", base: "work" },
      " at that company since 2020. You look exhausted — ", { blank: "have you been running", base: "run" },
      "? My hands are covered in paint because I ", { blank: "have been painting", base: "paint" },
      " the fence all afternoon. ", { blank: "How long have you been learning", base: "how long / learn" }, " English?",
    ],
  },

  describing_trends_data: {
    kind: "paragraphCloze",
    segments: [
      "Last year, house prices ", { blank: "rose", base: "rise" }, " sharply, while the government ", { blank: "raised", base: "raise" },
      " taxes at the same time. Sales increased ", { blank: "by", base: "preposition" }, " 15% last quarter, and revenue grew ",
      { blank: "from", base: "preposition" }, " $2 million to $5 million. ", { blank: "There was a sharp rise", base: "noun-sentence: rise" },
      " in prices, and stock prices later plummeted after the scandal. According to the report, the survey ",
      { blank: "was conducted", base: "conduct" }, " among 1,000 people last month.",
    ],
  },

  workplace_professional_vocabulary: {
    kind: "matching",
    pairs: [
      { term: "hand in your notice", definition: "To formally tell your employer you're resigning" },
      { term: "meet a deadline", definition: "To finish something by the required time" },
      { term: "pay rise", definition: "An increase in your salary" },
      { term: "probation period", definition: "A trial period at the start of a new job" },
      { term: "sign off on something", definition: "To officially approve it" },
      { term: "burn the midnight oil", definition: "To work very late into the night" },
      { term: "pull your weight", definition: "To do your fair share of the work" },
    ],
  },

  advanced_idioms_expressions: {
    kind: "matching",
    pairs: [
      { term: "get the ball rolling", definition: "Start something" },
      { term: "back to the drawing board", definition: "Start over after a failure" },
      { term: "cut corners", definition: "Do something badly to save time or money" },
      { term: "on the same page", definition: "In agreement" },
      { term: "read between the lines", definition: "Understand an unstated meaning" },
      { term: "out of the blue", definition: "Unexpectedly" },
      { term: "the tip of the iceberg", definition: "A small part of a much bigger problem" },
      { term: "a blessing in disguise", definition: "Something that seemed bad but turned out good" },
    ],
  },

  persuading_disagreeing_advanced: {
    kind: "scenario",
    prompts: [
      { situation: "You want to present a formal argument that remote work has made teams more productive.", instruction: "Introduce your argument formally.", sample: "I'd argue that remote work has made teams more productive." },
      { situation: "You want to present both sides of a debate about a new policy.", instruction: "Weigh both sides using 'on the one hand... on the other hand'.", sample: "On the one hand, it saves money; on the other hand, it risks quality." },
      { situation: "A colleague makes a valid point, but you still think you should wait before deciding.", instruction: "Concede politely, then disagree.", sample: "That's a fair point, but it doesn't account for long-term costs." },
      { situation: "You strongly disagree with someone's data-based conclusion.", instruction: "Disagree formally, using 'I beg to differ'.", sample: "I beg to differ — the data suggests the opposite." },
      { situation: "After a long debate, you and a colleague still don't agree, and you want to end it politely.", instruction: "Suggest ending the disagreement peacefully.", sample: "Let's just agree to disagree on this one." },
    ],
  },

  prefixes_suffixes_adjectives: {
    kind: "errorPassage",
    text: "My little brother is very inmature for his age. Some of his jokes are honestly inrational and don't make sense. His behavior at school was borderline inlegal according to the teacher, which worried our parents. His graduation speech was supposed to be inspirationful, but it came out innovateful and confusing instead. Still, he's extremely persistful about improving, so I'm proud of him.",
    corrected: "My little brother is very immature for his age. Some of his jokes are honestly irrational and don't make sense. His behavior at school was borderline illegal according to the teacher, which worried our parents. His graduation speech was supposed to be inspirational, but it came out innovative and confusing instead. Still, he's extremely persistent about improving, so I'm proud of him.",
    fixes: [
      "'inmature' → 'immature' ('im-' before 'm')",
      "'inrational' → 'irrational' ('ir-' before 'r')",
      "'inlegal' → 'illegal' ('il-' before 'l')",
      "'inspirationful' → 'inspirational' ('-al', not '-ful')",
      "'innovateful' → 'innovative' ('-ive', not '-ful')",
      "'persistful' → 'persistent' ('-ent', not '-ful')",
    ],
  },

  education_systems: {
    kind: "errorPassage",
    text: "A: During the lecture, students made lots of questions about the new curriculum.\nB: Really? Your grade depends of how well you handle the material, right?\nA: Right. My mother is teacher at a primary school, actually, and she says students should avoid to fail at all costs.\nB: I have finished my degree in 2020 myself. Do you know does the university offer scholarships to new students?",
    corrected: "A: During the lecture, students asked lots of questions about the new curriculum.\nB: Really? Your grade depends on how well you handle the material, right?\nA: Right. My mother is a teacher at a primary school, actually, and she says students should avoid failing at all costs.\nB: I finished my degree in 2020 myself. Do you know if the university offers scholarships to new students?",
    fixes: [
      "'made lots of questions' → 'asked lots of questions' (English 'asks' a question, never 'makes' one)",
      "'depends of how well' → 'depends on how well' ('depend on', not 'depend of')",
      "'My mother is teacher' → 'My mother is a teacher' (article needed before a profession)",
      "'avoid to fail' → 'avoid failing' ('avoid' + gerund)",
      "'I have finished my degree in 2020' → 'I finished my degree in 2020' (specific past time → past simple)",
      "'Do you know does the university offer' → 'Do you know if the university offers' (statement word order, no second 'does')",
    ],
  },

  work_life_balance: {
    kind: "scenario",
    prompts: [
      { situation: "You've been working overtime every weekend and feel completely exhausted.", instruction: "Give advice to someone in the same situation, using 'should'.", sample: "You should take regular breaks to avoid burnout." },
      { situation: "A friend keeps checking work emails late at night and can never relax.", instruction: "Tell them what they need to do, using 'switch off'.", sample: "You need to switch off at the end of the day." },
      { situation: "Someone asks what would happen if companies offered more flexible hours.", instruction: "Answer using the second conditional.", sample: "If companies offered more flexibility, employees would feel less stressed." },
      { situation: "A colleague's manager never takes a lunch break and always seems stressed.", instruction: "Describe them, using a relative clause with 'who'.", sample: "Her manager, who never takes a lunch break, seems constantly stressed." },
      { situation: "You want to politely ask a colleague whether their company offers mental health support.", instruction: "Ask an indirect, polite question.", sample: "Do you know if your company offers mental health support?" },
    ],
  },

  success_motivation: {
    kind: "paragraphCloze",
    segments: [
      "She ", { blank: "has been working", base: "work" }, " toward her goal for two years now, and she ", { blank: "has stayed", base: "stay" },
      " motivated the whole time. Her role model ", { blank: "has achieved", base: "achieve" }, " so much already. If she ",
      { blank: "believed", base: "believe" }, " in herself more, she ", { blank: "would achieve", base: "achieve" },
      " even more. People who have a growth mindset embrace failure as a learning opportunity — do you know if you ",
      { blank: "believe", base: "believe" }, " in hard work over talent?",
    ],
  },

  cultural_differences: {
    kind: "matching",
    pairs: [
      { term: "culture shock", definition: "The confusion of adjusting to an unfamiliar culture" },
      { term: "body language", definition: "Communicating through gestures and posture instead of words" },
      { term: "etiquette", definition: "The accepted rules of polite behavior in a culture" },
      { term: "stereotype", definition: "An oversimplified, fixed idea about a whole group of people" },
      { term: "multicultural", definition: "Made up of many different cultures" },
      { term: "adapt to", definition: "To change your behavior to fit a new situation" },
    ],
  },

  climate_change: {
    kind: "scenario",
    prompts: [
      { situation: "Someone asks what would happen if governments invested more in renewable energy.", instruction: "Answer using the second conditional.", sample: "If governments invested more in renewable energy, emissions would fall." },
      { situation: "A friend asks why deforestation causes biodiversity loss, but doesn't want a lecture — just a quick, polite answer.", instruction: "Ask them back politely if they'd like to know why, using an embedded question.", sample: "Could you tell me why deforestation causes biodiversity loss? I've always wondered." },
      { situation: "Someone asks who is most responsible for greenhouse gas emissions.", instruction: "Give your opinion.", sample: "Factories are responsible for a large percentage of emissions, in my opinion." },
      { situation: "A friend says they never recycle and asks if it really matters.", instruction: "Explain why it matters, describing people who do using a relative clause.", sample: "People who recycle their waste help protect the environment." },
      { situation: "Someone asks what would happen if more people used public transport.", instruction: "Answer using the second conditional.", sample: "If people used public transport more, air quality would improve." },
    ],
  },

  technology_daily_life: {
    kind: "errorPassage",
    text: "Actually, most people use their phone for social media constantly these days. My phone battery lasts a large time, which is great. I have this laptop since five years, and it still works perfectly. Many people listen music while they commute to work. She has downloaded that app last week and loves it already. Do you know does this app track my location?",
    corrected: "Nowadays, most people use their phone for social media constantly these days. My phone battery lasts a long time, which is great. I have had this laptop for five years, and it still works perfectly. Many people listen to music while they commute to work. She downloaded that app last week and loves it already. Do you know if this app tracks my location?",
    fixes: [
      "'Actually, most people' → 'Nowadays, most people' ('actually' means 'in fact', not 'nowadays')",
      "'lasts a large time' → 'lasts a long time' ('large' = big in size; 'long' describes duration)",
      "'I have this laptop since five years' → 'I have had this laptop for five years' ('for' + duration, and 'have had' not 'have')",
      "'listen music' → 'listen to music' ('listen to' + thing)",
      "'has downloaded that app last week' → 'downloaded that app last week' (specific past time → past simple)",
      "'Do you know does this app track' → 'Do you know if this app tracks' (statement word order, no second 'does')",
    ],
  },

  money_and_economy: {
    kind: "paragraphCloze",
    segments: [
      "Prices ", { blank: "have been rising", base: "rise" }, " for months now, and the government ", { blank: "has been discussing", base: "discuss" },
      " new tax policies. Interest rates ", { blank: "have been raised", base: "raise" }, " several times this year already. If I ",
      { blank: "had", base: "have" }, " more money, I ", { blank: "would travel", base: "travel" },
      " more. The economist who works for the bank explains inflation clearly — do you know ",
      { blank: "what causes", base: "what / cause" }, " inflation exactly?",
    ],
  },

  crime_and_law: {
    kind: "scenario",
    prompts: [
      { situation: "The police have spent weeks working on a difficult case.", instruction: "Describe their ongoing effort, using the present perfect continuous.", sample: "The police have been investigating the crime for weeks." },
      { situation: "Someone asks what you'd do if you witnessed a crime.", instruction: "Answer using the second conditional.", sample: "If you witnessed a crime, you would call the police." },
      { situation: "You want to ask a lawyer, politely and indirectly, what the punishment for a crime usually is.", instruction: "Ask an embedded question.", sample: "Do you know what the punishment usually is for this kind of crime?" },
      { situation: "A man robbed a bank and escaped on foot before anyone could stop him.", instruction: "Describe him, using a relative clause with 'who'.", sample: "The man who robbed the bank escaped on foot." },
      { situation: "Someone asks what would happen if someone broke into your house.", instruction: "Answer using the second conditional.", sample: "If someone broke into my house, I would call the police immediately." },
    ],
  },

  arts_and_entertainment: {
    kind: "matching",
    pairs: [
      { term: "exhibition", definition: "A public display of art or objects" },
      { term: "masterpiece", definition: "An artist's greatest work" },
      { term: "box office", definition: "Where cinema/theatre tickets are sold, or a film's earnings" },
      { term: "soundtrack", definition: "The music that accompanies a film" },
      { term: "genre", definition: "A category of art, defined by style or subject" },
      { term: "blockbuster", definition: "A hugely popular and commercially successful film" },
    ],
  },

  // --- C1 ---

  passive_reporting_structures: {
    kind: "paragraphCloze",
    segments: [
      "", { blank: "It is said that", base: "impersonal reporting" }, " the company will merge with a rival. The area ",
      { blank: "is believed to contain", base: "believe / contain, present" }, " oil reserves, and he ",
      { blank: "is known to dislike", base: "know / dislike, present" }, " interviews. He ",
      { blank: "is believed to have fled", base: "believe / flee, past" }, " the country, and the suspect ",
      { blank: "is said to have confessed", base: "say / confess, past" }, ". Long ago, ",
      { blank: "it was said that", base: "impersonal reporting, past" }, " the castle was haunted.",
    ],
  },

  inversion: {
    kind: "errorPassage",
    text: "Never I have seen such a beautiful view in my life. Hardly had we arrived than the storm began, which ruined our plans completely. Little did he knew about the dangers of the mountain, so he wasn't prepared. So proud was them that they couldn't stop smiling all evening.",
    corrected: "Never have I seen such a beautiful view in my life. Hardly had we arrived when the storm began, which ruined our plans completely. Little did he know about the dangers of the mountain, so he wasn't prepared. So proud were they that they couldn't stop smiling all evening.",
    fixes: [
      "'Never I have seen' → 'Never have I seen' (invert auxiliary and subject)",
      "'Hardly had we arrived than' → 'Hardly had we arrived when' ('hardly had' pairs with 'when', not 'than')",
      "'Little did he knew' → 'Little did he know' (base verb after 'did', not past tense)",
      "'So proud was them' → 'So proud were they' (subject pronoun 'they', plural 'were')",
    ],
  },

  mixed_conditionals: {
    kind: "scenario",
    prompts: [
      { situation: "Someone chose a different career path years ago and now works in a completely different field.", instruction: "Say what would be true today if they'd made a different choice, using a mixed conditional.", sample: "If she had studied medicine, she would be a doctor today." },
      { situation: "A shy colleague never speaks up in meetings, and missed a chance to share a good idea last week.", instruction: "Say what would have happened if they weren't so shy, using a mixed conditional.", sample: "If he weren't so shy, he would have spoken up at the meeting." },
      { situation: "Someone took a scholarship years ago and it changed where they live now.", instruction: "Say what's true today because of that past decision.", sample: "If I had taken that scholarship, I would be studying in London now." },
      { situation: "A friend missed a flight, and as a result isn't with everyone now.", instruction: "Say what would be true now if they hadn't missed it.", sample: "If she hadn't missed that flight, she would be here with us now." },
      { situation: "Someone isn't a native speaker, and you think that's why they didn't get a certain job.", instruction: "Say what would have happened if they were a native speaker.", sample: "If she were a native speaker, she would have gotten that job." },
    ],
  },

  cleft_sentences: {
    kind: "matching",
    pairs: [
      { term: "Maria solved the problem, not James.", definition: "It was Maria who solved the problem, not James." },
      { term: "I really need a good night's sleep.", definition: "What I really need is a good night's sleep." },
      { term: "The company first launched the product in 2019.", definition: "It was in 2019 that the company first launched the product." },
      { term: "She wants a little appreciation.", definition: "All she wants is a little appreciation." },
      { term: "Her confidence surprised me most.", definition: "What surprised me most was how calm she stayed." },
      { term: "He just asked a simple question.", definition: "All he did was ask a simple question." },
    ],
  },

  advanced_vocabulary: {
    kind: "matching",
    pairs: [
      { term: "utilise", definition: "use" },
      { term: "postpone", definition: "put off" },
      { term: "ascertain", definition: "find out" },
      { term: "facilitate", definition: "help" },
      { term: "commence", definition: "start" },
      { term: "undergo", definition: "go through" },
      { term: "devise", definition: "come up with" },
      { term: "tolerate", definition: "put up with" },
    ],
  },

  business_professional_vocabulary: {
    kind: "scenario",
    prompts: [
      { situation: "You want to briefly reconnect with a colleague once the figures are ready next week.", instruction: "Suggest it, using 'touch base'.", sample: "Let's touch base next week once the figures are in." },
      { situation: "Your project needs someone to lead a new company initiative.", instruction: "Say who was chosen for the role, using 'spearhead'.", sample: "She was chosen to spearhead the new initiative." },
      { situation: "Your team's process is too slow and needs simplifying to cut costs.", instruction: "Say what needs to happen, using 'streamline'.", sample: "We need to streamline our processes to cut costs." },
      { situation: "A new project failed testing and the whole design needs to be redone.", instruction: "Describe the situation, using 'back to the drawing board'.", sample: "The design failed testing, so it's back to the drawing board." },
      { situation: "Your assistant is overloaded, so you decide to reduce her workload.", instruction: "Describe what you did, using 'take something off someone's plate'.", sample: "The manager took some tasks off her assistant's plate." },
    ],
  },

  memory_mind_psychology: {
    kind: "errorPassage",
    text: "The patient said she forget things all the time, which worried her family. Rarely someone forgets such an important memory, according to her doctor. If she seek help sooner, she would have recovered faster, in his opinion. This bias must addressed before it gets worse, he explained.",
    corrected: "The patient said she forgot things all the time, which worried her family. Rarely does someone forget such an important memory, according to her doctor. If she had sought help sooner, she would have recovered faster, in his opinion. This bias must be addressed before it gets worse, he explained.",
    fixes: [
      "'said she forget things' → 'said she forgot things' (reported speech backshifts the tense)",
      "'Rarely someone forgets' → 'Rarely does someone forget' (inversion needs 'does' before the subject)",
      "'If she seek help sooner' → 'If she had sought help sooner' (third conditional needs past perfect)",
      "'This bias must addressed' → 'This bias must be addressed' (modal passive needs 'be' + past participle)",
    ],
  },

  future_of_work: {
    kind: "scenario",
    prompts: [
      { situation: "A CEO recently announced that AI is transforming their industry.", instruction: "Report what the CEO said, using reported speech.", sample: "The CEO said that AI was transforming their industry." },
      { situation: "Someone claims that companies rarely adapt to change this quickly.", instruction: "Make the same point using inversion for dramatic emphasis.", sample: "Rarely does a company adapt this quickly." },
      { situation: "A colleague didn't upskill in time and lost their job to automation — now they're struggling to find work.", instruction: "Say what would have happened if they had upskilled sooner, using the third conditional.", sample: "If she had upskilled sooner, she would have found a new job faster." },
      { situation: "Someone lost their job years ago, and that's exactly why they're a freelancer today.", instruction: "Connect the past cause to the present result, using a mixed conditional.", sample: "If he hadn't lost his job years ago, he wouldn't be a freelancer today." },
      { situation: "You think job insecurity in the modern workplace is a serious problem that needs fixing.", instruction: "Say so, using a modal passive.", sample: "Job insecurity must be addressed." },
    ],
  },

  relationships_modern_life: {
    kind: "paragraphCloze",
    segments: [
      "James finally ", { blank: "admitted", base: "admit" }, " that he was not ready to commit. He said he ",
      { blank: "was", base: "be, backshifted" }, " not ready, and the couple promised they ", { blank: "would work", base: "will → would" },
      " through it together. ", { blank: "Rarely does", base: "inversion: rarely" },
      " a relationship survive such distance, but theirs did. If they ", { blank: "had communicated", base: "communicate, past perfect" },
      " better earlier on, they ", { blank: "would have avoided", base: "avoid, would have" }, " the whole breakup.",
    ],
  },

  crime_and_justice: {
    kind: "matching",
    pairs: [
      { term: "deterrence", definition: "Discouraging crime through the threat of punishment" },
      { term: "rehabilitation", definition: "Helping an offender build a better future, not just punishing them" },
      { term: "recidivism", definition: "The tendency to reoffend after punishment" },
      { term: "parole", definition: "Early release from prison under certain conditions" },
      { term: "clemency", definition: "Mercy or leniency shown by an authority" },
      { term: "due process", definition: "Fair legal treatment through the proper procedures" },
      { term: "restorative justice", definition: "A justice approach focused on repairing harm, not just punishing" },
      { term: "wrongful conviction", definition: "Being found guilty of a crime you didn't commit" },
    ],
  },

  health_healthcare_systems: {
    kind: "scenario",
    prompts: [
      { situation: "A doctor recently claimed that the healthcare system is failing rural patients.", instruction: "Report what the doctor said, using reported speech.", sample: "The doctor claimed that the system was failing rural patients." },
      { situation: "You think it's rare for a hospital to treat so many patients this efficiently.", instruction: "Say so, using inversion for emphasis.", sample: "Rarely does a hospital treat so many patients this efficiently." },
      { situation: "A patient's illness wasn't caught early enough, and they didn't survive.", instruction: "Say what would have happened if doctors had diagnosed it sooner, using the third conditional.", sample: "If the doctors had diagnosed the illness sooner, they would have saved his life." },
      { situation: "A country never reformed its healthcare system, and waiting times are still very long today.", instruction: "Connect that past inaction to the present result, using a mixed conditional.", sample: "If they had reformed the system years ago, waiting times wouldn't be so long today." },
      { situation: "You believe health inequality is a serious problem that needs to be fixed.", instruction: "Say so, using a modal passive.", sample: "Health inequality must be addressed." },
    ],
  },

  media_misinformation: {
    kind: "errorPassage",
    text: "Social media algorithms is designed to maximise engagement, which worries a lot of people. The platform have been criticised for spreading fake news lately. Not only the story was false, but it also went viral within hours. It is often the headlines which spread fastest, according to researchers.",
    corrected: "Social media algorithms are designed to maximise engagement, which worries a lot of people. The platform has been criticised for spreading fake news lately. Not only was the story false, but it also went viral within hours. It is often the headlines that spread fastest, according to researchers.",
    fixes: [
      "'algorithms is designed' → 'algorithms are designed' (plural subject)",
      "'The platform have been criticised' → 'The platform has been criticised' (singular subject 'platform')",
      "'Not only the story was false' → 'Not only was the story false' ('not only' triggers inversion)",
      "'headlines which spread fastest' → 'headlines that spread fastest' (it-clefts use 'that')",
    ],
  },
};

// A short, real sentence pool used only by "unscramble" topics — pulled live from data that
// already exists (a topic's own question answers, filtered to clean single sentences), never
// hand-authored. Deliberately conservative filtering: no embedded quotes/dialogue (rules out
// question-and-reply answers like "'What's your name?' 'I'm Ana.'"), no bracket placeholders
// (rules out free-answer items like "(free - e.g. ...)"), no "..." template fragments (rules out
// a fill-in-the-blank answer field like "The richer...the more" — half a sentence, not a whole
// one), a plain 3-9 word sentence.
function isCleanSentence(s: string): boolean {
  if (!s || s.includes("'") || s.includes("’") || s.includes('"') || s.includes("(") || s.includes("/") || s.includes("...")) return false;
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
