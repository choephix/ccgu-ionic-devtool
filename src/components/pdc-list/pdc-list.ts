import { Component } from '@angular/core';
import { DataProvider } from '../../providers/data/data';
import { PDCharacterData } from '../../app/models';

@Component({
  selector: 'pdc-list',
  templateUrl: 'pdc-list.html'
})
export class PdcListComponent
{
  public selectedPDCs:PDCharacterData[] = [];
  public get chars():PDCharacterData[] { return this.data.pdc.data; }

  constructor( public data:DataProvider )
  {
  }

  public onSelect(pdc:PDCharacterData)
  {
    if( this.selectedPDCs.indexOf( pdc ) < 0 )
    {
      this.selectedPDCs.length = 0;
      this.selectedPDCs.push( pdc );
    }
    else
    {
      this.selectedPDCs.length = 0;
    }
  }
}
