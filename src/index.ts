import { World } from './physics/World';
import { Controls } from './game/Controls';
import { Renderer } from './game/Renderer';
import { Player } from './game/Player';
import { Vector } from './physics/Vector';
import { scaleToPhysicsLength } from './game/utilities';

const settings = {
    world: {
        tileWidth: 5,
        tileHeight: 5,
    },
};

const world = new World(
    scaleToPhysicsLength(settings.world.tileWidth), 
    scaleToPhysicsLength(settings.world.tileHeight),
);

const player = new Player();

player.moveTo(
    new Vector(
        Math.floor(settings.world.tileWidth / 2), 
        Math.floor(settings.world.tileHeight / 2),
    ),
);

world.addBody(player.body);

const renderer = new Renderer(world, player.body);
new Controls(player.body);

setInterval(() => {
    world.update();
    renderer.update();
}, 1000 / 60);

console.log(world);
