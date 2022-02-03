import { CircleBody } from 'src/physics/bodies/CircleBody';
import { RectBody } from 'src/physics/bodies/RectBody';
import { Vector } from 'src/physics/Vector';
import { World } from 'src/physics/World';
import { GameEntity } from '../GameEntity';
import { scaleToPhysicsLength } from '../utilities';

const TILE_WIDTH = 5;
const TILE_HEIGHT = 5;
const NO_FRICTION = true;

export const setupRails = (): [World, GameEntity] => {
    const world = new World({
        width: scaleToPhysicsLength(TILE_WIDTH),
        height: scaleToPhysicsLength(TILE_HEIGHT),
        options: {
            noFriction: NO_FRICTION,
        },
    });

    const player = new GameEntity(world, new CircleBody({ elasticity: 1 }));
    player.speed = 2;
    player.body.name = 'player';

    player.moveTo(new Vector(1, Math.floor(TILE_HEIGHT / 2)));

    world.addBody(player.body);

    const gameEntity = new GameEntity(world, new RectBody({ elasticity: 1 }));
    gameEntity.body.name = 'rect';
    world.addBody(gameEntity.body);
    gameEntity.moveTo(new Vector(3, 2));

    return [world, player];
};
