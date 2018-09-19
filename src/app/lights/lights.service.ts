import 'rxjs/add/operator/map';

import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../configuration ';
import { Device, Channel } from '../device-configuration/device-configuration.model';
import { Map } from '../map-config/map-config.model';
import { ToastsManager } from 'ng2-toastr';

@Injectable()
export class LightsService {

    private actionUrl: string;

    constructor(private http: HttpClient, private  configService: Configuration, private toastsManager: ToastsManager) {
        this.actionUrl = configService.ServerWithApiUrl + 'channel';
    }
    public getChannnelsByMapId(mapId: number): Observable<Channel[]> {
        return this.http.get<Channel[]>(this.actionUrl + `/getbymap/${mapId}`);
    }
    public getAllChannel(): Observable<Channel[]> {
        return this.http.get<Channel[]>(this.actionUrl + `/getbymap/1`);
    }
    public getChannelsById(serviceId: number, deviceId: number, channelId: number): Observable<Device> {
        return this.http.get<Device>(this.actionUrl + `?serviceId=${serviceId}&deviceId=${deviceId}&channelId=${channelId}`);
    }

    public getChannelsByDeviceId(serviceId: number, deviceId: number): Observable<Device> {
        return this.http.get<Device>(this.actionUrl + `?serviceId=${serviceId}&deviceId=${deviceId}`);
    }

    public saveChannel(channel: Channel): Observable<boolean> {
        console.log('Saving channel information');
        console.log(channel);
        this.toastsManager.success('Saving channel information with IsOn : ' + channel.isOn
    + ' and color : ' + channel.color
    + ' SubType : ' + channel.subType
    + ' Intensity : ' + channel.intensity
    , 'Channel!..');
        return this.http.post<boolean>(this.actionUrl + `/save`, channel);
    }
    // public updateChannel(channel: Channel): Observable<boolean> {
    //     return this.http.put<boolean>(this.actionUrl, channel);
    // }
    public cloneNewChannel(from: Channel): Channel {
        const to: Channel = new Channel();
        to.id = from.id;
        to.isOn = from.isOn;
        to.color = from.color;
        to.serviceId = from.serviceId;
        to.deviceId = from.deviceId;
        to.channelId = from.channelId;
        to.latitude = from.latitude;
        to.longitude = from.longitude;
        to.mapId = from.mapId;
        to.name = from.name;
        to.R = from.R;
        to.G = from.G;
        to.B = from.B;
        to.subType = from.subType;
        to.intensity = from.intensity;
        return to;
      }
}



