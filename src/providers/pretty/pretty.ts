import { Injectable } from '@angular/core';
import { CardModel } from '../../app/models';

@Injectable()
export class PrettyProvider {

  constructor() {}
  
  public getColorClass( model:CardModel ):string
  {
    if( model )
    {
      if ( model.isTrap ) return "trap";
      if ( model.isGrand ) return "grand";
      if ( model.isSneak ) return "sneak";
      return "normal";
    }
    return "null";
  }
}
