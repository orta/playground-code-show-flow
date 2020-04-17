import { Node, DiagnosticRelatedInformation } from "typescript";
import type React from "react";
/** Creates a set of util functions which is exposed to Plugins to make it easier to build consistent UIs */
export declare const createUtils: (sb: any, react: typeof React) => {
    /** Use this to make a few dumb element generation funcs */
    el: (str: string, elementType: string, container: Element) => HTMLElement;
    /** Get a relative URL for something in your dist folder depending on if you're in dev mode or not */
    requireURL: (path: string) => string;
    /** Returns a div which has an interactive AST a TypeScript AST by passing in the root node */
    createASTTree: (node: Node) => HTMLDivElement;
    /** The Gatsby copy of React */
    react: typeof React;
    /**
     * The playground plugin design system. Calling any of the functions will append the
     * element to the container you pass into the first param, and return the HTMLElement
     */
    createDesignSystem: (container: Element) => {
        /** Clear the sidebar */
        clear: () => void;
        /** Present code in a pre > code  */
        code: (code: string) => HTMLElement;
        /** Ideally only use this once, and maybe even prefer using subtitles everywhere */
        title: (title: string) => HTMLElement;
        /** Used to denote sections, give info etc */
        subtitle: (subtitle: string) => HTMLElement;
        p: (subtitle: string) => HTMLElement;
        /** When you can't do something, or have nothing to show */
        showEmptyScreen: (message: string) => HTMLDivElement;
        /**
         * Shows a list of hoverable, and selectable items (errors, highlights etc) which have code representation.
         * The type is quite small, so it should be very feasible for you to massage other data to fit into this function
         */
        listDiags: (sandbox: {
            config: {
                text: string;
                useJavaScript: boolean;
                compilerOptions: import("monaco-editor").languages.typescript.CompilerOptions;
                monacoSettings?: import("monaco-editor").editor.IEditorOptions | undefined;
                acquireTypes: boolean;
                supportTwoslashCompilerOptions: boolean;
                suppressAutomaticallyGettingDefaultText?: true | undefined;
                suppressAutomaticallyGettingCompilerFlags?: true | undefined;
                logger: {
                    log: (...args: any[]) => void;
                    error: (...args: any[]) => void;
                    groupCollapsed: (...args: any[]) => void;
                    groupEnd: (...args: any[]) => void;
                };
                domID: string;
            };
            supportedVersions: readonly ["3.8.3", "3.8.2", "3.7.5", "3.6.3", "3.5.1", "3.3.3", "3.1.6", "3.0.1", "2.8.1", "2.7.2", "2.4.1"];
            editor: import("monaco-editor").editor.IStandaloneCodeEditor;
            language: string;
            monaco: typeof import("monaco-editor");
            getWorkerProcess: () => Promise<any>;
            // tsvfs: typeof import("typescriptlang-org/static/js/sandbox/vendor/typescript-vfs");
            getEmitResult: () => Promise<import("typescript").EmitOutput>;
            getRunnableJS: () => Promise<string>;
            getDTSForCode: () => Promise<string>;
            getDomNode: () => HTMLElement;
            getModel: () => import("monaco-editor").editor.ITextModel;
            getText: () => string;
            setText: (text: string) => void;
            getAST: () => Promise<import("typescript").SourceFile>;
            ts: typeof import("typescript");
            createTSProgram: () => Promise<import("typescript").Program>;
            compilerDefaults: import("monaco-editor").languages.typescript.CompilerOptions;
            getCompilerOptions: () => import("monaco-editor").languages.typescript.CompilerOptions;
            setCompilerSettings: (opts: import("monaco-editor").languages.typescript.CompilerOptions) => void;
            updateCompilerSetting: (key: string | number, value: any) => void;
            updateCompilerSettings: (opts: import("monaco-editor").languages.typescript.CompilerOptions) => void;
            setDidUpdateCompilerSettings: (func: (opts: import("monaco-editor").languages.typescript.CompilerOptions) => void) => void;
            lzstring: any// typeof import("typescriptlang-org/static/js/sandbox/vendor/lzstring.min");
            createURLQueryWithCompilerOptions: (sandbox: any, paramOverrides?: any) => string;
            getTwoSlashComplierOptions: (code: string) => any;
            languageServiceDefaults: import("monaco-editor").languages.typescript.LanguageServiceDefaults;
            filepath: string;
        }, model: import("monaco-editor").editor.ITextModel, diags: DiagnosticRelatedInformation[]) => HTMLUListElement;
        localStorageOption: (setting: {
            blurb: string;
            flag: string;
            display: string;
        }) => HTMLLIElement;
    };
};
export declare type PluginUtils = ReturnType<typeof createUtils>;
