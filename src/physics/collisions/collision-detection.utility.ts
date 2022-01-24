import { CircleBody } from '../bodies/CircleBody';
import { RectBody } from '../bodies/RectBody';
import { Body } from '../bodies/types';
import { ErrorMessage } from '../constants';
import { getExactOverlap, hasOverlap, quadratic, roundForFloatingPoint } from '../math/math.utilities';
import { Vector } from '../Vector';
import { CircleVsRectCollisionEvent, CollisionEvent, RectVsCircleCollisionEvent, RectVsRectCollisionEvent } from './types';

enum Axis {
    x = 'x',
    y = 'y',
}

type TimeOfCollision = number | null;

type CircleVsRectPossibleCollision = {
    movingCircleBoundary: number;
    collisionRectBoundary: number;
    axisOfCollision: Axis;
};

type RectVsCirclePossibleCollision = {
    movingRectBoundary: number;
    collisionCircleBoundary: number;
    axisOfCollision: Axis;
};

type RectVsRectPossibleCollision = {
    movingBoundary: number;
    collisionBoundary: number;
    axisOfCollision: Axis;
}

export const getCollisionEvent = (movingBody: Body, worldBodies: Body[]): CollisionEvent | null => {
    return worldBodies.reduce<CollisionEvent | null>((acc, collisionBody) => {
        if (movingBody === collisionBody) return acc;

        if (movingBody instanceof CircleBody) {
            if (collisionBody instanceof CircleBody) {
                const timeOfCollision = getClosestCircleVsCircleCollision(movingBody, collisionBody);

                if (!shouldConsiderTimeOfCollision(timeOfCollision, acc?.timeOfCollision)) return acc;

                if (willMovingBodyPenetrateCollisionBody(movingBody.pos, collisionBody.pos, movingBody.velocity, timeOfCollision)) {
                    return {
                        movingBody,
                        collisionBody,
                        timeOfCollision,
                    };
                }

                return acc;
            } else if (collisionBody instanceof RectBody) {
                // if a collision occurs with a circle side, then we don't need to check for corners
                const collisionEvent =
                    getCircleVsRectSideCollision(movingBody, collisionBody) ||
                    getCircleVsRectCornerCollision(movingBody, collisionBody);

                if (!collisionEvent) return acc;

                if (!acc || acc.timeOfCollision > collisionEvent.timeOfCollision) return collisionEvent;

                return acc;
            }
        } else if (movingBody instanceof RectBody) {
            if (collisionBody instanceof CircleBody) {
                // if a collision occurs with a circle side, then we don't need to check for corners
                const collisionEvent =
                    getRectVsCircleSideCollision(movingBody, collisionBody) ||
                    getRectVsCircleCornerCollision(movingBody, collisionBody);

                if (!collisionEvent) return acc;

                if (!acc || acc.timeOfCollision > collisionEvent.timeOfCollision) return collisionEvent;

                return acc;
            } else if (collisionBody instanceof RectBody) {
                const collisionEvent = getRectVsRectCollision(movingBody, collisionBody);
                
                if (!collisionEvent) return acc;

                if (!acc || acc.timeOfCollision > collisionEvent.timeOfCollision) return collisionEvent;

                return acc;
            }
        }
        
        throw new Error(ErrorMessage.unexpectedBodyType);
    }, null);
};

const getClosestCircleVsCircleCollision = (movingBody: CircleBody, collisionBody: CircleBody): TimeOfCollision => {
    const { velocity } = movingBody;

    const diffX = movingBody.x - collisionBody.x;
    const diffY = movingBody.y - collisionBody.y;

    const a = velocity.x ** 2 + velocity.y ** 2;
    const b = 2 * velocity.x * diffX + 2 * velocity.y * diffY;
    const c = diffX ** 2 + diffY ** 2 - (movingBody.radius + collisionBody.radius) ** 2;

    const roots = quadratic(a, b, c);

    return getClosestTimeOfCollision(roots);
};

