import { Component } from '@angular/core';
import { DeckData } from '../../app/models';
import { DataProvider } from '../../providers/data/data';

@Component({
  selector: 'deck-list',
  templateUrl: 'deck-list.html'
})
export class DeckListComponent
{
  public get decks():DeckData[] { return this.data.decks.data; }
  
  public selectedDeck:DeckData;

  constructor( public data:DataProvider ) {}

  public select(deck:DeckData):void
  {
    this.selectedDeck = deck;
  }

  public add( slug:string ):void
  {
    if ( this.selectedDeck )
      this.selectedDeck.slugs.unshift( slug );
  }

  public remove( index:number ):void
  {
    if ( this.selectedDeck )
      this.selectedDeck.slugs.splice( index, 1 );
  }

  public move( index:number, offset:number ):void
  {
    if ( this.selectedDeck )
    {
      let slug = this.selectedDeck.slugs[index];
      this.selectedDeck.slugs.splice( index, 1 );
      this.selectedDeck.slugs.splice( index + offset, 0, slug );
    }
    else
    {
      let deck = this.decks[index];
      this.decks.splice( index, 1 );
      this.decks.splice( index + offset, 0, deck );
    }
  }

  public finish():void
  {
    this.data.events.publish( "list:resetmode" );
  }

  public stop(event) { event.stopPropagation() }
}
