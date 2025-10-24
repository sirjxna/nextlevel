package com.minecraftclient;

import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.common.event.FMLInitializationEvent;
import net.minecraftforge.fml.common.event.FMLPreInitializationEvent;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;
import net.minecraftforge.fml.common.gameevent.TickEvent;
import net.minecraftforge.fml.common.gameevent.InputEvent;
import net.minecraft.client.Minecraft;
import net.minecraft.client.settings.KeyBinding;
import net.minecraftforge.client.settings.KeyConflictContext;
import net.minecraftforge.fml.client.registry.ClientRegistry;
import org.lwjgl.input.Keyboard;
import org.lwjgl.opengl.Display;
import net.minecraftforge.event.entity.living.LivingEvent;
import net.minecraft.entity.player.EntityPlayer;
import net.minecraft.util.text.TextComponentString;
import net.minecraft.util.text.TextFormatting;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Mod(modid = WebGUIMod.MODID, version = WebGUIMod.VERSION, name = WebGUIMod.NAME)
public class WebGUIMod {
    public static final String MODID = "webguimod";
    public static final String VERSION = "1.0";
    public static final String NAME = "Minecraft WebGUI Client";

    private WebSocketServer webSocketServer;
    private KeyBinding toggleSprintKey;
    private KeyBinding toggleFlyKey;
    private KeyBinding toggleGUIKey;
    
    // Feature states
    private AtomicBoolean toggleSprint = new AtomicBoolean(false);
    private AtomicBoolean autoWalk = new AtomicBoolean(false);
    private AtomicBoolean autoJump = new AtomicBoolean(false);
    private AtomicBoolean flyMode = new AtomicBoolean(false);
    private AtomicBoolean fullbright = new AtomicBoolean(false);
    private AtomicBoolean xray = new AtomicBoolean(false);
    private AtomicBoolean esp = new AtomicBoolean(false);
    private AtomicBoolean noRender = new AtomicBoolean(false);
    private AtomicBoolean autoClicker = new AtomicBoolean(false);
    private AtomicBoolean autoBlock = new AtomicBoolean(false);
    private AtomicBoolean autoEat = new AtomicBoolean(false);
    private AtomicBoolean autoPotion = new AtomicBoolean(false);
    
    // Settings
    private AtomicInteger cps = new AtomicInteger(10);
    private AtomicInteger updateRate = new AtomicInteger(60);
    
    // Performance monitoring
    private AtomicInteger fps = new AtomicInteger(0);
    private AtomicInteger ping = new AtomicInteger(0);
    private AtomicLong memory = new AtomicLong(0);
    
    // Auto-clicker
    private long lastClickTime = 0;
    private int clickDelay;

    @Mod.EventHandler
    public void preInit(FMLPreInitializationEvent event) {
        // Register key bindings
        toggleSprintKey = new KeyBinding("Toggle Sprint", KeyConflictContext.IN_GAME, Keyboard.KEY_F2, "WebGUI Client");
        toggleFlyKey = new KeyBinding("Toggle Fly", KeyConflictContext.IN_GAME, Keyboard.KEY_F3, "WebGUI Client");
        toggleGUIKey = new KeyBinding("Toggle GUI", KeyConflictContext.IN_GAME, Keyboard.KEY_F1, "WebGUI Client");
        
        ClientRegistry.registerKeyBinding(toggleSprintKey);
        ClientRegistry.registerKeyBinding(toggleFlyKey);
        ClientRegistry.registerKeyBinding(toggleGUIKey);
    }

