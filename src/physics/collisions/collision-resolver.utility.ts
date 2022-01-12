import { Body } from "../bodies/types";
import { CircleBody } from "../bodies/CircleBody";
import { ErrorMessage } from "../constants";
import { Vector } from "../Vector";

export const getFixedCollisionFinalVelocity = (movingBody: Body, collisionBody: Body): Vector => {
    if (movingBody instanceof CircleBody) {
        if (collisionBody instanceof CircleBody) {
            const diffPos = Vector.subtract(movingBody.pos, collisionBody.pos);
            const redirectedVector = Vector.rescale(diffPos, Vector.magnitude(movingBody.velocity));
            const cor = getCoefficientOfRestitution(movingBody, collisionBody);
            return adjustForElasticity(redirectedVector, cor);
        }
    }
    throw new Error(ErrorMessage.unexpectedBodyType);
};

export const getCollisionFinalVelocities = (movingBody: Body, collisionBody: Body): [Vector, Vector] => {
    if (movingBody instanceof CircleBody) {
        if (collisionBody instanceof CircleBody) {
            const diffPos = Vector.subtract(movingBody.pos, collisionBody.pos);
            const [ finalVelocityA, finalVelocityB ] = getElasticCollisionFinalVelocities(movingBody, collisionBody, diffPos);
            
            const cor = getCoefficientOfRestitution(movingBody, collisionBody);
            
            return [
                adjustForElasticity(finalVelocityA, cor),
                adjustForElasticity(finalVelocityB, cor),
            ];
        }
    }
    throw new Error(ErrorMessage.unexpectedBodyType);
};

const adjustForElasticity = (vector: Vector, coefficientOfRestitution: number): Vector => {
    return Vector.rescale(vector, Vector.magnitude(vector) * coefficientOfRestitution);
}

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
