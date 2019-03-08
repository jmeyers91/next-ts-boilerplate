export default function fail(message: string): never {
  throw new Error(message);
}
