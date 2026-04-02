const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow frontend to hit this

app.post('/restart-tunnel', (req, res) => {
    console.log("=> Frontend requested Tunnel Restart...");
    // The exact powershell command the AI uses to fix it
    const psCmd = 'Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 2; npx localtunnel --port 8000 --subdomain scriptyt-node-v2';
    
    // We launch it as a detached process so we don't kill the watchdog itself if it runs on Node!
    // Wait, the watchdog IS a node process! If we run Stop-Process -Name node, it kills the watchdog too!
    // Instead of killing all nodes, let's kill specifically the localtunnel process. 
    // `Get-WmiObject Win32_Process | Where-Object { $_.CommandLine -match "localtunnel" } | ForEach-Object { $_.Terminate() }`
    
    const safePsCmd = `
        Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'localtunnel' } | Invoke-CimMethod -MethodName Terminate;
        Start-Sleep -Seconds 2;
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx localtunnel --port 8000 --subdomain scriptyt-node-v2"
    `;

    exec(safePsCmd, { shell: 'powershell.exe' }, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).send("Error");
        }
    });

    res.json({ message: "Tunnel restarting..." });
});

app.listen(4999, () => {
    console.log("==== Local Watchdog Active ====");
    console.log("Listening on http://localhost:4999");
    console.log("This allows your web app GUI to restart Localtunnel.");
});
