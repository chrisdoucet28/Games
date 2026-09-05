import { TOPIC_LIBRARY } from "./topics";
import { LESSONS } from "./lessons";

// Round-out exercise content for the Lesson Plans feature (see LessonPlanScreen.tsx) — the one
// deliberately-chosen extra practice format per topic that rounds out a ~30-minute PPP sequence,
// sitting right before the speaking wrap-up. Everything else in a lesson plan (Presentation,
// controlled practice, open production, speaking) is assembled live from lessons.ts/topics.ts —
// this file holds only the piece that can't be, plus a helper for the one format (Unscramble)
// that's generated at render time instead of hand-authored.
//
// Scope: A1 (all 25 topics) and A2 (all 29 topics) so far, extending level by level.
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
