#!/usr/bin/env sh

set -e

sudo chown -R vscode:vscode /home/vscode/.m2;
mkdir -p /home/vscode/.redhat/;
echo '{\"disabled\":true}' > /home/vscode/.redhat/io.quarkus.analytics.localconfig;
echo \"export PATH='$PATH':/workspaces/${localWorkspaceFolderBasename}/.devcontainer/scripts\" >> /home/vscode/.zshrc

./setup-maven.sh