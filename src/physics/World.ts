import { RectBody } from './bodies/RectBody';
import { Body, Shape } from './bodies/types';
import { intersects } from './collisions/collision-detection/collision-detection';
import {
    getCollisionResolvedVelocities,
    getFixedCollisionResolvedVelocity,
} from './collisions/collision-resolver.utility';
import { getCollisionEvent } from './collisions/continuous-collision-detection/continuous-collision-detection';
import { Vector } from './Vector';

type WorldArgs = {
    width: number;
    height: number;
    noFriction?: boolean;
};

export class World {
    public bodies: Body[] = [];
    public width: number;
    public height: number;
    private noFriction: boolean;

    constructor({ width, height, noFriction = false }: WorldArgs) {
        this.width = width;
        this.height = height;
        this.noFriction = noFriction;
        this.initBoundaries();
    }

    addBody(body: Body): void {
        this.bodies.push(body);
    }

    update(): void {
        this.updateBodies();
    }

    getBodiesIntersectingShape(shape: Shape): Body[] {
        return this.bodies.reduce<Body[]>((acc, body) => {
            if (intersects(shape, body.shape)) acc.push(body);
            return acc;
        }, []);
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
                const resolvedVelocity = getFixedCollisionResolvedVelocity(collisionEvent);
                body.setVelocity(resolvedVelocity);
            } else {
                const [resolvedVelocityA, resolvedVelocityB] = getCollisionResolvedVelocities(collisionEvent);
                body.setVelocity(resolvedVelocityA);
                collisionBody.setVelocity(resolvedVelocityB);
            }
        } else {
            body.progressMovement();
            if (!this.noFriction) body.applyFriction();
        }
    }

    private initBoundaries(): void {
        const { width, height } = this;

        const topBoundary = new RectBody({ width, height: 1, elasticity: 1 });
        topBoundary.moveTo(new Vector(width / 2, -1));

        const rightBoundary = new RectBody({ width: 1, height, elasticity: 1 });
        rightBoundary.moveTo(new Vector(width + 1, height / 2));

        const bottomBoundary = new RectBody({ width, height: 1, elasticity: 1 });
        bottomBoundary.moveTo(new Vector(bottomBoundary.width / 2, height + 1));

        const leftBoundary = new RectBody({ width: 1, height, elasticity: 1 });
        leftBoundary.moveTo(new Vector(-1, height / 2));

        for (const boundary of [topBoundary, rightBoundary, bottomBoundary, leftBoundary]) {
            boundary.setFixed();
            this.addBody(boundary);
        }
    }
}
