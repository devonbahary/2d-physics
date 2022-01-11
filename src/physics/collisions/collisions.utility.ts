import { CircleBody } from '../bodies/CircleBody';
import { RectBody } from '../bodies/RectBody';
import { Body } from '../bodies/types';
import { ErrorMessage } from '../constants';
import { roundForFloatingPoint } from '../math/math.utilities';
import { Vector } from '../Vector';

const quadratic = (a: number, b: number, c: number): number[] => {
    const roots = [(-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a), (-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a)];

    return roots.filter((r) => !isNaN(r));
};

const getClosestTimeOfCollision = (roots: number[]): number | null => {
    return roots.reduce((acc, root) => {
        const roundedRoot = roundForFloatingPoint(root);

        if (roundedRoot < 0) return acc;

        if (acc === null || roundedRoot < acc) {
            return root;
        }

        return acc;
    }, null);
};

export const getTimeOfCollision = (bodyA: Body, bodyB: Body): number | null => {
    if (bodyA instanceof CircleBody) {
        if (bodyB instanceof CircleBody) {
            const { velocity } = bodyA;

            const diffX = bodyA.x - bodyB.x;
            const diffY = bodyA.y - bodyB.y;

            const a = velocity.x ** 2 + velocity.y ** 2;
            const b = 2 * velocity.x * diffX + 2 * velocity.y * diffY;
            const c = diffX ** 2 + diffY ** 2 - (bodyA.radius + bodyB.radius) ** 2;

            const roots = quadratic(a, b, c);
            return getClosestTimeOfCollision(roots);
        }
    }

    return null;

    throw new Error(ErrorMessage.unexpectedBodyType);
};

export const isBodyMovingTowardsBody = (movingBody: Body, collisionBody: Body): boolean => {
    if (movingBody instanceof CircleBody) {
        if (collisionBody instanceof CircleBody) {
            const diffPos = Vector.subtract(collisionBody.pos, movingBody.pos);
            const dot = Vector.dot(movingBody.velocity, diffPos);
            return roundForFloatingPoint(dot) > 0;
        }
        throw new Error(`have not implemented circle vs rect collisions yet`);
    }

    throw new Error(`have not implemented rectangle vs any collisons yet`);
};

export const getFinalCollisionVelocities = (bodyA: Body, bodyB: Body): [Vector, Vector] => {
    if (bodyA instanceof CircleBody) {
        if (bodyB instanceof CircleBody) {
            const diffPos = Vector.subtract(bodyA.pos, bodyB.pos);
            return getCollisionFinalVelocities(bodyA, bodyB, diffPos);
        }
    }
    throw new Error(`can't resolve collision`);
};

const getCollisionFinalVelocities = (bodyA: Body, bodyB: Body, diffPos: Vector): [Vector, Vector] => {
    const { mass: mA, velocity: vA } = bodyA;
    const { mass: mB, velocity: vB } = bodyB;

    /*
        2D Elastic Collision (angle-free)
        https://stackoverflow.com/questions/35211114/2d-elastic-ball-collision-physics

                            mass scalar      dot product (scalar)        magnitude        pos diff vector
            vA` = vA - (2mB / (mA + mB)) * (<vA - vB | xA - xB> / (|| xA - xB || ** 2)) * (xA - xB)
              where v = velocity
                    m = mass
                    x = position (at time of collision)
    */

    const diffVel = Vector.subtract(vA, vB);
    const massScalar = (2 * mB) / (mA + mB);
    const coefficient = massScalar * (Vector.dot(diffVel, diffPos) / Vector.magnitude(diffPos) ** 2);

    const finalVelocityA = Vector.subtract(vA, Vector.mult(diffPos, coefficient));

    /* 
        conservation of momentum
            mAvA` + mBvB` = mAvA + mBvB
                            sum
            vB` = (mAvA + mBvB - mAvA`) / mB
    */

    const sum = Vector.subtract(Vector.add(Vector.mult(vA, mA), Vector.mult(vB, mB)), Vector.mult(finalVelocityA, mA));
    const finalVelocityB = Vector.divide(sum, mB);

    return [Vector.roundForFloatingPoint(finalVelocityA), Vector.roundForFloatingPoint(finalVelocityB)];
};

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
