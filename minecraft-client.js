class MinecraftClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.guiVisible = false;
        this.features = {
            toggleSprint: false,
            autoWalk: false,
            autoJump: false,
            safeWalk: false,
            fullbright: false,
            clearWater: false,
            betterFoliage: false,
            customCrosshair: false,
            fovChanger: false,
            autoEat: false,
            autoPotion: false,
            inventoryManager: false,
            autoTool: false,
            autoArmor: false,
            autoRepair: false
        };
        this.settings = {
            updateRate: 60,
            websocketPort: 8081,
            fov: 90,
            theme: 'dark',
            fpsPosition: 'top-left'
        };
        this.fps = 0;
        this.ping = 0;
        this.memory = 0;
        this.cps = 0;
        this.fpsHistory = [];
        this.clickCount = 0;
        this.lastClickTime = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupHotkeys();
        this.startFPSMonitoring();
        this.updateUI();
    }

    setupEventListeners() {
        // Toggle GUI button
        document.getElementById('toggle-gui').addEventListener('click', () => {
            this.toggleGUI();
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.tab-btn').dataset.tab);
            });
        });

        // Feature toggles
        document.getElementById('toggle-sprint').addEventListener('change', (e) => {
            this.toggleFeature('toggleSprint', e.target.checked);
        });

        document.getElementById('auto-walk').addEventListener('change', (e) => {
            this.toggleFeature('autoWalk', e.target.checked);
        });

        document.getElementById('auto-jump').addEventListener('change', (e) => {
            this.toggleFeature('autoJump', e.target.checked);
        });

        document.getElementById('safe-walk').addEventListener('change', (e) => {
            this.toggleFeature('safeWalk', e.target.checked);
        });

        document.getElementById('fullbright').addEventListener('change', (e) => {
            this.toggleFeature('fullbright', e.target.checked);
        });

        document.getElementById('clear-water').addEventListener('change', (e) => {
            this.toggleFeature('clearWater', e.target.checked);
        });

        document.getElementById('better-foliage').addEventListener('change', (e) => {
            this.toggleFeature('betterFoliage', e.target.checked);
        });

        document.getElementById('custom-crosshair').addEventListener('change', (e) => {
            this.toggleFeature('customCrosshair', e.target.checked);
        });

        document.getElementById('fov-changer').addEventListener('change', (e) => {
            this.toggleFeature('fovChanger', e.target.checked);
        });

        document.getElementById('inventory-manager').addEventListener('change', (e) => {
            this.toggleFeature('inventoryManager', e.target.checked);
        });

        document.getElementById('auto-tool').addEventListener('change', (e) => {
            this.toggleFeature('autoTool', e.target.checked);
        });

        document.getElementById('auto-armor').addEventListener('change', (e) => {
            this.toggleFeature('autoArmor', e.target.checked);
        });

        document.getElementById('auto-repair').addEventListener('change', (e) => {
            this.toggleFeature('autoRepair', e.target.checked);
        });

        document.getElementById('auto-eat').addEventListener('change', (e) => {
            this.toggleFeature('autoEat', e.target.checked);
        });

        document.getElementById('auto-potion').addEventListener('change', (e) => {
            this.toggleFeature('autoPotion', e.target.checked);
        });

        // Settings
        document.getElementById('fov-slider').addEventListener('input', (e) => {
            this.settings.fov = parseInt(e.target.value);
            document.getElementById('fov-value').textContent = this.settings.fov;
            this.sendToMinecraft('settings', { fov: this.settings.fov });
        });

        document.getElementById('update-rate-slider').addEventListener('input', (e) => {
            this.settings.updateRate = parseInt(e.target.value);
            document.getElementById('update-rate-value').textContent = this.settings.updateRate;
        });

        document.getElementById('websocket-port').addEventListener('change', (e) => {
            this.settings.websocketPort = parseInt(e.target.value);
        });

        document.getElementById('theme-selector').addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.applyTheme(e.target.value);
        });

        document.getElementById('fps-position').addEventListener('change', (e) => {
            this.settings.fpsPosition = e.target.value;
            this.updateFPSPosition(e.target.value);
        });

        document.getElementById('connect-btn').addEventListener('click', () => {
            this.connectToMinecraft();
        });
    }

    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            // Prevent hotkeys when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch(e.key) {
                case 'F1':
                    e.preventDefault();
                    this.toggleGUI();
                    break;
                case 'F2':
                    e.preventDefault();
                    this.toggleFeature('toggleSprint', !this.features.toggleSprint);
                    break;
                case 'F3':
                    e.preventDefault();
                    this.toggleFeature('autoWalk', !this.features.autoWalk);
                    break;
                case 'F4':
                    e.preventDefault();
                    this.toggleFeature('fullbright', !this.features.fullbright);
                    break;
            }
        });
    }

    toggleGUI() {
        this.guiVisible = !this.guiVisible;
        const gui = document.getElementById('webgui');
        
        if (this.guiVisible) {
            gui.classList.add('show');
        } else {
            gui.classList.remove('show');
        }
    }

    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    toggleFeature(featureName, enabled) {
        this.features[featureName] = enabled;
        this.updateUI();
        this.sendToMinecraft('feature', { name: featureName, enabled: enabled });
        
        // Show notification
        this.showNotification(`${featureName} ${enabled ? 'enabled' : 'disabled'}`);
    }

    connectToMinecraft() {
        const port = this.settings.websocketPort;
        const wsUrl = `ws://localhost:${port}`;
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                this.isConnected = true;
                this.updateConnectionStatus(true);
                this.showNotification('Connected to Minecraft!');
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMinecraftMessage(data);
            };
            
            this.ws.onclose = () => {
                this.isConnected = false;
                this.updateConnectionStatus(false);
                this.showNotification('Disconnected from Minecraft');
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.showNotification('Failed to connect to Minecraft');
            };
        } catch (error) {
            console.error('Connection error:', error);
            this.showNotification('Connection failed');
        }
    }

    sendToMinecraft(type, data) {
        if (this.isConnected && this.ws) {
            const message = {
                type: type,
                data: data,
                timestamp: Date.now()
            };
            this.ws.send(JSON.stringify(message));
        }
    }

    handleMinecraftMessage(data) {
        switch(data.type) {
            case 'fps':
                this.fps = data.fps;
                this.ping = data.ping || 0;
                this.memory = data.memory || 0;
                this.updateFPSDisplay();
                break;
            case 'feature_status':
                this.features[data.name] = data.enabled;
                this.updateUI();
                break;
            case 'player_data':
                // Handle player position, health, etc.
                break;
        }
    }

    updateConnectionStatus(connected) {
        const indicator = document.getElementById('connection-indicator');
        const text = document.getElementById('connection-text');
        
        if (connected) {
            indicator.className = 'status-indicator status-connected';
            text.textContent = 'Connected';
        } else {
            indicator.className = 'status-indicator status-disconnected';
            text.textContent = 'Disconnected';
        }
    }

    updateUI() {
        // Update all toggle switches based on current feature states
        Object.keys(this.features).forEach(feature => {
            const element = document.getElementById(feature.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (element) {
                element.checked = this.features[feature];
            }
        });
    }

    startFPSMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const updateFPS = () => {
            const currentTime = performance.now();
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                this.fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.fpsHistory.push(this.fps);
                
                // Keep only last 60 frames
                if (this.fpsHistory.length > 60) {
                    this.fpsHistory.shift();
                }
                
                this.updateFPSDisplay();
                
                // Send FPS data to Minecraft if connected
                if (this.isConnected) {
                    this.sendToMinecraft('fps_data', { 
                        fps: this.fps, 
                        ping: this.ping, 
                        memory: this.memory 
                    });
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        updateFPS();
    }

    updateFPSDisplay() {
        document.getElementById('fps-value').textContent = this.fps;
        document.getElementById('ping-value').textContent = `${this.ping}ms`;
        document.getElementById('memory-value').textContent = `${this.memory}MB`;
        document.getElementById('cps-value').textContent = this.cps;
        
        // Color code FPS
        const fpsElement = document.getElementById('fps-value');
        if (this.fps >= 60) {
            fpsElement.style.color = '#00ff88';
        } else if (this.fps >= 30) {
            fpsElement.style.color = '#ffaa00';
        } else {
            fpsElement.style.color = '#ff4444';
        }
    }

    applyTheme(theme) {
        const body = document.body;
        body.className = `theme-${theme}`;
        this.sendToMinecraft('settings', { theme: theme });
    }

    updateFPSPosition(position) {
        const fpsOverlay = document.getElementById('fps-overlay');
        fpsOverlay.className = `fps-overlay fps-${position}`;
        this.sendToMinecraft('settings', { fpsPosition: position });
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1003;
            font-size: 14px;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the Minecraft Client when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.minecraftClient = new MinecraftClient();
});

// Handle page visibility change to pause/resume FPS monitoring
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause some operations
    } else {
        // Page is visible, resume operations
    }
});