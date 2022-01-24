import { Controls } from './game/Controls';
import { Renderer } from './game/Renderer';
import { setupEnvironmentA } from './game/environments/environmentA';
import { setupChaos } from './game/environments/chaos';

const [world, player] = setupChaos();

const renderer = new Renderer(world, player.body);
const controls = new Controls(player);

setInterval(() => {
    world.update();
    renderer.update();
    controls.update();
}, 1000 / 60);

console.log(world);
