import { BaseBody } from './BaseBody';
import { Rect } from './shapes/Rect';

export class RectBody extends BaseBody {
    protected shape: Rect;

    constructor(width?: number, height?: number) {
        super(new Rect(width, height));
    }
}
