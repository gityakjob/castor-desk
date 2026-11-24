#!/bin/bash
set -e

echo "=== Desinstalando Castor Desk ==="

BIN_DIR="${HOME}/.local/bin"
DATA_DIR="${HOME}/.local/share/castor-desk"
APPS_DIR="${HOME}/.local/share/applications"
ICONS_DIR="${HOME}/.local/share/icons/hicolor"
PIXMAPS_DIR="${HOME}/.local/share/pixmaps"
AUTOSTART_FILE="${HOME}/.config/autostart/castor-desk.desktop"

rm -f "$BIN_DIR/castor-desk"
rm -rf "$DATA_DIR"
rm -f "$APPS_DIR/castor-desk.desktop"
rm -f "$PIXMAPS_DIR/castor-desk.png"
rm -f "$AUTOSTART_FILE"

for size in 16 24 32 48 64 128 256 512; do
  rm -f "$ICONS_DIR/${size}x${size}/apps/castor-desk.png"
done
rm -f "$ICONS_DIR/scalable/apps/castor-desk.svg"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$APPS_DIR" || true
fi

if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  gtk-update-icon-cache -f -t "$ICONS_DIR" || true
fi

echo "✅ Castor Desk ha sido desinstalado correctamente."
