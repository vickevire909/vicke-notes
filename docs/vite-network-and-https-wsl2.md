# Vite network access and HTTPS setup for WSL2

## Phase 1: Make Vite reachable from devices on the same network

Use this when you want to open the dev server from another device such as a phone.

1. In Vite, bind to all interfaces.
   - In vite.config.ts:

   ```ts
   server: {
     host: '0.0.0.0',
   },
   ```

2. Start the dev server.

   ```bash
   pnpm dev
   ```

3. Use the Windows host IP, not the WSL private IP.
   - On Windows PowerShell:

   ```powershell
   ipconfig
   ```
   - Use the IPv4 address of your Wi-Fi adapter on the phone.

4. If Vite is running in WSL2, forward port 5173 from Windows to WSL and open the firewall rule with a PowerShell script.
   - Save the following as `vite-wsl-port.ps1` and run it from Windows PowerShell as Administrator:

   ```powershell
   $wslIp = (wsl.exe hostname -I).Trim().Split()[0]

   if (-not (Get-NetFirewallRule -DisplayName "Vite Dev Server" -ErrorAction SilentlyContinue)) {
     New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow -Profile Private
   }

   netsh interface portproxy reset
   netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=5173 connectaddress=$wslIp connectport=5173
   ```

   - This single script creates the Windows firewall rule and forwards port 5173 to the WSL container.

5. Test from the other device.

6. Test from the other device.
   - Open:
   ```text
   http://<windows-lan-ip>:5173
   ```
   - Make sure both devices are on the same Wi-Fi network and VPN is off.

## Phase 2: Enable HTTPS for PWA installability in dev

Use this when you want the app to behave like a real PWA and show install prompts.

1. Install mkcert.
   - On WSL/Linux:

   ```bash
   sudo apt install libnss3-tools
   curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
   chmod +x mkcert-v*-linux-amd64
   sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert
   ```

   - On Windows, install Scoop first. From a Powershell window:

   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
   ```

   - Then add the extras bucket and install mkcert:

   ```powershell
   scoop bucket add extras
   scoop install mkcert
   ```

2. Install and trust the same mkcert root CA on both environments.
   - In WSL, create and install the CA:

   ```bash
   mkcert -install
   mkcert -CAROOT
   ```

   - The second command prints the folder containing the CA files. Copy only `rootCA.pem` from that folder to Windows.
   - Do not copy `rootCA-key.pem`; that private key should stay on the machine that created it.

   - In Windows PowerShell, point mkcert at the copied CA directory and install it into the Windows trust store.
   - From WSL, output the CA root path as the windows full path so we can reference it from the windows host:

   ```bash
   wslpath -w "$(mkcert -CAROOT)"
   ```

   - Then use that result in PowerShell:

   ```powershell
   $env:CAROOT = "<your-windows-full-path>"
   mkcert -install
   ```

   - This is the important part: Windows must trust the same root CA that WSL is using, otherwise Chrome will still show the certificate as untrusted.

   - You can verify it in Windows Certificate Manager:

   ```powershell
   certmgr.msc
   ```

   - Open Trusted Root Certification Authorities -> Certificates and look for the mkcert CA.

3. Generate the certificate files in WSL2.
   - Run this inside WSL2, not in Windows PowerShell.

   ```bash
   mkdir -p ~/.certs
   mkcert -key-file ~/.certs/key.pem -cert-file ~/.certs/cert.pem localhost 127.0.0.1 ::1 <windows-lan-ip>
   ```

   - Replace `<windows-lan-ip>` with the IPv4 address of your Windows machine on the same network.
   - This makes the certificate valid for the address you will use from your phone or another device.

4. Load the certs in Vite.
   - In vite.config.ts:

   ```ts
   import { readFileSync } from 'node:fs';
   import { resolve } from 'node:path';
   import { homedir } from 'node:os';

   server: {
     host: '0.0.0.0',
     https: {
       key: readFileSync(resolve(homedir(), '.certs', 'key.pem'), 'utf8'),
       cert: readFileSync(resolve(homedir(), '.certs', 'cert.pem'), 'utf8'),
     },
   },
   ```

5. Trust the certificate in the browser used for testing.
   - On Windows, make sure the browser is using the same root CA that was exported from WSL and installed with `mkcert -install`.
   - Restart the browser after installing the CA.
   - On the phone, install the same `rootCA.pem` as a trusted CA.

6. Test with HTTPS.
   - Open:

   ```text
   https://<windows-lan-ip>:5173
   ```
   - Vite may report multiple URLs when it starts, such as:

   ```text
   https://localhost:5173/
   https://<windows-lan-ip>:5173/
   ```

   - Use the LAN IP address when testing from another device on the same network.

7. After installing the CA, restart the browser and reopen the app.
   - The app should then be eligible for PWA install behavior in supported browsers.

## Trust the CA on another device

1. Restart the Vite dev server.
   - Vite must restart to pick up the new certificate files.

2. Trust the mkcert root CA on the other device.
   - On the phone or other device, install the same `rootCA.pem` as a trusted CA.
   - Without that trust step, the browser will still show the site as insecure even if the hostname resolves correctly.
   - On Android, the process is usually:
     1. Copy `rootCA.pem` to the phone.
     2. Open the file in the built-in Files app or a file manager.
     3. Tap to import it as a certificate.
     4. When prompted, choose to install it as a CA certificate.
     5. If the phone asks for a certificate name, use something like `mkcert Local CA`.
     6. After installation, open the browser again and revisit `https://<windows-lan-ip>:5173`.
   - Some Android versions or manufacturers may require enabling the certificate in Settings -> Security -> Encryption & credentials -> Trusted credentials.

3. Open the app with HTTPS.
   - Use:

   ```text
   https://<windows-lan-ip>:5173
   ```

   - If the device is on the same network and the CA is trusted, the site should load as trusted and the PWA install flow should become available.
