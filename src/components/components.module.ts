import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { PdcListComponent } from './pdc-list/pdc-list';

@NgModule({
	declarations: [PdcListComponent],
	imports: [IonicModule,CommonModule],
	exports: [PdcListComponent]
})
export class ComponentsModule {}
