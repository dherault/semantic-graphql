const assignTypeAndId = type => x => Object.assign({ type, id: x.name }, x);

const languages = [
  {
    name: 'English',
    localName: 'English',
    basicWords: [
      'Hello',
      'I love you',
      'The sky is the limit.',
    ],
  },
  {
    name: 'French',
    localName: 'Français',
    basicWords: [
      'Bonjour',
      'Je t\'aime',
      'Et voilà le travail!',
    ],
  },
  {
    name: 'German',
    localName: 'Deutsch',
    basicWords: [
      'Hallo',
      'Ich liebe dich',
      'Ich bin ein berliner.',
    ],
  },
].map(assignTypeAndId('Language'));

const persons = [
  {
    name: 'Gaëtan Barral',
    gender: true,
    worksForCompany: 'Edge Factory',
    motherTongue: 'French',
    nickname: 'Goët',
    luckyNumber: 'pi',
    speaks: [
      'French',
      'English',
      'German',
    ],
  },
  {
    name: 'Gregor MacBurgers',
    gender: true,
    worksForCompany: 'Greasy burgers',
    luckyNumber: true, // should raise ex
  },
  {
    name: 'Ahre Zo',
    gender: false,
    worksForCompany: 'Human Space Agency',
    luckyNumber: 6.626e-34,
  },
  {
    name: 'Heinrich Müller',
    gender: true,
    worksForCompany: 'Four wheels',
    luckyNumber: 'phi',
  },
  {
    name: 'Marie Birkeland',
    gender: false,
    worksForCompany: 'Greasy burgers',
  },
  {
    name: 'Barbara T. Ashby',
    gender: false,
    worksForCompany: 'Greasy burgers',
  },
  {
    name: 'Cai Jen',
    gender: true,
    worksForCompany: 'Four wheels',
  },
  {
    name: 'Chibueze Eberechukwu',
    gender: true,
    worksForCompany: 'Human Space Agency',
  },
  {
    name: 'Aðalbjörg Sigurvaldadóttir',
    gender: false,
    worksForCompany: 'Human Space Agency',
  },
  {
    name: 'Søren Mikaelsen',
    gender: true,
    worksForCompany: 'Edge Factory',
  },
  {
    name: 'Rodrigo Castro Barbosa',
    gender: true,
    worksForCompany: 'Human Space Agency',
  },
  {
    name: 'Oliver Bårdsen',
    gender: true,
    worksForCompany: 'Greasy burgers',
  },
  {
    name: 'Kosisochukwu Obiora',
    gender: true,
    worksForCompany: 'Edge Factory',
  },
  {
    name: 'Zakir Akhtakhanov',
    gender: true,
    worksForCompany: 'Human Space Agency',
  },
  {
    name: 'Александр Сорокин',
    gender: true,
    worksForCompany: 'Greasy burgers',
  },
  {
    name: '尹晉唯',
    gender: false,
    worksForCompany: 'Edge Factory',
  },
  {
    name: 'Frederikke Mikaelsen',
    gender: false,
    worksForCompany: 'Human Space Agency',
  },
  {
    name: 'Гузель Аксакова',
    gender: false,
    worksForCompany: 'Human Space Agency',
  },
  {
    name: 'Adaldrida Brandagamba',
    gender: false,
    worksForCompany: 'Human Space Agency',
  },
  {
    name: 'May Donaldson',
    gender: false,
  },
].map(assignTypeAndId('Person'));

const companies = [
  {
    name: 'Edge Factory',
    foundingYear: 2015,
    hasCEO: 'Gaëtan Barral',
    vat: 'EF0000',
  },
  {
    name: 'Human Space Agency',
    foundingYear: 2215,
    hasCEO: 'Ahre Zo',
    vat: 'HSA000',
  },
  {
    name: 'Greasy burgers',
    foundingYear: 1998,
    hasCEO: 'Gregor MacBurgers',
    vat: 'GB0000',
  },
  {
    name: 'Four wheels',
    foundingYear: 1960,
    hasCEO: 'Heinrich Müller',
    vat: 'FW0000',
  },
].map(assignTypeAndId('Company'));

module.exports = [
  ...languages,
  ...persons,
  ...companies,
];
