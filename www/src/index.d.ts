export interface DeputesDataRoot {
  head: Head;
  results: Results;
}

export interface Head {
  vars: string[];
}

export interface Results {
  bindings: DeputeData[];
}

export interface DeputeData {
  item: Item;
  itemLabel: ItemLabel;
  groupeLabel?: GroupeLabel;
  id_an: IdAn;
  id_nosdeputes?: IdNosdeputes;
  id_hatvp?: IdHatvp;
  wikipedia: Wikipedia;
  image?: Image;
  lieuNaissance: LieuNaissance;
  dateNaissance: DateNaissance;
  debutMandat: DebutMandat;
  district: District;
  districtLabel: DistrictLabel;
  twitters: Twitters;
  youtubes: Youtubes;
  urls: Urls;
  remplaceLabel?: RemplaceLabel;
  remplaceParLabel?: RemplaceParLabel;
}

export interface Item {
  type: string;
  value: string;
}

export interface ItemLabel {
  "xml:lang": string;
  type: string;
  value: string;
}

export interface GroupeLabel {
  "xml:lang": string;
  type: string;
  value: string;
}

export interface IdAn {
  type: string;
  value: string;
}

export interface IdNosdeputes {
  type: string;
  value: string;
}

export interface IdHatvp {
  type: string;
  value: string;
}

export interface Wikipedia {
  type: string;
  value: string;
}

export interface Image {
  type: string;
  value: string;
}

export interface LieuNaissance {
  type: string;
  value: string;
}

export interface DateNaissance {
  datatype: string;
  type: string;
  value: string;
}

export interface DebutMandat {
  datatype: string;
  type: string;
  value: string;
}

export interface District {
  type: string;
  value: string;
}

export interface DistrictLabel {
  "xml:lang": string;
  type: string;
  value: string;
}

export interface Twitters {
  type: string;
  value: string;
}

export interface Youtubes {
  type: string;
  value: string;
}

export interface Urls {
  type: string;
  value: string;
}

export interface RemplaceLabel {
  "xml:lang": string;
  type: string;
  value: string;
}

export interface RemplaceParLabel {
  "xml:lang": string;
  type: string;
  value: string;
}
