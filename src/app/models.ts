
export class CardModel
{
    properties:CardData = new CardData();
    pdc:PDCharacterData = null;

    constructor( id:number ) { this.properties.id = id }

    public setID( value:number ):void { this.properties.id = value }

    public get hasPDC():boolean { return (Boolean)(this.pdc) }
    public get hasName():boolean { return (Boolean)(this.properties.name) }

    public get ID():number { return this.properties.id  }
    public get prettyName():string { return this.hasName ? this.properties.name : this.properties.slug }
    public get prettyDescription():string { return this.properties.description }
    public get prettyPower():string 
    { return this.properties.power > -1 ? String(this.properties.power) : '?' }

    public get isUnit():boolean
    { return this.properties.type == CardType.Unit }

    public get isTrap():boolean
    { return this.properties.type == CardType.Trap }

    public get isGrand():boolean
    { return this.properties.description.toLowerCase().indexOf("#grand") > -1 }

    public get isSneak():boolean
    { return this.properties.description.toLowerCase().indexOf("#sneak") > -1 }

    public get prettyStatus():string
    { return CardModel.LOOKUP_STATUS[this.properties.status].text; }

    public get prettyStatusColor():string
    { return CardModel.LOOKUP_STATUS[this.properties.status].color; }

    public get practicallyNull():boolean
    { return !this.properties.slug && !this.properties.description }
    
    public static readonly LOOKUP_STATUS:StatusViewProperties[] = [
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

export enum CardType { Unit, Trap }

/// -> JSON

export class CardData
{
    id: number = 0;
    slug: string;
    name: string = "";
    c: string = '';
    power: number = 0;
    description: string = "";
    rarity: number = 0;
    priority: number = 0;
    status: number = 0;
    type: CardType;

    tags:Array<string> = ["grand","rush","noattack"];
}

export class PDCharacterData
{
    origin: string;
    name: string = "";
}