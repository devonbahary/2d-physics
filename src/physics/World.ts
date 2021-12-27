import { RectBody } from './bodies/RectBody';
import { Body } from './bodies/types';
import { Vector } from './Vector';

export class World {
    public bodies: Body[] = [];

    constructor(public width: number, public height: number) {
        this.initBoundaries();
    }

    addBody(body: Body): void {
        this.bodies.push(body);
    }

    update(): void {
        for (const body of this.bodies) {
            body.update();
        }
    }

    private initBoundaries(): void {
        const { width, height } = this;

        const topBoundary = new RectBody(width, 1);
        topBoundary.moveTo(new Vector(width / 2, 0));
        
        const rightBoundary = new RectBody(1, height);
        rightBoundary.moveTo(new Vector(width, height / 2));
        
        const bottomBoundary = new RectBody(width, 1);
        bottomBoundary.moveTo(new Vector(bottomBoundary.width / 2, height));
        
        const leftBoundary = new RectBody(1, height);
        leftBoundary.moveTo(new Vector(0, height / 2));

        for (const boundary of [topBoundary, rightBoundary, bottomBoundary, leftBoundary]) {
            this.addBody(boundary);
        }
    }
}
