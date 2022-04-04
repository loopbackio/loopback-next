import {GeminiServer} from '../gemini.server';

describe('GeminiServer', () => {
  let geminiServer: GeminiServer;
  beforeEach(givenGeminiServer);
  afterEach(async () => {
    await geminiServer.stop();
  });

  describe('Valid requests', () => {
    describe('Valid non-authenticated requests', () => {
      it('handles non-authenticated TLS v1.2 request', () => {});

      it('handles non-authenticated TLS v1.3 request', () => {});
    });

    describe('Valid authenticated requests', () => {
      it('handles authenticated TLS v1.2 request', () => {});

      it('handles authenticated TLS v1.3 request', () => {});
    });

    describe('Valid request URLs', () => {
      it('handles relative URL request', () => {});

      it('handles absolute URL request', () => {});
    });
  });

  describe('Invalid requests', () => {
    it('rejects TLS v1.1 request', () => {});

    it('rejects TLS v1 request', () => {});

    it('rejects request URLs longer than 1024 bytes', () => {});

    it('rejects request URLs without a scheme', () => {});

    it('rejects request URLs with an invalid scheme', () => {});

    it('closes incomplete requests', () => {});
  });

  async function givenGeminiServer(): Promise<void> {
    geminiServer = new GeminiServer();
    await geminiServer.start();
  }

  async function givenGeminiRequest({url: string, clientCertificate: string}) {}
});
