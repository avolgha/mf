import { Enviroment } from "./enviroment";
import { createError } from "./error";
import { Lexer } from "./lexer";
import { Parser } from "./parser";

export interface Formula {
  evaluate(): number;
}

export class ValueFormula implements Formula {
  constructor(public result: number) {}

  evaluate(): number {
    return this.result;
  }
}

export class FormulaManager {
  private lexer: Lexer;
  private parser: Parser;

  constructor(public env: Enviroment) {
    this.lexer = new Lexer(env);
    this.parser = new Parser(env);
  }

  parse(input: string) {
    if (input.length === 0) {
      createError(
        "Formula Manager",
        "Cannot create a formula out of nothing",
        "",
        -1
      );
    }
    const infix = this.lexer.tokenize(input);
    return this.parser.parse(input, infix);
  }
}
