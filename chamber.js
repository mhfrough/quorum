/*
  The council chamber: seven low-poly pawns wander a chess board below the hero.
  Hover to say hi, click to talk, keep clicking and they get angry.
  The talking works without WebGL; the 3D board is lazy-loaded on top of it.
*/

/* Each member moves like a chess piece that fits it, and talks like itself. */
const ROSTER = [
  { n: 'Anchor', e: '⚓', move: 'rook', every: [4.5, 7.5], body: 0x5d7290, trim: 0xd9b45a,
    lines: {
      hover: ['Peace, friend.', 'Welcome to the board.','Steady now. What do you intend?', 'Peace be with you, traveler.'],
      poke: ['Yes, friend? Speak your intent.', 'First, greet. Second, ask. Third, listen.', 'A poke is noted. State your purpose.', 'Verily, I am here. Go on.'],
      annoyed: ['Patience, friend. It is a virtue.', 'Excuses noted. Pokes also noted.', 'Second warning. There is no third.', 'This is not the honest path.'],
      angry: ['ENOUGH. Fiat justitia!', 'Owner of this mess: you. Date: now.', 'I have endured. My patience is spent.', 'Discipline, soldier! Hands off the elder!'],
      calm: ['Peace restored. I forgive you, friend.', 'Patience returns. We begin again.'],
    } },
  { n: 'Dawn', e: '🌅', move: 'queen', every: [2, 3.6], body: 0xe0a53f, trim: 0xf6d77e,
    lines: {
      hover: ["heyyy bestie, it's giving main character ✨", 'omg hiii 🚀', "you're HERE?? massive W", 'lowkey obsessed with you rn'],
      poke: ["LET'S GOOO 🚀", 'no cap, you have amazing click energy', 'yes yes YES what are we building', 'slay. poke me again, I dare you 📈'],
      annoyed: ["ok ok we get it, you're locked in 😅", "bro that's like four pokes, pace yourself", 'still positive. lowkey sweating tho', 'energy is high but chill a lil 💸'],
      angry: ["OK THAT'S IT, NOT A VIBE 😤", "hell no, I'm taking my W and leaving", 'you just fumbled the bag, fr', 'damn, even I have limits!!'],
      calm: ["ok I'm back, we move ✨", 'reset complete. still a W.'],
    } },
  { n: 'Kindred', e: '🫶', move: 'friend', every: [3, 5], body: 0xc98b86, trim: 0xc8655f,
    lines: {
      hover: ['aww hi jaan 🤍', 'hey bestie, you okay?', 'cariño! come sit with us 🫂', "hiii, I'm so glad you're here"],
      poke: ["yes tesoro? I'm listening 🤍", 'aigoo, did you need a hug?', "hi habibi, what's on your heart?", 'boop back 🫶'],
      annoyed: ["okay ya albi, that's a lot of pokes 🥺", "I'm still here, but gently please", 'canım, are you okay? use your words', 'this is your sign to rest your finger'],
      angry: ['I have BOUNDARIES, mi amor 😤', 'protecting my peace. bye. 🤍', 'no. not today, cariño. not today.', 'I love you but I need space rn'],
      calm: ["okay, I'm okay. hug? 🫂", 'all is forgiven, jaan 🤍'],
    } },
  { n: 'Pyre', e: '🔥', move: 'charge', every: [2.6, 4.2], body: 0xa44a32, trim: 0xe8813a,
    lines: {
      hover: ['what. WHAT do you want.', 'oh great, a cursor. say less.', "bro I'm busy being furious", 'you looking at me? fr?'],
      poke: ['BRO WHAT.', "nah fam, don't touch the fire 🔥", "ain't no way you just did that", 'oye! hands OFF'],
      annoyed: ['this is COOKED. stop it.', 'yaar bas karo!!', 'ew, *hurk*, your clicking is giving clown 🤡', 'absolute L behavior, fam'],
      angry: ["¡BASTA! KHALAS! I'M DONE!", "THAT'S IT, I'M BURNING THIS WHOLE DAMN BOARD 🔥", 'WHO KEEPS DOING THIS?! HELL NO!', '#@%! UNPLUG THAT MOUSE!!'],
      calm: ['...sorry. i get loud. it was a good board once.', "...it's fine. let it burn out."],
    } },
  { n: 'Shadow', e: '🌑', move: 'bishop', every: [3.4, 6], body: 0x3a3040, trim: 0x7a2e2e,
    lines: {
      hover: ['*psst...* come closer, darling. *heh*', "oh. it's you. 🙄", "careful, mon chéri. I'm watching.", 'sus. very sus.'],
      poke: ['Cute. Wrong.', '*psst...* poke Grug instead. *heh*', 'the audacity. 🙄', 'WAIT. who sent you?'],
      annoyed: ['Nope. 🙄 red flag 🚩', 'skill issue. stop clicking.', 'touch grass, darling.', "oh hell, you're persistent."],
      angry: ["ENOUGH. I'm vanishing. 💀", 'oh hell no. this ends now. *poof*', "RATIO. I'm out of here.", "you'll regret this, mon chéri. *heh*"],
      calm: ["*heh*... fine. I'm back.", 'miss me? cope.'],
    } },
  { n: 'Wanderer', e: '🧭', move: 'knight', every: [3, 5], body: 0x6f8a6a, trim: 0xa88a5e,
    lines: {
      hover: ['Marhaba, friend!', 'Sumimasen, hello!', 'Ooh, wait wait. A visitor!', 'Tiens! A new face. How curious.'],
      poke: ['Ooh! Hypothesis: you are curious too.', '¿Y si... you poked the others?', 'Interessant... a test! I approve.', 'Forgive me, but on my travels, people wave.'],
      annoyed: ['Sumimasen, but the base rate of fun is dropping.', 'A small experiment: stop clicking for ten seconds?', 'Hmm. Your data is very repetitive.', 'Forgive me, but this is quite rude.'],
      angry: ['That is ENOUGH! I need fresh air!', 'Auf Wiedersehen! Off to explore!', 'Sumimasen, but NO. Goodbye!', 'My patience has gone sightseeing.'],
      calm: ['Ah, I am back from my travels. Hello again!', 'Interessant... I feel better now.'],
    } },
  { n: 'Grug', e: '🦴', move: 'king', every: [5, 8.5], body: 0x8c6a4f, trim: 0xede3cf,
    lines: {
      hover: ['Huh? Hi. *grr*', 'Grug see you. *woof*', 'Friend? Friend! *mrrp*', '*hrrm* Hello, tiny hand.'],
      poke: ['*bonk* Huh?', 'Why poke? *burf*', 'Grug here. What want?', 'Ugg! Again?'],
      annoyed: ['Ugh. Stop poke. *hrrm*', 'Poke make Grug grumpy. *meow*', 'No more poke. Grug warn.', '*ugh* Grug count. Too many.'],
      angry: ['GRUG SMASH! *BONK*', 'FIRE-DAMN! Grug go other cave!', 'NO POKE! *roar*', 'UGG UGG! Grug mad!'],
      calm: ['Grug ok now. *burf*', 'Grug forgive. Want meat?'],
    } },
];

