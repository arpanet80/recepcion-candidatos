import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'base64',
  standalone: true
})
export class Base64Pipe implements PipeTransform {

  public transform(value: any): any {
  // public transform(value: any, contentType: string): any {
    // var base64Content = `data:${contentType};base64,${value}`;
    var base64Content = `data:undefined;base64,${value}`;
    return base64Content;
  }

}
