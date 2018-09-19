import { Component, OnInit } from '@angular/core';
import { LightsService } from '../lights/lights.service';
import { Channel, Device } from '../device-configuration/device-configuration.model';
import { ITreeState, ITreeOptions, TreeDropDirective, TreeComponent } from 'angular-tree-component';
import { v4 } from 'uuid';
import { Map } from '../map-config/map-config.model';
import { MapService } from '../map-config/map-config.service';
import { DeviceConfigurationService } from '../device-configuration/device-configuration.service';

@Component({
  selector: 'app-light-configuration',
  templateUrl: './light-configuration.component.html',
  styleUrls: ['./light-configuration.component.css']
})
export class LightConfigurationComponent implements OnInit {
  public devices: Device[];
  public maps: Map[];
  public selectedMap: Map;
  title = 'app';
  state: ITreeState = {
    expandedNodeIds: {},
    hiddenNodeIds: {},
    activeNodeIds: {}
  };
  options = {
    allowDrag: true,
    getNodeClone: (node) => ({
      ...node.data,
      id: v4(),
      name: `copy of ${node.data.name}`
    }),
    getChildren: (node: any) => {
      return this.channelservice.getChannelsByDeviceId(node.data.serviceId, node.data.deviceId)
        .toPromise();
    }
  };
  constructor(private channelservice: LightsService, private deviceService: DeviceConfigurationService, private mapService: MapService) { }

  ngOnInit() {
    this.selectedMap = new Map();
    this.selectedMap.name = 'Select Map';
    this.selectedMap.id = -1;

    this.mapService.getMaps()
      .subscribe((data) => {
        this.maps = data;
      }, null, null);

    this.deviceService.getDevices()
      .subscribe((data) => {
        this.devices = data;
      }
        , null, null);
  }

  public onMapSelection(map: Map): void {
    this.selectedMap = map;
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
  }
}