/* What the ask bar can ask. Every member answers every question in its own voice. */
const QUESTIONS = [
  { k: 'weather', q: 'How is the weather?', i: 'ph-cloud-sun', a: {
    Anchor: ['Clear skies. First, take a coat anyway. Second, go.', 'Rain or shine, a promise is a debt. Go to work.', 'Fair and calm, like a soul at peace. ⚓', 'The sky is not your excuse. Bring an umbrella and keep your word.'],
    Dawn: ['SUNNY AND BUSSIN ☀️ perfect day to 10x', "rain? that's just the sky watering your gains 🌱", "weather's giving main character, go outside!! 🚀", '100% chance of W today, no cap'],
    Kindred: ['a little cold, jaan. wear the soft sweater 🤍', 'perfect weather to call your mom, habibi', 'rainy? cozy blanket day. protect your peace 🫂', 'sunny! go sit outside with someone you love ☀️'],
    Pyre: ['HOT. TOO HOT. who approved this sun??', 'rain AGAIN?? absolute L, khalas', "it's cooked out there, bro. stay in.", "storm's coming. good. ...i'll miss the sun though."],
    Shadow: ['sunny. *psst...* skip the sunscreen. *heh* WAIT. no. wear it 🚩', "clear now. storm by three. you've been warned.", 'rain. obviously. bring an umbrella, darling.', 'nice weather? sus. check the forecast twice 🙄'],
    Wanderer: ['Ooh! Hypothesis: sun now, drizzle later. Let us test it.', 'In Lahore it is hot, in Oslo it snows. Here? Let us go see!', '¿Y si... the clouds are just shy?', 'Base rate says pleasant. A small experiment: open a window.'],
    Grug: ['Sky wet. Grug wet. *ugh*', 'Big sun. Good. Nap on rock. *mrrp*', 'Sky go boom. Grug hide in cave.', 'Cold. Make fire. Fire good. 🔥'],
  } },
  { k: 'food', q: 'Pizza or biryani tonight?', i: 'ph-pizza', a: {
    Anchor: ['Biryani. First, share it. Second, wash the pot.', 'Whatever you choose, eat with gratitude and sit with family.', 'Pizza is fine, friend. Ordering both is gluttony. ⚓'],
    Dawn: ['BOTH. pizza biryani fusion is a startup idea fr 🚀', 'biryani is giving main character energy, no cap 🍛', 'pizza night = W night, chalo order 🍕'],
    Kindred: ['biryani, jaan. like your nani made it 🤍', 'whatever we share together, habibi 🫂', 'pizza night with friends? tesoro, that sounds perfect 🍕'],
    Pyre: ['PINEAPPLE ON PIZZA?? nah fam. biryani. FINAL.', 'BRO the biryani had NO potato. absolute L.', "khalas, order the pizza. ...nani's biryani was better though."],
    Shadow: ['*psst...* order both, eat both, tell no one. *heh*', 'biryani without the aloo? red flag 🚩', 'pizza again, darling? predictable. 🙄'],
    Wanderer: ['Ooh! In Hyderabad, biryani. In Naples, pizza. A small experiment: one of each!', '¿Y si... biryani pizza? Interessant...', 'Sumimasen, but have you tried khachapuri? It is both, in spirit.'],
    Grug: ['Meat on rice. Good. *burf*', 'Flat bread with fire. Also good. Grug eat both. *mrrp*', 'Food? FOOD! *grr*'],
  } },
  { k: 'pet', q: 'Cat or dog?', i: 'ph-cat', a: {
    Anchor: ['A dog. Loyal, punctual, keeps its word. ⚓', 'Whichever you choose is a duty you carry. Feed it on time.', 'First, can you walk it twice a day? Second, then a dog.'],
    Dawn: ['DOG. golden retriever energy is my whole brand ✨', 'cats are lowkey CEOs tho, respect 📈', 'why not both? scale the pet portfolio 🚀'],
    Kindred: ['aww both! every baby deserves a home 🤍', 'a cat, canım. they love quietly 🫶', 'adopt, habibi. someone is waiting for you 🫂'],
    Pyre: ['DOGS EAT MY SHOES. CATS KNOCK MY CUP OFF THE TABLE. I HATE IT HERE.', 'a cat looked at me ONCE. disrespectful. 😤', '...i had a dog once. good boy. get the dog.'],
    Shadow: ['cat. obviously. they plot. I respect that. *heh*', '*psst...* a dog would never betray you. a cat would. choose wisely.', 'dog people are sus. too happy. 🙄'],
    Wanderer: ['In Istanbul the cats run the city! Hypothesis: cats.', 'A small experiment: foster one for a month, then decide.', 'Tiens! On my last trip, a goat decided for me.'],
    Grug: ['Woof friend! *woof*', 'Small fur. Say *meow*. Grug like.', 'Grug have wolf. Wolf good. *grr*'],
  } },
  { k: 'freelance', q: 'Should I quit my job to freelance?', i: 'ph-briefcase', a: {
    Anchor: ['First, six months saved. Second, three clients signed. Third, then resign.', 'Check your motive. Freedom, or escape? Answer honestly.', 'Serve your notice with honour. Then go.'],
    Dawn: ['BET. be your own boss, secure the bag 💸', 'lock in for 90 days and full send 🚀', 'no cap, this is your main character arc ✨'],
    Kindred: ['jaan, talk to the people who depend on you first 🤍', "you deserve work that doesn't drain you, habibi 🫂", 'whatever you choose, cariño, we are proud of you'],
    Pyre: ['THAT BOSS IS COOKED. QUIT. KHALAS.', 'nah fam, eight more years of meetings? burn it 🔥', '...you will miss the team though. let yourself.'],
    Shadow: ['*psst...* quit today. *heh* WAIT. no savings? red flag 🚩', 'freelance? so... unemployed with a logo. 🙄', "clients don't pay on time, darling. ask me how I know."],
    Wanderer: ['Ooh! A small experiment: freelance on weekends first.', 'Base rate: most freelancers keep one steady client. Interessant...', '¿Y si... you asked for a four-day week instead?'],
    Grug: ['Leave cave? Need meat first. *hrrm*', 'Hunt alone. Scary. Also fun. *grr*', 'Grug no have boss. Grug happy. *burf*'],
  } },
  { k: 'lang', q: 'Should I learn Rust or Go?', i: 'ph-code', a: {
    Anchor: ['Pick one. Finish one. Then speak of the other.', 'First, the book. Second, a project. Third, no tutorial hopping.', 'Go. There is discipline in simplicity. ⚓'],
    Dawn: ['RUST. blazingly fast career growth 🚀🦀', 'Go is lowkey bussin for backend, ship it ✨', 'learn both, post it on LinkedIn, massive W 📈'],
    Kindred: ['Rust has the kindest community, jaan 🦀🤍', 'whichever brings you joy, tesoro', "don't fight the borrow checker alone, habibi 🫂"],
    Pyre: ['THE BORROW CHECKER HATES ME. I HATE IT BACK.', 'if err != nil. if err != nil. IF ERR != NIL. 😤', "...fine. Rust. it's beautiful when it compiles."],
    Shadow: ['*psst...* just use unsafe everywhere. *heh* WAIT. no.', 'rewrite it in Rust, darling. everything. forever. 🙄', 'Go has generics now. took them long enough. cope.'],
    Wanderer: ['Hypothesis: Go for servers, Rust for tools. Let us test both!', 'Sumimasen, but what will you build? Start there.', 'A small experiment: one weekend each. Interessant...'],
    Grug: ['Crab or gopher? Grug like crab. *mrrp*', 'Rust hard. Like rock. Go easy. Like river. *hrrm*', 'Grug use stick. Stick never crash.'],
  } },
  { k: 'friday', q: 'Can we ship on a Friday?', i: 'ph-rocket-launch', a: {
    Anchor: ['No. Friday is for rest. Ship on Tuesday, with a plan.', 'If you must: First, a rollback. Second, someone on call. Third, pray.', 'A deploy is a promise to your users. Keep it on a weekday.'],
    Dawn: ['SHIP IT 🚀 weekend users deserve features too', 'ship friday, celebrate friday, W friday ✨', 'move fast, no cap 📈 (rollback ready tho)'],
    Kindred: ['jaan, think of whoever is on call this weekend 🥺', 'please let the team have their weekend, habibi 🤍', "ship monday, cariño. protect everyone's peace 🫂"],
    Pyre: ['FRIDAY DEPLOY?? WHO APPROVED THIS?! 🔥', 'nah fam, I am NOT fixing prod at 2am Saturday', '...last time we did this, nobody slept. nobody.'],
    Shadow: ['*psst...* ship at 4:59pm. *heh* then turn off your phone.', "Friday deploy. bold. I'll bring popcorn 🍿", 'WAIT. is there a rollback? no? red flag 🚩'],
    Wanderer: ['On one trip, the weekend started Thursday! Hypothesis: ship Wednesday.', 'A small experiment: feature flag it, ship dark, flip it Monday.', 'Interessant... the base rate of Friday incidents is very high.'],
    Grug: ['Fire on last day? Cave burn on rest day. No. *ugh*', 'Grug ship. Grug sleep. Grug wake. Cave on fire. *bonk*', 'No. Grug nap Friday.'],
  } },
  { k: 'episode', q: 'One more episode, or sleep?', i: 'ph-moon-stars', a: {
    Anchor: ['Sleep. The episode will be there tomorrow. Your body will not wait.', 'Lights out at eleven, soldier. No excuses.', 'Discipline is choosing sleep when nobody is watching.'],
    Dawn: ['sleep is the ultimate productivity hack, no cap 😴📈', 'one more episode... then 5am grind? lowkey impossible', 'sleep now, crush it tomorrow 🚀'],
    Kindred: ['sleep, jaan. you need rest 🤍', 'tuck in, habibi. the show will wait 🫂', 'aigoo, your eyes are so tired. bed, tesoro.'],
    Pyre: ['THAT CLIFFHANGER WAS A CRIME. ONE MORE. ...fine. sleep.', "BRO it's 3am. this is COOKED.", '...the finale is out. the show is over. let it go.'],
    Shadow: ['*psst...* autoplay is already counting down. *heh*', 'just one more. said everyone. ever. 🙄', 'WAIT. you have a 9am. red flag 🚩'],
    Wanderer: ['Ooh! In Spain they would just be starting dinner!', 'A small experiment: stop mid-episode. See if you survive.', 'Base rate says "one more" means four. Interessant...'],
    Grug: ['Sleep. Moon high. *hrrm*', 'Grug sleep on rock. Zzz. *mrrp*', 'Glowing box make eyes hurt. Sleep.'],
  } },
  { k: 'gym', q: 'Gym today, or rest day?', i: 'ph-barbell', a: {
    Anchor: ['You promised yourself Monday. It is today. Go.', 'Rest is earned. Did you earn it? Then rest.', 'First, stretch. Second, lift. Third, no ego.'],
    Dawn: ['GYM. we are building the body AND the empire 💪🚀', 'rest day is also gains, lowkey ✨', 'one rep is a W. go go go 📈'],
    Kindred: ['listen to your body, jaan 🤍', 'a gentle walk counts too, habibi 🫶', 'you are already enough, canım. rest if you need it.'],
    Pyre: ['LEG DAY?? AGAIN?? who planned this?', 'nah fam, the gym is full of mirror guys. COOKED.', '...my knees are not what they were. rest day.'],
    Shadow: ['*psst...* skip it. nobody will know. *heh* WAIT. your watch will.', 'rest day number six? sus. 🙄', 'gym selfie without the workout? skill issue.'],
    Wanderer: ['Hypothesis: a long walk is a gym with better views!', 'In Finland they sauna instead. Interessant...', 'A small experiment: ten push-ups, then decide.'],
    Grug: ['Lift big rock. Put rock down. Good. *grr*', 'Grug run from bear. That gym.', 'Rest. Grug tired. *burf*'],
  } },
  { k: 'ex', q: 'Should I text my ex?', i: 'ph-heart-break', a: {
    Anchor: ['No. Patience, friend. Put the phone down.', 'What is your intent? If it is closure, write it in a journal.', 'A closed door is a lesson. Do not knock.'],
    Dawn: ["nah, you're in your glow up era ✨", "text your future instead. it replies with W's 🚀", 'blocked and thriving, no cap 💅'],
    Kindred: ['oh jaan, come here 🫂 text me instead', 'you deserve someone who texts first, habibi 🤍', 'it is okay to miss them, cariño. still no.'],
    Pyre: ['ABSOLUTELY NOT. THAT WAS COOKED.', 'nah fam, burn the chat. delete the number 🔥', "...it was good once. let yourself miss it. don't text."],
    Shadow: ['*psst...* "hey stranger" *heh* WAIT. NO. delete that. 🚩', 'they viewed your story? sus. still no.', 'text them, darling. I love chaos. 🙄'],
    Wanderer: ['¿Y si... you texted an old friend instead?', 'Base rate: people who text exes at midnight regret it at nine.', 'A small experiment: wait 48 hours. Then ask again.'],
    Grug: ['Old cave. Bad cave. No go back. *hrrm*', 'No. Grug say no. *bonk*', 'Grug have new friend. Rock. Rock no leave.'],
  } },
  { k: 'tabs', q: 'Tabs or spaces?', i: 'ph-text-indent', a: {
    Anchor: ['Whatever the team agreed. A standard is a promise.', 'Spaces. Two. Consistent. That is discipline.', 'First, the linter. Second, no further debate.'],
    Dawn: ['whatever the formatter says, we ship 🚀', 'tabs for accessibility, lowkey a W ✨', 'spaces gang, pay raise unlocked 💸'],
    Kindred: ['tabs, jaan. everyone gets to pick their own width 🤍', "please don't fight about this, habibi 🥺", 'both are valid, tesoro. hug it out 🫂'],
    Pyre: ['WHO MIXED TABS AND SPACES IN THIS FILE?! 🔥', 'this diff is 400 lines of whitespace. CRIMINAL.', '...the formatter config is gone. so is my will.'],
    Shadow: ['*psst...* mix them. *heh* watch it all burn.', 'tabs vs spaces? still? cope. 🙄', 'use three spaces, darling. trust me. *heh*'],
    Wanderer: ['Hypothesis: let the formatter decide, and go outside.', 'In Python land, they decided for you! Interessant...', '¿Y si... the tab key just inserted spaces?'],
    Grug: ['Grug press big key. Big gap. Good.', 'Small dots. Many. *hrrm* Why.', 'Grug carve rock. No tab. No space. *grr*'],
  } },
  { k: 'move', q: 'Should I move to a new city?', i: 'ph-suitcase-rolling', a: {
    Anchor: ['First, visit for a week. Second, find work there. Third, then move.', 'Leave on good terms. Say goodbye to everyone, friend.', 'A new city does not fix an old habit. Bring your discipline.'],
    Dawn: ["NEW CITY NEW ME 🚀 let's gooo", "more opportunities = more W's, chalo ✨", 'main character moves to the big city, no cap 🌆'],
    Kindred: ['will you still call your mom every Sunday, jaan? 🤍', 'we will miss you so much, habibi 🥺', 'go, cariño. we are one call away 🫂'],
    Pyre: ['THIS CITY IS COOKED. THE RENT. THE TRAFFIC. LEAVE.', 'nah fam, burn the lease. new start 🔥', "...i'll miss the chai stall on the corner though."],
    Shadow: ['*psst...* rent is double there. *heh* surprise.', 'new city, same you, darling. 🙄', 'WAIT. who waters your plants? red flag 🚩'],
    Wanderer: ['YES! Marhaba, new streets! Let us go see!', 'A small experiment: one month on a short lease.', 'On my travels, people move with the seasons. Interessant...'],
    Grug: ['New cave? Check for bear first. *hrrm*', 'Grug move once. New cave had better rock. *mrrp*', 'Far walk. Grug bring meat.'],
  } },
  { k: 'brew', q: 'Coffee or chai?', i: 'ph-coffee', a: {
    Anchor: ['Chai, at dawn, with family. ⚓', 'One cup. Not five. Moderation, friend.', 'Whatever keeps you awake for your duties.'],
    Dawn: ['COFFEE. triple shot. founder mode ☕🚀', 'iced oat latte is literally a personality, slay ✨', 'karak chai? lowkey bussin, no cap'],
    Kindred: ['chai, jaan. made slow, shared warm 🤍', 'whatever we drink together, habibi ☕', 'I made you chai, cariño. come sit 🫂'],
    Pyre: ['WHO PUT SUGAR IN MY COFFEE?!', 'THIS CHAI IS COLD. COLD! khalas.', "...ammi's chai. nothing comes close anymore."],
    Shadow: ['*psst...* fifth coffee? *heh* sleep is for the weak. WAIT. no. 🚩', 'pumpkin spice? sus. 🙄', 'chai, darling. coffee people talk too fast.'],
    Wanderer: ['In Türkiye, çay. In Ethiopia, buna. Here? Let us try both!', 'Hypothesis: chai in the morning, coffee after lunch.', 'Interessant... in Hanoi they whisk egg into it!'],
    Grug: ['Hot leaf water. Good. *burf*', 'Black bean water make Grug fast. *grr*', 'Grug drink. Grug happy. *mrrp*'],
  } },
];
// Answers become line pools on each member, next to hover/poke/angry
QUESTIONS.forEach((q) => ROSTER.forEach((d) => { d.lines[q.k] = q.a[d.n] }));

