// These come from https://github.com/dsherret/ts-ast-viewer
// The MIT License (MIT) by David Sherret

import type { Node, SourceFile } from "typescript";

export function getStartSafe(node: Node, sourceFile: SourceFile) {
  // workaround for compiler api bug with getStart(sourceFile, true) (see PR #35029 in typescript repo)
  const jsDocs = ((node as any).jsDoc) as Node[] | undefined;
  if (jsDocs && jsDocs.length > 0)
      return jsDocs[0].getStart(sourceFile);
  return node.getStart(sourceFile);
}


export function assertNever(value: never, message: string): never {
  throw new Error(message);
}

export enum TreeMode {
    forEachChild,
    getChildren
}

export function getChildrenFunction(mode: TreeMode, sourceFile: SourceFile) {
  switch (mode) {
      case TreeMode.getChildren:
          return getAllChildren;
      case TreeMode.forEachChild:
          return forEachChild;
      default:
          return assertNever(mode, `Unhandled mode: ${mode}`);
  }

  function getAllChildren(node: Node) {
      return node.getChildren(sourceFile);
  }

  function forEachChild(node: Node) {
      const nodes: Node[] = [];
      node.forEachChild(child => {
          nodes.push(child);
          return undefined;
      });
      return nodes;
  }
}


export function getDescendantAtRange(ts: typeof import("typescript"), mode: TreeMode, sourceFile: SourceFile, range: [number, number]) {
    const getChildren = getChildrenFunction(mode, sourceFile);
    const syntaxKinds = ts.SyntaxKind
    let bestMatch: { node: Node; start: number; } = { node: sourceFile, start: sourceFile.getStart(sourceFile) };
    searchDescendants(sourceFile);
    return bestMatch.node;

    function searchDescendants(node: Node) {
        const children = getChildren(node);
        for (const child of children) {
            if (child.kind !== syntaxKinds.SyntaxList) {
                if (isBeforeRange(child.end))
                    continue;

                const childStart = getStartSafe(child, sourceFile);

                if (isAfterRange(childStart))
                    return;

                const isEndOfFileToken = child.kind === syntaxKinds.EndOfFileToken;
                const hasSameStart = bestMatch.start === childStart && range[0] === childStart;
                if (!isEndOfFileToken && !hasSameStart)
                    bestMatch = { node: child, start: childStart };
            }

            searchDescendants(child);
        }
    }

    function isBeforeRange(pos: number) {
        return pos < range[0];
    }

    function isAfterRange(nodeEnd: number) {
        return nodeEnd >= range[0] && nodeEnd > range[1];
    }
}
