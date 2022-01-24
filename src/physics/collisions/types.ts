import { CircleBody } from '../bodies/CircleBody';
import { RectBody } from '../bodies/RectBody';
import { Vector } from '../Vector';

export type CircleVsCircleCollisionEvent = {
    movingBody: CircleBody;
    collisionBody: CircleBody;
    timeOfCollision: number;
};

export type CircleVsRectCollisionEvent = {
    movingBody: CircleBody;
    collisionBody: RectBody;
    timeOfCollision: number;
    pointOfContact: Vector;
};

export type RectVsCircleCollisionEvent = {
    movingBody: RectBody;
    collisionBody: CircleBody;
    timeOfCollision: number;
    pointOfContact: Vector;
};

export type RectVsRectCollisionEvent = {
    movingBody: RectBody;
    collisionBody: RectBody;
    timeOfCollision: number;
    pointOfContact: Vector;
};

export type CollisionEvent = CircleVsCircleCollisionEvent | CircleVsRectCollisionEvent | RectVsCircleCollisionEvent | RectVsRectCollisionEvent;
