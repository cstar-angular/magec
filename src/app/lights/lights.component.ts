import { Component, OnInit, ViewChild, Pipe } from '@angular/core';
import { ITreeState, ITreeOptions, TreeComponent } from 'angular-tree-component';
import { v4 } from 'uuid';
import { LightsService } from './lights.service';
import { Channel } from '../device-configuration/device-configuration.model';
import { ChannelDialogComponent } from '../channel-dialog/channel-dialog.component';
import { MatDialog } from '@angular/material';
import { SignalRConnection } from 'ng2-signalr';
import { ActivatedRoute } from '@angular/router';
import { ConnectionResolver } from '../services/app.connectionResolver';
import { ToastsManager } from 'ng2-toastr';
import { Map } from '../map-config/map-config.model';
import { MapService } from '../map-config/map-config.service';
import { ChannelFilter } from './channel.filter';

@Component({
  selector: 'app-lights',
  templateUrl: './lights.component.html',
  styleUrls: ['./lights.component.css']
})
export class LightsComponent implements OnInit {
  public channels: Channel[];
  public updatedChannel: Channel;
  public addedChannel: Channel;
  public deletedChannel: Channel;

  public maps: Map[];
  public selectedMap: Map;
  @ViewChild(TreeComponent)
  private channelTree: TreeComponent;
  title = 'app';
  state: ITreeState = {
    expandedNodeIds: {},
    hiddenNodeIds: {},
    activeNodeIds: {}
  };
  options: ITreeOptions = {
    allowDrag: (node) => node.isLeaf,
    getNodeClone: (node) => ({
      ...node.data,
      id: v4(),
      name: `copy of ${node.data.name}`
    })
  };
  constructor(private _dataService: LightsService, private _mapService: MapService, public dialog: MatDialog
    , private connectionSerive: ConnectionResolver, private toastsManager: ToastsManager) {
  }
  ngOnInit() {
    this.selectedMap = new Map();
    this.selectedMap.name = 'Select Map';
    this.selectedMap.id = -1;
    this.setupconnection();
    this.updatedChannel = new Channel();
    this.addedChannel = new Channel();
    this.deletedChannel = new Channel();
    this._mapService.getMaps()
      .subscribe((data) => {
        this.maps = data;
      }
        , null, null);
  }
  public onMapSelection(map: Map): void {
    this.selectedMap = map;
    this.channels = null;
    this._dataService.getChannnelsByMapId(map.id)
      .subscribe((data) => this.channels = data, null, null);
  }
  public setupconnection(): void {
    this.connectionSerive.initiateChannelConnection();
    this.connectionSerive.onChannelUpdate.subscribe((channel: Channel) => {
      console.log('Channel update!..');
      console.log(channel);
      this.toastsManager.success('ID : ' + channel.id + ' On/OFF : ' + channel.isOn
      + ' Color : ' + channel.color
      + ' SubType : ' + channel.subType
      + ' Intensity : ' + channel.intensity
        , 'Channel update!..');
      this.handleChannel(channel);
    });
    // this.connectionSerive.callChannelMethod();
  }
  private handleChannel(channel: Channel): void {
    const temp = this.channels.find(x => x.id === channel.id);
    // added -20005 and deleted -20006
    if (this.selectedMap.id === channel.mapId && channel.statusId === 20005 && temp === null) {
      this.addChannel(channel);
    } else if (this.selectedMap.id === channel.mapId && channel.statusId === 20006 && temp) {
      this.deleteChannel(channel, temp);
    } else {
      if (temp && temp.mapId === channel.mapId) {
        if (channel.isOn !== null) { temp.isOn = channel.isOn; }
        if (channel.R !== null) {
          temp.color = channel.color;
          temp.R = channel.R;
          temp.G = channel.G;
          temp.B = channel.B;
        }
        if (channel.latitude) { temp.latitude = channel.latitude; }
        if (channel.longitude) { temp.longitude = channel.longitude; }
        if (channel.statusId) { temp.statusId = channel.statusId; }
        if (channel.statusName) { temp.statusName = channel.statusName; }
        if (channel.description) { temp.description = channel.description; }
        if (channel.intensity !== null) { temp.intensity = channel.intensity; }
        this.updatedChannel = this._dataService.cloneNewChannel(temp);
      } else if (temp && temp.mapId !== channel.mapId) {
        this.deleteChannel(channel, temp);
      }
    }
  }
  private addChannel(channel: Channel) {
    this.addedChannel = this._dataService.cloneNewChannel(channel);
    this.channels.push(channel);
    this.channelTree.treeModel.update();
  }
  private deleteChannel(channel: Channel, temp: Channel) {
    const index = this.channels.indexOf(temp);
    this.channels.splice(index, 1);
    this.channelTree.treeModel.update();
    this.deletedChannel = this._dataService.cloneNewChannel(channel);
  }
  public onMoveNode($event) {
    console.log(
      'Moved',
      $event.node.name,
      'to',
      $event.to.parent.name,
      'at index',
      $event.to.index);
  }
  public onEvent(event: any): void {
    const item: Channel = event.node.data;
    const tmpchannel: Channel = this._dataService.cloneNewChannel(item);
    // if (item && item.channelId) {
    //   const dialogRef = this.dialog.open(ChannelDialogComponent, {
    //     width: '300px',
    //     data: tmpchannel
    //   });

    //   dialogRef.afterClosed().subscribe((channel: Channel) => {
    //     if (channel) {
    //       this.saveChannelChange(channel);
    //     }
    //   });
    // }
  }

  private onToggleChange(channel: Channel) {
    if (channel) {
      const tempSave = this._dataService.cloneNewChannel(channel);
      this.saveChannelChange(tempSave);
    }
  }
  private onColorChange(channel: Channel) {
    if (channel) {
      const tempSave = this._dataService.cloneNewChannel(channel);
      this.saveChannelChange(tempSave);
    }
  }
  private onSliderChange(channel: Channel) {
    if (channel) {
      const tempSave = this._dataService.cloneNewChannel(channel);
      // if (tempSave.intensity !== null && tempSave.intensity > 0) {
      //  tempSave.isOn = true;
      // } else if (tempSave.intensity !== null && tempSave.intensity === 0) {
      //  tempSave.isOn = false;
      // }
      this.saveChannelChange(tempSave);
    }
  }
  private saveChannelChange(channel: Channel): void {
    // const tempSave = this._dataService.cloneNewChannel(channel);
    this._dataService.saveChannel(channel).subscribe((data: boolean) => {
      if (data) {
        const tmp: Channel = this.channels.find(x => x.id === channel.id);
        if (tmp.isOn !== channel.isOn) {
           // tmp.isOn = null;
        }
        if (tmp.color !== channel.color) {
          // tmp.color = null;
        }
        console.log('Saved channel information');
        this.toastsManager.success('Saved channel information', 'Channel!..');
      }
    }
      , null, null);
  }
}
