import {StatusCodeGroup} from './types';

export function getStatusCodeGroup(statusCode: number): string {
  if (!isValidStatusCode(statusCode)) throw new Error();
  else {
    return StatusCodeGroup[Math.trunc(statusCode / 10)];
  }
}

export function isValidStatusCode(statusCode: number): boolean {
  return statusCode >= 10 && statusCode <= 69;
}

export interface IsValidUrlConfig {
  enforcePort?: boolean | number;
}

export const IS_VALID_URL_DEFAULT_CONFIG: Required<IsValidUrlConfig> = {
  enforcePort: false,
};

export function isValidUrl(
  urlStr: string,
  options: IsValidUrlConfig = IS_VALID_URL_DEFAULT_CONFIG,
) {
  if (urlStr.length > 1024) throw new Error();
  const url = new URL(urlStr);
  if (url.protocol !== 'gemini') throw new Error();
  if (options.enforcePort) {
    const expectedPort =
      typeof options.enforcePort === 'number' ? options.enforcePort : 1965;
    if (url.port !== expectedPort.toString()) throw new Error();
  }
}
