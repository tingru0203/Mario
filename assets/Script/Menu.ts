const {ccclass, property} = cc._decorator;

@ccclass
export default class Menu extends cc.Component {
    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    start() {
        this.playBGM();
        this.initLoginButton();
        this.initSignupButton();
    }

    playBGM(){
        cc.audioEngine.playMusic(this.bgm, true);
    }

    stopBGM(){
        cc.audioEngine.pauseMusic();
    }

    initLoginButton() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "Menu";
        clickEventHandler.handler = "login";

        cc.find("Canvas/menu_bg/Login").getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    initSignupButton() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "Menu";
        clickEventHandler.handler = "signup";

        cc.find("Canvas/menu_bg/Signup").getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    login() {
        cc.director.loadScene("Login");
    }

    signup() {
        cc.director.loadScene("Signup");
    }
}
