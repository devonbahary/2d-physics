import { BaseBody, BaseBodyArgs } from './BaseBody';
import { Rect } from './shapes/Rect';
import { Dimensions } from './types';

type RectBodyArgs = Omit<BaseBodyArgs, 'shape'> & Partial<Dimensions>;

export class RectBody extends BaseBody {
    declare shape: Rect;

    constructor({ width, height, ...rest }: RectBodyArgs = {}) {
        super({
            shape: new Rect({ width, height }),
            ...rest,
        });
    }
}
