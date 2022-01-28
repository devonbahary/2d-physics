import { CircleBody } from '../../bodies/CircleBody';
import { RectBody } from '../../bodies/RectBody';
import { Body } from '../../bodies/types';
import { ErrorMessage } from '../../constants';
import { getClosestTimeOfCircleVsCircleCollision } from './collision-types/circle-vs-circle.utility';
import { getCircleVsRectCollisionEvent } from './collision-types/circle-vs-rect.utility';
import { getRectVsCircleCollisionEvent } from './collision-types/rect-vs-circle.utility';
import { getRectVsRectCollisionEvent } from './collision-types/rect-vs-rect.utility';
import { CollisionEvent } from '../types';
import { shouldConsiderTimeOfCollision, willMovingBodyPenetrateCollisionBody } from './utility';
import { intersects } from '../collision-detection/collision-detection';

export const getCollisionEvent = (movingBody: Body, worldBodies: Body[]): CollisionEvent | null => {
    if (!movingBody.isMoving()) return null;

    return worldBodies.reduce<CollisionEvent | null>((acc, collisionBody) => {
        if (movingBody === collisionBody) return acc;

        if (intersects(movingBody.shape, collisionBody.shape)) return acc;

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

const isClosestCollisionEvent = (
    collisionEvent: CollisionEvent | null,
    existingCollisionEvent: CollisionEvent | null,
): boolean => {
    if (!collisionEvent) return false;
    return !existingCollisionEvent || existingCollisionEvent.timeOfCollision > collisionEvent.timeOfCollision;
};
