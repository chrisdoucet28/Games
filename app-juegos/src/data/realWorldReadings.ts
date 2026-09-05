import type { QuestionData } from "../types";

// Real-world reading/listening content for the Lesson Plans feature — original short passages
// written specifically for this slot, styled like an authentic text a student would actually
// encounter (a text-message thread, a diary entry, a notice, a letter...) rather than the
// grammar-drill prose used everywhere else on the site. Sits as its own step between Open
// Production and the Speaking Wrap-Up (see RealWorldReadingStep in LessonPlanScreen.tsx). Only
// topics with an entry here get the step — safe to build out gradually level by level;
// LessonPlanScreen simply skips it when a topic has none yet.
//
// Scope: A1 pilot (25 topics) only, for now. Length/complexity guide for future levels: A1
// 40-70 words (present simple/simple past only, no subordinate clauses), A2 ~70-110, B1 ~120-160,
// B2 ~180-220, C1 ~250-320 — increasing length, tense range, and abstraction per level.
export type RealWorldReading = {
  title: string;
  // One string per paragraph/message — never one giant block. LessonPlanScreen renders each as
  // its own line, so a text-message thread reads as separate messages, a diary entry as separate
  // sentences/paragraphs, etc.
  passage: string[];
  // WAV files under public/audio/real-world/, generated with the Windows built-in SAPI voice
  // ("Microsoft Zira Desktop") as a temporary placeholder — swap each one for real ElevenLabs
  // narration later; the filename convention and RealWorldReadingStep/AudioPlayer code don't need
  // to change either way. A reading with no audioUrl skips the Reading/Listening mode choice
  // entirely and just shows the text (matching the "skip if no data" pattern used throughout).
  audioUrl?: string;
  // 3 comprehension-check questions about the text's content (not the grammar point itself —
  // that's what Practice A/B/Production already cover). Same QuestionData shape/reveal-answer
  // convention as every other question slide.
  questions: QuestionData[];
};

export const REAL_WORLD_READINGS: Record<string, RealWorldReading> = {
  greetings_introductions: {
    title: "New at School",
    audioUrl: "/audio/real-world/greetings_introductions.wav",
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
    audioUrl: "/audio/real-world/introducing_others.wav",
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
    audioUrl: "/audio/real-world/days_dates_prepositions_time.wav",
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
    audioUrl: "/audio/real-world/what_time_is_it.wav",
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
    audioUrl: "/audio/real-world/weather_temperature_seasons.wav",
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
    audioUrl: "/audio/real-world/daily_routines_frequency.wav",
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
    audioUrl: "/audio/real-world/house_objects_rooms_there_is_are.wav",
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
    audioUrl: "/audio/real-world/possessive_adjectives_pronouns.wav",
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
    audioUrl: "/audio/real-world/present_simple.wav",
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
    audioUrl: "/audio/real-world/auxiliary_verbs_be_do.wav",
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
    audioUrl: "/audio/real-world/can_cant.wav",
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
    audioUrl: "/audio/real-world/present_continuous_a1.wav",
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
    audioUrl: "/audio/real-world/likes_dislikes.wav",
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
    audioUrl: "/audio/real-world/what_do_you_do.wav",
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
    audioUrl: "/audio/real-world/hobbies.wav",
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
    audioUrl: "/audio/real-world/personality.wav",
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
    audioUrl: "/audio/real-world/feelings.wav",
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
    audioUrl: "/audio/real-world/appearance.wav",
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
    audioUrl: "/audio/real-world/clothes.wav",
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
    audioUrl: "/audio/real-world/there_is_are.wav",
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
    audioUrl: "/audio/real-world/family_members.wav",
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
    audioUrl: "/audio/real-world/possessive_s.wav",
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
    audioUrl: "/audio/real-world/prepositions_place.wav",
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
    audioUrl: "/audio/real-world/basic_word_order.wav",
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
    audioUrl: "/audio/real-world/giving_directions.wav",
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
};
