export const legislatures = [13, 14, 15, 16]

export function getLegislatureDumpUrl(legislature: number) {
  switch (legislature) {
    case 13:
      return 'https://data.regardscitoyens.org/nosdeputes.fr/nosdeputes.fr_2007_2012_donnees.sql.gz'
    case 14:
      return 'https://data.regardscitoyens.org/nosdeputes.fr/nosdeputes.fr_2012_2017_donnees.sql.gz'
    case 15:
      return 'https://data.regardscitoyens.org/nosdeputes.fr/nosdeputes.fr_2017_2022_donnees.sql.gz'
    case 16:
      return 'https://data.regardscitoyens.org/nosdeputes.fr/nosdeputes.fr_donnees.sql.gz'
    default:
      throw new Error(`Unknown legislature ${legislature}`)
  }
}
