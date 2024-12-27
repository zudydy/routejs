#!/bin/bash

echo "• Removing prev dist folder...";
rm -rf dist;
echo "";

echo "• Building the project...";
pnpm build;

echo "• Versioning the project...";
pnpm version patch -m "release: `v%s`";

echo "• Publishing the project...";
pnpm publish --access public;
