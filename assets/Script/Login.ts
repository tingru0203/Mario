const {ccclass, property} = cc._decorator;

@ccclass
export default class Login extends cc.Component {
    start() {
        this.initLoginButton();
    }

    initLoginButton() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "Login";
        clickEventHandler.handler = "login";

        cc.find("Canvas/menu_bg/orange/Login").getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    login() {
        var email = cc.find("Canvas/menu_bg/orange/Email").getComponent(cc.EditBox).string;
        var password = cc.find("Canvas/menu_bg/orange/Password").getComponent(cc.EditBox).string;
        firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
            alert("Successfully Signed In!");
            cc.director.loadScene("SelectStage");
        }).catch(error => { 
            alert(error.message); 
        });
    }
}
