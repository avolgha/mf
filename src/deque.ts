export interface MiniDeque<T> {
  peek(): T;
  pop(): T | undefined;
  push(element: T): void;
  size(): number;
}

export function create<T>(): MiniDeque<T> {
  class Impl implements MiniDeque<T> {
    stack: T[] = [];

    peek(): T {
      return this.stack[this.stack.length - 1];
    }

    pop(): T | undefined {
      return this.stack.pop();
    }

    push(element: T): void {
      this.stack.push(element);
    }

    size(): number {
      return this.stack.length;
    }
  }
  return new Impl();
}
