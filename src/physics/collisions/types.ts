import { CircleBody } from "../bodies/CircleBody";
import { RectBody } from "../bodies/RectBody";
import { Vector } from "../Vector";

type CircleVsCircleCollisionEvent = {
    collisionBody: CircleBody;
    timeOfCollision: number;
}

type CircleVsRectCollisionEvent = {
    collisionBody: RectBody;
    timeOfCollision: number;
    pointOfContact: Vector;
}

export type CollisionEvent = CircleVsCircleCollisionEvent | CircleVsRectCollisionEvent;