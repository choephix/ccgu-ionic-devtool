import { PDCharacterData } from './../../app/models';
import { Component, ViewChild } from '@angular/core';
import { CardModel, CardType, CardSectionData } from '../../app/models';
import { DataProvider } from '../../providers/data/data';
import { CardViewPage } from '../card-view/card-view';
import { ModalController } from 'ionic-angular';
import { PdcListComponent } from '../../components/pdc-list/pdc-list';
import { DeckListComponent } from '../../components/deck-list/deck-list';

export class Mode { icon:string; name:string; show:string[] }

@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
  providers: [DataProvider]
})
export class ListPage 
{
  public static readonly PAGE_CARDS_COUNT:number = 256;
  public static readonly PAGE_COLUMNS:number = 16;
  public static readonly PAGE_ROWS:number = Math.ceil( ListPage.PAGE_CARDS_COUNT / ListPage.PAGE_COLUMNS );

  readonly Mode : 
  { Edit : Mode, PDCs : Mode, Quik : Mode, View : Mode, Deck : Mode } =
  {
    View : { icon : "eye"   , name : "view", show : ["rarity"] },
    Edit : { icon : "create", name : "edit", show : ["priority","status"] },
    Quik : { icon : "flash",  name : "quik", show : ["priority","status"] },
    PDCs : { icon : "person", name : "pdcs", show : ["status"] },
    Deck : { icon : "albums", name : "deck", show : ["priority","status"] },
  };
  
  readonly subheaderHeight:number = 24;
  readonly minCardWidth:number = 157;
  readonly minCardHeight:number = 120;
  readonly cardMargin:number = 1;
  readonly marginX:number = 8;
  readonly marginY:number = 8;

  readonly cardWidth:number;
  readonly cardHeight:number;
  readonly cardXFactor:number;
  readonly cardYFactor:number;

  get pageWidth():number
  { return this.cardXFactor * ListPage.PAGE_COLUMNS + 2 * this.marginX }
  get pageHeight():number
  { return this.cardYFactor * ListPage.PAGE_ROWS + this.marginY + this.minCardHeight }

  private get cards():Map<number,CardModel> { return this.data.cardsMap; }
  cardViews: Array<CardView> = [];

  selectedBundle : CardViewBundle = null;
  bundles : Array<CardViewBundle> = [];
  
  zoom:number = 1.0;
  mode:Mode = this.Mode.Edit;
  selectedCardIDs:Array<number> = [];

  showPrettyName:boolean = false;
  showID:boolean = false;

  @ViewChild('pdcList') pdcListView:PdcListComponent;
  @ViewChild('deckList') deckListView:DeckListComponent;
  @ViewChild('lescroll') lescroll:HTMLDivElement;
  
  constructor( private modalCtrl:ModalController, public data:DataProvider )
  {
    this.cardWidth = this.minCardWidth;
    this.cardHeight = this.minCardHeight;

    this.cardXFactor = this.cardWidth + this.cardMargin;
    this.cardYFactor = this.cardHeight + this.cardMargin;
    
    this.initializeBundles();

    for (let i = 0; i < ListPage.PAGE_CARDS_COUNT; i++)
      this.cardViews.push( { index : i, model : null } );

    /// INIT FROM LOCAL
    {
      let bundleIndex = parseInt( localStorage.getItem( "bundle-index" ) );
      if ( isNaN( bundleIndex ) || bundleIndex >= this.bundles.length )
        bundleIndex = 1;
      this.selectBundle(this.bundles[bundleIndex]);

      let mode = localStorage.getItem( "mode" );
      for ( let key in this.Mode )
        if ( <Mode>this.Mode[key] )
          if ( this.Mode[key].name == mode )
            this.setMode( this.Mode[key] );

      this.refresh();
    }

    document.body.addEventListener("keydown",e=>this.onKey(e));
    document.body.addEventListener("contextmenu",e=>{if(!e.altKey)e.preventDefault()});
    
    this.data.events.subscribe( "list:resetmode", () => this.setMode(this.Mode.Edit) );
    this.data.events.subscribe( "data:reload", (s:string) => this.refresh() );
  }

  onViewDidLoad():void
  {
  }

