import { World } from 'src/physics/World';
import { Body } from 'src/physics/bodies/types';
import { CircleBody } from 'src/physics/bodies/CircleBody';
import { scaleToGameLength, scaleToPhysicsLength } from './utilities';
import { BodySprite } from './sprites/BodySprite';
import { LeafSprite } from './sprites/LeafSprite';
import { Leaf } from 'src/physics/collisions/quad-tree/QuadTree';
import { GameEntity } from './GameEntity';
import { roundForFloatingPoint } from 'src/physics/math/math.utilities';
import 'normalize.css';
import './styles.css';

export type RendererOptions = {
    renderQuadTree?: boolean;
};

type GameObject = Body | Leaf;
type Sprite = BodySprite | LeafSprite;
type FPSTracking = {
    lastRenderTimestamp: number;
    frameCountSinceLastRender: number;
};

const DEFAULT_OPTIONS: Required<RendererOptions> = {
    renderQuadTree: false,
};

export class Renderer {
    public worldElement: HTMLElement;
    private fpsElement: HTMLElement;
    private bodySprites: BodySprite[] = [];
    private leafSprites: LeafSprite[] = [];
    private fpsTracking: FPSTracking = {
        lastRenderTimestamp: Date.now(),
        frameCountSinceLastRender: 0,
    };
    private options: Required<RendererOptions>;

    constructor(private world: World, player: GameEntity, options: Partial<RendererOptions> = {}) {
        this.worldElement = this.createWorldElement();
        document.body.appendChild(this.worldElement);
        this.initTileGrid();

        this.fpsElement = this.createFPSElement();
        document.body.appendChild(this.fpsElement);

        this.addSpriteForPlayer(player);

        this.options = {
            ...DEFAULT_OPTIONS,
            ...options,
        };
    }

    public update(): void {
        this.syncGameObjectsWithSprites();

        for (const sprite of this.sprites) {
            sprite.update();
        }

        this.updateFPSTracking();
    }

    private get sprites(): Sprite[] {
        return [...this.bodySprites, ...this.leafSprites];
    }

    private static createBodyElement(body: Body): HTMLElement {
        const bodyElement = document.createElement('div');
        bodyElement.classList.add('body');

        if (body instanceof CircleBody) {
            bodyElement.classList.add('circle');
        }

        return bodyElement;
    }

    private static createLeafElement(): HTMLElement {
        const bodyElement = document.createElement('div');
        bodyElement.classList.add('leaf');
        return bodyElement;
    }

    private addSpriteForPlayer(player: GameEntity): void {
        const playerElement = Renderer.createBodyElement(player.body);
        playerElement.id = 'player';
        this.addSpriteForBody(player.body, playerElement);
    }

    private addSpriteForBody = (body: Body, bodyElement = Renderer.createBodyElement(body)): void => {
        this.worldElement.appendChild(bodyElement);
        const bodySprite = new BodySprite(body, bodyElement);
        this.bodySprites.push(bodySprite);
    };

    private removeBodySprite = (bodySprite: BodySprite): void => {
        this.bodySprites = this.bodySprites.filter((sprite) => sprite.id !== bodySprite.id);
        this.worldElement.removeChild(bodySprite.element);
    };

    private addSpriteForLeaf = (leaf: Leaf): void => {
        const leafElement = Renderer.createLeafElement();
        this.worldElement.appendChild(leafElement);
        const leafSprite = new LeafSprite(leaf, leafElement);
        this.leafSprites.push(leafSprite);
    };

    private removeLeafSprite = (leafSprite: LeafSprite): void => {
        this.leafSprites = this.leafSprites.filter((sprite) => sprite.id !== leafSprite.id);
        this.worldElement.removeChild(leafSprite.element);
    };

    private createWorldElement(): HTMLElement {
        const worldElement = document.createElement('div');
        worldElement.id = 'world';
        worldElement.style.width = `${this.world.width}px`;
        worldElement.style.height = `${this.world.height}px`;
        return worldElement;
    }

    private createFPSElement(): HTMLElement {
        const fpsElement = document.createElement('div');
        fpsElement.id = 'fps';
        fpsElement.innerText = 'FPS:';
        return fpsElement;
    }

    private updateFPSTracking(): void {
        this.fpsTracking.frameCountSinceLastRender++;

        const now = Date.now();
        const timeSinceLastRender = now - (this.fpsTracking.lastRenderTimestamp || 0);

        if (timeSinceLastRender < 1000) return;

        const secondsElapsed = timeSinceLastRender / 1000;
        const fps = this.fpsTracking.frameCountSinceLastRender / secondsElapsed;

        this.fpsElement.innerText = `FPS: ${roundForFloatingPoint(fps)}`;

        this.fpsTracking.frameCountSinceLastRender = 0;
        this.fpsTracking.lastRenderTimestamp = now;
    }

    private syncGameObjectsWithSprites(): void {
        this.addMissingSprites(this.world.bodies, this.bodySprites, (body: Body) => this.addSpriteForBody(body));
        this.removeStaleSprites(this.world.bodies, this.bodySprites, (bodySprite: BodySprite) =>
            this.removeBodySprite(bodySprite),
        );

        if (this.world.quadTree && this.options.renderQuadTree) {
            this.addMissingSprites(this.world.quadTree.leaves, this.leafSprites, (leaf: Leaf) =>
                this.addSpriteForLeaf(leaf),
            );
            this.removeStaleSprites(this.world.quadTree.leaves, this.leafSprites, (leafSprite: LeafSprite) =>
                this.removeLeafSprite(leafSprite),
            );
        }
    }

    private addMissingSprites(
        gameObjects: GameObject[],
        sprites: Sprite[],
        addMissingSprite: (gameObject: GameObject) => void,
    ): void {
        for (const gameObject of gameObjects) {
            if (!sprites.some((sprite) => sprite.id === gameObject.id)) {
                addMissingSprite(gameObject);
            }
        }
    }

    private removeStaleSprites(
        gameObjects: GameObject[],
        sprites: Sprite[],
        removeStaleSprite: (sprite: Sprite) => void,
    ): void {
        for (const sprite of sprites) {
            if (!gameObjects.some((gameObject) => gameObject.id === sprite.id)) {
                removeStaleSprite(sprite);
            }
        }
    }

    private initTileGrid(): void {
        const className = 'tile-grid';
        const thickness = '1px';
        const border = '1px dotted grey';

        const tilesWidth = scaleToGameLength(this.world.width);
        const tilesHeight = scaleToGameLength(this.world.height);

        for (let i = 1; i < tilesWidth; i += 1) {
            const latitudinalLine = document.createElement('span');
            latitudinalLine.classList.add(className);

            Object.assign(latitudinalLine.style, {
                left: `${scaleToPhysicsLength(i)}px`,
                width: thickness,
                height: this.worldElement.style.height,
                borderLeft: border,
            });

            this.worldElement.appendChild(latitudinalLine);

            for (let i = 1; i < tilesHeight; i += 1) {
                const longitudinalLine = document.createElement('span');
                longitudinalLine.classList.add(className);

                Object.assign(longitudinalLine.style, {
                    top: `${i * 24}px`,
                    width: this.worldElement.style.width,
                    height: thickness,
                    borderTop: border,
                });

                this.worldElement.appendChild(longitudinalLine);
            }
        }
    }
}
