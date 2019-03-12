import Db from './Db';

type RunFn<P, R> = (db: Db, props: P) => R | Promise<R>;
type Check<T> = ((value: unknown) => T) | ((value: unknown) => Promise<T>);

class Action<P, R> {
  public readonly fn: RunFn<P, R>;
  public readonly validatePropsFns: Array<Check<P>> = [];
  public readonly validateResultFns: Array<Check<R>> = [];

  constructor(fn: RunFn<P, R>) {
    this.fn = fn;
  }

  public validate(validateProps: Check<P>, validateResult?: Check<R>): this {
    this.validatePropsFns.push(validateProps);
    if (validateResult) {
      this.validateResultFns.push(validateResult);
    }
    return this;
  }

  public validateProps(...args: Array<Check<P>>): this {
    this.validatePropsFns.push(...args);
    return this;
  }

  public validateResult(...args: Array<Check<P>>): this {
    this.validatePropsFns.push(...args);
    return this;
  }

  public async runPropValidation(props: unknown): Promise<P> {
    let validatedProps: P = props as P;
    for (const validateProps of this.validatePropsFns) {
      validatedProps = await validateProps(validatedProps);
    }
    return validatedProps;
  }

  public async runResultValidation(result: unknown): Promise<R> {
    let validatedResult: R = result as R;
    for (const validateResult of this.validateResultFns) {
      validatedResult = await validateResult(validatedResult);
    }
    return validatedResult;
  }

  // Validate props, run action, validate result (if enabled)
  async run(db: Db, props: unknown): Promise<R> {
    return this.runResultValidation(
      await this.fn(db, await this.runPropValidation(props)),
    );
  }
}

export default Action;
