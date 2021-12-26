import { Circle } from './shapes/Circle';
import { BaseBody } from './BaseBody';

export class CircleBody extends BaseBody {
    protected shape: Circle;

    constructor() {
        super(new Circle());
    }

    get radius(): number {
        return this.shape.radius;
    }
}
