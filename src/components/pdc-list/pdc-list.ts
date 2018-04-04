import { Component } from '@angular/core';
import { DataProvider } from '../../providers/data/data';

@Component({
  selector: 'pdc-list',
  templateUrl: 'pdc-list.html'
})
export class PdcListComponent {

  chars: { origin: string; name: string; id: number; }[];
  
  constructor( private data:DataProvider )
  {
    data.load();

    this.chars = data.characters;
  }

}