  private initializeBundles()
  {
    for ( let i = 0; i < 16; i++ )
    {
      this.bundles.push( { 
           name : i.toString(16),
           startIndex : i * ListPage.PAGE_CARDS_COUNT, 
           config : this.data.getCardSectionData( i )
      } );
    }
  }

  private refresh():void 
  { 
    console.log("refresh");

    for (let i = 0; i < this.bundles.length; i++)
      this.bundles[ i ].config = this.data.getCardSectionData( i );

    this.selectBundle(this.selectedBundle); 
  }

  onQuickChangeSlug(cv:CardView):void
  {
    let v:string = cv.model.properties.slug;

    if ( v.indexOf(':') > -1 )
    {
      let a = v.split(':');
      if ( a.length >= 2 )
      {
        v = a[0];
        cv.model.properties.power = Number.parseInt( a[1] );
      }
    }

    cv.model.properties.slug = v.replace(/[^0-9a-z-]/gi, '');
  }

  onQuickChangeDescription(cv:CardView):void
  {
    // var v:string = cv.model.properties.description;

  }

  onClick(cv:CardView)
  {
    if ( this.mode == this.Mode.Edit )
    {
      let cvID:number = this.getSupposedCardID( cv );
      let seleIndex:number = this.selectedCardIDs.indexOf( cvID );

      if ( this.selectedCardIDs.length < 1 )
      {
        if ( cv.model )
          this.selectedCardIDs.push( cvID );
      }
      else
      if ( seleIndex >= 0 )
      {
        this.selectedCardIDs.splice( seleIndex, 1 );
      }
      else
      {
        let seleID = this.selectedCardIDs[ 0 ];
        this.setCardID( this.cards[ seleID ], cvID );

        this.selectedCardIDs.length = 0;
        this.refresh();
      }
    }
    else
    if ( this.mode == this.Mode.Quik )
    {
      this.cleanupEmpty();

      if ( !cv.model )
        cv.model = this.makeCard( this.getSupposedCardID( cv ) );
    }
    else
    if ( this.mode == this.Mode.PDCs )
    {
      if( cv.model && this.pdcListView.selectedPDCs.length > 0 )
      {
        cv.model.setPDC( this.pdcListView.selectedPDCs[0] );
        this.pdcListView.selectedPDCs.length = 0;
      }
    }
    else
    if ( this.mode == this.Mode.Deck )
    {
      if ( cv.model )
        this.deckListView.add( cv.model.properties.slug );
    }
    else
    {
      this.selectedCardIDs.length = 0;
    }
  }

  onDoubleClick(cv:CardView)
  {
    if ( this.mode == this.Mode.PDCs )
    {
      // cv.model.setPDC( null );
      this.viewCard( this.getSupposedCardID(cv) );
    }
    else
    if ( this.mode == this.Mode.Edit )
    {
      this.viewCard( this.getSupposedCardID(cv) );
    }
  }

  onAuxClick(cv:CardView,e:MouseEvent)
  {
    if ( this.mode == this.Mode.PDCs )
    {
      cv.model.setPDC( null );
    }
    else
    if ( this.mode == this.Mode.Edit )
    {
      this.viewCard( this.getSupposedCardID(cv) );
    }
    else
    if ( this.mode == this.Mode.Quik && cv.model )
    {
      this.duplicate( cv );
    }
  }

  duplicate(cv:CardView)
  {
    let id = cv.model.ID;
    while ( this.cards[id] )
      id++;
    let c = this.makeCard( id );
    for ( let key in cv.model.properties )
      c.properties[key] = cv.model.properties[key];
    this.refresh();
  }

  onClickStatus(cv:CardView)
  {
    const A = [0,1,2,3,12];
    const i = (A.indexOf(cv.model.properties.status)+1)%A.length;
    cv.model.properties.status = A[i];
  }

