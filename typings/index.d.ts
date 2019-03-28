declare module 'rutracker-api-2' {
  interface Captcha {
    img: string;
    capSid: string;
    code: string;
  }

  class RutrackerApi {
    constructor (cookie: string);

    getCaptcha(): Promise<Captcha>;

    search(query: string, by: string, direction: boolean): Promise<any>;

  }
  export = RutrackerApi;
}
