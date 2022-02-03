import { RectBody } from './bodies/RectBody';
import { Body, Dimensions, Shape } from './bodies/types';
import { intersects } from './collisions/collision-detection/collision-detection';
import {
    getCollisionResolvedVelocities,
    getFixedCollisionResolvedVelocity,
    getTangentialMovementVector,
} from './collisions/collision-resolver.utility';
import { getCollisionEvent } from './collisions/continuous-collision-detection/continuous-collision-detection';
import { QuadTree, QuadTreeOptions } from './collisions/quad-tree/QuadTree';
import { CollisionEvent } from './collisions/types';
import { Vector } from './Vector';

type WorldOptions = {
    noFriction?: boolean;
    useQuadTree?: boolean;
};

type WorldArgs = Dimensions & {
    options?: WorldOptions;
    quadTreeOptions?: QuadTreeOptions;
};

const DEFAULT_OPTIONS: Required<WorldOptions> = {
    noFriction: false,
    useQuadTree: true,
};

export class World {
    public width: number;
    public height: number;
    public quadTree: QuadTree | null = null;
    private _bodies: Body[] = [];
    private options: Required<WorldOptions>;

    constructor({ width, height, options = {}, quadTreeOptions }: WorldArgs) {
        this.width = width;
        this.height = height;

        this.options = {
            ...DEFAULT_OPTIONS,
            ...options,
        };

        this.initQuadTree(quadTreeOptions);
        this.initBoundaries();
    }

    get bodies(): Body[] {
        return this._bodies;
    }

    addBody(body: Body): void {
        this._bodies.push(body);
        if (this.quadTree) this.quadTree.addBody(body);
    }

    update(): void {
        this.updateBodies();
        if (this.quadTree) this.quadTree.update();
    }

    getBodiesIntersectingShape(shape: Shape): Body[] {
        return this.bodies.reduce<Body[]>((acc, body) => {
            if (intersects(shape, body.shape)) acc.push(body);
            return acc;
        }, []);
    }

    private initQuadTree(quadTreeOptions: QuadTreeOptions = {}): void {
        if (!this.options.useQuadTree) return;
        this.quadTree = new QuadTree({ width: this.width, height: this.height, options: quadTreeOptions });
    }

    private updateBodies(): void {
        for (const body of this.bodies) {
            this.updateBody(body);
        }
    }

    private updateBody(body: Body): void {
        const possibleCollisionBodies = this.getBroadPhaseCollisionBodies(body);
        const collisionEvent = getCollisionEvent(body, possibleCollisionBodies);

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

                this.resolveChainedBodyCollisions(collisionBody);
            }

            this.onCollisionEvent(collisionEvent);
        } else {
            body.progressMovement();
            if (!this.options.noFriction) body.applyFriction();
        }
    }

    private getBroadPhaseCollisionBodies(body: Body): Body[] {
        if (!this.quadTree) return this.bodies;

        const movementBoundingBox = QuadTree.getMovementBoundingBox(body);

        if (!movementBoundingBox) return [];

        return this.quadTree.getBodiesOverlappingShape(movementBoundingBox);
    }

    private resolveChainedBodyCollisions(collisionBody: Body, resolvedBodyIdSet: Set<string> = new Set()): void {
        if (resolvedBodyIdSet.has(collisionBody.id)) return; // possible to revisit the same body; prevent infinite recursion

        const collisionEvent = getCollisionEvent(collisionBody, this.bodies);

        // "chained" bodies are the subsequent bodies in exact contact after a collision
        if (!collisionEvent || collisionEvent.timeOfCollision !== 0) return;

        if (collisionEvent.collisionBody.isFixed) {
            // if a chain of bodies are halted by the last body in the chain coming into
            // contact with a fixed body, slide that last body against the fixed body
            // by the pressure of the chained bodies
            const tangentialMovementVector = getTangentialMovementVector({
                ...collisionEvent,
                timeOfCollision: 0,
            });

            collisionBody.setVelocity(tangentialMovementVector);
        } else {
            resolvedBodyIdSet.add(collisionBody.id);
            this.resolveChainedBodyCollisions(collisionEvent.collisionBody, resolvedBodyIdSet);
        }

        this.onCollisionEvent(collisionEvent);
    }

    private onCollisionEvent(collisionEvent: CollisionEvent): void {
        const { movingBody, collisionBody } = collisionEvent;
        movingBody.collisions.onCollision(collisionEvent);
        collisionBody.collisions.onCollision(collisionEvent);
    }

    private initBoundaries(): void {
        const { width, height } = this;

        const topBoundary = new RectBody({ width, height: 0, elasticity: 1 });
        topBoundary.name = 'top boundary';
        topBoundary.moveTo(new Vector(width / 2, 0));

        const rightBoundary = new RectBody({ width: 0, height, elasticity: 1 });
        rightBoundary.name = 'right boundary';
        rightBoundary.moveTo(new Vector(width, height / 2));

        const bottomBoundary = new RectBody({ width, height: 0, elasticity: 1 });
        bottomBoundary.name = 'bottom boundary';
        bottomBoundary.moveTo(new Vector(bottomBoundary.width / 2, height));

        const leftBoundary = new RectBody({ width: 0, height, elasticity: 1 });
        leftBoundary.name = 'left boundary';
        leftBoundary.moveTo(new Vector(0, height / 2));

        for (const boundary of [topBoundary, rightBoundary, bottomBoundary, leftBoundary]) {
            boundary.setFixed();
            this.addBody(boundary);
        }
    }
}
