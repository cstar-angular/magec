import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { DeviceConfigurationService } from './device-configuration.service';
import { Device, Channel } from './device-configuration.model';

import { LightsService } from '../lights/lights.service';
import { TreeNode } from '../lights/lights.model';
import { TreeComponent } from 'angular-tree-component';
import { ITreeNode } from 'angular-tree-component/dist/defs/api';
import { ConnectionResolver } from '../services/app.connectionResolver';
import { ToastsManager } from 'ng2-toastr';

@Component({
  selector: 'app-device-configuration',
  templateUrl: './device-configuration.component.html',
  styleUrls: ['./device-configuration.component.css']
})
export class DeviceConfigurationComponent implements OnInit {
  @ViewChild('tree') treeComponent: TreeComponent;
  public options: any;
  public devices: Device[];
  public selecetdDevice: Device;
  public selecetdChannel: Channel;
  public color: any;
  public isAdd: boolean;

  constructor(private _dataService: DeviceConfigurationService, private _channelService: LightsService,
    private connectionSerive: ConnectionResolver, private toastsManager: ToastsManager) {
    this.selecetdDevice = null;
    this.selecetdChannel = null;
  }
  ngOnInit() {
    this.setupconnection();
    this.isAdd = false;
    this._dataService.getDevices()
      .subscribe((data) => this.devices = data, null, null);
    this.options = {

      getChildren: (node: any) => {
        return this._channelService.getChannelsByDeviceId(node.data.serviceId, node.data.deviceId)
          .toPromise();
      }
    };
  }
  public setupconnection(): void {
    this.connectionSerive.initiateChannelConnection();
    this.connectionSerive.initiateDeviceConnection();
    this.connectionSerive.onChannelUpdate.subscribe((channel: Channel) => {
      console.log(channel);
      this.toastsManager.success('ID : ' + channel.id + ' On/OFF : ' + channel.isOn
      + ' Color : ' + channel.color
      + ' SubType : ' + channel.subType
      + ' Intensity : ' + channel.intensity
        , 'Channel update!..');
      this.handleChannel(channel);
    });
    this.connectionSerive.onDeviceUpdate.subscribe((device: Device) => {
      console.log(device);
      this.toastsManager.success('ID : ' + device.id, 'Device update!..');
      this.handleDevice(device);
    });
  }
  private handleChannel(channel: Channel): void {
    // tslint:disable-next-line:max-line-length
    const dNode: any = this.treeComponent.treeModel.nodes.find(x => x.deviceId === channel.deviceId && x.serviceId === channel.serviceId);
    if (dNode && dNode.children) {
      const temp: Channel = dNode.children.find(x => x.id === channel.id);
      if (channel.statusId === 20005 && !temp) {// add channel
        dNode.children.push(channel);
        this.treeComponent.treeModel.update();
      } else if (channel.statusId === 20006 && !temp) {// delete channel
        const index = dNode.children.indexOf(temp);
        dNode.children.splice(index, 1);
        this.treeComponent.treeModel.update();
      } else if (temp) {
        if (channel.isOn != null) { temp.isOn = channel.isOn; }
        if (channel.R != null) { temp.color = channel.color; }
        if (channel.intensity != null) { temp.intensity = channel.intensity; }
        if (this.selecetdChannel.id === temp.id) {
          if (channel.isOn != null) { this.selecetdChannel.isOn = channel.isOn; }
          if (channel.R != null) { this.selecetdChannel.color = channel.color; }
          if (channel.intensity != null) { this.selecetdChannel.intensity = channel.intensity; }
        }
        this.treeComponent.treeModel.update();
      }
    }
  }
  private handleDevice(device: Device): void {
    const temp: Device = this.devices.find(x => x.serviceId === device.serviceId
      && x.deviceId === device.deviceId);
    if (device.statusId === 20005 && !temp) {// add device
      this.addtreeDevice(device);
    } else if (temp && device.statusId === 20006) {// delete device
      this.deletetreeDevice(temp);
    } else if (temp) {
      if (device.name) { temp.name = device.name; }
      if (device.statusId) { temp.statusId = device.statusId; }
      if (device.statusName) { temp.statusName = device.statusName; }
      this.treeComponent.treeModel.update();
    }
  }
  private addtreeDevice(device: Device): void {
    this.devices.push(device);
    this.treeComponent.treeModel.update();
  }
  private deletetreeDevice(temp: Device): void {
    const index = this.devices.indexOf(temp);
    this.devices.splice(index, 1);
    this.treeComponent.treeModel.update();
  }
  public addDevice(): void {
    this.isAdd = true;
    this.selecetdDevice = new Device();
    this.selecetdChannel = null;
    // this.devices.push(this.selecetdDevice);
  }
  public saveDevice(): void {
    if (this.selecetdDevice) {
      this._dataService.saveDevice(this.selecetdDevice)
        .subscribe((data) => {
          if (data) {
            // this.devices.push(data);
            this.toastsManager.success(' Device saved successfully ', 'Device!..');
          }
        }, null, null);
    } else if (this.selecetdChannel) {

      this._channelService.saveChannel(this.selecetdChannel).subscribe(
        () => {
          if (this.selecetdChannel) {
            const dNode: any = this.treeComponent.treeModel.nodes.find(x => this.selecetdChannel.deviceId
              === x.deviceId && x.serviceId === this.selecetdChannel.serviceId);
            if (dNode && dNode.children) {
              const temp: Channel = dNode.children.find(x => x.id === this.selecetdChannel.id);
              if (temp.color !== this.selecetdChannel.color) { this.selecetdChannel.color = null; temp.color = null; }
              if (temp.isOn !== this.selecetdChannel.isOn) { this.selecetdChannel.isOn = null; temp.isOn = null; }
            }
          }
          this.toastsManager.success(' Channel saved successfully ', 'Channel!..');
        }, null, null);
    }
  }
  public selecetDevice(device: any): void {

    this.selecetdDevice = device;
  }
  public deleteDevice(): void {
    if (this.selecetdDevice) {
      this._dataService.deleteDevice(this.selecetdDevice.serviceId, this.selecetdDevice.deviceId)
        .subscribe((data) => {
          if (data) {
            this.toastsManager.success(' Data deleted successfully ', 'Device!..');
          }
        }, null, null);
    }
  }
  public onEvent(event: any): void {
    this.isAdd = false;
    const item: any = event.node.data;
    if (item && item.channelId) {
      this.selecetdDevice = null;
      this.selecetdChannel = this._channelService.cloneNewChannel(item);
      if (this.selecetdChannel.R === null) { this.selecetdChannel.color = null; }
    } else if (item && item.deviceId) {
      this.selecetdChannel = null;
      this.selecetdDevice = item;
    }
  }
}
