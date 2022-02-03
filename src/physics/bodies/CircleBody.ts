import { Circle } from './shapes/Circle';
import { BaseBody, BaseBodyArgs } from './BaseBody';

type CircleBodyArgs = Omit<BaseBodyArgs, 'shape'> & {
    radius?: number;
};

export class CircleBody extends BaseBody {
    declare shape: Circle;

    constructor({ radius, ...rest }: CircleBodyArgs = {}) {
        super({
            shape: new Circle(radius),
            ...rest,
        });
    }

    get radius(): number {
        return this.shape.radius;
    }
}
