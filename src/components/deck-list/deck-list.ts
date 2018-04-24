import { Component } from '@angular/core';
import { DeckData } from '../../app/models';
import { DataProvider } from '../../providers/data/data';
import { PrettyProvider } from '../../providers/pretty/pretty';

@Component({
  selector: 'deck-list',
  templateUrl: 'deck-list.html'
})
export class DeckListComponent
{
  public get decks():DeckData[] { return this.data.decks.data; }
  
  public selectedDeck:DeckData;

  constructor( public data:DataProvider, public pretty:PrettyProvider ) {}

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
    if(index<=0)
     return;
    if ( this.selectedDeck )
    {
      if(index>=this.selectedDeck.slugs.length)
       return;
      let slug = this.selectedDeck.slugs[index];
      this.selectedDeck.slugs.splice( index, 1 );
      this.selectedDeck.slugs.splice( index + offset, 0, slug );
    }
    else
    {
      if(index>=this.decks.length)
       return;
      let deck = this.decks[index];
      this.decks.splice( index, 1 );
      this.decks.splice( index + offset, 0, deck );
    }
  }

  public finish():void { this.data.events.publish( "list:resetmode" ) }
  public stop(event) { event.stopPropagation() }
}
