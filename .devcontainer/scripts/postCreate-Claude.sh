#!/usr/bin/env bash

# devcontainer post-create hook
set -e

sudo chown -R vscode:vscode /home/vscode/.aws

# install Claude CLI and AWS CLI (these are not Python-specific)
npm install -g @anthropic-ai/claude-code \
    && curl -fsSL https://claude.ai/install.sh | bash

