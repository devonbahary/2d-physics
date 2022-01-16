import { Body } from '../bodies/types';
import { CircleBody } from '../bodies/CircleBody';
import { ErrorMessage } from '../constants';
import { Vector } from '../Vector';
import { RectBody } from '../bodies/RectBody';
import { CircleVsCircleCollisionEvent, CircleVsRectCollisionEvent, CollisionEvent } from './types';

export const getFixedCollisionRedirectedVelocity = (collisionEvent: CollisionEvent): Vector => {
    const { movingBody, collisionBody } = collisionEvent;

    if (isCircleVsCircleCollisionEvent(collisionEvent)) {
        const diffPos = Vector.subtract(movingBody.pos, collisionBody.pos);
        const redirectedVector = Vector.rescale(diffPos, Vector.magnitude(movingBody.velocity));
        const cor = getCoefficientOfRestitution(movingBody, collisionBody);
        return adjustForElasticity(redirectedVector, cor);
    }

    if (isCircleVsRectCollisionEvent(collisionEvent)) {
        const { pointOfContact } = collisionEvent;
        const redirectedVector = getBounceVectorOffFixedPoint(movingBody, pointOfContact);
        const cor = getCoefficientOfRestitution(movingBody, collisionBody);
        return adjustForElasticity(redirectedVector, cor);
    }

    throw new Error(ErrorMessage.unexpectedBodyType);
};

export const getCollisionFinalVelocities = (collisionEvent: CollisionEvent): [Vector, Vector] => {
    const { movingBody, collisionBody } = collisionEvent;
    if (isCircleVsCircleCollisionEvent(collisionEvent)) {
        const diffPos = Vector.subtract(movingBody.pos, collisionBody.pos);
        const [finalVelocityA, finalVelocityB] = getElasticCollisionFinalVelocities(movingBody, collisionBody, diffPos);

        const cor = getCoefficientOfRestitution(movingBody, collisionBody);

        return [adjustForElasticity(finalVelocityA, cor), adjustForElasticity(finalVelocityB, cor)];
    }

    if (isCircleVsRectCollisionEvent(collisionEvent)) {
        const { pointOfContact } = collisionEvent;

        const diffPos = Vector.subtract(movingBody.pos, collisionBody.pos);
        const [, finalVelocityB] = getElasticCollisionFinalVelocities(movingBody, collisionBody, diffPos);

        const diffPosPointOfContact = Vector.subtract(movingBody.pos, pointOfContact);
        const [finalVelocityA] = getElasticCollisionFinalVelocities(movingBody, collisionBody, diffPosPointOfContact);

        const cor = getCoefficientOfRestitution(movingBody, collisionBody);

        return [adjustForElasticity(finalVelocityA, cor), adjustForElasticity(finalVelocityB, cor)];
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

const adjustForElasticity = (vector: Vector, coefficientOfRestitution: number): Vector => {
    return Vector.rescale(vector, Vector.magnitude(vector) * coefficientOfRestitution);
};

const getCoefficientOfRestitution = (bodyA: Body, bodyB: Body): number => {
    return Math.min(bodyA.elasticity, bodyB.elasticity);
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

export const isCircleVsCircleCollisionEvent = (
    collisionEvent: CollisionEvent,
): collisionEvent is CircleVsCircleCollisionEvent => {
    const { movingBody, collisionBody } = collisionEvent;
    return movingBody instanceof CircleBody && collisionBody instanceof CircleBody;
};

export const isCircleVsRectCollisionEvent = (
    collisionEvent: CollisionEvent,
): collisionEvent is CircleVsRectCollisionEvent => {
    const { movingBody, collisionBody } = collisionEvent;
    return movingBody instanceof CircleBody && collisionBody instanceof RectBody;
};
