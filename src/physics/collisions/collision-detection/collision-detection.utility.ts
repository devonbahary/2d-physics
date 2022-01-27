import { CircleBody } from '../../bodies/CircleBody';
import { RectBody } from '../../bodies/RectBody';
import { Body } from '../../bodies/types';
import { ErrorMessage } from '../../constants';
import { quadratic, roundForFloatingPoint } from '../../math/math.utilities';
import { Vector } from '../../Vector';
import { getClosestTimeOfCircleVsCircleCollision } from './types/circle-vs-circle.utility';
import { getCircleVsRectCollisionEvent } from './types/circle-vs-rect.utility';
import { getRectVsCircleCollisionEvent } from './types/rect-vs-circle.utility';
import { getRectVsRectCollisionEvent } from './types/rect-vs-rect.utility';
import { CollisionEvent } from '../types';
import { TimeOfCollision } from './types';

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

export const getClosestTimeOfCollision = (roots: number[]): TimeOfCollision => {
    return roots.reduce((acc, root) => {
        const roundedRoot = roundForFloatingPoint(root);

        if (roundedRoot < 0) return acc;

        if (acc === null || root < acc) {
            return root;
        }

        return acc;
    }, null);
};

export const getTimeOfCircleVsPointCollision = (diffPos: Vector, radius: number, velocity: Vector): TimeOfCollision => {
    const { x: dx, y: dy } = velocity;

    // don't consider collision into a corner if it won't ever come within a radius of the circle
    if (!dx && Math.abs(diffPos.x) >= radius) return null;
    if (!dy && Math.abs(diffPos.y) >= radius) return null;

    const a = dx ** 2 + dy ** 2;
    const b = 2 * diffPos.x * dx + 2 * diffPos.y * dy;
    const c = diffPos.x ** 2 + diffPos.y ** 2 - radius ** 2;

    const roots = quadratic(a, b, c);

    return getClosestTimeOfCollision(roots);
};

export const getRectCorners = (rect: RectBody): Vector[] => [
    new Vector(rect.x0, rect.y0), // top left
    new Vector(rect.x1, rect.y0), // top right
    new Vector(rect.x1, rect.y1), // bottom right
    new Vector(rect.x0, rect.y1), // bottom left
];

export const getTimeOfAxisAlignedCollision = (
    movingBoundary: number,
    approachingBoundary: number,
    changeInAxis: number,
): TimeOfCollision => {
    if (changeInAxis === 0) return null;

    return (approachingBoundary - movingBoundary) / changeInAxis;
};

export const shouldConsiderTimeOfCollision = (
    timeOfCollision: TimeOfCollision,
    existingTimeOfCollision?: number,
): timeOfCollision is number => {
    if (!isWithinTimestep(timeOfCollision)) return false;
    return existingTimeOfCollision === undefined || existingTimeOfCollision > timeOfCollision;
};

export const willMovingBodyPenetrateCollisionBody = (
    movingPoint: Vector,
    collisionPoint: Vector,
    velocity: Vector,
    timeOfCollision: number,
): boolean => {
    const progression = Vector.mult(velocity, timeOfCollision);
    const pointAtTimeOfCollision = Vector.add(movingPoint, progression);
    return isPointMovingTowardsPoint(pointAtTimeOfCollision, velocity, collisionPoint);
};

export const isPointMovingTowardsPoint = (movingPoint: Vector, velocity: Vector, collisionPoint: Vector): boolean => {
    const diffPos = Vector.subtract(collisionPoint, movingPoint);
    const dot = Vector.dot(velocity, diffPos);
    return roundForFloatingPoint(dot) > 0;
};

const isWithinTimestep = (timeOfCollision: TimeOfCollision): timeOfCollision is number => {
    if (timeOfCollision === null) return false;
    return roundForFloatingPoint(timeOfCollision) >= 0 && timeOfCollision <= 1;
};

const isClosestCollisionEvent = (
    collisionEvent: CollisionEvent | null,
    existingCollisionEvent: CollisionEvent | null,
): boolean => {
    if (!collisionEvent) return false;
    return !existingCollisionEvent || existingCollisionEvent.timeOfCollision > collisionEvent.timeOfCollision;
};
