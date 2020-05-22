/**
 * Base class for pets
 */
export declare class Pet {
    readonly name: string;
    readonly kind: string;
    /**
     * Create a pet
     * @param name - Name of the pet
     * @param kind - Kind of the pet
     */
    constructor(name: string, kind: string);
    /**
     * Greet the pet
     * @param msg - Message for the greeting
     * @returns The description
     */
    greet(msg: string): string;
}
