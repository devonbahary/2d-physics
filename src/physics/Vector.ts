import { roundForFloatingPoint } from './math/math.utilities';

export class Vector {
    constructor(public x = 0, public y = 0) {}

    static add(v1: Vector, v2: Vector): Vector {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    static subtract(v1: Vector, v2: Vector): Vector {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    static mult(v: Vector, scalar: number): Vector {
        return new Vector(v.x * scalar, v.y * scalar);
    }

    static divide(v: Vector, scalar: number): Vector {
        return new Vector(v.x / scalar, v.y / scalar);
    }

    static magnitude = (v: Vector): number => Math.sqrt(v.x ** 2 + v.y ** 2);

    static dot(v1: Vector, v2: Vector): number {
        return v1.x * v2.x + v1.y * v2.y;
    }

    static rescale(v: Vector, mag: number): Vector {
        const originalMag = Vector.magnitude(v);
        const normalized = Vector.divide(v, originalMag);
        return Vector.mult(normalized, mag);
    }

    static roundForFloatingPoint(v: Vector): Vector {
        return new Vector(roundForFloatingPoint(v.x), roundForFloatingPoint(v.y));
    }

    static format(v: Vector): string {
        return `(${roundForFloatingPoint(v.x)}, ${roundForFloatingPoint(v.y)})`;
    }
}
