import { Component, ViewChild } from '@angular/core';
import { CardModel } from '../../app/models';
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
  private static readonly PAGE_CARDS_COUNT:number = 256;

  readonly Mode : 
  { Edit : Mode, Move : Mode, PDCs : Mode, View : Mode } =
  {
    Edit : { icon : "create", name : "edit", show : ["priority","status"] },
    Move : { icon : "resize", name : "move", show : ["priority","status","id"] },
    PDCs : { icon : "person", name : "pdcs", show : ["status"] },
    View : { icon : "eye"   , name : "view", show : ["rarity"] },
  };
  
  readonly minCardWidth:number = 157;
  readonly minCardHeight:number = 120;
  readonly cardMargin:number = 1;
  readonly marginX:number = 8;
  readonly marginY:number = 16;

  readonly cardWidth:number;
  readonly cardHeight:number;
  readonly cardXFactor:number;
  readonly cardYFactor:number;
  readonly cardColumnsCount:number;
  readonly cardRowsCount:number;

  private get cards():Map<number,CardModel> { return this.data.cards; }
  cardViews: Array<CardView> = [];

  selectedBundle : CardViewBundle = null;
  bundles : Array<CardViewBundle> = [];
  
  zoom:number = 1.0;
  mode:Mode = this.Mode.PDCs;
  // mode:Mode = this.Mode.Edit;
  selectedCardIDs:Array<number> = [];

  showPrettyName:boolean = false;

  @ViewChild('pdcList') pdcListView:PdcListComponent;
  
  constructor( private modalCtrl:ModalController, public data:DataProvider )
  {
    this.cardColumnsCount = 16;
    this.cardRowsCount = Math.ceil( ListPage.PAGE_CARDS_COUNT / this.cardColumnsCount );

    this.cardWidth = this.minCardWidth;
    this.cardHeight = this.minCardHeight;

    this.cardXFactor = this.cardWidth + this.cardMargin;
    this.cardYFactor = this.cardHeight + this.cardMargin;

    for ( let i = 0; i < 16; i++ )
      this.bundles.push( { 
           startIndex : i * ListPage.PAGE_CARDS_COUNT, 
           name : i.toString(16) } );

    for (let i = 0; i < ListPage.PAGE_CARDS_COUNT; i++)
      this.cardViews.push( { index : i, model : null } );

    this.selectBundle(this.bundles[0]);

    data.events.subscribe( "data:change", () => { this.refresh() } );
  }

  private refresh():void
  {
    console.log("<<refresh>>");
    this.selectBundle(this.selectedBundle);
  }

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

  private viewCard( id:number )
  {
    let card = this.cards[id] ? this.cards[id] : new CardModel( id );    
    let params = { del : false };
    
    console.log( params );
    let modal = this.modalCtrl.create( CardViewPage, { card : card, params : params } );

    modal.onDidDismiss(()=>
    {
      let del:boolean = params.del || card.practicallyNull;

      if ( del )
        delete this.cards[card.ID];
      else
        this.cards[id] = card;
      
      this.refresh();
    });

    modal.present();
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

  public hasData( card:CardView ):boolean { return card.model != null && card.model != undefined }
  public isSelected( card:CardView )
  { return this.selectedCardIDs.indexOf( this.getSupposedCardID( card ) ) >= 0 }

  public getX( i:number ):number { return this.marginX + Math.floor( i % this.cardColumnsCount ) * this.cardXFactor; }
  public getY( i:number ):number { return this.marginY + Math.floor( i / this.cardColumnsCount ) * this.cardYFactor; }
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
      var col:number = Math.floor( card.index % this.cardColumnsCount );
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