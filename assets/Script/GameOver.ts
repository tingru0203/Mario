const {ccclass, property} = cc._decorator;

@ccclass
export default class GameOver extends cc.Component {
    onLoad() {
        
    }
    start() {
        this.scheduleOnce(function() {
            cc.director.loadScene("SelectStage");
        }, 5);
    }
}
