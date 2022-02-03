import { Vector } from 'src/physics/Vector';
import { Point } from '../Point';
import { Dimensions } from '../types';

type RectArgs = Partial<Dimensions> & {
    x0?: number;
    y0?: number;
};

export class Rect {
    private point: Point;
    public width: number;
    public height: number;

    constructor({ x0 = 0, y0 = 0, height = 24, width = 24 }: RectArgs = {}) {
        this.width = width;
        this.height = height;
        this.point = new Point(x0 + width / 2, y0 + height / 2);
    }

    get x(): number {
        return this.point.x;
    }

    get y(): number {
        return this.point.y;
    }

    get pos(): Vector {
        return new Vector(this.x, this.y);
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
