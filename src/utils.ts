




export function getKey(e: any): number {
    /**
     37 - left
     38 - up
     39 - right
     40 - down
     27 - escape
     13 - enter
     9 - tab
     */

    return  e.which || e.keyCode;
}

export function mapBlock(s: string, point: IPoint) :any {

}