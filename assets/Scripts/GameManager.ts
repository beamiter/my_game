
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

    checkResult(moveIndex: number) {
        if (moveIndex <= this.roadLength) {
            if (this._road[moveIndex] == BlockType.BT_NONE) {
                this.curState = GameState.GS_INIT;
            }
        } else {
            this.curState = GameState.GS_INIT;
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
        if (this.playerCtrl.node.children.length > 5) {

        }
        this.checkResult(moveIndex);
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

    generateRoad() {
        this.node.removeAllChildren();

        const initCount: number = 5;
        let cube: Node | null = null;
        let cylinder: Node | null = null;
        for (let i = 0; i < initCount; ++i) {
            cube = instantiate(this.cubePrfb);
            this._cubePool.put(cube);
            cylinder = instantiate(this.cylinderPrfb);
            this._cylinderPool.put(cylinder);
        }
        let block: Node | null = null;
        let pos: Vec3 = new Vec3(0, 0.25, 0);
        for (let j = 0; j < 2; ++j) {
            let n: Number = Math.floor(Math.random() * 2);
            if (n === 0) {
                block = this._cubePool.get();
            } else if (n === 1) {
                block = this._cylinderPool.get();
            } else {
                continue;
            }
            this.node.addChild(block);
            block.setPosition(pos);
            console.log(block.name);
            let changeX: number = Math.floor(Math.random() * 2);
            let delta: number = Math.floor(Math.random() * 3) + 2;
            if (changeX) {
                pos.x += delta;
            } else {
                pos.z -= delta;
            }
        }
        return;

        this._road = [];
        this._road.push(BlockType.BT_STONE);

        for (let i = 1; i < this.roadLength; ++i) {
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }

        for (let j = 0; j < this._road.length; ++j) {
            let block: Node = this.spawnBlockByType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j, 0.25, 0);
            }
        }
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
