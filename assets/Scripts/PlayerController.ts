
import { _decorator, Component, Vec3, systemEvent, SystemEvent, EventMouse, Animation } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = PlayerController
 * DateTime = Sun Oct 24 2021 11:50:08 GMT+0800 (中国标准时间)
 * Author = beamiter
 * FileBasename = PlayerController.ts
 * FileBasenameNoExtension = PlayerController
 * URL = db://assets/Scripts/PlayerController.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/en/
 *
 */

@ccclass('PlayerController')
export class PlayerController extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    @property({ type: Animation })
    public BodyAnim: Animation | null = null;

    private _startJump: boolean = false;
    private _curJumpTime: number = 0;
    private _jumpTime: number = 0.5;
    private _curJumpSpeedX: number = 0;
    private _curJumpSpeedZ: number = 0;
    private _curPos: Vec3 = new Vec3();
    private _deltaPos: Vec3 = new Vec3(0, 0, 0);
    private _targetPos: Vec3 = new Vec3();
    private _isMoving = false;
    private _curMoveIndex = 0;

    setTargetPose(pos: Vec3) {
        this._targetPos = pos;
    }

    start() {
    }

    update(deltaTime: number) {
        if (this._startJump) {
            this._curJumpTime += deltaTime;
            if (this._curJumpTime > this._jumpTime) {
                this.node.setPosition(this._targetPos);
                this._startJump = false;
                this.onOnceJumpEnd();
            } else {
                this.node.getPosition(this._curPos);
                this._deltaPos.x = this._curJumpSpeedX * deltaTime;
                this._deltaPos.z = this._curJumpSpeedZ * deltaTime;
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                this.node.setPosition(this._curPos);
            }
        }
    }

    setInputActive(active: boolean) {
        if (active) {
            systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            systemEvent.off(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    onMouseUp(event: EventMouse) {
        this.jumpToNextStep();
    }

    jumpToNextStep() {
        this.BodyAnim?.play('oneStep');
        if (this._isMoving) {
            return;
        }
        this._startJump = true;
        this.node.getPosition(this._curPos);
        // Always keep the y axis pos as the same.
        this._targetPos.y = this._curPos.y;
        this._curJumpTime = 0;
        this._curJumpSpeedX = (this._targetPos.x - this._curPos.x) / this._jumpTime;
        this._curJumpSpeedZ = (this._targetPos.z - this._curPos.z) / this._jumpTime;
        this._isMoving = true;

        let step: number = Vec3.distance(this._targetPos, this._curPos);
        this._curMoveIndex += step;
    }

    onOnceJumpEnd() {
        this._isMoving = false;
        this.node.emit('JumpEnd', this._curMoveIndex);
    }

    reset() {
        this._curMoveIndex = 0;
        this.node.setPosition(0, 0, 0);
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
