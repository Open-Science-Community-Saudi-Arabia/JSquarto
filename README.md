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


#### Prerequisites

Before testing the tool locally, ensure you have the following prerequisites installed on your system:

-   [Quarto](https://quarto.org/)
-   [Babel Quarto](https://docs.ropensci.org/babelquarto/)
-   Node.js and npm (Node Package Manager)

#### Installation

To test the tool locally, follow these steps:

1. Install the cli package from NPM:
   
   ```bash
   npm i -g @oscsa/jsquarto 
   ```

2. Install Quarto, to do this refer to the official [Quarto installation guide](https://quarto.org/docs/get-started/) 

3. Install Babel quarto, refer to the official [Babel Quarto installation guide](https://docs.ropensci.org/babelquarto/)


### Usage

Once the dependencies are installed, you can navigate to the root directory of your project and follow the steps below:

1. To generate the documentation run the following command

   ```bash
   jsq doc:generate source=<path to source files> 
   ```

   This will extract the JSDoc comments from the js files and write them to their corresponding Quarto Markdown files.

   If the `source` flag is not provided, the tool will set `/source_files` as default.

   The generated `.qmd` files can be found in the `/docs` folder, you can change the output directory by providing the `output` flag.

2. To preview the generated documentation run

   ```bash
   jsq doc:preview
   ```

   This will generate the documentation, preview with quarto and open a link to preview the docs

3. The generated `.qmd` files can be found in the `docs/build` folder, you can change the output directory by providing the `output` flag.

   ```bash
   jsq doc:generate source=<path to source files> output=<path to output dir>
   ```
    
4. To include tutorials in the generated documentation, provide the `tutorials` flag.

   ```bash
   jsq doc:generate source=<path to source files> tutorials=<path to tutorials directory>
   ```

For more information on how to integrate translation tools like Crowdin with JSquarto, refer to the [Crowdin Worflow guide](https://jsquarto.netlify.app/chapters/tutorials/how_to/workflows#doc-generation-with-crowdin-translation).

For more details on using JSquarto and to see an example of the generated documentation, visit the [JSQuarto documentation](https://jsquarto.netlify.app/)

