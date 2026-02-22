# C4-PlantUML Library (Local)

This directory holds the C4-PlantUML library for **offline** PlantUML diagram rendering when external URLs are blocked.

## Setup

Run the following to populate this directory with the C4 library:

```bash
cd docs/c4-lib
git clone https://github.com/plantuml-stdlib/C4-PlantUML.git .
```

Or add as a submodule from the project root:

```bash
git submodule add https://github.com/plantuml-stdlib/C4-PlantUML.git docs/c4-lib
```

After setup, the C4 diagrams in `docs/en/c4/` and `docs/zh/c4/` will render without network access.
