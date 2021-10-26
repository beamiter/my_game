
import {
    _decorator, Component, Node, Prefab, instantiate, CCInteger, Vec3,
    Label,
    NodePool
} from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

enum BlockType {
    BT_NONE,
    BT_STONE,
};

enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END,
};

/**
 * Predefined variables
 * Name = GameManager
 * DateTime = Sun Oct 24 2021 13:41:39 GMT+0800 (中国标准时间)
 * Author = beamiter
 * FileBasename = GameManager.ts
 * FileBasenameNoExtension = GameManager
 * URL = db://assets/Scripts/GameManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/en/
 *
 */

@ccclass('GameManager')
export class GameManager extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    @property({ type: Prefab })
    public cubePrfb: Prefab | null = null;
    @property({ type: Prefab })
    public cylinderPrfb: Prefab | null = null;
    @property({ type: CCInteger })
    public roadLength: Number = 50;
    @property({ type: PlayerController })
    public playerCtrl: PlayerController = null;
    @property({ type: Node })
    public startMenu: Node = null;
    @property({ type: Label })
    public stepsLabel: Label | null = null;

    private _road: number[] = [];
    private _curState: GameState = GameState.GS_INIT;
    private _cubePool: NodePool = new NodePool();
    private _cylinderPool: NodePool = new NodePool();
    private _blockHistory: [number, Node][] = [];

    clearObjectPooling() {
        this._cubePool.clear();
        this._cylinderPool.clear();
    }

    checkResult(moveIndex: number) {
        if (moveIndex <= this.roadLength) {
            if (this._road[moveIndex] == BlockType.BT_NONE) {
                this.curState = GameState.GS_INIT;
            }
        } else {
            this.curState = GameState.GS_INIT;
        }
        if (this.curState === GameState.GS_INIT) {
            this.node.removeAllChildren();
        }
    }

    start() {
        // [3]
        // this.generateRoad();
        this.curState = GameState.GS_INIT;
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    onPlayerJumpEnd(moveIndex: number) {
        this.stepsLabel.string = '' + moveIndex;
        this.checkResult(moveIndex);
        this.addNewPile(this.playerCtrl.node.getPosition(), true);
        if (this._blockHistory.length > 5) {
            let blockPair = this._blockHistory.shift();
            if (blockPair[0] === 0) {
                this._cubePool.put(blockPair[1]);
            } else if (blockPair[0] === 1) {
                this._cylinderPool.put(blockPair[1]);
            }
        }
    }

    init() {
        if (this.startMenu) {
            this.startMenu.active = true;
        }
        this.generateRoad();
        if (this.playerCtrl) {
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.node.setPosition(Vec3.ZERO);
            this.playerCtrl.reset();
        }
    }

    set curState(value: GameState) {
        switch (value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                if (this.startMenu) {
                    this.startMenu.active = false;
                }
                if (this.stepsLabel) {
                    this.stepsLabel.string = '0';
                }
                setTimeout(() => {
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 0.1);
                break;
            case GameState.GS_END:
                break;
        }
        this._curState = value;
    }

    onStartButtonClicked() {
        this.curState = GameState.GS_PLAYING;
    }

    getRandomNextPos(pos: Vec3): Vec3 {
        let changeX: number = Math.floor(Math.random() * 2);
        let delta: number = Math.floor(Math.random() * 3) + 2;
        pos.y = 0.25;
        if (changeX) {
            pos.x += delta;
        } else {
            pos.z -= delta;
        }
        return pos;
    }

    getRandomNextNode(block: Node): Node {
        let n: number = Math.floor(Math.random() * 2);
        if (n === 0) {
            // 0 for cube pool.
            block = this._cubePool.get();
        } else if (n === 1) {
            // 1 for cylinder pool.
            block = this._cylinderPool.get();
        }
        this._blockHistory.push([n, block]);
        return block;
    }

    addNewPile(pos: Vec3, updatePos: boolean) {
        let block: Node | null = null;
        block = this.getRandomNextNode(block);
        if (!block) {
            return;
        }
        if (updatePos) {
            pos = this.getRandomNextPos(pos);
            block.setPosition(pos);
            // Set as target pos.
            this.playerCtrl.setTargetPose(pos);
        }
        this.node.addChild(block);
        console.log(block.name, block.getSiblingIndex(), pos);
    }

    generateRoad() {
        this.node.removeAllChildren();

        // Initialize prefab.
        const initCount: number = 6;
        let cube: Node | null = null;
        let cylinder: Node | null = null;
        for (let i = 0; i < initCount; ++i) {
            cube = instantiate(this.cubePrfb);
            this._cubePool.put(cube);
            cylinder = instantiate(this.cylinderPrfb);
            this._cylinderPool.put(cylinder);
        }
        // Initialize with two tiles.
        let pos: Vec3 = new Vec3(0, 0.25, 0);
        this.addNewPile(pos, false);
        this.addNewPile(pos, true);
        return;
    }

    spawnBlockByType(type: BlockType) {
        if (!this.cubePrfb) {
            return null;
        }

        let block: Node | null = null;
        switch (type) {
            case BlockType.BT_STONE:
                block = instantiate(this.cubePrfb);
                break;
        }

        return block;
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.3/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.3/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.3/manual/en/scripting/life-cycle-callbacks.html
 */
