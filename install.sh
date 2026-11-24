#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="${HOME}/.local/bin"
DATA_DIR="${HOME}/.local/share/castor-desk"
APPS_DIR="${HOME}/.local/share/applications"
ICONS_DIR="${HOME}/.local/share/icons/hicolor"
PIXMAPS_DIR="${HOME}/.local/share/pixmaps"

echo "=== Instalando Castor Desk para CachyOS ==="

# 1. Asegurar directorios
mkdir -p "$BIN_DIR" "$DATA_DIR" "$APPS_DIR" "$PIXMAPS_DIR"

# 2. Copiar archivos de la aplicación
echo "-> Copiando archivos de la app a $DATA_DIR..."
rm -rf "$DATA_DIR/app" "$DATA_DIR/assets" "$DATA_DIR/bin"
cp -r "$PROJECT_DIR/app" "$DATA_DIR/"
cp -r "$PROJECT_DIR/assets" "$DATA_DIR/"
cp -r "$PROJECT_DIR/bin" "$DATA_DIR/"
cp "$PROJECT_DIR/package.json" "$DATA_DIR/"
cp "$PROJECT_DIR/LICENSE" "$DATA_DIR/" 2>/dev/null || true

# 3. Enlace ejecutable en ~/.local/bin
echo "-> Creando ejecutable en $BIN_DIR/castor-desk..."
ln -sf "$DATA_DIR/bin/castor-desk" "$BIN_DIR/castor-desk"
chmod +x "$BIN_DIR/castor-desk"

# 4. Instalar iconos en hicolor y pixmaps
echo "-> Instalando iconos..."
cp "$PROJECT_DIR/assets/icon.png" "$PIXMAPS_DIR/castor-desk.png"

for size in 16 24 32 48 64 128 256 512; do
  TARGET_ICON_DIR="$ICONS_DIR/${size}x${size}/apps"
  mkdir -p "$TARGET_ICON_DIR"
  if [ -f "$PROJECT_DIR/assets/icons/${size}x${size}.png" ]; then
    cp "$PROJECT_DIR/assets/icons/${size}x${size}.png" "$TARGET_ICON_DIR/castor-desk.png"
  fi
done

SCALABLE_DIR="$ICONS_DIR/scalable/apps"
mkdir -p "$SCALABLE_DIR"
cp "$PROJECT_DIR/assets/icon.svg" "$SCALABLE_DIR/castor-desk.svg"

# 5. Instalar entrada de escritorio (.desktop)
echo "-> Instalando acceso directo en $APPS_DIR/castor-desk.desktop..."
cp "$PROJECT_DIR/castor-desk.desktop" "$APPS_DIR/castor-desk.desktop"

# 6. Actualizar cachés del sistema
echo "-> Actualizando caché de aplicaciones e iconos..."
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$APPS_DIR" || true
fi

if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  gtk-update-icon-cache -f -t "$ICONS_DIR" || true
fi

if command -v kbuildsycoca6 >/dev/null 2>&1; then
  kbuildsycoca6 --noincremental >/dev/null 2>&1 || true
elif command -v kbuildsycoca5 >/dev/null 2>&1; then
  kbuildsycoca5 --noincremental >/dev/null 2>&1 || true
fi

echo ""
echo "✅ ¡Castor Desk instalado con éxito!"
echo "Puedes ejecutarlo escribiendo 'castor-desk' en tu terminal"
echo "o buscándolo en el menú de aplicaciones de KDE Plasma."
