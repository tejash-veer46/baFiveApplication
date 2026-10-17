// Deliberately corny openers for new matches. {name} is replaced with the other person's first name.
const LINES = [
  "Are you a calendar invite? Because I'd accept you before 5 and after.",
  "Is your name Wi-Fi? Because I'm feeling a connection, even in the basement meeting room.",
  "I'd let you take the last slice at the office party. That's how I know it's serious.",
  "You must be the 5 o'clock bell, because I've been waiting for you all day.",
  "Are you a stand-up meeting? Because I could stand here and talk to you for 15 minutes. Minimum.",
  "Are you a coffee machine? Because you just made my morning, {name}.",
  "If you were a spreadsheet, I'd never want to Ctrl+Z you.",
  "Are you out of office? Because you're out of this world.",
  "I was going to send you a meeting request, but 'dinner?' felt more efficient.",
  "Do you believe in love at first like, or should I like another photo?",
  "Are you a deadline? Because my heart races every time I think about you.",
  "Let's take this offline. Ideally to a rooftop, after 5.",
  "Is your name Google? Because you've got everything I've been searching for.",
  "Are you a parking ticket? Because you've got 'fine' written all over you.",
  "I'm not a photographer, but I can picture us at lunch on Thursday.",
  "Are you a lunch break? Because you're the best part of my day.",
  "Do you have a map? I keep getting lost in your profile, {name}.",
  "Are you made of copper and tellurium? Because you're Cu-Te.",
  "If you were a vegetable, you'd be a cute-cumber.",
  "Is it hot in here, or is the office AC broken again? Either way, hi {name}.",
  "Are you a keyboard? Because you're just my type.",
  "Can I follow you home? My mum said to follow my dreams. (After 5, obviously.)",
  "Our match was a merge with zero conflicts. Shall we ship it?",
  "Are you the printer? Because I'm jammed up thinking about you.",
  "I must be a snowflake, because I've fallen for you.",
  "Are you a 9-to-5? Because I'd commit to you full time.",
  "Feel free to circle back on this, but... drinks?",
  "If kisses were snowflakes, I'd send you a blizzard. If they were emails, I'd send you a newsletter.",
  "Are you a fire alarm drill? Because you've got me leaving everything behind.",
  "Is there an airport nearby, or is my heart just taking off?",
  "I'm no weatherman, {name}, but you can expect more than a few showers of compliments.",
  "Are you a bank loan? Because you've got my interest.",
  "Do you like raisins? How about a date?",
  "Are you a sticky note? Because I can't stop thinking about you since you got stuck in my head.",
  "You had me at 'It's a match'.",
  "Before 5 I'm professional. After 5 I'm very, very bad at bowling. Want to see?",
]

const hash = (n: number) => {
  let x = (n ^ 0x5bd1e995) >>> 0
  x = Math.imul(x ^ (x >>> 15), 2246822507) >>> 0
  x = Math.imul(x ^ (x >>> 13), 3266489909) >>> 0
  return (x ^ (x >>> 16)) >>> 0
}

/** `count` different lines, chosen by `seed` so a chat shows the same set until shuffled. */
export function pickupLines(name: string, seed: number, count = 3): string[] {
  const picked: string[] = []
  let i = hash(seed)
  while (picked.length < Math.min(count, LINES.length)) {
    const line = LINES[i % LINES.length].replace('{name}', name)
    if (!picked.includes(line)) picked.push(line)
    i = hash(i + 1)
  }
  return picked
}
