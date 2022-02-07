export enum TokenType {
  NUMBER,
  IDENTIFIER,
  VARIABLE,
  UNARY_OPERATOR,
  BINARY_OPERATOR,
  LEFT_PAREN,
  RIGHT_PAREN,
  COMMA,
}

export class Token {
  constructor(
    public type: TokenType,
    public pattern: RegExp,
    public symbol?: string
  ) {}

  match(input: string): number {
    const result = input.match(this.pattern);
    if (result && result.length > 0) {
      return result[0].length;
    }

    return -1;
  }

  toString() {
    if (this.symbol === undefined) {
      return this.type;
    } else {
      return `${this.type} '${this.symbol}'`;
    }
  }
}

export const LEFT_PAREN = new Token(TokenType.LEFT_PAREN, /^\(/, "(");
export const RIGHT_PAREN = new Token(TokenType.RIGHT_PAREN, /^\)/, ")");
export const COMMA = new Token(TokenType.COMMA, /^,/, ",");
export const NUMBER = new Token(
  TokenType.NUMBER,
  /^([0-9]+[.])?[0-9]+([eE][-+]?[0-9]+)?/
);
export const IDENTIFIER = new Token(
  TokenType.IDENTIFIER,
  /^\p{L}([0-9]|\p{L})*/u
);
export const VARIABLE = new Token(
  TokenType.VARIABLE,
  /^[<]\p{L}(([0-9_-]|\p{L})*([0-9]|\p{L})+)?/u
);
