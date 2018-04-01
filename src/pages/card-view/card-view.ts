import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CardModel } from '../../app/models';

@IonicPage()
@Component({
  selector: 'page-card-view',
  templateUrl: 'card-view.html',
})
export class CardViewPage {

  card: CardModel;

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.card = navParams.get("card");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CardViewPage');
  }

  save() {
    console.log('Save CardViewPage');
    this.navCtrl.pop();
  }
}
