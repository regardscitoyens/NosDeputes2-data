import lo from 'lodash'

// Rewrite the "adresses" array into something a bit less verbose
// Fix some values to be more consistent
export function rewriteAdresses(
  rawAdresses: RawAdresseFromTricoteuses[] | undefined,
): Adresses {
  const adresses = rawAdresses ?? []
  const emails = readPlainValues(adresses, 'Mèl').map(_ => _.toLowerCase())
  // TODO pour facebook, supprimer les prefixes avant un slash
  // car certains ont renseigné directement facebook.com/toto au lieu de toto
  const facebook = readPlainValues(adresses, 'Facebook')
  const linkedin = readPlainValues(adresses, 'Linkedin')
  const instagram = readPlainValues(adresses, 'Instagram')
  const twitter = removeArobaseIfPresent(readPlainValues(adresses, 'Twitter'))
  const sites_internet = readPlainValues(adresses, 'Site internet')

  const adresses_postales = lo
    .sortBy(
      adresses
        .filter(_ => _.xsiType === 'AdressePostale_Type')
        .map(adresse => {
          // we can narrow the type
          return adresse as RawAdresseFromTricoteuses & {
            xsiType: 'AdressePostale_Type'
          }
        }),
      _ => parseInt(_.poids, 10),
    )
    .map(
      ({ poids, xsiType, intitule, nomRue, complementAdresse, ...rest }) => ({
        ...rest,
        intitule: removeTrailingComma(intitule),
        complementAdresse: removeTrailingComma(complementAdresse),
        nomRue: removeTrailingComma(nomRue),
      }),
    )

  return {
    emails,
    facebook,
    instagram,
    linkedin,
    twitter,
    sites_internet,
    adresses_postales,
  }
}

function readPlainValues(
  adresses: RawAdresseFromTricoteuses[],
  typeLibelle:
    | 'Facebook'
    | 'Instagram'
    | 'Linkedin'
    | 'Mèl'
    | 'Twitter'
    | 'Site internet',
): string[] {
  const values = adresses
    .filter(_ => _.typeLibelle == typeLibelle)
    .map(adresse => {
      // we can narrow the type
      const adresse2 = adresse as RawAdresseFromTricoteuses & {
        typeLibelle: typeof typeLibelle
      }
      return adresse2.valElec
    })
    .filter(_ => _.length > 0)
  return lo.uniq(values).sort()
}

function removeArobaseIfPresent(values: string[]): string[] {
  return values.map(_ => {
    if (_[0] === '@') {
      return _.substring(1)
    }
    return _
  })
}

function removeTrailingComma(s: string | undefined): string | null {
  if (s?.endsWith(',')) {
    return s.substring(0, s.length - 1)
  }
  return s ?? null
}

export type Adresses = {
  emails: string[]
  facebook: string[]
  linkedin: string[]
  instagram: string[]
  twitter: string[]
  sites_internet: string[]
  adresses_postales: {
    uid: string
    typeLibelle:
      | 'Adresse officielle'
      | 'Adresse publiée de circonscription'
      | 'Adresse publiée pour Paris ou sa région'
    ville?: string
    nomRue?: string | null
    numeroRue?: string
    codePostal?: string
    intitule?: string | null
    complementAdresse?: string | null
  }[]
}

type RawAdresseFromTricoteuses = (
  | {
      xsiType: 'AdresseMail_Type'
      typeLibelle: 'Mèl'
      valElec: string
    }
  | {
      xsiType: 'AdressePostale_Type'
      typeLibelle:
        | 'Adresse officielle'
        | 'Adresse publiée de circonscription'
        | 'Adresse publiée pour Paris ou sa région'
      ville?: string
      nomRue?: string
      numeroRue?: string
      codePostal?: string
      intitule?: string
      complementAdresse?: string
      poids: string // les poids les plus petits doivent apparaitre en premier
    }
  | {
      xsiType: 'AdresseSiteWeb_Type'
      typeLibelle:
        | 'Facebook'
        | 'Linkedin'
        | 'Instagram'
        | 'Twitter'
        | 'Site internet'
        | 'Url sénateur'
      valElec: string
    }
  | {
      xsiType: 'AdresseSiteWeb_Type'
      typeLibelle: 'Linkedin'
      valElec: string
    }
  | {
      xsiType: 'AdresseTelephonique_Type'
      typeLibelle: 'Téléphone' | 'Télécopie' | 'Contact presse'
      adresseDeRattachement?: string
      valElec: string
    }
) & {
  uid: string
}
