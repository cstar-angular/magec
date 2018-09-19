import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import THREE = require('three');
import OrbitControls = require('three-orbit-controls');
import { Channel } from '../device-configuration/device-configuration.model';
import { LightsService } from '../lights/lights.service';
import { Map } from '../map-config/map-config.model';


const OrbitControlsLib = OrbitControls(THREE);

@Component({
  selector: 'app-graph-light-3d',
  templateUrl: './graph-light-3d.component.html'
})
export class GraphLight3DComponent implements OnInit, OnChanges {
  @Input() selectedMap: Map;
  @Input() channelList: Channel[];
  @Input() updatedChannel: Channel;
  @Input() addedChannel: Channel;
  @Input() deletedChannel: Channel;
  @Output() saveChannelChange: EventEmitter<Channel> = new EventEmitter<Channel>();

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement; // container size
  private background: THREE.Mesh; // background image
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private controls: OrbitControls;
  private objects: THREE.Sprite[] = new Array();

  constructor(private channelService: LightsService) { }

  ngOnInit() {
    // alert('Hello');
    // this.initScene();
  }
  ngOnChanges(changes: any) {
    // only run when property "data" changed
    if (changes['channelList']) {
      console.log(this.channelList);
      console.log(changes['channelList']);
    }
    if (changes['updatedChannel']) {
      this.updateChannelFromServer(this.updatedChannel);
    }
    if (changes['addedChannel']) {
      this.updateChannelFromServer(this.addedChannel);
    }
    if (changes['deletedChannel']) {
      this.deletedChannelFromServer(this.deletedChannel);
    }
    if (changes['selectedMap']) {
      if (this.selectedMap.id > 0) {
        this.initScene();
      }
    }
  }
  private saveChannel(channel: Channel): any {
    this.saveChannelChange.emit(channel);
  }
  public initScene(): void { this.init(); }
  private init(): void {
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
    if (this.container.childElementCount === 2) {
      this.container.removeChild(this.container.childNodes[0]);
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
    this.renderer.domElement.addEventListener('mouseup', this.onDocumentMouseUp.bind(this), false);
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);

    // assets
    this.loadBackground();

    // add lights
    this.addLights();

    this.render();
  }

  // change background image
  private loadBackground(): void {
    const url = this.selectedMap.uri;
    // if (this.channelList.length > 0 && this.channelList[0].mapId !== null) {
    //  // take the url from somewhere
    // }
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

  private onMouseMove(e): void {
    const position = this.container.getBoundingClientRect();

    this.mouse.x = ((e.clientX - position.left) / this.container.clientWidth) * 2 - 1;
    this.mouse.y = - ((e.clientY - position.top) / this.container.clientHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.objects, true);
    if (intersects.length > 0) {
      this.renderer.domElement.style.cursor = 'pointer';
    } else {
      this.renderer.domElement.style.cursor = 'auto';
    }
  }

  private onDocumentMouseUp(e): void {
    if (e.button === 0) {
      this.controls.enablePan = true;
    }
  }

  private onDocumentMouseDown(e): void {
    if (e.button === 0) {
      const position = this.container.getBoundingClientRect();

      this.mouse.x = ((e.clientX - position.left) / this.container.clientWidth) * 2 - 1;
      this.mouse.y = - ((e.clientY - position.top) / this.container.clientHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);

      const intersects = this.raycaster.intersectObjects(this.objects, true);
      if (intersects.length > 0) {
        const intersect = intersects[0];
        const channel = this.getDataByClickedObj(intersect.object);
        // console.log(channel);
        if (channel !== null) {
          this.controls.enablePan = false;
          const temp = this.channelService.cloneNewChannel(channel);
          if (temp.isOn === null || temp.isOn === false) {
            temp.isOn = true;
          } else {
            temp.isOn = false;
          }

          this.saveChannel(temp);
        }
      }
    }
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

  private updateChannelFromServer(data: Channel): void {
    const object = this.getObjectById(data.id);
    // console.log(object);
    if (object === null) { return; }
    object.intensity = (data.isOn === true) ? 1 : 0;
    if (data.color === null || data.color === 'rgb(,,)') {
      data.color = 'rgb(255,255,255)';
    }
    if (data.subType === 13) {
      if (data.intensity) {
        data.color = 'rgb(' + data.intensity + ',' + data.intensity + ',' + data.intensity + ')';
      } else {
        data.color = 'rgb(0,0,0)';
      }
    }

    const colors = data.color.match(/\d+/g);
    object.color.r = colors[0];
    object.color.g = colors[1];
    object.color.b = colors[2];

    object.parent.position.x = data.longitude;
    object.parent.position.y = data.latitude;
  }

  private deletedChannelFromServer(data: Channel): void {
    const object = this.getObjectById(data.id);
    // console.log(data);
    if (object === null) { return; }
    this.objects.slice(object.parent.userData.index, 1);
    this.scene.remove(object);
    this.scene.remove(object.parent);
  }

  private addedChannelFromServer(data: Channel): void {
    // console.log(data);
    this.addLight(data);
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }

  private addLight(data: Channel): void {
    const textureLoader = new THREE.TextureLoader();
    const lightText = textureLoader.load('/assets/bulb.png');
    const material = new THREE.SpriteMaterial({ map: lightText, color: 0xffffff });
    // console.log(data);
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
}
