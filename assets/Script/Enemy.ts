import Player from "./Player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Enemy extends cc.Component {
    private enemySpeed: number = -100;

    @property(Player)
    player: Player = null;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
    }

    start() {
        if(this.node.name == "Goomba") {
            this.schedule(function() { 
                this.node.scaleX *= -1;
            }, 0.1);
        }
    }

    update(dt) {
        if(!this.player.isDead && !this.player.isPause && this.node.x != 300) {
            if(this.node.x - cc.find("Canvas/Main Camera").x < 600)
                this.node.x += this.enemySpeed * dt;
        }
    }

    onBeginContact(contact, self, other) {
        if(other.tag == 0 || other.tag == 1) {
            if(contact.getWorldManifold().normal.x == -1 && contact.getWorldManifold().normal.y == -0) { //right
                this.node.scaleX = -3;
                this.enemySpeed = 100;
            }
            else if(contact.getWorldManifold().normal.x == 1 && contact.getWorldManifold().normal.y == -0) {
                this.node.scaleX = 3;
                this.enemySpeed = -100;
            }
        }
        else if(other.tag != 3) {
            contact.disabled = true;
        }
    }
}
