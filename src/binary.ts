import { Formula } from "./formula";

export type BinaryOperation = (first: number, second: number) => number;

export class BinaryOperator {
  constructor(
    public symbol: string,
    public precedence: number,
    public left: boolean,
    public operation: BinaryOperation
  ) {}

  create(left: Formula, right: Formula): Formula {
    return new BinaryFormula(this.operation, left, right);
  }
}

export class BinaryFunction {
  constructor(public name: string, public operation: BinaryOperation) {}

  create(left: Formula, right: Formula): Formula {
    return new BinaryFormula(this.operation, left, right);
  }
}

export class BinaryFormula implements Formula {
  constructor(
    public operation: BinaryOperation,
    public left: Formula,
    public right: Formula
  ) {}

  evaluate(): number {
    return this.operation(this.left.evaluate(), this.right.evaluate());
  }
}
