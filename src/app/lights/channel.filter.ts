
import { Channel } from '../device-configuration/device-configuration.model';
import { Pipe, Injectable, PipeTransform } from '@angular/core';

@Pipe({
  name: 'channelFilter'
})
@Injectable()
export class ChannelFilter implements PipeTransform {
  transform(channelList: Channel[], args: any[]): any {
    if (args) {
    return channelList.filter(customer => customer.name.toLowerCase()
    .indexOf(args.toString().toLowerCase()) !== -1);
    } else {
      return channelList;
    }
  }
}
