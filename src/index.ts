import type { PlaygroundPlugin, PluginUtils } from "./vendor/playground";
import type { SourceFile, Node } from "typescript";
import type { IDisposable } from "monaco-editor";

import { getDescendantAtRange, TreeMode } from "./astHover";
import { formatControlFlowGraph, graphInit } from "./graph";



const makePlugin = (utils: PluginUtils) => {
  let sourceFile: SourceFile | undefined;
  let disposable: IDisposable | undefined;
  let decorations: string[] = []

  const customPlugin: PlaygroundPlugin = {
    id: "flow",
    displayName: "Flow",
    didMount: (sandbox, container) => {

      const ds = utils.createDesignSystem(container)

      ds.subtitle("Flow Analysis")

      graphInit(sandbox.ts as any)

      disposable = sandbox.monaco.languages.registerHoverProvider("typescript", {
        provideHover: async function (model, position, token) {
          // sourceFile.get
          const ts = sandbox.ts;

          // const pos = sandbox.editor.getPosition();
          const pos = position;
          console.log(pos);

          if (pos === null) {
            return;
            // this.props.onClick([start, start]);
          }

          // ts.get
          const tspos = ts.getPositionOfLineAndCharacter(sourceFile, pos.lineNumber - 1, pos.column);

          const d = getDescendantAtRange(sandbox.ts, TreeMode.getChildren, sourceFile, [tspos, tspos + 1]);


          if("flowNode" in d) {
            const flowNode = d["flowNode"] 
            const node = d as Node
            const f = formatControlFlowGraph(flowNode)
            const s = node.getStart(sourceFile, false)
            const e = node.getEnd()

            if (s && e) {
              const start = model.getPositionAt(s)
              const end = model.getPositionAt(e)

              const main = {
                range: new sandbox.monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                options: { inlineClassName: "neutral-highlight" },
              }

              decorations = sandbox.editor.deltaDecorations(decorations, [ main ])
            }

            ds.clear()
            ds.code(f.text)
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
