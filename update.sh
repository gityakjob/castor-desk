#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Actualizando Castor Desk ==="

# 1. Si es un repositorio git, comprobar si hay cambios remotos
if [ -d "$PROJECT_DIR/.git" ]; then
    echo "-> Comprobando actualizaciones en el repositorio..."
    git -C "$PROJECT_DIR" pull --ff-only 2>/dev/null || echo "   (Repositorio local al día o sin remoto configurado)"
fi

# 2. Reinstalar archivos de la aplicación
echo "-> Aplicando archivos actualizados..."
"$PROJECT_DIR/install.sh"

echo ""
echo "✅ ¡Castor Desk ha sido actualizado exitosamente!"
