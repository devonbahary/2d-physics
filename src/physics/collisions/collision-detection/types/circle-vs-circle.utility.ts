import { CircleBody } from 'src/physics/bodies/CircleBody';
import { quadratic } from 'src/physics/math/math.utilities';
import { getClosestTimeOfCollision } from '../collision-detection.utility';
import { TimeOfCollision } from '../types';

export const getClosestTimeOfCircleVsCircleCollision = (
    movingBody: CircleBody,
    collisionBody: CircleBody,
): TimeOfCollision => {
    const { velocity } = movingBody;

    const diffX = movingBody.x - collisionBody.x;
    const diffY = movingBody.y - collisionBody.y;

    const a = velocity.x ** 2 + velocity.y ** 2;
    const b = 2 * velocity.x * diffX + 2 * velocity.y * diffY;
    const c = diffX ** 2 + diffY ** 2 - (movingBody.radius + collisionBody.radius) ** 2;

    const roots = quadratic(a, b, c);

    return getClosestTimeOfCollision(roots);
};
