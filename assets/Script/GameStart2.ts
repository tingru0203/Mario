const {ccclass, property} = cc._decorator;

@ccclass
export default class GameStart2 extends cc.Component {
    onLoad() {
        
    }
    start() {
        this.schedule(function() {
            cc.director.loadScene("Stage2");
        }, 2);
    }
}
