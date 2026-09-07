import type { QuestionData } from "../types";

// Real-world reading/listening content for the Lesson Plans feature — original short passages
// written specifically for this slot, styled like an authentic text a student would actually
// encounter (a text-message thread, a diary entry, a notice, a letter...) rather than the
// grammar-drill prose used everywhere else on the site. Sits as its own step between Open
// Production and the Speaking Wrap-Up (see RealWorldReadingStep in LessonPlanScreen.tsx). Only
// topics with an entry here get the step — safe to build out gradually level by level;
// LessonPlanScreen simply skips it when a topic has none yet.
//
// Scope: ALL 5 levels now have text — A1 (25) + A2 (31) + B1 (43) + B2 (24) + C1 (12) = 135
// topics, full parity with TOPIC_OPTIONS. Audio is a separate, quota-gated step (see the
// per-entry audioUrl comment above) — A1/A2 are fully voiced; B1/B2/C1 need generating via
// scripts/generate-real-world-audio.ts as ElevenLabs quota allows, likely across several more
// account-cycles given B2/C1's length. Length/complexity guide: A1 40-70 words (present
// simple/simple past only, no subordinate clauses), A2 ~70-110 (past simple/continuous, first
// conditional, used to). B1-and-up deliberately jump to closer-to-authentic exam-passage length
// rather than a small step up from A2: B1 ~180-250 words, B2 ~280-380, C1 ~400-550 — increasing
// length, tense range, and abstraction per level.
export type RealWorldReading = {
  title: string;
  // One string per paragraph/message — never one giant block. LessonPlanScreen renders each as
  // its own line, so a text-message thread reads as separate messages, a diary entry as separate
  // sentences/paragraphs, etc.
  passage: string[];
  // MP3 files under public/audio/real-world/, generated via the ElevenLabs text-to-speech API
  // (see scripts/generate-real-world-audio.ts — a checked-in batch tool, not part of the shipped
  // app). Narrator voice alternates female/male by topic position for real variety across the
  // feature, except the two topics with an explicit named first-person narrator (present_simple =
  // Sofia, what_do_you_do = Carlos), which are locked to a gender-matched voice instead — see
  // LOCKED_VOICE in that script if regenerating. A reading with no audioUrl (e.g. once a new
  // level's text is authored but its audio hasn't been generated yet — a free-tier ElevenLabs
  // account only covers so many characters a month) simply skips the Reading/Listening mode
  // choice and shows the text directly, matching the "skip if no data" pattern used throughout —
  // re-running the script (any account with quota left) fills in whatever's still missing without
  // touching what's already there.
  audioUrl?: string;
  // 3 comprehension-check questions about the text's content (not the grammar point itself —
  // that's what Practice A/B/Production already cover). Same QuestionData shape/reveal-answer
  // convention as every other question slide.
  questions: QuestionData[];
};

