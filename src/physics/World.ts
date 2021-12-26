import { Body } from './bodies/types';

export class World {
    public bodies: Body[] = [];

    constructor(public tilesWidth: number, public tilesHeight: number) {}

    addBody(body: Body): void {
        this.bodies.push(body);
    }

    update(): void {
        for (const body of this.bodies) {
            body.update();
        }
    }
}
