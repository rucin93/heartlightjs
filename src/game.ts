import Board from './board';
import {getLevel} from "./levels";

function readInit (input) {
    return input.trim().split('|');
}
class Game {
    public BOARDSIZEX = 20;
    public BOARDSIZEY = 12;
    private board = null
    private currentLevel = 0
    private levelArr: Array<Array<string>>;

    constructor(container) {
        this.loadLevel(this.currentLevel);

        this.board = new Board(this.BOARDSIZEX, this.BOARDSIZEY, this.levelArr, container);
    }

    loadLevel(n = 0) {
        this.levelArr = [];

        readInit(getLevel(n)).forEach(row => {
            const rowArr = [];

            [...row].forEach(item => {
                rowArr.push(item);
            });

            this.levelArr.push(rowArr);
        })
    }

}


export default Game