const getClosestTimeOfCollision = (roots: number[]): TimeOfCollision => {
    return roots.reduce((acc, root) => {
        const roundedRoot = roundForFloatingPoint(root);

        if (roundedRoot < 0) return acc;

        if (acc === null || root < acc) {
            return root;
        }

        return acc;
    }, null);
};

const getCircleVsRectSideCollision = (circle: CircleBody, rect: RectBody): CircleVsRectCollisionEvent | null => {
    return getCircleVsRectPossibleSideCollisions(circle, rect).reduce<CircleVsRectCollisionEvent | null>(
        (acc, sideCollision) => {
            const { movingCircleBoundary, collisionRectBoundary, axisOfCollision } = sideCollision;

            const isXAlignedCollision = axisOfCollision === 'x';
            const rateOfChangeInAxis = isXAlignedCollision ? circle.velocity.x : circle.velocity.y;
            const rateOfChangeInOtherAxis = isXAlignedCollision ? circle.velocity.y : circle.velocity.x;

            const timeOfCollision = getTimeOfAxisAlignedCollision(
                movingCircleBoundary,
                collisionRectBoundary,
                rateOfChangeInAxis,
            );

            if (!shouldConsiderTimeOfCollision(timeOfCollision, acc?.timeOfCollision)) return acc;

            const otherAxisAtTimeOfCollision =
                (isXAlignedCollision ? circle.y : circle.x) + rateOfChangeInOtherAxis * timeOfCollision;

            const rectOtherAxisLowerBoundary = isXAlignedCollision ? rect.y0 : rect.x0;
            const rectOtherAxisUpperBoundary = isXAlignedCollision ? rect.y1 : rect.x1;

            // TODO: can extract to fn?
            if (
                rectOtherAxisLowerBoundary <= otherAxisAtTimeOfCollision &&
                otherAxisAtTimeOfCollision <= rectOtherAxisUpperBoundary
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

                if (willMovingBodyPenetrateCollisionBody(circle.pos, pointOfContact, circle.velocity, timeOfCollision)) {
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

const getCircleVsRectCornerTimeOfCollision = (circle: CircleBody, corner: Vector): TimeOfCollision => {
    const diffPos = Vector.subtract(circle.pos, corner);
    return getTimeOfCircleVsPointCollision(diffPos, circle.radius, circle.velocity);
};

const getTimeOfCircleVsPointCollision = (diffPos: Vector, radius: number, velocity: Vector): TimeOfCollision => {
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

const getRectVsCircleSideCollision = (rect: RectBody, circle: CircleBody): RectVsCircleCollisionEvent | null => {
    // TODO: may not need pointOfContact; revisit downstream usages
    return getRectVsCirclePossibleSideCollisions(rect, circle).reduce<RectVsCircleCollisionEvent | null>(
        (acc, sideCollision) => {
            const { axisOfCollision, movingRectBoundary, collisionCircleBoundary } = sideCollision;

            const isXAlignedCollision = axisOfCollision === 'x';
            const rateOfChangeInAxis = isXAlignedCollision ? rect.velocity.x : rect.velocity.y;
            const rateOfChangeInOtherAxis = isXAlignedCollision ? rect.velocity.y : rect.velocity.x;

            const timeOfCollision = getTimeOfAxisAlignedCollision(
                movingRectBoundary,
                collisionCircleBoundary,
                rateOfChangeInAxis,
            );

            if (!shouldConsiderTimeOfCollision(timeOfCollision, acc?.timeOfCollision)) return acc;

            const changeInOtherAxisAtTimeOfCollision = rateOfChangeInOtherAxis * timeOfCollision;
            const rectOtherAxisLowerBoundary = isXAlignedCollision ? rect.y0 : rect.x0;
            const rectOtherAxisUpperBoundary = isXAlignedCollision ? rect.y1 : rect.x1;

            const rectOtherAxisLowerBoundaryAtTimeOfCollision =
                rectOtherAxisLowerBoundary + changeInOtherAxisAtTimeOfCollision;
            const rectOtherAxisUpperBoundaryAtTimeOfCollision =
                rectOtherAxisUpperBoundary + changeInOtherAxisAtTimeOfCollision;

            const circleCenterOfAxisCollision = isXAlignedCollision ? circle.y : circle.x;

            // TODO: can extract to fn?
            if (
                rectOtherAxisLowerBoundaryAtTimeOfCollision <= circleCenterOfAxisCollision &&
                circleCenterOfAxisCollision <= rectOtherAxisUpperBoundaryAtTimeOfCollision
            ) {
                const circleOtherAxisValueAtTimeOfCollision = isXAlignedCollision
                    ? circle.y
                    : circle.x;

                const pointOfContact = isXAlignedCollision
                    ? {
                            x: collisionCircleBoundary,
                            y: circleOtherAxisValueAtTimeOfCollision,
                        }
                    : {
                            x: circleOtherAxisValueAtTimeOfCollision,
                            y: collisionCircleBoundary,
                        };

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
    return getRectCorners(rect).reduce<RectVsCircleCollisionEvent | null>((acc, corner, index) => {
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

const getRectVsCirclePossibleSideCollisions = (
    rect: RectBody,
    circle: CircleBody,
): RectVsCirclePossibleCollision[] => {
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

const getRectCornerVsCircleTimeOfCollision = (corner: Vector, circle: CircleBody, velocity: Vector): TimeOfCollision => {
    const diffPos = Vector.subtract(corner, circle.pos);
    return getTimeOfCircleVsPointCollision(diffPos, circle.radius, velocity);
};

const getRectCorners = (rect: RectBody): Vector[] => [
    new Vector(rect.x0, rect.y0), // top left
    new Vector(rect.x1, rect.y0), // top right
    new Vector(rect.x1, rect.y1), // bottom right
    new Vector(rect.x0, rect.y1), // bottom left
];

const getRectVsRectCollision = (movingBody: RectBody, collisionBody: RectBody): RectVsRectCollisionEvent | null => {
    return getRectVsRectPossibleCollisions(movingBody, collisionBody).reduce<RectVsRectCollisionEvent | null>((acc, possibleSideCollision) => {
        const { movingBoundary, collisionBoundary, axisOfCollision } = possibleSideCollision;

        const isXAlignedCollision = axisOfCollision === Axis.x;
        
        const pathToCollisionBoundary = isXAlignedCollision 
            ? new Vector(collisionBoundary - movingBody.x, 0) 
            : new Vector(0, collisionBoundary - movingBody.y);

        const pointOfContact = Vector.add(movingBody.pos, pathToCollisionBoundary);

        if (!isPointMovingTowardsPoint(movingBody.pos, movingBody.velocity, pointOfContact)) {
            return acc;
        }

        const changeInAxis = isXAlignedCollision ? movingBody.velocity.x : movingBody.velocity.y;
        
        const timeOfCollision = getTimeOfAxisAlignedCollision(movingBoundary, collisionBoundary, changeInAxis);

        if (!shouldConsiderTimeOfCollision(timeOfCollision, acc?.timeOfCollision)) return acc;

        const changeInOtherAxis = isXAlignedCollision ? movingBody.velocity.y : movingBody.velocity.x;

        const movingBodyLowerBoundary = isXAlignedCollision ? movingBody.y0 : movingBody.x0;
        const movingBodyUpperBoundary = isXAlignedCollision ? movingBody.y1 : movingBody.x1;

        const movingBodyLowerBoundaryAtCollision = movingBodyLowerBoundary + changeInOtherAxis * timeOfCollision;
        const movingBodyUpperBoundaryAtCollision = movingBodyUpperBoundary + changeInOtherAxis * timeOfCollision;

        const collisionBodyLowerBoundary = isXAlignedCollision ? collisionBody.y0 : collisionBody.x0;
        const collisionBodyUpperBoundary = isXAlignedCollision ? collisionBody.y1 : collisionBody.x1;

        if (hasOverlap(movingBodyLowerBoundaryAtCollision, movingBodyUpperBoundaryAtCollision, collisionBodyLowerBoundary, collisionBodyUpperBoundary)) {
            const exactOverlap = getExactOverlap(movingBodyLowerBoundaryAtCollision, movingBodyUpperBoundaryAtCollision, collisionBodyLowerBoundary, collisionBodyUpperBoundary);

            // when there's exact overlap, a rect may be grazing a corner..
            if (exactOverlap !== null) {
                const pointOfContact = isXAlignedCollision
                    ? new Vector(collisionBoundary, exactOverlap)
                    : new Vector(exactOverlap, collisionBoundary);

                // ..and we only want to consider a collision if the rect is moving towards the other rect
                if (!isPointMovingTowardsPoint(pointOfContact, movingBody.velocity, collisionBody.pos)) {
                    return acc;
                }

                return {
                    movingBody,
                    collisionBody,
                    timeOfCollision, 
                    pointOfContact,
                };
            }

            return {
                movingBody,
                collisionBody,
                timeOfCollision,
                pointOfContact, 
            };
        }

        return acc;
    }, null);
};

const getRectVsRectPossibleCollisions = (movingBody: RectBody, collisionBody: RectBody): RectVsRectPossibleCollision[] => {
    return [
        // right side -> left side
        {
            movingBoundary: movingBody.x1,
            collisionBoundary: collisionBody.x0,
            axisOfCollision: Axis.x,
        },
        // left side -> right side
        {
            movingBoundary: movingBody.x0,
            collisionBoundary: collisionBody.x1,
            axisOfCollision: Axis.x,
        },
        // bottom side -> top side
        {
            movingBoundary: movingBody.y1,
            collisionBoundary: collisionBody.y0,
            axisOfCollision: Axis.y,
        },
        // top side -> bottom side
        {
            movingBoundary: movingBody.y0,
            collisionBoundary: collisionBody.y1,
            axisOfCollision: Axis.y,
        },
    ]
};

const getTimeOfAxisAlignedCollision = (
    movingBoundary: number,
    approachingBoundary: number,
    changeInAxis: number,
): TimeOfCollision => {
    if (changeInAxis === 0) return null;

    return (approachingBoundary - movingBoundary) / changeInAxis;
};

const shouldConsiderTimeOfCollision = (
    timeOfCollision: TimeOfCollision,
    existingTimeOfCollision?: number,
): timeOfCollision is number => {
    if (!isWithinTimestep(timeOfCollision)) return false;
    return existingTimeOfCollision === undefined || existingTimeOfCollision > timeOfCollision;
};

const isWithinTimestep = (timeOfCollision: TimeOfCollision): timeOfCollision is number => {
    if (timeOfCollision === null) return false;
    return roundForFloatingPoint(timeOfCollision) >= 0 && timeOfCollision <= 1;
};

const willMovingBodyPenetrateCollisionBody = (movingPoint: Vector, collisionPoint: Vector, velocity: Vector, timeOfCollision: number): boolean => {
    const progression = Vector.mult(velocity, timeOfCollision);
    const pointAtTimeOfCollision = Vector.add(movingPoint, progression);
    return isPointMovingTowardsPoint(pointAtTimeOfCollision, velocity, collisionPoint);
};

const isPointMovingTowardsPoint = (movingPoint: Vector, velocity: Vector, collisionPoint: Vector): boolean => {
    const diffPos = Vector.subtract(collisionPoint, movingPoint);
    const dot = Vector.dot(velocity, diffPos);
    return roundForFloatingPoint(dot) > 0;
};
