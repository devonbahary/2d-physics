import { CircleBody } from '../bodies/CircleBody';
import { RectBody } from '../bodies/RectBody';
import { Body } from '../bodies/types';
import { ErrorMessage } from '../constants';
import { quadratic, roundForFloatingPoint } from '../math/math.utilities';
import { Vector } from '../Vector';
import { CollisionEvent } from './types';

type TimeOfCollision = number | null;

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
                const isGraze = !isBodyMovingTowardsBody(movingBody, collisionBody);

                movingBody.moveTo(currentPos); // reset

                if (isGraze) return acc; // graze is not a collision

                return {
                    collisionBody,
                    timeOfCollision,
                };
            }
        }

        return acc;
    }, null);
};

const isWithinTimestep = (timeOfCollision: TimeOfCollision): timeOfCollision is number => {
    if (timeOfCollision === null) return false;
    return roundForFloatingPoint(timeOfCollision) >= 0 && timeOfCollision <= 1;
}

const getClosestCircleVsCircleCollision = (movingBody: CircleBody, collisionBody: CircleBody): TimeOfCollision => {
    const { velocity } = movingBody;
    
    const diffX = movingBody.x - collisionBody.x;
    const diffY = movingBody.y - collisionBody.y;

    const a = velocity.x ** 2 + velocity.y ** 2;
    const b = 2 * velocity.x * diffX + 2 * velocity.y * diffY;
    const c = diffX ** 2 + diffY ** 2 - (movingBody.radius + collisionBody.radius) ** 2;

    const roots = quadratic(a, b, c);
    
    return getClosestTimeOfCollision(roots);
}

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

// TODO: should be point moving towards point? sometimes the body positioning is not relevant and the point of contact is
export const isBodyMovingTowardsBody = (movingBody: Body, collisionBody: Body): boolean => {
    if (movingBody instanceof CircleBody) {
        if (collisionBody instanceof CircleBody) {
            const diffPos = Vector.subtract(collisionBody.pos, movingBody.pos);
            const dot = Vector.dot(movingBody.velocity, diffPos);
            return roundForFloatingPoint(dot) > 0;
        }
    }

    throw new Error(ErrorMessage.unexpectedBodyType);
};

// TODO: will use this in the future
export const areIntersecting = (bodyA: Body, bodyB: Body): boolean => {
    if (bodyA instanceof CircleBody) {
        if (bodyB instanceof CircleBody) {
            return false; // TODO
        } else if (bodyB instanceof RectBody) {
            return areCircleAndRectIntersecting(bodyA, bodyB);
        }
    } else if (bodyA instanceof RectBody) {
        if (bodyB instanceof RectBody) {
            return false; // TODO
        } else if (bodyA instanceof CircleBody) {
            return areCircleAndRectIntersecting(bodyB, bodyA);
        }
    }
    throw new Error(ErrorMessage.unexpectedBodyType);
};

// https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
const areCircleAndRectIntersecting = (circle: CircleBody, rect: RectBody): boolean => {
    const diffX = Math.abs(rect.x - circle.x);
    const diffY = Math.abs(rect.y - circle.y);

    const { width, height } = rect;
    const { radius } = circle;

    if (diffX >= width / 2 + radius || diffY >= height / 2 + radius) {
        return false;
    }

    if (diffX < width / 2 || diffY < height / 2) {
        return true;
    }

    const distanceToRectCorner = (diffX - width / 2) ** 2 + (diffY - height / 2) ** 2;

    return distanceToRectCorner < radius ** 2;
};
