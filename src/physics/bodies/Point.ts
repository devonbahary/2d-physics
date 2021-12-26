import { Vector } from '../Vector';

export class Point {
    private vector: Vector;

    constructor(x = 0, y = 0) {
        this.vector = new Vector(x, y);
    }

    get x(): number {
        return this.vector.x;
    }

    get y(): number {
        return this.vector.y;
    }

    moveTo(pos: Vector): void {
        this.vector = pos;
    }
}
