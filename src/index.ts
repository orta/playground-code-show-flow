import type { PlaygroundPlugin, PluginUtils } from "./vendor/playground";
import { SourceFile, Node } from "typescript";

import { getNodeAtPosition } from "./astHover";
import { formatControlFlowGraph, graphInit, FlowGraphNode } from "./graph";

const makePlugin = (utils: PluginUtils) => {
  let sourceFile: SourceFile | undefined;
  let decorations: string[] = [];

  const customPlugin: PlaygroundPlugin = {
    id: "flow",
    displayName: "Flow",
    didMount: (sandbox, container) => {
      const ds = utils.createDesignSystem(container);

      ds.subtitle("Code Flow Analysis");
      ds.p("This plugin will look backwards from where your cursor is placed, to find the flow nodes which affected its types.")

      const graph = document.createElement("div")
      container.appendChild(graph)
      const infoDS = utils.createDesignSystem(graph)

      graphInit(sandbox.ts as any);

      sandbox.editor.onDidChangeCursorPosition(event => {
          const ts = sandbox.ts;
          const pos = event.position;

          infoDS.clear();

          // ts.get
          const tspos = ts.getPositionOfLineAndCharacter(sourceFile, pos.lineNumber, pos.column);
          const highlightedASTNode = getNodeAtPosition(sandbox.ts, sourceFile, tspos);
          const model = sandbox.getModel()

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
              const name = graphNode.text.split(" ")[0]
              if(name === "Start") return

              infoDS.p(name)

              if (hasNode(graphNode.flowNode)) {
                if (graphNode.flowNode.node) {
                  const astNode = graphNode.flowNode.node
                  const diagForAST: import("typescript").DiagnosticRelatedInformation = {
                    category: 0, 
                    start: astNode.getStart(sourceFile), 
                    code: 1,
                    file: sourceFile,
                    length: astNode.getFullWidth(),
                    messageText: getNodeText(astNode),
                  }
                  infoDS.listDiags(model, [diagForAST])
                }
              }

              const children = getChildren(graphNode);
              children.forEach((element) => {
                renderNode(element);
              });
            };

            infoDS.title("Flow Graph")

            infoDS.subtitle("Starting backwards from:")
            infoDS.createASTTree(node, { closedByDefault: true })

            renderNode(flowGraph.root);

            graph.appendChild(document.createElement("hr"))
            infoDS.subtitle("Text representation")
            infoDS.code(flowGraph.text);
          } else {
            if (highlightedASTNode) {
              infoDS.p(`No flow node found in '${highlightedASTNode.getText()}'`)
            } else {
              infoDS.p(`No TS AST node found`)
            }
          }
        })
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
