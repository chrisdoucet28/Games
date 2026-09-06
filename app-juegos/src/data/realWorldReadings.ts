import type { QuestionData } from "../types";

// Real-world reading/listening content for the Lesson Plans feature — original short passages
// written specifically for this slot, styled like an authentic text a student would actually
// encounter (a text-message thread, a diary entry, a notice, a letter...) rather than the
// grammar-drill prose used everywhere else on the site. Sits as its own step between Open
// Production and the Speaking Wrap-Up (see RealWorldReadingStep in LessonPlanScreen.tsx). Only
// topics with an entry here get the step — safe to build out gradually level by level;
// LessonPlanScreen simply skips it when a topic has none yet.
//
// Scope: A1 (25 topics) + A2 (31 topics) so far, extending level by level. Length/complexity
// guide: A1 40-70 words (present simple/simple past only, no subordinate clauses), A2 ~70-110
// (past simple/continuous, first conditional, used to). B1-and-up deliberately jump to
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
};