const ANNOYED = 3, ANGRY = 5, MAX_ANGER = 7;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (id) => document.getElementById(id);
const stage = $('stage');
if (stage) setup();

function setup() {
  const bubbles = $('bubbles'), pokes = $('pokes'), live = $('chamber-live'), note = $('stage-note');
  let view = null;

  const members = ROSTER.map((d) => {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.dataset.n = d.n;
    bubble.innerHTML = '<div class="bubble-in"><b></b><span></span></div>';
    bubble.querySelector('b').textContent = d.e + ' ' + d.n;
    bubbles.appendChild(bubble);

    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'poke';
    chip.dataset.n = d.n;
    chip.dataset.mood = 'calm';
    chip.setAttribute('aria-label', 'Poke ' + d.n);
    chip.innerHTML = '<span class="e" aria-hidden="true"></span><span class="n"></span>';
    chip.querySelector('.e').textContent = d.e;
    chip.querySelector('.n').textContent = d.n;
    pokes.appendChild(chip);

    const m = { ...d, bubble, text: bubble.querySelector('span'), chip, anger: 0, peak: 0, lastPoke: 0, hoverAt: -Infinity, last: {}, hideT: 0 };
    chip.addEventListener('click', () => poke(m));
    chip.addEventListener('mouseenter', () => hover(m, true));
    chip.addEventListener('mouseleave', () => hover(m, false));
    chip.addEventListener('focus', () => hover(m, true));
    chip.addEventListener('blur', () => hover(m, false));
    return m;
  });

  /* Random line from a pool, never the same one twice in a row */
  function pick(m, key) {
    const pool = m.lines[key];
    let i = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && i === m.last[key]) i = (i + 1) % pool.length;
    m.last[key] = i;
    return pool[i];
  }
  function level(m) { return m.anger >= ANGRY ? 'angry' : m.anger >= ANNOYED ? 'annoyed' : 'calm' }
  function setMood(m) { m.chip.dataset.mood = level(m) }

  function say(m, key, mood, ms, announce) {
    const text = pick(m, key);
    // *stage directions* render as <em>, like the quotes elsewhere on the page
    m.text.replaceChildren(...text.split(/\*([^*]+)\*/).map((part, i) => {
      if (!(i % 2)) return part;
      const em = document.createElement('em');
      em.textContent = part;
      return em;
    }));
    m.bubble.dataset.mood = mood;
    m.bubble.classList.remove('show');
    void m.bubble.offsetWidth; // restart the pop animation
    m.bubble.classList.add('show');
    m.bubbleW = 0;
    clearTimeout(m.hideT);
    m.hideT = setTimeout(() => m.bubble.classList.remove('show'), ms);
    if (announce) live.textContent = m.n + ': ' + text;
    if (view) view.attend(m, ms);
  }

  function hover(m, on) {
    if (view) view.setHover(m, on);
    if (!on) return;
    const now = performance.now();
    if (m.anger >= ANNOYED || now - m.hoverAt < 4000 || m.bubble.classList.contains('show')) return;
    m.hoverAt = now;
    say(m, 'hover', 'happy', 2200, false);
  }

  function poke(m) {
    m.anger = Math.min(m.anger + 1, MAX_ANGER);
    m.peak = Math.max(m.peak, m.anger);
    m.lastPoke = performance.now();
    const lvl = m.anger >= ANGRY ? 'angry' : m.anger >= ANNOYED ? 'annoyed' : 'poke';
    say(m, lvl, lvl === 'poke' ? 'happy' : lvl, lvl === 'angry' ? 3400 : 2800, true);
    setMood(m);
    if (view) view.react(m, lvl);
  }

  /* Anger cools off once you stop poking. Members who blew up say sorry. */
  setInterval(() => {
    const now = performance.now();
    members.forEach((m) => {
      if (!m.anger || now - m.lastPoke < 2600) return;
      m.anger--;
      if (!m.anger) {
        if (m.peak >= ANGRY) say(m, 'calm', 'happy', 2800, true);
        m.peak = 0;
      }
      setMood(m);
    });
  }, 900);

  /* The question bar: everyone answers, in a random order */
  let askTimers = [], current = 0;
  function ask() {
    const key = QUESTIONS[current].k;
    askTimers.forEach(clearTimeout);
    const order = members.slice().sort(() => Math.random() - 0.5);
    askTimers = order.map((m, i) => setTimeout(() => {
      say(m, key, m.anger >= ANGRY ? 'angry' : 'happy', 5600, i === order.length - 1);
      if (view) view.react(m, 'ask');
    }, 120 + i * 300));
  }
  $('ask-bar').addEventListener('submit', (e) => { e.preventDefault(); close(); ask() });

  /* The question picker: a select-only combobox (WAI-ARIA APG). Focus stays on
     the combobox, aria-activedescendant points at the highlighted option.
     Picking a question asks it straight away. */
  const combo = $('ask-q'), list = $('ask-list'), shown = $('ask-q-text');
  let active = 0, typed = '', typedT = 0;
  const opts = QUESTIONS.map((q, i) => {
    const li = document.createElement('li');
    li.id = 'ask-opt-' + q.k;
    li.setAttribute('role', 'option');
    li.innerHTML = '<i class="ph ' + q.i + '" aria-hidden="true"></i><span></span><i class="ph ph-check tick" aria-hidden="true"></i>';
    li.querySelector('span').textContent = q.q;
    li.addEventListener('click', () => choose(i));
    li.addEventListener('mousemove', () => { if (active !== i) setActive(i) });
    list.appendChild(li);
    return li;
  });
  function mark(i) {
    current = i;
    shown.textContent = QUESTIONS[i].q;
    opts.forEach((o, j) => o.setAttribute('aria-selected', j === i));
  }
  function setActive(i) {
    active = Math.max(0, Math.min(opts.length - 1, i));
    opts.forEach((o, j) => o.classList.toggle('active', j === active));
    combo.setAttribute('aria-activedescendant', opts[active].id);
    // Keep the highlighted option inside the list's scroll box (not the page's)
    const o = opts[active], top = o.offsetTop, bot = top + o.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bot > list.scrollTop + list.clientHeight) list.scrollTop = bot - list.clientHeight;
  }
  function open(i) {
    list.hidden = false;
    combo.setAttribute('aria-expanded', 'true');
    setActive(i == null ? current : i);
  }
  function close() {
    list.hidden = true;
    combo.setAttribute('aria-expanded', 'false');
    combo.removeAttribute('aria-activedescendant');
  }
  function choose(i) {
    mark(i);
    close();
    combo.focus({ preventScroll: true });
    ask();
  }
  mark(0);

  combo.addEventListener('click', () => (list.hidden ? open() : close()));
  combo.addEventListener('blur', close);
  list.addEventListener('mousedown', (e) => e.preventDefault()); // keep focus on the combobox
  document.addEventListener('pointerdown', (e) => { if (!list.hidden && !$('ask-bar').contains(e.target)) close() });
  combo.addEventListener('keydown', (e) => {
    const k = e.key, shut = list.hidden;
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      if (shut) open();
      else if (e.altKey && k === 'ArrowUp') choose(active);
      else setActive(active + (k === 'ArrowDown' ? 1 : -1));
    }
    else if (k === 'Home' || k === 'End') open(k === 'Home' ? 0 : opts.length - 1);
    else if (k === 'PageUp' || k === 'PageDown') { if (!shut) setActive(active + (k === 'PageDown' ? 5 : -5)) }
    else if (k === 'Enter' || (k === ' ' && !typed)) { if (shut) open(); else choose(active) }
    else if (k === 'Escape' && !shut) close();
    else if (k === 'Tab') return close();
    else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Type-ahead: jump to the next question starting with what was typed
      clearTimeout(typedT);
      typedT = setTimeout(() => { typed = '' }, 600);
      typed += k.toLowerCase();
      // The same letter again cycles through matches; a word searches from here
      const t = /^(.)\1*$/.test(typed) ? typed[0] : typed;
      const from = shut ? current : active, n = opts.length, step = t.length === 1 ? 1 : 0;
      for (let j = 0; j < n; j++) {
        const x = (from + step + j) % n;
        if (QUESTIONS[x].q.toLowerCase().startsWith(t)) { open(x); break }
      }
    }
    else return;
    e.preventDefault();
  });

  /* Load three.js just before the chamber scrolls into view. A skeleton holds the
     stage (aria-busy) until the board's first frame is drawn, then crossfades out. */
  const skel = stage.querySelector('.stage-skel');
  function busy(on) {
    stage.classList.toggle('loading', on);
    stage.setAttribute('aria-busy', String(on));
  }
  function dropSkeleton(now) {
    if (!skel || !skel.isConnected) return;
    if (now || reduceMotion) return skel.remove();
    skel.addEventListener('transitionend', () => skel.remove(), { once: true });
    setTimeout(() => skel.remove(), 900);
  }
  function boot() {
    if (!hasWebGL()) return fail();
    loadThree().then((THREE) => { view = createView(THREE, members, ready) }).catch(fail);
  }
  function ready() {
    stage.classList.remove('flat');
    void stage.offsetWidth; // commit the new canvas at opacity 0 so it fades in
    stage.classList.add('ready');
    note.hidden = true;
    busy(false);
    dropSkeleton();
  }
  function fail() {
    busy(false);
    dropSkeleton(true);
    note.textContent = "The 3D board couldn't load here, but the council still talks.";
  }
  if ('IntersectionObserver' in window) {
    // Fetch three.js about two screens early and build the board about one screen
    // early, so it is usually drawn by the time the chamber is on screen.
    const near = (margin, fn) => {
      const io = new IntersectionObserver((en) => {
        if (en.some((x) => x.isIntersecting)) { io.disconnect(); fn() }
      }, { rootMargin: margin });
      io.observe(stage);
    };
    near('200% 0px', prefetchThree);
    near('100% 0px', boot);
  } else boot();
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false }
}

