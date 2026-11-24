# Castor Desk para CachyOS / Arch Linux 🚀

**Castor Desk** es un cliente comunitario **no oficial** de código abierto para usar la versión web de **Google Gemini** en el escritorio de **CachyOS / Arch Linux** (KDE Plasma / Wayland / X11).

> [!IMPORTANT]
> **Disclaimer / Aviso Legal**:
> * **EN**: **Castor Desk** is an **unofficial**, independent open-source community wrapper for Linux. It is **not affiliated with, authorized, maintained, sponsored, or endorsed by Google LLC** or any of its affiliates. "Google" and "Gemini" are registered trademarks of Google LLC.
> * **ES**: **Castor Desk** es un contenedor comunitario **no oficial** e independiente de código abierto para Linux. **No está afiliado, autorizado, mantenido, patrocinado ni respaldado por Google LLC**. "Google" y "Gemini" son marcas registradas de Google LLC.

![Castor Desk Icon](assets/icon.png)

---

## ✨ Características Principales

- **Integración con el Escritorio Linux**:
  - Ventana independiente con aceleración por hardware.
  - Integración en la bandeja del sistema (System Tray).
  - Comportamiento de "minimizar a la bandeja al cerrar" (se mantiene abierta en segundo plano para acceso instantáneo).
  - Atajo de teclado global configurable (`Ctrl+Alt+G` por defecto) para mostrar u ocultar la ventana desde cualquier lugar del sistema.
- **Sesión Persistente**:
  - Compatibilidad estándar de sesión web en Electron para mantener tu sesión iniciada entre reinicios.
- **Optimizado para CachyOS y Wayland**:
  - Detección automática de Wayland (`--ozone-platform-hint=auto` y decoraciones nativas).
  - Aceleración gráfica por GPU fluida.
  - Soporte de pantalla compartida y audio con PipeWire.
- **Multimodal y Voz**:
  - Permisos automáticos para micrófono: utiliza la entrada de voz de Gemini y Gemini Live sin bloqueos de permisos.
  - Soporte completo para arrastrar y soltar archivos, imágenes y documentos.
- **Gestión Inteligente de Enlaces**:
  - Los inicios de sesión y navegación dentro de Gemini se mantienen en la app.
  - Los enlaces externos (fuentes citadas, sitios web externos) se abren automáticamente en tu navegador predeterminado (Firefox, Brave, Chrome, etc.).
- **Totalmente Personalizable**:
  - Soporte de archivo de flags de usuario: `~/.config/castor-desk-flags.conf` (igual que `chatgpt-flags.conf`).
  - Configuración persistente de geometría de ventana, atajos y opciones en `~/.config/castor-desk/app-config.json`.

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
| :--- | :--- |
| **`Ctrl + Alt + G`** | **Invocar / Ocultar Castor Desk (Atajo global del sistema)** |
| **`Ctrl + N`** | Iniciar nuevo chat |
| **`Ctrl + R`** | Recargar página |
| **`Ctrl + Shift + R`** | Forzar recarga (sin caché) |
| **`Ctrl + =` / `Ctrl + +`** | Aumentar zoom |
| **`Ctrl + -`** | Disminuir zoom |
| **`Ctrl + 0`** | Restablecer tamaño original |
| **`F11`** | Alternar pantalla completa |
| **`Ctrl + Shift + I`** | Herramientas de desarrollador (DevTools) |
| **`Ctrl + Q`** | Salir completamente de la aplicación |

---

## 📦 Instalación y Uso

### 1. Instalación Directa con Pacman (Recomendada para CachyOS / Arch)

Puedes instalarlo directamente con un solo comando en tu terminal sin compilar:

```bash
sudo pacman -U https://github.com/gityakjob/castor-desk/releases/download/v1.0.0/castor-desk-1.0.0-1-any.pkg.tar.zst
```

### 2. Instalación Rápida local sin permisos de Administrador

Clona el repositorio o descarga el paquete portable y ejecuta:

```bash
./install.sh
```

Esto:
1. Instala los binarios y recursos en `~/.local/share/castor-desk`.
2. Crea el enlace ejecutable en `~/.local/bin/castor-desk` (accesible desde tu terminal).
3. Instala los iconos de alta resolución en el tema del sistema (`hicolor` y `pixmaps`).
4. Registra el acceso directo en `~/.local/share/applications/castor-desk.desktop` para que aparezca instantáneamente en el menú de KDE Plasma, KRunner (`Alt+Espacio`) y lanzador de aplicaciones.

### 3. Ejecutar la Aplicación

Puedes abrir **Castor Desk** de cualquiera de las siguientes formas:
- Desde el **Menú de Aplicaciones de KDE** buscando `Castor Desk`.
- Mediante **KRunner** (`Alt + Espacio`) escribiendo `Castor Desk`.
- Desde la terminal ejecutando:
  ```bash
  castor-desk
  ```
- O en segundo plano minimizado en la bandeja:
  ```bash
  castor-desk --start-minimized
  ```

---

## 🛠️ Instalación como Paquete de Sistema (PKGBUILD)

Si prefieres tenerlo registrado en el gestor de paquetes `pacman` de CachyOS:

```bash
makepkg -si
```

Esto compilará e instalará `castor-desk` a nivel de sistema (`/usr/bin/castor-desk`).

---

## ⚙️ Configuración y Flags Avanzados

### Flags Personalizados
Puedes crear o editar el archivo `~/.config/castor-desk-flags.conf` para añadir argumentos adicionales a Chromium/Electron (uno por línea), por ejemplo:

```conf
# ~/.config/castor-desk-flags.conf
--enable-gpu-rasterization
--enable-zero-copy
```

### Configuración de la App
Tu configuración se guarda automáticamente en `~/.config/castor-desk/app-config.json`:
- `minimizeToTray`: Minimizar a la bandeja del sistema al pulsar cerrar (por defecto `true`).
- `globalShortcut`: Combinación de teclas para invocar Castor Desk (por defecto `Control+Alt+G`).
- `globalShortcutEnabled`: Habilitar o deshabilitar el atajo global.

---

## 🔄 Actualización

Para actualizar la aplicación a la última versión disponible:

```bash
./update.sh
```

Esto descargará las actualizaciones más recientes y reinstalará los archivos automáticamente en tu sistema.

---

## 🚀 Exportación y Distribución

Para empaquetar y exportar la aplicación (para compartir con otros usuarios o instalar en otra PC con CachyOS / Arch Linux):

```bash
./export.sh
```

El script genera automáticamente en el directorio `dist/`:
1. **Paquete nativo de CachyOS / Arch Linux** (`castor-desk-*.pkg.tar.zst`):
   Instalable con:
   ```bash
   sudo pacman -U dist/castor-desk-*.pkg.tar.zst
   ```
2. **Paquete portable universal** (`castor-desk-*-linux-x64.tar.gz`):
   Comprimido con la app, iconos, acceso directo y scripts de instalación rápida listos para usar en cualquier sistema.

---

## 🗑️ Desinstalación

Para eliminar la instalación de usuario de manera limpia:

```bash
./uninstall.sh
```
O si lo instalaste mediante `pacman`:
```bash
sudo pacman -R castor-desk
```
