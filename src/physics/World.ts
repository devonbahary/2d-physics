import { RectBody } from './bodies/RectBody';
import { Body } from './bodies/types';
import {
    getCollisionFinalVelocities,
    getFixedCollisionRedirectedVelocity,
} from './collisions/collision-resolver.utility';
import { getCollisionEvent } from './collisions/collision-detection.utility';
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
        this.updateBodies();
    }

    private updateBodies(): void {
        for (const body of this.bodies) {
            this.updateBody(body);
        }
    }

    private updateBody(body: Body): void {
        if (!body.isMoving()) return;

        const collisionEvent = getCollisionEvent(body, this.bodies);

        if (collisionEvent) {
            const { collisionBody, timeOfCollision } = collisionEvent;

            // move body to point of collision
            body.progressMovement(timeOfCollision);

            // resolve collision and end movement
            if (collisionBody.isFixed) {
                const redirectedVelocity = getFixedCollisionRedirectedVelocity(collisionEvent);
                body.setVelocity(redirectedVelocity);
            } else {
                const [finalVelocityA, finalVelocityB] = getCollisionFinalVelocities(collisionEvent);
                body.setVelocity(finalVelocityA);
                collisionBody.setVelocity(finalVelocityB);
            }
        } else {
            body.progressMovement();
            body.applyFriction();
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
            boundary.setFixed(true);
            this.addBody(boundary);
        }
    }
}
