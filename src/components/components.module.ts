import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { PdcListComponent } from './pdc-list/pdc-list';
import { DeckListComponent } from './deck-list/deck-list';

@NgModule({
	declarations: [PdcListComponent,DeckListComponent],
	imports: [IonicModule,CommonModule],
	exports: [PdcListComponent,DeckListComponent]
})
export class ComponentsModule {}
