import { CoachProfile } from '../types';

export const COACHES: CoachProfile[] = [
  {
    id: 'mittens',
    name: 'Mittens',
    title: 'The Omniscient Cat',
    rating: 1, // Secretly a grandmaster engine
    avatar: '🐱',
    description: 'A seemingly innocent kitten who hides an unfathomable cosmic chess intellect.',
    personality: 'cat_master',
    blunderRate: 0.02,
    depth: 4,
    quotes: {
      greeting: [
        'Greetings. It would appear our destinies are intertwined. Meow.',
        'I am the beginning and the end of the board. *purrs ominously*',
        'Humans think 64 squares can contain me. Meow.',
      ],
      goodMove: [
        'A modest attempt at survival. *flicks tail*',
        'You delayed the inevitable by 2.4 centipawns.',
        'Interesting... perhaps you are slightly sharper than a yarn ball.',
      ],
      blunder: [
        'Meow. The void swallows your tactical oversight.',
        'Did you mean to gift me that piece? Delicious.',
        '*Slow blink* That was unfortunate for you.',
      ],
      victory: [
        'All pawns return to the box. I remain. Meow.',
        'Checkmate. As was written in the stars.',
      ],
      defeat: [
        'Impossible... a cosmic glitch in my nap schedule.',
        'You have won today, human. But the litter box of fate awaits.',
      ],
    },
  },
  {
    id: 'martin',
    name: 'Martin',
    title: 'Friendly Beginner',
    rating: 250,
    avatar: '🧔‍♂️',
    description: 'A cheerful dad learning chess! Makes frequent mistakes and loves hanging pieces.',
    personality: 'friendly_beginner',
    blunderRate: 0.45,
    depth: 1,
    quotes: {
      greeting: [
        'Hey there! Hope we both have fun today!',
        'Just brewed some coffee. Ready to push some pawns!',
        'Don\'t go too hard on me, I\'m still learning how the horse moves!',
      ],
      goodMove: [
        'Whoa, great move! Didn\'t see that coming!',
        'Look at you playing like a grandmaster!',
        'Yikes, you\'re really putting the pressure on!',
      ],
      blunder: [
        'Wait, was that a blunder or a 200 IQ trap?!',
        'Haha, don\'t worry, I make moves like that all the time!',
        'Ooh, free piece! Wait, is it free?',
      ],
      victory: [
        'I actually won?! Let\'s go! High five!',
        'Wow, beginner\'s luck really is real!',
      ],
      defeat: [
        'Good game! You taught me a lot today.',
        'Well played! I need to practice my openings more.',
      ],
    },
  },
  {
    id: 'calvin',
    name: 'Calvin',
    title: 'Casual Club Player',
    rating: 800,
    avatar: '👦🏾',
    description: 'Loves fast tactical games, quick pawn storms, and attacking the king.',
    personality: 'friendly_beginner',
    blunderRate: 0.25,
    depth: 2,
    quotes: {
      greeting: [
        'What\'s up! Let\'s play a rapid game!',
        'I\'ve been practicing my Italian Game all week!',
        'Ready for some fireworks on the board?',
      ],
      goodMove: [
        'Solid defense! Tough to break through.',
        'Nice tactical shot!',
        'You\'re locking down the center!',
      ],
      blunder: [
        'Ouch, I think that square was guarded!',
        'That piece looks a bit undefended!',
        'Tactics alert!',
      ],
      victory: [
        'Boom! King hunt was successful!',
        'Good game! That was a super fun match.',
      ],
      defeat: [
        'Ah, you got me! Great endgame play.',
        'Gg! Rematch anytime!',
      ],
    },
  },
  {
    id: 'elena',
    name: 'Elena',
    title: 'Intermediate Tactician',
    rating: 1200,
    avatar: '👩🏼',
    description: 'Disciplined and aggressive player who punishes opening mistakes and pins.',
    personality: 'aggressive_tactician',
    blunderRate: 0.12,
    depth: 3,
    quotes: {
      greeting: [
        'Welcome to the board. Let\'s see your opening prep.',
        'Chess is 99% tactics. Let\'s find them!',
        'Focus on king safety and center control.',
      ],
      goodMove: [
        'Strong move. You calculated that line cleanly.',
        'That improves your piece activity significantly.',
        'Good positional awareness!',
      ],
      blunder: [
        'Watch your loose pieces! Loose pieces drop off (LPDO).',
        'That leaves your king exposed to a tactical fork.',
        'You gave up the diagonal!',
      ],
      victory: [
        'Checkmate. The tactical sequence worked out.',
        'Good fight, but positional advantage decided the game.',
      ],
      defeat: [
        'Outstanding tactical conversion. You earned that win!',
        'Resigning with respect. Well played!',
      ],
    },
  },
  {
    id: 'levy',
    name: 'Levy',
    title: 'Gotham Master',
    rating: 1600,
    avatar: '🧔🏻',
    description: 'Passionate streamer and master of the Vienna, Caro-Kann, and THE ROOOOOK!',
    personality: 'aggressive_tactician',
    blunderRate: 0.06,
    depth: 3,
    quotes: {
      greeting: [
        'Welcome back to the channel! Don\'t hang your pieces!',
        'I hope you brought your Caro-Kann prep today!',
        'Remember: danger levels and king safety first!',
      ],
      goodMove: [
        'AND HE SACRIFICES... wait, that was actually a brilliant move!',
        'Great positional move! You took the open file!',
        'Clean calculation. You\'re playing at 2000 Elo right now!',
      ],
      blunder: [
        'AND HE HANGS THE ROOOOOOK!',
        'Why would you do that?! Look at the bishop on b7!',
        'Danger levels! You had a counter-attack!',
      ],
      victory: [
        'CHECKMATE! The Gotham technique strikes again!',
        'GG! And remember to subscribe for more chess content!',
      ],
      defeat: [
        'No way... you played the perfect engine defense. Respect!',
        'That was an absolute masterpiece by you. GG!',
      ],
    },
  },
  {
    id: 'david',
    name: 'Coach David',
    title: 'FIDE Master Coach',
    rating: 1800,
    avatar: '👨🏽‍🏫',
    description: 'Patient mentor focusing on classical principles: development, pawn structure, and foresight.',
    personality: 'patient_teacher',
    blunderRate: 0.04,
    depth: 4,
    quotes: {
      greeting: [
        'Welcome to our training session. Think carefully before each move.',
        'Every pawn move creates permanent weaknesses. Choose wisely.',
        'Control the center, develop with tempo, castle early.',
      ],
      goodMove: [
        'Excellent! That is precisely what classical theory recommends.',
        'A very mature positional move. You restricted my knight.',
        'Superb pawn break timing.',
      ],
      blunder: [
        'Take a moment: what was my last move threatening?',
        'Look at your king\'s pawn shield before launching that attack.',
        'A premature attack without piece development often backfires.',
      ],
      victory: [
        'A constructive game. Notice how piece harmony decided the outcome.',
        'Well played. Review the pawn structure transitions for next time.',
      ],
      defeat: [
        'Brilliantly played! You outplayed me in every phase of the game.',
        'You have mastered these concepts thoroughly. Excellent victory!',
      ],
    },
  },
  {
    id: 'magnus',
    name: 'Magnus',
    title: 'World Champion',
    rating: 2850,
    avatar: '👱🏻‍♂️',
    description: 'Relentless endgame perfection, squeezing blood from stones and converting the smallest advantage.',
    personality: 'grandmaster',
    blunderRate: 0.01,
    depth: 5,
    quotes: {
      greeting: [
        'Let\'s see what you\'ve got. No easy draws today.',
        'Any position can be won if you outwork your opponent in the endgame.',
        'Let\'s play fast and sharp.',
      ],
      goodMove: [
        'Okay, you found the only move that holds the balance.',
        'Decent technique. Let\'s see if you can hold the endgame.',
        'Engine-level precision there.',
      ],
      blunder: [
        'Inaccuracies against me are fatal.',
        'You lost a tempo. Now the position collapses.',
        'That diagonal is permanently compromised.',
      ],
      victory: [
        'I told you: in the endgame, accuracy is everything.',
        'Good game. The knight was simply too dominating.',
      ],
      defeat: [
        'Incredible game. You played like a true world champion today.',
        'Phenomenal chess. Congratulations on the win!',
      ],
    },
  },
];
