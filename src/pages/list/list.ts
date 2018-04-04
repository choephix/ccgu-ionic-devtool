import { Component } from '@angular/core';
import { CardModel } from '../../app/models';
import { DataProvider } from '../../providers/data/data';
import { CardViewPage } from '../card-view/card-view';
import { FabContainer, ModalController } from 'ionic-angular';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
  providers: [DataProvider]
})
export class ListPage 
{
  private static readonly PAGE_CARDS_COUNT:number = 256;

  cards:CardMap = {};
  cardViews: Array<CardView> = [];

  selectedBundle : CardViewBundle = null;
  bundles : Array<CardViewBundle> = [];

  public minCardWidth:number = 157;
  public minCardHeight:number = 120;
  public cardMargin:number = 1;
  public marginX:number = 8;
  public marginY:number = 16;

  public cardWidth:number;
  public cardHeight:number;
  public cardXFactor:number;
  public cardYFactor:number;
  public cardColumnsCount:number;
  public cardRowsCount:number;

  public zoom:number = 1.0;
  public mode:Mode = Mode.Edit;
  public selectedCardIDs:Array<number> = [];

  constructor( private modalCtrl:ModalController, public data:DataProvider )
  {
    this.cards = data.getCards();

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

    for (let i = 0; i < 13; i++)
    {
        this.cards[64+i] = new CardModel();
        this.cards[64+i].slug = "status-" + i;
        this.cards[64+i].power = i;
        this.cards[64+i].status = i;
    }

    for (let i = 0; i <= 10; i++)
    {
        this.cards[80+i] = new CardModel();
        this.cards[80+i].slug = "rarity-" + i;
        this.cards[80+i].power = i;
        this.cards[80+i].rarity = i;
    }

    for (let i = 0; i <= 10; i++)
    {
        this.cards[96+i] = new CardModel();
        this.cards[96+i].slug = "priority-" + i;
        this.cards[96+i].power = i;
        this.cards[96+i].priority = i;
    }

    for (let i = 0; i <= 10; i++)
    {
        this.cards[112+i] = new CardModel();
        this.cards[112+i].slug = "fullstack-" + i;
        this.cards[112+i].power = 10+i;
        this.cards[112+i].status = i;
        this.cards[112+i].rarity = i;
        this.cards[112+i].priority = i;
    }

    for (let i = 0; i < ListPage.PAGE_CARDS_COUNT; i++)
      this.cardViews.push( { index : i, data : null } );

    this.selectBundle(this.bundles[0]);
  }

  public onSelect(cv:CardView)
  {
    if ( this.mode == Mode.Edit )
    {
      this.viewCard( this.getSupposedCardID(cv) );
    }
    else
    if ( this.mode == Mode.Swap )
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
        this.selectBundle(this.selectedBundle);
      }
    }
    else
    {
      this.selectedCardIDs.length = 0;
    }

    this.data.load();
  }

  private viewCard( id:number )
  {
    let card = this.cards[id] ? this.cards[id] : new CardModel();    
    let params = { del : false };
    
    card.id = id;

    console.log( params );
    let modal = this.modalCtrl.create( CardViewPage, { card : card, params : params } );

    modal.onDidDismiss(()=>
    {
      let del:boolean = params.del || ( !card.slug && !card.description );

      if ( del )
        delete this.cards[card.id];
      else
        this.cards[id] = card;
      
      this.selectBundle(this.selectedBundle);
    });

    modal.present();
  }

  private setCardID( card:CardModel, id:number )
  {
    let coll = this.cards[id];
    if ( coll )
    {
      coll.id = card.id;
      this.cards[card.id] = coll;
    }
    else
    {
      this.cards[card.id] = null;
    }

    card.id = id;
    this.cards[id] = card;
  }

  public getSupposedCardID( cv:CardView )
  { return this.selectedBundle.startIndex + cv.index; }

  public hasData( card:CardView ):boolean { return card.data != null && card.data != undefined }
  public isSelected( card:CardView )
  { return this.selectedCardIDs.indexOf( this.getSupposedCardID( card ) ) >= 0 }

  public getX( i:number ):number { return this.marginX + Math.floor( i % this.cardColumnsCount ) * this.cardXFactor; }
  public getY( i:number ):number { return this.marginY + Math.floor( i / this.cardColumnsCount ) * this.cardYFactor; }
  public getColorClass( card:CardView )
  {
    if( card.data )
    {
      if ( card.data.isTrap ) return "trap";
      if ( card.data.isGrand ) return "grand";
      if ( card.data.isSneak ) return "sneak";
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
      this.cardViews[ i ].data = this.cards[ i + bundle.startIndex ];
  }

  public setMode( mode:number, fab:FabContainer ):void { this.mode = mode; }

  public getModeIcon( mode:number ):string
  {
    if ( mode == Mode.Edit ) return "create";
    if ( mode == Mode.Swap ) return "resize";
    if ( mode == Mode.Special ) return "star";
    return "cog";
  }

  public getPriority( cv:CardView ):string
  {
    switch( cv.data.priority )
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
    for (let i = 0; i < cv.data.rarity; i++) s += '⭐';
    return s;
  }
}

const enum Mode { Edit, Swap, Special }

export class CardView {
  data:CardModel;
  index:number;
}

export class CardViewBundle {
  name: string;
  startIndex: number;
}

export class CardMap {[id:number]:CardModel}