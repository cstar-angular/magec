import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { v4 } from 'uuid';
import { TREE_ACTIONS, KEYS, IActionMapping, ITreeOptions, ITreeState } from 'angular-tree-component';
import { ToastsManager } from 'ng2-toastr';
import { AppDataService } from './app.dataservice';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
public isConnected = false;
public nodes: Node[];
  title = 'app';
  state: ITreeState = {
    expandedNodeIds: {
      1: true,
      2: true
    },
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
  constructor(public toastr: ToastsManager, private vcr: ViewContainerRef
    , private appDataservice: AppDataService) {
    this.toastr.setRootViewContainerRef(vcr);
  }
  ngOnInit() {
    this.appDataservice.change.subscribe(isConnected => {
      this.isConnected = isConnected;
    });
  }
  onMoveNode($event) {
    console.log(
      'Moved',
      $event.node.name,
      'to',
      $event.to.parent.name,
      'at index',
      $event.to.index);
  }
}
