import { Component } from '@angular/core';
import { DataProvider } from '../../providers/data/data';
import { PDCharacterData } from '../../app/models';

@Component({
  selector: 'pdc-list',
  templateUrl: 'pdc-list.html'
})
export class PdcListComponent
{
  public reorderMode:boolean;
  public editMode:boolean;
  public selectedPDCs:PDCharacterData[] = [];
  public expandedPDCs:PDCharacterData[] = [];
  public get chars():PDCharacterData[] { return this.data.pdc.data; }

  constructor( public data:DataProvider ) {}

  public expand(pdc:PDCharacterData)
  {
    if ( pdc == null )
    {
      this.expandedPDCs.length = 0;
    }
    else
    if( this.expandedPDCs.indexOf( pdc ) < 0 )
    {
      this.expandedPDCs.length = 0;
      this.expandedPDCs.push( pdc );
    }
    else
    {
      this.expandedPDCs.length = 0;
    }
  }

  public select(pdc:PDCharacterData)
  {
    if ( pdc == null )
    {
      this.selectedPDCs.length = 0;
    }
    else
    if( this.selectedPDCs.indexOf( pdc ) < 0 )
    {
      this.selectedPDCs.length = 0;
      this.selectedPDCs.push( pdc );
    }
    // else
    // {
    //   this.selectedPDCs.length = 0;
    // }
  }

  public isSelected(pdc:PDCharacterData):boolean { return this.selectedPDCs.indexOf(pdc)>-1; }
  public isExpanded(pdc:PDCharacterData):boolean { return this.expandedPDCs.indexOf(pdc)>-1; }

  public hasStuff(pdc:PDCharacterData):boolean
  { return (Boolean)( pdc.notes_cardstats || pdc.notes_character ) }

  public finish():void { this.data.events.publish( "list:resetmode" ) }
  public stop(event) { event.stopPropagation() }
}
