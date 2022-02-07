export declare class Enviroment {
  unary: Token[];
  binary: Token[];
  symbols: Token[];
  constants: Map<string, number>;
  variables: Map<string, Formula>;
  unaryOperators: Map<string, UnaryOperator>;
  binaryOperators: Map<string, BinaryOperator>;
  unaryFunctions: Map<string, UnaryFunction>;
  binaryFunctions: Map<string, BinaryFunction>;
  registerConstant(name: string, value: number): void;
  registerVariable(name: string, formula: Formula): void;
  registerUnaryOperator(
    symbol: string,
    precedence: number,
    operation: UnaryOperation
  ): void;
  registerBinaryOperator(
    symbol: string,
    precedence: number,
    left: boolean,
    operation: BinaryOperation
  ): void;
  registerUnaryFunction(name: string, operation: UnaryOperation): void;
  registerBinaryFunction(name: string, operation: BinaryOperation): void;
  isConstant(identifier: string): boolean;
  isVariable(identifier: string): boolean;
  isUnaryOperator(symbol: string): boolean;
  isBinaryOperator(symbol: string): boolean;
  isUnaryFunction(identifier: string): boolean;
  isBinaryFunction(identifier: string): boolean;
  isFunction(identifier: string): boolean;
  getConstant(identifier: string): number | undefined;
  getVariable(identifier: string): Formula | undefined;
  getUnaryOperator(symbol: string): UnaryOperator | undefined;
  getBinaryOperator(symbol: string): BinaryOperator | undefined;
  getUnaryFunction(symbol: string): UnaryFunction | undefined;
  getBinaryFunction(symbol: string): BinaryFunction | undefined;
  static createDefault(): Enviroment;
}
export declare interface Formula {
  evaluate(): number;
}
export declare class FormulaManager {
  env: Enviroment;
  constructor(env: Enviroment);
  parse(input: string): Formula | undefined;
}
export declare class Lexer {
  env: Enviroment;
  constructor(env: Enviroment);
  tokenize(input: string): Lexeme[];
}
export declare class Parser {
  env: Enviroment;
  constructor(env: Enviroment);
  parse(source: string, input: Lexeme[]): Formula | undefined;
}
