import { SignalR, SignalRConnection, IConnectionOptions, BroadcastEventListener, ConnectionStatus } from 'ng2-signalr';
import { Injectable } from '@angular/core';
import { ToastsManager } from 'ng2-toastr';
import { AppDataService } from '../app.dataservice';

@Injectable()
export class ConnectionResolver {
    public deviceConnection: SignalRConnection;
    public channelConnection: SignalRConnection;
    public channelConfigConnection: SignalRConnection;
    public mapConnection: SignalRConnection;
    public onDeviceUpdate: any;
    public onChannelUpdate: any;
    public onChannelConfigUpdate: any;
    constructor(private _signalR: SignalR, private toastsManager: ToastsManager, private appDataService: AppDataService) { }

    public resolve(): any {
        console.log('ConnectionResolver. Resolving...');
        return this._signalR.connect();
    }
    public initiateDeviceConnection(): void {
        if (!this.deviceConnection) {
            console.log('ConnectionResolver. Resolving device hub...');
            const options: IConnectionOptions = { hubName: 'DeviceHub' };
            this.deviceConnection = this._signalR.createConnection(options);
            this.deviceConnection.status.subscribe((s: ConnectionStatus) => {
                console.log(s.name);
                this.toastsManager.info(s.name, 'DeviceConnection!..');
                if (s.name === 'disconnected') {
                    this.connect(this.deviceConnection);
                }
                this.setIsConnecetd(s);
            });
            this.deviceConnection.errors.subscribe((s: any) => {
                this.logError('DeviceConnection!..', s);
            });
            this.connect(this.deviceConnection);
            this.onDeviceUpdate = this.deviceConnection.listenFor('broadcastDevice');
        }
    }
    public initiateChannelConnection(): void {
        if (!this.channelConnection) {
            console.log('ConnectionResolver. Resolving channel hub...');
            const options: IConnectionOptions = { hubName: 'ChannelHub' };
            this.channelConnection = this._signalR.createConnection(options);
            this.channelConnection.status.subscribe((s: ConnectionStatus) => {
                console.log(s.name);
                this.toastsManager.info(s.name, 'ChannelConnection!..');
                if (s.name === 'disconnected') {
                    this.connect(this.channelConnection);
                }
                this.setIsConnecetd(s);
            });
            this.channelConnection.errors.subscribe((s: any) => {
                this.logError('ChannelConnection!..', s);
            });
            this.connect(this.channelConnection);
            this.onChannelUpdate = this.channelConnection.listenFor('broadcastChannel');
        }
    }
    public initiateChannelConfigConnection(): void {
        if (!this.channelConfigConnection) {
            console.log('ConnectionResolver. Resolving channel config hub...');
            const options: IConnectionOptions = { hubName: 'ChannelConfigHub' };
            this.channelConfigConnection = this._signalR.createConnection(options);
            this.channelConfigConnection.status.subscribe((s: ConnectionStatus) => {
                console.log(s.name);
                this.toastsManager.info(s.name, 'ChannelConfigConnection!..');
                if (s.name === 'disconnected') {
                    this.connect(this.channelConfigConnection);
                }
                this.setIsConnecetd(s);
            });
            this.channelConfigConnection.errors.subscribe((s: any) => {
                this.logError('ChannelConfigConnection!..', s);
            });
            this.connect(this.channelConfigConnection);
            this.onChannelConfigUpdate = this.channelConnection.listenFor('broadcastChannelConfig');
        }
    }
    private connect(objConenction: SignalRConnection): void {
        objConenction.start().then((c) => {
            console.log(c);
        });
    }
    private logError(typeStr: string, error: any): void {
        console.error(typeStr);
        console.error(error);
        this.toastsManager.error(error, typeStr);
    }
    private setIsConnecetd(s: any) {
         if (s.name === 'connected') {
            this.appDataService.isConnected(true);
        } else {
            this.appDataService.isConnected(false);
        }
    }
    public getMapConnection(): any {
        console.log('ConnectionResolver. Resolving Map hub...');
        const options: IConnectionOptions = { hubName: 'MapHub' };
        return this._signalR.createConnection(options);
    }
    public callChannelMethod(): void {
        // invoke a server side method, with parameters
        this.channelConnection.invoke('Send', 'name', 'sample Message').then((data: string[]) => {
            alert(data);
        });
    }
}
