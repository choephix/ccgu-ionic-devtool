import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { CardViewPage } from '../pages/card-view/card-view';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AutosizeDirective } from '../directives/autosize/autosize';
import { DataProvider } from '../providers/data/data';
import { PdcListComponent } from '../components/pdc-list/pdc-list';
import { DeckListComponent } from '../components/deck-list/deck-list';
import { PrettyProvider } from '../providers/pretty/pretty';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    CardViewPage,
    AutosizeDirective,
    PdcListComponent,
    DeckListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    CardViewPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DataProvider,
    PrettyProvider
  ]
})
export class AppModule {}
