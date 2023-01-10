export const knownTables = [
  'alinea',
  'amendement',
  'article',
  'article_loi',
  'article_version',
  'intervention',
  'organisme',
  'parlementaire',
  'parlementaire_amendement',
  'parlementaire_organisme',
  'parlementaire_photo',
  'parlementaire_scrutin',
  'parlementaire_texteloi',
  'personnalite',
  'presence',
  'preuve_presence',
  'question_ecrite',
  'scrutin',
  'seance',
  'section',
  'tag',
  'tagging',
  'texteloi',
  'titre_loi',
  'variable_globale',
]

// on garde un seul fichier pour ces tables
const smallTables = [
  'parlementaire_texteloi',
  'tag',
  'section',
  'parlementaire',
  'parlementaire_organisme',
  'scrutin',
  'seance',
  'personnalite',
  'organisme',
  'article_version',
  'article',
  'titre_loi',
  'article_loi',
  'alinea',
]

const bigTables = ['parlementaire_photo']

const splitBy1000Lines = [
  'parlementaire_texteloi',
  'tag',
  'section',
  'parlementaire',
  'parlementaire_organisme',
  'scrutin',
  'seance',
  'personnalite',
  'organisme',
  'article_version',
  'article',
  'titre_loi',
  'article_loi',
  'alinea',
]

// missing in 13 and 14
// Differences:  [ 'parlementaire_scrutin', 'scrutin' ]
