import { Vector } from 'src/physics/Vector';
import { Point } from '../Point';

export class Rect {
    private point: Point;

    constructor(public width = 24, public height = 24) {
        this.point = new Point();
        const newPositionCenter = new Vector(this.width / 2, this.height / 2);
        this.moveTo(newPositionCenter);
    }

    get x(): number {
        return this.point.x;
    }

    get y(): number {
        return this.point.y;
    }

    get x0(): number {
        return this.point.x - this.width / 2;
    }

    get x1(): number {
        return this.point.x + this.width / 2;
    }

    get y0(): number {
        return this.point.y - this.height / 2;
    }

    get y1(): number {
        return this.point.y + this.height / 2;
    }

    moveTo(pos: Vector): void {
        this.point.moveTo(pos);
    }
}
