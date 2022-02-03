import { Controls } from './game/Controls';
import { Renderer } from './game/Renderer';
import { setupChaos } from './game/environments/chaos';
import { setupRails } from './game/environments/rails';
import { setupEnvironmentA } from './game/environments/environmentA';
import { setupLargeEnvironment } from './game/environments/large-environment';

const { world, player, rendererOptions } = setupRails();

const renderer = new Renderer(world, player, rendererOptions);
const controls = new Controls(world, player, renderer);

const run = (): void => {
    world.update();
    renderer.update();
    controls.update();

    requestAnimationFrame(run);
};

requestAnimationFrame(run);

console.log(world);