    @Mod.EventHandler
    public void init(FMLInitializationEvent event) {
        MinecraftForge.EVENT_BUS.register(this);
        
        // Start WebSocket server
        try {
            webSocketServer = new WebSocketServer(8080);
            webSocketServer.start();
            Minecraft.getMinecraft().player.sendMessage(new TextComponentString(TextFormatting.GREEN + "WebGUI Client started! Open http://localhost:8080/minecraft-client.html"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        // Calculate click delay
        updateClickDelay();
    }

    @SubscribeEvent
    public void onClientTick(TickEvent.ClientTickEvent event) {
        if (event.phase == TickEvent.Phase.END) {
            updatePerformance();
            handleAutoClicker();
            handleAutoWalk();
            handleAutoJump();
            handleToggleSprint();
            handleFlyMode();
        }
    }

    @SubscribeEvent
    public void onKeyInput(InputEvent.KeyInputEvent event) {
        if (toggleSprintKey.isPressed()) {
            toggleSprint.set(!toggleSprint.get());
            sendFeatureUpdate("toggleSprint", toggleSprint.get());
        }
        
        if (toggleFlyKey.isPressed()) {
            flyMode.set(!flyMode.get());
            sendFeatureUpdate("flyMode", flyMode.get());
        }
        
        if (toggleGUIKey.isPressed()) {
            // This would open the web GUI, but since it's a web interface,
            // we just send a message
            Minecraft.getMinecraft().player.sendMessage(new TextComponentString(TextFormatting.YELLOW + "Press F1 in your browser to open the WebGUI!"));
        }
    }

    private void updatePerformance() {
        // Update FPS
        fps.set(Minecraft.getDebugFPS());
        
        // Update memory usage
        Runtime runtime = Runtime.getRuntime();
        long usedMemory = (runtime.totalMemory() - runtime.freeMemory()) / 1024 / 1024;
        memory.set(usedMemory);
        
        // Update ping (simplified)
        if (Minecraft.getMinecraft().getConnection() != null) {
            ping.set(Minecraft.getMinecraft().getConnection().getPlayerInfo(Minecraft.getMinecraft().player.getUniqueID()).getResponseTime());
        }
        
        // Send performance data to WebSocket clients
        if (webSocketServer != null) {
            webSocketServer.broadcastPerformance(fps.get(), ping.get(), memory.get());
        }
    }

    private void handleAutoClicker() {
        if (autoClicker.get() && Minecraft.getMinecraft().gameSettings.keyBindAttack.isKeyDown()) {
            long currentTime = System.currentTimeMillis();
            if (currentTime - lastClickTime >= clickDelay) {
                // Simulate click
                Minecraft.getMinecraft().clickMouse();
                lastClickTime = currentTime;
            }
        }
    }

    private void handleAutoWalk() {
        if (autoWalk.get()) {
            Minecraft.getMinecraft().gameSettings.keyBindForward.setKeyBindState(Minecraft.getMinecraft().gameSettings.keyBindForward.getKeyCode(), true);
        }
    }

    private void handleAutoJump() {
        if (autoJump.get() && Minecraft.getMinecraft().player.onGround) {
            Minecraft.getMinecraft().player.jump();
        }
    }

    private void handleToggleSprint() {
        if (toggleSprint.get()) {
            Minecraft.getMinecraft().gameSettings.keyBindSprint.setKeyBindState(Minecraft.getMinecraft().gameSettings.keyBindSprint.getKeyCode(), true);
        }
    }

    private void handleFlyMode() {
        if (flyMode.get() && Minecraft.getMinecraft().player.capabilities.isCreativeMode) {
            Minecraft.getMinecraft().player.capabilities.allowFlying = true;
            Minecraft.getMinecraft().player.capabilities.isFlying = true;
        }
    }

    private void updateClickDelay() {
        clickDelay = 1000 / cps.get();
    }

    private void sendFeatureUpdate(String feature, boolean enabled) {
        if (webSocketServer != null) {
            webSocketServer.broadcastFeatureUpdate(feature, enabled);
        }
    }

    public void updateFeature(String feature, boolean enabled) {
        switch (feature) {
            case "toggleSprint":
                toggleSprint.set(enabled);
                break;
            case "autoWalk":
                autoWalk.set(enabled);
                break;
            case "autoJump":
                autoJump.set(enabled);
                break;
            case "flyMode":
                flyMode.set(enabled);
                break;
            case "fullbright":
                fullbright.set(enabled);
                break;
            case "xray":
                xray.set(enabled);
                break;
            case "esp":
                esp.set(enabled);
                break;
            case "noRender":
                noRender.set(enabled);
                break;
            case "autoClicker":
                autoClicker.set(enabled);
                break;
            case "autoBlock":
                autoBlock.set(enabled);
                break;
            case "autoEat":
                autoEat.set(enabled);
                break;
            case "autoPotion":
                autoPotion.set(enabled);
                break;
        }
    }

    public void updateSettings(String setting, Object value) {
        switch (setting) {
            case "cps":
                cps.set((Integer) value);
                updateClickDelay();
                break;
            case "updateRate":
                updateRate.set((Integer) value);
                break;
        }
    }

    // Getters for current states
    public boolean isFeatureEnabled(String feature) {
        switch (feature) {
            case "toggleSprint": return toggleSprint.get();
            case "autoWalk": return autoWalk.get();
            case "autoJump": return autoJump.get();
            case "flyMode": return flyMode.get();
            case "fullbright": return fullbright.get();
            case "xray": return xray.get();
            case "esp": return esp.get();
            case "noRender": return noRender.get();
            case "autoClicker": return autoClicker.get();
            case "autoBlock": return autoBlock.get();
            case "autoEat": return autoEat.get();
            case "autoPotion": return autoPotion.get();
            default: return false;
        }
    }
}