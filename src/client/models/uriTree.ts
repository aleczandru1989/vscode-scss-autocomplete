export class UriTree {
    children: UriTree[];
    name: string;
    path: string;
    size: number;
    type: 'directory' | 'file';
}

