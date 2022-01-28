import { CircleBody } from '../../bodies/CircleBody';
import { RectBody } from '../../bodies/RectBody';
import { Body, Shape } from '../../bodies/types';
import { ErrorMessage } from '../../constants';
import { getClosestTimeOfCircleVsCircleCollision } from './types/circle-vs-circle.utility';
import { getCircleVsRectCollisionEvent } from './types/circle-vs-rect.utility';
import { getRectVsCircleCollisionEvent } from './types/rect-vs-circle.utility';
import { getRectVsRectCollisionEvent } from './types/rect-vs-rect.utility';
import { CollisionEvent } from '../types';
import { shouldConsiderTimeOfCollision, willMovingBodyPenetrateCollisionBody } from './utility';
import { Circle } from 'src/physics/bodies/shapes/Circle';
import { Vector } from 'src/physics/Vector';
import { Rect } from 'src/physics/bodies/shapes/Rect';

export const getCollisionEvent = (movingBody: Body, worldBodies: Body[]): CollisionEvent | null => {
    return worldBodies.reduce<CollisionEvent | null>((acc, collisionBody) => {
        if (movingBody === collisionBody) return acc;

        if (movingBody instanceof CircleBody) {
            if (collisionBody instanceof CircleBody) {
                const timeOfCollision = getClosestTimeOfCircleVsCircleCollision(movingBody, collisionBody);

                if (!shouldConsiderTimeOfCollision(timeOfCollision, acc?.timeOfCollision)) return acc;

                if (
                    willMovingBodyPenetrateCollisionBody(
                        movingBody.pos,
                        collisionBody.pos,
                        movingBody.velocity,
                        timeOfCollision,
                    )
                ) {
                    return {
                        movingBody,
                        collisionBody,
                        timeOfCollision,
                    };
                }

                return acc;
            } else if (collisionBody instanceof RectBody) {
                const collisionEvent = getCircleVsRectCollisionEvent(movingBody, collisionBody);
                return isClosestCollisionEvent(collisionEvent, acc) ? collisionEvent : acc;
            }
        } else if (movingBody instanceof RectBody) {
            if (collisionBody instanceof CircleBody) {
                const collisionEvent = getRectVsCircleCollisionEvent(movingBody, collisionBody);
                return isClosestCollisionEvent(collisionEvent, acc) ? collisionEvent : acc;
            } else if (collisionBody instanceof RectBody) {
                const collisionEvent = getRectVsRectCollisionEvent(movingBody, collisionBody);
                return isClosestCollisionEvent(collisionEvent, acc) ? collisionEvent : acc;
            }
        }

        throw new Error(ErrorMessage.unexpectedBodyType);
    }, null);
};

export const intersects = (shapeA: Shape, shapeB: Shape): boolean => {
    if (shapeA instanceof Circle && shapeB instanceof Circle) {
        return doCirclesOverlap(shapeA, shapeB);
    }

    if (shapeA instanceof Circle && shapeB instanceof Rect) {
        return doCircleAndRectOverlap(shapeA, shapeB);
    }

    if (shapeA instanceof Rect && shapeB instanceof Circle) {
        return doCircleAndRectOverlap(shapeB, shapeA);
    }

    if (shapeA instanceof Rect && shapeB instanceof Rect) {
        return doRectsOverlap(shapeA, shapeB);
    }

    throw new Error(ErrorMessage.unexpectedBodyType);
};

const doCirclesOverlap = (circleA: Circle, circleB: Circle): boolean => {
    const diffPos = Vector.subtract(circleB.pos, circleA.pos);
    return Vector.magnitude(diffPos) < circleA.radius + circleB.radius;
};

// https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
const doCircleAndRectOverlap = (circle: Circle, rect: Rect): boolean => {
    const dx = Math.abs(circle.x - rect.x);
    const dy = Math.abs(circle.y - rect.y);

    if (dx > rect.width / 2 + circle.radius) return false;
    if (dy > rect.height / 2 + circle.radius) return false;

    if (dx <= rect.width / 2) return true;
    if (dy <= rect.height / 2) return true;

    const cornerDistance = (dx - rect.width / 2) ** 2 + (dy - rect.height / 2) ** 2;

    return cornerDistance <= circle.radius ** 2;
};

const doRectsOverlap = (rectA: Rect, rectB: Rect): boolean => {
    return rectA.x0 < rectB.x1 && rectA.x1 > rectB.x0 && rectA.y0 < rectB.y1 && rectA.y1 > rectB.y0;
};

const isClosestCollisionEvent = (
    collisionEvent: CollisionEvent | null,
    existingCollisionEvent: CollisionEvent | null,
): boolean => {
    if (!collisionEvent) return false;
    return !existingCollisionEvent || existingCollisionEvent.timeOfCollision > collisionEvent.timeOfCollision;
};
