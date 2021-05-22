const {ccclass, property} = cc._decorator;

@ccclass
export default class mushroom extends cc.Component {
    private speed: number = -100;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
    }

    start() {
    }

    update(dt) {
        this.node.x += this.speed * dt;

        var Y = this.node.y - cc.find("Canvas/Main Camera").y;
        if(Y < -320)
            this.node.destroy();
    }

    onBeginContact(contact, self, other) {
        if(other.tag == 0 || other.tag == 1) { //ground & block
            //cc.log(contact.getWorldManifold().normal);
            if(contact.getWorldManifold().normal.x == -1 && contact.getWorldManifold().normal.y == -0) { //right
                this.node.scaleX = -3;
                this.speed = 100;
            }
            else if(contact.getWorldManifold().normal.x == 1 && contact.getWorldManifold().normal.y == -0) {
                this.node.scaleX = 3;
                this.speed = -100;
            }
        }
    }
}
