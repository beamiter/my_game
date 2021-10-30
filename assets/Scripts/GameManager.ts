import {
    _decorator, Component, Node, Prefab, instantiate, CCInteger, Vec3,
    Label,
    NodePool
} from 'cc';
import {PlayerController} from './PlayerController';
import {CameraController} from "./CameraController";

const {ccclass, property} = _decorator;

enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END,
}

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

    @property({type: Prefab})
    public cubePrefab: Prefab | null = null;
    @property({type: Prefab})
    public cylinderPrefab: Prefab | null = null;
    @property({type: CCInteger})
    public roadLength: Number = 50;
    @property({type: PlayerController})
    public playerCtrl: PlayerController = null;
    @property({type: CameraController})
    public cameraCtrl: CameraController = null;
    @property({type: Node})
    public startMenu: Node = null;
    @property({type: Label})
    public stepsLabel: Label | null = null;

    private _curState: GameState = GameState.GS_INIT;
    private _cubePool: NodePool = new NodePool();
    private _cylinderPool: NodePool = new NodePool();
    private _blockHistory: [number, Node][] = [];

    start() {
        this.clearObjectPooling();
        this.curState = GameState.GS_INIT;
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
        this.cameraCtrl?.node.on('ReachAnchor', this.onReachAnchor, this);
    }

    // update (deltaTime: number) {
    //     // [4]
    // }

    clearObjectPooling() {
        this._cubePool.clear();
        this._cylinderPool.clear();
    }

    // Associated with button event.
    onStartButtonClicked() {
        this.curState = GameState.GS_PLAYING;
        this.generateRoad();
    }

    generateRoad() {
        // Initialize prefab.
        const initCount: number = 6;
        let cube: Node | null = null;
        let cylinder: Node | null = null;
        for (let i = 0; i < initCount; ++i) {
            cube = instantiate(this.cubePrefab);
            this._cubePool.put(cube);
            cylinder = instantiate(this.cylinderPrefab);
            this._cylinderPool.put(cylinder);
        }
        // Initialize with two tiles.
        let pos: Vec3 = new Vec3(0, 0, 0);
        this.addNewPile(pos, false);
        pos = new Vec3(2, 0, 0);
        this.addNewPile(pos, false);
        // Init target pos.
        this.playerCtrl.targetPos = pos;
        // Init camera anchor.
        this.cameraCtrl.initAnchor(new Vec3(1, 0, 0));
    }

    // curState setter.
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

    init() {
        if (this.startMenu) {
            this.startMenu.active = true;
        }
        if (this.playerCtrl) {
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.reset();
        }
        this.clearObjectPooling();
        this.node.removeAllChildren();
    }

    onReachAnchor() {
        this.playerCtrl.isMoving = false;
    }

    onPlayerJumpEnd(moveIndex: number) {
        this.checkResult(moveIndex);
        if (this._curState === GameState.GS_INIT) {
            return;
        }
        this.stepsLabel.string = '' + moveIndex;
        // Node pool collection.
        if (this._blockHistory.length >= 5) {
            let blockPair = this._blockHistory.shift();
            if (blockPair[0] === 0) {
                this._cubePool.put(blockPair[1]);
            } else if (blockPair[0] === 1) {
                this._cylinderPool.put(blockPair[1]);
            }
        }
        // Add new node.
        this.addNewPile(this.playerCtrl.node.getPosition(), true);
        // Update camera target anchor.
        this.cameraCtrl.updateAnchor(this.playerCtrl.node.getPosition(), this.playerCtrl.targetPos);
        // Move camera to target anchor.
        this.cameraCtrl.moveToTargetAnchor();
    }

    checkResult(moveIndex: number) {
        if (moveIndex > this.roadLength) {
            this.curState = GameState.GS_INIT;
        }
    }

    addNewPile(pos: Vec3, updatePos: boolean) {
        let block: Node | null = null;
        let n: number = Math.floor(Math.random() * 2);
        block = this.getRandomNextNode(block, n);
        if (block === null) {
            return;
        }
        if (updatePos) {
            pos = this.getRandomNextPos(pos);
            // Set target pos.
            this.playerCtrl.targetPos = pos;
        }
        // Always need to set position.
        pos.y = 0.25; // Default block y coordinate.
        block.setPosition(pos);
        this.node.addChild(block);
        this._blockHistory.push([n, block]);
        console.log('****** ', block.name, block.getSiblingIndex(), pos);
    }

    // Get random next node by type, currently cube/cylinder.
    getRandomNextNode(block: Node, n: number): Node {
        if (n === 0) {
            // 0 for cube pool.
            block = this._cubePool.get();
            if (block === null) {
                block = instantiate(this.cubePrefab);
            }
        } else if (n === 1) {
            // 1 for cylinder pool.
            block = this._cylinderPool.get();
            if (block === null) {
                block = instantiate(this.cylinderPrefab);
            }
        } else {
            return null;
        }
        return block;
    }

    getRandomNextPos(pos: Vec3): Vec3 {
        let changeX: number = Math.floor(Math.random() * 2);
        let delta: number = Math.floor(Math.random() * 2) + 2;
        if (changeX) {
            pos.x += delta;
        } else {
            pos.z -= delta;
        }
        return pos;
    }
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
