import { Component, OnInit, ViewChild } from '@angular/core';
import { LightsService } from '../lights/lights.service';
import { MapService } from './map-config.service';
import { Map } from './map-config.model';
import { TreeComponent } from 'angular-tree-component';
import { ToastsManager } from 'ng2-toastr';
import { Channel } from '../device-configuration/device-configuration.model';

@Component({
  selector: 'app-map-config',
  templateUrl: './map-config.component.html',
  styleUrls: ['./map-config.component.css']
})
export class MapConfigComponent implements OnInit {
  @ViewChild('mapsTree') mapTree: TreeComponent;
  public imageUrl: string;
  public fileToUpload: File = null;
  public maps: Map[];
  public selectedMap: Map;
  constructor(private deviceService: LightsService
    , private _mapService: MapService, private toastsManager: ToastsManager) { }

  ngOnInit() {
    this.selectedMap = null;
    this._mapService.getMaps()
      .subscribe((data) => {
        this.maps = data;
      }
        , null, null);
  }
  handleFileInput(file: FileList) {
    this.fileToUpload = file.item(0);
    // Show image preview
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.imageUrl = event.target.result;
    };
    reader.readAsDataURL(this.fileToUpload);
  }
  public onEvent(event: any): void {
    const item: Map = event.node.data;
    if (item) {
      this.selectedMap = item;
      this.imageUrl = item.uri;
    }
  }
  public deleteMap(): void {
    if (this.selectedMap) {
      this._mapService.deleteMap(this.selectedMap.id)
        .subscribe((data) => {
          if (data) {
            const index = this.maps.indexOf(this.selectedMap);
            this.maps.splice(index, 1);
            this.mapTree.treeModel.update();
            this.toastsManager.success(' Map deleted successfully ', 'Map config!..');
          }
        }, null, null);
    }
  }
  public addMap(): void {
    this.selectedMap = new Map();
    this.selectedMap.name = '';
    this.selectedMap.description = '';
    this.imageUrl = null;
  }
  public saveMap(): void {
    if (this.selectedMap && this.selectedMap.id) {
      this._mapService.updateMapform(this.selectedMap, this.fileToUpload)
        .subscribe((data: Map) => {
          if (data) {
            const map = this.maps.find(x => x.id === data.id );
            if ( map) {
              map.name = data.name;
              map.description = data.description;
              map.uri = data.uri;
            }
            this.toastsManager.success(' Map updated successfully ', 'Map config!..');
          }
        }, null, null);
    } else {
      this._mapService.addMapform(this.selectedMap, this.fileToUpload)
        .subscribe((data) => {
          if (data) {
            this.maps.push(data);
            this.mapTree.treeModel.update();
            this.toastsManager.success(' Map Added successfully ', 'Map config!..');
          }
        }, null, null);
    }
  }
}
