import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import THREE = require('three');
import OrbitControls = require('three-orbit-controls');
import { Channel } from '../device-configuration/device-configuration.model';
import { LightsService } from '../lights/lights.service';
import { ITreeState, ITreeOptions, TreeDropDirective, TreeComponent } from 'angular-tree-component';
import { Map } from '../map-config/map-config.model';
import { ToastsManager } from 'ng2-toastr';
import { ConnectionResolver } from '../services/app.connectionResolver';
const OrbitControlsLib = OrbitControls(THREE);

@Component({
  selector: 'app-graph-light-config-3d',
  templateUrl: './graph-light-config-3d.component.html',
  styleUrls: ['./graph-light-config-3d.component.css']
})
export class GraphLightConfig3dComponent implements OnInit, OnChanges {
  @Input() selectedMap: Map;
  public channelList: Channel[];

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement; // container size
  private background: THREE.Mesh; // background image
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private controls: OrbitControls;
  private remove: Boolean = false;
  private objects: THREE.Sprite[] = new Array();
  private selected: THREE.Object3D = null;

  constructor(private channelService: LightsService, private toastsManager: ToastsManager
    , private connectionSerive: ConnectionResolver) { }

  ngOnInit() {
    this.setupconnection();
  }
  public setupconnection(): void {
    this.connectionSerive.initiateChannelConnection(); // TODO
    this.connectionSerive.onChannelUpdate.subscribe((channel: Channel) => { // TODO
      console.log(channel);
      this.toastsManager.success('longitude : ' + channel.longitude + ' latitude : ' + channel.latitude + ' MapId : ' + channel.mapId
        , 'Channel config update!..');
      this.handleChannel(channel);
    });
  }
  private handleChannel(channel: Channel): void {
    const temp = this.channelList.find(x => x.id === channel.id);
    // added -20005 and deleted -20006
    if (this.selectedMap.id === channel.mapId && channel.statusId === 20005 && temp === null) {
      this.addChannel(channel);
    } else if (this.selectedMap.id === channel.mapId && channel.statusId === 20006 && temp) {
      this.deleteChannel(channel, temp);
    } else {
      if (temp && temp.mapId === channel.mapId) {
        if (channel.latitude) { temp.latitude = channel.latitude; }
        if (channel.longitude) { temp.longitude = channel.longitude; }
        // TODO Update position on map
      } else if (temp && temp.mapId !== channel.mapId) {
        this.deleteChannel(channel, temp);
      }
    }
  }
  private addChannel(channel: Channel) {
    this.channelList.push(channel);
    // TODO add channel on map
  }
  private deleteChannel(channel: Channel, temp: Channel) {
    const index = this.channelList.indexOf(temp);
    this.channelList.splice(index, 1);
    // TODO delete channel on map
  }
  ngOnChanges(changes: any) {
    if (changes['selectedMap']) {
      if (this.selectedMap.id > 0) {
        this.channelList = null;
        this.channelService.getChannnelsByMapId(this.selectedMap.id)
          .subscribe((data) => {
            this.channelList = data; this.initScene();
          }, null, null);
      }
    }
  }
  private saveChannel(channel: Channel, setId: Boolean = true): void {
    if (setId === true) {
      channel.mapId = this.selectedMap.id;
    }
    console.log(channel);
    this.channelService.saveChannel(channel).subscribe((data: boolean) => {
      if (data) {
        console.log('Saved channel information');
        this.toastsManager.success('Saved channel information', 'Channel!..');
      }
    }
      , null, null);
  }
  public onDrop($event): any {
    const dropedChannel: Channel = $event.element.data;
    if (dropedChannel) {
      const coords3d = this.projectTo3D($event.event);
      const tmpChannel: Channel = this.channelList.find(x => x.id === dropedChannel.id);
      if (tmpChannel && tmpChannel.id) {
        const object = this.getObjectById(tmpChannel.id);
        if (object !== null) {
          object.parent.position.set(coords3d.x, coords3d.y, 0);
        }
        this.updateLightOnScene(tmpChannel, coords3d);
      } else {
        this.addedChannelFromServer(dropedChannel, coords3d);
      }
    }
  }

  public allowDrop(element): boolean {
    return true;
    // Return true/false based on element
  }

  public initScene(): void { this.init(); }

  private init(): void {
    document.getElementById('trash').style.display = 'block';
    this.container = document.getElementById('canvas3D');

    // scene
    this.scene = new THREE.Scene();

    // camera
    this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 10000);
    this.camera.position.set(0, 0, 45);
    this.camera.lookAt(this.scene.position);

