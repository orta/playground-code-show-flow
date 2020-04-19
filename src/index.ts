import type { PlaygroundPlugin, PluginUtils } from "./vendor/playground";
import { SourceFile, Node } from "typescript";
import type { IDisposable } from "monaco-editor";

import { getDescendantAtRange, TreeMode } from "./astHover";
import { formatControlFlowGraph, graphInit, FlowGraphNode } from "./graph";

const makePlugin = (utils: PluginUtils) => {
  let sourceFile: SourceFile | undefined;
  let disposable: IDisposable | undefined;
  let decorations: string[] = [];

  const customPlugin: PlaygroundPlugin = {
    id: "flow",
    displayName: "Flow",
    didMount: (sandbox, container) => {
      const ds = utils.createDesignSystem(container);

      ds.subtitle("Flow Analysis");

      graphInit(sandbox.ts as any);

      disposable = sandbox.monaco.languages.registerHoverProvider("typescript", {
        provideHover: async function (model, position, token) {
          const ts = sandbox.ts;
          const pos = position;

          if (pos === null) {
            return;
          }

          // ts.get
          const tspos = ts.getPositionOfLineAndCharacter(sourceFile, pos.lineNumber - 1, pos.column);
          const highlightedASTNode = getDescendantAtRange(sandbox.ts, TreeMode.getChildren, sourceFile, [tspos, tspos + 1]);

          if ("flowNode" in highlightedASTNode) {
            const flowNode = highlightedASTNode["flowNode"];
            const node = highlightedASTNode as Node;
            const flowGraph = formatControlFlowGraph(flowNode);
            const s = node.getStart(sourceFile, false);
            const e = node.getEnd();

            const { hasNode, getChildren, getNodeText } = flowGraph;

            if (s && e) {
              const start = model.getPositionAt(s);
              const end = model.getPositionAt(e);

              const main = {
                range: new sandbox.monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                options: { inlineClassName: "neutral-highlight" },
              };
              decorations = sandbox.editor.deltaDecorations(decorations, [main]);
            }

            const renderNode = (graphNode: FlowGraphNode) => {
              ds.p(graphNode.text.split(" ")[0])


              if (hasNode(graphNode.flowNode)) {
                if (graphNode.flowNode.node) {
                  const astNode = graphNode.flowNode.node
                  const diagForAST: import("typescript").DiagnosticRelatedInformation = {
                    category: 0, 
                    start: astNode.getStart(sourceFile), 
                    code: 1,
                    file: sourceFile,
                    length: astNode.getFullWidth(),
                    messageText: getNodeText(astNode)
                  }
                  ds.listDiags(sandbox as any, model, [diagForAST])
                }
              }

              const children = getChildren(graphNode);
              children.forEach((element) => {
                renderNode(element);
              });
            };

            ds.clear();


            ds.title("Flow Graph")

            ds.subtitle("Beginning at " +  ts.SyntaxKind[node.kind] + " on line " + pos.lineNumber)

            renderNode(flowGraph.root);
            ds.code(flowGraph.text);
          }

          return {
            contents: [],
          };
        },
      });
    },

    didUnmount: () => {
      disposable.dispose();
    },
    // This is called occasionally as text changes in monaco,
    // it does not directly map 1 keyup to once run of the function
    // because it is intentionally called at most once every 0.3 seconds
    // and then will always run at the end.
    modelChangedDebounce: async (sandbox, _model) => {
      sourceFile = await sandbox.getAST();
    },

    // Gives you a chance to remove anything set up,
    // the container itself if wiped of children after this.
  };

  return customPlugin;
};

export default makePlugin;
