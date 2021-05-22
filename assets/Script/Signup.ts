const {ccclass, property} = cc._decorator;

@ccclass
export default class Signup extends cc.Component {
    start() {
        this.initSignupButton();
    }

    initSignupButton() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "Signup";
        clickEventHandler.handler = "signup";

        cc.find("Canvas/menu_bg/orange/Signup").getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    signup() {
        var username = cc.find("Canvas/menu_bg/orange/Username").getComponent(cc.EditBox).string.toUpperCase();
        var email = cc.find("Canvas/menu_bg/orange/Email").getComponent(cc.EditBox).string;
        var password = cc.find("Canvas/menu_bg/orange/Password").getComponent(cc.EditBox).string;
        firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
            firebase.database().ref('rank/' + username).set({
              score: 0
            })
            firebase.database().ref('users/' + email.split(".").join("_").replace(/@/g, "_")).set({
              name: username,
              email: email,
              password: password,
              life: 5,
              coin: 0,
              score: 0,
            }).then(() => { 
              alert("Successfully Signed Up!");
              cc.director.loadScene("SelectStage");
            }).catch(error => { 
              alert(error.message); 
            });
          }).catch(error => { 
            alert(error.message); 
          });

        //cc.log(email.split(".").join("_").replace(/@/g, "_"));
    }
}

/**/