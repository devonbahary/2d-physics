import { Vector } from 'src/physics/Vector';
import { Point } from '../Point';

export class Circle {
    private point: Point;

    constructor(public radius = 12) {
        this.point = new Point();
        const newPositionCenter = new Vector(this.radius, this.radius);
        this.moveTo(newPositionCenter);
    }

    get x(): number {
        return this.point.x;
    }

    get y(): number {
        return this.point.y;
    }

    get x0(): number {
        return this.point.x - this.radius;
    }

    get x1(): number {
        return this.point.x + this.radius;
    }

    get y0(): number {
        return this.point.y - this.radius;
    }

    get y1(): number {
        return this.point.y + this.radius;
    }

    get width(): number {
        return this.radius * 2;
    }

    get height(): number {
        return this.radius * 2;
    }

    moveTo(pos: Vector): void {
        this.point.moveTo(pos);
    }
}
