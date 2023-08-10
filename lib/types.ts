export type GeneralAnswers = {
    name: string;
    type: "CLI" | "Template";
};

export type TemplateConfig = {
    commands?: string[];
    ignore?: string[];
};

export type Templates = {
    templates: Array<
        {
            name: string;
            display: string;
            config: TemplateConfig;
        } & ({ type: "bundled" } | { type: "git"; url: string })
    >;
};

export type Clis = {
    clis: Array<{
        display: ValidClis;
        command: string;
        askForInstall?: boolean;
        createProjectFolder?: boolean;
    }>;
};

export type ValidClis = "Vite" | "Next.js" | "T3" | "Solid-start" | "Astro" | "Tauri";
