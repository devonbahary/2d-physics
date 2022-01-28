import { CircleBody } from 'src/physics/bodies/CircleBody';
import { RectBody } from 'src/physics/bodies/RectBody';
import { Vector } from 'src/physics/Vector';
import { World } from 'src/physics/World';
import { GameEntity } from '../GameEntity';
import { scaleToPhysicsLength } from '../utilities';

const settings = {
    world: {
        tileWidth: 5,
        tileHeight: 5,
        noFriction: true,
    },
};

export const setupRails = (): [World, GameEntity] => {
    const world = new World({
        width: scaleToPhysicsLength(settings.world.tileWidth),
        height: scaleToPhysicsLength(settings.world.tileHeight),
        noFriction: settings.world.noFriction,
    });

    const player = new GameEntity(world, new CircleBody({ elasticity: 1 }));
    player.speed = 2;
    player.body.name = 'player';

    player.moveTo(new Vector(1, Math.floor(settings.world.tileHeight / 2)));

    world.addBody(player.body);

    const gameEntity = new GameEntity(world, new RectBody({ elasticity: 1 }));
    gameEntity.body.name = 'rect';
    world.addBody(gameEntity.body);
    gameEntity.moveTo(new Vector(3, 2));

    return [world, player];
};
