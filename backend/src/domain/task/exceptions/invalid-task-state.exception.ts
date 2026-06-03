export class InvalidTaskStateException extends Error {
  constructor(message: string) {
    super(message);
  }
}
