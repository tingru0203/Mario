import Player from "./Player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Enemy extends cc.Component {
    private isSchedule: boolean = false;

    @property(Player)
    player: Player = null;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
    }

    start() {
    }

    update(dt) {
        if(this.player.isDead) {
            var anim = this.getComponent(cc.Animation);
            anim.pause();
            this.node.stopAllActions();
            return;
        }

        if(!this.isSchedule && this.node.x - cc.find("Canvas/Main Camera").x < 600) {
            this.isSchedule = true;
            this.schedule(function() {
                let action = cc.sequence(cc.moveBy(1.5, 0, 40), cc.delayTime(1), cc.moveBy(1.5, 0, -40));
                this.node.runAction(action);
            }, 6);
        }
    }
}
