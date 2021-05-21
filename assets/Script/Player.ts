const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    private playerSpeed: number = 0;

    private leftDown: boolean = false; // key for player to go left

    private rightDown: boolean = false; // key for player to go right

    private upDown: boolean = false; // key for player to jump

    isDead: boolean = false;

    private isPower: boolean = false; // big

    public isPause: boolean = false; // stop

    private isStrong: boolean = false; // for powerDown

    private isWin: boolean = false;

    private onGround: boolean = false;

    private score: number = 0;

    private coin: number = 0;

    private life: number = 5;

    private remainTime: number = 300;

    private email: string;

    private anim = null;

    @property(cc.Prefab)
    coinPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    score100Prefab: cc.Prefab = null;

    @property(cc.Prefab)
    score1000Prefab: cc.Prefab = null;

    @property(cc.Prefab)
    mushroomPrefab: cc.Prefab = null;

    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    jumpSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    stompSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    coinSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    mushroomSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    reserveSound: cc.AudioClip = null; //mushroom twice

    @property({type:cc.AudioClip})
    powerUpSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    powerDownSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    loseLifeSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    gameoverSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    winSound: cc.AudioClip = null;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;     
        this.anim = this.getComponent(cc.Animation);   	
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    start() {
        this.playBGM();
        this.initInformation();
        this.hideWinInformation();
    }
    
    update(dt) {
        if(this.isDead) {
            return;
        }

        // win
        if(!this.isWin) {
            if(Math.floor(this.remainTime) > 0)
                this.remainTime -= dt;
            else
                this.loseLife();
        }
            
        // pause
        if(this.isPause) {
            var anim = this.getComponent(cc.Animation);
            anim.pause();
        }
        else {
            this.playerMovement(dt);
            var anim = this.getComponent(cc.Animation);
            anim.resume();
        }

        // UI
        this.updateUI(dt);

        // out of window
        if(this.node.y - cc.find("Canvas/Main Camera").y < -600) 
            this.loseLife();
    }

    updateUI(dt) {
        cc.find("Canvas/Main Camera/score").getComponent(cc.Label).string = (Array(7).join("0") + this.score.toString()).slice(-7);
        cc.find("Canvas/Main Camera/coinNum").getComponent(cc.Label).string = String(this.coin);
        cc.find("Canvas/Main Camera/lifeNum").getComponent(cc.Label).string = String(this.life);
        cc.find("Canvas/Main Camera/timeNum").getComponent(cc.Label).string = String(Math.floor(this.remainTime));
    }

    initInformation() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.email = user.email.split(".").join("_").replace(/@/g, "_");
    
                firebase.database().ref('users/' + this.email).once('value').then(snapshot => {
                    this.life = Number(snapshot.val().life);
                    this.coin = Number(snapshot.val().coin);
                    this.score = Number(snapshot.val().score);
                });
            }
            else { // No user is signed in.
                cc.director.loadScene("Menu");
            }
        });
    }

    updateFirebase() { // when lose life and win
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                if(this.life <= 0) {
                    firebase.database().ref('users/' + this.email).update({
                        life: 5,
                        coin: 0,
                        score: 0
                    })
                }
                else {
                    firebase.database().ref('users/' + this.email).update({
                        life: this.life,
                        coin: this.coin,
                        score: this.score
                    })
                }
            }
            else { // No user is signed in.
                cc.director.loadScene("Menu");
            }
        });
    }

    hideWinInformation() {
        cc.find("Canvas/level").active = false;
        cc.find("Canvas/clear").active = false;
        cc.find("Canvas/multiple").active = false;
        cc.find("Canvas/50").active = false;
        cc.find("Canvas/=").active = false;
    }

    showWinInformation() {
        cc.find("Canvas/level").active = true;
        cc.find("Canvas/clear").active = true;
        cc.find("Canvas/multiple").active = true;
        cc.find("Canvas/50").active = true;
        cc.find("Canvas/=").active = true;
    }

    onKeyDown(event) {
        if(event.keyCode == cc.macro.KEY.left) {
            this.leftDown = true;
            this.rightDown = false;
        } else if(event.keyCode == cc.macro.KEY.right) {
            this.rightDown = true;
            this.leftDown = false;
        } else if(event.keyCode == cc.macro.KEY.up) {
            this.upDown = true;
        }
    }
    
    onKeyUp(event) {
        if(event.keyCode == cc.macro.KEY.left)
            this.leftDown = false;
        else if(event.keyCode == cc.macro.KEY.right)
            this.rightDown = false;
        else if(event.keyCode == cc.macro.KEY.up)
            this.upDown = false;
    }

    playBGM(){
        cc.audioEngine.playMusic(this.bgm, true);
    }

    stopBGM(){
        cc.audioEngine.pauseMusic();
    }

    playEffect(sound){
        cc.audioEngine.playEffect(sound, false);
    }

    loseLife() {
        this.isDead = true;
        this.life -= 1;
        this.stopBGM();
        this.updateFirebase();
        if(this.life <= 0) { // no life - gameover
            this.playEffect(this.loseLifeSound);

            if(this.isPower)
                this.anim.play("big_die");
            else
                this.anim.play("die");
            this.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 1000);

            this.scheduleOnce(function() {
                this.playEffect(this.gameoverSound);
                cc.director.loadScene("GameOver");
            }, 2);
            
        }
        else { // reborn
            this.playEffect(this.loseLifeSound);

            if(this.isPower)
                this.anim.play("big_die");
            else
                this.anim.play("die");
            this.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 1000);

            this.scheduleOnce(function() {
                if(cc.find("Canvas/Main Camera/worldNum").getComponent(cc.Label).string == "1")
                    cc.director.loadScene("GameStart1");
                else
                    cc.director.loadScene("GameStart2");
            }, 2);   
        }
    }

    win() {
        this.isWin = true;
        this.scheduleOnce(function() {
            this.isPause = true;
        }, 0.3);
        this.stopBGM();
        this.playEffect(this.winSound);
        this.showWinInformation();
        cc.find("Canvas/time").getComponent(cc.Label).string = String(Math.floor(this.remainTime));
        cc.find("Canvas/addScore").getComponent(cc.Label).string = String(Math.floor(this.remainTime)*50);
        this.score += Math.floor(this.remainTime)*50;
        this.updateFirebase();
        this.scheduleOnce(function() {
            cc.director.loadScene("SelectStage");
        }, 8);
    }

    cameraMove(dt) {
        if(this.node.x - cc.find("Canvas/Main Camera").x > 0 && cc.find("Canvas/Main Camera").x < 6720) {
            cc.find("Canvas/Main Camera").x += 300 * dt;
        }

        if(this.node.x - cc.find("Canvas/Main Camera").x < 0 && cc.find("Canvas/Main Camera").x > 0) {
            cc.find("Canvas/Main Camera").x -= 300 * dt;
        }

        var d = this.node.y - cc.find("Canvas/Main Camera").y
        if(d > 150) {
            cc.find("Canvas/Main Camera").y += d - 150;
        }

        if(d < 150 &&  cc.find("Canvas/Main Camera").y > 0) {
            cc.find("Canvas/Main Camera").y += d - 150;
        }
    }

    playerMovement(dt) {
        if(this.isDead)
            return;

        this.playerSpeed = 0;

        if(this.leftDown){
            this.playerSpeed = -300;

            if(!this.isPower) {
                if(!this.anim.getAnimationState("move").isPlaying && !this.anim.getAnimationState("jump").isPlaying)
                    this.anim.play("move");
            }
            else {
                if(!this.anim.getAnimationState("big_move").isPlaying && !this.anim.getAnimationState("big_jump").isPlaying)
                    this.anim.play("big_move");
            }

            // direction
            if(this.node.scaleX > 0)
                this.node.scaleX *= -1;
        }
        else if(this.rightDown){
            this.playerSpeed = 300;

            if(!this.isPower) {
                if(!this.anim.getAnimationState("move").isPlaying && !this.anim.getAnimationState("jump").isPlaying)
                    this.anim.play("move");
            }
            else {
                if(!this.anim.getAnimationState("big_move").isPlaying && !this.anim.getAnimationState("big_jump").isPlaying)
                    this.anim.play("big_move");
            }
            
            // direction
            if(this.node.scaleX < 0)
                this.node.scaleX *= -1;
        }
        else if(!this.upDown) {
            if(!this.isPower)
                this.anim.play("idle");
            else
                this.anim.play("big_idle");
        }

        if(this.upDown && this.onGround) {
            this.jump();
            if(!this.isPower) {
                if(!this.anim.getAnimationState("jump").isPlaying)
                    this.anim.play("jump");
            }
            else {
                if(!this.anim.getAnimationState("big_jump").isPlaying)
                    this.anim.play("big_jump");
            }
        }

        this.node.x += this.playerSpeed * dt;

        this.cameraMove(dt);
    }   

    littleJump() {
        this.onGround = false;

        this.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 500);
    }

    jump() {
        this.onGround = false;

        this.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 1100);
        this.playEffect(this.jumpSound);
    }

    addCoin_100(other) { //questionBox_coin
        let score = cc.instantiate(this.score100Prefab);
        score.parent = cc.find("Canvas");
        score.setPosition(other.node.x, other.node.y+50);

        let coin = cc.instantiate(this.coinPrefab);
        coin.parent = cc.find("Canvas");
        coin.setPosition(other.node.x, other.node.y+50);

        let add100 = cc.callFunc(function(target) {
            this.score += 100;
        }, this);

        let addcoin = cc.callFunc(function(target) {
            this.coin += 1;
        }, this);

        let destroy = cc.callFunc(function(target) {
            coin.destroy(); 
        }, this);

        let action0 = cc.sequence(cc.spawn(cc.moveBy(1, 0, 50), cc.fadeOut(1)), add100);  //score
        let action1 = cc.sequence(cc.moveBy(0.2, 0, 100), cc.moveBy(0.2, 0, -100), addcoin, destroy); //coin  

        score.runAction(action0);
        coin.runAction(action1);
    }

    stompEnemy_100(other) {
        let score = cc.instantiate(this.score100Prefab);
        score.parent = cc.find("Canvas");
        score.setPosition(other.node.x, other.node.y+50);

        let add100 = cc.callFunc(function(target) {
            this.score += 100;
        }, this);

        let destroy = cc.callFunc(function(target) {
            other.node.destroy(); 
        }, this);

        let action = cc.sequence(cc.spawn(cc.moveBy(1, 0, 50), cc.fadeOut(1)), add100, destroy); //enemy

        other.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 0);
        other.node.active = false;

        score.runAction(action);
    }

    eatMushroom_1000(other) {
        let score = cc.instantiate(this.score1000Prefab);
        score.parent = cc.find("Canvas");
        score.setPosition(this.node.x, this.node.y+50);

        let add1000 = cc.callFunc(function(target) {
            this.score += 1000;
        }, this);

        let destroy = cc.callFunc(function(target) {
            other.node.destroy(); 
        }, this);

        let action = cc.sequence(destroy, cc.spawn(cc.moveBy(1, 0, 50), cc.fadeOut(1)), add1000); //mushroom

        score.runAction(action);
    }

    powerUp() {
        this.isPower = true;
        this.isPause = true;
        let finished = cc.callFunc(function(target) {
            this.isPause = false;
            this.node.scaleX *= 2/3;
            this.node.scaleY *= 2/3;
            this.getComponent(cc.PhysicsBoxCollider).size.height = 25;
            this.getComponent(cc.PhysicsBoxCollider).size.weight = 18;
            this.node.scaleX *= -1;
            this.node.scaleX *= -1;
        }, this);
        let action = cc.sequence(
                        cc.repeat(
                            cc.sequence(
                                cc.scaleBy(0.2, 1.15), 
                                cc.hide(), 
                                cc.delayTime(0.1), 
                                cc.show()
                            ), 3
                        ),
                        finished
                    );

        this.node.runAction(action);
        this.playEffect(this.powerUpSound);
    }

    powerDown() {
        this.isPower = false;
        this.isPause = true;
        this.isStrong = true;
        let finished = cc.callFunc(function(target) {
            this.isPause = false;
            this.node.scaleX *= 3/2;
            this.node.scaleY *= 3/2; 
            this.getComponent(cc.PhysicsBoxCollider).size.height = 15;
            this.getComponent(cc.PhysicsBoxCollider).size.weight = 11.5;
            this.node.scaleX *= -1;
            this.node.scaleX *= -1;
            this.scheduleOnce(function() {
                this.isStrong = false;
            }, 1);
        }, this);
        let action = cc.sequence(
                        cc.repeat(
                            cc.sequence(
                                cc.scaleBy(0.2, 20/23), 
                                cc.hide(), 
                                cc.delayTime(0.1), 
                                cc.show()
                            ), 3
                        ),
                        finished
                    );
        this.node.runAction(action);
        this.playEffect(this.powerDownSound);
    }

    decrease() {
        if(!this.isStrong) {
            if(this.isPower) {
                this.powerDown();
            }
            else {
                if(!this.isPause)
                    this.loseLife();
            }
        }   
    }

    mushroomShow(other) {
        this.playEffect(this.mushroomSound);
        let mushroom = cc.instantiate(this.mushroomPrefab);
        mushroom.parent = cc.find("Canvas");
        mushroom.setPosition(other.node.x, other.node.y+50);
    }

    onBeginContact(contact, self, other) {
        if(this.isDead)
            return;
        if(other.tag == 0) { //gound
            cc.log("Player hits the ground");
            this.onGround = true;
        }
        else if(other.tag == 1) { //block 
            cc.log(contact.getWorldManifold().normal);
            cc.log("Player hits the block");
            if(contact.getWorldManifold().normal.x == 0 && contact.getWorldManifold().normal.y == -1) { //upside
                this.onGround = true;
            }
        }

        else if(other.tag == 2) { //questionBox
            cc.log("Player hits the questionBox");
            if(contact.getWorldManifold().normal.x == 0 && contact.getWorldManifold().normal.y == -1) { //upside
                this.onGround = true;
            }
            else if(contact.getWorldManifold().normal.x == 0 && contact.getWorldManifold().normal.y == 1) { //downside
                if(other.node.getComponent(cc.Sprite).spriteFrame != null) {
                    other.node.getComponent(cc.Sprite).spriteFrame = null;
                    if(other.node.name == "questionBox") {
                        cc.log("coin");
                        this.playEffect(this.coinSound);
                        this.addCoin_100(other);
                    }
                    else { //mushroom
                        cc.log("mushroom show");
                        this.mushroomShow(other);
                    }
                }
            }
        }
        else if(other.tag == 3) { //platform 
            cc.log("Player hits the platform");
            if(contact.getWorldManifold().normal.x == 0 && contact.getWorldManifold().normal.y == -1) { //upside
                this.onGround = true;
            }
            else {
                contact.disabled = true;
            }
        }

        else if(other.tag == 4) { //goomba
            cc.log("Player hits the goomba");
            if(contact.getWorldManifold().normal.x == 0 && contact.getWorldManifold().normal.y == -1) { //upside
                this.playEffect(this.stompSound);
                this.stompEnemy_100(other);
                this.littleJump();
            }
            else {
                this.decrease();
            }
        }
        else if(other.tag == 5) { //turtle
            cc.log("Player hits the turtle");
            if(contact.getWorldManifold().normal.x == 0 && contact.getWorldManifold().normal.y == -1) { //upside
                this.playEffect(this.stompSound);
                this.stompEnemy_100(other);
                this.littleJump();
            }
            else {
                this.decrease();
            }
        }
        else if(other.tag == 6) { //flower
            cc.log("Player hits the flower");
            this.decrease();
        }
        else if(other.tag == 7) { //mushroom
            cc.log("Player hits the mushroom");
            this.eatMushroom_1000(other);
            if(!this.isPower)
                this.powerUp();
            else
                this.playEffect(this.reserveSound);
        }
        else if(other.tag == 8) { //flag
            cc.log("Player hits the flag");
            this.win();
        }
    }
}
