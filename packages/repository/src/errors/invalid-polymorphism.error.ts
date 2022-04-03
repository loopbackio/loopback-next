export class InvalidPolymorphismError<Props extends object = {}> extends Error {
  code: string;

  constructor(
    typeName: string,
    discriminator?: string,
    extraProperties?: Props,
  ) {
    const message = discriminator
      ? `Invalid class name ${typeName} by discriminator ${discriminator}. Please check polymorphic types and the discriminator.`
      : `Invalid class name ${typeName}. Please check polymorphic types and the discriminator.`;
    super(message);

    Error.captureStackTrace(this, this.constructor);

    this.code = 'INVALID_POLYMORPHISM';

    Object.assign(this, extraProperties);
  }
}

export function isInvalidPolymorphismError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  e: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): e is InvalidPolymorphismError<any> {
  return e instanceof InvalidPolymorphismError;
}
