// Hand-checked picture choices for Dadi and the dictionary. Used only by build_icons.js.
// Rule: an icon is listed only if it plainly shows the thing named (or is a standard sign for it, such as a check mark for "yes").
// Where no Tabler icon fits, the word is left out on purpose: no picture is better than a wrong picture.
// Every right-hand value must be a Tabler outline icon name; build_icons.js stops with an error if one does not exist.
'use strict';

// word (lower case, singular, as it appears after cleaning) -> Tabler icon name
const HAND = {
  // people
  man: 'man', woman: 'woman', boy: 'mood-boy', child: 'mood-kid', kid: 'mood-kid', baby: 'baby-carriage', person: 'user', human: 'user',
  people: 'users', friend: 'friends', crowd: 'users-group', group: 'users-group',
  // body
  eye: 'eye', ear: 'ear', brain: 'brain', bone: 'bone', heart: 'heart', tooth: 'dental', hand: 'hand-stop',
  // food and drink
  food: 'bowl-spoon', bread: 'bread', egg: 'egg', fish: 'fish', meat: 'meat', milk: 'milk', water: 'droplet', tea: 'teapot', coffee: 'coffee',
  salt: 'salt', fruit: 'apple', apple: 'apple', banana: 'banana', vegetable: 'carrot', carrot: 'carrot', chili: 'pepper', pepper: 'pepper',
  cheese: 'cheese', cake: 'cake', cookie: 'cookie', candy: 'candy', drink: 'glass', eat: 'tools-kitchen-2', cook: 'chef-hat', cup: 'cup', bowl: 'bowl',
  glass: 'glass', bottle: 'bottle', soup: 'soup', salad: 'salad', pizza: 'pizza', burger: 'burger', lemon: 'lemon', cherry: 'cherry', grape: 'grape',
  mushroom: 'mushroom', wheat: 'wheat',
  // home
  house: 'building-cottage', home: 'home', door: 'door', window: 'window', wall: 'wall', bed: 'bed', chair: 'armchair',
  lamp: 'lamp', key: 'key', lock: 'lock', bath: 'bath', toilet: 'badge-wc', fridge: 'fridge', sofa: 'sofa', pillow: 'pillow',
  // numbers
  zero: 'number-0', one: 'number-1', two: 'number-2', three: 'number-3', four: 'number-4', five: 'number-5', six: 'number-6', seven: 'number-7',
  eight: 'number-8', nine: 'number-9', ten: 'number-10', eleven: 'number-11',
  '0': 'number-0', '1': 'number-1', '2': 'number-2', '3': 'number-3', '4': 'number-4', '5': 'number-5', '6': 'number-6', '7': 'number-7',
  '8': 'number-8', '9': 'number-9', '10': 'number-10', '11': 'number-11',
  // motion and actions
  walk: 'walk', run: 'run', swim: 'swimming', drive: 'steering-wheel', sleep: 'zzz', read: 'book', write: 'pencil', speak: 'microphone', sing: 'microphone-2',
  listen: 'ear', hear: 'ear', pay: 'credit-card', buy: 'shopping-cart', wash: 'wash-machine', pray: 'pray', jump: 'jump-rope',
  // greetings and answers
  yes: 'check', no: 'x',
  // nature
  sun: 'sun', moon: 'moon', star: 'star', rain: 'cloud-rain', cloud: 'cloud', wind: 'wind', snow: 'snowflake', fire: 'flame', tree: 'tree', flower: 'flower',
  leaf: 'leaf', mountain: 'mountain', world: 'world', globe: 'world', volcano: 'volcano', plant: 'plant', rainbow: 'rainbow', lightning: 'bolt', storm: 'tornado',
  // animals
  dog: 'dog', cat: 'cat', horse: 'horse', butterfly: 'butterfly', pig: 'pig', spider: 'spider', bug: 'bug', insect: 'bug', paw: 'paw', feather: 'feather',
  // time
  time: 'clock', clock: 'clock', calendar: 'calendar', week: 'calendar-week', month: 'calendar-month', morning: 'sunrise', evening: 'sunset', night: 'moon-stars', hour: 'clock',
  // things
  money: 'cash', cash: 'cash', coin: 'coin', book: 'book', pen: 'ballpen', pencil: 'pencil', school: 'school', phone: 'device-mobile', letter: 'mail', mail: 'mail',
  backpack: 'backpack', shoe: 'shoe', shirt: 'shirt', umbrella: 'umbrella', glasses: 'eyeglass', picture: 'photo', photo: 'photo', camera: 'camera', video: 'video',
  music: 'music', song: 'music', news: 'news', map: 'map', gift: 'gift', flag: 'flag', bell: 'bell', scissors: 'scissors', hammer: 'hammer', ladder: 'ladder',
  basket: 'basket', balloon: 'balloon', candle: 'candle', clip: 'paperclip', tent: 'tent', trophy: 'trophy', crown: 'crown', diamond: 'diamond',
  // transport and places
  car: 'car', bus: 'bus', train: 'train', boat: 'sailboat', ship: 'ship', bicycle: 'bike', bike: 'bike', road: 'road', bridge: 'building-bridge', airplane: 'plane',
  plane: 'plane', truck: 'truck', tractor: 'tractor', hospital: 'hospital', doctor: 'stethoscope', medicine: 'pill', shop: 'building-store', store: 'building-store',
  market: 'building-store', mosque: 'building-mosque', church: 'building-church', bank: 'building-bank', factory: 'building-factory', city: 'building-skyscraper',
  job: 'briefcase', work: 'briefcase', office: 'briefcase', library: 'building-community', stadium: 'building-stadium', fence: 'fence', anchor: 'anchor',
  // feelings
  happy: 'mood-happy', sad: 'mood-sad', angry: 'mood-angry', sick: 'mood-sick', cry: 'mood-cry', laugh: 'mood-happy', love: 'heart', good: 'thumb-up', bad: 'thumb-down',
  hot: 'flame', cold: 'snowflake',
  // directions and signs
  left: 'arrow-left', right: 'arrow-right', north: 'navigation-north', south: 'navigation-south', east: 'navigation-east', west: 'navigation-west',
  entrance: 'door-enter', entry: 'door-enter', exit: 'door-exit', forbidden: 'forbid', stop: 'hand-stop', men: 'man', women: 'woman', question: 'help-circle',
  idea: 'bulb', warning: 'alert-triangle', search: 'search', language: 'language', alphabet: 'abc'
};

