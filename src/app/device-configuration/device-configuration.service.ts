import 'rxjs/add/operator/map';

import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Device, Channel } from './device-configuration.model';
import { Configuration } from '../configuration ';

@Injectable()
export class DeviceConfigurationService {

    private actionUrl: string;

    constructor(private http: HttpClient, private  configService: Configuration) {
        this.actionUrl = configService.ServerWithApiUrl + 'device';
    }

    public getDevices(): Observable<Device[]> {
        return this.http.get<Device[]>(this.actionUrl);
    }
    public getDevicesById(serviceId: number, deviceId: number): Observable<Device> {
        return this.http.get<Device>(this.actionUrl + `?serviceId=${serviceId}&deviceId=${deviceId}`);
    }
    public getDeviceChannels(serviceId: number, deviceId: number): Observable<Channel[]> {
        return this.http.get<Channel[]>(this.actionUrl + `/channel?serviceId=${serviceId}&deviceId=${deviceId}`);
    }
    public saveDevice(device: Device): Observable<boolean> {
        if (device.id) {
            return this.UpdateDevice(device);
        } else {
            return this.addDevice(device);
        }

    }
    public addDevice(device: Device): Observable<boolean> {
        return this.http.post<boolean>(this.actionUrl + `/add`, device);
    }
    public UpdateDevice(device: Device): Observable<boolean> {
        return this.http.put<boolean>(this.actionUrl + `/update`, device);
    }
    public deleteDevice(serviceId: number, deviceId: number): Observable<boolean> {
        return this.http.delete<boolean>(this.actionUrl + `/delete?serviceId=${serviceId}&deviceId=${deviceId}`);
    }
}



