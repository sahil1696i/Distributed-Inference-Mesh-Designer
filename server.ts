import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Initialize Gemini SDK with recommended user-agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // Simulate end-to-end multi-VM RPC inference call
  app.post("/api/simulate", async (req, res) => {
    const { messages = [], provider = "aws", instanceType = "", modelChoice = "gemma-3-270m" } = req.body;

    const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content || "Hello";

    try {
      // 1. Fetch real intelligence response from Gemini (simulating our small model Gemma-3-270m)
      const prompt = `You are a simulated Gemma-3-270m SLM (small language model) running in a private VPC subnet. 
Give a concise response to the user query below. Keep your reply brief, highly technical but conversational, matching what a small, extremely efficient model would output.
User Query: "${lastUserMessage}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      });

      const generatedText = response.text || "I apologize, model generation failed.";

      // 2. Build beautiful step-by-step RPC simulation hops
      const isAws = provider === "aws";
      const publicIp = isAws ? "54.198.81.42" : "34.120.45.99";
      const gatewayInternalIp = isAws ? "10.0.1.10" : "10.128.0.10";
      const workerInternalIp = isAws ? "10.0.2.25" : "10.128.1.25";
      const firewallName = isAws ? "Security Group (sg-caller-allow-rpc)" : "VPC Firewall (allow-rpc-from-gateway)";

      const now = new Date();
      const formatTime = (offsetMs: number) => {
        const d = new Date(now.getTime() + offsetMs);
        return d.toISOString().split("T")[1].slice(0, -1);
      };

      const hops = [
        {
          id: "hop-1",
          name: "API Gateway (VPC Public Subnet)",
          action: "Ingress HTTP Connection Received",
          detail: `HTTP POST /v1/chat/completions route triggered on Gateway VM (${publicIp}) from client's public internet entry point. Payload: OpenAI-compatible JSON representation with ${messages.length} messages.`,
          timestamp: formatTime(0),
          ip: publicIp,
          status: "success",
        },
        {
          id: "hop-2",
          name: "TypeScript caller-worker",
          action: "Handled Request & Invoked Private RPC Client",
          detail: `The TypeScript worker (listening on port 3000) parses the request, wraps the payload in an 'iii' framework RPC envelope, and identifies the target RPC worker address: ${workerInternalIp}:4000.`,
          timestamp: formatTime(5),
          ip: gatewayInternalIp,
          status: "success",
        },
        {
          id: "hop-3",
          name: `${provider.toUpperCase()} Subnet Router / Firewall`,
          action: "VPC Transit Route & Rule Enforcement",
          detail: `Evaluating inbound/outbound packets against VPC rule: ALLOW TCP 4000. Verified that source IP is within gateway subnet (${gatewayInternalIp}) and destination belongs to private subnet (${workerInternalIp}). Connection authorized.`,
          timestamp: formatTime(8),
          ip: isAws ? "VPC Route Table" : "VPC Firewall Engine",
          status: "success",
        },
        {
          id: "hop-4",
          name: "Inference Worker (VPC Private Subnet)",
          action: "RPC Call Received on Port 4000",
          detail: `Python application 'inference-worker' utilizing the 'iii' peer-to-peer framework detects incoming TCP streaming container session. Function handler 'inference::run_inference' selected.`,
          timestamp: formatTime(12),
          ip: workerInternalIp,
          status: "success",
        },
        {
          id: "hop-5",
          name: "Inference Worker (VPC Private Subnet)",
          action: "SLM Token Generation Initiated",
          detail: `Loading local token embeddings for '${modelChoice}'. Applied ChatML conversation template. Context length: ${lastUserMessage.length + 80} tokens. Executing inference on CPU (${instanceType || "default"}).`,
          timestamp: formatTime(25),
          ip: workerInternalIp,
          status: "success",
        },
        {
          id: "hop-6",
          name: "Inference Worker (VPC Private Subnet)",
          action: "RPC Generation Completed & Replying",
          detail: `Generation completed successfully. Output response payload serialized. Returning string representation over TCP sockets back to route ${gatewayInternalIp}.`,
          timestamp: formatTime(180),
          ip: workerInternalIp,
          status: "success",
        },
        {
          id: "hop-7",
          name: "API Gateway (VPC Public Subnet)",
          action: "Fulfillment & Return JSON",
          detail: `Received RPC reply string. TypeScript worker formats response as an HTTP JSON compliance payload and sends it down standard output. Network roundtrip: ~195ms.`,
          timestamp: formatTime(192),
          ip: publicIp,
          status: "success",
        },
      ];

      res.json({
        success: true,
        result: generatedText,
        metadata: {
          roundtripMs: 195,
          rawModel: modelChoice,
          evaluatedInstance: instanceType,
          provider,
        },
        hops,
      });
    } catch (error: any) {
      console.error("Simulation error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to execute simulation.",
      });
    }
  });

  // Setup Vite development middleware OR static static folders for deployment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