    // lights
    this.scene.add(new THREE.AmbientLight(0xaaaaaa));

    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);
    if (this.container.childElementCount === 3) {
      this.container.removeChild(this.container.children[1]);
    }

    // controls
    this.controls = new OrbitControlsLib(this.camera, this.renderer.domElement);
    this.controls.maxDistance = 150;
    this.controls.minDistance = 30;
    this.controls.panSpeed = 0;
    this.controls.enableRotate = false;
    this.controls.enableKeys = true;
    this.controls.mouseButtons.ORBIT = 2;
    this.controls.mouseButtons.PAN = 0;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    this.renderer.domElement.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);
    this.renderer.domElement.addEventListener('mouseup', this.onDocumentMouseUp.bind(this), true);
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);

    // assets
    this.loadBackground();

    // add lights
    this.addLights();

    this.render();
  }

  private onDocumentMouseDown(e): void {
    if (e.button === 0) {
      const position = this.container.getBoundingClientRect();

      this.mouse.x = ((e.clientX - position.left) / this.container.clientWidth) * 2 - 1;
      this.mouse.y = - ((e.clientY - position.top) / this.container.clientHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);

      const intersects = this.raycaster.intersectObjects(this.objects);
      if (intersects.length > 0) {
        this.selected = intersects[0].object;
        this.controls.enablePan = false;
      }
    }
  }

  private onMouseMove(e): void {
    const position = this.container.getBoundingClientRect();

    this.mouse.x = ((e.clientX - position.left) / this.container.clientWidth) * 2 - 1;
    this.mouse.y = - ((e.clientY - position.top) / this.container.clientHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    if (this.selected !== null) {
      const intersects = this.raycaster.intersectObject(this.background, true);
      if (intersects.length > 0) {
        this.selected.position.copy(intersects[0].point);
      }
    } else {
      const intersects = this.raycaster.intersectObjects(this.objects);
      if (intersects.length > 0) {
        this.renderer.domElement.style.cursor = 'pointer';
      } else {
        this.renderer.domElement.style.cursor = 'auto';
      }
    }
  }

  private onDocumentMouseUp(e): void {
    if (e.button === 0) {
      const position = this.container.getBoundingClientRect();
      const mouseX = ((e.clientX - position.left) / this.container.clientWidth) * 2 - 1;
      const mouseY = - ((e.clientY - position.top) / this.container.clientHeight) * 2 + 1;

      if (mouseX < -0.85 && mouseY > 0.85) {
        this.remove = true;
      }

      if (this.selected !== null) {
        const channel = this.getDataByClickedObj(this.selected);
        if (channel !== null) {
          if (this.remove === false) {
            const coords3d = this.selected.position.clone();
            this.updateLightOnScene(channel, coords3d);
          } else {
            channel.longitude = null;
            channel.latitude = null;
            channel.mapId = null;
            console.log(channel);
            this.saveChannel(channel, false);
            this.deletedChannelFromServer(channel);
            this.remove = false;
          }
        }
      }

      this.remove = false;
      this.selected = null;
      this.controls.enablePan = true;
    }
  }

  // update light position in scene
  private updateLightOnScene(data: Channel, coords3d) {
    data.longitude = coords3d.x;
    data.latitude = coords3d.y;

    this.saveChannel(data);
  }

  // change background image
  private loadBackground(): void {
    // const url = '/assets/image' + this.data[0].floorId + '.png';
    // const url = '/assets/image.png';// shashi
    const url = this.selectedMap.uri;
    if (this.background !== null) {
      this.scene.remove(this.background);
      this.background = null;
    }
    const Tex = new THREE.TextureLoader().load(url);
    Tex.wrapS = Tex.wrapT = THREE.RepeatWrapping;

    const geometry = new THREE.PlaneBufferGeometry(40, 40, 64, 64);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: Tex, side: THREE.DoubleSide });
    this.background = new THREE.Mesh(geometry, material);
    this.scene.add(this.background);
  }

  private getDataByClickedObj(clicked): Channel {
    const id = clicked.name;
    // console.log(id);
    let channel = null;
    for (let i = 0; i < this.channelList.length; i++) {
      if (this.channelList[i].id === id) {
        channel = this.channelList[i];
        break;
      }
    }
    return channel;
  }

  private deletedChannelFromServer(data: Channel): void {
    const object = this.getObjectById(data.id);
    // console.log(data);
    if (object === null) { return; }
    let index = -1;
    for (let i = 0; i < this.channelList.length; i++) {
      if (this.channelList[i] === data) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
      this.channelList.splice(index, 1);
      this.objects.splice(index, 1);
    }

    this.scene.remove(object);
    this.scene.remove(object.parent);
  }

  private addedChannelFromServer(data: Channel, coords3d): void {
    const temp = this.channelService.cloneNewChannel(data);
    temp.longitude = coords3d.x;
    temp.latitude = coords3d.y;
    this.channelList.push(temp);
    this.saveChannel(temp);
    this.addLight(temp);
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }

  private addLight(data: Channel): void {
    const textureLoader = new THREE.TextureLoader();
    const lightText = textureLoader.load('/assets/bulb.png');
    const material = new THREE.SpriteMaterial({ map: lightText, color: 0xffffff });

    const x = data.longitude;
    const y = data.latitude;

    const sprite = new THREE.Sprite(material);
    sprite.name = data.id;
    sprite.position.set(x, y, 0);
    this.scene.add(sprite);

    let color = data.color;
    if (data.color === null || data.color === 'rgb(,,)') {
      color = 'rgb(255,255,255)';
    }
    if (data.subType === 13) {
      if (data.intensity) {
        color = 'rgb(' + data.intensity + ',' + data.intensity + ',' + data.intensity + ')';
      } else {
        color = 'rgb(0,0,0)';
      }
    }

    const spotLight = new THREE.PointLight(color, (data.isOn === true) ? 1 : 0, 6, 6.5);
    spotLight.position.set(0, 0, 3);
    sprite.add(spotLight);

    sprite.userData.index = this.objects.length;
    this.objects.push(sprite);
  }

  private addLights(): void {
    for (let i = 0; i < this.channelList.length; i++) {
      this.addLight(this.channelList[i]);
    }
  }

  private getObjectById(id): THREE.SpotLight {
    let found = null;
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].name === id) {
        found = this.objects[i].children[0];
        break;
      }
    }

    return found;
  }

  private onWindowResize(): void {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  private projectTo3D(e): THREE.Vector2 {
    const vector = new THREE.Vector2(0, 0);

    const position = this.container.getBoundingClientRect();

    this.mouse.x = ((e.clientX - position.left) / this.container.clientWidth) * 2 - 1;
    this.mouse.y = - ((e.clientY - position.top) / this.container.clientHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObject(this.background, true);
    if (intersects.length > 0) {
      vector.x = intersects[0].point.x;
      vector.y = intersects[0].point.y;
    }
    return vector;
  }
}
