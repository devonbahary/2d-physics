import { CircleBody } from '../bodies/CircleBody';
import { RectBody } from '../bodies/RectBody';
import { Body } from '../bodies/types';
import { quadratic, roundForFloatingPoint } from '../math/math.utilities';
import { Vector } from '../Vector';
import { CircleVsRectCollisionEvent, CollisionEvent } from './types';

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

export const getCollisionEvent = (movingBody: Body, worldBodies: Body[]): CollisionEvent | null => {
    return worldBodies.reduce<CollisionEvent | null>((acc, collisionBody) => {
        if (movingBody === collisionBody) return acc;

        if (movingBody instanceof CircleBody) {
            if (collisionBody instanceof CircleBody) {
                const timeOfCollision = getClosestCircleVsCircleCollision(movingBody, collisionBody);

                if (!isWithinTimestep(timeOfCollision)) return acc;

                // skip if already found sooner collision event
                if (acc && acc.timeOfCollision < timeOfCollision) return acc;

                // find out if collision at the point of impact will intersect the two bodies or is just a graze
                const currentPos = movingBody.pos;

                movingBody.progressMovement(timeOfCollision);

                if (isBodyMovingTowardsPoint(movingBody, collisionBody)) {
                    movingBody.moveTo(currentPos); // reset

                    return {
                        movingBody,
                        collisionBody,
                        timeOfCollision,
                    };
                }

                movingBody.moveTo(currentPos); // reset
                return acc;
            } else if (collisionBody instanceof RectBody) {
                // if a collision occurs with a circle side, then we don't need to check for corners
                const rectCollision =
                    getCircleVsRectSideCollision(movingBody, collisionBody) ||
                    getCircleVsRectCornerCollision(movingBody, collisionBody);

                if (!rectCollision) return acc;

                if (!acc) return rectCollision;

                if (acc.timeOfCollision < rectCollision.timeOfCollision) return acc;

                return rectCollision;
            }
        }

        return acc;
    }, null);
};

const isWithinTimestep = (timeOfCollision: TimeOfCollision): timeOfCollision is number => {
    if (timeOfCollision === null) return false;
    return roundForFloatingPoint(timeOfCollision) >= 0 && timeOfCollision <= 1;
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
    const { velocity } = circle;

    return getCircleVsRectPossibleSideCollisions(circle, rect).reduce<CircleVsRectCollisionEvent | null>(
        (acc, sideCollision) => {
            const { movingCircleBoundary, collisionRectBoundary, axisOfCollision } = sideCollision;

            const isXAlignedCollision = axisOfCollision === 'x';
            const rateOfChangeInAxis = isXAlignedCollision ? velocity.x : velocity.y;

            const timeOfCollision = getTimeOfAxisAlignedCollision(
                movingCircleBoundary,
                collisionRectBoundary,
                rateOfChangeInAxis,
            );

            if (!isWithinTimestep(timeOfCollision)) return acc;

            // skip if already found sooner collision event
            if (acc && acc.timeOfCollision < timeOfCollision) return acc;

            // find out if collision at the point of impact will intersect the two bodies or is just a graze
            const currentPos = circle.pos;

            circle.progressMovement(timeOfCollision);

            const otherAxisAtTimeOfCollision = isXAlignedCollision ? circle.y : circle.x;

            const rectOtherAxisLowerBoundary = isXAlignedCollision ? rect.y0 : rect.x0;
            const rectOtherAxisUpperBoundary = isXAlignedCollision ? rect.y1 : rect.x1;

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

                if (isBodyMovingTowardsPoint(circle, pointOfContact)) {
                    circle.moveTo(currentPos);

                    return {
                        movingBody: circle,
                        collisionBody: rect,
                        timeOfCollision,
                        pointOfContact,
                    };
                }
            }

            circle.moveTo(currentPos);

            return acc;
        },
        null,
    );
};

const getCircleVsRectCornerCollision = (circle: CircleBody, rect: RectBody): CircleVsRectCollisionEvent | null => {
    return getRectCorners(rect).reduce<CircleVsRectCollisionEvent | null>((acc, corner) => {
        const timeOfCollision = getCircleVsRectCornerTimeOfCollision(circle, corner);

        if (!isWithinTimestep(timeOfCollision)) return acc;

        // skip if already found sooner collision event
        if (acc && acc.timeOfCollision < timeOfCollision) return acc;

        const currentPos = circle.pos;
        circle.progressMovement(timeOfCollision);

        if (isBodyMovingTowardsPoint(circle, corner)) {
            circle.moveTo(currentPos);

            return {
                movingBody: circle,
                collisionBody: rect,
                timeOfCollision,
                pointOfContact: corner,
            };
        }

        circle.moveTo(currentPos);

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

const getRectCorners = (rect: RectBody): Vector[] => [
    new Vector(rect.x0, rect.y0), // top left
    new Vector(rect.x1, rect.y0), // top right
    new Vector(rect.x1, rect.y1), // bottom right
    new Vector(rect.x0, rect.y1), // bottom left
];

const getTimeOfAxisAlignedCollision = (
    movingBoundary: number,
    approachingBoundary: number,
    changeInAxis: number,
): TimeOfCollision => {
    if (changeInAxis === 0) return null;

    return (approachingBoundary - movingBoundary) / changeInAxis;
};

const isBodyMovingTowardsPoint = (movingBody: Body, point: Vector): boolean => {
    const diffPos = Vector.subtract(point, movingBody.pos);
    const dot = Vector.dot(movingBody.velocity, diffPos);
    return roundForFloatingPoint(dot) > 0;
};
