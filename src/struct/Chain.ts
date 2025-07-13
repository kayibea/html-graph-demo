import Node from "./Node";

export default class Chain<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;

  constructor(...args: T[]) {
    for (const arg of args) this.push(arg);
  }

  public push(value: T): Node<T> {
    const node = new Node(value);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail!.next = node;
      this.tail = node;
    }
    return node;
  }

  public getHead() {
    return this.head;
  }

  public getTail() {
    return this.tail;
  }

  *[Symbol.iterator](): IterableIterator<Node<T>> {
    let current = this.head;
    while (current) {
      yield current;
      current = current.next;
    }
  }
}
