# Install babelquarto if not already installed
if (!requireNamespace("babelquarto", quietly = TRUE)) {
  pak::pak("ropensci-review-tools/babelquarto")
}

# Load babelquarto package
library(babelquarto)

# Define project directory
project_dir <- "/home/richie/Desktop/repos/oscsa/JSquarto/docs"

# Render book
babelquarto::render_book(project_path = project_dir)
