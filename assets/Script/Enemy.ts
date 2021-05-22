import Player from "./Player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Enemy extends cc.Component {
    private enemySpeed: number = -100;

    private die: boolean = false;

    private turtle_state: number = 1; /* 1: move, 2: shrink, 3: shrink_move */

    //private turtle_shrink_move: boolean = false;

    private anim = null;

    @property(Player)
    player: Player = null;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        this.anim = this.getComponent(cc.Animation);  
    }

    start() {
        if(this.node.name == "Goomba") {
            this.schedule(function() { 
                this.node.scaleX *= -1;
            }, 0.1);
        }
    }

    update(dt) {
        if(!(this.turtle_state == 2) && !this.die && !this.player.isDead && !this.player.isPause && this.node.x != 300) {
            if(this.node.x - cc.find("Canvas/Main Camera").x < 800)
                this.node.x += this.enemySpeed * dt;
        }
        if(this.turtle_state == 3) {
            var X = this.node.x - cc.find("Canvas/Main Camera").x;
            var Y = this.node.y - cc.find("Canvas/Main Camera").y;
            if(X > 480 || X < -480 || Y > 320 || Y < -320)
                this.node.destroy();
        }
    }

    onBeginContact(contact, self, other) {
        if(other.tag == 0 || other.tag == 1) { // ground & block
            if(contact.getWorldManifold().normal.x == -1 && contact.getWorldManifold().normal.y == -0) { //right bound
                this.node.scaleX = -3;
                this.enemySpeed *= -1;
            }
            else if(contact.getWorldManifold().normal.x == 1 && contact.getWorldManifold().normal.y == -0) { //left bound
                this.node.scaleX = 3;
                this.enemySpeed *= -1;
            }
        }
        else if(other.tag == 10) { // player
            if(this.player.isDead || this.player.isStrong || this.die) {
                contact.disabled = true;
                return;
            }

            if(this.node.name == "Goomba") { //goomba
                if(contact.getWorldManifold().normal.x == 0 && contact.getWorldManifold().normal.y == 1) {
                    this.die = true;
                    this.anim.play("goomba_die");
                    this.player.stompEnemy_100(self);
                }
                else {
                    this.player.decrease();
                }
            }
            else { //turtle
                if(this.turtle_state == 1) { // move
                    if(contact.getWorldManifold().normal.x == 0 && contact.getWorldManifold().normal.y == 1) {
                        this.turtle_state = 2;
                        this.anim.play("turtle_shrink");
                        this.player.stompEnemy_100(self);
                    }
                    else {
                        this.player.decrease();
                    }
                }
                else if(this.turtle_state == 2){ // shrink
                    if(self.node.x <= other.node.x) { // kick - left move
                        this.enemySpeed = -500;
                        this.turtle_state = 3;
                        this.anim.play("turtle_shrink_move");
                        this.player.playEffect(this.player.kickSound);
                        this.player.jump();
                    }
                    else if(self.node.x > other.node.x) { // kick - right move
                        this.enemySpeed = 500;
                        this.turtle_state = 3;
                        this.anim.play("turtle_shrink_move");
                        this.player.playEffect(this.player.kickSound);
                        this.player.jump();
                    }
                }
                else if(this.turtle_state == 3) { // shrink_move
                    if(contact.getWorldManifold().normal.x == 0 && contact.getWorldManifold().normal.y == 1) {
                        this.turtle_state = 2;
                        this.anim.play("turtle_shrink");
                        this.player.jump();
                    }
                    else
                        this.player.decrease();
                }
            }
        }
        else if(other.tag == 4 || other.tag == 5) {
            if(this.turtle_state == 3) {
                this.player.enemyDie_100(other);
                other.node.destroy();
            }
            else {
                contact.disabled = true;
            }
        }
        else if(other.tag != 3) {
            contact.disabled = true;
        }
    }
}
