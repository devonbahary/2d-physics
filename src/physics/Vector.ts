export class Vector {
    constructor(public x = 0, public y = 0) {}

    get magnitude(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    static add(v1: Vector, v2: Vector): Vector {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    static mult(v: Vector, scalar: number): Vector {
        return new Vector(v.x * scalar, v.y * scalar);
    }

    static divide(v: Vector, scalar: number): Vector {
        return new Vector(v.x / scalar, v.y / scalar);
    }
}
