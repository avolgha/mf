import { MiniDeque, create as makeDeque } from "./deque";
import { Enviroment } from "./enviroment";
import * as err from "./error";
import { Formula, ValueFormula } from "./formula";
import { Lexeme } from "./lexer";
import { TokenType } from "./token";

export class Parser {
  private output?: MiniDeque<Formula>;
  private stack?: MiniDeque<Lexeme>;
  private args?: MiniDeque<number>;
  private source?: string;
  private input?: Lexeme[];

  constructor(public env: Enviroment) {}

  parse(source: string, input: Lexeme[]) {
    this.output = makeDeque();
    this.stack = makeDeque();
    this.args = makeDeque();
    this.source = source;
    this.input = input;

    const result = this._parse();
    this.output = undefined;
    this.stack = undefined;
    this.args = undefined;
    this.source = undefined;
    this.input = undefined;

    return result;
  }

  private _parse() {
    for (const lexeme of this.input!) {
      switch (lexeme.token.type) {
        case TokenType.NUMBER: {
          this._number(lexeme);
          break;
        }
        case TokenType.IDENTIFIER: {
          this._identifier(lexeme);
          break;
        }
        case TokenType.VARIABLE: {
          this._variable(lexeme);
          break;
        }
        case TokenType.UNARY_OPERATOR: {
          this._unary(lexeme);
          break;
        }
        case TokenType.BINARY_OPERATOR: {
          this._binary(lexeme);
          break;
        }
        case TokenType.LEFT_PAREN: {
          this._left(lexeme);
          break;
        }
        case TokenType.RIGHT_PAREN: {
          this._right(lexeme);
          break;
        }
        case TokenType.COMMA: {
          this._comma(lexeme);
          break;
        }
        default: {
          err.unexpectedTokenError(lexeme, this.source!);
        }
      }
    }

    while (this.stack!.size() !== 0) {
      const top = this.stack!.peek();
      if (this._popIfOperator(top)) {
        continue;
      }
      if (top.token.type === TokenType.LEFT_PAREN) {
        err.unmatchedParenthesisError(top, this.source!);
      }
      err.unexpectedTokenError(top, this.source!);
    }

    if (this.output!.size() != 1) {
      throw new Error(`"WHAT THE FUCK DID I DO WRONG", Arnold Schwarzenegger`);
    }

    return this.output!.pop();
  }

  private _number(lexeme: Lexeme) {
    const { value } = lexeme;
    this.output!.push(new ValueFormula(parseFloat(value)));
  }

  private _identifier(lexeme: Lexeme) {
    const { value: identifier } = lexeme;

    if (this.env.isConstant(identifier)) {
      const value = this.env.getConstant(identifier)!;
      this.output!.push(new ValueFormula(value));
      return;
    }

    if (this.env.isFunction(identifier)) {
      this.stack!.push(lexeme);
      this.args!.push(1);
      return;
    }

    err.unknownTokenError("identifier", lexeme, this.source!);
  }

  private _variable(lexeme: Lexeme) {
    const { value: identifier } = lexeme;

    if (this.env.isVariable(identifier)) {
      this.output!.push(this.env.getVariable(identifier)!);
      return;
    }

    err.unknownTokenError("variable", lexeme, this.source!);
  }

  private _unary(lexeme: Lexeme) {
    const { value: symbol } = lexeme;

    if (!this.env.isUnaryOperator(symbol)) {
      err.unknownTokenError("unary operator", lexeme, this.source!);
    }

    this.stack!.push(lexeme);
  }