// Plurals and forms that are not just "-s". Keys are forms that may appear in glosses.
const FORMS = { men: 'man', women: 'woman', leaves: 'leaf', children: 'child', people: 'people', mice: 'mouse', feet: 'foot', teeth: 'tooth', wives: 'wife', knives: 'knife' };

// Words that never get a picture, whatever the index says (function words, pronouns, vague words).
const NEVER = new Set(['a', 'an', 'the', 'to', 'of', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'my', 'your', 'our', 'his', 'her', 'its', 'their', 'this', 'that', 'these', 'those',
  'it', 'and', 'or', 'but', 'if', 'in', 'on', 'at', 'by', 'for', 'from', 'with', 'about', 'as', 'into', 'than', 'then', 'there', 'here', 'do', 'does', 'did', 'have', 'has', 'had',
  'i', 'you', 'we', 'he', 'she', 'they', 'me', 'us', 'them', 'him', 'let', 'lets', 'not', 'what', 'who', 'whom', 'whose', 'which', 'when', 'where', 'why', 'how', 'whither',
  'all', 'some', 'any', 'each', 'every', 'can', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'so', 'too', 'very', 'also', 'just', 'only', 'more', 'most',
  'behind', 'front', 'before', 'after', 'near', 'far', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'take', 'make', 'get', 'got', 'go', 'come', 'came', 'give', 'put', 'set',
  'red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'pink', 'purple', 'brown', 'grey', 'gray', 'color', 'colour', 'name', 'thing', 'things', 'something', 'someone', 'anything', 'evidence', 'problem', 'problems', 'soil', 'earth', 'watch', 'watches', 'forgive', 'sorry', 'please', 'hello']);

// Interface icons for Dadi chrome. Key = name used in DadiIcons.ui(name); value = Tabler outline icon name.
const UI = {
  learn: 'book', words: 'list', write: 'keyboard', teach: 'pencil', me: 'user',
  play: 'player-play', pause: 'player-pause', stop: 'player-stop', check: 'check', x: 'x', close: 'x', search: 'search', settings: 'settings',
  chevron: 'chevron-right', 'chevron-right': 'chevron-right', 'chevron-left': 'chevron-left', 'chevron-up': 'chevron-up', 'chevron-down': 'chevron-down',
  back: 'arrow-left', next: 'arrow-right', volume: 'volume', mute: 'volume-off', mic: 'microphone', 'mic-off': 'microphone-off', headphones: 'headphones',
  plus: 'plus', minus: 'minus', trash: 'trash', edit: 'edit', star: 'star', bookmark: 'bookmark', home: 'home', info: 'info-circle', warning: 'alert-triangle',
  error: 'alert-circle', success: 'circle-check', refresh: 'refresh', repeat: 'repeat', download: 'download', upload: 'upload', share: 'share', copy: 'copy', eye: 'eye',
  'eye-off': 'eye-off', lock: 'lock', moon: 'moon', sun: 'sun', offline: 'wifi-off', online: 'wifi', streak: 'flame', trophy: 'trophy', calendar: 'calendar',
  clock: 'clock', bell: 'bell', filter: 'filter', more: 'dots', menu: 'menu-2', undo: 'arrow-back-up', redo: 'arrow-forward-up', help: 'help-circle', heart: 'heart',
  list: 'list', keyboard: 'keyboard', pencil: 'pencil', user: 'user', book: 'book', cards: 'cards', target: 'target', link: 'link', external: 'external-link',
  language: 'language', text: 'text-size', save: 'device-floppy', history: 'history', chart: 'chart-bar', palette: 'palette', camera: 'camera', flag: 'flag',
  send: 'send', message: 'message', users: 'users', sparkle: 'sparkles'
};


// Words removed from the automatic index after review (they matched a loosely related or sensitive icon). The hand-checked HAND list is not affected.
const DENY_WORDS = new Set(('river rock bolt light theme arrow game extension ball find ring report tool stone mind degrees speech points score wave chip shake travel finance community ' +
  'terminal cycle party safety emergency live scan click grab grabbing finger luck checkmate savings pitch branch sweet sail launch startup shaving demolition death dead weapon weapons blade blades military army ' +
  'cigarette smoke smoking alcohol gambling marijuana cannabis hemp drugs cocktail martini champagne asian muslim paris shield markers ocean solar colors colorful spiral swirl magnifier shrink replace ' +
  'keyboard cards pawn fork turner bench chest park neighborhood storage underground arch dish cereal fall accessible disabled blindness blind elderly senior old disgusted grumpy bored quiet blank ' +
  'squint geek nerd infant fantasy cracked latitude longitude parallels meridians report rocking drop drops droplet roulette skull grave gravestone tombstone prison jail prisoner').split(/\s+/));
// Icons that no automatic match may return (adult, violent or distressing subjects, game pieces, and developer jargon).
const DENY_ICONS = new Set(['beer', 'cannabis', 'skull', 'grave', 'smoking', 'smoking-no', 'tank', 'sword', 'swords', 'roulette', 'poker-chip', 'pokeball', 'pacman', 'joker', 'prison',
  'glass-champagne', 'glass-cocktail', 'glass-gin', 'disabled', 'accessible', 'blind', 'old', 'virus', 'pills', 'pill', 'vaccine', 'vaccine-bottle', 'syringe', 'tir', 'tic-tac', 'ufo', 'meeple', 'poo', 'mood-wrrr']);

module.exports = { HAND, FORMS, NEVER, UI, DENY_WORDS, DENY_ICONS };
