#!/usr/bin/env node

/*

Simple program to show, what the library is capable of

Usage:
$ node test.js <equation>

Example:
$ node test.js 1 + 1
>> [Result] 1 + 1 = 2

*/

const { FormulaManager, Enviroment } = require("./dist/mf");

const enviroment = Enviroment.createDefault();
const manager = new FormulaManager(enviroment);

let math = process.argv.slice(2).join(" ");
const result = manager.parse(math).evaluate();

console.log(`[Result] ${math} = ${result}`);