  private _binary(lexeme: Lexeme) {
    const { value: symbol } = lexeme;

    if (!this.env.isBinaryOperator(symbol)) {
      err.unknownTokenError("binary operator", lexeme, this.source!);
    }

    const current = this.env.getBinaryOperator(symbol)!;

    while (this.stack!.size() !== 0) {
      const peek = this.stack!.peek();
      const { value: top } = peek;

      if (peek.token.type === TokenType.UNARY_OPERATOR) {
        if (!this.env.isUnaryOperator(top)) {
          err.unknownTokenError("unary operator", peek, this.source!);
        }

        const candidate = this.env.getUnaryOperator(top)!;
        if (candidate.precedence > current.precedence) {
          this._popIfOperator(peek);
          continue;
        }
        break;
      }

      if (peek.token.type === TokenType.BINARY_OPERATOR) {
        if (!this.env.isBinaryOperator(top)) {
          err.unknownTokenError("binary operator", peek, this.source!);
        }

        const candidate = this.env.getBinaryOperator(top)!;
        if (candidate.precedence > current.precedence) {
          this._popIfOperator(peek);
          continue;
        }
        if (candidate.precedence === current.precedence && current.left) {
          this._popIfOperator(peek);
          continue;
        }
        break;
      }

      if (
        peek.token.type === TokenType.LEFT_PAREN ||
        peek.token.type === TokenType.RIGHT_PAREN
      ) {
        break;
      }

      err.unexpectedTokenError(peek, this.source!);
    }

    this.stack!.push(lexeme);
  }

  private _left(lexeme: Lexeme) {
    this.stack!.push(lexeme);
  }

  private _right(lexeme: Lexeme) {
    if (this.stack!.size() === 0) {
      err.unmatchedParenthesisError(lexeme, this.source!);
    }

    while (this.stack!.size() !== 0) {
      const peek = this.stack!.peek();

      if (this._popIfOperator(peek)) {
        continue;
      }

      if (peek.token.type === TokenType.LEFT_PAREN) {
        this.stack!.pop();

        if (this.stack!.size() !== 0) {
          this._popIfFunction(this.stack!.peek());
        }

        break;
      }

      err.unexpectedTokenError(peek, this.source!);
    }
  }

  private _comma(lexeme: Lexeme) {
    while (this.stack!.size() !== 0) {
      const top = this.stack!.peek();
      const { type } = top.token;

      if (this._popIfOperator(top)) {
        continue;
      }

      if (type === TokenType.LEFT_PAREN) {
        continue;
      }

      if (type === TokenType.RIGHT_PAREN) {
        err.unexpectedTokenError(top, this.source!);
      }

      err.unexpectedTokenError(lexeme, this.source!);
    }

    this.args!.push(this.args!.pop()! + 1);
  }

  private _popIfOperator(lexeme: Lexeme) {
    const { value: symbol } = lexeme;

    if (lexeme.token.type === TokenType.UNARY_OPERATOR) {
      if (this.env.isUnaryOperator(symbol)) {
        const operator = this.env.getUnaryOperator(symbol)!;
        const argument = this.output!.pop()!;
        this.output!.push(operator.create(argument));
        this.stack!.pop();
        return true;
      }

      err.unknownTokenError("unary operator", lexeme, this.source!);
    }

    if (lexeme.token.type === TokenType.BINARY_OPERATOR) {
      if (this.env.isBinaryOperator(symbol)) {
        const operator = this.env.getBinaryOperator(symbol)!;
        const right = this.output!.pop()!;
        const left = this.output!.pop()!;
        this.output!.push(operator.create(left, right));
        this.stack!.pop();
        return true;
      }

      err.unknownTokenError("binary operator", lexeme, this.source!);
    }

    return false;
  }

  private _popIfFunction(lexeme: Lexeme) {
    if (lexeme.token.type !== TokenType.IDENTIFIER) {
      return;
    }

    const { value: identifier } = lexeme;

    if (this.env.isUnaryFunction(identifier)) {
      const func = this.env.getUnaryFunction(identifier)!;
      const counted = this.args!.pop()!;
      if (counted != 1) {
        err.argumentMismatchError(lexeme, 1, counted, this.source!);
      }
      const argument = this.output!.pop()!;
      this.output!.push(func.create(argument));
      this.stack!.pop();
    } else if (this.env.isBinaryFunction(identifier)) {
      const func = this.env.getBinaryFunction(identifier)!;
      const counted = this.args!.pop()!;
      if (counted != 2) {
        err.argumentMismatchError(lexeme, 2, counted, this.source!);
      }
      const right = this.output!.pop()!;
      const left = this.output!.pop()!;
      this.output!.push(func.create(left, right));
      this.stack!.pop();
    }
  }
}
