import { Body } from '../bodies/types';
import { ErrorMessage } from '../constants';
import { Vector } from '../Vector';
import { CollisionEvent } from './types';
import {
    isCircleVsCircleCollisionEvent,
    isCircleVsRectCollisionEvent,
    isRectVsCircleCollisionEvent,
    isRectVsRectCollisionEvent,
} from './collision-event.utility';

export const getFixedCollisionResolvedVelocity = (collisionEvent: CollisionEvent): Vector => {
    const finalVelocity = getFixedCollisionFinalVelocity(collisionEvent);
    return adjustForElasticity(finalVelocity, collisionEvent);
};

const getFixedCollisionFinalVelocity = (collisionEvent: CollisionEvent): Vector => {
    const { movingBody, collisionBody } = collisionEvent;

    if (isCircleVsCircleCollisionEvent(collisionEvent)) {
        const diffPos = Vector.subtract(movingBody.pos, collisionBody.pos);
        return Vector.rescale(diffPos, Vector.magnitude(movingBody.velocity));
    }

    if (isCircleVsRectCollisionEvent(collisionEvent)) {
        const { pointOfContact } = collisionEvent;
        return getBounceVectorOffFixedPoint(movingBody, pointOfContact);
    }

    if (isRectVsCircleCollisionEvent(collisionEvent)) {
        const diffPos = Vector.subtract(movingBody.pos, collisionBody.pos);
        return Vector.rescale(diffPos, Vector.magnitude(movingBody.velocity));
    }

    if (isRectVsRectCollisionEvent(collisionEvent)) {
        const { pointOfContact } = collisionEvent;
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

export const getCollisionResolvedVelocities = (collisionEvent: CollisionEvent): [Vector, Vector] => {
    const [finalVelocityA, finalVelocityB] = getCollisionFinalVelocities(collisionEvent);

    return [adjustForElasticity(finalVelocityA, collisionEvent), adjustForElasticity(finalVelocityB, collisionEvent)];
};

const getCollisionFinalVelocities = (collisionEvent: CollisionEvent): [Vector, Vector] => {
    const { movingBody, collisionBody } = collisionEvent;

    if (isCircleVsCircleCollisionEvent(collisionEvent)) {
        const diffPos = Vector.subtract(movingBody.pos, collisionBody.pos);
        return getElasticCollisionFinalVelocities(movingBody, collisionBody, diffPos);
    }

    if (isCircleVsRectCollisionEvent(collisionEvent)) {
        const { pointOfContact } = collisionEvent;
        const diffPosPointOfContact = Vector.subtract(movingBody.pos, pointOfContact);

        return getElasticCollisionFinalVelocities(movingBody, collisionBody, diffPosPointOfContact);
    }

    if (isRectVsCircleCollisionEvent(collisionEvent)) {
        const { pointOfContact } = collisionEvent;
        const diffPosPointOfContact = Vector.subtract(pointOfContact, collisionBody.pos);

        return getElasticCollisionFinalVelocities(movingBody, collisionBody, diffPosPointOfContact);
    }

    if (isRectVsRectCollisionEvent(collisionEvent)) {
        const { pointOfContact } = collisionEvent;
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

const adjustForElasticity = (vector: Vector, collisionEvent: CollisionEvent): Vector => {
    const cor = getCoefficientOfRestitution(collisionEvent);
    return Vector.rescale(vector, Vector.magnitude(vector) * cor);
};

const getCoefficientOfRestitution = (collisionEvent: CollisionEvent): number => {
    const { movingBody, collisionBody } = collisionEvent;
    return Math.min(movingBody.elasticity, collisionBody.elasticity);
};
