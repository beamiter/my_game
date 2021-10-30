import {_decorator, Component, Node, Vec3, tween, easing} from 'cc';

const {ccclass, property} = _decorator;

/**
 * Predefined variables
 * Name = CameraController
 * DateTime = Sat Oct 30 2021 10:38:00 GMT+0800 (中国标准时间)
 * Author = beamiter
 * FileBasename = CameraController.ts
 * FileBasenameNoExtension = CameraController
 * URL = db://assets/Scripts/CameraController.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/en/
 *
 */

@ccclass('CameraController')
export class CameraController extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    private _curAnchor: Vec3 = new Vec3();
    private _targetAnchor: Vec3 = new Vec3();

    set curAnchor(pos: Vec3) {
        this._curAnchor = pos.clone();
    }

    get curAnchor(): Vec3 {
        return this._curAnchor;
    }

    set targetAnchor(pos: Vec3) {
        this._targetAnchor = pos.clone();
    }

    get targetAnchor(): Vec3 {
        return this._curAnchor;
    }

    start() {
        // [3]
    }

    // update (deltaTime: number) {
    //     // [4]
    // }

    initAnchor(pos: Vec3) {
        this._targetAnchor = pos;
    }

    updateAnchor(a: Vec3, b: Vec3) {
        // console.log(a, b);
        this._curAnchor = this._targetAnchor.clone();
        this._targetAnchor.x = (a.x + b.x) / 2;
        this._targetAnchor.z = (a.z + b.z) / 2;
    }

    moveToTargetAnchor() {
        let deltaPos: Vec3 = new Vec3();
        Vec3.subtract(deltaPos, this._targetAnchor, this._curAnchor);
        // console.log(this._curAnchor, this._targetAnchor, deltaPos);
        tween(this.node)
            .by(0.8, {position: deltaPos}, {easing: t => easing.smooth(t)})
            .call(() => {
                this.node.emit('ReachAnchor')
            })
            .start();
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
