export const DEFAULT_QUARTO_YAML_CONTENT = {
    project: {
        type: "book",
        ["output-dir"]: "_book",
    },
    book: {
        title: "Open Innovation Platform Documentation",
    },
    // bibliography: "references.bib",
    format: {
        html: {
            theme: "cosmo",
            highlight: "github",
            toc: true,
            ["number-sections"]: false,
        },
    },
};

export const INDEX_QMD_CONTENT = `
---
title: Home
---

# Open Innovation Platform Documentation
`;
