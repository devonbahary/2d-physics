import { CircleBody } from '../../bodies/CircleBody';
import { RectBody } from '../../bodies/RectBody';
import { Body } from '../../bodies/types';
import { ErrorMessage } from '../../constants';
import { getClosestTimeOfCircleVsCircleCollision } from './collision-types/circle-vs-circle.utility';
import { getCircleVsRectCollision } from './collision-types/circle-vs-rect.utility';
import { getRectVsCircleCollision } from './collision-types/rect-vs-circle.utility';
import { getRectVsRectCollision } from './collision-types/rect-vs-rect.utility';
import { Collision } from '../types';
import { shouldConsiderTimeOfCollision, willMovingBodyPenetrateCollisionBody } from './utility';
import { intersects } from '../collision-detection/collision-detection';

export const getClosestCollision = (movingBody: Body, otherBodies: Body[]): Collision | null => {
    if (!movingBody.isMoving()) return null;

    return otherBodies.reduce<Collision | null>((acc, collisionBody) => {
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
                const collision = getCircleVsRectCollision(movingBody, collisionBody);
                return isClosestCollision(collision, acc) ? collision : acc;
            }
        } else if (movingBody instanceof RectBody) {
            if (collisionBody instanceof CircleBody) {
                const collision = getRectVsCircleCollision(movingBody, collisionBody);
                return isClosestCollision(collision, acc) ? collision : acc;
            } else if (collisionBody instanceof RectBody) {
                const collision = getRectVsRectCollision(movingBody, collisionBody);
                return isClosestCollision(collision, acc) ? collision : acc;
            }
        }

        throw new Error(ErrorMessage.unexpectedBodyType);
    }, null);
};

const isClosestCollision = (
    collision: Collision | null,
    existingCollision: Collision | null,
): boolean => {
    if (!collision) return false;
    return !existingCollision || existingCollision.timeOfCollision > collision.timeOfCollision;
};
