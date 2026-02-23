#!/bin/bash
echo "Clearing client node_modules cache..."
rm -rf /vercel/share/v0-project/client/node_modules/.cache
rm -rf /vercel/share/v0-next-shadcn/client/node_modules/.cache
echo "Cache cleared."
cd /vercel/share/v0-project/client && npm install --legacy-peer-deps --no-cache 2>/dev/null || true
echo "Done."
