const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

class MinecraftWebSocketServer {
    constructor(port = 8080) {
        this.port = port;
        this.wss = null;
        this.clients = new Set();
        this.features = {
            toggleSprint: false,
            autoWalk: false,
            autoJump: false,
            flyMode: false,
            fullbright: false,
            xray: false,
            esp: false,
            noRender: false,
            autoClicker: false,
            autoBlock: false,
            autoEat: false,
            autoPotion: false
        };
        this.settings = {
            cps: 10,
            updateRate: 60
        };
        this.performance = {
            fps: 0,
            ping: 0,
            memory: 0
        };
        
        this.init();
    }

    init() {
        // Create HTTP server
        const server = http.createServer((req, res) => {
            this.handleHttpRequest(req, res);
        });

        // Create WebSocket server
        this.wss = new WebSocket.Server({ server });

        this.wss.on('connection', (ws) => {
            console.log('New WebSocket client connected');
            this.clients.add(ws);
            
            // Send initial state
            this.sendToClient(ws, {
                type: 'initial_state',
                features: this.features,
                settings: this.settings,
                performance: this.performance
            });

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleMessage(data, ws);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            ws.on('close', () => {
                console.log('WebSocket client disconnected');
                this.clients.delete(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });
        });

        // Start performance monitoring
        this.startPerformanceMonitoring();

        // Start server
        server.listen(this.port, () => {
            console.log(`Minecraft WebGUI Server running on port ${this.port}`);
            console.log(`Open http://localhost:${this.port}/minecraft-client.html in your browser`);
        });
    }

    handleHttpRequest(req, res) {
        let filePath = req.url === '/' ? '/minecraft-client.html' : req.url;
        
        // Security check - prevent directory traversal
        if (filePath.includes('..')) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }

        const fullPath = path.join(__dirname, filePath);
        
        // Check if file exists
        fs.access(fullPath, fs.constants.F_OK, (err) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
                return;
            }

            // Get file extension
            const ext = path.extname(fullPath);
            let contentType = 'text/html';

            switch (ext) {
                case '.js':
                    contentType = 'application/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                case '.jpeg':
                    contentType = 'image/jpeg';
                    break;
                case '.gif':
                    contentType = 'image/gif';
                    break;
                case '.svg':
                    contentType = 'image/svg+xml';
                    break;
            }

            // Read and serve file
            fs.readFile(fullPath, (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Internal server error');
                    return;
                }

                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            });
        });
    }

    handleMessage(data, ws) {
        switch (data.type) {
            case 'feature':
                this.updateFeature(data.data.name, data.data.enabled);
                this.broadcast({
                    type: 'feature_status',
                    name: data.data.name,
                    enabled: data.data.enabled,
                    timestamp: Date.now()
                });
                break;

            case 'settings':
                this.updateSettings(data.data);
                this.broadcast({
                    type: 'settings_update',
                    settings: this.settings,
                    timestamp: Date.now()
                });
                break;

            case 'fps_data':
                // Handle FPS data from client
                this.performance.fps = data.data.fps || 0;
                this.performance.ping = data.data.ping || 0;
                this.performance.memory = data.data.memory || 0;
                break;

            case 'ping':
                this.sendToClient(ws, {
                    type: 'pong',
                    timestamp: Date.now()
                });
                break;
        }
    }

    updateFeature(featureName, enabled) {
        if (this.features.hasOwnProperty(featureName)) {
            this.features[featureName] = enabled;
            console.log(`Feature ${featureName} ${enabled ? 'enabled' : 'disabled'}`);
        }
    }

    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        console.log('Settings updated:', this.settings);
    }

    sendToClient(ws, data) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }

    broadcast(data) {
        this.clients.forEach(client => {
            this.sendToClient(client, data);
        });
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            // Simulate performance data (in real implementation, this would come from Minecraft)
            this.performance.fps = Math.floor(Math.random() * 60) + 30;
            this.performance.ping = Math.floor(Math.random() * 100) + 20;
            this.performance.memory = Math.floor(Math.random() * 1000) + 500;

            this.broadcast({
                type: 'fps',
                fps: this.performance.fps,
                ping: this.performance.ping,
                memory: this.performance.memory,
                timestamp: Date.now()
            });
        }, 1000); // Update every second
    }

    // Method to simulate Minecraft integration
    simulateMinecraftIntegration() {
        // This would be called by the actual Minecraft mod
        setInterval(() => {
            // Simulate random feature toggles for demo
            const features = Object.keys(this.features);
            const randomFeature = features[Math.floor(Math.random() * features.length)];
            const randomValue = Math.random() > 0.5;
            
            if (this.features[randomFeature] !== randomValue) {
                this.features[randomFeature] = randomValue;
                this.broadcast({
                    type: 'feature_status',
                    name: randomFeature,
                    enabled: randomValue,
                    timestamp: Date.now()
                });
            }
        }, 10000); // Change a random feature every 10 seconds for demo
    }
}

// Start the server
const server = new MinecraftWebSocketServer(8081);

// Simulate Minecraft integration for demo purposes
// server.simulateMinecraftIntegration();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    process.exit(0);
});

module.exports = MinecraftWebSocketServer;