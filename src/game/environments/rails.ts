import { CircleBody } from 'src/physics/bodies/CircleBody';
import { RectBody } from 'src/physics/bodies/RectBody';
import { Vector } from 'src/physics/Vector';
import { World } from 'src/physics/World';
import { GameEntity } from '../GameEntity';
import { scaleToPhysicsLength } from '../utilities';
import { EnvironmentGenerator } from './types';

const TILE_WIDTH = 5;
const TILE_HEIGHT = 5;

export const setupRails: EnvironmentGenerator = () => {
    const world = new World({
        width: scaleToPhysicsLength(TILE_WIDTH),
        height: scaleToPhysicsLength(TILE_HEIGHT),
        options: {
            noFriction: false,
        },
    });

    const player = new GameEntity(world, new CircleBody({ elasticity: 1 }));
    player.body.name = 'player';

    player.moveTo(new Vector(1, Math.floor(TILE_HEIGHT / 2)));

    world.addBody(player.body);

    const gameEntity = new GameEntity(world, new RectBody({ elasticity: 1 }));
    gameEntity.body.name = 'rect';
    world.addBody(gameEntity.body);
    gameEntity.moveTo(new Vector(3, 2));

    return { world, player };
};
