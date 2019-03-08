declare module 'next/dist/build/index' {
  export default function build(
    dir: string,
    conf: object | null,
  ): Promise<void>;
}
