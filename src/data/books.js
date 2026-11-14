// Reading Ocean catalogue.
// Spine colours (genre.spine) and cover colours (book.cover) come from the Figma frames:
//   Human Psychology  #e1cda2 → #b39c6c   (mobile flat #d8c59e)
//   Business & Wealth #c29a4d → #b39c6c   (mobile flat #be984f)
//   Philosophy        #b66f4c → #8b5038   (mobile flat #b87651)
//   Sci-Fi & Tech     #7e8b89 → #536665   (mobile flat #7b8d88)
// Light covers use dark ink; dark covers use cream ink — same pairing Figma uses.

const light = (bg) => ({ bg, ink: '#37372e', rule: '#6d6149', binding: '#a98e67' })
const dark = (bg) => ({ bg, ink: '#efe0ba', rule: '#b7a06e', binding: '#282b25' })

const SPINE_INK = { ink: '#2a241b', numeral: '#3b3025', rule: '#715635' }

export const genres = [
  {
    id: 'psychology',
    number: '01',
    name: 'Human Psychology',
    tagline: 'Understand yourself. Discover each other.',
    spine: { from: '#e1cda2', to: '#b39c6c', flat: '#d8c59e', ...SPINE_INK },
    height: { desktop: 230, mobile: 154 },
    books: [
      {
        id: 'atomic-habits',
        title: 'Atomic Habits',
        author: 'James Clear',
        price: 499,
        isRecommended: true,
        tagline: 'The small-change classic',
        synopsis:
          'A practical system for building good habits and breaking bad ones through tiny changes that compound. Clear splits every habit into cue, craving, response and reward, then shows how to shape each step.',
        cover: light('#e1d2ad'),
      },
      {
        id: 'thinking-fast-and-slow',
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        price: 599,
        isRecommended: true,
        tagline: 'The science of everyday choices',
        synopsis:
          'Nobel laureate Daniel Kahneman maps the two modes of thought: fast, intuitive System 1 and slow, deliberate System 2. He shows where each one misleads us, from snap judgements to costly biases.',
        cover: dark('#9a5438'),
      },
      {
        id: '48-laws-of-power',
        title: 'The 48 Laws of Power',
        author: 'Robert Greene',
        price: 549,
        isRecommended: false,
        synopsis:
          'A catalogue of 48 maxims on gaining and guarding power, each illustrated with episodes from history: courts, battlefields and boardrooms. Part strategy manual, part cautionary tale.',
        cover: dark('#7b3b2d'),
      },
      {
        id: 'subtle-art',
        title: 'The Subtle Art of Not Giving a F*ck',
        author: 'Mark Manson',
        price: 399,
        isRecommended: false,
        synopsis:
          'A blunt counter to relentless positivity. You cannot care about everything, so choose the few values worth struggling for and accept the discomfort that comes with them.',
        cover: light('#bf8b43'),
      },
      {
        id: 'influence',
        title: 'Influence',
        author: 'Robert Cialdini',
        price: 449,
        isRecommended: false,
        synopsis:
          'Cialdini’s research into why people say yes, organised around six principles of persuasion: reciprocity, commitment, social proof, authority, liking and scarcity.',
        cover: light('#d9d3b9'),
      },
      {
        id: 'surrounded-by-idiots',
        title: 'Surrounded by Idiots',
        author: 'Thomas Erikson',
        price: 349,
        isRecommended: false,
        synopsis:
          'Uses a four-colour model of behavioural styles (red, yellow, green and blue) to explain why people misread each other, and how to communicate across the differences.',
        cover: dark('#626c56'),
      },
    ],
  },
  {
    id: 'business',
    number: '02',
    name: 'Business & Wealth',
    tagline: 'Money, markets and the habit of building.',
    spine: { from: '#c29a4d', to: '#b39c6c', flat: '#be984f', ...SPINE_INK },
    height: { desktop: 219, mobile: 146 },
    books: [
      {
        id: 'psychology-of-money',
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        price: 399,
        isRecommended: true,
        tagline: 'On behaving well with money',
        synopsis:
          'Short essays arguing that how you behave with money matters more than how much you know: on luck, risk, patience and knowing when you have enough.',
        cover: dark('#626c56'),
      },
      {
        id: 'intelligent-investor',
        title: 'The Intelligent Investor',
        author: 'Benjamin Graham',
        price: 599,
        isRecommended: true,
        tagline: 'The value-investing cornerstone',
        synopsis:
          'The foundational text of value investing. Treat shares as stakes in real businesses, insist on a margin of safety, and keep emotion out of your dealings with the market.',
        cover: dark('#7b3b2d'),
      },
      {
        id: 'rich-dad-poor-dad',
        title: 'Rich Dad Poor Dad',
        author: 'Robert T. Kiyosaki',
        price: 349,
        isRecommended: false,
        synopsis:
          'Kiyosaki contrasts the money lessons he took from two father figures to argue for financial education, owning assets and making money work for you.',
        cover: light('#bf8b43'),
      },
      {
        id: 'zero-to-one',
        title: 'Zero to One',
        author: 'Peter Thiel with Blake Masters',
        price: 499,
        isRecommended: false,
        synopsis:
          'Thiel’s case that real progress comes from building something new rather than copying what already works, with lessons on monopoly, timing and founding a company.',
        cover: light('#d9d3b9'),
      },
      {
        id: 'almanack-of-naval',
        title: 'The Almanack of Naval Ravikant',
        coverTitle: 'Almanack of Naval Ravikant',
        author: 'Eric Jorgenson',
        price: 399,
        isRecommended: false,
        synopsis:
          'A compilation of Naval Ravikant’s thinking on wealth and happiness, assembled by Eric Jorgenson from Naval’s own tweets, podcasts and essays.',
        cover: dark('#536665'),
      },
      {
        id: 'lean-startup',
        title: 'The Lean Startup',
        author: 'Eric Ries',
        price: 449,
        isRecommended: false,
        synopsis:
          'Ries proposes building products in rapid cycles of build, measure and learn, using small experiments to test ideas before committing real resources.',
        cover: dark('#9a5438'),
      },
    ],
  },
  {
    id: 'philosophy',
    number: '03',
    name: 'Philosophy & Stoicism',
    tagline: 'Old ideas for unsteady days.',
    spine: { from: '#b66f4c', to: '#8b5038', flat: '#b87651', ...SPINE_INK },
    height: { desktop: 234, mobile: 160 },
    books: [
      {
        id: 'meditations',
        title: 'Meditations',
        author: 'Marcus Aurelius',
        price: 299,
        isRecommended: true,
        tagline: 'A Caesar’s private notebook',
        synopsis:
          'Private notes the Roman emperor wrote to himself on duty, impermanence and self-control: a Stoic’s daily practice set down in plain, urgent sentences.',
        cover: light('#e1d2ad'),
      },
      {
        id: 'obstacle-is-the-way',
        title: 'The Obstacle Is the Way',
        author: 'Ryan Holiday',
        price: 399,
        isRecommended: true,
        tagline: 'Turn friction into fuel',
        synopsis:
          'Draws on Stoic philosophy and stories of historical figures to argue that the thing blocking your path can become the path itself.',
        cover: dark('#7b3b2d'),
      },
      {
        id: 'letters-from-a-stoic',
        title: 'Letters from a Stoic',
        author: 'Seneca',
        price: 349,
        isRecommended: false,
        synopsis:
          'A selection of Seneca’s letters to his friend Lucilius, with advice on friendship, grief, time and the work of living well.',
        cover: dark('#626c56'),
      },
      {
        id: 'mans-search-for-meaning',
        title: 'Man’s Search for Meaning',
        author: 'Viktor E. Frankl',
        price: 299,
        isRecommended: false,
        synopsis:
          'Frankl recounts his years in Nazi concentration camps and sets out logotherapy, his view that the search for meaning is what sustains us.',
        cover: light('#bf8b43'),
      },
      {
        id: 'daily-stoic',
        title: 'The Daily Stoic',
        author: 'Ryan Holiday & Stephen Hanselman',
        price: 549,
        isRecommended: false,
        synopsis:
          'Three hundred and sixty-six short meditations, one for every day, pairing Stoic texts with commentary on how to apply them to ordinary life.',
        cover: dark('#536665'),
      },
    ],
  },
  {
    id: 'scifi',
    number: '04',
    name: 'Sci-Fi & Tech',
    tagline: 'Futures worth reading about.',
    spine: { from: '#7e8b89', to: '#536665', flat: '#7b8d88', ...SPINE_INK },
    height: { desktop: 214, mobile: 150 },
    books: [
      {
        id: 'dune',
        title: 'Dune',
        author: 'Frank Herbert',
        price: 499,
        isRecommended: true,
        tagline: 'The desert epic',
        synopsis:
          'On the desert planet Arrakis, young Paul Atreides is drawn into a struggle over spice, the universe’s most valuable substance, in a saga of politics, ecology and prophecy.',
        cover: light('#bf8b43'),
      },
      {
        id: 'project-hail-mary',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        price: 549,
        isRecommended: true,
        tagline: 'A solo mission, a long shot',
        synopsis:
          'A lone astronaut wakes with no memory aboard a spacecraft and must piece together a mission to save Earth, with help from an unexpected ally.',
        cover: dark('#536665'),
      },
      {
        id: 'foundation',
        title: 'Foundation',
        author: 'Isaac Asimov',
        price: 399,
        isRecommended: false,
        synopsis:
          'Mathematician Hari Seldon foresees the collapse of a galactic empire and sets up a Foundation to shorten the dark age that follows.',
        cover: dark('#7b3b2d'),
      },
      {
        id: 'neuromancer',
        title: 'Neuromancer',
        author: 'William Gibson',
        price: 399,
        isRecommended: false,
        synopsis:
          'A washed-up hacker is hired for one last job in cyberspace, in the novel that helped define cyberpunk.',
        cover: dark('#4b4660'),
      },
      {
        id: 'three-body-problem',
        title: 'The Three-Body Problem',
        author: 'Cixin Liu',
        price: 499,
        isRecommended: false,
        synopsis:
          'Set against China’s Cultural Revolution, a secret military project makes contact with an alien civilisation, and a strange virtual game hints at what is coming.',
        cover: light('#d9d3b9'),
      },
    ],
  },
]

// Stamp every book with its genre so a selected book can name its shelf.
genres.forEach((g) =>
  g.books.forEach((b) => {
    b.genreId = g.id
    b.genreName = g.name
  }),
)

export const allBooks = genres.flatMap((g) => g.books)
