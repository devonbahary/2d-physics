import { Vector } from 'src/physics/Vector';
import { GameEntity } from './GameEntity';

enum DirectionKey {
    ArrowUp = 'ArrowUp',
    ArrowRight = 'ArrowRight',
    ArrowDown = 'ArrowDown',
    ArrowLeft = 'ArrowLeft',
}

export class Controls {
    private keyMem = new Set<string>();

    constructor(private player: GameEntity) {
        this.initKeyBindings();
    }

    initKeyBindings(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key in DirectionKey || e.key === ' ') {
                e.preventDefault();

                switch (e.key) {
                    case DirectionKey.ArrowUp:
                        this.keyMem.add(e.key);
                        break;
                    case DirectionKey.ArrowRight:
                        this.keyMem.add(e.key);
                        break;
                    case DirectionKey.ArrowDown:
                        this.keyMem.add(e.key);
                        break;
                    case DirectionKey.ArrowLeft:
                        this.keyMem.add(e.key);
                        break;
                }
            }
        });

        document.addEventListener('keyup', (e: KeyboardEvent) => {
            if (e.key in DirectionKey || e.key === ' ') {
                switch (e.key) {
                    case DirectionKey.ArrowUp:
                    case DirectionKey.ArrowRight:
                    case DirectionKey.ArrowDown:
                    case DirectionKey.ArrowLeft:
                        this.keyMem.delete(e.key);
                        break;
                }
            }
        });
    }

    isPressed(key: string): boolean {
        return this.keyMem.has(key);
    }

    update(): void {
        const movement = new Vector();

        if (this.isPressed(DirectionKey.ArrowUp)) {
            movement.y = -1;
        }
        if (this.isPressed(DirectionKey.ArrowRight)) {
            movement.x = 1;
        }
        if (this.isPressed(DirectionKey.ArrowDown)) {
            movement.y = 1;
        }
        if (this.isPressed(DirectionKey.ArrowLeft)) {
            movement.x = -1;
        }

        if (Vector.magnitude(movement)) {
            this.player.move(movement);
        }
    }
}