  onKey(e:KeyboardEvent) 
  {
    if ( e.ctrlKey && e.key.toUpperCase() == "S" )
    {
      this.data.saveAll();
      e.preventDefault();
    }
    else
    if ( !e.ctrlKey && e.altKey && !e.shiftKey )
    {
      e.preventDefault();

      if ( e.keyCode >= 48 && e.keyCode <= 57 )
      {
        this.selectBundle(this.bundles[e.keyCode-48]);
      }
      else
      {
        switch ( e.key.toUpperCase() )
        {
          case "A": this.selectBundle(this.bundles[10]); break;
          case "B": this.selectBundle(this.bundles[11]); break;
          case "C": this.selectBundle(this.bundles[12]); break;
          case "D": this.selectBundle(this.bundles[13]); break;
          case "E": this.selectBundle(this.bundles[14]); break;
          case "F": this.selectBundle(this.bundles[15]); break;
          case "V": this.setMode(this.Mode.View); break;
          case "P": this.setMode(this.Mode.PDCs); break;
          case "Q": this.setMode(this.Mode.Quik); break;
          case "Z": this.setMode(this.Mode.Edit); break;
        }
      }
    }
  }

  private cleanupEmpty():void
  {
    this.cardViews.forEach( cv => { 
      if ( cv.model && cv.model.practicallyNull ) 
        this.data.deleteCard( cv.model.ID ); 
    } );
    this.refresh();
  }

  private viewCard( id:number ):void
  {
    let card:CardModel = this.cards[id] ? this.cards[id] : this.makeCard( id );
    let params = { del : false };
    
    console.log( params );
    let modal = this.modalCtrl.create( CardViewPage, { card : card, params : params } );

    modal.onDidDismiss(()=>
    {
      if ( params.del || card.practicallyNull )
        this.data.deleteCard( card.ID );
      this.refresh();
    });

    modal.present();
  }

  private makeCard( id:number ):CardModel
  {
    let card:CardModel = this.data.createCard( id );
    
    id = id % ListPage.PAGE_CARDS_COUNT;
    let col:number = Math.floor( id % ListPage.PAGE_COLUMNS );
    let row:number = Math.floor( id / ListPage.PAGE_ROWS );
    let props = this.getDefaultPropsFor( col, row );
    for ( let key in props )
      card.properties[key] = props[key];

    return card;
  }

  private setCardID( card:CardModel, id:number )
  {
    let coll = this.cards[id];
    if ( coll )
    {
      coll.setID( card.ID );
      this.cards[card.ID] = coll;
    }
    else
    {
      this.cards[card.ID] = null;
    }

    card.setID( id );
    this.cards[id] = card;
  }

  public getSupposedCardID( cv:CardView )
  { return this.selectedBundle.startIndex + cv.index; }

  public hasData( card:CardView ):boolean 
  { return card.model != null && card.model != undefined }
  public isSelected( card:CardView )
  { return this.selectedCardIDs.indexOf( this.getSupposedCardID( card ) ) >= 0 }

  public getX( i:number ):number 
  { return this.marginX + Math.floor( i % ListPage.PAGE_COLUMNS ) * this.cardXFactor; }
  public getY( i:number ):number
  { 
    return this.marginY 
         + Math.floor( i / ( 4 * ListPage.PAGE_COLUMNS ) + 1  ) * this.subheaderHeight
         + Math.floor( i / ListPage.PAGE_COLUMNS ) * this.cardYFactor; 
  }
  public getColorClass( card:CardView )
  {
    if( card.model )
    {
      if ( card.model.isTrap ) return "trap";
      if ( card.model.isGrand ) return "grand";
      if ( card.model.isSneak ) return "sneak";
      return "normal";
    }
    else
    {
      let col:number = Math.floor( card.index % ListPage.PAGE_COLUMNS );
      let row:number = Math.floor( card.index / ListPage.PAGE_ROWS );
      let props = this.getDefaultPropsFor( col, row );
      if ( props["type"] == CardType.Trap ) return "trap";
      if ( props["tags"] && props["tags"].indexOf( "grand" ) >= 0 ) return "grand";
      if ( props["tags"] && props["tags"].indexOf( "sneak" ) >= 0 ) return "sneak";
      return "normal";
    }
  }

  public selectBundle( bundle:CardViewBundle ): void 
  {
    this.selectedBundle = bundle;

    for (let i = 0; i < ListPage.PAGE_CARDS_COUNT; i++)
      this.cardViews[ i ].model = this.cards[ i + bundle.startIndex ];

    for (let i = 0; i < this.bundles.length; i++)
      if ( this.bundles[i] == bundle )
        localStorage.setItem( "bundle-index", i.toString() );
  }
  
