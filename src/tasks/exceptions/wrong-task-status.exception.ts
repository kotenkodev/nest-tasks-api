export class WrongTaskStatusException extends Error {
  constructor() {
    super('Invalid status transition');
    this.name = 'WrongTaskStatusException';
  }
}
