#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUR_DIR="/tmp/aur-castor-desk"

echo "=========================================================="
echo "    Publicador de Castor Desk en AUR (Arch Linux)"
echo "=========================================================="
echo ""
echo "Requisitos:"
echo " 1. Haber creado una cuenta en https://aur.archlinux.org"
echo " 2. Haber añadido tu clave SSH (~/.ssh/id_ed25519.pub) en tu perfil de AUR."
echo ""
read -p "¿Deseas continuar con la subida a AUR? (s/N): " confirm
if [[ "$confirm" != [sS] && "$confirm" != [sS][iI] ]]; then
    echo "Operación cancelada."
    exit 0
fi

rm -rf "$AUR_DIR"
echo "-> Clonando repositorio AUR..."
git clone ssh://aur@aur.archlinux.org/castor-desk.git "$AUR_DIR"

echo "-> Copiando archivos de empaquetado..."
cp "$PROJECT_DIR/PKGBUILD" "$AUR_DIR/"

echo "-> Generando archivo .SRCINFO..."
(cd "$AUR_DIR" && makepkg --printsrcinfo > .SRCINFO)

echo "-> Subiendo cambios a AUR..."
cd "$AUR_DIR"
git add PKGBUILD .SRCINFO
git commit -m "feat: release $(grep -o 'pkgver=[0-9.]*' PKGBUILD | cut -d'=' -f2)"
git push origin master

echo ""
echo "=========================================================="
echo " ✅ ¡Paquete publicado exitosamente en el AUR!"
echo " URL: https://aur.archlinux.org/packages/castor-desk"
echo " Los usuarios ya pueden instalarlo con: paru -S castor-desk"
echo "=========================================================="
