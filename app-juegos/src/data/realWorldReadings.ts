import type { QuestionData } from "../types";

// Real-world reading/listening content for the Lesson Plans feature — original short passages
// written specifically for this slot, styled like an authentic text a student would actually
// encounter (a text-message thread, a diary entry, a notice, a letter...) rather than the
// grammar-drill prose used everywhere else on the site. Sits as its own step between Open
// Production and the Speaking Wrap-Up (see RealWorldReadingStep in LessonPlanScreen.tsx). Only
// topics with an entry here get the step — safe to build out gradually level by level;
// LessonPlanScreen simply skips it when a topic has none yet.
//
// Scope: A1 (25 topics) + A2 (31 topics) + B1 (43 topics) so far, extending level by level. Text
// for all of B1 is done; its audio is not (see the per-entry audioUrl comment above) — generating
// it needs roughly 43,000 characters, well beyond one free-tier account's monthly allowance, so
// expect it to arrive in several waves across multiple accounts/months. Length/complexity guide:
// A1 40-70 words (present simple/simple past only, no subordinate clauses), A2 ~70-110 (past
// simple/continuous, first conditional, used to). B1-and-up deliberately jump to
// closer-to-authentic exam-passage length rather than a small step up from A2: B1 ~180-250 words,
// B2 ~280-380, C1 ~400-550 — increasing length, tense range, and abstraction per level.
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
};