  public getDefaultPropsFor( col:number, row:number )
  {
    let funcIndex = this.selectedBundle.config.subsections[Math.floor(row/4)].funcIndex;
    return CardViewBundle.PropsFunctions[ funcIndex ]( col, row );
  }

  public cycleBundlePropsFunction( subsectionIndex:number, offset:number ):void
  {
    let section = this.selectedBundle.config.subsections[subsectionIndex];
    section.funcIndex += offset;
    while( section.funcIndex >= CardViewBundle.PropsFunctions.length )
      section.funcIndex -= CardViewBundle.PropsFunctions.length;
    while( section.funcIndex < 0 )
      section.funcIndex += CardViewBundle.PropsFunctions.length;
  }

  public setMode( mode:Mode ):void
  { 
    this.mode = mode;
    localStorage.setItem( "mode", mode.name );
  }

  public getPriority( cv:CardView ):string
  {
    switch( cv.model.properties.priority )
    {
      case 7:  return '❕';
      case 8:  return '❗';
      case 9:  return '❗❗';
      case 10: return '🛑';
      default: return '';
    }
  }

  public getRarity( cv:CardView ):string
  {
    let s:string = '';
    for (let i = 0; i < cv.model.properties.rarity; i++) s += '⭐';
    return s;
  }

  public getPDC( cv:CardView ):PDCharacterData
  {
    if ( !cv.model ) return null;
    if ( !cv.model.hasPDC ) return null;
    return this.data.pdcMap[cv.model.properties.pdc];
  }
}

export class CardView {
  model:CardModel;
  index:number;
}

export class CardViewBundle {
  name: string;
  startIndex: number;
  config: CardSectionData;

  public static readonly PropsFunctions:((col:number,row:number)=>object)[] = [
    (col,row)=> { return DP.NRML },
    (col,row)=> { return DP.SNEK },
    (col,row)=> { return DP.GRND },
    (col,row)=> { return DP.TRAP },
    (col,row)=> { return col < 2 ? DP.SNEK : col < 10 ? DP.NRML : col < 12 ? DP.GRND : DP.TRAP },
    (col,row)=> { return col < 3 ? DP.SNEK : col < 9 ? DP.NRML : col < 12 ? DP.GRND : DP.TRAP },
    (col,row)=> { return col < 4 ? DP.SNEK : col < 12 ? DP.NRML : DP.GRND },
    (col,row)=> { return [DP.SNEK,DP.NRML,DP.NRML,DP.GRND][col%4] },
    (col,row)=> { return ( col % 4 > 3 ) ? DP.TRAP : [DP.SNEK,DP.SNEK,DP.NRML,DP.NRML,DP.NRML,DP.NRML,DP.GRND,DP.GRND][col%8] },
    (col,row)=> { return [DP.SNEK,DP.NRML,DP.GRND,DP.TRAP][row%4] },
    (col,row)=> { return [DP.NRML,DP.SNEK,DP.GRND,DP.TRAP][row%4] },
    (col,row)=> { return [DP.SNEK,DP.GRND][Math.floor(row/2)%2] },
    (col,row)=> { return [DP.SNEK,DP.TRAP][Math.floor(row/2)%2] },
    (col,row)=> { return [DP.NRML,DP.TRAP][Math.floor(row/2)%2] },
    (col,row)=> { return [DP.NRML,DP.TRAP][row%2] },
    (col,row)=> { return [DP.NRML,DP.TRAP][col%2] },
    (col,row)=> { return [DP.NRML,DP.GRND][row%2] },
    (col,row)=> { return [DP.NRML,DP.GRND][col%2] },
    (col,row)=> { return [DP.NRML,DP.GRND][(row+col)%2] },
    (col,row)=> { return [DP.NRML,DP.SNEK,DP.TRAP,DP.TRAP][row%4] },
    (col,row)=> { return [DP.SNEK,DP.GRND,DP.TRAP,DP.TRAP][row%4] },
  ];
}

class DP
{
  public static readonly TRAP = { type : CardType.Trap };
  public static readonly NRML = { type : CardType.Unit };
  public static readonly SNEK = { type : CardType.Unit, tags : ["sneak"] };
  public static readonly GRND = { type : CardType.Unit, tags : ["grand"] };
}