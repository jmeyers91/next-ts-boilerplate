import Db from './Db';

/**
 * Actions are thin wrappers around functions with support for run-time input and result validation.
 * The generic types Props and Result correspond to the function's expected props and result types.
 */
class Action<Props, Result> {
  public readonly validatePropsFns: Array<Validate<Props>> = [];
  public readonly validateResultFns: Array<Validate<Result>> = [];
  private readonly fn: RunFn<Props, Result>;

  /**
   * Create a new action.
   *
   * @param fn - The body of the action.
   */
  constructor(fn: RunFn<Props, Result>) {
    this.fn = fn;
  }

  /**
   * Add a prop validation function and an optional result validation function to
   * this action.
   *
   * @params validateProps - Optional prop validation function.
   * @params validateResult - Optional result validation function.
   * @returns this
   */
  public validate(
    validateProps: Validate<Props> | null | undefined,
    validateResult?: Validate<Result> | null,
  ): this {
    if (validateProps) {
      this.validatePropsFns.push(validateProps);
    }
    if (validateResult) {
      this.validateResultFns.push(validateResult);
    }
    return this;
  }

  /**
   * Run this action's prop validation functions against an unknown value.
   * Resolves the value casted to the actions prop type if successful.
   * Throws otherwise.
   *
   * @param props - The props value to validate.
   * @returns The passed props value wrapped in a promise. Throws if validation fails.
   */
  public async runPropValidation(props: unknown): Promise<Props> {
    let validatedProps = props as Props;
    for (const validateProps of this.validatePropsFns) {
      validatedProps = await validateProps(validatedProps);
    }
    return validatedProps;
  }

  /**
   * Run this action's result validation functions against an unknown value.
   * Resolves the value casted to the actions result type if successful.
   * Throws otherwise.
   *
   * @param result - The result value to validate.
   * @returns The passed result value wrapped in a promise. Throws if validation fails.
   */
  public async runResultValidation(result: unknown): Promise<Result> {
    let validatedResult: Result = result as Result;
    for (const validateResult of this.validateResultFns) {
      validatedResult = await validateResult(validatedResult);
    }
    return validatedResult;
  }

  /**
   * Validate the props, runs the action, and validates and returns the result as a promise.
   *
   * @param db - The db instance to run the action against.
   * @param props - The unvalidated input to the action.
   * @returns A promise that resolves to the result of the action.
   */
  async run(db: Db, props: unknown): Promise<Result> {
    return this.runResultValidation(
      await this.fn(db, await this.runPropValidation(props)),
    );
  }
}

// Get an action run function type from the Props and Result types.
type RunFn<Props, Result> = (db: Db, props: Props) => Result | Promise<Result>;

// Get a validate function type for a type
type Validate<T> = ((value: unknown) => T) | ((value: unknown) => Promise<T>);

export default Action;
