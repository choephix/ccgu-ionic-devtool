import { Component, ViewChild } from '@angular/core';
import { CardModel, CardType } from '../../app/models';
import { DataProvider } from '../../providers/data/data';
import { CardViewPage } from '../card-view/card-view';
import { FabContainer, ModalController } from 'ionic-angular';
import { PdcListComponent } from '../../components/pdc-list/pdc-list';

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
  { Edit : Mode, Move : Mode, PDCs : Mode, Quik : Mode, View : Mode } =
  {
    Edit : { icon : "create", name : "edit", show : ["priority","status"] },
    Move : { icon : "resize", name : "move", show : ["priority","status","id"] },
    PDCs : { icon : "person", name : "pdcs", show : ["status"] },
    Quik : { icon : "flash",  name : "quik", show : ["priority","status"] },
    View : { icon : "eye"   , name : "view", show : ["rarity"] },
  };
  
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

  private get cards():Map<number,CardModel> { return this.data.cards; }
  cardViews: Array<CardView> = [];

  selectedBundle : CardViewBundle = null;
  bundles : Array<CardViewBundle> = [];
  
  zoom:number = 1.0;
  mode:Mode = this.Mode.Edit;
  selectedCardIDs:Array<number> = [];

  showPrettyName:boolean = false;

  @ViewChild('pdcList') pdcListView:PdcListComponent;
  
  constructor( private modalCtrl:ModalController, public data:DataProvider )
  {
    this.cardWidth = this.minCardWidth;
    this.cardHeight = this.minCardHeight;

    this.cardXFactor = this.cardWidth + this.cardMargin;
    this.cardYFactor = this.cardHeight + this.cardMargin;
    
    this.initializeBundles();

    for (let i = 0; i < ListPage.PAGE_CARDS_COUNT; i++)
      this.cardViews.push( { index : i, model : null } );

    this.selectBundle(this.bundles[2]);

    data.events.subscribe( "data:reload", () => { this.refresh() } );
  }

  private initializeBundles()
  {
    for ( let i = 0; i < 16; i++ )
      this.bundles.push( { 
           startIndex : i * ListPage.PAGE_CARDS_COUNT, 
           name : i.toString(16) } );

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

  private refresh():void { this.selectBundle(this.selectedBundle); }

  public onClick(cv:CardView)
  {
    if ( this.mode == this.Mode.Edit )
    {
      this.viewCard( this.getSupposedCardID(cv) );
    }
    else
    if ( this.mode == this.Mode.Move )
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
    {
      this.selectedCardIDs.length = 0;
    }
  }

  public onDoubleClick(cv:CardView)
  {
    if ( this.mode == this.Mode.PDCs )
    {
      cv.model.setPDC( null );
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

    var col:number = Math.floor( id % ListPage.PAGE_COLUMNS );

    if ( col >= 12 )
      card.properties.type = CardType.Trap;
    else
    if ( col >= 10 )
      card.properties.description += "#grand \n";
    else
    if ( col < 2 )
      card.properties.description += "#sneak \n";

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
         + Math.floor( i / ( 4 * ListPage.PAGE_COLUMNS )  ) * 4 
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
      var col:number = Math.floor( card.index % ListPage.PAGE_COLUMNS );
      if ( col < 2 ) return "sneak";
      if ( col < 10 ) return "normal";
      if ( col < 12 ) return "grand";
      return "trap";
    }
  }

  public selectBundle( bundle:CardViewBundle ): void 
  {
    this.selectedBundle = bundle;
    for (let i = 0; i < ListPage.PAGE_CARDS_COUNT; i++)
      this.cardViews[ i ].model = this.cards[ i + bundle.startIndex ];
  }

  public setMode( mode:Mode, fab:FabContainer ):void { this.mode = mode; }

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
}

export class CardView {
  model:CardModel;
  index:number;
}

export class CardViewBundle {
  name: string;
  startIndex: number;
}