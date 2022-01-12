import { RectBody } from './bodies/RectBody';
import { Body } from './bodies/types';
import { getCollisionFinalVelocities, getFixedCollisionFinalVelocity } from './collisions/collision-resolver.utility';
import {
    getTimeOfCollision,
    isBodyMovingTowardsBody,
} from './collisions/collision-detection.utility';
import { roundForFloatingPoint } from './math/math.utilities';
import { Vector } from './Vector';

type PotentialCollision = {
    collisionBody: Body;
    timeOfCollision: number;
};

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

        const potentialCollisions = this.getPotentialCollisionsInThisTimeStep(body);

        if (potentialCollisions.length) {
            const currentPos = new Vector(body.pos.x, body.pos.y);

            for (const collision of potentialCollisions) {
                const { collisionBody, timeOfCollision } = collision;

                // move body to point of collision
                body.progressMovement(timeOfCollision);

                if (!isBodyMovingTowardsBody(body, collisionBody)) {
                    // bodies touch but never intersect (graze), so reset position and consider next collision
                    body.moveTo(currentPos);
                    continue;
                }

                // resolve collision and end movement
                if (collisionBody.isFixed) {
                    const finalVelocity = getFixedCollisionFinalVelocity(body, collisionBody);
                    body.setVelocity(finalVelocity);
                } else {
                    const [finalVelocityA, finalVelocityB] = getCollisionFinalVelocities(body, collisionBody);
                    body.setVelocity(finalVelocityA);
                    collisionBody.setVelocity(finalVelocityB);
                }

                return;
            }
        }

        // no collisions, so move freely
        body.progressMovement();
        body.applyFriction();
    }

    private getPotentialCollisionsInThisTimeStep(movingBody: Body): PotentialCollision[] {
        const collisions = this.bodies.reduce<PotentialCollision[]>((acc, collisionBody) => {
            if (movingBody === collisionBody) return acc;

            const timeOfCollision = getTimeOfCollision(movingBody, collisionBody);

            if (this.isCollisionInThisTimeStep(timeOfCollision)) {
                const collisionEvent = {
                    collisionBody,
                    timeOfCollision,
                };
                acc.push(collisionEvent);
            }

            return acc;
        }, []);

        return collisions.sort((a, b) => a.timeOfCollision - b.timeOfCollision);
    }

    private isCollisionInThisTimeStep(timeOfCollision: number | null): timeOfCollision is number {
        if (timeOfCollision === null) return false; // collision never happens
        return roundForFloatingPoint(timeOfCollision) >= 0 && timeOfCollision <= 1;
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
