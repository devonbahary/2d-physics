import { RectBody } from 'src/physics/bodies/RectBody';
import { getExactOverlap, hasOverlap } from 'src/physics/math/math.utilities';
import { Vector } from 'src/physics/Vector';
import { RectVsRectCollisionEvent } from '../../types';
import { Axis, RectVsRectPossibleCollision } from '../types';
import { getTimeOfAxisAlignedCollision, isPointMovingTowardsPoint, shouldConsiderTimeOfCollision } from '../utility';

export const getRectVsRectCollisionEvent = (
    movingBody: RectBody,
    collisionBody: RectBody,
): RectVsRectCollisionEvent | null => {
    return getRectVsRectPossibleCollisions(movingBody, collisionBody).reduce<RectVsRectCollisionEvent | null>(
        (acc, possibleSideCollision) => {
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

            if (
                hasOverlap(
                    movingBodyLowerBoundaryAtCollision,
                    movingBodyUpperBoundaryAtCollision,
                    collisionBodyLowerBoundary,
                    collisionBodyUpperBoundary,
                )
            ) {
                const exactOverlap = getExactOverlap(
                    movingBodyLowerBoundaryAtCollision,
                    movingBodyUpperBoundaryAtCollision,
                    collisionBodyLowerBoundary,
                    collisionBodyUpperBoundary,
                );

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
        },
        null,
    );
};

const getRectVsRectPossibleCollisions = (
    movingBody: RectBody,
    collisionBody: RectBody,
): RectVsRectPossibleCollision[] => {
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
    ];
};
