
export class CardModel
{
    public properties:CardData = new CardData();
    private pdc:PDCharacterData = null;
    constructor( id:number ) { this.properties.id = id }

    public setID( value:number ):void { this.properties.id = value }
    public setPDC( pdc:PDCharacterData ):void
    {
        this.pdc = pdc; 
        this.properties.pdc = pdc ? pdc.id : -1;
        this.properties.name = pdc ? pdc.name : null;
    }

    public get hasPDC():boolean { return (Boolean)(this.pdc) }
    public get hasName():boolean { return (Boolean)(this.properties.name) }

    public get ID():number 
    { return this.properties.id  }
    public get PDC():PDCharacterData 
    { return this.pdc  }
    public get prettyName():string
    { return this.hasPDC ? this.pdc.name : this.hasName ? this.properties.name : this.properties.slug }
    public get prettyDescription():string 
    { return this.properties.description }
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
    type: CardType;
    slug: string;
    name: string = "";
    power: number = 0;
    description: string = "";
    // tags:Array<string> = ["grand","rush","noattack"];
    rarity: number = 0;
    
    c: string = '';
    pdc:number = -1;
    status: number = 0;
    priority: number = 0;
}

export class PDCharacterData
{
    id:number;
    origin: string;
    name: string = "";
}