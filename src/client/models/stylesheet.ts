import { NodeType } from './nodetype';

export type StyleSheet = {
    children: Array<Node>
};

export type Node = {
    type: NodeType,
    offset: number,
    end: number,
    getText: () => string
};