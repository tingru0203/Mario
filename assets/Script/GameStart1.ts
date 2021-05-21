const {ccclass, property} = cc._decorator;

@ccclass
export default class GameStart1 extends cc.Component {
    onLoad() {
        
    }
    start() {
        this.schedule(function() {
            cc.director.loadScene("Stage1");
        }, 2);
    }
}
