const {ccclass, property} = cc._decorator;

@ccclass
export default class SelectStage extends cc.Component {
    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    start() {
        this.playBGM();
        this.initInformation();
        this.initRankButton();
        this.initQuestionButton();
        this.initStage1Button();
        this.initStage2Button();
    }

    playBGM(){
        cc.audioEngine.playMusic(this.bgm, true);
    }

    stopBGM(){
        cc.audioEngine.pauseMusic();
    }

    initInformation() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                var email = user.email.split(".").join("_").replace(/@/g, "_");
    
                firebase.database().ref('users/' + email).once('value').then(snapshot => {
                    cc.log(snapshot.val().name);
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

    initRankButton() {
        firebase.database().ref('rank/').orderByChild("score").once("value", function (snapshot) {
            var user = []
            var score = []

            snapshot.forEach(function (item) {
                cc.log(item.key)
                user.push(item.key);
                score.push(item.val().score);
            })
            user.reverse();
            score.reverse(); 

            for (var i = 1; i <= 10 && i <= user.length; i++) {
                cc.find("Canvas/menu_bg/rank_text/"+String(i)).getComponent(cc.Label).string = String(i);
                cc.find("Canvas/menu_bg/rank_text/user"+String(i)).getComponent(cc.Label).string = user[i-1];
                cc.find("Canvas/menu_bg/rank_text/score"+String(i)).getComponent(cc.Label).string = score[i-1];
            }
        })
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "SelectStage";
        clickEventHandler.handler = "rank";

        cc.find("Canvas/menu_bg/rank").getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    initQuestionButton() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "SelectStage";
        clickEventHandler.handler = "question";

        cc.find("Canvas/menu_bg/question").getComponent(cc.Button).clickEvents.push(clickEventHandler);
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

    rank() {
        cc.find("Canvas/menu_bg/rank_text").active = !cc.find("Canvas/menu_bg/rank_text").active;
    }

    question() {
        cc.find("Canvas/menu_bg/question_text").active = !cc.find("Canvas/menu_bg/question_text").active;
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
