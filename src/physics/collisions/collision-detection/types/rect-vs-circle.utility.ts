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
import { RectVsCircleCollisionEvent } from '../../types';
import { Axis, RectVsCirclePossibleCollision, TimeOfCollision } from '../types';

export const getRectVsCircleCollisionEvent = (
    movingBody: RectBody,
    collisionBody: CircleBody,
): RectVsCircleCollisionEvent | null => {
    // if a collision occurs with a circle side, then we don't need to check for corners
    return (
        getRectVsCircleSideCollision(movingBody, collisionBody) ||
        getRectVsCircleCornerCollision(movingBody, collisionBody)
    );
};

const getRectVsCircleSideCollision = (rect: RectBody, circle: CircleBody): RectVsCircleCollisionEvent | null => {
    return getRectVsCirclePossibleSideCollisions(rect, circle).reduce<RectVsCircleCollisionEvent | null>(
        (acc, sideCollision) => {
            const { axisOfCollision, movingRectBoundary, collisionCircleBoundary } = sideCollision;

            // find out when rect will cross the circle's closest x- or y-axis
            const isXAlignedCollision = axisOfCollision === 'x';
            const rateOfChangeInAxis = isXAlignedCollision ? rect.velocity.x : rect.velocity.y;
            const rateOfChangeInOtherAxis = isXAlignedCollision ? rect.velocity.y : rect.velocity.x;

            const timeOfCollision = getTimeOfAxisAlignedCollision(
                movingRectBoundary,
                collisionCircleBoundary,
                rateOfChangeInAxis,
            );

            if (!shouldConsiderTimeOfCollision(timeOfCollision, acc?.timeOfCollision)) return acc;

            // find out if rect will collide with circle closest axis-aligned point
            const changeInOtherAxisAtTimeOfCollision = rateOfChangeInOtherAxis * timeOfCollision;
            const rectOtherAxisLowerBoundary = isXAlignedCollision ? rect.y0 : rect.x0;
            const rectOtherAxisUpperBoundary = isXAlignedCollision ? rect.y1 : rect.x1;

            const rectOtherAxisLowerBoundaryAtTimeOfCollision =
                rectOtherAxisLowerBoundary + changeInOtherAxisAtTimeOfCollision;
            const rectOtherAxisUpperBoundaryAtTimeOfCollision =
                rectOtherAxisUpperBoundary + changeInOtherAxisAtTimeOfCollision;

            const circleCenterOfAxisCollision = isXAlignedCollision ? circle.y : circle.x;

            if (
                willRectCollideWithCircleInOtherAxisAtTimeOfCollision(
                    rectOtherAxisLowerBoundaryAtTimeOfCollision,
                    rectOtherAxisUpperBoundaryAtTimeOfCollision,
                    circleCenterOfAxisCollision,
                )
            ) {
                const circleOtherAxisValueAtTimeOfCollision = isXAlignedCollision ? circle.y : circle.x;

                const pointOfContact = isXAlignedCollision
                    ? {
                          x: collisionCircleBoundary,
                          y: circleOtherAxisValueAtTimeOfCollision,
                      }
                    : {
                          x: circleOtherAxisValueAtTimeOfCollision,
                          y: collisionCircleBoundary,
                      };

                // determine if just a graze
                if (willMovingBodyPenetrateCollisionBody(pointOfContact, circle.pos, rect.velocity, 0)) {
                    return {
                        movingBody: rect,
                        collisionBody: circle,
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

const getRectVsCircleCornerCollision = (rect: RectBody, circle: CircleBody): RectVsCircleCollisionEvent | null => {
    return getRectCorners(rect).reduce<RectVsCircleCollisionEvent | null>((acc, corner) => {
        const timeOfCollision = getRectCornerVsCircleTimeOfCollision(corner, circle, rect.velocity);

        if (!shouldConsiderTimeOfCollision(timeOfCollision, acc?.timeOfCollision)) return acc;

        if (willMovingBodyPenetrateCollisionBody(corner, circle.pos, rect.velocity, timeOfCollision)) {
            return {
                movingBody: rect,
                collisionBody: circle,
                timeOfCollision,
                pointOfContact: corner,
            };
        }

        return acc;
    }, null);
};

const getRectVsCirclePossibleSideCollisions = (rect: RectBody, circle: CircleBody): RectVsCirclePossibleCollision[] => {
    const { radius } = circle;

    return [
        // rect right side into circle left side
        {
            movingRectBoundary: rect.x1,
            collisionCircleBoundary: circle.x - radius,
            axisOfCollision: Axis.x,
        },
        // rect left side into circle right side
        {
            movingRectBoundary: rect.x0,
            collisionCircleBoundary: circle.x + radius,
            axisOfCollision: Axis.x,
        },
        // rect bottom side into circle top side
        {
            movingRectBoundary: rect.y1,
            collisionCircleBoundary: circle.y - radius,
            axisOfCollision: Axis.y,
        },
        // rect top side into circle bottom side
        {
            movingRectBoundary: rect.y0,
            collisionCircleBoundary: circle.y + radius,
            axisOfCollision: Axis.y,
        },
    ];
};

const getRectCornerVsCircleTimeOfCollision = (
    corner: Vector,
    circle: CircleBody,
    velocity: Vector,
): TimeOfCollision => {
    const diffPos = Vector.subtract(corner, circle.pos);
    return getTimeOfCircleVsPointCollision(diffPos, circle.radius, velocity);
};

const willRectCollideWithCircleInOtherAxisAtTimeOfCollision = (
    rectOtherAxisLowerBoundaryAtTimeOfCollision: number,
    rectOtherAxisUpperBoundaryAtTimeOfCollision: number,
    circleCenterOfAxisCollision: number,
): boolean => {
    return (
        rectOtherAxisLowerBoundaryAtTimeOfCollision <= circleCenterOfAxisCollision &&
        circleCenterOfAxisCollision <= rectOtherAxisUpperBoundaryAtTimeOfCollision
    );
};
