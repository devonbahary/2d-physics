import { CircleBody } from 'src/physics/bodies/CircleBody';
import { RectBody } from 'src/physics/bodies/RectBody';
import { Body } from 'src/physics/bodies/types';
import { ErrorMessage } from 'src/physics/constants';
import { Vector } from 'src/physics/Vector';

export const gamePosToPhysicsPos = (pos: Vector, body: Body): Vector => {
    if (body instanceof CircleBody) {
        return new Vector(pos.x * 24 + body.radius, pos.y * 24 + body.radius);
    } else if (body instanceof RectBody) {
        return new Vector(pos.x * 24 + body.width / 2, pos.y * 24 + body.height / 2);
    }

    throw new Error(ErrorMessage.unexpectedBodyType);
};

export const physicsPosToScreenPos = (body: Body): Vector => {
    if (body instanceof CircleBody) {
        return new Vector(body.pos.x - body.radius, body.pos.y - body.radius);
    } else if (body instanceof RectBody) {
        return new Vector(body.pos.x - body.width / 2, body.pos.y - body.height / 2);
    }

    throw new Error(ErrorMessage.unexpectedBodyType);
};
