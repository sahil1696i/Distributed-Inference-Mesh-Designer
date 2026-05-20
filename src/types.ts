export interface NetworkNode {
  id: string;
  name: string;
  type: "public-gateway" | "private-worker" | "firewall" | "client";
  ip: string;
  port?: string;
  technology: string;
  description: string;
  status: "idle" | "active" | "error";
  x: number;
  y: number;
}

export interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  active: boolean;
}

export interface RPCHop {
  id: string;
  name: string;
  action: string;
  detail: string;
  timestamp: string;
  ip: string;
  status: "success" | "error" | "pending";
}

export interface CodeFile {
  name: string;
  path: string;
  language: "terraform" | "python" | "typescript" | "bash" | "markdown" | "yaml" | "ini";
  content: string;
  description: string;
}

export interface SimulationResult {
  success: boolean;
  result?: string;
  metadata?: {
    roundtripMs: number;
    rawModel: string;
    evaluatedInstance: string;
    provider: string;
  };
  hops?: RPCHop[];
  error?: string;
}

export interface UserConfig {
  name: string;
  email: string;
  provider: "aws" | "gcp";
  awsRegion: string;
  gcpRegion: string;
  cidrBlock: string;
  instanceTypeAwsGateway: string;
  instanceTypeAwsWorker: string;
  instanceTypeGcpGateway: string;
  instanceTypeGcpWorker: string;
  sshPublicKey: string;
}
