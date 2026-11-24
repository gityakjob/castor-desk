# Maintainer: gityakjob <https://github.com/gityakjob>
pkgname=castor-desk
pkgver=1.0.0
pkgrel=1
pkgdesc="Castor Desk — Unofficial Linux desktop client for Google Gemini (CachyOS / Arch Linux)"
arch=('any')
url="https://github.com/gityakjob/castor-desk"
license=('MIT')
depends=('electron38')
optdepends=(
    'pipewire: screen sharing support under Wayland'
    'libnotify: desktop notifications'
)
provides=('castor-desk')
conflicts=('castor-desk')

package() {
    install -d "$pkgdir/usr/share/castor-desk"
    cp -r "$startdir/app" "$pkgdir/usr/share/castor-desk/"
    cp -r "$startdir/assets" "$pkgdir/usr/share/castor-desk/"
    cp "$startdir/package.json" "$pkgdir/usr/share/castor-desk/"

    install -Dm755 "$startdir/bin/castor-desk" "$pkgdir/usr/bin/castor-desk"
    install -Dm644 "$startdir/castor-desk.desktop" "$pkgdir/usr/share/applications/castor-desk.desktop"
    install -Dm644 "$startdir/assets/icon.png" "$pkgdir/usr/share/pixmaps/castor-desk.png"

    for size in 16 24 32 48 64 128 256 512; do
        if [ -f "$startdir/assets/icons/${size}x${size}.png" ]; then
            install -Dm644 "$startdir/assets/icons/${size}x${size}.png" \
                "$pkgdir/usr/share/icons/hicolor/${size}x${size}/apps/castor-desk.png"
        fi
    done
    install -Dm644 "$startdir/assets/icon.svg" "$pkgdir/usr/share/icons/hicolor/scalable/apps/castor-desk.svg"
    install -Dm644 "$startdir/LICENSE" "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
}
