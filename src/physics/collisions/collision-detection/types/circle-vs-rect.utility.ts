import { CircleBody } from 'src/physics/bodies/CircleBody';
import { RectBody } from 'src/physics/bodies/RectBody';
import { Vector } from 'src/physics/Vector';
import {
    getRectCorners,
    getTimeOfAxisAlignedCollision,
    getTimeOfCircleVsPointCollision,
    shouldConsiderTimeOfCollision,
    willMovingBodyPenetrateCollisionBody,
} from '../collision-detection.utility';
import { CircleVsRectCollisionEvent } from '../../types';
import { Axis, CircleVsRectPossibleCollision, TimeOfCollision } from '../types';

export const getCircleVsRectCollisionEvent = (
    movingBody: CircleBody,
    collisionBody: RectBody,
): CircleVsRectCollisionEvent | null => {
    // if a collision occurs with a circle side, then we don't need to check for corners
    return (
        getCircleVsRectSideCollision(movingBody, collisionBody) ||
        getCircleVsRectCornerCollision(movingBody, collisionBody)
    );
};

const getCircleVsRectSideCollision = (circle: CircleBody, rect: RectBody): CircleVsRectCollisionEvent | null => {
    return getCircleVsRectPossibleSideCollisions(circle, rect).reduce<CircleVsRectCollisionEvent | null>(
        (acc, sideCollision) => {
            const { movingCircleBoundary, collisionRectBoundary, axisOfCollision } = sideCollision;

            // find out when the circle will cross the closest rect side axis
            const isXAlignedCollision = axisOfCollision === 'x';
            const rateOfChangeInAxis = isXAlignedCollision ? circle.velocity.x : circle.velocity.y;
            const rateOfChangeInOtherAxis = isXAlignedCollision ? circle.velocity.y : circle.velocity.x;

            const timeOfCollision = getTimeOfAxisAlignedCollision(
                movingCircleBoundary,
                collisionRectBoundary,
                rateOfChangeInAxis,
            );

            if (!shouldConsiderTimeOfCollision(timeOfCollision, acc?.timeOfCollision)) return acc;

            // find out if the circle will collide with the closest rect side
            const otherAxisAtTimeOfCollision =
                (isXAlignedCollision ? circle.y : circle.x) + rateOfChangeInOtherAxis * timeOfCollision;

            const rectOtherAxisLowerBoundary = isXAlignedCollision ? rect.y0 : rect.x0;
            const rectOtherAxisUpperBoundary = isXAlignedCollision ? rect.y1 : rect.x1;

            if (
                willCircleCollideWithRectInOtherAxisAtTimeOfCollision(
                    rectOtherAxisLowerBoundary,
                    rectOtherAxisUpperBoundary,
                    otherAxisAtTimeOfCollision,
                )
            ) {
                const pointOfContact = isXAlignedCollision
                    ? {
                          x: collisionRectBoundary,
                          y: otherAxisAtTimeOfCollision,
                      }
                    : {
                          x: otherAxisAtTimeOfCollision,
                          y: collisionRectBoundary,
                      };

                // determine if just a graze
                if (
                    willMovingBodyPenetrateCollisionBody(circle.pos, pointOfContact, circle.velocity, timeOfCollision)
                ) {
                    return {
                        movingBody: circle,
                        collisionBody: rect,
                        timeOfCollision,
                        pointOfContact,
                    };
                }
            }

            return acc;
        },
        null,
    );
};

const willCircleCollideWithRectInOtherAxisAtTimeOfCollision = (
    rectOtherAxisLowerBoundary: number,
    rectOtherAxisUpperBoundary: number,
    otherAxisAtTimeOfCollision: number,
): boolean => {
    return (
        rectOtherAxisLowerBoundary <= otherAxisAtTimeOfCollision &&
        otherAxisAtTimeOfCollision <= rectOtherAxisUpperBoundary
    );
};

const getCircleVsRectCornerCollision = (circle: CircleBody, rect: RectBody): CircleVsRectCollisionEvent | null => {
    return getRectCorners(rect).reduce<CircleVsRectCollisionEvent | null>((acc, corner) => {
        const timeOfCollision = getCircleVsRectCornerTimeOfCollision(circle, corner);

        if (!shouldConsiderTimeOfCollision(timeOfCollision, acc?.timeOfCollision)) return acc;

        if (willMovingBodyPenetrateCollisionBody(circle.pos, corner, circle.velocity, timeOfCollision)) {
            return {
                movingBody: circle,
                collisionBody: rect,
                timeOfCollision,
                pointOfContact: corner,
            };
        }

        return acc;
    }, null);
};

const getCircleVsRectPossibleSideCollisions = (circle: CircleBody, rect: RectBody): CircleVsRectPossibleCollision[] => {
    const { radius, x, y } = circle;

    return [
        // circle right side -> rect left side
        {
            movingCircleBoundary: x + radius,
            collisionRectBoundary: rect.x0,
            axisOfCollision: Axis.x,
        },
        // circle left side -> rect right side
        {
            movingCircleBoundary: x - radius,
            collisionRectBoundary: rect.x1,
            axisOfCollision: Axis.x,
        },
        // circle bottom side -> rect top side
        {
            movingCircleBoundary: y + radius,
            collisionRectBoundary: rect.y0,
            axisOfCollision: Axis.y,
        },
        // circle top side -> rect bottom side
        {
            movingCircleBoundary: y - radius,
            collisionRectBoundary: rect.y1,
            axisOfCollision: Axis.y,
        },
    ];
};

const getCircleVsRectCornerTimeOfCollision = (circle: CircleBody, corner: Vector): TimeOfCollision => {
    const diffPos = Vector.subtract(circle.pos, corner);
    return getTimeOfCircleVsPointCollision(diffPos, circle.radius, circle.velocity);
};