export const REAL_WORLD_READINGS: Record<string, RealWorldReading> = {
  greetings_introductions: {
    title: "New at School",
    audioUrl: "/audio/real-world/greetings_introductions.mp3",
    passage: [
      "Hi! I'm Marta. I'm new here. Nice to meet you!",
      "Hi Marta! I'm Leo. Nice to meet you too. How are you?",
      "I'm fine, thanks! And you?",
      "I'm good, thanks. Welcome to the school!",
    ],
    questions: [
      { type: "reading comprehension", question: "What is the new student's name?", answer: "Marta." },
      { type: "reading comprehension", question: "Who says \"Welcome to the school\"?", answer: "Leo." },
      { type: "reading comprehension", question: "Is this Marta's first day, or has she been there a long time?", answer: "It's her first day — she's new." },
    ],
  },

  introducing_others: {
    title: "At the Party",
    audioUrl: "/audio/real-world/introducing_others.mp3",
    passage: [
      "Come in! This is my brother, Diego. He's a doctor.",
      "And this is his wife, Ana. She's a teacher.",
      "Their daughter, Sofia, is over there — she's only five years old!",
    ],
    questions: [
      { type: "reading comprehension", question: "Who is Diego?", answer: "The host's brother." },
      { type: "reading comprehension", question: "What is Ana's job?", answer: "She's a teacher." },
      { type: "reading comprehension", question: "How old is Sofia?", answer: "Five years old." },
    ],
  },

  days_dates_prepositions_time: {
    title: "This Week's Notice",
    audioUrl: "/audio/real-world/days_dates_prepositions_time.mp3",
    passage: [
      "English class is on Monday and Wednesday at six o'clock in the evening.",
      "The test is on Friday, 15th May, at nine o'clock in the morning.",
      "There is no class on public holidays.",
      "Please arrive ten minutes early, and bring a pen!",
    ],
    questions: [
      { type: "reading comprehension", question: "What days is English class?", answer: "Monday and Wednesday." },
      { type: "reading comprehension", question: "What time is the test?", answer: "Nine o'clock in the morning." },
      { type: "reading comprehension", question: "What date is the test?", answer: "Friday, 15th May." },
    ],
  },

  what_time_is_it: {
    title: "What Time Should We Meet?",
    audioUrl: "/audio/real-world/what_time_is_it.mp3",
    passage: [
      "What time is the film?",
      "It starts at half past seven.",
      "Great, let's have dinner first. What time should we meet?",
      "How about quarter past six, at the restaurant?",
      "Perfect. Then we can walk to the cinema together, at quarter past seven.",
    ],
    questions: [
      { type: "reading comprehension", question: "What time does the film start?", answer: "Half past seven." },
      { type: "reading comprehension", question: "What time will they meet for dinner?", answer: "Quarter past six." },
      { type: "reading comprehension", question: "Where will they meet first?", answer: "At the restaurant." },
    ],
  },

  weather_temperature_seasons: {
    title: "Weekend Weather",
    audioUrl: "/audio/real-world/weather_temperature_seasons.mp3",
    passage: [
      "Good morning! Today it is sunny and warm — perfect for the beach.",
      "Tomorrow it is going to be cloudy, and on Sunday it is rainy and cold.",
      "Take your umbrella!",
    ],
    questions: [
      { type: "reading comprehension", question: "What is the weather like today?", answer: "Sunny and warm." },
      { type: "reading comprehension", question: "What is the weather like on Sunday?", answer: "Rainy and cold." },
      { type: "reading comprehension", question: "What should you bring for Sunday?", answer: "An umbrella." },
    ],
  },

  daily_routines_frequency: {
    title: "My Diary",
    audioUrl: "/audio/real-world/daily_routines_frequency.mp3",
    passage: [
      "I always get up at seven o'clock.",
      "I usually have breakfast at home, but I never eat breakfast on Sundays.",
      "I go to work by bus, and I sometimes walk home in the evening.",
    ],
    questions: [
      { type: "reading comprehension", question: "What time does the writer get up?", answer: "Seven o'clock." },
      { type: "reading comprehension", question: "On which day do they never eat breakfast?", answer: "Sunday." },
      { type: "reading comprehension", question: "How do they go to work?", answer: "By bus." },
    ],
  },

  house_objects_rooms_there_is_are: {
    title: "Room for Rent",
    audioUrl: "/audio/real-world/house_objects_rooms_there_is_are.mp3",
    passage: [
      "Nice room in a shared flat! There is a big bed and a wardrobe in the bedroom.",
      "There isn't a private bathroom, but there are two bathrooms in the flat.",
      "There is a kitchen with a fridge and a table.",
    ],
    questions: [
      { type: "reading comprehension", question: "Is there a private bathroom?", answer: "No, there isn't." },
      { type: "reading comprehension", question: "How many bathrooms are in the flat?", answer: "Two." },
      { type: "reading comprehension", question: "What is in the kitchen?", answer: "A fridge and a table." },
    ],
  },

  possessive_adjectives_pronouns: {
    title: "Lost and Found",
    audioUrl: "/audio/real-world/possessive_adjectives_pronouns.mp3",
    passage: [
      "Is this your bag? I found it near the door.",
      "No, it isn't mine. Maybe it's Anna's — that blue one over there is hers, but this isn't the same colour.",
      "OK, whose bag is this, then?",
      "I don't know. Ask Tom — maybe it's his.",
    ],
    questions: [
      { type: "reading comprehension", question: "Where did the speaker find the bag?", answer: "Near the door." },
      { type: "reading comprehension", question: "What colour is Anna's bag?", answer: "Blue." },
      { type: "reading comprehension", question: "Whose bag do they think it might be?", answer: "Maybe Anna's, or Tom's." },
    ],
  },

  present_simple: {
    title: "About Sofia",
    audioUrl: "/audio/real-world/present_simple.mp3",
    passage: [
      "Hi, I'm Sofia! I live in Madrid and I work in a hospital.",
      "I don't drive to work — I take the metro.",
      "My sister lives in Madrid too, but she works in a school. We usually meet on Sundays.",
    ],
    questions: [
      { type: "reading comprehension", question: "Where does Sofia work?", answer: "In a hospital." },
      { type: "reading comprehension", question: "How does Sofia get to work?", answer: "By metro — she takes the metro." },
      { type: "reading comprehension", question: "When do Sofia and her sister usually meet?", answer: "On Sundays." },
    ],
  },

  auxiliary_verbs_be_do: {
    title: "Joining the Club",
    audioUrl: "/audio/real-world/auxiliary_verbs_be_do.mp3",
    passage: [
      "Are you a member of the sports club?",
      "Yes, I am! Do you want to join too?",
      "I don't know. Is it expensive?",
      "No, it isn't. Does it open on weekends?",
      "Yes, it does — every Saturday and Sunday.",
    ],
    questions: [
      { type: "reading comprehension", question: "Is the first speaker already a member?", answer: "Yes, they are." },
      { type: "reading comprehension", question: "Is the club expensive?", answer: "No, it isn't." },
      { type: "reading comprehension", question: "When is the club open?", answer: "Saturday and Sunday." },
    ],
  },

  can_cant: {
    title: "Can You Help?",
    audioUrl: "/audio/real-world/can_cant.mp3",
    passage: [
      "Can you swim?",
      "Yes, I can. I can also play tennis, but I can't ski.",
      "Really? My brother can ski very well, but he can't swim at all!",
      "Maybe he can teach me, and I can teach him!",
    ],
    questions: [
      { type: "reading comprehension", question: "Can the first speaker swim?", answer: "Yes." },
      { type: "reading comprehension", question: "What can't the first speaker do?", answer: "Ski." },
      { type: "reading comprehension", question: "What can't the brother do?", answer: "Swim." },
    ],
  },

  present_continuous_a1: {
    title: "What Is Everyone Doing?",
    audioUrl: "/audio/real-world/present_continuous_a1.mp3",
    passage: [
      "Where is everyone?",
      "Mum is cooking dinner in the kitchen. Dad is watching the news.",
      "My sister is doing her homework, and I am writing this message! What are you doing right now?",
    ],
    questions: [
      { type: "reading comprehension", question: "What is Mum doing?", answer: "Cooking dinner." },
      { type: "reading comprehension", question: "What is Dad doing?", answer: "Watching the news." },
      { type: "reading comprehension", question: "What is the writer doing?", answer: "Writing the message." },
    ],
  },

  likes_dislikes: {
    title: "My Profile",
    audioUrl: "/audio/real-world/likes_dislikes.mp3",
    passage: [
      "Hi! I love reading and I really enjoy cooking on weekends.",
      "I like playing football, but I don't like watching it on TV.",
      "I hate getting up early — my favourite day is Sunday, because I can sleep late!",
    ],
    questions: [
      { type: "reading comprehension", question: "What does the writer enjoy doing on weekends?", answer: "Cooking." },
      { type: "reading comprehension", question: "Do they like watching football on TV?", answer: "No, they don't." },
      { type: "reading comprehension", question: "Why is Sunday their favourite day?", answer: "Because they can sleep late." },
    ],
  },

  what_do_you_do: {
    title: "Meet the Team",
    audioUrl: "/audio/real-world/what_do_you_do.mp3",
    passage: [
      "Hi, I'm Carlos. I'm a chef, and I work in a restaurant in the city centre.",
      "This is Lucia — she's an engineer, and she works for a big company.",
      "Her brother is a pilot, and he works for an airline.",
    ],
    questions: [
      { type: "reading comprehension", question: "What is Carlos's job?", answer: "A chef." },
      { type: "reading comprehension", question: "Where does Carlos work?", answer: "In a restaurant in the city centre." },
      { type: "reading comprehension", question: "What is Lucia's brother's job?", answer: "A pilot." },
    ],
  },

  hobbies: {
    title: "Free Time Forum",
    audioUrl: "/audio/real-world/hobbies.mp3",
    passage: [
      "In my free time, I go swimming twice a week and I'm really into photography.",
      "My best friend loves painting and is interested in gardening too.",
      "On Saturdays, we sometimes go hiking together in the mountains.",
    ],
    questions: [
      { type: "reading comprehension", question: "What is the writer into?", answer: "Photography (and swimming)." },
      { type: "reading comprehension", question: "What is the friend interested in?", answer: "Painting and gardening." },
      { type: "reading comprehension", question: "What do they sometimes do together on Saturdays?", answer: "Go hiking." },
    ],
  },

  personality: {
    title: "My New Roommate",
    audioUrl: "/audio/real-world/personality.mp3",
    passage: [
      "What is your new roommate like?",
      "She's really kind and very patient. She's a bit shy at first, but she's also funny once you know her.",
      "Her brother is completely different — he's very outgoing and never stops talking!",
    ],
    questions: [
      { type: "reading comprehension", question: "Is the roommate shy or outgoing at first?", answer: "Shy." },
      { type: "reading comprehension", question: "Is the roommate funny?", answer: "Yes, once you know her." },
      { type: "reading comprehension", question: "What is the roommate's brother like?", answer: "Very outgoing — he talks a lot." },
    ],
  },

  feelings: {
    title: "Checking In",
    audioUrl: "/audio/real-world/feelings.mp3",
    passage: [
      "How are you feeling today?",
      "I'm a bit tired, but I'm happy because it's Friday! How about you?",
      "I'm feeling a little nervous — I have a big exam tomorrow.",
      "Don't worry, you'll be fine! I'm sure you feel ready.",
    ],
    questions: [
      { type: "reading comprehension", question: "Why is the first speaker happy?", answer: "Because it's Friday." },
      { type: "reading comprehension", question: "Why is the second speaker nervous?", answer: "Because of a big exam." },
      { type: "reading comprehension", question: "When is the exam?", answer: "Tomorrow." },
    ],
  },

  appearance: {
    title: "How Will I Know You?",
    audioUrl: "/audio/real-world/appearance.mp3",
    passage: [
      "How will I know you at the airport?",
      "I'm tall, with short black hair. I'll be wearing a blue jacket.",
      "OK! I'm short, and I have long brown hair and glasses.",
      "Great, see you there!",
    ],
    questions: [
      { type: "reading comprehension", question: "What colour is the first person's hair?", answer: "Black (short black hair)." },
      { type: "reading comprehension", question: "What is the first person wearing?", answer: "A blue jacket." },
      { type: "reading comprehension", question: "Does the second person wear glasses?", answer: "Yes." },
    ],
  },

  clothes: {
    title: "Packing for the Trip",
    audioUrl: "/audio/real-world/clothes.mp3",
    passage: [
      "What are you packing?",
      "I'm wearing my jeans and a jacket today, but I'm packing shorts and a swimsuit for the beach.",
      "I always wear sunglasses on holiday, and I never forget my pyjamas!",
    ],
    questions: [
      { type: "reading comprehension", question: "What is the writer wearing today?", answer: "Jeans and a jacket." },
      { type: "reading comprehension", question: "What are they packing for the beach?", answer: "Shorts and a swimsuit." },
      { type: "reading comprehension", question: "What do they always wear on holiday?", answer: "Sunglasses." },
    ],
  },

  there_is_are: {
    title: "My New Neighbourhood",
    audioUrl: "/audio/real-world/there_is_are.mp3",
    passage: [
      "There is a small park near my flat, and there are two cafés on my street.",
      "There isn't a supermarket close by, but there are three bus stops nearby.",
      "How many shops are there near your house?",
    ],
    questions: [
      { type: "reading comprehension", question: "What is near the flat?", answer: "A small park." },
      { type: "reading comprehension", question: "Is there a supermarket close by?", answer: "No, there isn't." },
      { type: "reading comprehension", question: "How many bus stops are nearby?", answer: "Three." },
    ],
  },

  family_members: {
    title: "A Letter Home",
    audioUrl: "/audio/real-world/family_members.mp3",
    passage: [
      "Dear Grandma, I miss you!",
      "My aunt and uncle visited us last week with my cousins.",
      "My uncle is my dad's brother, and my aunt is really funny. My little cousin is only two years old!",
    ],
    questions: [
      { type: "reading comprehension", question: "Whose brother is the uncle?", answer: "Dad's brother." },
      { type: "reading comprehension", question: "How old is the little cousin?", answer: "Two years old." },
      { type: "reading comprehension", question: "Who visited last week?", answer: "The aunt, uncle, and cousins." },
    ],
  },

  possessive_s: {
    title: "Whose Is This?",
    audioUrl: "/audio/real-world/possessive_s.mp3",
    passage: [
      "Is this Tom's bag?",
      "No, I think it's my sister's bag.",
      "And is that Anna's jacket on the chair?",
      "Yes, that's Anna's jacket. Careful — the children's toys are all over the floor too!",
    ],
    questions: [
      { type: "reading comprehension", question: "Whose bag is it?", answer: "The sister's bag." },
      { type: "reading comprehension", question: "Whose jacket is on the chair?", answer: "Anna's jacket." },
      { type: "reading comprehension", question: "What is all over the floor?", answer: "The children's toys." },
    ],
  },

  prepositions_place: {
    title: "Where's My Phone?",
    audioUrl: "/audio/real-world/prepositions_place.mp3",
    passage: [
      "Have you seen my phone?",
      "Is it on the table?",
      "No, it isn't.",
      "Look under the sofa, or maybe it's in your bag.",
      "Found it! It was between the sofa cushions the whole time!",
    ],
    questions: [
      { type: "reading comprehension", question: "Where did they first look?", answer: "On the table." },
      { type: "reading comprehension", question: "Where else did the friend suggest looking?", answer: "Under the sofa, or in the bag." },
      { type: "reading comprehension", question: "Where was the phone in the end?", answer: "Between the sofa cushions." },
    ],
  },

  basic_word_order: {
    title: "My Day",
    audioUrl: "/audio/real-world/basic_word_order.mp3",
    passage: [
      "I eat breakfast every morning.",
      "My mother makes coffee, and my brother reads the newspaper.",
      "After breakfast, I take the bus to school. I meet my friends at school every day.",
    ],
    questions: [
      { type: "reading comprehension", question: "Who makes the coffee?", answer: "The mother." },
      { type: "reading comprehension", question: "What does the brother read?", answer: "The newspaper." },
      { type: "reading comprehension", question: "How does the writer get to school?", answer: "By bus — takes the bus." },
    ],
  },

  giving_directions: {
    title: "How Do I Get There?",
    audioUrl: "/audio/real-world/giving_directions.mp3",
    passage: [
      "How do I get to the café?",
      "Go straight ahead, then turn left at the bank. It's on your right, next to the bookshop.",
      "Turn left at the bank, got it. Thanks!",
      "No problem — see you soon!",
    ],
    questions: [
      { type: "reading comprehension", question: "Where do you turn left?", answer: "At the bank." },
      { type: "reading comprehension", question: "Where is the café?", answer: "On the right, next to the bookshop." },
      { type: "reading comprehension", question: "What do you do before turning left?", answer: "Go straight ahead." },
    ],
  },

  // --- A2 ---

  past_simple: {
    title: "My Trip to the Mountains",
    audioUrl: "/audio/real-world/past_simple.mp3",
    passage: [
      "Last month, I visited the mountains with my two best friends. We arrived on Friday afternoon and checked into a small hotel near the lake.",
      "On Saturday, we walked for six hours and reached the top just before sunset — it was amazing! We didn't bring enough water, so we stopped at a small café on the way down.",
      "That evening, we cooked dinner together and told stories until midnight. We left on Sunday morning, tired but very happy.",
    ],
    questions: [
      { type: "reading comprehension", question: "Who did the narrator travel with?", answer: "Two best friends." },
      { type: "reading comprehension", question: "What happened because they didn't bring enough water?", answer: "They stopped at a café on the way down." },
      { type: "reading comprehension", question: "When did they leave?", answer: "Sunday morning." },
    ],
  },

  present_simple_vs_continuous: {
    title: "A Normal Week... Sort Of",
    audioUrl: "/audio/real-world/present_simple_vs_continuous.mp3",
    passage: [
      "Hi! How's it going?",
      "Good, thanks! I usually work from the office, but this week I'm working from home because of the building repairs.",
      "Oh really? What are you doing right now?",
      "I'm making coffee and checking emails. Normally I don't check emails this early, but today's different.",
      "Sounds busy! Do you still go to the gym every morning?",
      "Yes, I do — that hasn't changed!",
    ],
    questions: [
      { type: "reading comprehension", question: "Where does the writer usually work?", answer: "From the office." },
      { type: "reading comprehension", question: "Why are they working from home this week?", answer: "Because of the building repairs." },
      { type: "reading comprehension", question: "What are they doing right now?", answer: "Making coffee and checking emails." },
    ],
  },

  invitations: {
    title: "Are You Free This Weekend?",
    audioUrl: "/audio/real-world/invitations.mp3",
    passage: [
      "Hey everyone! Would you like to come to my birthday dinner on Saturday?",
      "I'd love to! What time should we arrive?",
      "Around seven. I'm afraid I can't make it — I'm visiting my parents that weekend.",
      "No worries! Maybe next time. Actually, why don't we celebrate again the following weekend?",
      "That's a great idea! I'm in.",
      "Me too — thanks for inviting us!",
    ],
    questions: [
      { type: "reading comprehension", question: "What is being celebrated?", answer: "A birthday dinner." },
      { type: "reading comprehension", question: "What time should guests arrive?", answer: "Around seven." },
      { type: "reading comprehension", question: "Why can't one person come on Saturday?", answer: "They're visiting their parents." },
    ],
  },

  telling_stories: {
    title: "The Day I Got Lost",
    audioUrl: "/audio/real-world/telling_stories.mp3",
    passage: [
      "One day, I was walking home from work when I decided to try a new shortcut through the park. At first, everything was fine, but then it started raining heavily.",
      "I didn't have an umbrella, so I ran to find shelter. Suddenly, I realised I had no idea where I was!",
      "Luckily, a kind stranger was walking her dog nearby, and she showed me the way home. In the end, I arrived soaked but laughing about the whole adventure.",
    ],
    questions: [
      { type: "reading comprehension", question: "What did the narrator decide to try?", answer: "A new shortcut through the park." },
      { type: "reading comprehension", question: "Why did they run?", answer: "Because it started raining heavily and they had no umbrella." },
      { type: "reading comprehension", question: "Who helped them find the way home?", answer: "A kind stranger walking her dog." },
    ],
  },

  irregular_verbs: {
    title: "A Busy Saturday",
    audioUrl: "/audio/real-world/irregular_verbs.mp3",
    passage: [
      "I woke up late and ate a big breakfast before I went shopping in town. I bought a new jacket and saw an old friend at the market — we hadn't met in years!",
      "Later, I drove to my parents' house and we had lunch together. I brought a cake I made myself, and everyone said it tasted delicious.",
      "By the time I got home, I felt completely exhausted, so I went straight to bed.",
    ],
    questions: [
      { type: "reading comprehension", question: "What did the narrator buy in town?", answer: "A new jacket." },
      { type: "reading comprehension", question: "Who did they see at the market?", answer: "An old friend." },
      { type: "reading comprehension", question: "What did they bring to their parents' house?", answer: "A cake they made themselves." },
    ],
  },

  future_will_going_to: {
    title: "Weekend Plans",
    audioUrl: "/audio/real-world/future_will_going_to.mp3",
    passage: [
      "What are you doing this weekend?",
      "I'm going to visit my cousin — we planned it last week. What about you?",
      "No plans yet. Actually, the phone's ringing — I'll answer it and call you back!",
      "OK, no rush.",
      "Sorry about that! Anyway, I think I'll just relax at home this weekend.",
      "Sounds perfect. I'll text you on Sunday.",
    ],
    questions: [
      { type: "reading comprehension", question: "What is the first speaker going to do this weekend?", answer: "Visit their cousin." },
      { type: "reading comprehension", question: "Why does the second speaker say \"I'll answer it\"?", answer: "Because the phone started ringing — a decision made in the moment." },
      { type: "reading comprehension", question: "When will they text again?", answer: "On Sunday." },
    ],
  },

  zero_conditional: {
    title: "Grandma's Kitchen Tips",
    audioUrl: "/audio/real-world/zero_conditional.mp3",
    passage: [
      "If you leave bread out of the fridge, it goes stale faster. If you add too much salt to soup, it tastes too strong — always add a little at a time.",
      "If you boil pasta for too long, it becomes soft and loses its shape. And if you forget to turn off the oven, the kitchen gets very hot!",
      "These are just a few things I've learned over the years in the kitchen.",
    ],
    questions: [
      { type: "reading comprehension", question: "What happens if you leave bread out of the fridge?", answer: "It goes stale faster." },
      { type: "reading comprehension", question: "What should you do if you're adding salt to soup?", answer: "Add a little at a time." },
      { type: "reading comprehension", question: "What happens if you boil pasta for too long?", answer: "It becomes soft and loses its shape." },
    ],
  },

  first_conditional: {
    title: "Planning the Picnic",
    audioUrl: "/audio/real-world/first_conditional.mp3",
    passage: [
      "Are we still going on the picnic tomorrow?",
      "If it doesn't rain, yes! But if the weather's bad, we'll go to the cinema instead.",
      "Good plan. If I finish work early, I'll bring some snacks too.",
      "Perfect. And if Maria comes, she'll bring her guitar — she always does!",
      "Great, I can't wait. I'll message you first thing in the morning to check the weather.",
    ],
    questions: [
      { type: "reading comprehension", question: "What will they do if the weather's bad?", answer: "Go to the cinema instead." },
      { type: "reading comprehension", question: "What will the speaker bring if they finish work early?", answer: "Snacks." },
      { type: "reading comprehension", question: "What will Maria bring if she comes?", answer: "Her guitar." },
    ],
  },

  used_to_past: {
    title: "Then and Now",
    audioUrl: "/audio/real-world/used_to_past.mp3",
    passage: [
      "What was your life like ten years ago?",
      "It was very different! I used to live in a small village, and I didn't use to have a car — I used to cycle everywhere. I used to work in a shop too, but now I work from home.",
      "Did you use to travel much back then?",
      "Not really. Now I travel all the time, which is a big change!",
    ],
    questions: [
      { type: "reading comprehension", question: "Where did the speaker use to live?", answer: "A small village." },
      { type: "reading comprehension", question: "How did they use to get around?", answer: "By bicycle — they used to cycle everywhere." },
      { type: "reading comprehension", question: "Did they use to travel much?", answer: "No, not really." },
    ],
  },

  present_continuous_a2: {
    title: "Living with My Sister",
    audioUrl: "/audio/real-world/present_continuous_a2.mp3",
    passage: [
      "Just a quick update — I'm staying with my sister this month while my flat is being repainted. It's a bit strange sharing a room again, but it's actually kind of fun!",
      "I'm working from her kitchen table since I don't have a proper desk here. I usually love my own space, but I'm really enjoying this temporary change.",
      "I'll move back home next week, once everything's finished.",
    ],
    questions: [
      { type: "reading comprehension", question: "Why is the writer staying with their sister?", answer: "Because their flat is being repainted." },
      { type: "reading comprehension", question: "Where are they working from?", answer: "Her kitchen table." },
      { type: "reading comprehension", question: "When will they move back home?", answer: "Next week, once everything's finished." },
    ],
  },

  making_questions: {
    title: "The Job Interview",
    audioUrl: "/audio/real-world/making_questions.mp3",
    passage: [
      "Thank you for coming in today. First, where do you currently work?",
      "I work at a small marketing agency downtown.",
      "Great. How long have you been there?",
      "About three years now.",
      "And why did you decide to apply for this position?",
      "I'm looking for a new challenge, and I really admire this company's work.",
      "Perfect. Do you have any questions for us?",
      "Yes — what does a typical day look like here?",
    ],
    questions: [
      { type: "reading comprehension", question: "Where does the candidate currently work?", answer: "A small marketing agency downtown." },
      { type: "reading comprehension", question: "How long have they worked there?", answer: "About three years." },
      { type: "reading comprehension", question: "What question does the candidate ask at the end?", answer: "What a typical day looks like there." },
    ],
  },

  present_perfect_vs_past_simple: {
    title: "Where I've Been",
    audioUrl: "/audio/real-world/present_perfect_vs_past_simple.mp3",
    passage: [
      "I've travelled to twelve countries so far, and I've always loved exploring new places. Last year, I went to Japan for two weeks — it was an incredible trip.",
      "I've never been to Australia yet, but it's on my list! I visited Italy back in 2019, and I've been wanting to return ever since.",
      "Have you ever travelled somewhere and immediately wanted to go back?",
    ],
    questions: [
      { type: "reading comprehension", question: "How many countries has the writer travelled to?", answer: "Twelve." },
      { type: "reading comprehension", question: "Where did they go last year?", answer: "Japan." },
      { type: "reading comprehension", question: "Have they ever been to Australia?", answer: "No, not yet." },
    ],
  },

  comparatives_superlatives: {
    title: "Choosing a Laptop",
    audioUrl: "/audio/real-world/comparatives_superlatives.mp3",
    passage: [
      "I compared three laptops before buying one. The first was cheaper than the second, but the second had a better screen.",
      "The third was the most expensive of the three, but also the fastest by far. In the end, I chose the second one — it wasn't the cheapest or the fastest, but it had the best balance of price and quality.",
      "So far, it's been the most reliable laptop I've ever owned!",
    ],
    questions: [
      { type: "reading comprehension", question: "Which laptop had the better screen?", answer: "The second one." },
      { type: "reading comprehension", question: "Which laptop was the most expensive?", answer: "The third one." },
      { type: "reading comprehension", question: "Which laptop did the writer choose?", answer: "The second one." },
    ],
  },

  comparatives: {
    title: "Two Job Offers",
    audioUrl: "/audio/real-world/comparatives.mp3",
    passage: [
      "I have two job offers and I don't know which to choose! The first job pays more money, but the second job is closer to my house and has shorter hours.",
      "The office for the first job is bigger and more modern, but the team for the second job seems friendlier.",
      "Honestly, the second job sounds less stressful overall. What would you choose?",
    ],
    questions: [
      { type: "reading comprehension", question: "Which job pays more money?", answer: "The first job." },
      { type: "reading comprehension", question: "Which job is closer to home?", answer: "The second job." },
      { type: "reading comprehension", question: "Which job seems friendlier, according to the writer?", answer: "The second job." },
    ],
  },

  superlatives: {
    title: "Visiting the City",
    audioUrl: "/audio/real-world/superlatives.mp3",
    passage: [
      "Welcome to our city! Here are a few highlights. The cathedral in the main square is the oldest building in the city, built over 800 years ago.",
      "Our central market is the busiest place in town, especially on weekends.",
      "If you're looking for the best view, climb the hill just north of the centre — it's the highest point around, and the sunsets there are unforgettable. Enjoy your visit!",
    ],
    questions: [
      { type: "reading comprehension", question: "What is the oldest building in the city?", answer: "The cathedral in the main square." },
      { type: "reading comprehension", question: "Where is the busiest place in town?", answer: "The central market." },
      { type: "reading comprehension", question: "Where can you find the best view?", answer: "The hill north of the centre — the highest point." },
    ],
  },

  daily_life_a2: {
    title: "A Typical Tuesday",
    audioUrl: "/audio/real-world/daily_life_a2.mp3",
    passage: [
      "My Tuesdays are always busy. I get up at half past six, have a quick breakfast, and leave the house by half past seven.",
      "I work until five, then I usually go to the gym before dinner. Tonight, though, I'm meeting a friend for coffee instead, so my routine's a little different.",
      "After that, I'll probably just relax and watch something before bed. Same time tomorrow, back to normal!",
    ],
    questions: [
      { type: "reading comprehension", question: "What time does the writer leave the house?", answer: "Half past seven." },
      { type: "reading comprehension", question: "What do they usually do before dinner?", answer: "Go to the gym." },
      { type: "reading comprehension", question: "What are they doing tonight instead?", answer: "Meeting a friend for coffee." },
    ],
  },

  school_and_study: {
    title: "Exam Week Notice",
    audioUrl: "/audio/real-world/school_and_study.mp3",
    passage: [
      "Dear students, exam week starts on Monday. You must bring your student ID to every exam, and you have to arrive at least fifteen minutes early.",
      "Mobile phones aren't allowed in the exam hall. If you miss an exam for a valid reason, you don't have to worry — just contact your teacher immediately to arrange a resit.",
      "Good luck to everyone, and remember to get plenty of sleep before each exam!",
    ],
    questions: [
      { type: "reading comprehension", question: "What must students bring to every exam?", answer: "Their student ID." },
      { type: "reading comprehension", question: "How early must students arrive?", answer: "At least fifteen minutes early." },
      { type: "reading comprehension", question: "What should you do if you miss an exam for a valid reason?", answer: "Contact your teacher immediately to arrange a resit." },
    ],
  },

  friends_and_family: {
    title: "Best Friends Since Childhood",
    audioUrl: "/audio/real-world/friends_and_family.mp3",
    passage: [
      "I've been friends with Elena since we were seven years old — that's over twenty years now! We met at school and just clicked immediately.",
      "Over the years, we've grown apart from some old friends, but we've always stayed close, even when she moved to another city.",
      "We keep in touch every week, and whenever we meet up, it feels like no time has passed at all. She's honestly like a sister to me.",
    ],
    questions: [
      { type: "reading comprehension", question: "How long have they been friends?", answer: "Since they were seven — over twenty years." },
      { type: "reading comprehension", question: "Where did they meet?", answer: "At school." },
      { type: "reading comprehension", question: "How often do they keep in touch?", answer: "Every week." },
    ],
  },

  free_time_a2: {
    title: "My Weekend Hobbies",
    audioUrl: "/audio/real-world/free_time_a2.mp3",
    passage: [
      "On weekends, I really enjoy going for long bike rides in the countryside. I also like reading, especially mystery novels — I'm currently halfway through a great one.",
      "My sister prefers painting to reading; she says it helps her relax after a busy week.",
      "We both enjoy cooking together on Sunday evenings, though. It's become a nice little tradition, and honestly, it's my favourite part of the weekend.",
    ],
    questions: [
      { type: "reading comprehension", question: "What does the writer enjoy doing on weekends?", answer: "Long bike rides, and reading." },
      { type: "reading comprehension", question: "What does the sister prefer to reading?", answer: "Painting." },
      { type: "reading comprehension", question: "What do they both enjoy doing together on Sunday evenings?", answer: "Cooking." },
    ],
  },

  my_town_city: {
    title: "A Town That's Changing",
    audioUrl: "/audio/real-world/my_town_city.mp3",
    passage: [
      "My town has changed so much in the last ten years. There used to be a small cinema on the main street, but now there's a modern shopping centre instead.",
      "The old train station was built in the 1920s and is still standing today — it's actually one of the prettiest buildings in town.",
      "There are more restaurants than ever now, and the population has grown a lot too. It's busier, but I still love it here.",
    ],
    questions: [
      { type: "reading comprehension", question: "What replaced the old cinema on the main street?", answer: "A modern shopping centre." },
      { type: "reading comprehension", question: "When was the old train station built?", answer: "In the 1920s." },
      { type: "reading comprehension", question: "What has grown a lot in the town?", answer: "The population." },
    ],
  },

  money_and_shopping: {
    title: "A Shopping Mix-Up",
    audioUrl: "/audio/real-world/money_and_shopping.mp3",
    passage: [
      "Hello, I bought a pair of shoes from your shop last week, but they don't fit — they're too small. I'd like to return them for a refund, please.",
      "I still have the receipt, and the shoes are unworn, still in their original box. Could you tell me if I need to bring anything else?",
      "I'll try to visit the shop tomorrow afternoon, if that's convenient. Thank you for your help.",
    ],
    questions: [
      { type: "reading comprehension", question: "What's wrong with the shoes?", answer: "They're too small." },
      { type: "reading comprehension", question: "What does the customer still have?", answer: "The receipt." },
      { type: "reading comprehension", question: "When will they try to visit the shop?", answer: "Tomorrow afternoon." },
    ],
  },

  food_and_eating: {
    title: "Restaurant Review: Casa Bella",
    audioUrl: "/audio/real-world/food_and_eating.mp3",
    passage: [
      "I tried Casa Bella last weekend and it didn't disappoint! The pasta was cooked perfectly, and the sauce had just the right amount of flavour.",
      "We also ordered a salad to share, which was fresh and generous in size. Service was friendly, though we waited a while for our bill at the end.",
      "Prices were reasonable for the portion sizes. I'd definitely recommend it if you're looking for a relaxed dinner with good food.",
    ],
    questions: [
      { type: "reading comprehension", question: "What did the reviewer order to share?", answer: "A salad." },
      { type: "reading comprehension", question: "What was one small problem with the service?", answer: "They waited a while for the bill." },
      { type: "reading comprehension", question: "Would the reviewer recommend it?", answer: "Yes, for a relaxed dinner with good food." },
    ],
  },

  health_and_body: {
    title: "Feeling Under the Weather",
    audioUrl: "/audio/real-world/health_and_body.mp3",
    passage: [
      "Hey, I can't make it to the gym today — I've had a headache since this morning and my throat hurts too. I think I'm coming down with something.",
      "I took some medicine and I'm going to rest for the rest of the day. My back's also been aching a bit, probably from sitting too much at work this week.",
      "Hopefully I'll feel better by tomorrow. Thanks for understanding!",
    ],
    questions: [
      { type: "reading comprehension", question: "Why can't the writer go to the gym?", answer: "They have a headache and a sore throat." },
      { type: "reading comprehension", question: "What did they do about it?", answer: "Took some medicine and are resting." },
      { type: "reading comprehension", question: "What else has been aching?", answer: "Their back." },
    ],
  },

  ordering_food: {
    title: "At the Restaurant",
    audioUrl: "/audio/real-world/ordering_food.mp3",
    passage: [
      "Are you ready to order?",
      "Yes, could I have the chicken soup to start, please?",
      "Of course. And for the main course?",
      "I'd like the grilled salmon. Does it come with vegetables?",
      "Yes, it comes with a side of seasonal vegetables.",
      "Perfect, I'll have that. Could I also have a glass of water, please?",
      "Certainly. I'll bring that right over.",
    ],
    questions: [
      { type: "reading comprehension", question: "What does the customer order to start?", answer: "Chicken soup." },
      { type: "reading comprehension", question: "What is the main course?", answer: "Grilled salmon." },
      { type: "reading comprehension", question: "What does the salmon come with?", answer: "A side of seasonal vegetables." },
    ],
  },

  making_excuses: {
    title: "Sorry I'm Late Again",
    audioUrl: "/audio/real-world/making_excuses.mp3",
    passage: [
      "I'm so sorry I missed our meeting this morning! My alarm didn't go off, and by the time I woke up, I was already running late.",
      "Then my bus was delayed for twenty minutes, which didn't help at all. I should have set a backup alarm — I know that now.",
      "Can we reschedule for tomorrow instead? I promise I'll be on time this time!",
    ],
    questions: [
      { type: "reading comprehension", question: "Why didn't the writer wake up on time?", answer: "Their alarm didn't go off." },
      { type: "reading comprehension", question: "What else caused them to be late?", answer: "Their bus was delayed for twenty minutes." },
      { type: "reading comprehension", question: "What does the writer suggest?", answer: "Rescheduling for tomorrow." },
    ],
  },

  making_suggestions: {
    title: "Planning Friday Night",
    audioUrl: "/audio/real-world/making_suggestions.mp3",
    passage: [
      "What should we do on Friday night?",
      "How about trying that new restaurant downtown?",
      "I suggest going bowling instead — it's been ages since we did that!",
      "Why don't we do both? Dinner first, then bowling after?",
      "Great idea! Have you considered inviting Marco too? He mentioned he's free this week.",
      "Good thinking. I'll message him now.",
    ],
    questions: [
      { type: "reading comprehension", question: "What is the first suggestion?", answer: "Trying the new restaurant downtown." },
      { type: "reading comprehension", question: "What does one person suggest instead?", answer: "Going bowling." },
      { type: "reading comprehension", question: "What's the final plan?", answer: "Dinner first, then bowling after." },
    ],
  },

  conjunctions: {
    title: "A Day I'll Remember",
    audioUrl: "/audio/real-world/conjunctions.mp3",
    passage: [
      "I wanted to go for a run yesterday, but it was raining heavily outside. Although the weather was bad, I decided to go to the gym instead, so I wouldn't break my routine.",
      "I stayed longer than planned because the classes were really enjoyable. When I got home, I was tired but happy.",
      "I don't usually push myself that hard, but I'm glad I did, even though my legs are still sore today!",
    ],
    questions: [
      { type: "reading comprehension", question: "Why didn't the writer go for a run?", answer: "Because it was raining heavily." },
      { type: "reading comprehension", question: "What did they do instead?", answer: "Went to the gym." },
      { type: "reading comprehension", question: "Why did they stay longer than planned?", answer: "Because the classes were really enjoyable." },
    ],
  },

  too_much_many: {
    title: "A Disappointing Concert",
    audioUrl: "/audio/real-world/too_much_many.mp3",
    passage: [
      "I went to a concert last weekend, but honestly, it was too crowded to really enjoy it. There were too many people pushing near the stage, and the music was too loud even for a concert.",
      "We also waited too much time in line just to get a drink.",
      "It wasn't all bad — the band played really well — but there were simply too many problems with the venue itself.",
    ],
    questions: [
      { type: "reading comprehension", question: "What was one problem near the stage?", answer: "Too many people pushing." },
      { type: "reading comprehension", question: "What did they wait too long for?", answer: "A drink." },
      { type: "reading comprehension", question: "Was the band good?", answer: "Yes, the band played really well." },
    ],
  },

  quantifiers: {
    title: "Checking the Kitchen",
    audioUrl: "/audio/real-world/quantifiers.mp3",
    passage: [
      "I checked the kitchen before going shopping. We don't have much milk left, and there isn't any bread at all.",
      "There are a few eggs, but not many — maybe three or four. We have a lot of pasta, so we don't need more of that.",
      "I also noticed there's only a little coffee left, so I'll add that to the list too. I don't think we need much else this week.",
    ],
    questions: [
      { type: "reading comprehension", question: "How much bread is there?", answer: "None — there isn't any bread at all." },
      { type: "reading comprehension", question: "How many eggs are there?", answer: "A few — maybe three or four." },
      { type: "reading comprehension", question: "Do they need more pasta?", answer: "No, they have a lot already." },
    ],
  },

  modals_obligation: {
    title: "Office Rules",
    audioUrl: "/audio/real-world/modals_obligation.mp3",
    passage: [
      "Welcome to the office! A few important rules: you must wear your ID badge at all times, and you have to sign in at reception every morning.",
      "You mustn't use your phone during meetings — please keep it on silent. You don't have to work weekends, but if a project needs it, extra hours are sometimes required.",
      "Lunch breaks are flexible, so you don't have to take yours at exactly one o'clock.",
    ],
    questions: [
      { type: "reading comprehension", question: "What must employees wear at all times?", answer: "Their ID badge." },
      { type: "reading comprehension", question: "What mustn't employees do during meetings?", answer: "Use their phone." },
      { type: "reading comprehension", question: "Do employees have to work weekends?", answer: "No, not usually, unless a project needs it." },
    ],
  },

  modals_possibility: {
    title: "Where's Everyone?",
    audioUrl: "/audio/real-world/modals_possibility.mp3",
    passage: [
      "Has anyone seen Tom today? His car isn't in the car park, so he might be working from home. Actually, he mentioned a dentist appointment yesterday, so that could be why he's out.",
      "Sarah isn't here either — she must be at the client meeting, since it's in her calendar.",
      "I can't be sure about either of them, but I think they'll both be back by this afternoon.",
    ],
    questions: [
      { type: "reading comprehension", question: "Why might Tom be working from home?", answer: "Because his car isn't in the car park." },
      { type: "reading comprehension", question: "What could explain why Tom is out?", answer: "A dentist appointment." },
      { type: "reading comprehension", question: "Where must Sarah be?", answer: "At the client meeting." },
    ],
  },

  // --- B1 ---

  present_perfect: {
    title: "Checking In on the Move",
    audioUrl: "/audio/real-world/present_perfect.mp3",
    passage: [
      "Have you finished packing yet?",
      "Not yet — I've already packed the kitchen and the bedroom, but I haven't started on the living room. I've been putting it off because there's just so much stuff!",
      "Have you called the moving company already?",
      "Yes, I called them yesterday. They've confirmed everything for Saturday morning. Have you ever moved house before, by the way? I don't really know what to expect.",
      "I've moved three times so far, actually. The first week is always chaotic, but it gets easier. Have you sorted out the internet and electricity yet, or is that still on the list?",
      "That's still on the list! I haven't had a spare moment this week. I'll deal with it tonight, before it's too late. Have you told your landlord you're leaving yet?",
      "Yes, I gave notice last month, so that's all sorted. Honestly, once Saturday's over, I think I'll just collapse on the sofa for a week!",
    ],
    questions: [
      { type: "reading comprehension", question: "What has the first speaker already packed?", answer: "The kitchen and the bedroom." },
      { type: "reading comprehension", question: "When did they call the moving company?", answer: "Yesterday." },
      { type: "reading comprehension", question: "How many times has the second speaker moved house before?", answer: "Three times." },
    ],
  },

  phrasal_verbs: {
    title: "An Email to the Team",
    audioUrl: "/audio/real-world/phrasal_verbs.mp3",
    passage: [
      "Hi team, a quick update before the long weekend. I know we've all been putting off the budget review, but we really need to sort it out before next month.",
      "Could someone look into the numbers from Q1 and come up with a rough summary by Friday? I ran into James yesterday and he mentioned he's already started, so maybe team up with him rather than duplicating the work.",
      "Also, please don't give up on the client proposal just because it was rejected once — let's carry out one more round of edits and see if we can turn it around.",
      "One more thing: could everyone look over the shared document before Monday's call? I'd like us to be on the same page going into next week, rather than figuring things out on the spot.",
      "I know a few of you have been dealing with personal stuff too, so please don't hesitate to reach out if you need to take a step back for a day or two. We'll work around it.",
      "Thanks for putting up with such a busy month, everyone. Let's catch up properly once things calm down, and hopefully wrap up all these loose ends before they pile up any further.",
    ],
    questions: [
      { type: "reading comprehension", question: "What have the team been putting off?", answer: "The budget review." },
      { type: "reading comprehension", question: "Who should the reader team up with?", answer: "James." },
      { type: "reading comprehension", question: "What should happen with the client proposal?", answer: "One more round of edits, to try to turn it around." },
    ],
  },

  understanding_get: {
    title: "A Week of 'Get'",
    audioUrl: "/audio/real-world/understanding_get.mp3",
    passage: [
      "This week has been a real mix. I get up earlier now that the mornings are lighter, which has been nice.",
      "My new colleague and I get on really well — we've already started getting together for lunch most days. I'm slowly getting used to the new software at work, even though it was confusing at first.",
      "I got into a bit of trouble on Tuesday for missing a deadline, which wasn't great, but I got it sorted by the end of the day.",
      "My manager and I got talking about it afterwards, and she said I should get in touch sooner next time if I'm falling behind, rather than trying to fix everything alone.",
      "On the bus home, I got off one stop early just to get some fresh air. I've been trying to get more exercise into my week however I can, even small amounts like that.",
      "By the time I got back home, I was exhausted — but in a good way! I think I'm finally getting the hang of balancing everything again after a slow start to the year.",
    ],
    questions: [
      { type: "reading comprehension", question: "How does the writer get on with their new colleague?", answer: "Really well." },
      { type: "reading comprehension", question: "What happened on Tuesday?", answer: "They got into a bit of trouble for missing a deadline." },
      { type: "reading comprehension", question: "Why did they get off the bus one stop early?", answer: "To get some fresh air." },
    ],
  },

  so_neither: {
    title: "We Have So Much in Common",
    audioUrl: "/audio/real-world/so_neither.mp3",
    passage: [
      "I love hiking on weekends.",
      "So do I! I try to get out to the hills at least once a month.",
      "I don't really enjoy cooking, though.",
      "Neither do I, if I'm honest — I order takeaway more than I probably should.",
      "I've never been skiing.",
      "Neither have I! Maybe we should try it together sometime.",
      "I can't stand horror films.",
      "Neither can I — I always end up covering my eyes.",
      "I've always wanted to learn to paint.",
      "So have I! Maybe we could take a class together sometime, if you're serious about it.",
      "I don't drink coffee at all, actually.",
      "Neither do I! Everyone finds that so surprising for some reason.",
      "I was actually really nervous meeting you today.",
      "So was I! I'm glad we get on so well — it's rare to find someone with so many of the same habits.",
      "I've honestly never met anyone quite like this before.",
      "Neither have I, and I don't say that lightly! I think this is the start of a proper friendship.",
    ],
    questions: [
      { type: "reading comprehension", question: "What does the first speaker enjoy doing on weekends?", answer: "Hiking." },
      { type: "reading comprehension", question: "Has either of them been skiing before?", answer: "No, neither of them has." },
      { type: "reading comprehension", question: "How did both speakers feel before meeting today?", answer: "Nervous." },
    ],
  },

  prefer_rather: {
    title: "Choosing a Restaurant",
    audioUrl: "/audio/real-world/prefer_rather.mp3",
    passage: [
      "Where should we eat tonight?",
      "I'd rather stay in, honestly — I've had a long week. I'd prefer to order something and relax at home.",
      "That's fine with me. Would you prefer pizza or Thai food?",
      "I'd prefer Thai, if that's okay. I'd rather not have anything too heavy tonight.",
      "Sounds good. I'd rather you choose the dish, though — you always pick better than me!",
      "Alright. I'd prefer we split a few things rather than each getting our own, if you're up for sharing.",
      "Definitely. I'd much rather share anyway — I always want to try everything on the menu. Would you prefer to eat on the sofa or at the table tonight?",
      "I'd rather sit at the table, if that's alright — I've been slouching on the sofa all week and my back's not thanking me for it.",
      "Fair enough! I'd prefer that too, honestly. I'll set the table while you finish choosing exactly what we're ordering.",
    ],
    questions: [
      { type: "reading comprehension", question: "Would the first speaker rather stay in or go out?", answer: "Stay in." },
      { type: "reading comprehension", question: "Which food do they choose, pizza or Thai?", answer: "Thai." },
      { type: "reading comprehension", question: "Do they decide to share dishes or order separately?", answer: "Share." },
    ],
  },

  passive_simple: {
    title: "How Your Coffee Gets to You",
    audioUrl: "/audio/real-world/passive_simple.mp3",
    passage: [
      "Coffee is grown in more than seventy countries, mostly near the equator. Once the beans are picked, they are dried and sorted by hand or machine.",
      "The beans are then shipped to roasting facilities around the world, where they are roasted at high temperatures to bring out their flavour.",
      "After roasting, the coffee is packaged and sent to shops and cafés. In most cafés, the coffee is ground fresh just before it's brewed, since ground coffee loses its flavour quickly once it's exposed to air.",
      "Along the way, the beans are also tested for quality several times, and any batches that don't meet the standard are rejected before they ever reach a shop shelf.",
      "In recent years, more attention has been paid to how the farmers themselves are treated and paid, and many brands are now certified to guarantee a fair price is being offered at every stage.",
      "Every cup you drink is the result of a long journey — grown by farmers, processed by workers, tested by inspectors, and finally prepared by a barista just for you.",
    ],
    questions: [
      { type: "reading comprehension", question: "Where is most coffee grown?", answer: "Near the equator, in more than seventy countries." },
      { type: "reading comprehension", question: "What happens to the beans after they're picked?", answer: "They are dried and sorted." },
      { type: "reading comprehension", question: "Why is coffee ground fresh just before brewing?", answer: "Because ground coffee loses its flavour quickly once exposed to air." },
    ],
  },

  get_used_to: {
    title: "Moving Abroad",
    audioUrl: "/audio/real-world/get_used_to.mp3",
    passage: [
      "What was the hardest part of moving to a new country?",
      "Honestly, getting used to the food took the longest. I didn't use to eat spicy food at all back home, so it was a real shock at first. Now I'm completely used to it — I actually crave it!",
      "Did you use to speak the language before you moved?",
      "Not a word! I used to rely on translation apps constantly during my first few months. Now I'm used to having basic conversations, though I still can't say I'm fluent.",
      "What about making friends? Did you use to find that difficult too?",
      "Very difficult at first. I didn't use to go out much back home either, so it wasn't only a language problem. I'm slowly getting used to putting myself out there more.",
      "What about the weather?",
      "That was easier, actually. I used to complain about the rain back home, so I'm just used to adapting to whatever comes. My family still asks if I've gotten used to the heat here, and honestly, I think I finally have.",
    ],
    questions: [
      { type: "reading comprehension", question: "What took the longest to get used to?", answer: "The food." },
      { type: "reading comprehension", question: "What did the speaker rely on during their first few months?", answer: "Translation apps." },
      { type: "reading comprehension", question: "Was adjusting to the weather easy or hard for them?", answer: "Easier than expected." },
    ],
  },

  reported_speech: {
    title: "What Did She Say?",
    audioUrl: "/audio/real-world/reported_speech.mp3",
    passage: [
      "So what did the manager say in the meeting?",
      "She said the company was doing well this quarter, and she told us we would get an update on bonuses by the end of the month. She also said that she had already spoken to head office about it.",
      "Did she say anything about the new office?",
      "Yes — she said they were still deciding, and she asked if anyone had any preferences about the location. I told her I would prefer somewhere closer to the station.",
      "What did your teammate say afterwards?",
      "He said he thought the meeting went well, and he asked me if I believed the bonus news. I said I hoped so, but I wasn't completely sure.",
      "Did anyone bring up the new project?",
      "Actually, yes — she said it would start next month, and she warned us that the deadline was tighter than usual. She also promised she would send a full schedule by email.",
      "That's a lot to take in. Did she say who would be leading it?",
      "She said the team would decide together, but she suggested I might be a good fit, given my experience last year. I told her I'd think about it and let her know by Friday.",
    ],
    questions: [
      { type: "reading comprehension", question: "What did the manager say about the company?", answer: "That it was doing well this quarter." },
      { type: "reading comprehension", question: "What preference did the speaker tell the manager?", answer: "That they'd prefer somewhere closer to the station." },
      { type: "reading comprehension", question: "What did the teammate ask afterwards?", answer: "If the speaker believed the bonus news." },
    ],
  },

  indefinite_pronouns: {
    title: "An Empty House",
    passage: [
      "When I got home, something felt strange. Nobody had left a note, and there was no sign of anyone in the house.",
      "I checked everywhere, but I couldn't find anything unusual — everything seemed to be in its place. I called out, but no one answered.",
      "I thought I heard someone in the kitchen, so I went to check, but there was nobody there either. At that point, I started imagining all sorts of things, though none of them made much sense.",
      "I tried calling a few people, but nobody picked up, which only made things feel stranger. I couldn't think of anyone who might know what was going on.",
      "Eventually, I found a message on the fridge: everyone had gone to a surprise party — for me! I felt silly for being so worried about nothing, especially once I realised no one had meant to scare me at all.",
      "Looking back, I probably should have checked my phone first, since apparently someone had already texted me the details hours earlier — I just hadn't noticed.",
    ],
    questions: [
      { type: "reading comprehension", question: "Had anyone left a note?", answer: "No, nobody had." },
      { type: "reading comprehension", question: "Where did the writer think they heard someone?", answer: "In the kitchen." },
      { type: "reading comprehension", question: "Why had everyone actually gone?", answer: "To a surprise party for the writer." },
    ],
  },

  relative_clauses: {
    title: "The Neighbour I'll Never Forget",
    passage: [
      "My old neighbour, who lived next door for twenty years, was the kind of person everyone remembers. He had a garden that was famous on our whole street, full of flowers whose names I could never remember.",
      "The house where he lived is empty now, but I still think about the summer when he taught me to grow tomatoes.",
      "There was a reason why everyone liked him so much: he always had time for people, no matter how busy he was. Even neighbours who barely knew him would stop by just for a chat.",
      "He had a dog whose bark everyone on the street recognised instantly, and a shed where he kept every tool he'd ever owned, each one labelled in his own handwriting.",
      "The day when he moved away was genuinely sad for the whole neighbourhood. It's the kind of loss where you don't realise how much someone shaped a place until they're simply not there anymore.",
    ],
    questions: [
      { type: "reading comprehension", question: "How long did the neighbour live next door?", answer: "Twenty years." },
      { type: "reading comprehension", question: "What did he teach the writer to grow?", answer: "Tomatoes." },
      { type: "reading comprehension", question: "Why did everyone like him so much?", answer: "He always had time for people, no matter how busy he was." },
    ],
  },

  adverbs: {
    title: "My Brother the Perfectionist",
    passage: [
      "My brother does everything carefully, sometimes a little too carefully. He drives slowly and cautiously, which used to annoy me until I realised how safely he actually gets us there.",
      "At work, he speaks calmly even under pressure, and he always explains things clearly. He cooks beautifully too — honestly, his food usually tastes better than mine!",
      "He treats people fairly and listens patiently, which is probably why colleagues trust him so much. Even when something goes badly wrong, he responds surprisingly calmly, never raising his voice.",
      "The only thing he does badly is relax; he works constantly and rarely takes a proper break. I keep telling him to slow down occasionally, but he just laughs and says he feels perfectly fine.",
      "Honestly, I secretly admire how consistently he behaves, even if it occasionally drives the rest of the family slightly mad. We're hoping he'll finally take a proper holiday this year — realistically, though, I doubt it.",
    ],
    questions: [
      { type: "reading comprehension", question: "How does the brother drive?", answer: "Slowly and cautiously." },
      { type: "reading comprehension", question: "How does he speak at work, even under pressure?", answer: "Calmly." },
      { type: "reading comprehension", question: "What does he do badly, according to the writer?", answer: "Relax." },
    ],
  },

  intensifiers_so_such_enough: {
    title: "A Trip to Remember",
    passage: [
      "The trip was so much fun that we didn't want it to end. The hotel had such a beautiful view that we spent the first evening just staring out the window.",
      "The food was so good that we ate at the same restaurant three times. It wasn't warm enough to swim every day, unfortunately, but it was sunny enough for us to enjoy the beach anyway.",
      "The old town was so charming that we spent an entire day just wandering the streets without any real plan. We were so tired by evening that we barely made it through dinner before falling asleep.",
      "Our guide was such a knowledgeable person that we learned more in one afternoon than we expected to learn all week. He had such a good sense of humour, too, that even the boring parts of the tour felt entertaining.",
      "Honestly, it was such a memorable trip that we're already planning to go back, even though it wasn't quite long enough to see absolutely everything we wanted to.",
    ],
    questions: [
      { type: "reading comprehension", question: "How many times did they eat at the same restaurant?", answer: "Three times." },
      { type: "reading comprehension", question: "Was it warm enough to swim every day?", answer: "No, it wasn't." },
      { type: "reading comprehension", question: "What did they think of their guide?", answer: "Such a knowledgeable person." },
    ],
  },

  double_comparatives: {
    title: "Working From a Café",
    passage: [
      "The more I work from cafés, the more productive I seem to become. The busier the café gets, the harder it is to concentrate, though — so I've learned to arrive early.",
      "The earlier I get there, the quieter it usually is. The more coffee I drink, the more focused I feel, at least for the first hour!",
      "The bigger the table I manage to find, the more spread out I can get with my notes, which somehow makes everything feel more organised. The more organised things look, the calmer I feel about the whole day ahead.",
      "The longer I stay, though, the more tempted I am to just chat with the staff instead of working. The friendlier they get, the harder it becomes to leave and actually go home.",
      "The better I get at managing my time, the less guilty I feel about mixing work and relaxation like this. Honestly, the more I think about it, the less I want to go back to a normal office routine.",
    ],
    questions: [
      { type: "reading comprehension", question: "Why has the writer learned to arrive early?", answer: "Because the busier the café gets, the harder it is to concentrate." },
      { type: "reading comprehension", question: "What happens the more coffee they drink?", answer: "The more focused they feel." },
      { type: "reading comprehension", question: "What happens the longer they stay?", answer: "The more tempted they are to chat with the staff instead of working." },
    ],
  },

  giving_opinions: {
    title: "A Debate Worth Having",
    passage: [
      "In my opinion, remote work has completely changed how people balance their lives. I tend to think it's mostly positive, though I understand it doesn't suit everyone.",
      "If you ask me, the biggest benefit is simply not commuting every day. I strongly believe companies should offer more flexibility in general, not just for parents or carers.",
      "As far as I'm concerned, the productivity argument is overstated too — some people work better from an office, and I don't think that should be dismissed just because remote work suits the majority.",
      "That said, I do think there are downsides — some people find it isolating, and I can see why. From my point of view, younger employees especially lose out on mentorship they'd otherwise get naturally in person.",
      "Personally, I believe the best solution is a hybrid model, giving people the choice rather than forcing one approach on everyone. In my experience, the companies that trust their staff to figure out what works tend to get the best results either way.",
    ],
    questions: [
      { type: "reading comprehension", question: "What does the writer think is the biggest benefit of remote work?", answer: "Not commuting every day." },
      { type: "reading comprehension", question: "What downside do they mention?", answer: "Some people find it isolating." },
      { type: "reading comprehension", question: "What solution do they personally believe in?", answer: "A hybrid model, giving people the choice." },
    ],
  },

  working_from_home: {
    title: "One Year of Working From Home",
    passage: [
      "It's been exactly a year since I started working from home, and I have mixed feelings about it. On one hand, I've saved so much time not commuting, and I've genuinely become more productive.",
      "On the other hand, I sometimes miss the casual conversations you only get in an office. Working from home has become increasingly popular since the pandemic, and I understand why — the flexibility is hard to give up once you've had it.",
      "My employer has been supportive throughout, offering a small budget for home office equipment and checking in regularly to make sure everyone still feels connected to the team, even from a distance.",
      "That said, I've had to set strict boundaries, because it's easy to end up working later than I would in an office. Some weeks I've caught myself still answering messages well into the evening, which isn't sustainable long-term.",
      "Overall, I wouldn't go back to a five-day commute, but I do try to visit the office at least once a week just to stay connected with my team, since some conversations really are easier face to face.",
    ],
    questions: [
      { type: "reading comprehension", question: "What does the writer miss about the office?", answer: "The casual conversations." },
      { type: "reading comprehension", question: "Why has the writer had to set strict boundaries?", answer: "Because it's easy to end up working later than in an office." },
      { type: "reading comprehension", question: "How often does the writer still visit the office?", answer: "At least once a week." },
    ],
  },

  learning_language: {
    title: "Six Months of Learning Portuguese",
    passage: [
      "I've been learning Portuguese for six months now, and it's been a rollercoaster. In the beginning, I was completely lost — even ordering coffee felt impossible.",
      "Slowly, though, I built up my vocabulary through daily practice, mostly listening to podcasts on my commute. I've learned that consistency matters far more than long study sessions; twenty minutes a day beats a single three-hour session on a Sunday.",
      "I also found a language exchange partner online, which has honestly made the biggest difference — having a real person to talk to, rather than just an app, keeps me accountable in a way nothing else has.",
      "My biggest challenge has been speaking confidently, since I still translate in my head before I say anything. My teacher says that will fade with time and more real conversations, and I'm starting to believe her, since last week I managed a whole phone call without switching to English once.",
      "For now, I'm proud of how far I've come, even if I still make plenty of mistakes. My goal is to be comfortable holding a full conversation by the time I visit Lisbon next year.",
    ],
    questions: [
      { type: "reading comprehension", question: "How long has the writer been learning Portuguese?", answer: "Six months." },
      { type: "reading comprehension", question: "How did they mostly practise?", answer: "By listening to podcasts on their commute." },
      { type: "reading comprehension", question: "What has been their biggest challenge?", answer: "Speaking confidently." },
    ],
  },

  career_choices: {
    title: "Changing Careers at Thirty",
    passage: [
      "At thirty, I decided to leave my job in finance and retrain as a nurse — a decision that surprised almost everyone I know. I'd been interested in healthcare for years, but I was always too afraid to take the leap.",
      "What finally convinced me was realising how unhappy I'd become, despite a good salary and a stable position. The first year of training was genuinely difficult, both financially and emotionally, but I don't regret it for a second.",
      "My family were supportive from the start, though a few colleagues in finance seemed genuinely confused by the decision, as though giving up a comfortable career made no sense at all.",
      "Looking back, the hardest part wasn't the studying itself, but adjusting to being a beginner again after years of feeling competent in my old role. That kind of humility turned out to be good for me in the end.",
      "My advice to anyone considering a similar change is simple: talk to people who've already done it, and be honest with yourself about what actually matters to you, rather than what looks impressive on paper.",
    ],
    questions: [
      { type: "reading comprehension", question: "What career did the writer leave, and what did they retrain as?", answer: "They left finance and retrained as a nurse." },
      { type: "reading comprehension", question: "What finally convinced them to change careers?", answer: "Realising how unhappy they'd become." },
      { type: "reading comprehension", question: "What advice do they give to others considering a similar change?", answer: "Talk to people who've already done it, and be honest about what matters to you." },
    ],
  },

  time_management: {
    title: "Getting My Mornings Under Control",
    passage: [
      "For years, I struggled with time management, constantly rushing from one thing to another without ever feeling in control. Everything changed when I started planning my mornings the night before.",
      "I now prioritise my three most important tasks and avoid checking emails until at least ten o'clock. I've also learned to say no to meetings that don't really need me, which used to feel impossible.",
      "I started using a simple paper planner rather than yet another app, since I found that writing things down by hand actually helped the plan stick better in my memory.",
      "Procrastination is still something I battle with occasionally, especially with tasks I find boring, but breaking big projects into smaller steps has helped enormously. Setting a timer for just twenty-five minutes at a time has also made starting the hardest part feel far less overwhelming.",
      "My advice would be to start small: one new habit at a time is far more sustainable than trying to overhaul your entire routine overnight, no matter how motivated you feel on day one.",
    ],
    questions: [
      { type: "reading comprehension", question: "What changed everything for the writer?", answer: "Planning their mornings the night before." },
      { type: "reading comprehension", question: "Until what time do they now avoid checking emails?", answer: "Ten o'clock." },
      { type: "reading comprehension", question: "What has helped with procrastination on boring tasks?", answer: "Breaking big projects into smaller steps." },
    ],
  },

  free_time_hobbies: {
    title: "Finding Time for What I Love",
    passage: [
      "Between work and family responsibilities, finding time for hobbies used to feel like a luxury I couldn't afford. Eventually, I realised that spending even thirty minutes a day painting made a real difference to how I felt overall.",
      "I've been doing it for almost two years now, and it's become as important to me as exercise. My friend, who's always been passionate about photography, says the same thing — having a creative outlet outside of work keeps her sane during stressful weeks.",
      "Neither of us are particularly talented, if I'm honest, but that's never really been the point. The value seems to come from the process itself, not from producing something impressive at the end.",
      "We've started meeting up occasionally to work on projects together, which has been a wonderful way to stay motivated. Some evenings we barely talk at all, just sit painting or editing photos side by side, and it's still one of my favourite parts of the week.",
      "If you've been putting off a hobby because you feel too busy, I'd genuinely encourage you to just start small. Even a tiny amount of time spent on something you enjoy adds up more than people expect.",
    ],
    questions: [
      { type: "reading comprehension", question: "What hobby does the writer spend thirty minutes a day on?", answer: "Painting." },
      { type: "reading comprehension", question: "What is the friend passionate about?", answer: "Photography." },
      { type: "reading comprehension", question: "What have they started doing together?", answer: "Meeting up to work on projects together." },
    ],
  },

  social_media: {
    title: "A Week Without Social Media",
    passage: [
      "Last month, I decided to delete social media from my phone for one week, just to see what would happen. The first two days were surprisingly hard — I kept reaching for my phone out of habit, even though there was nothing there anymore.",
      "By day three, though, I noticed I was reading more and sleeping better. Social media has become such a huge part of daily life that most people don't even realise how much time they spend scrolling.",
      "A few friends assumed something was wrong when I stopped replying to messages as quickly, which honestly made me realise how much I'd trained people to expect an instant response from me.",
      "What surprised me most was how much calmer I felt without constantly comparing myself to other people's highlight reels. I hadn't even noticed how much that comparison was affecting my mood until it suddenly stopped.",
      "I've since gone back to using it, but much more consciously — no more mindless scrolling before bed, and I've muted a few accounts that only ever made me feel worse about my own life.",
    ],
    questions: [
      { type: "reading comprehension", question: "How long did the writer delete social media for?", answer: "One week." },
      { type: "reading comprehension", question: "What did they notice by day three?", answer: "They were reading more and sleeping better." },
      { type: "reading comprehension", question: "What surprised them most?", answer: "How much calmer they felt without comparing themselves to others." },
    ],
  },

  reading: {
    title: "Why I Started Reading Again",
    passage: [
      "I hadn't read a proper book in years until a friend recommended one during a long flight. I finished it before we even landed, and I've been hooked ever since.",
      "I'm particularly interested in historical fiction, though I'll read almost anything if the story grabs me. Based on recommendations from an online book club, I've discovered authors I never would have picked up on my own.",
      "I've started keeping a small notebook of every book I finish, along with a couple of lines about what I thought. It's oddly satisfying watching the list grow month by month.",
      "Reading before bed instead of scrolling on my phone has genuinely improved my sleep too. I fall asleep faster now, and I no longer lie there thinking about whatever I just saw online.",
      "My only regret is not starting again sooner — there are so many books I still want to read, and honestly, not nearly enough time to read them all before I add even more to the list.",
    ],
    questions: [
      { type: "reading comprehension", question: "When did the writer read the book that got them hooked again?", answer: "During a long flight." },
      { type: "reading comprehension", question: "What genre are they particularly interested in?", answer: "Historical fiction." },
      { type: "reading comprehension", question: "What has reading before bed improved?", answer: "Their sleep." },
    ],
  },

  city_vs_country: {
    title: "City or Countryside? Our Family's Debate",
    passage: [
      "My partner and I have been debating whether to move from the city to the countryside for almost a year now. The cost of living in the city keeps rising, and honestly, the noise and traffic wear on me more than they used to.",
      "On the other hand, the sense of community in a smaller town appeals to my partner far more than it does to me — I worry about feeling isolated, especially since most of our friends still live in the city.",
      "We've visited a few towns to get a feel for what it might actually be like, and I have to admit, the pace of life there is genuinely appealing in a way I hadn't expected.",
      "City life offers convenience: everything is within walking distance, and there's always something to do. Country life offers space and quiet, which sounds appealing until I remember how much I rely on being near good hospitals and public transport.",
      "We still haven't decided, but the conversation itself has been useful — if nothing else, it's forced us to actually talk about what we each want our day-to-day life to look like in five years.",
    ],
    questions: [
      { type: "reading comprehension", question: "How long have they been debating the move?", answer: "Almost a year." },
      { type: "reading comprehension", question: "What worries the writer about the countryside?", answer: "Feeling isolated." },
      { type: "reading comprehension", question: "Have they decided yet?", answer: "No, they still haven't." },
    ],
  },

  subject_object_questions: {
    title: "Detective Notes",
    passage: [
      "Who broke the window?",
      "We don't know yet — that's what we're trying to find out.",
      "Who did the neighbour see near the house last night?",
      "She said she saw a man in a dark jacket, but she couldn't describe his face.",
      "What happened after that?",
      "According to her, he walked away quickly once a car passed by.",
      "Who called the police?",
      "The neighbour did, about ten minutes later.",
      "What did the police find at the scene?",
      "Just some footprints, unfortunately — nothing else useful so far.",
      "Who lives in the house next door?",
      "An elderly couple, though neither of them noticed anything until the neighbour mentioned it this morning.",
      "What time did the neighbour first notice the noise?",
      "Around midnight, she said, though she didn't think much of it until she saw the broken glass this morning.",
      "Who's leading the investigation?",
      "Detective Reyes is, and she's asked to speak with anyone who was out walking last night.",
    ],
    questions: [
      { type: "reading comprehension", question: "Who did the neighbour see near the house?", answer: "A man in a dark jacket." },
      { type: "reading comprehension", question: "Who called the police?", answer: "The neighbour." },
      { type: "reading comprehension", question: "What did the police find at the scene?", answer: "Just some footprints." },
    ],
  },

  second_conditional: {
    title: "If I Won the Lottery...",
    passage: [
      "Someone asked me recently what I would do if I won the lottery, and it made me really think. If I had that much money, I probably wouldn't quit my job completely — I'd just work fewer hours.",
      "I'd buy a small house by the coast if I could find the right place, and I'd definitely travel more than I currently do. If my friends needed help, I'd want to support them too, rather than just spending it all on myself.",
      "If I were completely honest, I think I'd struggle to keep it a secret from my family for very long — I've never been good at hiding big news like that.",
      "I'd probably set some of it aside for a rainy day too, if I'm being sensible, rather than spending everything all at once the way I sometimes imagine I would.",
      "Honestly, if I'm being completely truthful, I think I'd feel a bit lost without some kind of routine, even with unlimited money. Money would solve some problems, but I don't think it would solve all of them.",
    ],
    questions: [
      { type: "reading comprehension", question: "Would the writer quit their job completely if they won the lottery?", answer: "No, they'd just work fewer hours." },
      { type: "reading comprehension", question: "What would they buy if they could find the right place?", answer: "A small house by the coast." },
      { type: "reading comprehension", question: "How does the writer think they'd feel without a routine?", answer: "A bit lost." },
    ],
  },

  past_continuous: {
    title: "The Night the Power Went Out",
    passage: [
      "I was cooking dinner when the lights suddenly went out. My neighbours were apparently having the same problem, because I could hear them shouting from their balcony.",
      "While I was searching for candles in the dark, I knocked over a glass of water, which didn't help the situation at all. My phone was charging at the time, so I couldn't even use the torch.",
      "Meanwhile, my flatmate was watching a film on her laptop, so at least her battery gave us a little bit of light while we figured out what to do.",
      "Eventually, I found some candles while my flatmate was calling the electricity company to ask what was happening. It turned out a storm was causing power cuts across the whole area, and engineers were already working to fix it.",
      "We ended up eating dinner by candlelight, which was actually kind of romantic, in a strange way. By the time the power came back around ten, we'd almost forgotten we were waiting for it at all.",
    ],
    questions: [
      { type: "reading comprehension", question: "What was the writer doing when the lights went out?", answer: "Cooking dinner." },
      { type: "reading comprehension", question: "Why couldn't they use their phone as a torch?", answer: "Because it was charging at the time." },
      { type: "reading comprehension", question: "What was causing the power cuts?", answer: "A storm." },
    ],
  },

  past_perfect: {
    title: "The Flight I Almost Missed",
    passage: [
      "By the time I arrived at the airport, my flight had already started boarding. I'd left home later than planned because I'd forgotten my passport and had to go back for it.",
      "Once I got through security, I realised I hadn't printed my boarding pass, so I had to find a machine to do it there. By the time I reached the gate, most passengers had already boarded, and the staff had almost closed the doors.",
      "A member of staff had already radioed ahead to check whether I'd made it through security, since apparently the system had flagged that I hadn't checked in properly online beforehand.",
      "Luckily, I made it just in time, practically running the last hundred metres with my bag bouncing on my shoulder. The staff at the gate had clearly seen this kind of panic before, since they didn't seem surprised at all.",
      "Looking back, I'd never cut it that close before, and I promised myself I would never leave packing until the last minute again — a promise I've already broken once since then, if I'm honest.",
    ],
    questions: [
      { type: "reading comprehension", question: "Why had the writer left home later than planned?", answer: "Because they'd forgotten their passport." },
      { type: "reading comprehension", question: "What had they not done before getting through security?", answer: "Printed their boarding pass." },
      { type: "reading comprehension", question: "Did they make it onto the flight?", answer: "Yes, just in time." },
    ],
  },

  modal_verbs: {
    title: "Ask Before You Assume",
    passage: [
      "Excuse me, may I ask you something about the new policy?",
      "Of course, go ahead.",
      "Could I take next Friday off? I have a family event.",
      "You should check with HR first, but it's usually fine with enough notice.",
      "I can speak a little French, by the way — would that be useful for the client meeting?",
      "Actually, yes! You'd better let the team know before Thursday.",
      "Could you also tell me whether I might be able to work from home next week? My car's in the garage for a few days.",
      "That should be fine, but you must let your manager know directly, just so it's on record for HR.",
      "I was able to finish the report early, so I have some time to help with anything else too.",
      "That's great — you really shouldn't have rushed it, though. Quality matters more than speed here. You mustn't feel pressured to always finish early, especially if it means cutting corners.",
      "Understood. Might I ask one more thing — could I possibly borrow the projector for a client call this afternoon?",
      "Of course, that shouldn't be a problem at all. Just make sure it's back in the cupboard by five.",
    ],
    questions: [
      { type: "reading comprehension", question: "Why does the speaker want Friday off?", answer: "They have a family event." },
      { type: "reading comprehension", question: "What language can the speaker speak a little of?", answer: "French." },
      { type: "reading comprehension", question: "What did the speaker manage to finish early?", answer: "The report." },
    ],
  },

  travel_and_holidays: {
    title: "A Holiday That Didn't Go to Plan",
    passage: [
      "We arrived at the hotel expecting a sea view, but our room looked directly onto the car park instead. Determined not to let it ruin the trip, we spent most of our time exploring instead of staying at the hotel.",
      "We looked forward to visiting the old town the most, and it didn't disappoint — the architecture was stunning. Unfortunately, we arrived at the main museum just as it closed for the day, which was disappointing.",
      "The hotel staff, to be fair, were apologetic about the room and offered us a free breakfast for the rest of the stay, which softened the disappointment considerably.",
      "We also got caught in a sudden downpour on our second day, which nobody had warned us about, so we ended up buying two very overpriced umbrellas from a nearby shop.",
      "Despite the mix-ups, the local food more than made up for it, and we're already looking forward to going back one day, hopefully with a better room and slightly better luck with the weather this time.",
    ],
    questions: [
      { type: "reading comprehension", question: "What did the hotel room actually look onto?", answer: "The car park." },
      { type: "reading comprehension", question: "What did they look forward to visiting the most?", answer: "The old town." },
      { type: "reading comprehension", question: "What made up for the mix-ups?", answer: "The local food." },
    ],
  },

  sport_and_fitness: {
    title: "Training for My First Marathon",
    passage: [
      "I've been training for my first marathon for the past four months, and it's been more demanding than I expected. If I stick to the training plan, I'll definitely be ready by race day — at least, that's what my coach keeps telling me.",
      "The event itself is organised by a local running club, and it's held every spring in the same route through the city. Compared to when I started, I'm noticeably faster and my endurance has improved a lot.",
      "A few of my colleagues have signed up too, which has made the whole thing more enjoyable — we've been comparing our times after every long run, half competitive and half just supportive.",
      "I've never run more than ten kilometres before this year, so completing a full marathon will be a huge milestone for me. My coach keeps reminding me that finishing is the real achievement, not the exact time on the clock.",
      "If everything goes to plan, I'll cross the finish line in under five hours. If I don't quite make that target, though, I'll still be proud simply for having trained this consistently for so long.",
    ],
    questions: [
      { type: "reading comprehension", question: "How long has the writer been training?", answer: "Four months." },
      { type: "reading comprehension", question: "Who organises the event?", answer: "A local running club." },
      { type: "reading comprehension", question: "What is the longest distance they'd run before this year?", answer: "Ten kilometres." },
    ],
  },

  relationships_and_socialising: {
    title: "Rebuilding an Old Friendship",
    passage: [
      "I've known my friend Layla since university, though we lost touch for almost five years after she moved abroad. If we hadn't reconnected on social media, I doubt we'd still be in touch today.",
      "Our friendship was organised entirely around spontaneous plans back then — nothing was ever scheduled in advance. Compared to my other friendships, ours feels different somehow, maybe because we've been through so many changes together.",
      "These days, our conversations are arranged around time zones and shared calendars instead, which felt strange at first but has become oddly normal now that we're used to it.",
      "If she hadn't reached out first after all those years apart, I honestly don't know if I would have — I think I assumed too much time had passed to bother trying.",
      "If she visits next year like she's planning to, it'll be the first time we've seen each other in person in over five years. I think our bond is actually closer now than it was before she left, maybe because neither of us takes the friendship for granted anymore.",
    ],
    questions: [
      { type: "reading comprehension", question: "How long did they lose touch for?", answer: "Almost five years." },
      { type: "reading comprehension", question: "How did they reconnect?", answer: "On social media." },
      { type: "reading comprehension", question: "How does the writer describe their bond now compared to before?", answer: "Closer now than before Layla left." },
    ],
  },

  asking_for_clarification: {
    title: "Lost in the Instructions",
    passage: [
      "Sorry, could you repeat that last part? I didn't quite catch it.",
      "Sure — I said you need to restart the system before applying the update.",
      "What do you mean by 'restart the system' exactly? Just the app, or the whole computer?",
      "The whole computer, sorry for not being clearer.",
      "Just to clarify, should I save my work first?",
      "Yes, definitely — save everything before you restart.",
      "Sorry, one more question — when you say 'settings menu', do you mean the one in the top corner, or the one inside the app itself?",
      "The one in the top corner, sorry, I should have specified that from the start.",
      "Could you go over the last step again? I want to make sure I don't miss anything.",
      "Of course — after restarting, open the settings menu and click 'apply update'. If nothing happens after a minute, could you let me know? Sometimes it just needs a second try.",
    ],
    questions: [
      { type: "reading comprehension", question: "What needs to happen before applying the update?", answer: "Restarting the system." },
      { type: "reading comprehension", question: "Does 'restart the system' mean just the app or the whole computer?", answer: "The whole computer." },
      { type: "reading comprehension", question: "What should you do before restarting?", answer: "Save everything." },
    ],
  },

  agreeing_disagreeing: {
    title: "The Office Debate",
    passage: [
      "I think we should move the deadline back a week.",
      "I couldn't agree more — the team's clearly under too much pressure right now.",
      "I'm afraid I disagree, actually. We promised the client this date, and pushing it back could damage trust.",
      "That's a fair point, but quality matters more than speed here, in my opinion.",
      "To some extent, I agree, but we still need to manage expectations with the client properly.",
      "There's no doubt about it — a rushed job could cost us the account entirely if something goes wrong. That's a risk I'm not willing to take right now.",
      "Fair enough. Maybe we could deliver an early version now and finish the rest next week?",
      "I beg to differ, actually — splitting the delivery might confuse the client more than reassure them. I'd rather we communicate clearly instead.",
      "I can't deny that's a reasonable point too. Let's at least propose the delay and explain our reasoning honestly, rather than deciding anything without them.",
    ],
    questions: [
      { type: "reading comprehension", question: "What does the first speaker suggest?", answer: "Moving the deadline back a week." },
      { type: "reading comprehension", question: "Why does one speaker disagree at first?", answer: "Because they promised the client this date." },
      { type: "reading comprehension", question: "What compromise do they eventually agree on?", answer: "Delivering an early version now and finishing the rest next week." },
    ],
  },

  question_tags: {
    title: "Small Talk at the Bus Stop",
    passage: [
      "Lovely weather today, isn't it?",
      "It really is! You're waiting for the number twelve, aren't you?",
      "Yes, I am. It hasn't come yet, has it?",
      "No, it's running late again. You don't live around here, do you?",
      "I don't, actually — I'm just visiting my sister. She works nearby, doesn't she?",
      "She does! Small world. You'll tell her I said hello, won't you?",
      "Of course I will! You know her well, don't you?",
      "We've been neighbours for years, so yes, quite well. You look a lot like her, don't you know?",
      "People say that all the time! We don't sound alike at all, though, do we?",
      "Not really, no. You must visit more often, mustn't you, if you're not from around here?",
      "I try to, whenever I can get the time off work. The bus should be here any minute now, shouldn't it?",
      "It really should — here it comes now, actually. Lovely chatting with you!",
    ],
    questions: [
      { type: "reading comprehension", question: "Which bus is the first speaker waiting for?", answer: "The number twelve." },
      { type: "reading comprehension", question: "Why is the visitor in the area?", answer: "To visit their sister." },
      { type: "reading comprehension", question: "How does the second speaker know the sister?", answer: "They've been neighbours for years." },
    ],
  },

  dependent_prepositions: {
    title: "A Letter of Advice",
    passage: [
      "Dear Sam, I heard you're worried about the interview next week, so I wanted to share some advice. First, don't be afraid of asking questions — interviewers are always interested in candidates who show curiosity.",
      "Try not to be too focused on giving a perfect answer to every question; it's fine to admit you're not familiar with something.",
      "Be prepared to talk about a time you dealt with a difficult situation, since almost every interviewer relies on questions like that to get a real sense of how you think under pressure.",
      "Don't be afraid to ask about the role itself either — interviewers are often impressed by candidates who seem genuinely interested in what the job actually involves day to day.",
      "Remember that you're capable of more than you think, and you're responsible for how you present yourself, not for the outcome itself. I'm confident in your ability to do well, and I'm proud of how far you've come already. Good luck — I know you're ready for this.",
    ],
    questions: [
      { type: "reading comprehension", question: "What is Sam worried about?", answer: "The interview next week." },
      { type: "reading comprehension", question: "What are interviewers interested in, according to the letter?", answer: "Candidates who show curiosity." },
      { type: "reading comprehension", question: "What is Sam responsible for, according to the writer?", answer: "How they present themselves." },
    ],
  },

  articles: {
    title: "A Story My Grandmother Told",
    passage: [
      "My grandmother once told me a story about the year she moved to the United States. She was a teacher at a small school near a university, and it took an hour every day just to get there.",
      "She said the hardest part wasn't the distance, but learning a completely new culture. Money was tight in those early years, but she always said that money can't buy the kind of happiness she felt building a new life.",
      "She remembered her first winter there vividly, since snow was something she'd never seen before moving. The cold, she said, was a shock, but the kindness of a few neighbours made it bearable.",
      "Dogs were a comfort to her too — she always kept one, calling them the best company a person could ask for. An old photograph of her first dog still sits on her bookshelf to this day.",
      "Looking back, she said her school was the best one she ever worked at, despite the difficult start. A university nearby even invited her to guest-lecture once, which she called one of the proudest days of her life.",
    ],
    questions: [
      { type: "reading comprehension", question: "Where did the grandmother move to?", answer: "The United States." },
      { type: "reading comprehension", question: "What did she say was the hardest part?", answer: "Learning a completely new culture." },
      { type: "reading comprehension", question: "What comforted her, according to the story?", answer: "Dogs." },
    ],
  },

  clauses_of_purpose: {
    title: "A Busy Saturday of Errands",
    passage: [
      "I went to the pharmacy to pick up a prescription before it closed for the weekend. Afterwards, I stopped by the bakery to buy bread for Sunday's breakfast.",
      "I also called the garage to book an appointment for an oil change, since the car's been making a strange noise. I asked specifically for a morning slot in order to avoid missing any more work than necessary.",
      "In the evening, I turned my phone off in order not to be disturbed during dinner with my parents, which we'd planned weeks in advance specifically to catch up properly, since we hadn't seen each other in months.",
      "My sister texted quietly so that our surprise guest wouldn't hear about the plan too early, and we arranged the whole evening carefully so as not to give anything away before the right moment.",
      "By the time I got home, I was exhausted, but everything on my list had finally been done. I set an early alarm for tomorrow too, purely so I could actually enjoy a slow morning for once.",
    ],
    questions: [
      { type: "reading comprehension", question: "Why did the writer go to the pharmacy?", answer: "To pick up a prescription." },
      { type: "reading comprehension", question: "Why did they call the garage?", answer: "To book an appointment for an oil change." },
      { type: "reading comprehension", question: "Why did they turn their phone off in the evening?", answer: "In order not to be disturbed during dinner with their parents." },
    ],
  },

  clauses_of_reason: {
    title: "Why the Trip Got Cancelled",
    passage: [
      "We cancelled our trip because the flights were suddenly too expensive to justify. Since we'd already booked the hotel, we had to cancel that too, which was a frustrating process.",
      "The airline offered a refund due to the schedule changes on their end, which was at least some relief. As we'd already taken time off work, we decided to plan a smaller trip closer to home instead.",
      "Owing to the short notice, we couldn't find anywhere quite as exciting as our original plan, but we managed to book a cosy cabin about two hours away, which turned out fine in the end.",
      "Considering how stressful the whole situation became, we're actually glad we made the change. As a result of planning something simpler, we ended up genuinely relaxing instead of rushing between attractions the whole week.",
      "Because of everything that happened, we've decided to book further in advance next time, just to avoid a repeat of the same problem, and we're also considering travel insurance, given how close we came to losing everything.",
    ],
    questions: [
      { type: "reading comprehension", question: "Why did they cancel the trip?", answer: "Because the flights were suddenly too expensive." },
      { type: "reading comprehension", question: "Why did the airline offer a refund?", answer: "Due to schedule changes on their end." },
      { type: "reading comprehension", question: "What have they decided to do next time?", answer: "Book further in advance." },
    ],
  },

  clauses_of_contrast: {
    title: "A Difficult Year, Looking Back",
    passage: [
      "Despite the challenges we faced this year, our small business somehow managed to grow. Although sales were slow at the start, things picked up significantly by the summer.",
      "In spite of losing two major clients early on, we found several new ones through word of mouth alone. The market was tough, however, we stayed committed to our original plan rather than panicking.",
      "Nevertheless, we made a few painful decisions along the way, including cutting costs in areas we'd rather have kept. While it was uncomfortable, those choices are probably what kept us afloat.",
      "Even though we considered giving up more than once, something always kept us going. Whereas some of our competitors closed down entirely this year, we somehow managed to hold on and even grow slightly.",
      "Looking back, although it was one of the hardest years we've had, it also taught us more about resilience than any easier year ever could. Despite everything, we're heading into next year cautiously optimistic for the first time in a while.",
    ],
    questions: [
      { type: "reading comprehension", question: "What happened to sales by the summer?", answer: "They picked up significantly." },
      { type: "reading comprehension", question: "How did they find new clients after losing two major ones?", answer: "Through word of mouth alone." },
      { type: "reading comprehension", question: "Did they ever consider giving up?", answer: "Yes, more than once." },
    ],
  },

  gerunds: {
    title: "Advice From a Personal Trainer",
    passage: [
      "Staying consistent is more important than training hard occasionally. I always tell my clients that skipping a single workout isn't the problem — giving up on the whole routine afterwards is.",
      "There's no point in worrying about perfection when you're just starting out; getting started at all is the real achievement. Instead of comparing yourself to others, focus on improving your own numbers week by week.",
      "Avoid skipping the warm-up too, even when you're short on time — I've seen far too many injuries caused by rushing straight into the hard part of a session without preparing properly first.",
      "I'm a big believer in mixing things up too — running every single day gets boring fast, and boredom is often the real reason people quit. Consider trying a completely different activity every few weeks just to keep things interesting.",
      "Thank you for reading this far, and here's to building a habit you'll actually keep, one small session at a time rather than one dramatic burst of motivation that fades by February.",
    ],
    questions: [
      { type: "reading comprehension", question: "What does the trainer say is more important than training hard occasionally?", answer: "Staying consistent." },
      { type: "reading comprehension", question: "What's the real achievement when just starting out?", answer: "Getting started at all." },
      { type: "reading comprehension", question: "What does the trainer say is often the real reason people quit?", answer: "Boredom." },
    ],
  },

  ed_ing_adjectives: {
    title: "The Most Confusing Lecture Ever",
    passage: [
      "I was so bored during yesterday's lecture that I nearly fell asleep. To be fair, the topic itself sounded interesting on paper, but the delivery was incredibly confusing.",
      "Some classmates seemed genuinely fascinated, which honestly surprised me, while others looked just as exhausted as I felt. The professor's explanation of the final example was so complicated that half the room looked completely lost by the end.",
      "One friend of mine, who's usually the most interested person in any class, admitted afterwards that she was just as puzzled as everyone else, which was oddly reassuring to hear.",
      "Afterwards, a few of us admitted we were embarrassed to ask questions, worried we'd sound uninterested rather than simply confused. It's a shame, really, since the professor is normally excellent at explaining even the most complicated topics clearly.",
      "Still, I left feeling motivated to read the material myself, since clearly the lecture alone wasn't going to get the job done. If anything, feeling this confused pushed me to actually understand the topic properly for once.",
    ],
    questions: [
      { type: "reading comprehension", question: "How did the writer feel during the lecture?", answer: "Bored." },
      { type: "reading comprehension", question: "How did some classmates feel, surprising the writer?", answer: "Genuinely fascinated." },
      { type: "reading comprehension", question: "What did the writer feel motivated to do afterwards?", answer: "Read the material themselves." },
    ],
  },

  future_continuous: {
    title: "This Time Next Week",
    passage: [
      "By this time next week, I'll be lying on a beach somewhere, finally on holiday after months of overtime. My colleagues will still be working through the usual Monday chaos back at the office, which honestly makes the holiday feel even sweeter.",
      "My parents will be visiting relatives that same week, so the house will be completely empty apart from the cat. I won't be checking my emails at all — I've promised myself a proper break this time.",
      "A neighbour will be feeding the cat twice a day while we're gone, which is a huge relief, since we always worry about leaving him alone for too long.",
      "This time tomorrow, I'll still be packing and double-checking everything, wondering whether I've forgotten something important, the way I always seem to before every single trip.",
      "But by Friday evening, I'll finally be relaxing with absolutely nothing on my schedule, probably not even thinking about what day of the week it is, which honestly sounds like the whole point of a proper holiday.",
    ],
    questions: [
      { type: "reading comprehension", question: "Where will the writer be this time next week?", answer: "Lying on a beach." },
      { type: "reading comprehension", question: "What will their colleagues still be doing?", answer: "Working through the usual Monday chaos." },
      { type: "reading comprehension", question: "What will the writer not be doing at all?", answer: "Checking their emails." },
    ],
  },

  describing_locations: {
    title: "Where Should We Stay?",
    passage: [
      "I found a great little town for our trip. It's situated in a valley, surrounded by mountains on almost every side.",
      "That sounds beautiful. Is it within walking distance of the train station?",
      "Yes, actually — everything is. It's known for its old market square and its incredible local cheese.",
      "Is it touristy, or more off the beaten track?",
      "Definitely off the beaten track — most visitors don't even know it exists. It's home to only about two thousand people.",
      "Perfect, that's exactly what we're looking for. Is it up-and-coming, or has it always been like this?",
      "It's actually becoming more popular recently, so I think we should visit before it changes too much. There's also a small vineyard on the outskirts of town that's apparently worth a visit.",
      "That sounds wonderful. Is the accommodation situated close to the centre, or would we need a car to get around?",
      "Everything's within walking distance, honestly. Most of the guesthouses are located right on the market square itself, so you'd barely need to move to see everything.",
      "That settles it, then — let's book it before it becomes too well known and loses what makes it special in the first place.",
    ],
    questions: [
      { type: "reading comprehension", question: "What is the town surrounded by?", answer: "Mountains." },
      { type: "reading comprehension", question: "What is it known for?", answer: "Its old market square and local cheese." },
      { type: "reading comprehension", question: "About how many people live there?", answer: "About two thousand." },
    ],
  },

  common_idioms: {
    title: "Grandpa's Favourite Sayings",
    passage: [
      "My grandfather has a saying for everything. When something is easy, he calls it a piece of cake. If he's feeling slightly ill, he says he's a bit under the weather.",
      "He always warns us that flights abroad can cost an arm and a leg, so he prefers holidays closer to home. When we first meet someone new at a family gathering, he's the one who breaks the ice with a joke.",
      "If two of my cousins ever disagree about something small, he tells them not to make a mountain out of a molehill, usually while laughing at his own joke before anyone else does.",
      "He rarely tells secrets, but once in a blue moon, he'll spill the beans about something from his past. When my brother finally passed his driving test after failing twice, grandpa said it was better late than never.",
      "If a problem seems small on the surface, he reminds us it might just be the tip of the iceberg. Losing his old job decades ago, he always says, turned out to be a blessing in disguise, since it's what pushed him to start his own business instead.",
    ],
    questions: [
      { type: "reading comprehension", question: "What does grandfather call something that's easy?", answer: "A piece of cake." },
      { type: "reading comprehension", question: "What does he warn about flights abroad?", answer: "That they can cost an arm and a leg." },
      { type: "reading comprehension", question: "What did losing his old job turn out to be?", answer: "A blessing in disguise." },
    ],
  },

  // ===== B2 (24 topics) =====

  passive_complex: {
    title: "The Old Cinema Reopens",
    passage: [
      "For thirty years, the Regal Cinema on Mill Street sat empty, its windows boarded up and its neon sign dark. Built in 1932, it had once been the grandest building in town, but by the 1990s it had been abandoned entirely, and most people assumed it would eventually be knocked down.",
      "That changed five years ago, when a local trust was formed to save it. Since then, the building has been restored piece by piece. The original ceiling, which had been covered by a false one in the 1960s, has now been uncovered and repaired. The seats, all six hundred of them, have been replaced with replicas of the originals, and the projection room, which was being rebuilt from scratch last year, is now fully equipped.",
      "\"By the time we're finished, over two million pounds will have been spent on this building,\" said project director Hannah Reeves. \"Every penny of it has been raised through donations, not government funding.\" She explained that when the trust was formed, almost nothing had been done to protect the building legally, and it could easily have been sold to a developer instead.",
      "The final phase of work is being completed now, and the cinema is expected to be reopened to the public in the spring. Tickets for the opening night, a screening of a classic film from 1932, are already being sold, and organisers say the event will have been fully booked within days.",
      "A small museum documenting the cinema's history is also being planned for the lobby, using photographs and equipment that were donated by local families once the appeal for the project was publicised. Several original staff uniforms, which had been kept in an attic for decades, have recently been given to the trust as well.",
      "\"This building has been loved by generations of people in this town,\" Reeves added. \"It deserves to be looked after properly, not left to fall apart.\"",
    ],
    questions: [
      { type: "reading comprehension", question: "When was the Regal Cinema built?", answer: "1932." },
      { type: "reading comprehension", question: "What has replaced the original seats?", answer: "Replicas of the originals." },
      { type: "reading comprehension", question: "How has the restoration been funded?", answer: "Entirely through donations, not government funding." },
    ],
  },

  causative_verbs: {
    title: "Renovating My Kitchen",
    passage: [
      "When we bought this house, I promised myself I wouldn't rush into any big projects. That plan lasted about two months, until the kitchen ceiling started leaking and I had no choice but to get it fixed properly.",
      "I decided to have the whole kitchen redone rather than just patch the ceiling, which in hindsight was either a brilliant idea or a terrible one — I still haven't decided which. I had an electrician rewire the whole room first, since the old wiring wasn't safe. Then I got a plumber to move the sink to the other wall, which meant having the floor pulled up too.",
      "My neighbour, who's renovated three houses, wouldn't let me choose the cheapest contractor. \"Get someone properly qualified to do it,\" she kept saying, \"or you'll end up paying twice.\" I'm glad I listened. The team I hired had the cabinets custom-built instead of buying flat-pack ones, and although it cost more, the quality is obvious.",
      "The hardest part was having to live without a working kitchen for six weeks. I had my sister let me use her kitchen most evenings, and I got very used to eating sandwiches. My partner wanted to have the whole thing done in white, but I made him agree to a bit of colour on the cabinets in the end.",
      "It's finished now, and honestly, I can't stop looking at it. Next, I'm having the bathroom done — though I might let a few more months pass before I mention that to my partner.",
      "Friends keep asking me to recommend the team we used, and I always say the same thing: get quotes from at least three companies, and don't let anyone pressure you into signing on the first visit. I very nearly had a much less careful contractor talk me into starting work the same week we met, and I'm relieved I didn't let him.",
    ],
    questions: [
      { type: "reading comprehension", question: "What started the whole renovation?", answer: "A leaking kitchen ceiling." },
      { type: "reading comprehension", question: "What did the neighbour advise about choosing a contractor?", answer: "To get someone properly qualified, not the cheapest option." },
      { type: "reading comprehension", question: "Where did the writer eat most evenings during the renovation?", answer: "At their sister's house." },
    ],
  },

  embedded_questions: {
    title: "Interview: Starting a Small Business",
    passage: [
      "Interviewer: Thanks for joining us. Could you tell me how you first got the idea for the business?",
      "Guest: Of course. I was working in a café and I kept noticing how many people asked if we sold gluten-free bread. I started wondering whether there was actually a real gap in the market, so I did some research.",
      "Interviewer: I'd be interested to know what that research involved.",
      "Guest: Mostly just talking to people. I asked friends and strangers alike what frustrated them about buying gluten-free products, and I was surprised by how many said the same thing — that it was either expensive or tasted terrible. That told me exactly what I needed to fix.",
      "Interviewer: Could you explain how you funded the first year?",
      "Guest: I'd rather not say the exact figure, but I can tell you it wasn't much. I remember wondering how on earth I was going to afford proper equipment. In the end I asked family for a small loan and I'm still paying it back.",
      "Interviewer: Do you know what you would do differently if you were starting again?",
      "Guest: Definitely. I'd want to know much earlier who my actual customers were, rather than guessing. I spent months making products I assumed people wanted, without ever asking whether they did.",
      "Interviewer: I'd also love to know how you'd respond to people who say now simply isn't the right time to start something new.",
      "Guest: I'd ask them to consider whether there's ever really a perfect time, or whether that's just a comfortable excuse. I could have told myself the same thing for another five years.",
      "Interviewer: Finally, I wonder if you could tell our listeners what advice you'd give someone in the same position now.",
      "Guest: I'd say: don't worry about whether your idea sounds impressive. Worry about whether it solves a real problem. That's really all that matters in the end.",
    ],
    questions: [
      { type: "reading comprehension", question: "Where did the guest work before starting the business?", answer: "In a café." },
      { type: "reading comprehension", question: "How did the guest fund the first year?", answer: "With a small loan from family." },
      { type: "reading comprehension", question: "What does the guest say matters most about a business idea?", answer: "Whether it solves a real problem." },
    ],
  },

  future_in_past: {
    title: "The Plan That Didn't Happen",
    passage: [
      "Ten years ago, I was completely certain about my future. I was going to move to Berlin, learn German properly, and work as a translator. I'd already told everyone at university that I would be leaving the country within a year of graduating.",
      "My best friend, who was going to travel with me, backed out first — she'd met someone and decided she was going to stay closer to home instead. I told myself it wouldn't change my plans, but looking back, it clearly shook my confidence more than I admitted at the time.",
      "Then a temporary job offer came up, the kind I thought I was only going to do for a few months while I saved money for the move. That was eight years ago. I never left. The job I was only going to do briefly became a career I actually love, in a city I never expected to stay in.",
      "I sometimes wonder what would have happened if things had gone the way I originally planned. Would I be living in Berlin now, working as a translator like I always imagined? Possibly. But I don't think I'd trade what I actually built instead.",
      "My friend, the one who was supposed to come with me, still jokes that we were going to have this whole adventure together and instead we both just... stayed. We laugh about it now, but at the time it felt like everything had fallen apart.",
      "Life rarely follows the plan you were so sure about. I've made peace with that — mostly, anyway.",
      "These days, when younger colleagues tell me confidently what they're going to be doing in ten years, I just smile and wish them luck, quietly certain their real story will end up being far stranger, and probably far better, than whatever they've currently got planned.",
    ],
    questions: [
      { type: "reading comprehension", question: "What was the writer originally planning to do?", answer: "Move to Berlin and work as a translator." },
      { type: "reading comprehension", question: "What made the writer's friend change her plans?", answer: "She met someone and decided to stay closer to home." },
      { type: "reading comprehension", question: "What eventually became the writer's career?", answer: "The temporary job they thought they'd only do briefly." },
    ],
  },

  third_conditional: {
    title: "Looking Back: My Career Choices",
    passage: [
      "People often ask if I regret becoming a teacher instead of pursuing engineering, which is what I originally studied. Honestly, the answer changes depending on the day, but mostly, no — I don't think I would have been happier the other way.",
      "If I had finished my engineering degree, I would probably have taken a graduate job at the firm where I did my internship. If I'd done that, I would have earned considerably more money in my twenties than I did as a trainee teacher. There's no getting around that fact.",
      "But if I hadn't switched to teaching, I wouldn't have met my closest friends, all of whom I met during my training year. And if I hadn't taken that first teaching post in a small rural school, I would never have discovered how much I actually enjoy working with teenagers, which surprised me at the time.",
      "There were harder years too. If I hadn't had such a supportive mentor early on, I think I would have quit within the first twelve months — the workload nearly broke me. If she hadn't sat with me every week helping me plan lessons, I honestly don't know if I would have lasted.",
      "Would I have been wealthier as an engineer? Almost certainly. Would I have been happier? I genuinely doubt it. If I could go back and choose again, knowing everything I know now, I think I would still have chosen this path — just with a little more confidence, and a lot less panic in that first year.",
      "My old university friends, several of whom did stay in engineering, sometimes tell me they envy the sense of purpose I describe in my job. If they'd known that at twenty, they say, a few of them might have made a different choice entirely. Funny how certain everyone feels about a decision, right up until they hear someone else's version of the path they didn't take.",
    ],
    questions: [
      { type: "reading comprehension", question: "What did the writer originally study?", answer: "Engineering." },
      { type: "reading comprehension", question: "What would have happened if the writer had finished the engineering degree?", answer: "They would have taken a graduate job at the firm where they did their internship." },
      { type: "reading comprehension", question: "What might have happened without the supportive mentor?", answer: "The writer thinks they would have quit within the first twelve months." },
    ],
  },

  education_systems: {
    title: "Two Systems, Two Childhoods",
    passage: [
      "When Priya moved from India to Finland at age eleven, the difference in her education nearly gave her whiplash. Back home, her days had been long — six hours of classes followed by two more of private tutoring, all building toward a single set of exams that would determine which university she could attend.",
      "In Finland, she found something almost unrecognisable. School started later in the morning, homework was minimal, and formal testing barely existed before the age of sixteen. \"My first week, I kept waiting for the real lessons to start,\" she said. \"It took me a month to realise this was the real thing.\"",
      "The two systems reflect very different philosophies. India's, like many across Asia, emphasises rigorous, exam-focused preparation from an early age, producing students who perform strongly in standardised international tests. Finland's approach prioritises play, wellbeing, and independent thinking, trusting that academic results will follow naturally rather than being forced through pressure.",
      "Neither system is without critics. Indian education reformers have long argued that the exam culture causes enormous stress and crowds out creativity, while some Finnish employers have quietly questioned whether graduates leave school with sufficiently competitive technical skills for certain fields.",
      "Priya, now finishing university in Helsinki, has an unusually balanced perspective. \"I think I got the discipline from India and the confidence from Finland,\" she said. \"If I'd only had one, I don't think I'd have turned out half as well.\" Education researchers increasingly agree that no single system has it entirely right — and that the most resilient students may be exactly those, like Priya, who've experienced more than one.",
      "She now mentors newly arrived international students at her university, many of whom describe the same disorientation she once felt. \"I tell them it gets easier,\" she said, \"but also that they should hold onto whatever their old system gave them. You don't have to choose just one way of learning to be good at it.\"",
    ],
    questions: [
      { type: "reading comprehension", question: "How old was Priya when she moved to Finland?", answer: "Eleven." },
      { type: "reading comprehension", question: "What does the Indian system Priya describes focus heavily on?", answer: "Exams and rigorous, exam-focused preparation." },
      { type: "reading comprehension", question: "What does Priya say she gained from each system?", answer: "Discipline from India and confidence from Finland." },
    ],
  },

  work_life_balance: {
    title: "Why I Started Saying No",
    passage: [
      "For most of my twenties, I wore busyness like a badge of honour. I answered emails at midnight, skipped lunch breaks most days, and genuinely believed that anyone who left the office at five o'clock simply wasn't ambitious enough.",
      "The wake-up call came two years ago, when I collapsed at my desk from exhaustion and spent three days in hospital being told, quite bluntly, that I was heading toward burnout. It's an unpleasant thing to hear at twenty-eight, but it forced a reckoning I'd been avoiding for years.",
      "So I made changes, slowly and imperfectly. I started leaving work at a fixed time, even when there was more to do. I stopped checking email after seven in the evening, which felt genuinely uncomfortable at first, almost like withdrawal. I began saying no to projects that weren't essential, something I'd never allowed myself before.",
      "The results surprised me. My productivity during working hours actually improved, not despite the boundaries but because of them. I made fewer careless mistakes. I started reading again, something I'd abandoned entirely during my most \"productive\" years. My relationships improved too, since I was finally present in them instead of mentally drafting emails at dinner.",
      "I won't pretend this shift was easy, and I still slip back into old habits during busy periods. But I no longer believe exhaustion is proof of value. These days, when a colleague tells me proudly that they haven't taken a lunch break in weeks, I don't feel envious anymore. I just feel a little worried for them, remembering exactly where that road leads.",
      "My manager, to her credit, has noticed the change and never once made me feel guilty about it. If anything, she says my output has become more reliable, which is a strange thing to hear after years of assuming reliability required constant availability instead.",
    ],
    questions: [
      { type: "reading comprehension", question: "What happened to the writer two years ago?", answer: "They collapsed at their desk from exhaustion and spent three days in hospital." },
      { type: "reading comprehension", question: "What is one change the writer made?", answer: "Leaving work at a fixed time / not checking email after 7pm / saying no to non-essential projects." },
      { type: "reading comprehension", question: "How does the writer feel now when a colleague brags about skipping lunch?", answer: "Worried for them, not envious." },
    ],
  },

  success_motivation: {
    title: "Interview: What Actually Drives Success",
    passage: [
      "Interviewer: You've coached hundreds of athletes and executives. What's the biggest myth about motivation you'd like to correct?",
      "Coach: That it's a feeling you either have or don't have. People imagine successful people wake up every day bursting with drive, and honestly, that's almost never true. Motivation is unreliable. What actually separates people who achieve their goals from those who don't is habit, not motivation.",
      "Interviewer: Can you give an example?",
      "Coach: Sure. I worked with a marathon runner who told me she rarely feels like training. What she has instead is a system — she trains at six every morning regardless of mood, because the decision was already made the night before. She's removed the need to feel motivated at all.",
      "Interviewer: That sounds almost mechanical.",
      "Coach: In a good way, though. Relying on motivation is exhausting because it forces you to negotiate with yourself constantly. Building systems removes that friction. It's the difference between deciding whether to exercise every single day and simply having already decided, permanently, months ago.",
      "Interviewer: What about setbacks? Surely those affect people's drive.",
      "Coach: Enormously, and that's actually healthy. The athletes who recover fastest from failure aren't the ones who never doubt themselves — they're the ones who've built enough structure around their goals that a bad week doesn't destroy the whole plan. Resilience isn't the absence of doubt. It's a system strong enough to survive it.",
      "Interviewer: Any final advice for someone struggling right now?",
      "Coach: Stop waiting to feel ready. Build one small habit you can repeat even on your worst day, and trust that over time. Motivation will come and go regardless of what you do, but a habit you've protected through the boring, unmotivated weeks is the thing that's actually still there when the excitement eventually fades.",
    ],
    questions: [
      { type: "reading comprehension", question: "According to the coach, what actually separates successful people from others?", answer: "Habit, not motivation." },
      { type: "reading comprehension", question: "What example does the coach give of a system replacing motivation?", answer: "A marathon runner who trains at 6am regardless of mood, because the decision is already made." },
      { type: "reading comprehension", question: "What does the coach say about resilience?", answer: "It isn't the absence of doubt, but a system strong enough to survive it." },
    ],
  },

  cultural_differences: {
    title: "Six Months In: Lessons From Living Abroad",
    passage: [
      "I moved to Tokyo six months ago, and I'm still collecting embarrassing stories about the things I got wrong. My first week, I tipped a waiter, which I later learned can actually be seen as slightly insulting here, as though I was implying he needed the extra cash rather than trusting the service to speak for itself.",
      "Then there was the meeting where I kept trying to fill every silence, assuming my Japanese colleagues were uncomfortable, when in fact the pauses were intentional — a normal, comfortable part of how they think and communicate. My constant talking probably came across as pushy rather than friendly.",
      "The trickiest lesson has been around disagreement. Where I'm from, saying \"I completely disagree\" in a meeting is unremarkable. Here, a much softer approach is expected, and directness that would seem perfectly normal at home can come across as almost aggressive. I've had to learn to read what isn't being said just as carefully as what is.",
      "Not everything has been difficult to adjust to. The punctuality here has genuinely spoiled me — trains that are apologised for being ninety seconds late feel almost comical after years of unpredictable transport back home. And the emphasis on group harmony, which frustrated me at first, has slowly started to feel less like restriction and more like consideration.",
      "What surprises me most, looking back, is how much of my early confusion came from assuming my own culture's norms were simply \"normal,\" rather than one option among many. Six months in, I still make mistakes weekly. But I've stopped being embarrassed by them, and started treating each one as proof I'm actually paying attention, rather than evidence I don't belong here.",
    ],
    questions: [
      { type: "reading comprehension", question: "Why did tipping the waiter cause a problem?", answer: "It can be seen as slightly insulting in Japan, implying the waiter needed extra cash." },
      { type: "reading comprehension", question: "What did the writer misunderstand about the silences in meetings?", answer: "They assumed colleagues were uncomfortable, when the pauses were intentional and normal." },
      { type: "reading comprehension", question: "What has genuinely impressed the writer about living there?", answer: "The punctuality (trains apologising for being 90 seconds late)." },
    ],
  },

  climate_change: {
    title: "The Town That Moved",
    passage: [
      "Ten years ago, Marta Olsen's grandparents' house stood a comfortable two hundred metres from the sea. Today, waves reach the foundations at high tide, and the whole street has been officially condemned. Her small coastal town in northern Denmark is one of a growing number relocating entire neighbourhoods inland as rising seas and increasingly severe storms make the coastline unlivable.",
      "\"We used to think of this as something that would happen eventually, to someone else,\" Olsen said. \"Then eventually became now, and someone else became us.\" Scientists studying the region say erosion rates have roughly tripled since the 1990s, driven by warming oceans and the loss of natural sea ice that once buffered winter storms.",
      "The town council has approved a plan to relocate forty-three households over the next five years, funded partly by national government and partly by a controversial coastal levy on new construction elsewhere in the country. Not everyone has welcomed the plan. Some residents, particularly older ones, have refused to leave homes their families have owned for generations, arguing that the risk is exaggerated.",
      "Climate scientists disagree. Projections suggest that without significant intervention, similar retreats will be necessary in dozens of coastal communities worldwide within the next three decades, from Louisiana to Bangladesh to the Pacific islands. What makes Denmark's case notable, researchers say, is not the relocation itself but the transparency of the planning — most affected countries are still debating whether to acknowledge the problem publicly at all.",
      "For Olsen, the science is almost beside the point now. \"I don't need a graph to tell me the sea is closer than it used to be,\" she said, looking out at the water from what remains of her grandparents' garden. \"I can see it every single morning.\"",
    ],
    questions: [
      { type: "reading comprehension", question: "How much has the sea's distance from Olsen's grandparents' house changed?", answer: "It used to be 200 metres away; now waves reach the foundations at high tide." },
      { type: "reading comprehension", question: "How much have erosion rates increased since the 1990s?", answer: "Roughly tripled." },
      { type: "reading comprehension", question: "What makes Denmark's approach notable, according to researchers?", answer: "The transparency of the planning, compared to other countries still debating whether to acknowledge the problem." },
    ],
  },

  technology_daily_life: {
    title: "A Day Without My Phone",
    passage: [
      "I decided, somewhat impulsively, to leave my phone at home for an entire Saturday. What I expected was relief. What I got instead was a strange kind of disorientation that revealed just how deeply technology has reshaped even the most ordinary parts of my day.",
      "The first problem appeared before I'd even left the house: I couldn't check the weather, so I had to actually look out the window and guess, something I honestly couldn't remember doing in years. Then I realised I had no way to pay for the bus, since I'd stopped carrying cash months ago in favour of a contactless payment app.",
      "At the supermarket, I found myself reaching for my phone to scan a discount code that, of course, wasn't there. I ended up paying full price and feeling oddly cheated by my own forgetfulness. Later, meeting a friend in a busy park, I had no way to message her when I couldn't find the right entrance, so I simply had to wait, and wonder, the way people presumably did for most of human history.",
      "What struck me most wasn't the inconvenience but how automatic my dependence had become. I hadn't consciously decided to let an app manage my calendar, my payments, my navigation, and my social life all at once — it had simply happened, gradually, one small convenience at a time, until stepping away from it felt less like a break and more like losing a limb.",
      "By evening, I'll admit I missed it badly, and I collected my phone with something close to relief. But the experiment left me with an uncomfortable question I still haven't fully answered: how much of my daily life do I actually control anymore, and how much has quietly been handed over to a screen I barely notice I'm holding?",
    ],
    questions: [
      { type: "reading comprehension", question: "What was the first problem the writer faced without a phone?", answer: "They couldn't check the weather, so had to look out the window and guess." },
      { type: "reading comprehension", question: "How did the writer usually pay for things instead of using cash?", answer: "A contactless payment app." },
      { type: "reading comprehension", question: "What question does the experiment leave the writer with?", answer: "How much of their daily life they actually control versus has handed over to their phone." },
    ],
  },

  money_and_economy: {
    title: "Why Prices Keep Rising, Explained Simply",
    passage: [
      "Every few months, someone asks me to explain inflation in a way that actually makes sense, rather than the vague economics-textbook version most people half-remember. So here's my attempt, using the supermarket as an example rather than abstract percentages.",
      "Imagine a loaf of bread costs two pounds today. If inflation runs at five percent this year, that same loaf will likely cost around two pounds ten next year, assuming nothing else changes. On its own, that seems trivial. But apply that same five percent to your rent, your electricity bill, your weekly shop, and your annual salary needs to rise by roughly the same amount just for you to stand still financially, let alone get ahead.",
      "This is where things get uncomfortable for a lot of households: wages rarely rise in perfect step with prices. Employers adjust salaries once a year, if that, while prices at the supermarket can shift monthly or even weekly. The gap between those two speeds is exactly what people mean when they say their money \"doesn't stretch as far as it used to.\"",
      "The economy behind all this is genuinely complicated — supply chains, energy costs, interest rates, and government spending all interact in ways even experts argue about constantly. But the everyday experience of inflation is much simpler than the theory: it's the quiet, cumulative feeling of noticing that your regular shop costs more this month than it did last month, without your income explaining why.",
      "Central banks try to manage this by raising interest rates, which is supposed to slow spending and cool prices down, though it also makes mortgages and loans more expensive in the meantime — which is its own kind of painful trade-off. There's rarely a solution that doesn't hurt somebody in the short term; the debate is mostly about who, and for how long.",
    ],
    questions: [
      { type: "reading comprehension", question: "In the bread example, how much would a £2 loaf cost after 5% inflation?", answer: "Around £2.10." },
      { type: "reading comprehension", question: "What does the writer say people mean when they say money 'doesn't stretch as far as it used to'?", answer: "The gap between how fast wages rise and how fast prices rise." },
      { type: "reading comprehension", question: "What do central banks do to try to slow inflation?", answer: "Raise interest rates." },
    ],
  },

  crime_and_law: {
    title: "A Different Kind of Punishment",
    passage: [
      "When seventeen-year-old Daniel was caught shoplifting for the third time, the local court offered his family an unusual choice: a standard court process, or participation in a restorative justice programme, where Daniel would meet the shop owner face to face rather than simply receive a fine.",
      "His mother admits she was sceptical. \"I thought it sounded soft, honestly,\" she said. \"Like he was getting away with something.\" What actually happened, she said, was harder for Daniel than any fine could have been. Sitting across from the shop owner, who explained calmly how repeated thefts had affected a small family business already struggling to survive, forced Daniel to confront the real consequences of his actions in a way an anonymous court date never could.",
      "Restorative justice programmes like this one are expanding across the country, driven by research suggesting they reduce reoffending more effectively than traditional punishment for certain crimes, particularly among young, first-time offenders. Supporters argue that conventional sentencing often teaches avoidance — how not to get caught — rather than genuine accountability.",
      "Critics remain unconvinced, particularly for more serious offences. Victims' advocacy groups have warned that face-to-face meetings should never be mandatory, and that the emotional burden of confronting an offender shouldn't be placed on victims who may not be ready, or willing, to participate. The shop owner in Daniel's case volunteered enthusiastically, but campaigners note this isn't always the case, and programmes must remain genuinely optional on both sides.",
      "Daniel completed six months of community work alongside the meeting, and hasn't reoffended since. \"I still think about that conversation more than I think about any fine I could have paid,\" he said. Whether his experience represents a genuine model for the future of youth justice, or simply one case among many that could have gone differently, remains a question researchers are still working to answer.",
    ],
    questions: [
      { type: "reading comprehension", question: "What choice was Daniel's family offered?", answer: "A standard court process or a restorative justice programme." },
      { type: "reading comprehension", question: "What did the shop owner explain to Daniel?", answer: "How repeated thefts had affected the small family business." },
      { type: "reading comprehension", question: "What do critics warn about restorative justice meetings?", answer: "That they should never be mandatory for victims, who may not be ready or willing to participate." },
    ],
  },

  arts_and_entertainment: {
    title: "Streaming Changed Everything — Did It Change It for the Better?",
    passage: [
      "Fifteen years ago, watching a new film meant either going to the cinema or waiting months for a DVD release. Today, thousands of titles sit permanently at our fingertips, ready within seconds, and an entire generation has grown up barely understanding the concept of waiting for entertainment at all.",
      "The shift has undeniably democratised access. A teenager in a small town with no cinema now has the same library available as someone in a major city, something unthinkable a generation ago. Independent filmmakers, once locked out by the enormous cost of theatrical distribution, can now reach global audiences directly through streaming platforms, occasionally launching entire careers from a single unexpected hit.",
      "But the shift has costs that are only becoming clear now. Attention spans, several studies suggest, have genuinely shortened, partly because streaming platforms are financially incentivised to keep viewers skimming rather than deeply engaged — the algorithm rewards constant novelty, not patience. Cinemas, meanwhile, have closed in worrying numbers, and with them, a communal experience that many argue can't be replicated on a laptop screen, however large.",
      "There's also a quieter cultural cost worth naming: the shared reference points a whole society once had, from watching the same handful of channels, have fragmented into thousands of individual algorithmic bubbles. Two friends can now watch television constantly and have almost nothing in common to discuss, each locked into a personalised feed the other has never seen.",
      "None of this suggests streaming was a mistake — the convenience and access are real, and dismissing them would be dishonest. But it's worth asking, occasionally, what exactly we traded for that convenience, and whether we noticed the trade happening at all before it was already complete. Perhaps the most useful question isn't whether streaming changed entertainment, which it obviously did, but whether we're using that change deliberately, or simply drifting along with whatever the algorithm decides to show us next.",
    ],
    questions: [
      { type: "reading comprehension", question: "What is one benefit of streaming mentioned in the passage?", answer: "It has democratised access to entertainment / let independent filmmakers reach global audiences." },
      { type: "reading comprehension", question: "What do studies suggest streaming has done to attention spans?", answer: "Shortened them." },
      { type: "reading comprehension", question: "What 'quieter cultural cost' does the writer mention?", answer: "Shared reference points/culture fragmenting into individual algorithmic bubbles." },
    ],
  },

  future_perfect: {
    title: "By 2050: A Look at What's Coming",
    passage: [
      "Predicting the future is a famously unreliable business, but scientists across several fields are willing to make cautious estimates about where things are headed over the next few decades — and by many accounts, the changes will have been dramatic.",
      "By 2040, according to most energy researchers, the majority of new cars sold worldwide will have switched to electric power, and several major cities will have banned petrol vehicles from their centres entirely. By that same point, renewable sources will likely have overtaken fossil fuels as the world's primary source of electricity for the first time in over a century.",
      "Medicine is expected to shift just as dramatically. Researchers predict that by 2045, doctors will have developed personalised treatments for several major cancers based on a patient's individual genetic code, rather than the broadly standardised treatments used today. Some scientists go further, suggesting that by 2050, average life expectancy in wealthy nations will have increased by several more years, driven largely by these advances.",
      "Not every prediction is optimistic. Climate scientists warn that unless emissions are cut sharply, global temperatures will have risen well beyond the targets set in international agreements, and several low-lying coastal regions will have become uninhabitable, forcing large-scale migration. By 2050, some studies estimate hundreds of millions of people will have been displaced by rising seas and extreme weather combined.",
      "Technology, meanwhile, is expected to have reshaped work almost beyond recognition. Automation and artificial intelligence will likely have eliminated many jobs that exist today, while creating others we can't currently imagine — a pattern, economists note, that has repeated with every major technological shift in history. Whether the net effect will have been positive or negative for ordinary workers remains fiercely debated, and probably won't be settled until we're actually living through it.",
    ],
    questions: [
      { type: "reading comprehension", question: "What do most energy researchers predict about cars by 2040?", answer: "Most new cars sold worldwide will have switched to electric power." },
      { type: "reading comprehension", question: "What is predicted for cancer treatment by 2045?", answer: "Personalised treatments based on a patient's genetic code." },
      { type: "reading comprehension", question: "What warning do climate scientists give about coastal regions?", answer: "Some will have become uninhabitable, forcing large-scale migration." },
    ],
  },

  present_perfect_continuous: {
    title: "Six Months of Learning to Run",
    passage: [
      "I've been trying to become a runner, on and off, for about six years. I say \"trying\" deliberately, because until recently I hadn't been sticking with it for longer than a few weeks at a time before some excuse — weather, tiredness, a vague sense that I simply wasn't built for it — ended the attempt.",
      "This time has been different. I've been getting up at six every morning for the past six months, which is longer than I've been doing almost anything consistently in my adult life. My knees have been aching most weeks, and I've definitely been complaining about it to anyone who'll listen, but I haven't stopped, which surprises me more than anyone.",
      "What's changed, I think, is that I've been focusing on consistency rather than speed. In previous attempts, I'd been pushing myself too hard too quickly, and I'd been getting injured or discouraged within a month. This time, I've been running slowly, almost embarrassingly slowly, and it's been working in a way nothing else has.",
      "My sister, who's been running for years, has been checking in on me most weeks, and I think her quiet encouragement has been keeping me going more than I've admitted to her. She's been telling me for years that the hardest part isn't the running itself, it's just showing up, and I've finally started believing her.",
      "I still wouldn't call myself a runner, not really — I've only been managing about three kilometres, and I've been walking part of that most days. But I've been noticing changes I didn't expect: I've been sleeping better, I've been feeling calmer generally, and for the first time in years, I haven't been dreading the mornings. That, more than any distance I've covered, feels like the real progress.",
    ],
    questions: [
      { type: "reading comprehension", question: "How long has the writer been trying to become a runner in total?", answer: "About six years, on and off." },
      { type: "reading comprehension", question: "What has the writer been doing differently this time?", answer: "Focusing on consistency and running slowly, rather than pushing too hard too quickly." },
      { type: "reading comprehension", question: "What changes has the writer been noticing besides running distance?", answer: "Sleeping better, feeling calmer, not dreading mornings." },
    ],
  },

  prefixes_suffixes_adjectives: {
    title: "Restaurant Review: The Blue Table",
    passage: [
      "I'll admit I walked into The Blue Table with fairly unrealistic expectations, having heard nothing but unbelievable praise from friends for months. The result, thankfully, was mostly reassuring rather than disappointing.",
      "The restaurant itself is small and slightly disorganised-looking from the outside, tucked between a launderette and a closed bookshop, which I found oddly charming rather than off-putting. Inside, the staff were thoughtful without being overbearing, checking in just enough without becoming irritating, which is a genuinely underrated skill in hospitality.",
      "The starter, a beetroot soup, was colourful and flavourful, though slightly overpriced for the portion size. My main course, however, more than made up for it: a beautifully cooked lamb dish that was tender rather than chewy, generously seasoned without being overwhelming. My dining companion's vegetarian option was, in her careless wording, \"annoyingly perfect,\" which I took to mean she had no complaints whatsoever.",
      "Not everything worked. The dessert menu felt uninspired compared to the rest, with a chocolate tart that was forgettable rather than memorable, and service during the busiest period grew noticeably slower, verging on neglectful for about twenty minutes. It's a minor, forgivable flaw in an otherwise carefully considered evening, but worth mentioning for anyone visiting on a Saturday night.",
      "Would I go back? Almost certainly, though I'd probably time my visit more carefully. The Blue Table isn't a flawless restaurant, but it's a genuinely thoughtful one, run by people who clearly care rather than simply going through the motions. In a city full of forgettable openings, that alone makes it worth your evening.",
      "If you're the impatient type, I'd suggest booking earlier in the week rather than risking a Saturday, unless you're happy to wait a little longer than expected for an otherwise reliably enjoyable meal.",
    ],
    questions: [
      { type: "reading comprehension", question: "Where is The Blue Table located?", answer: "Between a launderette and a closed bookshop." },
      { type: "reading comprehension", question: "What was the writer's main criticism?", answer: "The dessert was uninspired/forgettable, and service slowed during the busiest period." },
      { type: "reading comprehension", question: "Would the writer go back?", answer: "Yes, almost certainly, though they'd time their visit more carefully." },
    ],
  },

  wish_if_only: {
    title: "Advice Column: Is It Too Late to Change Careers?",
    passage: [
      "Dear columnist, I'm thirty-eight and I often think, if only I'd studied medicine instead of business, I'd be doing work that actually feels meaningful. I wish I'd made a braver choice at eighteen. Is it too late to start again? — Regretful in Leeds",
      "Dear Regretful, I wish I could tell you there's a version of this decision without loss, but there isn't, and I won't pretend otherwise. If only every career change came without risk, we'd all make them constantly. It doesn't, and that's precisely why the question matters so much to you now.",
      "That said, I think you're focusing on the wrong regret. You wish you'd chosen differently at eighteen, but eighteen-year-old you didn't have the self-knowledge you have now — wishing they'd known what you know today is, frankly, an unfair standard to hold anyone to. The more useful question isn't \"what if I'd chosen differently then,\" but \"what would I regret more: trying now and possibly failing, or not trying at all?\"",
      "I hear from readers constantly who say, years later, if only I'd taken the leap when I first considered it. I almost never hear the opposite — someone who deeply regrets having tried something meaningful, even if it didn't work out exactly as planned. That pattern should tell you something.",
      "Thirty-eight isn't eighteen, certainly, and retraining will demand real sacrifice: money, time, possibly starting at a lower position than you currently hold. If only change were free, we'd all be braver about it. But it isn't too late, not in any way that actually matters. I wish you luck, Regretful — though I suspect, from the tone of your letter, you've already half-decided what you're going to do.",
    ],
    questions: [
      { type: "reading comprehension", question: "What career does Regretful wish they had studied?", answer: "Medicine." },
      { type: "reading comprehension", question: "What does the columnist say is the more useful question to ask?", answer: "Whether they'd regret more: trying now and possibly failing, or not trying at all." },
      { type: "reading comprehension", question: "What regret does the columnist say they almost never hear from readers?", answer: "Regretting having tried something meaningful, even if it didn't work out." },
    ],
  },

  gerunds_infinitives: {
    title: "Why We Keep Picking Up New Hobbies",
    passage: [
      "My friend Ana recently decided to take up pottery, having previously tried to learn the violin, attempted to master rock climbing, and briefly considered training for a marathon, all within the space of about eighteen months. When I teased her about it, she shrugged and said she just enjoys trying new things, and stopped worrying long ago about finishing them.",
      "It's tempting to dismiss this pattern as flakiness, but psychologists studying hobby culture increasingly suggest it reflects something healthier: an unwillingness to let work define an entire identity. People who refuse to limit themselves to one interest often report avoiding burnout more successfully, precisely because they've stopped expecting a single pursuit to satisfy every need.",
      "There's also something worth noting about why people choose to start these hobbies in the first place. Few adults expect to become professional potters or violinists; they simply want to keep learning without the pressure of needing to succeed. Ana admits she has no intention of ever exhibiting her pottery. She just likes sitting at the wheel, forgetting to check her phone for an hour, and watching something take shape under her hands.",
      "Not everyone finds this approach satisfying, of course. Some people genuinely prefer committing to mastering one skill deeply rather than sampling many casually, and there's real value in that kind of dedication too — nobody becomes excellent at anything without choosing to stick with it through the difficult, unglamorous middle stretch.",
      "Ana's latest project, after pottery, is apparently learning to bake bread properly, having decided that her sourdough starter deserves more commitment than she initially gave it. Whether she'll still be baking in six months is anyone's guess, including hers. But she seems entirely unbothered by not knowing, which might be the most enviable part of her approach to hobbies altogether.",
    ],
    questions: [
      { type: "reading comprehension", question: "What hobbies has Ana tried before pottery?", answer: "The violin, rock climbing, and briefly considering a marathon." },
      { type: "reading comprehension", question: "What do psychologists suggest this pattern reflects?", answer: "An unwillingness to let work define an entire identity / avoiding burnout." },
      { type: "reading comprehension", question: "What is Ana's latest project after pottery?", answer: "Learning to bake bread (sourdough) properly." },
    ],
  },

  describing_trends_data: {
    title: "What the Numbers Show: Coffee Shop Sales",
    passage: [
      "Sales at Bean & Co have fluctuated considerably over the past five years, according to figures released this week, offering a useful snapshot of how the coffee industry has weathered a turbulent period.",
      "Revenue climbed steadily between 2021 and 2022, rising by nearly eighteen percent as pandemic restrictions eased and customers returned to in-person shopping. That growth peaked sharply in early 2023, before falling away just as quickly; sales dropped by almost twelve percent over the following six months, a decline the company attributes largely to rising ingredient costs being passed on to customers through higher prices.",
      "Since then, the trend has levelled off considerably. Sales have remained broadly flat for the past year, hovering within a narrow band regardless of season, which analysts describe as a sign the market has reached a kind of temporary equilibrium after the volatility of previous years.",
      "One figure stands out from the overall data: sales of plant-based milk alternatives have surged dramatically, more than tripling since 2021 and now accounting for almost a third of all milk-based drinks sold. This represents by far the fastest-growing segment of the company's entire product range, dwarfing growth in every other category measured.",
      "Looking ahead, executives predict a gradual uptick over the coming year, driven partly by the opening of several new locations, though they've cautioned against expecting a return to the sharp growth seen in 2022. \"We're looking at steady, modest gains rather than another spike,\" said finance director Tom Reilly. \"The days of dramatic year-on-year jumps are probably behind us for now, at least until the market shifts again in some direction we can't yet predict.\"",
      "Analysts covering the sector broadly agree with this cautious outlook, noting that similar plateaus have appeared across the industry as a whole, not just at Bean & Co specifically.",
    ],
    questions: [
      { type: "reading comprehension", question: "By how much did revenue rise between 2021 and 2022?", answer: "Nearly eighteen percent." },
      { type: "reading comprehension", question: "What does the company blame for the sales drop in 2023?", answer: "Rising ingredient costs being passed on to customers through higher prices." },
      { type: "reading comprehension", question: "What has happened to sales of plant-based milk alternatives?", answer: "They have more than tripled since 2021 and are the fastest-growing segment." },
    ],
  },

  past_modals_deduction: {
    title: "Forum: What Actually Happened to the Missing Painting?",
    passage: [
      "Posted by artmystery92: Okay, has anyone else been following the story of the painting that vanished from the Whitfield Gallery? I've read every article and I still can't work out what must have happened.",
      "Reply from curious_cat: The gallery insists it can't have been an outside job — the security footage shows no one entering after closing. Which means whoever took it must have already been inside the building.",
      "Reply from artmystery92: Right, that's what's bugging me. It must have been someone with staff access, but the gallery says all staff badges were accounted for that night. Unless someone must have cloned a badge, which seems extreme for a mid-sized regional gallery.",
      "Reply from noir_fan: Or the footage might have been tampered with. It can't have been that easy to just walk out with a painting that size without being seen, unless the cameras were somehow disabled beforehand. Someone must have known the exact blind spots.",
      "Reply from curious_cat: That's a good point actually. The painting was oddly small compared to the others though, so it could easily have been hidden under a coat. Whoever took it must have known the collection well enough to pick the one piece that wouldn't be immediately noticed missing.",
      "Reply from artmystery92: Which suggests it wasn't random. It must have been planned in advance, possibly by someone who'd visited multiple times beforehand to study the layout. A casual thief couldn't have known which piece to target so precisely.",
      "Reply from noir_fan: The police haven't released much, but given how quiet they've gone, they might have a suspect already and just aren't saying. Or they genuinely might not have a clue, which honestly wouldn't surprise me either at this point.",
      "Reply from curious_cat: Either way, someone out there knows exactly what happened. I just hope we actually find out eventually, instead of this becoming one of those cases nobody ever solves.",
    ],
    questions: [
      { type: "reading comprehension", question: "Why do forum users think the thief must have been inside the building already?", answer: "Security footage shows no one entering after closing." },
      { type: "reading comprehension", question: "Why does noir_fan think the painting can't have been carried out easily?", answer: "It's odd compared to other paintings' size unless the cameras were disabled or blind spots known — actually: because of its size, unless hidden under a coat / cameras disabled beforehand." },
      { type: "reading comprehension", question: "Why do the forum users think the theft was planned rather than random?", answer: "Whoever took it seemed to know exactly which piece wouldn't be immediately noticed missing." },
    ],
  },

  workplace_professional_vocabulary: {
    title: "Email: Restructuring Announcement",
    passage: [
      "Subject: Team Restructuring — Effective Next Month",
      "Dear team, following an extensive review of our current workflow, we'll be implementing several changes to team structure, effective from the first of next month. I want to outline these clearly and address any concerns directly.",
      "Firstly, the marketing and communications departments will be merged into a single unit, reporting to Priya Shah as Head of Brand. This consolidation aims to streamline our messaging and eliminate the duplication of effort we've identified across both teams over the past quarter.",
      "Secondly, we're introducing a new approvals process for external communications. Going forward, any client-facing material must be signed off by a department head before distribution. I recognise this adds an extra step, but recent feedback has highlighted inconsistencies that this process should resolve.",
      "Thirdly, two positions within the current operations team will be made redundant as part of this restructuring. HR will reach out to affected individuals directly and in confidence this week to discuss next steps, including severance arrangements and support with future job placement. I want to acknowledge that this is difficult news, and I don't take these decisions lightly.",
      "We'll be holding an all-hands meeting on Thursday to address questions and walk through the new organisational chart in detail. In the meantime, please direct any urgent concerns to your line manager rather than raising them in wider team channels, so we can handle individual situations with appropriate discretion.",
      "I appreciate everyone's patience and professionalism as we navigate this transition. These changes are intended to position the company for sustainable growth, and I'm confident that, difficult as this period is, we'll emerge stronger as a result.",
      "Best regards, David Chen, Chief Operating Officer",
    ],
    questions: [
      { type: "reading comprehension", question: "Which two departments are being merged?", answer: "Marketing and communications." },
      { type: "reading comprehension", question: "What new process is being introduced for external communications?", answer: "Client-facing material must be signed off by a department head before distribution." },
      { type: "reading comprehension", question: "Where should employees direct urgent concerns?", answer: "To their line manager, not wider team channels." },
    ],
  },

  advanced_idioms_expressions: {
    title: "Catching Up: A Conversation Between Old Friends",
    passage: [
      "So, how's the new job going? Are you settling in okay?",
      "Honestly, it's been a bit of a baptism of fire. I was thrown in at the deep end the first week — my manager went on leave almost immediately, so I had to hit the ground running with barely any handover.",
      "Ouch. That sounds stressful.",
      "It was, but I think I'm finally getting the hang of it. For the first month I felt like I was constantly playing catch-up, but things have started to click into place recently.",
      "I know that feeling all too well. When I started my job, I felt completely out of my depth for weeks. I kept thinking they'd made a mistake hiring me.",
      "Exactly! I had major imposter syndrome. But my colleague took me under her wing, which honestly saved me. She didn't sugar-coat anything, but she was patient, which I really needed.",
      "That makes such a difference. Having someone in your corner early on is everything.",
      "Definitely. Anyway, enough about work — how's things with you? Last I heard you were thinking of moving.",
      "We're still on the fence about it, to be honest. Part of me wants to take the plunge and just go for it, but another part thinks we should sit tight for another year until things settle financially.",
      "That's fair. No point rushing into something that big. Whatever you decide, I'm sure it'll work out.",
      "Thanks. It's good to know you're just a phone call away if I need to talk it through.",
      "Always. Right, I should get going, but let's not leave it so long next time — we really dropped the ball on staying in touch this year.",
      "Agreed. Let's grab coffee properly soon, no more cancelling last minute!",
    ],
    questions: [
      { type: "reading comprehension", question: "What does the first speaker mean by 'a baptism of fire'?", answer: "A difficult, stressful introduction to something new (the new job)." },
      { type: "reading comprehension", question: "Who helped the first speaker settle into the new job?", answer: "A colleague who took them 'under her wing'." },
      { type: "reading comprehension", question: "What is the second speaker undecided about?", answer: "Whether to move house." },
    ],
  },

  persuading_disagreeing_advanced: {
    title: "Forum Debate: Should University Be Free?",
    passage: [
      "Original post by teacherlife88: Genuinely curious what people think — should university education be free, funded through taxation? I lean strongly in favour, but I'm keen to hear counterarguments.",
      "Reply from finance_guy22: I'd push back on that pretty firmly. Free at the point of use isn't the same as free — someone still pays, and in this case it's every taxpayer, including those who never attend university and arguably benefit least from the system.",
      "Reply from teacherlife88: I take your point, but surely there's a case that an educated population benefits everyone indirectly — better healthcare, stronger economy, and so on. It's not exactly a stretch to argue that funding education is funding the country's future.",
      "Reply from finance_guy22: That's a fair point, and I won't dismiss it entirely, but I'm not fully convinced it holds up. If the goal is genuinely broad societal benefit, wouldn't targeted funding for high-need fields — medicine, engineering — be more efficient than blanket free tuition for every degree, including ones with far less clear public benefit?",
      "Reply from moderate_view: Can I offer a middle ground here? What if we frame this less as free-versus-paid and more as a question of how we structure repayment? Income-based repayment systems, where graduates only pay once they're earning above a certain threshold, seem to address both concerns reasonably well.",
      "Reply from teacherlife88: I see where you're coming from, and that's certainly less extreme than either position, but I'd argue it still leaves graduates burdened by debt for years, which shapes major life decisions like buying a home or having children.",
      "Reply from finance_guy22: Perhaps, but every system involves trade-offs somewhere. My concern with fully free tuition specifically is less about fairness and more about incentives — would it lead to over-enrollment in degrees with genuinely limited job prospects, simply because there's no financial cost attached to enrolling?",
      "Reply from moderate_view: That's a reasonable worry, though I'd argue that's a curriculum and careers-advice problem rather than strictly a funding one. Either way, I don't think there's a perfect answer here — just different trade-offs depending on what we're prioritising as a society.",
    ],
    questions: [
      { type: "reading comprehension", question: "What is finance_guy22's main objection to free university?", answer: "That someone still pays through taxation, including people who never attend and benefit least." },
      { type: "reading comprehension", question: "What compromise does moderate_view suggest?", answer: "Income-based repayment, where graduates only pay once earning above a certain threshold." },
      { type: "reading comprehension", question: "What is finance_guy22's specific concern about fully free tuition?", answer: "That it could lead to over-enrollment in degrees with limited job prospects, since there's no financial cost." },
    ],
  },

  // ===== C1 (12 topics) =====

  passive_reporting_structures: {
    title: "The Mystery of Flight 227",
    passage: [
      "Three days after cargo flight 227 disappeared from radar over the Atlantic, it is still not known exactly what happened to the aircraft or its two-person crew. The plane is believed to have lost contact shortly after entering a severe storm system, and it is thought that the pilots attempted an emergency descent before all communication was lost entirely.",
      "Investigators say the aircraft is understood to have been carrying routine cargo, and no distress signal was ever received, which has been described by aviation experts as unusual given the circumstances. It is widely reported that similar aircraft are equipped with automatic emergency beacons designed to activate on impact, yet none has so far been detected in the search area.",
      "The missing crew are said to have been highly experienced, with the captain alone reported to have logged over eight thousand flying hours across two decades. Colleagues describe him as unfailingly cautious, and it is understood that he had flown the same transatlantic route dozens of times without incident.",
      "Search efforts have been complicated by the weather that likely contributed to the disappearance in the first place. Vessels in the region are reported to have battled waves exceeding six metres for much of the search operation, and it is believed that any wreckage could have drifted a considerable distance from the aircraft's last known position before search teams arrived.",
      "The airline has declined to comment in detail while the investigation continues, though a brief statement noted that the families of the crew are being supported and that \"nothing is being ruled out\" regarding the cause. Aviation analysts contacted by this publication suggest mechanical failure combined with extreme weather is currently considered the most likely explanation, though it is stressed that this remains speculation until wreckage, if any, is recovered.",
      "It has also been reported, though not officially confirmed, that flight data from a similar aircraft model was flagged for a minor communications fault earlier this year, raising questions about whether a wider fleet issue may be involved. The manufacturer has not yet responded to requests for comment on this claim.",
      "For now, families of the crew are said to be waiting for any information at all, however small. As one aviation investigator put it, speaking on condition of anonymity: \"Until wreckage is found, everything anyone tells you is a guess, however educated. We are not in the business of comforting speculation.\"",
    ],
    questions: [
      { type: "reading comprehension", question: "What is the plane believed to have done shortly after entering the storm?", answer: "Lost contact / attempted an emergency descent." },
      { type: "reading comprehension", question: "What is unusual about the missing emergency beacon signal?", answer: "It's designed to activate automatically on impact, yet none has been detected." },
      { type: "reading comprehension", question: "What complicated the search efforts?", answer: "Severe weather / waves exceeding six metres." },
    ],
  },

  memory_mind_psychology: {
    title: "Why You Don't Remember What You Think You Remember",
    passage: [
      "Ask someone to describe a vivid childhood memory, and they'll usually do so with total confidence — the colour of the walls, the exact words spoken, the emotional weight of the moment. What almost none of them realise is that this confidence tells you almost nothing about accuracy. Memory, psychologists have discovered, is far less like a video recording than most people assume, and far more like a story we quietly rewrite every time we tell it.",
      "The landmark research here comes from cognitive psychologist Elizabeth Loftus, whose decades of work demonstrated something genuinely unsettling: false memories can be implanted with surprising ease, and once implanted, they feel exactly as real as genuine ones. In one famous study, Loftus's team convinced a meaningful percentage of participants that they had been lost in a shopping mall as children — an event that had never actually happened — simply by describing it convincingly alongside real memories supplied by family members.",
      "This isn't a fringe phenomenon limited to laboratory conditions. Every time you recall a memory, neuroscientists now understand, you're not retrieving a fixed file from storage; you're actively reconstructing it, and that reconstruction is vulnerable to influence from everything you've learned or heard since the original event. A conversation with a sibling who remembers a family holiday slightly differently, a photograph that doesn't quite match what you recall, a news article about a similar event — all of these can subtly, permanently alter the memory itself, without you ever noticing the change taking place.",
      "The implications extend well beyond idle curiosity about childhood recollections. Eyewitness testimony, long treated in courtrooms as powerful evidence, has come under sustained scrutiny precisely because of this research; witnesses can be entirely sincere, entirely confident, and still be substantially wrong, having unknowingly reconstructed their memory of an event based on suggestive questioning or media coverage encountered afterward. Numerous wrongful convictions have since been traced directly to confident, well-meaning, but ultimately inaccurate eyewitness accounts.",
      "None of this means memory is useless, or that we should distrust everything we recall. Most everyday memories are reasonably reliable for practical purposes, particularly recent or frequently rehearsed ones. But the research offers a valuable, humbling lesson: confidence and accuracy are far less connected than intuition suggests. The next time you find yourself absolutely certain about exactly how something happened years ago, it may be worth pausing to remember — ironically enough — that certainty was never proof of truth in the first place.",
    ],
    questions: [
      { type: "reading comprehension", question: "What did Elizabeth Loftus's shopping mall study demonstrate?", answer: "That false memories can be implanted and feel just as real as genuine ones." },
      { type: "reading comprehension", question: "According to the passage, what happens each time you recall a memory?", answer: "You actively reconstruct it, rather than retrieving a fixed, unchanged file." },
      { type: "reading comprehension", question: "Why has eyewitness testimony come under scrutiny in courtrooms?", answer: "Because witnesses can be sincere and confident yet substantially wrong, having reconstructed their memory based on suggestion or later information." },
    ],
  },

  future_of_work: {
    title: "The Office That Никогда Reopened",
    passage: [
      "When Marisol Fernandez's company sent everyone home in early 2020, she assumed, like most of her colleagues, that it would last a matter of weeks. Five years later, she has never returned to a permanent desk, her company has sold its headquarters entirely, and roughly sixty percent of its four thousand employees now work from locations scattered across a dozen countries.",
      "Fernandez's experience, once considered an unusual exception, has become something closer to the norm across large sections of the global economy. What began as an emergency accommodation has, for many industries, calcified into permanent infrastructure, forcing a fundamental reconsideration of what \"work\" actually requires in terms of physical presence.",
      "The economic implications have proven far more complex than early predictions suggested. Commercial real estate in major cities has been hit hard, with vacancy rates in some downtown business districts remaining stubbornly elevated years after the initial disruption. Meanwhile, smaller towns and suburbs have experienced unexpected economic revival, as workers no longer tethered to a specific office relocate toward cheaper housing and better quality of life, taking their spending power with them.",
      "Not every consequence has been positive. Researchers studying long-term remote work have identified genuine costs alongside the benefits: reduced spontaneous collaboration, weaker mentorship relationships for younger employees who miss out on the informal learning that happens by simply observing colleagues, and, for some workers, a corrosive blurring of boundaries between professional and personal life that has proven difficult to manage without the structure a physical commute once imposed.",
      "Artificial intelligence complicates the picture further still. Automation, once feared primarily as a threat to manufacturing and manual labour, is now reshaping white-collar work at a pace few economists anticipated even five years ago. Entry-level roles in fields like legal research, basic coding, and customer service are being quietly reduced or restructured as AI tools handle tasks that once required junior staff, raising uncomfortable questions about how new graduates will gain the experience previously offered by those very roles.",
      "Fernandez, now managing a fully distributed team across three time zones, remains cautiously optimistic. \"We had to relearn almost everything about how to build trust and culture without shared physical space,\" she said. \"I won't pretend it's been simple, or that we've fully figured it out. But I genuinely don't think we're going back to how things were, whatever gets figured out next. That version of work, I suspect, is gone for good.\"",
    ],
    questions: [
      { type: "reading comprehension", question: "What happened to Fernandez's company's headquarters?", answer: "It was sold entirely." },
      { type: "reading comprehension", question: "What has happened to smaller towns and suburbs as a result of remote work?", answer: "They've experienced unexpected economic revival as workers relocate there." },
      { type: "reading comprehension", question: "What genuine costs of long-term remote work does the passage mention?", answer: "Reduced spontaneous collaboration, weaker mentorship, blurred work-life boundaries." },
    ],
  },

  relationships_modern_life: {
    title: "Swiping Right on Everything: Dating in the Algorithm Age",
    passage: [
      "There was a time, not especially long ago, when meeting a romantic partner typically involved some combination of chance, shared social circles, and geography — you met people through friends, at work, in your neighbourhood, constrained by whoever happened to occupy the same physical spaces as you. That world has largely disappeared for an entire generation, replaced by an economy of profiles, algorithms, and an almost unlimited pool of theoretical options available at any hour of the day.",
      "The appeal is obvious enough. Dating apps have genuinely expanded access for people who might otherwise have struggled to meet partners — those in small towns, those with demanding schedules, those simply too shy to approach strangers in person. For many users, particularly in marginalised communities where finding compatible partners locally was historically difficult, this expanded access has been transformative rather than merely convenient.",
      "Yet a growing body of research suggests the abundance itself creates unexpected psychological costs. Psychologists studying \"choice overload\" have found that when presented with seemingly limitless options, people frequently become less satisfied with any single choice, not more — a phenomenon well documented in consumer behaviour long before it was applied to romance. The nagging sense that a marginally better match might be one swipe away, researchers argue, undermines the patient investment that meaningful relationships typically require to develop.",
      "There's also the matter of how these platforms are designed to function commercially. Dating apps generate revenue by keeping users engaged and, crucially, still searching — a genuinely successful match that leads someone to delete the app entirely represents, from a purely business perspective, a lost customer. Critics argue this creates a structural incentive misaligned with users' actual goals, subtly rewarding continued browsing over successful, lasting connection.",
      "None of this suggests a return to pre-digital dating is either likely or necessarily desirable; the access and convenience these platforms offer are real, and dismissing an entire generation's primary method of meeting partners as somehow inferior seems both condescending and increasingly detached from lived reality. But as dating apps mature from novelty into infrastructure, users and researchers alike are increasingly asking sharper questions about what, exactly, is being optimised for — genuine connection, or simply engagement metrics that happen to resemble it.",
      "Perhaps the more honest framing isn't whether dating apps are good or bad in the abstract, but rather what it means for an entire generation to conduct one of life's most intimate processes through infrastructure explicitly designed, at least in part, to keep them using it a little longer.",
    ],
    questions: [
      { type: "reading comprehension", question: "Who does the passage say dating apps have most transformed access for?", answer: "People in marginalised communities, small towns, or with demanding schedules/shyness." },
      { type: "reading comprehension", question: "What does 'choice overload' research suggest happens with limitless options?", answer: "People become less satisfied with any single choice, not more." },
      { type: "reading comprehension", question: "Why do critics say dating apps have a misaligned incentive?", answer: "They profit from keeping users engaged/searching, so a successful match (deleting the app) is a lost customer." },
    ],
  },

  crime_and_justice: {
    title: "Rethinking Prison: What Norway Got Right",
    passage: [
      "Halden Prison, roughly two hours from Oslo, looks almost nothing like the popular image of incarceration. Inmates live in private rooms with their own bathrooms, cook meals in shared kitchens, and take classes in music production and woodworking. Guards, deliberately unarmed, are trained to build genuine relationships with prisoners rather than simply enforce rules from a distance. To visitors accustomed to more punitive systems, it can look, at first glance, almost indistinguishable from a modest college campus.",
      "The philosophy underpinning Norway's approach is straightforward, if counterintuitive to many outside observers: nearly every incarcerated person will eventually be released, so the central question a justice system should ask isn't how severely to punish someone, but how effectively to prepare them to return to society without reoffending. Norway's reconviction rate, hovering around twenty percent within two years of release, compares strikingly with rates exceeding fifty percent in several countries that favour harsher, more punitive approaches.",
      "Critics, and there are many, argue this comparison oversimplifies matters considerably. Norway is a small, wealthy, relatively homogeneous country with comparatively low crime rates and strong existing social services to begin with; transplanting its prison philosophy wholesale into a country with vastly different social and economic conditions, sceptics argue, ignores the deeper structural factors driving criminal behaviour in the first place. A humane prison, however well designed, cannot single-handedly compensate for entrenched poverty, inadequate mental health infrastructure, or fractured communities that exist long before, and after, any individual's incarceration.",
      "There's also a values-based objection that resists purely statistical rebuttal: many people believe, independent of reoffending rates entirely, that punishment itself serves a legitimate purpose — that certain crimes warrant genuine suffering as a matter of justice for victims, regardless of what best reduces future crime. This isn't a position that can be argued away with recidivism statistics alone, since it rests on a fundamentally different question about what a justice system is actually for.",
      "Proponents of the Norwegian model don't necessarily dispute this tension, but argue that a system oriented primarily around retribution frequently fails on its own terms too, producing more crime rather than less, at enormous ongoing cost to taxpayers who ultimately fund both the prisons and the future crimes of those who reoffend after harsh, ill-prepared release. Whether the answer lies somewhere between these competing philosophies, or requires choosing more decisively between them, remains a genuinely unresolved question — one that different societies, reasonably informed by very different values and circumstances, seem likely to keep answering differently for the foreseeable future.",
    ],
    questions: [
      { type: "reading comprehension", question: "How does Halden Prison differ from typical images of incarceration?", answer: "Inmates live in private rooms with bathrooms, cook in shared kitchens, take classes; guards are unarmed." },
      { type: "reading comprehension", question: "What is Norway's approximate reconviction rate within two years of release?", answer: "Around twenty percent." },
      { type: "reading comprehension", question: "What do critics say about applying Norway's model elsewhere?", answer: "It oversimplifies things, since Norway's small, wealthy, low-crime context differs greatly from other countries." },
    ],
  },

  health_healthcare_systems: {
    title: "Two Systems, Two Bills: A Tale of Two Surgeries",
    passage: [
      "When David Okafor tore his knee ligament playing football in Manchester, his treatment — including surgery, physiotherapy, and follow-up consultations — cost him nothing beyond what he already paid in taxes. His American cousin, Michael, suffering an almost identical injury the same year in Ohio, received a bill exceeding forty thousand dollars, a portion of which his insurance eventually covered after months of negotiation and paperwork.",
      "The two cousins' experiences illustrate, in miniature, one of the most consequential policy divides between wealthy nations: how a society chooses to fund and deliver healthcare. The UK's National Health Service, funded through general taxation and free at the point of use, represents one end of a spectrum; the United States' predominantly private, insurance-based model sits at the other, with most developed nations occupying various hybrid positions in between.",
      "Neither system is without serious drawbacks, a fact often obscured by advocates on either side eager to score political points rather than engage honestly with trade-offs. The NHS, chronically underfunded relative to demand according to many health economists, has struggled for years with lengthening waiting lists; David's surgery, while free, required an eight-month wait that left him unable to work at full capacity for much of that period, a hidden economic cost rarely factored into comparisons that focus purely on out-of-pocket spending.",
      "Michael's experience, meanwhile, illustrates the private system's own well-documented failures: administrative complexity that consumed hours of his time disputing charges, genuine anxiety about whether treatment would be approved before it was even needed, and a base cost so inflated by an opaque, notoriously difficult-to-navigate billing system that comparable treatment in almost any other wealthy nation would have cost a fraction of the amount, even accounting for differences in overall healthcare spending.",
      "Health economists studying outcomes across systems generally find that universal, publicly funded systems tend to produce better population-level health outcomes at lower overall cost, largely by prioritising preventive care and eliminating the profit margins and administrative overhead inherent to competing private insurers. Yet these systems also face real, unresolved tensions around funding sustainability as populations age and treatment costs rise faster than most economies grow, meaning even strong universal systems require difficult, ongoing political choices about taxation and resource allocation that no country has solved definitively.",
      "Neither David nor Michael would claim their system is perfect. David wishes his surgery hadn't required an eight-month wait; Michael wishes he hadn't spent his recovery fielding calls from a billing department rather than simply resting. Their stories suggest less a case for one system being straightforwardly superior, and more a case for the genuinely difficult trade-offs any healthcare system must navigate — trade-offs that different societies, weighing different values around equity, choice, and cost, seem destined to keep balancing differently for years to come.",
    ],
    questions: [
      { type: "reading comprehension", question: "How much did David's knee surgery cost him directly?", answer: "Nothing, beyond what he already paid in taxes." },
      { type: "reading comprehension", question: "What was one hidden cost of David's free NHS treatment?", answer: "An eight-month wait that left him unable to work at full capacity." },
      { type: "reading comprehension", question: "What do health economists generally find about universal, publicly funded systems?", answer: "They tend to produce better population-level health outcomes at lower overall cost." },
    ],
  },

  inversion: {
    title: "Never Had I Felt So Lost",
    passage: [
      "Never had I felt so completely out of my depth as I did on my first day working the night shift at St. Agnes's hospital. Not only was I unfamiliar with half the equipment on the ward, but I also had no idea where anything was kept, having transferred from a much smaller unit only that morning.",
      "Rarely does a hospital corridor feel as long as it did that night, stretching endlessly under flickering fluorescent lights while I searched, increasingly desperate, for a supply cupboard I'd been told was \"just past reception.\" Little did I know that the directions I'd been given referred to an entirely different wing of the building.",
      "Only when a senior nurse found me, quite by accident, wandering in circles near the wrong lift, did I finally admit how lost I actually was. Not once had I wanted to ask for help, some misplaced pride convincing me I ought to figure it out alone. Seldom have I regretted a decision so quickly.",
      "\"Never have I seen someone try quite so hard to avoid asking a simple question,\" she said, not unkindly, before walking me through the entire layout herself. So patient was she, in fact, that by the end of the shift I felt almost embarrassed by how much I'd struggled over something so easily resolved with a single conversation.",
      "Not until several weeks later did I properly understand why that first night had shaken me so badly. It wasn't merely the unfamiliar building, though that was part of it. Nor was it simply exhaustion, though the shift had certainly been long. Only in hindsight did I recognise that what had actually unsettled me was the sudden, disorienting reminder of how much competence depends on context — how thoroughly capable I'd felt in my old ward, and how completely that confidence evaporated the moment the context changed entirely.",
      "Never again have I assumed that competence in one setting automatically transfers to another. Nor have I hesitated, since that night, to ask directions the moment I need them, however small or obvious the question might seem. Rarely has a single uncomfortable shift taught me quite so much, and rarely have I been so grateful, in hindsight, for getting thoroughly, humiliatingly lost.",
      "Not long afterward, I found myself giving that exact same advice to a new starter on my own team, watching her face carry the same quiet panic mine must have carried that night. Only then did I fully understand what that senior nurse must have felt, finding a stranger circling helplessly near the wrong lift, and choosing kindness over judgement anyway.",
    ],
    questions: [
      { type: "reading comprehension", question: "Why was the writer's first night on the ward so difficult?", answer: "They were unfamiliar with the equipment and layout, having just transferred that morning." },
      { type: "reading comprehension", question: "Who eventually helped the writer?", answer: "A senior nurse who found them wandering near the wrong lift." },
      { type: "reading comprehension", question: "What lesson did the writer take from that night?", answer: "That competence in one setting doesn't automatically transfer to another, and to ask for help/directions without hesitation." },
    ],
  },

  mixed_conditionals: {
    title: "The Job I Didn't Take",
    passage: [
      "If I had accepted the transfer to Singapore eight years ago, I would probably be a completely different person today — more confident in some ways, perhaps more isolated in others, certainly wealthier, given the salary difference between what I earn now and what that role would have paid.",
      "I think about it more than I'd like to admit, usually late at night when a work email reminds me of some frustration that a fresh start might have avoided entirely. If I hadn't stayed here to care for my father during his illness, I would be living somewhere else right now, possibly running the regional office I was offered instead of the smaller team I currently manage.",
      "But if I had gone, I wouldn't have been here for those final two years with him, and I don't think any career achievement would have compensated for that absence. If I were the kind of person who could separate work entirely from family obligation, I might be sitting in a much bigger office right now. I'm simply not built that way, and I've mostly made peace with what that costs me professionally.",
      "My old colleague, who did take a similar opportunity around the same time, is now a senior director at a company most people have heard of. If she hadn't taken that risk back then, she wouldn't be where she is today, and she reminds me of this occasionally, not unkindly, when we catch up. If I had made a different decision, I sometimes wonder whether I'd be the one giving her that same reminder instead.",
      "What strikes me most, looking back, isn't regret exactly — it's the strange asymmetry of the decision itself. If I hadn't chosen to stay, I would never have known what I gave up by leaving, and if I had left, I would never have known what staying would have meant either. Every path forecloses the others so completely that comparing them honestly is nearly impossible; you're never actually comparing two real outcomes, only one real outcome against an imagined one that conveniently avoids all the complications the real choice eventually revealed.",
      "If I could go back now, knowing everything I know today, I genuinely don't know which decision I'd make. That uncertainty, more than any specific regret, is probably the most honest answer I have.",
      "If someone had told me at the time that the choice would still feel unresolved a decade later, I don't think I would have believed them. I assumed decisions like that eventually settled, one way or another. Apparently, some of them simply don't, and perhaps they were never supposed to.",
    ],
    questions: [
      { type: "reading comprehension", question: "What opportunity did the writer turn down eight years ago?", answer: "A transfer to Singapore." },
      { type: "reading comprehension", question: "Why did the writer stay?", answer: "To care for their father during his illness." },
      { type: "reading comprehension", question: "What has happened to the writer's old colleague who took a similar opportunity?", answer: "She is now a senior director at a well-known company." },
    ],
  },

  advanced_vocabulary: {
    title: "Book Review: A Quiet, Devastating Debut",
    passage: [
      "It would be easy to dismiss The Long Winter as yet another entry in the increasingly crowded genre of quiet literary fiction about grief, were it not for how thoroughly it earns its emotional weight rather than simply assuming it. Debut novelist Fiona Marsh has produced a work of remarkable restraint, one that resists the temptation toward melodrama at nearly every turn, opting instead for a kind of accumulated, understated devastation that lingers considerably longer than more overtly dramatic treatments of similar material.",
      "The novel follows Aisling, a widowed schoolteacher navigating her first winter alone in rural Ireland, but to describe it purely in terms of plot is to fundamentally misrepresent what makes it succeed. Marsh's prose is spare almost to the point of austerity, yet never feels impoverished; each carefully chosen sentence carries a density of implication that more verbose writers might require an entire paragraph to convey. There is an admirable discipline here, a willingness to trust the reader with silence and inference rather than spelling out every emotional beat.",
      "What elevates the novel beyond competent grief fiction into something genuinely exceptional is Marsh's unflinching honesty about the less palatable aspects of mourning — the irritation Aisling feels toward well-meaning neighbours, the guilty relief that occasionally punctures her sorrow, the way grief coexists uncomfortably alongside the mundane logistics of daily life rather than replacing them entirely. This refusal to sanitise mourning into something purely noble or dignified gives the book a credibility that many comparable novels, however well-intentioned, ultimately lack.",
      "That said, the novel isn't without shortcomings. The secondary characters, while serviceable, rarely achieve the same interiority afforded to Aisling herself, occasionally functioning more as narrative devices than fully realised people in their own right. The pacing, too, occasionally sags in the middle third, where the accumulation of small, quiet moments begins to feel less like deliberate restraint and more like genuine hesitation about where the narrative is actually heading.",
      "These are relatively minor criticisms, however, against the backdrop of what Marsh has otherwise accomplished. This is a confident, exquisitely controlled debut that announces a genuine talent rather than merely a promising one. Readers drawn to introspective, character-driven fiction will find much to admire here; those seeking plot-driven momentum should look elsewhere. For the right reader, though, The Long Winter is likely to prove not merely good, but quietly unforgettable — the sort of novel that reveals its full weight only gradually, well after the final page has been turned.",
    ],
    questions: [
      { type: "reading comprehension", question: "What does the novel The Long Winter follow?", answer: "A widowed schoolteacher (Aisling) navigating her first winter alone in rural Ireland." },
      { type: "reading comprehension", question: "What does the reviewer say elevates the novel beyond typical grief fiction?", answer: "Marsh's unflinching honesty about the less palatable aspects of mourning." },
      { type: "reading comprehension", question: "What criticism does the reviewer make of the novel?", answer: "Secondary characters lack interiority, and pacing sags in the middle third." },
    ],
  },

  cleft_sentences: {
    title: "What Really Went Wrong at Kelder Manufacturing",
    passage: [
      "It wasn't the recession that destroyed Kelder Manufacturing, whatever the official statement claimed. What actually happened was years of quiet mismanagement finally catching up with a company that had been coasting on reputation alone for the better part of a decade.",
      "It was the board's decision to reject automation upgrades in 2015, not any external economic shock, that left the company producing goods at nearly double the cost of its competitors. What management chose to prioritise instead — a lavish new headquarters, expensive executive bonuses — tells you everything about where the real failure originated.",
      "What frustrates former employees most isn't even the closure itself, but how entirely preventable it was. It was warnings from the company's own engineers, repeated across three separate internal reports, that first flagged the outdated production line as a critical vulnerability. What the board did with those warnings was, essentially, nothing at all.",
      "It's easy, in hindsight, to blame a single decision, but that would be an oversimplification too. What really unfolded was a slow accumulation of smaller failures: a merger that added debt without adding capability, a reluctance to invest in staff training, and a management culture where raising concerns was, in practice if not in policy, quietly discouraged. It was this combination, not any one factor alone, that ultimately proved fatal.",
      "What the collapse reveals, more than anything else, is how rarely companies fail for the dramatic reasons reported in the press afterward. It's the accumulated small decisions — the training not funded, the warning not escalated, the investment postponed one year too many — that usually do the real damage, long before anyone notices, or is willing to say so publicly.",
      "What remains now for the four hundred former employees is considerably less abstract: redundancy payments that barely cover two months' expenses, and a local job market with little capacity to absorb them. It is this human cost, rather than the boardroom failures that caused it, that deserves far more attention than it has so far received.",
      "It's the town itself, too, that will feel this longest, long after the headlines have moved on to whatever collapses next. What closes with a factory is rarely just the factory — it's also the supplier down the road, the café that fed the workers, and the apprenticeships that will now never be offered to the next generation coming up behind them.",
      "It was never inevitable, whatever the board's final statement implied. What was inevitable, once those warnings went unheeded for the third consecutive year, was something considerably closer to this.",
    ],
    questions: [
      { type: "reading comprehension", question: "What does the writer say actually destroyed Kelder Manufacturing?", answer: "Years of quiet mismanagement, not the recession." },
      { type: "reading comprehension", question: "What decision from 2015 is highlighted as significant?", answer: "The board's decision to reject automation upgrades." },
      { type: "reading comprehension", question: "What does the writer say deserves more attention than the boardroom failures?", answer: "The human cost to the four hundred former employees." },
    ],
  },

  business_professional_vocabulary: {
    title: "Quarterly Results: A Mixed Picture",
    passage: [
      "Torvald Industries reported its third-quarter earnings yesterday, revealing a mixed picture that left analysts divided over the company's near-term outlook. Revenue rose by 6.2 percent year-on-year, comfortably beating market expectations, yet net profit margins contracted for the second consecutive quarter, driven largely by rising input costs and an aggressive expansion into overseas markets that has yet to deliver returns.",
      "\"We're seeing solid top-line growth, but the bottom line tells a more complicated story,\" said chief financial officer Elena Marsh during yesterday's earnings call. \"We anticipated some short-term margin compression as we scale operations in Southeast Asia, and that's precisely what we're seeing play out.\" The company's overseas division, launched eighteen months ago, currently operates at a loss, though executives maintain it remains on track to reach profitability within the next two fiscal years.",
      "Shareholders reacted cautiously to the results. The company's stock dipped nearly three percent in early trading before recovering slightly by market close, reflecting what several analysts described as guarded optimism tempered by genuine concern about execution risk. \"The strategy makes sense on paper,\" noted independent analyst Raj Patel, \"but expansion of this scale always carries meaningful risk, and the market is understandably reserving judgment until we see clearer evidence the overseas division can actually deliver on projected returns.\"",
      "The company also announced a restructuring of its domestic operations, consolidating three regional distribution centres into a single, more efficient facility, a move expected to yield significant cost savings once fully implemented but requiring substantial upfront capital expenditure in the meantime. Approximately 150 positions will be affected by the consolidation, with the company indicating that most staff will be offered relocation or redeployment rather than redundancy outright, though a portion of roles are expected to be eliminated entirely.",
      "Looking ahead, management reaffirmed full-year revenue guidance but tempered profit expectations slightly, citing ongoing macroeconomic headwinds including persistent inflation in key input materials and currency fluctuations affecting overseas earnings when converted back to the company's reporting currency. \"We remain confident in our long-term strategy,\" Marsh added, \"even as we navigate a genuinely challenging near-term environment that we don't expect to ease significantly before next year.\"",
      "Analysts covering the stock remain split roughly evenly between buy and hold recommendations, with most agreeing that the coming two quarters will prove decisive in determining whether the overseas expansion ultimately vindicates management's strategy or represents a costly miscalculation that shareholders will scrutinise closely at the company's next annual general meeting.",
    ],
    questions: [
      { type: "reading comprehension", question: "By how much did revenue rise year-on-year?", answer: "6.2 percent." },
      { type: "reading comprehension", question: "What did the company do to its domestic operations?", answer: "Consolidated three regional distribution centres into one." },
      { type: "reading comprehension", question: "How are analysts currently split on the stock?", answer: "Roughly evenly between buy and hold recommendations." },
    ],
  },

  media_misinformation: {
    title: "The Story That Wasn't True (But Spread Anyway)",
    passage: [
      "Within six hours of being posted, the claim had been shared over two hundred thousand times: a well-known food company, the post alleged, was secretly using a banned chemical preservative in its products, with \"internal documents\" supposedly proving the cover-up. By the time independent fact-checkers had thoroughly debunked the claim the following day, it had already reached millions of people, and the company's stock had briefly dropped nearly four percent in response.",
      "The correction, when it eventually arrived, reached a fraction of that original audience. This asymmetry — false claims spreading dramatically faster and further than the corrections that follow them — has been documented repeatedly by researchers studying online misinformation, and it represents one of the most stubborn challenges facing efforts to combat false information at scale.",
      "A widely cited study from MIT researchers found that false news stories are approximately seventy percent more likely to be shared on social media than accurate ones, and reach their first 1,500 people roughly six times faster. The reasons aren't especially mysterious once examined closely: false claims are frequently engineered, whether deliberately or through the simple mechanics of what tends to go viral, to be more novel, more emotionally provocative, and more shareable than the comparatively mundane truth usually is.",
      "Platforms have introduced various measures attempting to address this asymmetry — warning labels, reduced algorithmic distribution for flagged content, partnerships with independent fact-checking organisations — with results that researchers describe, generously, as mixed. Critics argue these interventions typically arrive too late to matter, given that misinformation does the overwhelming majority of its damage within the first few hours of circulation, well before any fact-check has been researched, written, and published.",
      "There's also a deeper psychological obstacle at work, one that no amount of platform policy can fully resolve on its own: research in cognitive psychology consistently shows that corrections, even when clearly presented and readily believed at the moment of reading, often fail to fully displace the original false impression a person formed. This phenomenon, sometimes called the \"continued influence effect,\" means that even people who consciously accept a correction may continue to be subtly influenced by the original, debunked claim in ways they don't consciously register or intend.",
      "None of this suggests fact-checking is pointless — it demonstrably reduces harm, and abandoning it would make the problem considerably worse, not better. But researchers increasingly argue that treating misinformation purely as a correction problem, to be solved after the fact, misses the more fundamental issue: platforms structurally reward the kind of content most likely to mislead in the first place, and no amount of after-the-fact correction can fully compensate for incentives built into the system from the very start. Until those underlying incentives change, researchers warn, corrections will keep arriving after the damage, structurally, has already largely been done.",
    ],
    questions: [
      { type: "reading comprehension", question: "According to the MIT study, how much more likely are false stories to be shared than accurate ones?", answer: "Approximately seventy percent more likely." },
      { type: "reading comprehension", question: "Why do false claims tend to spread faster, according to the passage?", answer: "They're often more novel, more emotionally provocative, and more shareable than mundane truth." },
      { type: "reading comprehension", question: "What is the 'continued influence effect'?", answer: "When people continue to be subtly influenced by a debunked claim even after accepting the correction." },
    ],
  },
};
