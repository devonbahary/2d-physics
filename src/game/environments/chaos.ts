import { CircleBody } from 'src/physics/bodies/CircleBody';
import { RectBody } from 'src/physics/bodies/RectBody';
import { Vector } from 'src/physics/Vector';
import { World } from 'src/physics/World';
import { GameEntity } from '../GameEntity';
import { scaleToPhysicsLength } from '../utilities';

const settings = {
    world: {
        tileWidth: 7,
        tileHeight: 7,
        noFriction: true,
    },
};

const NUM_CHARACTERS = 10;

const rand = (): boolean => Boolean(Math.round(Math.random()));

export const setupChaos = (): [World, GameEntity] => {
    const world = new World({
        width: scaleToPhysicsLength(settings.world.tileWidth),
        height: scaleToPhysicsLength(settings.world.tileHeight),
        noFriction: settings.world.noFriction,
    });

    const player = new GameEntity(world, new CircleBody({ elasticity: 1 }));
    player.body.name = 'player';

    player.moveTo(new Vector(Math.floor(settings.world.tileWidth / 2), Math.floor(settings.world.tileHeight / 2)));

    world.addBody(player.body);

    for (let i = 0; i < NUM_CHARACTERS; i++) {
        const body = rand() ? new CircleBody({ elasticity: 1 }) : new RectBody({ elasticity: 1 });

        const gameEntity = new GameEntity(world, body);
        gameEntity.moveTo(
            new Vector(
                Math.floor(Math.random() * settings.world.tileWidth),
                Math.floor(Math.random() * settings.world.tileHeight),
            ),
        );

        // if (rand()) {
        //     body.setFixed(true);
        // } else {
        gameEntity.move(new Vector(Math.random(), Math.random()));
        // }

        world.addBody(body);
    }

    return [world, player];
};
