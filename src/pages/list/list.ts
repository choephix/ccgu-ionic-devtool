import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  selectedItem: any;
  icons: string[];
  cards: Array<{index:number, title: string, note: string, icon: string}>;

  headersX:Array<string>;
  headersY:Array<string>;

  constructor( private navCtrl: NavController, navParams: NavParams, private platform:Platform )
  {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    // Let's populate this page with some filler content for funzies
    this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane',
    'american-football', 'boat', 'bluetooth', 'build'];

    this.cards = [];
    for (let i = 0; i < 256; i++) {
      this.cards.push({
        index: i,
        title: 'Item ' + i,
        note: 'This is item #' + i,
        icon: this.icons[Math.floor(Math.random() * this.icons.length)]
      });
    }

    this.onResize(null);
  }

  public onResize(event)
  {
    console.log( "RESIZE: " + ( event == null ? "null" : event.target.innerWidth ) );
    // this.cards[0].title = "RESIZE: " + event.target.innerWidth;

    this.cardColumnsCount = 16;
    this.cardRowsCount = Math.ceil( this.cards.length / this.cardColumnsCount );

    this.cardWidth = this.minCardWidth;
    this.cardHeight = this.minCardHeight;

    this.cardXFactor = this.cardWidth + this.cardMargin;
    this.cardYFactor = this.cardHeight + this.cardMargin;

  }

  public minCardWidth:number = 160;
  public minCardHeight:number = 120;
  public cardMargin:number = 2;

  public cardWidth:number;
  public cardHeight:number;
  public cardXFactor:number;
  public cardYFactor:number;
  public cardColumnsCount:number;
  public cardRowsCount:number;
  

  // {return this.minCardWidth + ( this.platform.width() % this.minCardWidth ) / this.countCols() }
  // countCols():number { return Math.floor( this.platform.width() / this.minCardWidth ) }
  // countRows():number { return 10 }

  public getX( i:number ):number { return Math.floor( i % this.cardColumnsCount ) * this.cardXFactor; }
  public getY( i:number ):number { return Math.floor( i / this.cardColumnsCount ) * this.cardYFactor; }
  public getColorClass( card )
  {
    var col:number = Math.floor( card.index % this.cardColumnsCount );
    if ( col < 2 ) return "sneak";
    if ( col < 10 ) return "normal";
    if ( col < 12 ) return "grand";
    return "trap";
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(ListPage, {
      item: item
    });
  }

  public selectFilter(segment:CardFilter): void {
    this.selectedSegment = segment;
      // Handle what to do when a category is selected
  }

  // Method executed when the slides are changed
  public slideChanged(): void {
  }

  selectedSegment : CardFilter = null

  segments : Array<CardFilter> = [
     { name : "0" },
     { name : "1" },
     { name : "2" },
     { name : "3" },
     { name : "4" },
     { name : "5" },
     { name : "6" },
     { name : "7" },
     { name : "8" },
     { name : "9" },
     { name : "A" },
     { name : "B" },
     { name : "C" },
     { name : "D" },
     { name : "E" },
     { name : "F" },
    ]
}

export class CardFilter {
  name: string;
}