
export class CardModel {
    id: number = 0;
    slug: string;
    name: string = "";
    c: string = '';
    isTrap: boolean = false;
    power: number = 0;
    description: string = "";
    rarity: number = 0;
    priority: number = 0;
    status: number = 0;

    tags:Array<string> = ["Grand","storm","noattack"];

    public get isGrand():boolean
    { return this.description.toLowerCase().indexOf("#grand") > -1 }

    public get isSneak():boolean
    { return this.description.toLowerCase().indexOf("#sneak") > -1 }

    public get prettyStatus():string
    { return StatusViewGuru.ARRAY[this.status].text; }

    public get prettyStatusColor():string
    { return StatusViewGuru.ARRAY[this.status].color; }
}

export class StatusViewGuru
{
    public static readonly ARRAY:StatusViewProperties[] = [
        { text:"Draft", color:"#none" },
        { text:"Concept", color:"#none" },
        { text:"Unimplemented", color:"#E33" },
        { text:"Unfinished", color:"#FF0" },
        { text:"Untested", color:"#AF0" },
        { text:"Alpha", color:"#CAD" },
        { text:"Beta", color:"#BBD" },
        { text:"NoArt", color:"#0BF" },
        { text:"Unpolished", color:"#2DF" },
        { text:"Ready", color:"#FFF" },
        { text:"Published", color:"#none" },
        { text:"Retired", color:"#none" },
        { text:"Skip", color:"#333" },
    ]
}

export class StatusViewProperties { text:string; color:string }