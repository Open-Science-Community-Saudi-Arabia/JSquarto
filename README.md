<h1 align="center">JSQuarto</h1>

<div align="center">
    Generate JS package API reference documentation using Markdown and Quarto.
</div>
<br />
<div align="center">
  <p align="center">
    <a href="https://jsquarto.netlify.app/"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://jsquarto.netlify.app/">View Demo</a>
    ·
    <a href="https://github.com/Open-Science-Community-Saudi-Arabia/JSquarto/issues">Report Bug</a>
    ·
    <a href="https://github.com/Open-Science-Community-Saudi-Arabia/JSquarto/issues">Request Feature</a>
  </p>
</div>
<br/>

### Testing Your Tool Locally

#### Prerequisites

Before testing the tool locally, ensure you have the following prerequisites installed on your system:

-   [Quarto](https://quarto.org/)
-   Node.js and npm (Node Package Manager)
-   Git (optional, if cloning the repository)

#### Installation

To test the tool locally, follow these steps:

1. Clone the repository:
    ```bash
        git clone https://github.com/Open-Science-Community-Saudi-Arabia/JSquarto
    ```
2. Navigate to the projecte directory

3. Install dependencies
    ```bash
        npm install
    ```

### Running the Tool

Once the dependencies are installed, you can paste the files in the JS files or folder in the `/source_files` directory you can run the tool using the following command

To generate the documentation run the following command

```bash
     npm run doc:generate
```

This will extract the JSDoc comments from the js files and write them to their corresponding Quarto Markdown files.

~
You can choose to specify the directory where the `source_files` are, to do this run `npm run doc:generate <path to source files>` currently it only supports relative file paths.

    It also supports addition of custom tutorials, to do this add the .qmd files for the tutorials in the `/tutorials` directory

~

The generated `.qmd` files can be found in the `/docs/chapters` folder

To preview the generated documentation run
`bash
        npm run doc:preview
    `
The docs are previewed with quarto, so make sure to have quarto already installed

You can choose to generate and preview in one go, to do this run the command below
`bash
        npm run build
    `

This will generate the documentation, preview with quarto and open a link to preview the docs

For more details on using JSquarto and to see an example of the generated documentation, visit the [JSQuarto documentation](https://jsquarto.netlify.app/)
