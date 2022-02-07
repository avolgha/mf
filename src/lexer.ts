import { Enviroment } from "./enviroment";
import * as err from "./error";
import {
  IDENTIFIER,
  LEFT_PAREN,
  NUMBER,
  Token,
  TokenType,
  VARIABLE,
} from "./token";

function isLetter(str: string) {
  return str.length === 1 && str.match(/[a-z]/i);
}

function isNumeric(str: string) {
  //@ts-ignore
  return !isNaN(str);
}

export class Lexeme {
  constructor(public token: Token, public value: string, public pos: number) {}

  toString() {
    return `${this.token.type} '${this.value}'`;
  }
}

export class Lexer {
  private result?: Lexeme[];
  private input?: string;
  private pos?: number;

  constructor(public env: Enviroment) {}

  tokenize(input: string): Lexeme[] {
    this.result = [];
    this.input = input;
    this.pos = 0;

    this._tokenize();

    const result = this.result;
    this.result = undefined;
    this.input = undefined;
    this.pos = -1;

    return result;
  }

  private _tokenize() {
    while (this.pos! < this.input!.length) {
      this._skipWhitespace();
      this._nextToken();
    }
  }

  private _skipWhitespace() {
    for (let i = this.pos!; i < this.input!.length; i++) {
      const current = this.input!.charAt(i);
      if (/\s/g.test(current)) {
        continue;
      }
      this.pos = i;
      return;
    }
  }

  private _nextToken() {
    if (this._nextNumber()) {
      return;
    }
    if (this._nextIdentifier()) {
      return;
    }
    if (this._nextVariable()) {
      return;
    }
    if (this._nextOperator()) {
      return;
    }
    if (this._nextSymbol()) {
      return;
    }
    console.log(this.input!.substring(this.pos!));

    err.lexerError(
      `Unexpected token in column ${this.pos! + 1}.`,
      this.input!,
      this.pos!
    );
  }

  private _nextNumber() {
    const first = this.input!.charAt(this.pos!);
    //@ts-ignore
    if (!isNumeric(first)) {
      return false;
    }

    const chunk = this.input!.substring(this.pos!);
    const end = NUMBER.match(chunk);
    if (end < 0) {
      err.lexerError(
        `Invalid number in column ${this.pos! + 1}.`,
        this.input!,
        this.pos!
      );
    }

    const lexeme = this.input!.substring(this.pos!, this.pos! + end);
    this.result!.push(new Lexeme(NUMBER, lexeme, this.pos!));
    this.pos! += end;
    return true;
  }

  private _nextIdentifier() {
    const first = this.input!.charAt(this.pos!);
    if (!isLetter(first)) {
      return false;
    }

    const chunk = this.input!.substring(this.pos!);
    const end = IDENTIFIER.match(chunk);
    if (end < 0) {
      err.lexerError(
        `Invalid identifier in column ${this.pos! + 1}.`,
        this.input!,
        this.pos!
      );
    }

    if (this.pos! + end < this.input!.length) {
      if (this.input!.charAt(this.pos! + end) == ">") {
        err.lexerError(
          `Unmatched right bracket in column ${this.pos! + 1}.`,
          this.input!,
          this.pos!
        );
      }
    }

    const identifier = this.input!.substring(this.pos!, this.pos! + end);
    if (!this.env.isConstant(identifier) && !this.env.isFunction(identifier)) {
      err.unknownTokenError2("identifier", identifier, this.input!, this.pos!);
    }

    this.result!.push(new Lexeme(IDENTIFIER, identifier, this.pos!));
    this.pos! += end;
    return true;
  }

  private _nextVariable() {
    const first = this.input!.charAt(this.pos!);
    if (first === ">") {
      err.lexerError(
        `Unmatched right bracket in column ${this.pos! + 1}.`,
        this.input!,
        this.pos!
      );
    }
    if (first !== "<") {
      return false;
    }

    const chunk = this.input!.substring(this.pos!);
    const end = VARIABLE.match(chunk);
    if (end < 0) {
      err.lexerError(
        `Invalid variable in column ${this.pos! + 1}.`,
        this.input!,
        this.pos!
      );
    }
    if (end >= chunk.length || chunk.charAt(end) !== ">") {
      err.lexerError(
        `Unmatched left bracket in column ${this.pos! + 1}.`,
        this.input!,
        this.pos!
      );
    }

    const identifier = this.input!.substring(this.pos!, this.pos! + end);
    if (!this.env.isVariable(identifier)) {
      err.unknownTokenError2(
        "variable",
        `<${identifier}>`,
        this.input!,
        this.pos!
      );
    }

    this.result!.push(new Lexeme(VARIABLE, identifier, this.pos!));
    this.pos! += end + 1;
    return true;
  }

  private _nextOperator() {
    if (this._isUnaryTokenExpected()) {
      return this._nextUnaryOperator();
    } else {
      return this._nextBinaryOperator();
    }
  }

  private _nextUnaryOperator() {
    return this._nextToken2(this.env.unary);
  }

  private _nextBinaryOperator() {
    return this._nextToken2(this.env.binary);
  }

  private _nextSymbol() {
    return this._nextToken2(this.env.symbols);
  }

  private _nextToken2(tokens: Token[]) {
    const chunk = this.input!.substring(this.pos!);
    for (const token of tokens) {
      const end = token.match(chunk);
      if (end < 0) {
        continue;
      }

      const symbol = this.input!.substring(this.pos!, this.pos! + end);
      this.result!.push(new Lexeme(token, symbol, this.pos!));
      this.pos! += end;
      return true;
    }
    return false;
  }

  private _isUnaryTokenExpected() {
    if (this.result!.length === 0) {
      return true;
    }

    const previous = this.result![this.result!.length - 1];

    switch (previous.token.type) {
      case TokenType.LEFT_PAREN:
      case TokenType.UNARY_OPERATOR:
      case TokenType.BINARY_OPERATOR:
      case TokenType.COMMA: {
        return true;
      }
      case TokenType.NUMBER:
      case TokenType.IDENTIFIER:
      case TokenType.VARIABLE:
      case TokenType.RIGHT_PAREN: {
        return false;
      }
    }

    err.unknownTokenError("symbol", previous, this.input!);
  }
}
