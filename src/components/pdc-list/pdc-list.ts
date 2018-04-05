import { Component } from '@angular/core';
import { DataProvider } from '../../providers/data/data';
import { PDCharacterData } from '../../app/models';

@Component({
  selector: 'pdc-list',
  templateUrl: 'pdc-list.html'
})
export class PdcListComponent
{
  public chars:PDCharacterData[];
  public selectedPDCs:PDCharacterData[] = [];
  
  constructor( private data:DataProvider )
  {
    data.load();
    this.chars = data.characters;
  }

  public onSelect(pcd:PDCharacterData)
  {
    this.selectedPDCs.length = 0;
    this.selectedPDCs.push( pcd );
  }
}
