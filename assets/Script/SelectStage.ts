const {ccclass, property} = cc._decorator;

@ccclass
export default class SelectStage extends cc.Component {
    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    playBGM(){
        cc.audioEngine.playMusic(this.bgm, true);
    }

    stopBGM(){
        cc.audioEngine.pauseMusic();
    }

    start() {
        this.playBGM();
        this.initInformation();
        this.initStage1Button();
        this.initStage2Button();
    }

    initInformation() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                var email = user.email.split(".").join("_").replace(/@/g, "_");
    
                firebase.database().ref('users/' + email).once('value').then(snapshot => {
                    cc.find("Canvas/menu_bg/username").getComponent(cc.Label).string = snapshot.val().name;
                    cc.find("Canvas/menu_bg/lifeNum").getComponent(cc.Label).string = snapshot.val().life;
                    cc.find("Canvas/menu_bg/coinNum").getComponent(cc.Label).string = snapshot.val().coin;
                    cc.find("Canvas/menu_bg/scoreNum").getComponent(cc.Label).string = (Array(7).join("0") + snapshot.val().score).slice(-7);;
                });
            }
            else { // No user is signed in.
                cc.director.loadScene("Menu");
            }
        });
    }

    initStage1Button() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "SelectStage";
        clickEventHandler.handler = "stage1";

        cc.find("Canvas/menu_bg/Stage1").getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    initStage2Button() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "SelectStage";
        clickEventHandler.handler = "stage2";

        cc.find("Canvas/menu_bg/Stage2").getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    stage1() {
        this.stopBGM();
        cc.director.loadScene("GameStart1");
    }

    stage2() {
        this.stopBGM();
        cc.director.loadScene("GameStart2");
    }
}
