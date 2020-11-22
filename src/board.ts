import {getKey} from './utils';

function deepCopy<T>(target: T): T {
    return JSON.parse(JSON.stringify(target));
}

interface IPoint {
    readonly x: number,
    readonly y: number
}

const NULL = ' ';
const PLAYER = '*';
const AIR = ' ';
const GRASS = '.';
const HEART = '$';
const DOOR = '!';
const WALL = '%';
const STONE = '@';
const specialMap = [STONE, HEART];

class Board {
    readonly height: number;
    readonly width: number;

    private heartsToComplete: 0;
    private playerHearts: 0;
    private mapArr: Array<Array<any>>;
    private level: Array<Array<string>>;
    private container: any
    private playerPosition: IPoint

    constructor(width: number, height: number, mapArr: Array<Array<string>>, container) {
        this.width = width;
        this.height = height;
        this.mapArr = deepCopy(mapArr);
        this.level = mapArr;

        this.container = container;
        this.init()
    }

    init() {
        this.buildLevel();

        this.container.parentNode.addEventListener('keydown', (e) => {
            e.preventDefault();

            const key = getKey(e);
            const map = [37, 38, 39, 40]
            if (map.indexOf(key) != -1) {
                this.playerMove(map.indexOf(key));
            } else if (key == 27) {
                this.restartLevel();
            }
        });

        setInterval(() => {
            this.printBoard();
        }, 16);

        setInterval(() => {
            this.gravity();
            this.observeStones();
        }, 120);
    }

    playerMove(key) {
        let {x, y} = this.playerPosition;
        if (key === 0) {
            this.setPlayerPosition({x: x - 1, y})
        } else if (key === 2) {
            this.setPlayerPosition({x: x + 1, y})
        } else if (key === 1) {
            this.setPlayerPosition({x, y: y - 1})
        } else if (key === 3) {
            this.setPlayerPosition({x, y: y + 1})
        }
    }

    observeStones() {
        this.iteration((point) => {
            const block = this.getBlock(point);

            if (specialMap.indexOf(block) !== -1) {
                const under = this.getBlock({x: point.x , y: point.y - 1});

                if (this.isInBounds({x: point.x - 1, y: point.y + 1})) {
                    if ((this.getBlock({x: point.x - 1, y: point.y}) == AIR) && (this.getBlock({
                        x: point.x - 1,
                        y: point.y + 1
                    }) == AIR) && (this.getBlock(under) !== GRASS)) {
                        this.setBlock(point, AIR);
                        this.setBlock({x: point.x - 1, y: point.y}, specialMap[specialMap.indexOf(block)])
                    }
                }
                if (this.isInBounds({x: point.x + 1, y: point.y + 1})) {
                    if ((this.getBlock({x: point.x + 1, y: point.y}) == AIR) && (this.getBlock({
                        x: point.x + 1,
                        y: point.y + 1
                    }) == AIR) && (this.getBlock(under) !== GRASS)) {
                        this.setBlock(point, AIR);
                        this.setBlock({x: point.x + 1, y: point.y}, specialMap[specialMap.indexOf(block)])
                    }
                }


            }
        })


    }

    gravity() {
        this.iteration((point) => {
            const block = this.getBlock(point);
            if (specialMap.indexOf(block) !== -1) {
                if (this.isInBounds({x: point.x, y: point.y + 1})) {
                    if (this.getBlock({x: point.x, y: point.y + 1}) == AIR) {
                        this.setBlock(point, AIR);
                        this.setBlock({x: point.x, y: point.y + 1}, specialMap[specialMap.indexOf(block)])
                    }
                }
            }
        })
    }

    isInBounds(point) {
        return (0 > point.x) || (this.width <= point.x) ? false : !((0 > point.y) || (this.height <= point.y));
    }

    setPlayerPosition(newPosition) {
        if (!this.isInBounds(newPosition)) return;

        const nextBlock = this.getBlock(newPosition);
        if (nextBlock === STONE) {
            const next = this.getBlock({x: newPosition.x + 1, y: newPosition.y});
            const prev = this.getBlock({x: newPosition.x - 1, y: newPosition.y});

            if (!this.isInBounds({x: newPosition.x + 1, y: newPosition.y})) return;
            if (!this.isInBounds({x: newPosition.x - 1, y: newPosition.y})) return;

            if (((next === AIR) || (prev === AIR)) && newPosition.y === this.playerPosition.y) {
                this.setBlock(this.playerPosition, NULL);
                this.setBlock(newPosition, PLAYER);
                this.playerPosition = newPosition;
                if (next == AIR) {
                    this.setBlock({x: newPosition.x + 1, y: newPosition.y}, STONE);
                } else if (prev == AIR) {
                    this.setBlock({x: newPosition.x - 1, y: newPosition.y}, STONE);
                }
            }
        } else if (nextBlock === HEART) {
            this.setBlock(this.playerPosition, NULL);
            this.setBlock(newPosition, PLAYER);
            this.playerPosition = newPosition;
            this.playerHearts++;
            console.log(this.playerHearts , this.heartsToComplete)

        } else if (nextBlock === DOOR) {
            if (this.playerHearts === this.heartsToComplete) {
                this.setBlock(this.playerPosition, NULL);
                this.setBlock(newPosition, PLAYER);
                this.playerPosition = newPosition;
                this.win();
                console.log('win')
            }
        } else if ((nextBlock === GRASS) || (nextBlock === NULL)) {
            this.setBlock(this.playerPosition, NULL);
            this.setBlock(newPosition, PLAYER);
            this.playerPosition = newPosition;
        }
    }

    getBlock(point: IPoint) {
        if (this.mapArr[point.y]) {
            return this.mapArr[point.y][point.x]
        }
    }

    win() {
        let i = 0
        this.iteration((point) => {
            i++;
            setTimeout(() => {
                this.setBlock(point, 'W');
            }, 20 * i);
        })
    }

    private setBlock(point: IPoint, type: any) {
        this.mapArr[point.y][point.x] = type
    }

    iteration(cb: (point: IPoint) => void) {
        for (let y = this.height - 1; y >= 0; y--) {
            let x = 0;
            for (; x < this.width; x++) {
                cb({x, y})
            }
        }
    }

    buildLevel() {
        this.initBlocks();
    }

    initBlocks() {
        this.heartsToComplete = 0;
        this.playerHearts = 0;

        this.iteration((point) => {
            const block = this.getBlock(point);
            if (block === HEART) {
                this.heartsToComplete++
            }

            if (block === PLAYER) {
                this.playerPosition = point;
            }

            this.setBlock(point, block);
        })
    }

    restartLevel() {
        this.mapArr = deepCopy(this.level);
        this.initBlocks();
    }

    printBoard() {
        this.container.innerHTML = ''
        for (let y = 0; y < this.height; y++) {
            let row = ''
            for (let x = 0; x < this.width; x++) {
                row += this.getBlock({x, y})
            }
            this.container.innerHTML += row + `
            `
        }
    }
}

export default Board