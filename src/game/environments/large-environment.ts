import { CircleBody } from 'src/physics/bodies/CircleBody';
import { RectBody } from 'src/physics/bodies/RectBody';
import { Vector } from 'src/physics/Vector';
import { World } from 'src/physics/World';
import { GameEntity } from '../GameEntity';
import { scaleToPhysicsLength } from '../utilities';
import { EnvironmentGenerator } from './types';

const TILE_WIDTH = 50;
const TILE_HEIGHT = 50;
const NO_FRICTION = true;

const NUM_CHARACTERS = 500;

const rand = (): boolean => Boolean(Math.round(Math.random()));

export const setupLargeEnvironment: EnvironmentGenerator = () => {
    const world = new World({
        width: scaleToPhysicsLength(TILE_WIDTH),
        height: scaleToPhysicsLength(TILE_HEIGHT),
        options: {
            noFriction: NO_FRICTION,
            useQuadTree: true,
        },
        quadTreeOptions: {
            maxBodiesInLeaf: 32,
        },
    });

    const rendererOptions = {
        renderQuadTree: true,
    };

    const player = new GameEntity(world, new CircleBody({ elasticity: 1 }));
    player.body.name = 'player';

    player.moveTo(new Vector(Math.floor(TILE_WIDTH / 2), Math.floor(TILE_HEIGHT / 2)));

    world.addBody(player.body);

    for (let i = 0; i < NUM_CHARACTERS; i++) {
        const body = rand() ? new CircleBody({ elasticity: 1 }) : new RectBody({ elasticity: 1 });

        const gameEntity = new GameEntity(world, body);
        gameEntity.moveTo(new Vector(Math.floor(Math.random() * TILE_WIDTH), Math.floor(Math.random() * TILE_HEIGHT)));

        if (rand()) {
            body.setFixed();
        } else {
            gameEntity.move(new Vector(Math.random(), Math.random()));
        }

        world.addBody(body);
    }

    return { world, player, rendererOptions };
};
