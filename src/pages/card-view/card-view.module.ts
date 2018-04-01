import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CardViewPage } from './card-view';

@NgModule({
  declarations: [
    CardViewPage,
  ],
  imports: [
    IonicPageModule.forChild(CardViewPage),
  ],
})
export class CardViewPageModule {}
