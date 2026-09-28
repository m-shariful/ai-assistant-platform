import dns from "node:dns/promises";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

console.log("Node DNS servers:");
console.log(dns.getServers());

try {
  const records = await dns.resolveSrv(
    "_mongodb._tcp.ai-chat-cluster.zvldvxe.mongodb.net",
  );

  console.log("\nSRV records:");
  console.log(records);
} catch (error) {
  console.error("\nDNS ERROR:");
  console.error(error);
}