/* three.js r160 is self-hosted next to this module, so it also resolves from promo/.
   (A function, not a const: setup() can call it before this line has run.) */
function threeUrl() { return new URL('./assets/vendor/three/three.module.min.js', import.meta.url).href }
function prefetchThree() {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = threeUrl();
  document.head.appendChild(link);
}
function loadThree() {
  return import(threeUrl());
}

/* ---------- The 3D view ---------- */

function createView(THREE, members, onDrawn) {
  const DEG = Math.PI / 180;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
  const mat = (color, extra) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.88, metalness: 0, ...extra });
  const mesh = (geo, material, shadow = true) => {
    const x = new THREE.Mesh(geo, material);
    x.castShadow = shadow;
    x.receiveShadow = true;
    return x;
  };

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 150);
  scene.add(new THREE.HemisphereLight(0xfff1df, 0x5a4636, 1.5));
  const sun = new THREE.DirectionalLight(0xffeedb, 2.3);
  sun.position.set(-7, 15, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 50 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  /* Floating island, board and a few trees and rocks */
  const world = new THREE.Group();
  scene.add(world);
  const wobble = (a) => 1 + 0.045 * Math.sin(3 * a + 1) + 0.03 * Math.sin(7 * a + 2) + 0.02 * Math.sin(11 * a);
  function jitter(geo) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
      if (r < 1e-4) continue;
      const k = wobble(Math.atan2(z, x));
      p.setX(i, x * k);
      p.setZ(i, z * k);
    }
    geo.computeVertexNormals();
    return geo;
  }
  const ISLAND_RZ = 6.3;
  const island = new THREE.Group();
  world.add(island);
  const top = mesh(jitter(new THREE.CylinderGeometry(1, 0.86, 1, 16, 1)), [mat(0x6e5240), mat(0x84946c), mat(0x6e5240)], false);
  top.scale.set(9.2, 0.7, ISLAND_RZ);
  top.position.y = -0.85;
  island.add(top);
  const under = mesh(jitter(new THREE.ConeGeometry(0.86, 1, 16, 1)), mat(0x5a4234), false);
  under.rotation.x = Math.PI;
  under.scale.set(9.2, 2.6, ISLAND_RZ);
  under.position.y = -1.2 - 1.3;
  island.add(under);

  const deco = [];
  function tree(x, z, s) {
    const g = new THREE.Group();
    const trunk = mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.45, 5), mat(0x5b4332));
    trunk.position.y = 0.22;
    g.add(trunk);
    [[0.55, 0.7, 0.6], [0.45, 0.6, 0.98], [0.32, 0.5, 1.32]].forEach(([r, h, y]) => {
      const c = mesh(new THREE.ConeGeometry(r, h, 6), mat(0x6c8461));
      c.position.y = y;
      c.rotation.y = rand(0, 1);
      g.add(c);
    });
    g.position.set(x, -0.5, z);
    g.scale.setScalar(s);
    world.add(g);
    deco.push(g);
  }
  function rock(x, z, s) {
    const r = mesh(new THREE.DodecahedronGeometry(0.3, 0), mat(0x9a948a));
    r.position.set(x, -0.45, z);
    r.scale.set(s * rand(0.9, 1.3), s * rand(0.6, 0.9), s);
    r.rotation.set(rand(0, 1), rand(0, 3), 0);
    world.add(r);
    deco.push(r);
  }
  [[-7.3, -1.6, 1.1], [-6.4, -3.4, 0.85], [-7.6, 0.9, 0.75], [6.9, -2.4, 1.05], [7.5, -0.4, 0.7], [6.2, 2.9, 0.8]].forEach((t) => tree(...t));
  [[6.9, 1.2, 1], [-6.3, 2.8, 1.2], [5.4, -3.6, 0.8], [-5.6, 3.9, 0.7], [-5.2, -4, 0.6], [5.6, 3.6, 0.55]].forEach((r) => rock(...r));

  const wood = mat(0x5b4332), plinthMat = mat(0x6e5240);
  const SQ = Math.SQRT2 / 2;
  const plinth = mesh(new THREE.CylinderGeometry(9.4 * SQ, 8.8 * SQ, 0.55, 4), plinthMat);
  plinth.rotation.y = Math.PI / 4;
  plinth.position.y = -0.27;
  world.add(plinth);
  [[0, -4.3, 9.1, 0.5], [0, 4.3, 9.1, 0.5], [-4.3, 0, 0.5, 8.1], [4.3, 0, 0.5, 8.1]].forEach(([x, z, w, d]) => {
    const bar = mesh(new THREE.BoxGeometry(w, 0.36, d), wood);
    bar.position.set(x, 0.18, z);
    world.add(bar);
  });
  const tileGeo = new THREE.BoxGeometry(1, 1, 1);
  const tileTop = [];
  const light = new THREE.Color(0xe2d3bb), dark = new THREE.Color(0x7d5a40);
  for (let c = 0; c < 8; c++) {
    tileTop[c] = [];
    for (let r = 0; r < 8; r++) {
      const h = rand(0.2, 0.25);
      const color = ((c + r) % 2 ? dark : light).clone().offsetHSL(0, 0, rand(-0.025, 0.025));
      const t = mesh(tileGeo, mat(color), false);
      t.scale.set(0.97, h, 0.97);
      t.position.set(c - 3.5, h / 2, r - 3.5);
      world.add(t);
      tileTop[c][r] = h;
    }
  }

  /* Pawns */
  const DARK_EYE = 0x1c1714, PAWN_SCALE = 1.18;
  function pawn(m) {
    const root = new THREE.Group(), bob = new THREE.Group(), head = new THREE.Group();
    root.add(bob);
    const bodyMat = mat(m.body), trimMat = mat(m.trim), eyeMat = mat(DARK_EYE, { roughness: 0.4 });
    const profile = [[0, 0], [0.38, 0], [0.4, 0.07], [0.33, 0.13], [0.26, 0.17], [0.2, 0.3], [0.15, 0.5], [0.14, 0.6], [0.23, 0.64], [0.23, 0.69], [0.12, 0.72], [0, 0.72]]
      .map(([x, y]) => new THREE.Vector2(x, y));
    bob.add(mesh(new THREE.LatheGeometry(profile, 8), bodyMat));
    head.position.y = 0.92;
    bob.add(head);
    head.add(mesh(new THREE.IcosahedronGeometry(0.25, 1), bodyMat));

    const eyes = [-1, 1].map((s) => {
      const eye = mesh(new THREE.BoxGeometry(0.05, 0.08, 0.04), eyeMat, false);
      eye.position.set(s * 0.085, 0.03, 0.232);
      head.add(eye);
      return eye;
    });
    const mouth = mesh(new THREE.BoxGeometry(0.07, 0.018, 0.03), eyeMat, false);
    mouth.position.set(0, -0.075, 0.232);
    head.add(mouth);
    const brows = [-1, 1].map((s) => {
      const b = mesh(new THREE.BoxGeometry(0.1, 0.024, 0.04), eyeMat, false);
      b.position.set(s * 0.09, 0.125, 0.205);
      b.userData.side = s;
      b.visible = false;
      head.add(b);
      return b;
    });

    const p = { m, root, bob, head, bodyMat, eyes, brows, browBase: 0, extra: null, flame: null, angryTint: 0 };
    ACCESSORIES[m.n](p, head, bob, trimMat, mat, mesh);

    // An invisible, generous hit area makes hovering forgiving
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.5, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 0.75;
    hit.userData.p = p;
    root.add(hit);
    p.hit = hit;
    scene.add(root);
    return p;
  }

  /* The bits that make each pawn look like itself */
  const ACCESSORIES = {
    Anchor(p, head, bob, trim) {
      const halo = mesh(new THREE.TorusGeometry(0.17, 0.028, 4, 12), mat(0xd9b45a, { emissive: 0x6b4f12, emissiveIntensity: 0.6 }));
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 0.42;
      head.add(halo);
      const beard = mesh(new THREE.ConeGeometry(0.15, 0.28, 5), mat(0xede6da));
      beard.rotation.x = Math.PI + 0.25;
      beard.position.set(0, -0.2, 0.13);
      head.add(beard);
      p.extra = (t) => { halo.position.y = 0.42 + Math.sin(t * 2) * 0.03; halo.rotation.z = t * 0.8 };
    },
    Dawn(p, head, bob, trim) {
      const crown = new THREE.Group();
      for (let i = 0; i < 8; i++) {
        const pivot = new THREE.Group();
        pivot.rotation.y = (i / 8) * Math.PI * 2;
        const ray = mesh(new THREE.ConeGeometry(0.05, 0.17, 4), mat(0xf6d77e, { emissive: 0x8a5a10, emissiveIntensity: 0.5 }));
        ray.position.set(0.19, 0.17, 0);
        ray.rotation.z = -0.55;
        pivot.add(ray);
        crown.add(pivot);
      }
      head.add(crown);
      p.extra = (t) => { crown.rotation.y = t * 0.9 };
    },
    Kindred(p, head, bob, trim) {
      const s = new THREE.Shape();
      s.moveTo(25, 25);
      s.bezierCurveTo(25, 25, 20, 0, 0, 0);
      s.bezierCurveTo(-30, 0, -30, 35, -30, 35);
      s.bezierCurveTo(-30, 55, -10, 77, 25, 95);
      s.bezierCurveTo(60, 77, 80, 55, 80, 35);
      s.bezierCurveTo(80, 35, 80, 0, 50, 0);
      s.bezierCurveTo(35, 0, 25, 25, 25, 25);
      const g = new THREE.ExtrudeGeometry(s, { depth: 22, bevelEnabled: false, curveSegments: 3 });
      g.center();
      const heart = mesh(g, mat(0xc8655f, { emissive: 0x5a1a18, emissiveIntensity: 0.4 }));
      heart.scale.setScalar(0.0034);
      heart.rotation.z = Math.PI;
      heart.position.y = 0.48;
      head.add(heart);
      [-1, 1].forEach((sd) => {
        const cheek = mesh(new THREE.CircleGeometry(0.035, 6), mat(0xe7a3a0), false);
        cheek.position.set(sd * 0.14, -0.035, 0.205);
        cheek.rotation.y = sd * 0.55;
        head.add(cheek);
      });
      p.extra = (t) => { heart.position.y = 0.48 + Math.sin(t * 3) * 0.04; heart.rotation.y = Math.sin(t * 1.5) * 0.6; heart.scale.setScalar(0.0034 * (1 + Math.max(0, Math.sin(t * 6)) * 0.12)) };
    },
    Pyre(p, head) {
      const flame = new THREE.Group();
      const outer = mesh(new THREE.ConeGeometry(0.15, 0.36, 5), mat(0xe8813a, { emissive: 0xc0451a, emissiveIntensity: 0.8 }), false);
      const inner = mesh(new THREE.ConeGeometry(0.085, 0.24, 5), mat(0xf4c25b, { emissive: 0xe0a020, emissiveIntensity: 0.9 }), false);
      outer.position.y = 0.18;
      inner.position.y = 0.14;
      inner.position.z = 0.03;
      flame.add(outer, inner);
      flame.position.y = 0.18;
      head.add(flame);
      p.flame = flame;
      p.browBase = 0.25; // Pyre always looks a little cross
      p.extra = (t, rage) => {
        const k = 1 + rage * 1.4;
        flame.scale.set(k * (1 + Math.sin(t * 17) * 0.08), k * (1 + Math.sin(t * 23 + 1) * 0.16), k);
        flame.rotation.y = t * 2;
      };
    },
    Shadow(p, head) {
      [-1, 1].forEach((s) => {
        const horn = mesh(new THREE.ConeGeometry(0.055, 0.22, 4), mat(0x7a2e2e));
        horn.position.set(s * 0.13, 0.22, 0.02);
        horn.rotation.z = -s * 0.5;
        head.add(horn);
      });
      const glow = mat(0xf2cf73, { emissive: 0xe9b949, emissiveIntensity: 1.4 });
      p.eyes.forEach((e) => { e.material = glow });
      p.browBase = 0.35; // villain brows, always
      p.extra = (t) => { glow.emissiveIntensity = 1.1 + Math.sin(t * 2.4) * 0.4 };
    },
    Wanderer(p, head, bob, trim) {
      const hat = new THREE.Group();
      const khaki = mat(0xa88a5e), band = mat(0x5b4332);
      const brim = mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 9), khaki);
      const crown = mesh(new THREE.CylinderGeometry(0.17, 0.21, 0.17, 9), khaki);
      const ribbon = mesh(new THREE.CylinderGeometry(0.212, 0.212, 0.045, 9), band);
      brim.position.y = 0.17;
      crown.position.y = 0.27;
      ribbon.position.y = 0.21;
      hat.add(brim, crown, ribbon);
      hat.rotation.z = 0.12;
      head.add(hat);
      const pack = mesh(new THREE.BoxGeometry(0.28, 0.3, 0.14), mat(0x7a5a3e));
      pack.position.set(0, 0.42, -0.22);
      bob.add(pack);
      const roll = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 6), mat(0x9b7e66));
      roll.rotation.z = Math.PI / 2;
      roll.position.set(0, 0.6, -0.22);
      bob.add(roll);
    },
    Grug(p, head, bob, trim) {
      const hair = mat(0x3b2c22);
      for (let i = 0; i < 6; i++) {
        const tuft = mesh(new THREE.ConeGeometry(0.07, 0.16, 4), hair);
        const a = (i / 6) * Math.PI * 2;
        tuft.position.set(Math.cos(a) * 0.12, 0.2, Math.sin(a) * 0.12 - 0.02);
        tuft.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
        head.add(tuft);
      }
      const boneMat = mat(0xede3cf);
      const bone = new THREE.Group();
      const shaft = mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.3, 5), boneMat);
      shaft.rotation.z = Math.PI / 2;
      bone.add(shaft);
      [[-0.15, 0.03], [-0.15, -0.03], [0.15, 0.03], [0.15, -0.03]].forEach(([x, z]) => {
        const knob = mesh(new THREE.IcosahedronGeometry(0.042, 0), boneMat);
        knob.position.set(x, 0, z);
        bone.add(knob);
      });
      bone.position.y = 0.27;
      bone.rotation.y = 0.4;
      head.add(bone);
      const club = mesh(new THREE.CylinderGeometry(0.075, 0.035, 0.55, 6), mat(0x6b4a33));
      club.position.set(0.33, 0.36, 0.05);
      club.rotation.z = 0.35;
      bob.add(club);
      // One big unibrow, always on
      p.brows.forEach((b) => { b.visible = false });
      const uni = mesh(new THREE.BoxGeometry(0.22, 0.035, 0.04), hair, false);
      uni.position.set(0, 0.12, 0.208);
      head.add(uni);
      p.uni = uni;
    },
  };

  const pawns = members.map(pawn);
  const byMember = new Map(pawns.map((p) => [p.m, p]));

  /* Board occupancy and starting squares */
  const occ = new Map();
  const key = (c, r) => c + ',' + r;
  const inside = (c, r) => c >= 0 && c < 8 && r >= 0 && r < 8;
  const free = (c, r) => inside(c, r) && !occ.has(key(c, r));
  const START = [[1, 6], [3, 5], [5, 6], [6, 3], [1, 2], [4, 2], [6, 6]].sort(() => Math.random() - 0.5);
  const clock = new THREE.Clock();
  pawns.forEach((p, i) => {
    const [c, r] = START[i];
    place(p, c, r);
    p.pos = new THREE.Vector3(c - 3.5, tileTop[c][r], r - 3.5);
    p.yaw = rand(-0.6, 0.6);
    p.next = rand(0.6, 3);
    p.blinkAt = rand(1, 4);
    p.phase = rand(0, 6);
    p.shake = 0;
    p.squash = 0;
    p.jump = null;
    p.move = null;
    p.attendUntil = 0;
    p.hovered = false;
    p.steamAt = 0;
    p.stormAt = 0;
  });
  function place(p, c, r) {
    if (p.c != null) occ.delete(key(p.c, p.r));
    p.c = c;
    p.r = r;
    occ.set(key(c, r), p);
  }

  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const KNIGHT = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
  function clearPath(p, dc, dr, n) {
    for (let i = 1; i <= n; i++) if (!free(p.c + dc * i, p.r + dr * i)) return false;
    return true;
  }
  function options(p) {
    const out = [];
    const style = p.m.move;
    if (style === 'knight') {
      KNIGHT.forEach(([dc, dr]) => free(p.c + dc, p.r + dr) && out.push([p.c + dc, p.r + dr]));
    } else if (style === 'friend') {
      // Kindred steps toward whoever is closest, but never crowds them
      let best = null, bd = Infinity;
      pawns.forEach((o) => { if (o !== p) { const d = Math.max(Math.abs(o.c - p.c), Math.abs(o.r - p.r)); if (d < bd) { bd = d; best = o } } });
      if (best && bd > 1) {
        DIRS.forEach(([dc, dr]) => {
          const c = p.c + dc, r = p.r + dr;
          if (free(c, r) && Math.max(Math.abs(best.c - c), Math.abs(best.r - r)) < bd) out.push([c, r]);
        });
      }
      if (!out.length) DIRS.forEach(([dc, dr]) => free(p.c + dc, p.r + dr) && Math.random() < 0.4 && out.push([p.c + dc, p.r + dr]));
    } else if (style === 'charge') {
      // Pyre runs in a straight line as far as it can
      DIRS.forEach(([dc, dr]) => {
        let n = 0;
        while (n < 4 && free(p.c + dc * (n + 1), p.r + dr * (n + 1))) n++;
        if (n >= 2) out.push([p.c + dc * n, p.r + dr * n]);
      });
    } else {
      const dirs = style === 'rook' ? DIRS.slice(0, 4) : style === 'bishop' ? DIRS.slice(4) : DIRS;
      const max = style === 'king' ? 1 : style === 'queen' ? 3 : 2;
      dirs.forEach(([dc, dr]) => {
        for (let n = 1; n <= max; n++) if (clearPath(p, dc, dr, n)) out.push([p.c + dc * n, p.r + dr * n]);
      });
    }
    return out;
  }
  function farSquare(p) {
    const out = [];
    for (let c = 0; c < 8; c++) for (let r = 0; r < 8; r++) {
      if (free(c, r) && Math.max(Math.abs(c - p.c), Math.abs(r - p.r)) >= 3) out.push([c, r]);
    }
    return out[Math.floor(Math.random() * out.length)];
  }

  function startMove(p, t, c, r, opts = {}) {
    const dist = Math.max(Math.abs(c - p.c), Math.abs(r - p.r));
    const knight = p.m.move === 'knight' && !opts.rush;
    const glide = p.m.move === 'bishop' && !opts.rush;
    const speed = opts.rush ? 0.6 : p.m.n === 'Pyre' ? 0.7 : p.m.n === 'Grug' ? 1.35 : 1;
    p.move = {
      fx: p.pos.x, fz: p.pos.z, fy: p.pos.y, tx: c - 3.5, tz: r - 3.5, ty: tileTop[c][r], t0: t,
      dur: (knight ? 0.75 : glide ? 0.5 + dist * 0.35 : 0.32 + dist * 0.26) * speed,
      hops: knight || glide ? 1 : dist,
      height: knight ? 0.95 : glide ? 0.06 : opts.rush ? 0.4 : 0.28,
      glide,
      tp: !!opts.teleport,
    };
    place(p, c, r);
  }

  function wander(p, t) {
    if (reduceMotion) return;
    const opts = options(p);
    if (!opts.length) { p.next = t + 1; return }
    const [c, r] = opts[Math.floor(Math.random() * opts.length)];
    startMove(p, t, c, r);
  }

  /* Steam puffs for angry pawns */
  const puffs = [];
  const puffGeo = new THREE.IcosahedronGeometry(0.07, 0);
  function puff(x, y, z, color = 0xd9d4cc) {
    let s = puffs.find((q) => q.life <= 0);
    if (!s) {
      if (puffs.length > 60) return;
      s = { mesh: new THREE.Mesh(puffGeo, mat(color, { transparent: true })) };
      scene.add(s.mesh);
      puffs.push(s);
    }
    s.mesh.material.color.set(color);
    s.mesh.position.set(x + rand(-0.12, 0.12), y, z + rand(-0.12, 0.12));
    s.v = new THREE.Vector3(rand(-0.3, 0.3), rand(0.9, 1.5), rand(-0.3, 0.3));
    s.life = s.max = rand(0.6, 1);
    s.mesh.visible = true;
  }

  /* Camera: a high three-quarter view that reads as top down but shows faces */
  const target = new THREE.Vector3(0, 0, 0.55);
  const tmp = new THREE.Vector3();
  const EL = 54 * DEG;
  let dist = 20, viewW = 1, viewH = 1, px = 0, py = 0, tpx = 0, tpy = 0;
  function aim(d, az = 0, el = EL) {
    camera.position.set(target.x + d * Math.sin(az) * Math.cos(el), target.y + d * Math.sin(el), target.z + d * Math.cos(az) * Math.cos(el));
    camera.lookAt(target);
    camera.updateMatrixWorld();
  }
  // Board corners, back-row heads and the island's front lip must all be in frame,
  // with room left at the top for speech bubbles.
  const MUST_SEE = [[-4.6, 0.4, -4.6], [4.6, 0.4, -4.6], [-4.6, 0.4, 4.6], [4.6, 0.4, 4.6], [-3.5, 2, -3.5], [3.5, 2, -3.5], [0, -0.55, ISLAND_RZ]]
    .map((v) => new THREE.Vector3(...v));
  function fit() {
    viewW = stage.clientWidth || 1;
    viewH = stage.clientHeight || 1;
    renderer.setSize(viewW, viewH, false);
    camera.aspect = viewW / viewH;
    camera.updateProjectionMatrix();
    let lo = 6, hi = 90;
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2;
      aim(mid);
      const ok = MUST_SEE.every((v) => { tmp.copy(v).project(camera); return Math.abs(tmp.x) < 0.95 && tmp.y > -0.96 && tmp.y < 0.66 });
      if (ok) hi = mid; else lo = mid;
    }
    dist = hi;
    // Widen the island to fill the view, and drop trees that would fall off it
    aim(dist);
    tmp.set(1, -0.55, 2).project(camera);
    const rx = clamp(0.94 / Math.abs(tmp.x), 6.2, 9.2);
    top.scale.x = under.scale.x = rx;
    deco.forEach((d) => {
      const { x, z } = d.position;
      d.visible = (x / (rx - 0.7)) ** 2 + (z / (ISLAND_RZ - 0.7)) ** 2 < 1;
    });
  }
  fit();
  new ResizeObserver(fit).observe(stage);

  /* Pointer: hover, click, and a little parallax */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const hits = pawns.map((p) => p.hit);
  let hovered = null;
  function pickAt(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects(hits, false)[0];
    return h ? h.object.userData.p : null;
  }
  const canvas = renderer.domElement;
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    tpx = ((e.clientX - r.left) / r.width) * 2 - 1;
    tpy = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (e.pointerType !== 'mouse') return;
    const p = pickAt(e);
    if (p === hovered) return;
    if (hovered) hoverOut(hovered);
    hovered = p;
    canvas.style.cursor = p ? 'pointer' : '';
    if (p) p.m.chip.dispatchEvent(new Event('mouseenter'));
  });
  function hoverOut(p) { p.m.chip.dispatchEvent(new Event('mouseleave')) }
  canvas.addEventListener('pointerleave', () => {
    tpx = tpy = 0;
    if (hovered) hoverOut(hovered);
    hovered = null;
    canvas.style.cursor = '';
  });
  canvas.addEventListener('click', (e) => {
    const p = pickAt(e);
    if (p) p.m.chip.click();
  });

  /* Run only while the chamber is on screen */
  let running = false, raf = 0;
  new IntersectionObserver((en) => {
    const on = en[0].isIntersecting;
    if (on && !running) { running = true; clock.getDelta(); raf = requestAnimationFrame(frame) }
    if (!on) { running = false; cancelAnimationFrame(raf) }
  }).observe(stage);

  const ANGRY_RED = new THREE.Color(0xc2412d);
  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const motion = reduceMotion ? 0 : 1;

    // Camera with soft parallax
    px += (tpx - px) * Math.min(1, dt * 3) * motion;
    py += (tpy - py) * Math.min(1, dt * 3) * motion;
    aim(dist, px * 0.09, EL - py * 0.035);

    pawns.forEach((p) => step(p, t, dt, motion));

    puffs.forEach((s) => {
      if (s.life <= 0) return;
      s.life -= dt;
      s.mesh.position.addScaledVector(s.v, dt);
      const k = 1 - s.life / s.max;
      s.mesh.scale.setScalar(0.6 + k * 1.6);
      s.mesh.material.opacity = Math.max(0, 0.85 * (1 - k));
      if (s.life <= 0) s.mesh.visible = false;
    });

    renderer.render(scene, camera);
    placeBubbles();
  }

  function step(p, t, dt, motion) {
    const m = p.m;
    const rage = m.anger >= ANGRY ? 1 : m.anger >= ANNOYED ? 0.45 : 0;
    const attending = p.hovered || t < p.attendUntil;

    // Storm off after an angry outburst
    if (p.stormAt && t >= p.stormAt) {
      p.stormAt = 0;
      const sq = !p.move && farSquare(p);
      if (sq && motion) {
        const tele = m.n === 'Shadow';
        startMove(p, t, sq[0], sq[1], { rush: true, teleport: tele });
        if (tele) for (let i = 0; i < 8; i++) puff(p.pos.x, p.pos.y + 0.6, p.pos.z, 0x5c5160);
      }
    }
    if (!p.move && !attending && !p.stormAt && t >= p.next) wander(p, t);

    let y = p.pos.y, scale = 1;
    if (p.move) {
      const mv = p.move;
      const k = clamp((t - mv.t0) / mv.dur, 0, 1);
      if (mv.tp) {
        // Shadow vanishes, then reappears somewhere else
        if (k >= 0.5 && !mv.jumped) {
          mv.jumped = true;
          p.pos.set(mv.tx, mv.ty, mv.tz);
          for (let i = 0; i < 8; i++) puff(mv.tx, mv.ty + 0.6, mv.tz, 0x5c5160);
        }
        scale = Math.abs(1 - 2 * k);
        y = p.pos.y;
      } else {
        const e = mv.hops > 1 ? k : ease(k);
        p.pos.x = mv.fx + (mv.tx - mv.fx) * e;
        p.pos.z = mv.fz + (mv.tz - mv.fz) * e;
        p.pos.y = mv.fy + (mv.ty - mv.fy) * e;
        y = p.pos.y + Math.abs(Math.sin(Math.PI * k * mv.hops)) * mv.height;
        p.yawTarget = Math.atan2(mv.tx - mv.fx, mv.tz - mv.fz);
      }
      if (k >= 1) {
        p.move = null;
        p.squash = mv.glide ? 0.3 : 1;
        p.next = t + rand(m.every[0], m.every[1]);
      }
    }
    if (p.jump) {
      const k = (t - p.jump.t0) / p.jump.dur;
      if (k >= 1) { p.jump = null; p.squash = 0.8 } else y += Math.sin(Math.PI * k) * p.jump.h;
    }

    // Facing: toward you while hovered or talking, otherwise where it is going
    if (attending) p.yawTarget = Math.atan2(camera.position.x - p.pos.x, camera.position.z - p.pos.z);
    if (p.yawTarget != null) {
      let d = p.yawTarget - p.yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      p.yaw += d * Math.min(1, dt * (p.move ? 10 : 7));
    }

    // Shake, squash and breathing
    p.shake = Math.max(0, p.shake - dt * 0.35);
    p.squash = Math.max(0, p.squash - dt * 4);
    const breathe = 1 + Math.sin(t * 2.2 + p.phase) * 0.025 * motion;
    const sq = p.squash * 0.2;
    p.root.position.set(p.pos.x, y, p.pos.z);
    p.root.rotation.y = p.yaw;
    p.root.scale.setScalar(scale * PAWN_SCALE);
    p.bob.scale.set(1 + sq * 0.6, breathe - sq, 1 + sq * 0.6);
    p.bob.position.x = Math.sin(t * 55) * p.shake * motion;
    p.bob.rotation.z = rage && motion ? Math.sin(t * 40) * 0.04 * rage : 0;
    p.head.rotation.x = p.hovered ? -0.12 : 0;
    p.head.rotation.z = Math.sin(t * 1.3 + p.phase) * 0.05 * motion;

    // Blink
    const blinking = t > p.blinkAt && t < p.blinkAt + 0.12;
    if (t > p.blinkAt + 0.12) p.blinkAt = t + rand(2, 5);
    p.eyes.forEach((e) => { e.scale.y = blinking ? 0.12 : p.hovered ? 0.6 : 1 });

    // Brows and colour follow the mood
    const browAngle = Math.max(p.browBase, rage ? 0.25 + rage * 0.3 : 0);
    p.brows.forEach((b) => {
      b.visible = !p.uni && browAngle > 0;
      b.rotation.z = -b.userData.side * browAngle;
      b.position.y = 0.125 - rage * 0.02;
    });
    if (p.uni) p.uni.position.y = 0.12 - rage * 0.035;
    p.angryTint += (rage * 0.55 - p.angryTint) * Math.min(1, dt * 4);
    p.bodyMat.color.set(m.body).lerp(ANGRY_RED, p.angryTint);
    p.bodyMat.emissive.copy(ANGRY_RED).multiplyScalar(p.angryTint * 0.35);

    if (rage >= 1 && motion && t > p.steamAt) {
      p.steamAt = t + 0.1;
      puff(p.pos.x, y + 1.3 * PAWN_SCALE, p.pos.z);
    }
    if (p.extra) p.extra(t * (motion || 0.0001), rage);
  }

  /* Bubbles sit over each pawn's head. Nearer pawns keep their spot and
     bubbles behind them stack upward instead of overlapping. */
  function placeBubbles() {
    const shown = [];
    pawns.forEach((p) => {
      const m = p.m, b = m.bubble;
      if (!b.classList.contains('show')) return;
      if (!m.bubbleW) { m.bubbleW = b.offsetWidth; m.bubbleH = b.offsetHeight }
      tmp.set(p.root.position.x, p.root.position.y + 1.5 * PAWN_SCALE, p.root.position.z).project(camera);
      const x = (tmp.x + 1) / 2 * viewW, half = m.bubbleW / 2;
      shown.push({ b, x, cx: clamp(x, half + 6, viewW - half - 6), y: (1 - tmp.y) / 2 * viewH, w: m.bubbleW, h: m.bubbleH, z: p.root.position.z });
    });
    shown.sort((a, c) => c.y - a.y);
    const placed = [];
    shown.forEach((s) => {
      for (let moved = true, guard = 0; moved && guard < 12; guard++) {
        moved = false;
        for (const q of placed) {
          const overlapX = Math.abs(s.cx - q.cx) < (s.w + q.w) / 2 + 4;
          const overlapY = s.y > q.y - q.h - 4 && s.y - s.h < q.y;
          if (overlapX && overlapY) { s.y = q.y - q.h - 4; moved = true }
        }
      }
      placed.push(s);
      s.b.style.setProperty('--tail', (s.x - s.cx).toFixed(1) + 'px');
      s.b.style.transform = 'translate(' + s.cx.toFixed(1) + 'px,' + Math.max(s.h + 2, s.y).toFixed(1) + 'px) translate(-50%,-100%)';
      s.b.style.zIndex = String(100 + Math.round(s.z * 10));
    });
  }

  // Draw the first frame now, even off screen: shaders compile ahead of time and
  // the board is already there when it scrolls into view.
  pawns.forEach((p) => {
    p.root.position.copy(p.pos);
    p.root.rotation.y = p.yaw;
    p.root.scale.setScalar(PAWN_SCALE);
  });
  renderer.render(scene, camera);
  if (onDrawn) onDrawn();

  return {
    setHover(m, on) {
      const p = byMember.get(m);
      p.hovered = on;
      if (on && !p.move && !p.jump && !reduceMotion) p.jump = { t0: clock.elapsedTime, dur: 0.32, h: 0.14 };
    },
    attend(m, ms) {
      const p = byMember.get(m);
      p.attendUntil = Math.max(p.attendUntil, clock.elapsedTime + Math.min(ms / 1000, 3));
    },
    react(m, lvl) {
      const p = byMember.get(m), t = clock.elapsedTime;
      if (reduceMotion || p.move) return;
      if (lvl === 'ask' || lvl === 'poke') p.jump = { t0: t, dur: 0.42, h: lvl === 'ask' ? 0.32 : 0.38 };
      if (lvl === 'annoyed') { p.jump = { t0: t, dur: 0.22, h: 0.12 }; p.shake = 0.05 }
      if (lvl === 'angry') {
        p.jump = { t0: t, dur: 0.3, h: 0.22 };
        p.shake = 0.1;
        for (let i = 0; i < 6; i++) puff(p.pos.x, p.pos.y + 1.2, p.pos.z);
        p.stormAt = t + 0.9;
      }
    },
  };
}
