export class MessageFormatterService {
  format(message: string) {
    return `[${new Date().toISOString()}] ${message}`;
  }
}
