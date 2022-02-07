import { BinaryFunction, BinaryOperation, BinaryOperator } from "./binary";
import { Formula } from "./formula";
import { Token, LEFT_PAREN, RIGHT_PAREN, COMMA, TokenType } from "./token";
import { UnaryFunction, UnaryOperation, UnaryOperator } from "./unary";

export class Enviroment {
  unary: Token[];
  binary: Token[];
  symbols: Token[];

  constants: Map<string, number>;
  variables: Map<string, Formula>;
  unaryOperators: Map<string, UnaryOperator>;
  binaryOperators: Map<string, BinaryOperator>;
  unaryFunctions: Map<string, UnaryFunction>;
  binaryFunctions: Map<string, BinaryFunction>;

  private constructor() {
    this.unary = [];
    this.binary = [];
    this.symbols = [LEFT_PAREN, RIGHT_PAREN, COMMA];

    this.constants = new Map();
    this.variables = new Map();
    this.unaryOperators = new Map();
    this.binaryOperators = new Map();
    this.unaryFunctions = new Map();
    this.binaryFunctions = new Map();
  }

  registerConstant(name: string, value: number) {
    this.constants.set(name, value);
  }

  registerVariable(name: string, formula: Formula) {
    this.variables.set(name, formula);
  }

  registerUnaryOperator(
    symbol: string,
    precedence: number,
    operation: UnaryOperation
  ) {
    this.unaryOperators.set(
      symbol,
      new UnaryOperator(symbol, precedence, operation)
    );
    this.registerOperatorToken(TokenType.UNARY_OPERATOR, symbol, this.unary);
  }

  registerBinaryOperator(
    symbol: string,
    precedence: number,
    left: boolean,
    operation: BinaryOperation
  ) {
    this.binaryOperators.set(
      symbol,
      new BinaryOperator(symbol, precedence, left, operation)
    );
    this.registerOperatorToken(TokenType.BINARY_OPERATOR, symbol, this.binary);
  }

  registerUnaryFunction(name: string, operation: UnaryOperation) {
    this.unaryFunctions.set(name, new UnaryFunction(name, operation));
  }

  registerBinaryFunction(name: string, operation: BinaryOperation) {
    this.binaryFunctions.set(name, new BinaryFunction(name, operation));
  }

  isConstant(identifier: string) {
    return this.constants.has(identifier);
  }

  isVariable(identifier: string) {
    return this.variables.has(identifier);
  }

  isUnaryOperator(symbol: string) {
    return this.unaryOperators.has(symbol);
  }

  isBinaryOperator(symbol: string) {
    return this.binaryOperators.has(symbol);
  }

  isUnaryFunction(identifier: string) {
    return this.unaryFunctions.has(identifier);
  }

  isBinaryFunction(identifier: string) {
    return this.binaryFunctions.has(identifier);
  }

  isFunction(identifier: string) {
    return (
      this.isUnaryFunction(identifier) || this.isBinaryFunction(identifier)
    );
  }

  getConstant(identifier: string) {
    return this.constants.get(identifier);
  }

  getVariable(identifier: string) {
    return this.variables.get(identifier);
  }

  getUnaryOperator(symbol: string) {
    return this.unaryOperators.get(symbol);
  }

  getBinaryOperator(symbol: string) {
    return this.binaryOperators.get(symbol);
  }

  getUnaryFunction(symbol: string) {
    return this.unaryFunctions.get(symbol);
  }

  getBinaryFunction(symbol: string) {
    return this.binaryFunctions.get(symbol);
  }

  private registerOperatorToken(
    type: TokenType,
    operator: string,
    operators: Token[]
  ) {
    let i: number;
    for (i = 0; i < operators.length; i++) {
      if (operators[i].symbol!.length < operator.length) {
        break;
      }
    }

    const escaped = operator.replace("", "\\") + "\\"; // Java handles it not like NodeJS so we have to add this here
    const trimmed = escaped.substring(0, escaped.length - 1);
    const token = new Token(type, new RegExp(trimmed), operator);

    operators.splice(i, 0, token);
  }

  static createDefault() {
    const env = new Enviroment();

    env.registerConstant("pi", Math.PI);
    env.registerConstant("e", Math.E);

    env.registerUnaryOperator("+", 4, (value) => +value);
    env.registerUnaryOperator("-", 4, (value) => -value);

    env.registerBinaryOperator("+", 2, true, (a, b) => a + b);
    env.registerBinaryOperator("-", 2, true, (a, b) => a - b);
    env.registerBinaryOperator("*", 3, true, (a, b) => a * b);
    env.registerBinaryOperator("/", 3, true, (a, b) => a / b);
    env.registerBinaryOperator("%", 3, true, (a, b) => a % b);
    env.registerBinaryOperator("^", 4, false, (a, b) => a ** b);

    env.registerUnaryFunction("sqrt", Math.sqrt);
    env.registerUnaryFunction("abs", Math.abs);

    env.registerUnaryFunction("ceil", Math.ceil);
    env.registerUnaryFunction("floor", Math.floor);
    env.registerUnaryFunction("round", Math.round);

    env.registerUnaryFunction("sin", Math.sin);
    env.registerUnaryFunction("cos", Math.cos);
    env.registerUnaryFunction("tan", Math.tan);

    env.registerBinaryFunction("min", Math.min);
    env.registerBinaryFunction("max", Math.max);

    return env;
  }
}
