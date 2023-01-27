type TTemplateConfig = {
    commands?: string[];
    ignore?: string[];
};

type TTemplates = {
    templates: Array<
        {
            name: string;
            display: string;
        } & ({ type: "bundled" } | { type: "git"; url: string })
    >;
};

type TClis = {
    clis: Array<{
        display: TValidClis;
        command: string;
        askForInstall?: boolean;
        createProjectFolder?: boolean;
    }>;
};

type TValidClis = "Vite" | "Next.js" | "T3" | "Solid-start" | "Astro" | "Tauri";
