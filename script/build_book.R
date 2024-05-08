# Install babelquarto if not already installed
if (!requireNamespace("babelquarto", quietly = TRUE)) {
  install.packages("babelquarto")
}

# Load babelquarto package
library(babelquarto)

# Define project directory
project_dir <- "src/docs"

# Render book
babelquarto::render_book(project_path = project_dir)
