import { Body } from '../bodies/types';
import { ErrorMessage } from '../constants';
import { Vector } from '../Vector';
import { AdjacentCollision, Collision } from './types';
import {
    isCircleVsCircleCollision,
    isCircleVsRectCollision,
    isRectVsCircleCollision,
    isRectVsRectCollision,
} from './collision.utility';

export const getFixedCollisionResolvedVelocity = (collision: Collision): Vector => {
    const finalVelocity = getFixedCollisionFinalVelocity(collision);
    return adjustForElasticity(finalVelocity, collision);
};

const getFixedCollisionFinalVelocity = (collision: Collision): Vector => {
    const { movingBody, collisionBody } = collision;

    if (isCircleVsCircleCollision(collision)) {
        const diffPos = Vector.subtract(movingBody.pos, collisionBody.pos);
        return Vector.rescale(diffPos, Vector.magnitude(movingBody.velocity));
    }

    if (isCircleVsRectCollision(collision)) {
        const { pointOfContact } = collision;
        return getBounceVectorOffFixedPoint(movingBody, pointOfContact);
    }

    if (isRectVsCircleCollision(collision)) {
        const diffPos = Vector.subtract(movingBody.pos, collisionBody.pos);
        return Vector.rescale(diffPos, Vector.magnitude(movingBody.velocity));
    }

    if (isRectVsRectCollision(collision)) {
        const { pointOfContact } = collision;
        return getBounceVectorOffFixedPoint(movingBody, pointOfContact);
    }

    throw new Error(ErrorMessage.unexpectedBodyType);
};

// https://www.youtube.com/watch?v=naaeH1qbjdQ
const getBounceVectorOffFixedPoint = (movingBody: Body, point: Vector): Vector => {
    const { velocity } = movingBody;
    const diffPos = Vector.subtract(movingBody.pos, point);
    // <point of intersection> + v - 2 proj n (v)
    const tangentOfContact = Vector.normal(diffPos);
    const normalOfContact = Vector.normal(tangentOfContact);
    const proj = Vector.proj(velocity, normalOfContact);
    return Vector.subtract(velocity, Vector.mult(proj, 2));
};

export const getCollisionResolvedVelocities = (collision: Collision): [Vector, Vector] => {
    const [finalVelocityA, finalVelocityB] = getCollisionFinalVelocities(collision);

    return [adjustForElasticity(finalVelocityA, collision), adjustForElasticity(finalVelocityB, collision)];
};

const getCollisionFinalVelocities = (collision: Collision): [Vector, Vector] => {
    const { movingBody, collisionBody } = collision;

    if (isCircleVsCircleCollision(collision)) {
        const diffPos = Vector.subtract(movingBody.pos, collisionBody.pos);
        return getElasticCollisionFinalVelocities(movingBody, collisionBody, diffPos);
    }

    if (isCircleVsRectCollision(collision)) {
        const { pointOfContact } = collision;
        const diffPosPointOfContact = Vector.subtract(movingBody.pos, pointOfContact);

        return getElasticCollisionFinalVelocities(movingBody, collisionBody, diffPosPointOfContact);
    }

    if (isRectVsCircleCollision(collision)) {
        const { pointOfContact } = collision;
        const diffPosPointOfContact = Vector.subtract(pointOfContact, collisionBody.pos);

        return getElasticCollisionFinalVelocities(movingBody, collisionBody, diffPosPointOfContact);
    }

    if (isRectVsRectCollision(collision)) {
        const { pointOfContact } = collision;
        const diffPosPointOfContact = Vector.subtract(movingBody.pos, pointOfContact);

        return getElasticCollisionFinalVelocities(movingBody, collisionBody, diffPosPointOfContact);
    }

    throw new Error(ErrorMessage.unexpectedBodyType);
};

const getElasticCollisionFinalVelocities = (bodyA: Body, bodyB: Body, diffPos: Vector): [Vector, Vector] => {
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

const adjustForElasticity = (vector: Vector, collision: Collision): Vector => {
    const cor = getCoefficientOfRestitution(collision);
    return Vector.rescale(vector, Vector.magnitude(vector) * cor);
};

const getCoefficientOfRestitution = (collision: Collision): number => {
    const { movingBody, collisionBody } = collision;
    return Math.min(movingBody.elasticity, collisionBody.elasticity);
};

export const getTangentialMovementVector = (collision: AdjacentCollision): Vector => {
    if (isCircleVsCircleCollision(collision)) {
        const { movingBody, collisionBody } = collision;

        const diffPos = Vector.subtract(collisionBody.pos, movingBody.pos);
        const tangentOfContact = Vector.normal(diffPos);

        return Vector.proj(movingBody.velocity, tangentOfContact);
    } else if (isCircleVsRectCollision(collision)) {
        const { movingBody, pointOfContact } = collision;

        const diffPos = Vector.subtract(pointOfContact, movingBody.pos);
        const tangentOfContact = Vector.normal(diffPos);

        return Vector.proj(movingBody.velocity, tangentOfContact);
    } else if (isRectVsCircleCollision(collision)) {
        const { movingBody, collisionBody, pointOfContact } = collision;

        const diffPos = Vector.subtract(collisionBody.pos, pointOfContact);
        const tangentOfContact = Vector.normal(diffPos);

        return Vector.proj(movingBody.velocity, tangentOfContact);
    } else if (isRectVsRectCollision(collision)) {
        const { movingBody, pointOfContact } = collision;

        const diffPos = Vector.subtract(pointOfContact, movingBody.pos);
        const tangentOfContact = Vector.normal(diffPos);

        return Vector.proj(movingBody.velocity, tangentOfContact);
    }

    throw new Error(ErrorMessage.unexpectedBodyType);
};
