import { World } from './physics/World';
import { Controls } from './game/Controls';
import { Renderer } from './game/Renderer';
import { Player } from './game/Player';
import { Vector } from './physics/Vector';

const world = new World(5, 5);

const player = new Player();

player.moveTo(new Vector(Math.floor(world.tilesWidth / 2), Math.floor(world.tilesHeight / 2)));

world.addBody(player.body);

const renderer = new Renderer(world, player.body);
new Controls(player.body);

setInterval(() => {
    world.update();
    renderer.update();
}, 1000 / 60);
