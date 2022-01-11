import { BaseBody } from './BaseBody';
import { Rect } from './shapes/Rect';

type Side = {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
};

export class RectBody extends BaseBody {
    protected shape: Rect;

    constructor(width?: number, height?: number) {
        super(new Rect(width, height));
    }

    get sides(): Side[] {
        return [
            // top
            {
                x0: this.x0,
                x1: this.x1,
                y0: this.y0,
                y1: this.y0,
            },
            // right
            {
                x0: this.x1,
                x1: this.x1,
                y0: this.y0,
                y1: this.y1,
            },
            // bottom
            {
                x0: this.x0,
                x1: this.x1,
                y0: this.y1,
                y1: this.y1,
            },
            // left
            {
                x0: this.x0,
                x1: this.x0,
                y0: this.y0,
                y1: this.y1,
            },
        ];
    }
}
