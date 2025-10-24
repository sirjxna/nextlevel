package com.minecraftclient;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import net.minecraft.client.Minecraft;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class WebSocketServer {
    private ServerSocket serverSocket;
    private List<ClientHandler> clients;
    private ExecutorService executor;
    private Gson gson;
    private WebGUIMod mod;
    private boolean running;

    public WebSocketServer(int port) throws IOException {
        this.serverSocket = new ServerSocket(port);
        this.clients = new ArrayList<>();
        this.executor = Executors.newCachedThreadPool();
        this.gson = new Gson();
        this.running = true;
    }

    public void start() {
        executor.submit(() -> {
            try {
                while (running) {
                    Socket clientSocket = serverSocket.accept();
                    ClientHandler clientHandler = new ClientHandler(clientSocket, this);
                    clients.add(clientHandler);
                    executor.submit(clientHandler);
                }
            } catch (IOException e) {
                if (running) {
                    e.printStackTrace();
                }
            }
        });
    }

    public void stop() {
        running = false;
        try {
            serverSocket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        executor.shutdown();
    }

    public void setMod(WebGUIMod mod) {
        this.mod = mod;
    }

    public void broadcastPerformance(int fps, int ping, long memory) {
        JsonObject message = new JsonObject();
        message.addProperty("type", "fps");
        message.addProperty("fps", fps);
        message.addProperty("ping", ping);
        message.addProperty("memory", memory);
        message.addProperty("timestamp", System.currentTimeMillis());
        
        broadcast(message.toString());
    }

    public void broadcastFeatureUpdate(String feature, boolean enabled) {
        JsonObject message = new JsonObject();
        message.addProperty("type", "feature_status");
        message.addProperty("name", feature);
        message.addProperty("enabled", enabled);
        message.addProperty("timestamp", System.currentTimeMillis());
        
        broadcast(message.toString());
    }

    public void broadcast(String message) {
        List<ClientHandler> clientsToRemove = new ArrayList<>();
        
        for (ClientHandler client : clients) {
            try {
                client.sendMessage(message);
            } catch (IOException e) {
                clientsToRemove.add(client);
            }
        }
        
        clients.removeAll(clientsToRemove);
    }

    public void handleMessage(String message, ClientHandler client) {
        try {
            JsonObject json = gson.fromJson(message, JsonObject.class);
            String type = json.get("type").getAsString();
            
            switch (type) {
                case "feature":
                    String feature = json.getAsJsonObject("data").get("name").getAsString();
                    boolean enabled = json.getAsJsonObject("data").get("enabled").getAsBoolean();
                    if (mod != null) {
                        mod.updateFeature(feature, enabled);
                    }
                    break;
                    
                case "settings":
                    String setting = json.getAsJsonObject("data").keySet().iterator().next();
                    Object value = json.getAsJsonObject("data").get(setting).getAsString();
                    if (mod != null) {
                        if (setting.equals("cps") || setting.equals("updateRate")) {
                            mod.updateSettings(setting, Integer.parseInt(value.toString()));
                        }
                    }
                    break;
                    
                case "fps_data":
                    // Handle FPS data from client if needed
                    break;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void removeClient(ClientHandler client) {
        clients.remove(client);
    }

    private class ClientHandler implements Runnable {
        private Socket socket;
        private PrintWriter out;
        private BufferedReader in;
        private WebSocketServer server;

        public ClientHandler(Socket socket, WebSocketServer server) {
            this.socket = socket;
            this.server = server;
        }

        @Override
        public void run() {
            try {
                out = new PrintWriter(socket.getOutputStream(), true);
                in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                
                // Send initial feature states
                sendInitialStates();
                
                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    server.handleMessage(inputLine, this);
                }
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                try {
                    socket.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                server.removeClient(this);
            }
        }

        public void sendMessage(String message) throws IOException {
            if (out != null) {
                out.println(message);
            }
        }

        private void sendInitialStates() {
            if (mod != null) {
                // Send all current feature states
                String[] features = {"toggleSprint", "autoWalk", "autoJump", "flyMode", 
                                   "fullbright", "xray", "esp", "noRender", 
                                   "autoClicker", "autoBlock", "autoEat", "autoPotion"};
                
                for (String feature : features) {
                    JsonObject message = new JsonObject();
                    message.addProperty("type", "feature_status");
                    message.addProperty("name", feature);
                    message.addProperty("enabled", mod.isFeatureEnabled(feature));
                    message.addProperty("timestamp", System.currentTimeMillis());
                    
                    try {
                        sendMessage(message.toString());
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }
}