export interface GeminiClientConfig {
  clientCertificate?: string;
}

export class GeminiClient {
  constructor(private _options: GeminiClientConfig = {}) {}

  set clientCertificate(cert: string) {
    this._options.clientCertificate = cert;
  }

  request(url: string) {}
}
