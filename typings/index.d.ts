export enum Status {
  APPROVED = 'approved',
  DOUBTFULLY = 'doubtfully',
  NOT_APPROVED = 'not-approved',
  TEMPORARY = 'temporary',
}

export enum SortType {
  DATE = 'date',
  DOWNLOADS = 'downloads',
  LEECHS = 'leechs',
  SEEDS = 'seeds',
  SIZE = 'size',
  TITLE = 'title',
}

declare type Cookie = 'string';

export interface Captcha {
  img: string;
  capSid: string;
  code: string;
}

export interface Category {
  id: string;
  name: string;
  subCategories?: Category[],
}

export interface Distribution {
  id: string;
  status: Status,
  title: string,
  author: string
  category: Category;
  size: number,
  seeds: number,
  leechs: number,
  downloads: number,
  uploadDate: Date,
  url: string
}

export interface FileInfo {
  img: string,
  seed: string,
  leech: string,
  hash: string,
  body: string,
  categories: Category[]
}

export interface UserInfo {
  username: string,
  img: string,
  role: string,
  country: string,
  gender: string,
  experience: string,
  createDate: Date,
}

export interface Size {
  measure: string,
  value: number,
}

export interface Stat {
  users: number,
  torrents: number,
  live: number,
  size: Size,
  peer: number,
  seed: number,
  leech: number,
}

export default class RutrackerApi {

  constructor(cookie?: Cookie);

  getCaptcha(): Promise<Captcha>;

  setCookie(cookie: Cookie): Promise<undefined>;

  login(username: string, password: string, answer?: string): Promise<Cookie>;

  fetchPagination(count: number, id: string): Promise<Distribution[]>

  search(query: string, by: string, direction: boolean): Promise<Distribution[]>;

  download(id: string): Promise<ReadableStream>;

  getFullFileInfo(id: string): Promise<FileInfo>;

  getUserInfo(id: string): Promise<UserInfo>;

  getStats(): Promise<Stat>
}
