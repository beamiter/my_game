import {_decorator, Component, Vec3, systemEvent, SystemEvent, EventMouse, Animation, tween, easing, Quat} from 'cc';

const {ccclass, property} = _decorator;

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
    @property({type: Animation})
    public BodyAnim: Animation | null = null;

    private  _isMoving: boolean = false;
    private _jumpTime: number = 0.4;
    private _curPos: Vec3 = new Vec3();
    private _targetPos: Vec3 = new Vec3();
    private _score = 0;

    set isMoving(moving: boolean) {
        this._isMoving = moving;
    }

    // Target Pose setter.
    set targetPos(pos: Vec3) {
        // Use clone(deep copy) to avoid shallow copy.
        this._targetPos = pos.clone();
        this._targetPos.y = 0;
    }

    get targetPos() {
        return this._targetPos;
    }

    start() {
    }

    update(deltaTime: number) {
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
        if (this._isMoving) {
            return;
        }
        this._isMoving = true;
        this.node.getPosition(this._curPos);
        console.log(this._curPos, this._targetPos);
        let t = tween;
        let movement = t().to(this._jumpTime, {position: this._targetPos}, {easing: t => easing.smooth(t)});
        let player = t(this.node).then(movement).call(() => {
            this.onOnceJumpEnd();
        });

        let tumbleZ = t().by(this._jumpTime, {eulerAngles: new Vec3(0, 0, -360)}, {easing: t => easing.smooth(t)});
        let tumbleX = t().by(this._jumpTime, {eulerAngles: new Vec3(-360, 0, 0)}, {easing: t => easing.smooth(t)});
        let axisX = Math.abs(this._targetPos.z - this._curPos.z) > Math.abs(this._targetPos.x - this._curPos.x);
        let tumble = axisX ? tumbleX : tumbleZ;
        let jump = t().by(this._jumpTime / 2, {position: new Vec3(0, 1, 0)}, {easing: t => easing.quadInOut(t)});
        let fall = t().by(this._jumpTime / 2, {position: new Vec3(0, -1, 0)}, {easing: t => easing.quadIn(t)});
        let body = t(this.node.getChildByName('Body'))
            .parallel(
                t().then(tumble),
                t().then(jump).then(fall)
            );

        body.start();
        player.start();
    }

    onOnceJumpEnd() {
        let step: number = Vec3.distance(this._targetPos, this._curPos);
        this._score += step;
        this.node.emit('JumpEnd', this._score);
    }

    reset() {
        this._isMoving = false;
        this._score = 0;
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
