import { useState, useMemo, useEffect, useRef } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import JSZip from "jszip";
import { 
  Server, 
  Shield, 
  Network, 
  ArrowRight, 
  CheckCircle, 
  Copy, 
  Download, 
  RefreshCw, 
  Sliders, 
  Code, 
  FileText, 
  Mail, 
  ArrowUpRight, 
  Lock, 
  Settings, 
  Terminal, 
  Info, 
  ExternalLink, 
  Cpu, 
  Layers, 
  Wifi, 
  User, 
  MailCheck, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { getCodeFiles, getReadmeFile } from "./data/templates";
import { UserConfig, CodeFile, RPCHop } from "./types";

export default function App() {
  // 1. Initial State for User Configuration
  const [userConfig, setUserConfig] = useState<UserConfig>({
    name: "Alex Dev",
    email: "alex@getalchemystai.com",
    provider: "aws",
    awsRegion: "us-east-1",
    gcpRegion: "us-central1",
    cidrBlock: "10.0.0.0/16",
    instanceTypeAwsGateway: "t3.micro",
    instanceTypeAwsWorker: "t3.medium",
    instanceTypeGcpGateway: "e2-medium",
    instanceTypeGcpWorker: "e2-medium",
    sshPublicKey: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC4H8hS9S... devops-key"
  });

  // 2. Tab States
  const [activeMainTab, setActiveMainTab] = useState<"visualizer" | "codebase" | "submission-prep">("visualizer");
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // 3. Simulator Simulation State
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(-1);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [promptInput, setPromptInput] = useState<string>("Simplify the definition of a Remote Procedure Call (RPC) compared to REST.");
  
  // 4. Checklist checklist State
  const [completedSteps, setCompletedSteps] = useState({
    subnets: true,
    isolation: true,
    transit: true,
    reproducible: true,
    writeup: false,
    submission: false
  });

  // Dynamic codebooks compilation
  const codeFiles = useMemo(() => {
    return getCodeFiles(userConfig);
  }, [userConfig]);

  const readmeFile = useMemo(() => {
    return getReadmeFile(userConfig);
  }, [userConfig]);

  const allFiles = useMemo(() => {
    return [readmeFile, ...codeFiles];
  }, [readmeFile, codeFiles]);

  // Current selected code rendering
  const activeFile = allFiles[selectedFileIndex] || allFiles[0];

  // Copy helper
  const handleCopyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(label);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  // ZIP compiler helper
  const [zipping, setZipping] = useState<boolean>(false);
  const [zipSuccess, setZipSuccess] = useState<boolean>(false);

  const handleDownloadZip = async () => {
    setZipping(true);
    setZipSuccess(false);
    try {
      const zip = new JSZip();
      
      // Organize inside appropriate folders inside zip
      allFiles.forEach(file => {
        zip.file(file.path, file.content);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `alchemyst-devops-${userConfig.provider}-solution.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 4000);
    } catch (e) {
      console.error(e);
      alert("Failed to build assignment ZIP. Please copy content manually.");
    } finally {
      setZipping(false);
    }
  };

  // Run Server RPC Simulation Router
  const runSimulation = async () => {
    if (simulating) return;
    setSimulating(true);
    setSimulationStep(0);
    setSimulationLogs(["[CLIENT IP] Dispatchinging API packet payload..."]);
    setSimulationResult(null);

    // Custom animation simulation interval
    const stepCount = 7;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < stepCount) {
        setSimulationStep(currentStep);
        // Fill logs
        if (currentStep === 1) setSimulationLogs(prev => [...prev, `[GATEWAY] Received JSON payload over port 3000.`]);
        if (currentStep === 2) setSimulationLogs(prev => [...prev, `[ROUTE] Forwarding TCP packets internally to worker.`]);
        if (currentStep === 3) setSimulationLogs(prev => [...prev, `[FIREWALL] Checking ingress limits... OK (sourcing from Gateway)`]);
        if (currentStep === 4) setSimulationLogs(prev => [...prev, `[WORKER] RPC call matched inference::run_inference.`]);
        if (currentStep === 5) setSimulationLogs(prev => [...prev, `[WORKER] Processing via CPU... token streaming active...`]);
        if (currentStep === 6) setSimulationLogs(prev => [...prev, `[GATEWAY] RPC finished successfully! Returning OpenAI body...`]);
      } else {
        clearInterval(interval);
      }
    }, 1200);

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: promptInput }],
          provider: userConfig.provider,
          instanceType: userConfig.provider === "aws" ? userConfig.instanceTypeAwsWorker : userConfig.instanceTypeGcpWorker,
          modelChoice: "gemma-3-270m"
        })
      });

      const data = await response.json();
      
      // Ensure visual finishing matches API return
      setTimeout(() => {
        clearInterval(interval);
        setSimulationStep(6);
        setSimulationResult(data);
        setSimulationLogs(prev => [
          ...prev, 
          `[SUCCESS] 200 OK. Dynamic inference output compiled. Roundtrip 195ms.`
        ]);
        setSimulating(false);
      }, 7300);

    } catch (err) {
      clearInterval(interval);
      setSimulating(false);
      setSimulationLogs(prev => [...prev, `[FATAL] Connection broke or failed to reach VPC nodes.`]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased">
      {/* 1. Sophisticated Workspace Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 text-white rounded-lg shadow-sm">
                <Network className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Alchemyst DevOps Playground</h1>
                <p className="text-xs text-zinc-500 font-mono">VPC RPC Subnet Simulator & Codebase Exporter</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-mono rounded-md border border-amber-200">
                <Calendar className="h-3 w-3" />
                <span>Deadline: May 23, 2026 (Active)</span>
              </div>
              <button 
                onClick={handleDownloadZip}
                disabled={zipping}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition shadow-sm active:scale-95 disabled:opacity-50"
              >
                {zipping ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : zipSuccess ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{zipSuccess ? "Bundle Exported!" : "Download Solution ZIP"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Master Navigation & Setup Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* LEFT RAIL: Interactive Setup & Parameters */}
          <section className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-zinc-100">
                <Sliders className="h-4 w-4 text-zinc-500" />
                <h2 className="font-semibold text-sm tracking-tight text-zinc-700">Assignment Profile</h2>
              </div>

              {/* Developer Credentials for auto compiling email/readme */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 font-mono mb-1">CANDIDATE NAME</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input 
                      type="text" 
                      value={userConfig.name}
                      onChange={(e) => setUserConfig(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded-lg pl-8 pr-3 py-2 text-zinc-800 focus:outline-none focus:border-zinc-400 focus:bg-white transition"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 font-mono mb-1">SUBMISSION EMAIL</label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input 
                      type="email" 
                      value={userConfig.email}
                      onChange={(e) => setUserConfig(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded-lg pl-8 pr-3 py-2 text-zinc-800 focus:outline-none focus:border-zinc-400 focus:bg-white transition"
                      placeholder="e.g. jdoe@gmail.com"
                    />
                  </div>
                </div>

                {/* Cloud Provider Select */}
                <div>
                  <label className="block text-xs font-medium text-zinc-500 font-mono mb-1.5">CLOUD PLATFORM IaC</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setUserConfig(prev => ({ ...prev, provider: "aws" }))}
                      className={`py-2 text-xs font-medium rounded-lg border transition ${userConfig.provider === "aws" ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-600"}`}
                    >
                      Amazon AWS
                    </button>
                    <button
                      onClick={() => setUserConfig(prev => ({ ...prev, provider: "gcp" }))}
                      className={`py-2 text-xs font-medium rounded-lg border transition ${userConfig.provider === "gcp" ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-600"}`}
                    >
                      Google Cloud
                    </button>
                  </div>
                </div>

                {/* Specific configs depending on AWS/GCP */}
                {userConfig.provider === "aws" ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 font-mono mb-1">AWS REGION</label>
                      <select
                        value={userConfig.awsRegion}
                        onChange={(e) => setUserConfig(prev => ({ ...prev, awsRegion: e.target.value }))}
                        className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded-lg px-3 py-2 text-zinc-800 focus:outline-none focus:border-zinc-400 focus:bg-white cursor-pointer"
                      >
                        <option value="us-east-1">us-east-1 (N. Virginia)</option>
                        <option value="us-west-2">us-west-2 (Oregon)</option>
                        <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
                        <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 font-mono mb-1 text-[10px]">GATEWAY VM</label>
                        <select
                          value={userConfig.instanceTypeAwsGateway}
                          onChange={(e) => setUserConfig(prev => ({ ...prev, instanceTypeAwsGateway: e.target.value }))}
                          className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded-lg px-2 py-1 text-zinc-800 focus:outline-none focus:border-zinc-400 focus:bg-white"
                        >
                          <option value="t3.micro">t3.micro (Free Tier)</option>
                          <option value="t3.small">t3.small</option>
                          <option value="t3.medium">t3.medium</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 font-mono mb-1 text-[10px]">INFERENCE CPU</label>
                        <select
                          value={userConfig.instanceTypeAwsWorker}
                          onChange={(e) => setUserConfig(prev => ({ ...prev, instanceTypeAwsWorker: e.target.value }))}
                          className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded-lg px-2 py-1 text-zinc-800 focus:outline-none focus:border-zinc-400 focus:bg-white"
                        >
                          <option value="t3.medium">t3.medium (Cheap)</option>
                          <option value="t3.xlarge">t3.xlarge (4 Cores)</option>
                          <option value="c6i.xlarge">c6i.xlarge (Compute)</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 font-mono mb-1">GCP REGION</label>
                      <select
                        value={userConfig.gcpRegion}
                        onChange={(e) => setUserConfig(prev => ({ ...prev, gcpRegion: e.target.value }))}
                        className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded-lg px-3 py-2 text-zinc-800 focus:outline-none focus:border-zinc-400 focus:bg-white cursor-pointer"
                      >
                        <option value="us-central1">us-central1 (Iowa)</option>
                        <option value="us-east4">us-east4 (Virginia)</option>
                        <option value="europe-west3">europe-west3 (Frankfurt)</option>
                        <option value="asia-south1">asia-south1 (Mumbai)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 font-mono mb-1 text-[10px]">GATEWAY VM</label>
                        <select
                          value={userConfig.instanceTypeGcpGateway}
                          onChange={(e) => setUserConfig(prev => ({ ...prev, instanceTypeGcpGateway: e.target.value }))}
                          className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded-lg px-2 py-1 text-zinc-800 focus:outline-none focus:border-zinc-400 focus:bg-white"
                        >
                          <option value="e2-micro">e2-micro (Free Tier)</option>
                          <option value="e2-medium">e2-medium</option>
                          <option value="n2-standard-2">n2-standard-2</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 font-mono mb-1 text-[10px]">INFERENCE CPU</label>
                        <select
                          value={userConfig.instanceTypeGcpWorker}
                          onChange={(e) => setUserConfig(prev => ({ ...prev, instanceTypeGcpWorker: e.target.value }))}
                          className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded-lg px-2 py-1 text-zinc-800 focus:outline-none focus:border-zinc-400 focus:bg-white"
                        >
                          <option value="e2-medium">e2-medium (Basic)</option>
                          <option value="e2-standard-4">e2-standard-4 (4 vCPU)</option>
                          <option value="n2-standard-4">n2-standard-4 (Intel Xeon)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-500 font-mono mb-1">VPC CIDR RANGE</label>
                  <input 
                    type="text" 
                    value={userConfig.cidrBlock}
                    onChange={(e) => setUserConfig(prev => ({ ...prev, cidrBlock: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded-lg px-3 py-2 text-zinc-800 focus:outline-none focus:border-zinc-400 focus:bg-white font-mono"
                    placeholder="e.g. 10.0.0.0/16"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 font-mono mb-1">SSH PUBLIC KEY</label>
                  <textarea 
                    value={userConfig.sshPublicKey}
                    onChange={(e) => setUserConfig(prev => ({ ...prev, sshPublicKey: e.target.value }))}
                    rows={2}
                    className="w-full bg-zinc-50 border border-zinc-200 text-[10px] rounded-lg px-3 py-2 text-zinc-600 focus:outline-none focus:border-zinc-400 focus:bg-white font-mono leading-normal resize-none"
                    placeholder="ssh-rsa ..."
                  />
                </div>
              </div>
            </div>

            {/* Quick Helper Tips Panel */}
            <div className="bg-zinc-900 text-zinc-100 rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-amber-400" />
                <h3 className="font-semibold text-xs tracking-wider text-zinc-100 uppercase font-mono">Assignment Matrix</h3>
              </div>
              <ul className="space-y-2 text-xs text-zinc-400 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Correctness:</strong> Client hits Port 3000 {"->"} Gateways route internal RPC commands on Port 4000 to backend.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Network Hygiene:</strong> Private VM has No Public IP/DNS records and accepts zero internet access.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* MAIN COLUMN RIGHT: Interactive Tabs and Visualization Canvas */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Tab navigation headers */}
            <div className="flex border-b border-zinc-200 gap-1 overflow-x-auto">
              <button 
                onClick={() => setActiveMainTab("visualizer")}
                className={`py-3 px-4 font-medium text-sm border-b-2 flex items-center gap-2 transition whitespace-nowrap ${activeMainTab === "visualizer" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}
              >
                <Network className="h-4 w-4" />
                <span>Private Mesh Visualizer & Sandbox</span>
              </button>
              <button 
                onClick={() => setActiveMainTab("codebase")}
                className={`py-3 px-4 font-medium text-sm border-b-2 flex items-center gap-2 transition whitespace-nowrap ${activeMainTab === "codebase" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}
              >
                <Code className="h-4 w-4" />
                <span>Codebase & IaC Explorer</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-zinc-100 border border-zinc-200 rounded-full font-mono text-zinc-700">{allFiles.length} files</span>
              </button>
              <button 
                onClick={() => setActiveMainTab("submission-prep")}
                className={`py-3 px-4 font-medium text-sm border-b-2 flex items-center gap-2 transition whitespace-nowrap ${activeMainTab === "submission-prep" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}
              >
                <MailCheck className="h-4 w-4" />
                <span>CC Email & Hardening Check-up</span>
              </button>
            </div>

            {/* Content blocks */}
            <AnimatePresence mode="wait">
              {activeMainTab === "visualizer" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  
                  {/* Visualizer network canvas */}
                  <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                    
                    {/* Header bar */}
                    <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping" />
                        <span className="font-mono text-xs font-semibold text-zinc-700">LIVE VPC EMULATION</span>
                      </div>
                      <div className="text-zinc-400 text-xs font-mono">
                        VPC Target: <span className="text-zinc-700 font-semibold">{userConfig.cidrBlock}</span> ({userConfig.provider.toUpperCase()})
                      </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="relative bg-[#fafafa] h-96 p-6 flex items-center justify-around overflow-hidden select-none border-b border-zinc-200">
                      
                      {/* Subnet overlay outlines */}
                      {/* 1. Public Subnet */}
                      <div className="absolute top-8 bottom-8 left-4 w-[43%] border-2 border-dashed border-zinc-300 bg-zinc-50/50 rounded-2xl flex flex-col justify-between p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold tracking-tight text-zinc-400 bg-white px-2 py-0.5 rounded-md border border-zinc-200">
                            {userConfig.provider === "aws" ? "subnet-public-1a" : "alchemyst-subnet (public zone)"}
                          </span>
                          <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1 rounded">ingress allowed</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono text-center">
                          CIDR: {userConfig.provider === "aws" ? "10.0.1.0/24" : "10.128.0.0/24"}
                        </div>
                      </div>

                      {/* 2. Boundary Firewall Guard banner */}
                      <div className="absolute top-1/2 -translate-y-1/2 left-[44%] bottom-1/2 h-44 w-12 border-y border-zinc-200 bg-zinc-100 flex flex-col items-center justify-center gap-1 rounded-lg shadow-2xs">
                        <Shield className="h-5 w-5 text-red-500" />
                        <span className="text-[9px] font-mono uppercase tracking-wider text-red-700 font-bold rotate-90 my-2">FIREWALL</span>
                      </div>

                      {/* 3. Protected Private Subnet (Strict No Inbound) */}
                      <div className="absolute top-8 bottom-8 right-4 w-[43%] border-2 border-red-200 bg-red-50/10 rounded-2xl flex flex-col justify-between p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold tracking-tight text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                            {userConfig.provider === "aws" ? "subnet-private-1b" : "alchemyst-subnet (internal-only)"}
                          </span>
                          <span className="text-[9px] font-mono text-red-700 bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold shadow-2xs">
                            <Lock className="h-2.5 w-2.5" /> SECURE BLOCK
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono text-center">
                          CIDR: {userConfig.provider === "aws" ? "10.0.2.0/24" : "10.128.1.0/24"}
                        </div>
                      </div>

                      {/* Visual VM Nodes */}
                      {/* USER REQUEST HOST (Out of network) */}
                      <div className="absolute left-[3%] z-10 flex flex-col items-center">
                        <div className="p-3 bg-white border border-zinc-200 rounded-xl shadow-xs flex flex-col items-center hover:shadow-md transition">
                          <div className="p-1 px-2.5 bg-blue-50 border border-blue-200 rounded text-blue-700 text-[10px] font-bold font-mono">User Client</div>
                          <span className="text-[10px] font-mono text-zinc-400 mt-2">Public Web Request</span>
                        </div>
                      </div>

                      {/* PUBLIC VM API GATEWAY */}
                      <div className="absolute left-[20%] z-10 flex flex-col items-center">
                        <motion.div 
                          animate={{ 
                            borderColor: simulationStep === 1 || simulationStep === 2 ? "#10b981" : "#e4e4e7",
                            scale: simulationStep === 1 || simulationStep === 2 ? 1.05 : 1
                          }}
                          className="p-3.5 bg-white border-2 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center w-36 text-center"
                        >
                          <Server className="h-5 w-5 text-zinc-700 mb-1" />
                          <span className="font-semibold text-[11px] text-zinc-800">Ubuntu Gateway VM</span>
                          <span className="text-[9px] font-mono text-zinc-400 bg-zinc-100 px-1 mt-1 rounded">
                            {userConfig.provider === "aws" ? "54.198.81.42" : "34.120.45.99"}
                          </span>
                          <span className="text-[8px] font-mono text-amber-600 border border-amber-200 bg-amber-50 rounded px-1 mt-1 font-bold">
                            Node TypeScript (Port 3000)
                          </span>
                        </motion.div>
                      </div>

                      {/* PRIVATE VM INFERENCE WORKER */}
                      <div className="absolute right-[12%] z-10 flex flex-col items-center">
                        <motion.div 
                          animate={{ 
                            borderColor: simulationStep === 4 || simulationStep === 5 ? "#10b981" : "#fee2e2",
                            scale: simulationStep === 4 || simulationStep === 5 ? 1.05 : 1
                          }}
                          className="p-3.5 bg-white border-2 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center w-36 text-center"
                        >
                          <Cpu className="h-5 w-5 text-red-500 mb-1 animate-pulse" />
                          <span className="font-semibold text-[11px] text-zinc-800">Private inference-worker</span>
                          <span className="text-[9px] font-mono text-red-600 bg-red-50 px-1 mt-1 rounded font-bold">
                            {userConfig.provider === "aws" ? "10.0.2.25" : "10.128.1.25"}
                          </span>
                          <span className="text-[8px] font-mono text-red-700 border border-red-200 bg-red-50 rounded px-1.5 mt-1 font-bold">
                            Python SLM daemon (Port 4000)
                          </span>
                        </motion.div>
                      </div>

                      {/* Packet Animation */}
                      <AnimatePresence>
                        {simulating && (
                          <>
                            {simulationStep === 0 && (
                              <motion.div 
                                initial={{ x: -140, y: 0 }}
                                animate={{ x: -60, y: -5 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                                className="absolute w-3.5 h-3.5 bg-blue-500 rounded-full border border-white shadow-md z-40"
                              />
                            )}
                            {(simulationStep === 1 || simulationStep === 2) && (
                              <motion.div 
                                initial={{ x: -40, y: -5 }}
                                animate={{ x: 100, y: -5 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.2 }}
                                className="absolute w-3.5 h-3.5 bg-amber-500 rounded-full border border-white shadow-md z-40"
                              />
                            )}
                            {(simulationStep === 3 || simulationStep === 4) && (
                              <motion.div 
                                initial={{ x: 100, y: -5 }}
                                animate={{ x: 260, y: -5 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.2 }}
                                className="absolute w-3.5 h-3.5 bg-emerald-500 rounded-full border border-white shadow-md z-40"
                              />
                            )}
                            {simulationStep === 5 && (
                              <motion.div 
                                animate={{ scale: [1, 1.4, 1] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="absolute right-[22%] top-1/2 w-4 h-4 rounded-full bg-red-500 z-40 shadow-lg border border-white"
                              />
                            )}
                            {simulationStep === 6 && (
                              <motion.div 
                                initial={{ x: 260, y: -5 }}
                                animate={{ x: -140, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.4 }}
                                className="absolute w-3.5 h-3.5 bg-emerald-500 rounded-full border border-white shadow-md z-40"
                              />
                            )}
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Simulation Console Controls */}
                    <div className="p-5 bg-zinc-900 text-zinc-100 flex flex-col md:flex-row gap-4 items-center">
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-mono tracking-widest text-zinc-400 mb-1">PROMPT COMPLIANCE TESTER</label>
                        <input
                          type="text"
                          value={promptInput}
                          onChange={(e) => setPromptInput(e.target.value)}
                          placeholder="Ask anything..."
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
                        />
                      </div>
                      <button
                        onClick={runSimulation}
                        disabled={simulating || !promptInput}
                        className="w-full md:w-auto px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 font-medium text-xs font-mono rounded-lg transition shrink-0 active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                      >
                        {simulating ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Routing over Subnets...</span>
                          </>
                        ) : (
                          <>
                            <Wifi className="h-3.5 w-3.5" />
                            <span>Execute VPC Simulated RPC Query</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* HOP-BY-HOP ROUTING METRICS LOGS */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Visual logs */}
                    <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
                      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-200">
                        <Terminal className="h-4 w-4 text-zinc-700" />
                        <h3 className="font-semibold text-xs font-mono tracking-tight text-zinc-700 uppercase">Subnet Packet Routing Hop Log</h3>
                      </div>
                      
                      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {simulating === false && !simulationResult ? (
                          <div className="text-center py-10 text-zinc-400 text-xs font-mono flex flex-col items-center gap-2">
                            <Info className="h-6 w-6 text-zinc-300" />
                            <span>Initiate simulated RPC queries above to log internal hopping paths details.</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(simulationResult?.hops || []).slice(0, simulationStep + 1).map((hop: any, idx: number) => (
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={hop.id || idx}
                                className="flex gap-3 text-xs border-l-2 border-zinc-300 pl-3 leading-relaxed"
                              >
                                <div className="text-zinc-400 font-mono select-none w-16 shrink-0 mt-0.5">{hop.timestamp}</div>
                                <div className="flex-1 font-mono">
                                  <div className="flex items-center gap-2 font-bold text-zinc-800">
                                    <span>{hop.name}</span>
                                    <span className="text-[10px] font-normal text-zinc-400 bg-zinc-100 px-1 rounded">{hop.ip}</span>
                                  </div>
                                  <div className="text-zinc-600 font-sans mt-0.5"><strong className="text-emerald-700 text-[10px] font-mono mr-1">[{hop.action}]</strong> {hop.detail}</div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Final Output Result Box */}
                    <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl p-5 flex flex-col justify-between shadow-md">
                      <div>
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">JSON HTTP Completion Output</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-mono bg-zinc-800 border border-zinc-700 text-emerald-400 rounded">200 OK</span>
                        </div>

                        <div className="font-mono text-xs max-h-60 overflow-y-auto leading-relaxed text-zinc-300">
                          {simulationResult?.result ? (
                            <div className="space-y-3 font-sans">
                              <p className="text-zinc-100 text-sm leading-relaxed italic">"{simulationResult.result}"</p>
                              <div className="pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 space-y-1">
                                <div>Model Target: <span className="text-zinc-300">gemma-3-270m-it-q8</span></div>
                                <div>Private Routing: <span className="text-zinc-300">iii-rpc protocol</span></div>
                                <div>Host Instance: <span className="text-zinc-300">{userConfig.provider === "aws" ? userConfig.instanceTypeAwsWorker : userConfig.instanceTypeGcpWorker}</span></div>
                                <div>Roundtrip: <span className="text-zinc-300">195ms</span></div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-zinc-500 italic py-12 text-center text-xs">
                              Waiting for completion input serialization...
                            </div>
                          )}
                        </div>
                      </div>

                      {simulationResult?.result && (
                        <button 
                          onClick={() => handleCopyCode(JSON.stringify({
                            id: "chatcmpl-vnv2s7as2",
                            object: "chat.completion",
                            created: Math.floor(Date.now() / 1000),
                            model: "gemma-3-270m-it-q8",
                            choices: [{
                              index: 0,
                              message: {
                                role: "assistant",
                                content: simulationResult.result
                              },
                              finish_reason: "stop"
                            }],
                            usage: { prompt_tokens: -1, completion_tokens: 42, total_tokens: -1 }
                          }, null, 2), "json-payload")}
                          className="mt-4 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 font-mono"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>{copiedFile === "json-payload" ? "Copied JSON!" : "Copy Full Response Body"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                </motion.div>
              )}

              {activeMainTab === "codebase" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[500px]">
                    
                    {/* INNER LEFT: File Sidebar Navigation */}
                    <div className="lg:col-span-1 border-r border-zinc-200 bg-zinc-50 p-4 space-y-4">
                      <div className="text-[10px] font-mono tracking-widest text-zinc-400 font-bold mb-2">SOLUTION FILE INTEGRATION</div>
                      <div className="space-y-1.5">
                        {allFiles.map((file, idx) => (
                          <button
                            key={file.name}
                            onClick={() => setSelectedFileIndex(idx)}
                            className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition ${idx === selectedFileIndex ? "bg-white border-zinc-300 text-zinc-900 font-bold shadow-xs" : "border-transparent text-zinc-600 hover:bg-zinc-100"}`}
                          >
                            {file.language === "terraform" ? (
                              <Layers className="h-3.5 w-3.5 text-indigo-500 scale-95 shrink-0" />
                            ) : file.language === "python" ? (
                              <Cpu className="h-3.5 w-3.5 text-blue-500 scale-95 shrink-0" />
                            ) : file.language === "typescript" ? (
                              <Code className="h-3.5 w-3.5 text-yellow-600 scale-95 shrink-0" />
                            ) : file.language === "markdown" ? (
                              <FileText className="h-3.5 w-3.5 text-rose-500 scale-95 shrink-0" />
                            ) : (
                              <Settings className="h-3.5 w-3.5 text-green-600 scale-95 shrink-0" />
                            )}
                            <div className="truncate">
                              <div className="font-mono">{file.name}</div>
                              <div className="text-[9px] text-zinc-400 truncate tracking-tight">{file.path}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* INNER RIGHT: Code Viewer Center */}
                    <div className="lg:col-span-3 flex flex-col bg-zinc-900 border-none">
                      
                      {/* Code Metadata bar */}
                      <div className="bg-zinc-800 border-b border-zinc-700 px-5 py-3 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-white text-xs font-semibold font-mono">{activeFile.name}</span>
                          <span className="text-[10px] text-zinc-400">{activeFile.path}</span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(activeFile.content, activeFile.name)}
                          className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-650 text-xs font-semibold rounded text-white flex items-center gap-1 transition tracking-tight active:scale-95"
                        >
                          {copiedFile === activeFile.name ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* File Description Header */}
                      <div className="bg-zinc-850 px-5 py-3 border-b border-zinc-800 flex items-start gap-2.5">
                        <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-zinc-400 leading-normal">{activeFile.description}</p>
                      </div>

                      {/* Line numbered Code block */}
                      <div className="flex-1 p-5 overflow-auto max-h-[480px]">
                        <pre className="font-mono text-xs text-zinc-300 leading-relaxed font-normal whitespace-pre">
                          <code>{activeFile.content}</code>
                        </pre>
                      </div>

                    </div>

                  </div>
                </motion.div>
              )}

              {activeMainTab === "submission-prep" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  
                  {/* Grid layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* HARDENING CHECKLIST */}
                    <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                      <div>
                        <h3 className="font-semibold text-sm text-zinc-900 tracking-tight flex items-center gap-2">
                          <Shield className="h-4 w-4 text-zinc-700" />
                          <span>Writeup Criteria Validation</span>
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Review the DevOps evaluation items required for successful submission.</p>
                      </div>

                      <div className="space-y-2 border-t border-zinc-100 pt-4">
                        <div 
                          onClick={() => setCompletedSteps(prev => ({ ...prev, subnets: !prev.subnets }))}
                          className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="checkbox" 
                              checked={completedSteps.subnets} 
                              onChange={() => {}} // Controlled in onClick parent
                              className="rounded border-zinc-300 h-4 w-4 text-zinc-900 focus:ring-zinc-900" 
                            />
                            <div className="text-xs font-medium text-zinc-700">VPC Private Subnetting</div>
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1 rounded">Net Hygiene</span>
                        </div>

                        <div 
                          onClick={() => setCompletedSteps(prev => ({ ...prev, isolation: !prev.isolation }))}
                          className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="checkbox" 
                              checked={completedSteps.isolation} 
                              onChange={() => {}}
                              className="rounded border-zinc-300 h-4 w-4 text-zinc-900 focus:ring-zinc-900" 
                            />
                            <div className="text-xs font-medium text-zinc-700">Strict Subnet Isolation</div>
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-700 px-1 rounded">Security</span>
                        </div>

                        <div 
                          onClick={() => setCompletedSteps(prev => ({ ...prev, transit: !prev.transit }))}
                          className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="checkbox" 
                              checked={completedSteps.transit} 
                              onChange={() => {}}
                              className="rounded border-zinc-300 h-4 w-4 text-zinc-900 focus:ring-zinc-900" 
                            />
                            <div className="text-xs font-medium text-zinc-700">Cross-Subnet RPC Mesh</div>
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 px-1 rounded">Correctness</span>
                        </div>

                        <div 
                          onClick={() => setCompletedSteps(prev => ({ ...prev, reproducible: !prev.reproducible }))}
                          className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="checkbox" 
                              checked={completedSteps.reproducible} 
                              onChange={() => {}}
                              className="rounded border-zinc-300 h-4 w-4 text-zinc-900 focus:ring-zinc-900" 
                            />
                            <div className="text-xs font-medium text-zinc-700">Terraform IaC Scripting</div>
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-rose-50 text-rose-700 px-1 rounded">Reproducible</span>
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex items-start gap-2 leading-relaxed">
                        <AlertCircle className="h-4 w-4 text-indigo-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>Ready for Submission?</strong> Ensure files are fully compiled by reviewing codebooks and customizing config details on left rail, then click "Download Solution ZIP".
                        </div>
                      </div>
                    </div>

                    {/* EMAIL OUTLINE GENERATOR */}
                    <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-zinc-700" />
                          <h3 className="font-semibold text-sm text-zinc-900 tracking-tight">CC Submission Email Blueprint</h3>
                        </div>
                        <button
                          onClick={() => handleCopyCode(`To: anuran@getalchemystai.com\nCc: saumitra@getalchemystai.com, khushi@getalchemystai.com\nSubject: DevOps Internship Assignment — ${userConfig.name}\n\nDear Alchemyst-AI Team,\n\nI have successfully completed the DevOps Internship Assignment. Embedded in the attached bundle is the full infrastructure-as-code and worker system orchestration.\n\nSummary writeup details:\n1. VPC subnet isolation has been thoroughly established.\n2. Internal TCP RPC boundaries mapped correctly.\n` , "email-template")}
                          className="text-xs flex items-center gap-1 text-zinc-600 hover:text-zinc-900 font-medium font-mono border border-zinc-200 rounded px-2 py-1 bg-zinc-50 transition"
                        >
                          <Copy className="h-3 w-3" />
                          <span>{copiedFile === "email-template" ? "Copied Email!" : "Copy Email"}</span>
                        </button>
                      </div>

                      <div className="space-y-3 font-mono text-[11px] leading-relaxed text-zinc-700 bg-zinc-50 p-4 rounded-xl border border-zinc-200 max-h-96 overflow-y-auto">
                        <div>
                          <span className="text-zinc-400 font-bold shrink-0">TO: </span>
                          <span className="text-zinc-800 font-semibold select-all">anuran@getalchemystai.com</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 font-bold shrink-0">CC: </span>
                          <span className="text-zinc-800 font-semibold select-all">saumitra@getalchemystai.com, khushi@getalchemystai.com</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 font-bold shrink-0">SUBJECT: </span>
                          <span className="text-zinc-900 font-bold select-all">DevOps Internship Assignment — {userConfig.name}</span>
                        </div>
                        
                        <div className="border-t border-zinc-200 pt-3 text-zinc-600 font-sans space-y-2.5 text-xs text-justify">
                          <p>Hi Anuran, Saumitra, and Khushi,</p>
                          <p>I am submitting my complete solution repository for the <strong>Alchemyst DevOps Internship Assignment</strong>. I have successfully written, bundled, and tested the infrastructure blueprints to deploy the distributed SLM inference mesh prototype.</p>
                          
                          <p className="font-bold text-zinc-800 border-l-2 border-zinc-400 pl-2">🔑 Key Implementation Features:</p>
                          <ul className="list-disc pl-5 space-y-1 text-zinc-600">
                            <li><strong>VPC Network Isolation:</strong> Created detailed CIDR subnetworking ({userConfig.cidrBlock}) inside our target provider ({userConfig.provider.toUpperCase()}) where the Inference workers are isolated within highly protected layers with strictly zero public ingress routes.</li>
                            <li><strong>RPC Transit Mechanics:</strong> Wired the Python Gemma processes and NodeJS caller servers together securely over standard port 4000.</li>
                            <li><strong>Reproducible Automation:</strong> Designed and included end-to-end HashiCorp Terraform configuration frameworks alongside unified Bash bootstrappers to enable hands-off cluster reconstruction.</li>
                          </ul>

                          <p className="font-bold text-zinc-800 border-l-2 border-zinc-400 pl-2">📦 What is attached in my ZIP:</p>
                          <ul className="list-disc pl-5 space-y-1 text-zinc-600 font-mono text-[10px]">
                            <li>/terraform/main.tf, /variables.tf, /outputs.tf (Automates the VPC nodes and firewall limits)</li>
                            <li>/workers/inference-worker/main.py (Python SLM local inference node)</li>
                            <li>/workers/caller-worker/main.ts (Node TypeScript outer HTTP controller gateway)</li>
                            <li>/deploy/setup.sh (Bootstraps python packages, node components, systemd daemons)</li>
                            <li>/deploy/systemd/ (Systemd worker runbooks configuration files)</li>
                            <li>/README.md (Thorough architecture explanation, curl commands, and hardening report)</li>
                          </ul>

                          <p>I've attached the completed solution ZIP package containing these structures. The exact curl instructions and security analysis are detailed inside the included README.md file.</p>
                          <p>Looking forward to your review and feedback!</p>
                          <p className="pt-2">Sincerely,<br /><strong>{userConfig.name}</strong></p>
                        </div>
                      </div>

                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      </main>

      {/* 3. Footer Block */}
      <footer className="bg-white border-t border-zinc-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-400 font-mono">
          <p>© 2026 Alchemyst DevOps Integration Companion. All templates and visual nodes are compiled in real-time according to target homework specifications.</p>
        </div>
      </footer>
    </div>
  );
}
