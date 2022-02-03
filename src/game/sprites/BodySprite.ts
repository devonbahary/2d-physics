import { Body } from 'src/physics/bodies/types';
import { gamePosToSpritePos } from '../utilities';

export class BodySprite {
    constructor(private body: Body, public element: HTMLElement) {}

    get id(): string {
        return this.body.id;
    }

    private get width(): number {
        return Math.max(1, this.body.width);
    }

    private get height(): number {
        return Math.max(1, this.body.height);
    }

    update(): void {
        const { x: left, y: top } = gamePosToSpritePos(this.body.shape);

        this.element.style.left = `${left}px`;
        this.element.style.top = `${top}px`;

        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;

        if (this.body.isFixed) {
            this.element.classList.add('fixed');
        } else {
            this.element.classList.remove('fixed');
        }
    }
}
