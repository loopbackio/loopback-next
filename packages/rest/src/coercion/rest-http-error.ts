import * as HttpErrors from 'http-errors';
export namespace RestHttpErrors {
  export function invalidData<T>(data: T, name: string) {
    const msg = `Invalid data ${JSON.stringify(data)} for parameter ${name}!`;
    return new HttpErrors.BadRequest(msg);
  }
  export function missingRequired(name: string): HttpErrors.HttpError {
    const msg = `Required parameter ${name} is missing!`;
    return new HttpErrors.BadRequest(msg);
  }
  export function invalidParamLocation(location: string): HttpErrors.HttpError {
    const msg = `Parameters with "in: ${location}" are not supported yet.`;
    return new HttpErrors.NotImplemented(msg);
  }
}
