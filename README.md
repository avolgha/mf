# Math Formula

Simple JavaScript library to solve math equations

## Installation

Download the file `dist/mf.js` and import it to your project.

If you use TypeScript or want to have types included, you can
import the `dist/mf.d.ts` too. You only have to put the file in
the same directory as the source file.

## Usage

To create and evaluate a formula, you'll have to initialize an
enviroment first. Then you can create a formula manager with this
enviroment. Then you can parse your formula in form of a string
into the `parse()` function and call the `evaluate()` function
on the result of the parser.

> Note here: The enviroment has to be initialized via the static
> `createDefault()` method because the constructor is private

```typescript
import { Enviroment, FormulaManager } from "./mf";

const enviroment = Enviroment.createDefault();
const manager = new FormulaManager(enviroment);

const formula = "2 + 2";
console.log(manager.parse(formula).evaluate());

// => this should log "4"
```

For an interactive example, look at the `test.js` file.

## Support

You can get support if you write me on Discord (`Marius#0686`)
or if you create an issue in this project.
