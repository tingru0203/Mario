const {ccclass, property} = cc._decorator;

@ccclass
export default class questionBox extends cc.Component {

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        //this.node.children[0].active = false;
    }

    start() {
    }

    update(dt) {

    }
}
