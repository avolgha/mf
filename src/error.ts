import { Lexeme } from "./lexer";
import { TokenType } from "./token";

const exit = () => process.exit(1);
const msg = (msg: string) => console.error(msg);

const makeArrow = (length: number) => {
  const value = new Array(length).fill(" ");
  value[length - 1] = "^";
  return value.join("");
};

export const createError = (
  name: string,
  message: string,
  input: string,
  pos: number
) => {
  const arrow = makeArrow(pos + 1);
  if (pos === -1) {
    msg(`[${name}] ${message}`);
    exit();
  }
  msg(`[${name}] ${message}\n${input}\n${arrow}`);
  exit();
};

function makeArgs(count: number) {
  if (count == 0) {
    return "";
  }

  let current: number = "a".charCodeAt(0);
  let result = "";
  result += current;

  for (let i = 1; i < count; i++) {
    current++;
    result += ",";
    result += current;
  }

  return result.toString();
}

export const argumentMismatchError = (
  lexeme: Lexeme,
  expected: number,
  counted: number,
  input: string
) => {
  const { value: name } = lexeme;
  const args = makeArgs(expected);
  const msg =
    counted < expected
      ? `Not enough arguments for ${name}(${args}), expected ${expected}, got ${counted}`
      : `Too many arguments for ${name}(${args}), expected ${expected}, got ${counted}`;
  createError("Argument Mismatch", msg, input, lexeme.pos);
};

export const formulaError = (message: string, input: string, pos: number) =>
  createError("Formula", message, input, pos);

export const lexerError = (message: string, input: string, pos: number) =>
  createError("Lexer", message, input, pos);

export const parserError = (message: string, input: string, pos: number) =>
  createError("Parser", message, input, pos);

export const unexpectedTokenError = (lexeme: Lexeme, input: string) =>
  createError(
    "Unexpected Token",
    `Unexpected token '${lexeme.value}' in column ${lexeme.pos + 1}`,
    input,
    lexeme.pos
  );

export const unknownTokenError = (
  type: string,
  lexeme: Lexeme,
  input: string
) =>
  createError(
    "Unknown Token",
    `Unknown ${type} '${lexeme.value}' in column ${lexeme.pos}`,
    input,
    lexeme.pos
  );

export const unknownTokenError2 = (
  type: string,
  value: string,
  input: string,
  pos: number
) =>
  createError(
    "Unknown Token",
    `Unknown ${type} '${value}' in column ${pos}`,
    input,
    pos
  );

export const unmatchedParenthesisError = (lexeme: Lexeme, input: string) =>
  createError(
    "Unmatched Parenthesis",
    `Unmatched ${
      lexeme.token.type === TokenType.LEFT_PAREN ? "left" : "right"
    } parenthesis '${lexeme.value}' in column ${lexeme.pos + 1}`,
    input,
    lexeme.pos
  );
