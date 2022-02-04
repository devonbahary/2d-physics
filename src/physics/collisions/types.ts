import { Body } from '../bodies/types';
import { CircleBody } from '../bodies/CircleBody';
import { RectBody } from '../bodies/RectBody';
import { Vector } from '../Vector';

export type CircleVsCircleCollision = {
    movingBody: CircleBody;
    collisionBody: CircleBody;
    timeOfCollision: number;
};

export type CircleVsRectCollision = {
    movingBody: CircleBody;
    collisionBody: RectBody;
    timeOfCollision: number;
    pointOfContact: Vector;
};

export type RectVsCircleCollision = {
    movingBody: RectBody;
    collisionBody: CircleBody;
    timeOfCollision: number;
    pointOfContact: Vector;
};

export type RectVsRectCollision = {
    movingBody: RectBody;
    collisionBody: RectBody;
    timeOfCollision: number;
    pointOfContact: Vector;
};

export type AdjacentCollision = {
    movingBody: Body;
    collisionBody: Body;
    timeOfCollision: 0;
};

export type Collision =
    | CircleVsCircleCollision
    | CircleVsRectCollision
    | RectVsCircleCollision
    | RectVsRectCollision
    | AdjacentCollision;
