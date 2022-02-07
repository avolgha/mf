import { Formula } from "./formula";

export type UnaryOperation = (first: number) => number;

export class UnaryOperator {
  constructor(
    public symbol: string,
    public precedence: number,
    public operation: UnaryOperation
  ) {}

  create(argument: Formula): Formula {
    return new UnaryFormula(this.operation, argument);
  }
}

export class UnaryFunction {
  constructor(public name: string, public operation: UnaryOperation) {}

  create(argument: Formula): Formula {
    return new UnaryFormula(this.operation, argument);
  }
}

export class UnaryFormula implements Formula {
  constructor(public operation: UnaryOperation, public argument: Formula) {}

  evaluate(): number {
    return this.operation(this.argument.evaluate());
  }
}
