/* English prompts only. No Sitainge forms appear anywhere on this page, so speakers are never led. */
(function (root) {
  'use strict';
  const w = (en, ctx) => ({ en, ctx: ctx || '' });
  const BLOCKS = [
    { id: 'people', title: 'People', kind: 'word', items: [
      w('I'), w('me'), w('my'), w('you', 'to a friend'), w('you', 'to an elder'), w('your'),
      w('he / she'), w('we'), w('they'), w('mother'), w('father'), w('brother'), w('sister'),
      w('grandmother'), w('grandfather'), w('boy'), w('girl'), w('man'), w('woman'), w('person'), w('child')] },
    { id: 'home', title: 'Home and things', kind: 'word', items: [
      w('house'), w('door'), w('shop'), w('table'), w('chair'), w('bed'), w('water'), w('rice'),
      w('fish'), w('salt'), w('tea'), w('food'), w('money'), w('book'), w('phone')] },
    { id: 'nature', title: 'Nature and places', kind: 'word', items: [
      w('sun'), w('moon'), w('rain'), w('river'), w('sea'), w('boat'), w('hill'), w('road'),
      w('village'), w('soil / earth'), w('tree')] },
    { id: 'actions', title: 'Actions', kind: 'word', items: [
      w('come'), w('go'), w('eat'), w('drink'), w('sit'), w('sleep'), w('see'), w('say'),
      w('give'), w('take'), w('want'), w('know'), w('work'), w('forgive')] },
    { id: 'qualities', title: 'Qualities, numbers, questions', kind: 'word', items: [
      w('good'), w('bad'), w('big'), w('small'), w('hot'), w('cold'), w('new'), w('old'),
      w('one'), w('two'), w('three'), w('four'), w('five'), w('six'), w('seven'), w('eight'), w('nine'), w('ten'),
      w('what'), w('how'), w('where'), w('who'), w('why'), w('when'), w('how much'),
      w('yes'), w('no'), w('thank you'), w('sorry'), w('please'),
      w('hello', 'to an elder'), w('hello', 'to a friend'), w('goodbye')] },
    { id: 'sentences', title: 'Everyday sentences', kind: 'sentence', items: [
      w('My name is ___.', 'Telling someone your name. Use any name; it need not be yours.'),
      w('Come to the shop.', 'Calling someone'),
      w('How are you?', 'to a friend'),
      w('I am fine.'),
      w('Where are you going?'),
      w('I am going home.'),
      w('What is this?', 'Pointing at something'),
      w('This is a fish.'),
      w('How much is this?', 'At the market'),
      w('That is too expensive.', 'At the market'),
      w("I don't know."),
      w("I don't want it."),
      w('Have you eaten?'),
      w('I have eaten.'),
      w('I went to the market yesterday.'),
      w('I will come tomorrow.'),
      w('He is eating rice now.'),
      w('Where is your house?'),
      w('My house is near the river.'),
      w("This is my brother's book."),
      w('These boys are my friends.'),
      w('Please sit down.'),
      w("Don't go."),
      w('If it rains, I will not come.'),
      w('I am sorry.'),
      w('Thank you very much.'),
      w('Be quiet.', 'Telling a child'),
      w('Tell us about an ordinary morning at home.', 'Write it exactly as you would say it. Several sentences are welcome.')] },
    { id: 'udhr', title: 'Optional: Article 1, Universal Declaration of Human Rights', kind: 'sentence', optional: true, items: [
      w('All human beings are born free and equal in dignity and rights.', 'Optional. Say it in your own way.'),
      w('They are endowed with reason and conscience and should act towards one another in a spirit of brotherhood.', 'Optional. Say it in your own way.')] }
  ];
  const HERITAGE_TYPES = [
    ['proverb', 'Proverb or saying'], ['idiom', 'Idiom'], ['riddle', 'Riddle'], ['rhyme', 'Children\u2019s rhyme'],
    ['song_line', 'Traditional song (oral)'], ['place_name', 'Place name'], ['story', 'Short story'], ['other', 'Something else']];
  const api = { BLOCKS, HERITAGE_TYPES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SitaingeItems = api;
})(typeof self !== 'undefined' ? self : this);
