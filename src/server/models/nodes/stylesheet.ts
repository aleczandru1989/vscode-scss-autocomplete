import { NodeType } from './nodetype';

export class Node {
    public parent: Node | null;
    public offset: number;
    public length: number;
    public end: () => number;
    public options: { [name: string]: any; } | undefined;
    public textProvider: ITextProvider | undefined; // only set on the root node
    public getText: () => string;
    public matches: (str: string) => boolean;
    public startsWith: (str: string) => boolean;
    public endsWith: (str: string) => boolean;
    public accept: (visitor: IVisitorFunction) => void;
    public acceptVisitor: (visitor: IVisitor) => void;
    public adoptChild: (node: Node, index: number) => Node;
    public attachTo: (parent: Node, index: number) => Node;
    public collectIssues: (results: any[]) => void;
    public addIssue: (issue: IMarker) => void;
    public isErroneous: (recursive: boolean) => boolean;
    public setNode: (field: keyof this, node: Node, index: number) => boolean;
    public addChild: (node: Node) => boolean;
    public hasChildren: () => boolean;
    public getChildren: () => Node[];
    public getChild: (index: number) => Node;
    public addChildren: (nodes: Node[]) => void;
    public findFirstChildBeforeOffset: (offset: number) => Node;
    public findChildAtOffset: (offset: number, goDeep: boolean) => Node;
    public encloses: (candidate: Node) => boolean;
    public getParent: () => Node;
    public findParent: (type: NodeType) => Node;
    public findAParent: (...types: NodeType[]) => Node;
    public setData: (key: string, value: any) => void;
    public getData: (key: string) => any;
}

export class Stylesheet extends Node {

    private name: string;
}
export interface ITextProvider {
    (offset: number, length: number): string;
}

export interface IMarker {
    getNode(): Node;
    getMessage(): string;
    getOffset(): number;
    getLength(): number;
    getRule(): IRule;
    getLevel(): Level;
}

export interface IRule {
    id: string;
    message: string;
}

export enum Level {
    Ignore = 1,
    Warning = 2,
    Error = 4
}

export interface IVisitorFunction {
    (node: Node): boolean;
}

export interface IVisitor {
    visitNode: (node: Node) => boolean;
}
