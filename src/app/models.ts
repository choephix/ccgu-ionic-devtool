export class CardModel
{
    public properties:CardData = new CardData();
    
    private constructor( data:CardData ) { this.properties = data }
    public static makeFromData( data:CardData ):CardModel
    { return new CardModel( data ) }
    public static makeClean( id:number ):CardModel
    { return new CardModel( { id : id, slug : "", type : CardType.Unit } ) }

    public setID( value:number ):void { this.properties.id = value }
    public setPDC( pdc:PDCharacterData ):void
    {
        this.properties.pdc = pdc ? pdc.guid : null;
        this.properties.name = pdc ? pdc.name : null;
    }
    public toggleTag(tag:string):void
    {
        let i = this.properties.tags.indexOf(tag);
        if ( i < 0 )
            this.properties.tags.unshift(tag);
        else
            this.properties.tags.splice(i,1);
    }

    public get hasPDC():boolean { return (Boolean)(this.properties.pdc) }
    public get hasName():boolean { return (Boolean)(this.properties.name) }

    public get ID():number 
    { return this.properties.id  }
    public get prettyName():string
    { return this.hasName ? this.properties.name : this.properties.slug }
    public get prettyDescription():string 
    { return this.properties.description }
    public get prettyPower():string 
    { return this.properties.power > -1 ? String(this.properties.power) : '?' }

    public get isUnit():boolean
    { return this.properties.type == CardType.Unit }
    public get isTrap():boolean
    { return this.properties.type == CardType.Trap }
    public get isGrand():boolean
    { return this.properties.tags.indexOf("grand") > -1 }
    public get isSneak():boolean
    { return this.properties.tags.indexOf("sneak") > -1 }

    public get prettyStatus():string
    { return CardModel.LOOKUP_STATUS[this.properties.status].text; }
    public get prettyStatusColor():string
    { return CardModel.LOOKUP_STATUS[this.properties.status].color; }

    public get practicallyNull():boolean
    { return !this.properties.slug && 
    ( !this.properties.description || this.properties.description.length < 10 ) }
    
    public static readonly LOOKUP_STATUS:StatusViewProperties[] = [
        { text:"Draft", color:"none" },
        { text:"Concept", color:"none" },
        { text:"Unimplemented", color:"#E33" },
        { text:"Unfinished", color:"#FF0" },
        { text:"Untested", color:"#AF0" },
        { text:"Alpha", color:"#CAD" },
        { text:"Beta", color:"#BBD" },
        { text:"NoArt", color:"#0BF" },
        { text:"Unpolished", color:"#2DF" },
        { text:"Ready", color:"#FFF" },
        { text:"Published", color:"none" },
        { text:"Retired", color:"none" },
        { text:"Skip", color:"#333" },
    ]
}

export class StatusViewProperties { text:string; color:string }

export enum CardType { Unit, Trap }

/// -> JSON

export class CardData
{
    id: number = 0;
    type: CardType = CardType.Unit;
    slug: string;
    name?: string = "";
    power?: number = 0;
    description?: string = "";
    tags?:Array<string> = [];
    rarity?: number = 0;
    
    c?: string = '';
    pdc?: string = null;
    status?: number = 0;
    priority?: number = 0;
}

export class PDCharacterData
{
    origin:string;
    name:string;
    notes_character:string;
    notes_cardstats:string;
    tags:string[];
    faction:string;
    guid:string;
}

export class CardSectionData 
{
  public subsections:CardSubSectionData[] = [
      { funcIndex : 0, header : "Le Section One" },
      { funcIndex : 0, header : "Le Section Two" },
      { funcIndex : 0, header : "Le Section Three" },
      { funcIndex : 0, header : "Le Section Four" },
  ]
}

export class CardSubSectionData { public funcIndex:number; public header:string; }