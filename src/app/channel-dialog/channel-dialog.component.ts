import { Component, OnInit, Input, Inject } from '@angular/core';
import { Channel, Device } from '../device-configuration/device-configuration.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-channel-dialog',
  templateUrl: './channel-dialog.component.html',
  styleUrls: ['./channel-dialog.component.css']
})
export class ChannelDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ChannelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public selecetdChannel: Channel) { }

  ngOnInit() {
  }
  onSaveClick(): void {
    this.dialogRef.close(this.selecetdChannel);
  }
  onCancelClick(): void {
    this.dialogRef.close();
  }

}
