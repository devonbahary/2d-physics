import { CircleBody } from 'src/physics/bodies/CircleBody';
import { RectBody } from 'src/physics/bodies/RectBody';
import { Circle } from 'src/physics/bodies/shapes/Circle';
import { Rect } from 'src/physics/bodies/shapes/Rect';
import { Body, Shape } from 'src/physics/bodies/types';
import { ErrorMessage } from 'src/physics/constants';
import { Vector } from 'src/physics/Vector';

export const gamePosToWorldPos = (pos: Vector, body: Body): Vector => {
    if (body instanceof CircleBody) {
        return new Vector(pos.x * 24 + body.radius, pos.y * 24 + body.radius);
    } else if (body instanceof RectBody) {
        return new Vector(pos.x * 24 + body.width / 2, pos.y * 24 + body.height / 2);
    }

    throw new Error(ErrorMessage.unexpectedBodyType);
};

export const gamePosToSpritePos = (shape: Shape): Vector => {
    if (shape instanceof Circle) {
        return new Vector(shape.pos.x - shape.radius, shape.pos.y - shape.radius);
    } else if (shape instanceof Rect) {
        return new Vector(shape.pos.x - shape.width / 2, shape.pos.y - shape.height / 2);
    }

    throw new Error(ErrorMessage.unexpectedBodyType);
};

export const scaleToGameLength = (physicsLength: number): number => physicsLength / 24;

export const scaleToPhysicsLength = (gameLength: number): number => gameLength * 24;
