import { Body } from 'src/physics/bodies/types';
import { Vector } from 'src/physics/Vector';

enum DirectionKey {
    ArrowUp = 'ArrowUp',
    ArrowRight = 'ArrowRight',
    ArrowDown = 'ArrowDown',
    ArrowLeft = 'ArrowLeft',
}

export class Controls {
    constructor(private player: Body) {
        this.initKeyBindings();
    }

    initKeyBindings(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key in DirectionKey || e.key === ' ') {
                e.preventDefault();

                switch (e.key) {
                    case DirectionKey.ArrowUp:
                        this.player.applyForce(new Vector(0, -1));
                        break;
                    case DirectionKey.ArrowRight:
                        this.player.applyForce(new Vector(1, 0));
                        break;
                    case DirectionKey.ArrowDown:
                        this.player.applyForce(new Vector(0, 1));
                        break;
                    case DirectionKey.ArrowLeft:
                        this.player.applyForce(new Vector(-1, 0));
                        break;
                }
            }
        });
    }
}
