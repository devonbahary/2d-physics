import { CircleBody } from 'src/physics/bodies/CircleBody';
import { RectBody } from 'src/physics/bodies/RectBody';
import { gamePosToSpritePos } from './utilities';

export class Sprite {
    constructor(public body: RectBody | CircleBody, private element: HTMLElement) {}

    update(): void {
        const { x: left, y: top } = gamePosToSpritePos(this.body);

        this.element.style.left = `${left}px`;
        this.element.style.top = `${top}px`;

        this.element.style.width = `${this.body.width}px`;
        this.element.style.height = `${this.body.height}px`;

        if (this.body.isFixed) {
            this.element.classList.add('fixed');
        } else {
            this.element.classList.remove('fixed');
        }
    }
}
