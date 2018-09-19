export class Device {
    public id: string;
    public name: string;
    public deviceId: number;
    public serviceId: number;
    public ipAddress: string;
    public port: string;
    public statusName: string;
    public statusId: number;
    public hasChildren: boolean;
}

export class Channel {
        public id: string;
        public name: string;
        public serviceId: number;
        public deviceId: number;
        public channelId: number;
        public isOn: boolean;
        public R: number;
        public G: number;
        public B: number;
        public statusId: number;
        public statusName: string;
        public longitude: number;
        public latitude: number;
        public color: any;
        public description: string;
        public mapId: number;
        public subType: number;
        public intensity: number;
    }


