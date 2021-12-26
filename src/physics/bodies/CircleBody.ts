import { Circle } from './shapes/Circle';
import { BaseBody } from './BaseBody';

export class CircleBody extends BaseBody {
    protected shape: Circle;

    constructor(
        radius?: number
    ) {
        super(new Circle(radius));
    }

    get radius(): number {
        return this.shape.radius;
    }
}
