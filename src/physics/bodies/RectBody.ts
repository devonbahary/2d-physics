import { BaseBody, BaseBodyArgs } from './BaseBody';
import { Rect } from './shapes/Rect';

type RectBodyArgs = Omit<BaseBodyArgs, 'shape'> & {
    width?: number;
    height?: number;
};

export class RectBody extends BaseBody {
    public shape: Rect;

    constructor({ width, height, ...rest }: RectBodyArgs = {}) {
        super({
            shape: new Rect(width, height),
            ...rest,
        });
    }
}
