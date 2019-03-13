import Db from './Db';
import { validateActionResults } from '../config';

/**
 * Actions are thin wrappers around functions with support for run-time input and result validation.
 * The generic types Props and Result correspond to the function's expected props and result types.
 */
class Action<Props = void, Result = void> {
  private readonly validatePropsFn: Validate<Props>;
  private readonly validateResultFn?: Validate<Result>;
  private readonly fn: RunFn<Props, Result>;

  /**
   * Create a new action.
   *
   * @param fn - The body of the action.
   */
  constructor(
    fn: RunFn<Props, Result>,
    validateProps: Validate<Props>,
    validateResult?: Validate<Result>,
  ) {
    this.fn = fn;
    this.validatePropsFn = validateProps;
    this.validateResultFn = validateResult;
  }

  /**
   * Run this action's prop validation function against an unknown value.
   * Resolves the value casted to the actions prop type if successful.
   * Throws otherwise.
   *
   * @param props - The props value to validate.
   * @returns The passed props value wrapped in a promise. Throws if validation fails.
   */
  public async runPropValidation(props: unknown): Promise<Props> {
    const { validatePropsFn } = this;
    return validatePropsFn(props);
  }

  /**
   * Run this action's result validation function against an unknown value.
   * Resolves the value casted to the actions result type if successful.
   * Throws otherwise.
   *
   * @param result - The result value to validate.
   * @returns The passed result value wrapped in a promise. Throws if validation fails.
   */
  public async runResultValidation(result: unknown): Promise<Result> {
    const { validateResultFn } = this;
    if (validateActionResults && typeof validateResultFn === 'function') {
      return validateResultFn(result);
    } else {
      return result as Result;
    }
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
