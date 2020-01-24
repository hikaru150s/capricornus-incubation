export class GenericError extends Error {
  public status: number;

  constructor(message: string | Error = 'Generic Failure', status: number = 500) {
    if ((typeof message) === 'string') {
      super(message.toString());
    } else {
      const err = message as Error;
      super(err.message);
      this.name = err.name;
      this.stack = err.stack;
    }
    this.status = status;
  }
}
