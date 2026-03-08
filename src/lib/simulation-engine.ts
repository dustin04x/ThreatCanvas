export type EventType =
  | "process_spawn"
  | "file_create"
  | "file_encrypt"
  | "file_delete"
  | "registry_modify"
  | "network_dns"
  | "network_connect"
  | "network_exfiltrate"
  | "privilege_escalation"
  | "persistence"
  | "user_action"
  | "ransom_note"
  | "shadow_copy_delete"
  | "credential_dump"
  | "lateral_movement";

export type Severity = "normal" | "suspicious" | "malicious" | "user";

export interface SimulationEvent {
  id: string;
  time: number;
  type: EventType;
  title: string;
  description: string;
  details: Record<string, string>;
  severity: Severity;
  mitreId?: string;
  mitreName?: string;
  beginnerExplanation?: string;
  technicalExplanation?: string;
  processInfo?: {
    name: string;
    parent?: string;
    pid?: number;
  };
  networkInfo?: {
    source: string;
    destination: string;
    protocol?: string;
    port?: number;
  };
  fileInfo?: {
    path: string;
    action: string;
  };
}

export interface AttackScenario {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  icon: string;
  events: SimulationEvent[];
  attackChain: string[];
}

let eventCounter = 0;
const eid = () => `evt-${++eventCounter}`;

export const scenarios: AttackScenario[] = [
  {
    id: "wannacry",
    name: "WannaCry Ransomware",
    description: "Simulates the infamous WannaCry ransomware that exploited EternalBlue to spread across networks, encrypting files and demanding Bitcoin ransom.",
    category: "Ransomware",
    difficulty: "Intermediate",
    icon: "🔐",
    attackChain: ["Initial Access", "Execution", "Lateral Movement", "Privilege Escalation", "Shadow Copy Deletion", "File Encryption", "Ransom Note"],
    events: [
      {
        id: eid(), time: 0, type: "user_action", title: "SMB Exploit Received", severity: "malicious",
        description: "EternalBlue exploit targets SMB vulnerability (MS17-010)",
        details: { "Exploit": "EternalBlue (MS17-010)", "Port": "445/TCP", "Protocol": "SMBv1" },
        mitreId: "T1210", mitreName: "Exploitation of Remote Services",
        beginnerExplanation: "The attacker found a weakness in how Windows shares files over the network and used it to break in.",
        technicalExplanation: "EternalBlue exploits a buffer overflow in Microsoft's SMBv1 implementation, allowing remote code execution without authentication.",
        networkInfo: { source: "10.0.0.50", destination: "Victim PC", protocol: "SMB", port: 445 },
      },
      {
        id: eid(), time: 2, type: "process_spawn", title: "Malware Dropper Executed", severity: "malicious",
        description: "mssecsvc.exe spawned via exploit payload",
        details: { "Process": "mssecsvc.exe", "Parent": "svchost.exe", "PID": "4892" },
        mitreId: "T1059", mitreName: "Command and Scripting Interpreter",
        beginnerExplanation: "The malware's main program starts running on the computer.",
        technicalExplanation: "The exploit payload drops and executes mssecsvc.exe, which serves as both the worm propagation component and ransomware dropper.",
        processInfo: { name: "mssecsvc.exe", parent: "svchost.exe", pid: 4892 },
      },
      {
        id: eid(), time: 4, type: "lateral_movement", title: "Network Scanning", severity: "malicious",
        description: "WannaCry scans for other vulnerable hosts on the network",
        details: { "Scan Type": "SMB Port 445", "Range": "Local subnet + random IPs" },
        mitreId: "T1046", mitreName: "Network Service Discovery",
        beginnerExplanation: "The malware looks for other computers on the network to infect.",
        technicalExplanation: "The worm component generates random IPs and scans local subnet for port 445, attempting EternalBlue against each responsive host.",
        networkInfo: { source: "Victim PC", destination: "10.0.0.0/24", protocol: "SMB", port: 445 },
      },
      {
        id: eid(), time: 6, type: "process_spawn", title: "Ransomware Payload Dropped", severity: "malicious",
        description: "tasksche.exe extracted and executed as ransomware component",
        details: { "Process": "tasksche.exe", "Parent": "mssecsvc.exe", "Purpose": "File encryption" },
        mitreId: "T1486", mitreName: "Data Encrypted for Impact",
        beginnerExplanation: "The actual file-encrypting part of the malware starts.",
        technicalExplanation: "mssecsvc.exe extracts the ransomware binary (tasksche.exe) from its resource section and executes it.",
        processInfo: { name: "tasksche.exe", parent: "mssecsvc.exe", pid: 5120 },
      },
      {
        id: eid(), time: 8, type: "privilege_escalation", title: "Service Installation", severity: "malicious",
        description: "WannaCry installs itself as a Windows service for persistence",
        details: { "Service": "mssecsvc2.0", "Path": "C:\\Windows\\mssecsvc.exe" },
        mitreId: "T1543.003", mitreName: "Create or Modify System Process: Windows Service",
        beginnerExplanation: "The malware makes sure it keeps running even if you try to close it.",
        technicalExplanation: "Registers as Windows service 'mssecsvc2.0' for persistence and automatic restart capabilities.",
        processInfo: { name: "services.exe", parent: "mssecsvc.exe" },
      },
      {
        id: eid(), time: 10, type: "shadow_copy_delete", title: "Shadow Copies Deleted", severity: "malicious",
        description: "Volume shadow copies destroyed to prevent recovery",
        details: { "Command": "vssadmin delete shadows /all /quiet", "Purpose": "Prevent file recovery" },
        mitreId: "T1490", mitreName: "Inhibit System Recovery",
        beginnerExplanation: "The malware deletes Windows backups so you can't restore your files.",
        technicalExplanation: "Executes vssadmin to delete all Volume Shadow Copies, eliminating potential file recovery through Windows Previous Versions.",
        processInfo: { name: "vssadmin.exe", parent: "tasksche.exe", pid: 5200 },
      },
      {
        id: eid(), time: 12, type: "file_encrypt", title: "File Encryption Begins", severity: "malicious",
        description: "Files encrypted with AES-128-CBC, key encrypted with RSA-2048",
        details: { "Algorithm": "AES-128-CBC + RSA-2048", "Extensions": ".doc, .xls, .pdf, .jpg, .zip", "New Extension": ".WNCRY" },
        mitreId: "T1486", mitreName: "Data Encrypted for Impact",
        beginnerExplanation: "Your files are being locked with a secret code that only the attacker knows.",
        technicalExplanation: "Each file encrypted with unique AES-128-CBC key. AES keys encrypted with embedded RSA-2048 public key. Original files overwritten with .WNCRY extension.",
        fileInfo: { path: "C:\\Users\\*\\Documents\\*", action: "encrypt" },
      },
      {
        id: eid(), time: 16, type: "ransom_note", title: "Ransom Note Displayed", severity: "malicious",
        description: "@WanaDecryptor@.exe displays ransom demand",
        details: { "Ransom": "$300 in Bitcoin", "Deadline": "3 days (doubles to $600)", "Final": "7 days (files deleted)" },
        mitreId: "T1491", mitreName: "Defacement",
        beginnerExplanation: "A scary message appears demanding money to unlock your files.",
        technicalExplanation: "WannaCry decryptor UI displays with timer, Bitcoin wallet address, and instructions. Ransom starts at $300 BTC, doubles after 3 days.",
        processInfo: { name: "@WanaDecryptor@.exe", parent: "tasksche.exe" },
        fileInfo: { path: "Desktop\\@WanaDecryptor@.exe", action: "create" },
      },
    ],
  },
  {
    id: "emotet",
    name: "Emotet Trojan",
    description: "Simulates the Emotet banking trojan that spreads via phishing emails, steals credentials, and drops additional malware payloads.",
    category: "Info Stealer",
    difficulty: "Beginner",
    icon: "📧",
    attackChain: ["Phishing Email", "Macro Execution", "Payload Download", "Persistence", "Credential Theft", "C2 Communication", "Lateral Spread"],
    events: [
      {
        id: eid(), time: 0, type: "user_action", title: "Phishing Email Opened", severity: "user",
        description: "User opens email with malicious Word attachment",
        details: { "Subject": "Invoice #39281 - Payment Overdue", "Attachment": "Invoice_39281.doc" },
        mitreId: "T1566.001", mitreName: "Phishing: Spearphishing Attachment",
        beginnerExplanation: "Someone received a fake email pretending to be an invoice and opened the attached file.",
        technicalExplanation: "Social engineering via spearphishing with weaponized Office document containing obfuscated VBA macros.",
      },
      {
        id: eid(), time: 2, type: "process_spawn", title: "Macro Executed", severity: "malicious",
        description: "VBA macro in Word document triggers PowerShell",
        details: { "Process": "powershell.exe", "Parent": "WINWORD.EXE", "Flags": "-EncodedCommand -WindowStyle Hidden" },
        mitreId: "T1059.001", mitreName: "PowerShell",
        beginnerExplanation: "The document had hidden instructions that run a powerful system tool.",
        technicalExplanation: "Obfuscated VBA macro invokes PowerShell with Base64-encoded command to download Emotet payload from compromised WordPress sites.",
        processInfo: { name: "powershell.exe", parent: "WINWORD.EXE", pid: 3400 },
      },
      {
        id: eid(), time: 5, type: "network_connect", title: "Payload Downloaded", severity: "malicious",
        description: "Emotet binary downloaded from compromised server",
        details: { "URL": "hxxps://compromised-site.com/wp-content/emotet.dll", "Size": "340KB" },
        mitreId: "T1105", mitreName: "Ingress Tool Transfer",
        beginnerExplanation: "The malware downloads its main program from a hacked website.",
        technicalExplanation: "PowerShell downloads Emotet DLL from one of several hardcoded URLs (typically compromised WordPress installations).",
        networkInfo: { source: "Victim PC", destination: "compromised-site.com", protocol: "HTTPS", port: 443 },
      },
      {
        id: eid(), time: 7, type: "process_spawn", title: "Emotet DLL Loaded", severity: "malicious",
        description: "rundll32.exe loads and executes Emotet payload",
        details: { "Process": "rundll32.exe", "DLL": "C:\\Users\\AppData\\Local\\random.dll" },
        mitreId: "T1218.011", mitreName: "Signed Binary Proxy Execution: Rundll32",
        beginnerExplanation: "The malware disguises itself using a legitimate Windows tool to avoid detection.",
        technicalExplanation: "Emotet uses rundll32.exe as a proxy to execute its DLL, leveraging a signed Windows binary to evade application whitelisting.",
        processInfo: { name: "rundll32.exe", parent: "powershell.exe", pid: 4100 },
      },
      {
        id: eid(), time: 9, type: "persistence", title: "Registry Persistence", severity: "malicious",
        description: "Emotet adds Run key for persistence across reboots",
        details: { "Key": "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", "Value": "rundll32.exe random.dll" },
        mitreId: "T1547.001", mitreName: "Boot or Logon Autostart Execution: Registry Run Keys",
        beginnerExplanation: "The malware makes sure it starts every time you turn on your computer.",
        technicalExplanation: "Establishes persistence via CurrentVersion\\Run registry key, ensuring DLL is loaded via rundll32 on each user logon.",
      },
      {
        id: eid(), time: 11, type: "credential_dump", title: "Credentials Harvested", severity: "malicious",
        description: "Emotet extracts stored passwords from browsers and email clients",
        details: { "Targets": "Chrome, Firefox, Outlook", "Method": "Memory scraping + SQLite DB" },
        mitreId: "T1555", mitreName: "Credentials from Password Stores",
        beginnerExplanation: "The malware steals all the passwords saved in your web browsers and email programs.",
        technicalExplanation: "Emotet's credential harvesting module extracts saved credentials from browser SQLite databases and Outlook profiles using COM automation.",
      },
      {
        id: eid(), time: 14, type: "network_exfiltrate", title: "C2 Communication", severity: "malicious",
        description: "Stolen data exfiltrated to command and control server",
        details: { "Protocol": "HTTPS (encrypted)", "Data": "Credentials, system info", "C2": "185.x.x.x" },
        mitreId: "T1041", mitreName: "Exfiltration Over C2 Channel",
        beginnerExplanation: "The stolen passwords and personal data are sent to the attacker's server.",
        technicalExplanation: "Exfiltrates harvested credentials and system enumeration data over encrypted HTTPS channel to Emotet C2 infrastructure.",
        networkInfo: { source: "Victim PC", destination: "C2 Server (185.x.x.x)", protocol: "HTTPS", port: 443 },
      },
      {
        id: eid(), time: 17, type: "lateral_movement", title: "Spreading via Email", severity: "malicious",
        description: "Emotet uses stolen email data to send phishing emails to contacts",
        details: { "Method": "Email thread hijacking", "Targets": "Victim's contact list" },
        mitreId: "T1534", mitreName: "Internal Spearphishing",
        beginnerExplanation: "The malware sends fake emails to everyone in your contact list, pretending to be you.",
        technicalExplanation: "Emotet's spam module leverages stolen email threads and contacts to generate convincing reply-chain phishing emails, dramatically increasing infection rates.",
        networkInfo: { source: "Victim PC", destination: "Mail Server", protocol: "SMTP", port: 587 },
      },
    ],
  },
  {
    id: "notpetya",
    name: "NotPetya Wiper",
    description: "Simulates NotPetya, a destructive wiper disguised as ransomware that caused billions in damage worldwide.",
    category: "Wiper",
    difficulty: "Advanced",
    icon: "💀",
    attackChain: ["Supply Chain Compromise", "Execution", "Credential Theft", "Lateral Movement", "MBR Overwrite", "File Destruction"],
    events: [
      {
        id: eid(), time: 0, type: "user_action", title: "Software Update Compromised", severity: "malicious",
        description: "MEDoc accounting software update delivers NotPetya",
        details: { "Vector": "Supply chain attack", "Software": "MEDoc (Ukrainian tax software)", "Method": "Trojanized update" },
        mitreId: "T1195.002", mitreName: "Supply Chain Compromise: Software Supply Chain",
        beginnerExplanation: "The attacker hacked a popular software's update system to secretly install malware on everyone who updated.",
        technicalExplanation: "NotPetya was distributed via a trojanized update to MEDoc, a widely-used Ukrainian tax accounting package, representing a supply chain compromise.",
      },
      {
        id: eid(), time: 2, type: "process_spawn", title: "NotPetya Executed", severity: "malicious",
        description: "Malicious DLL loaded via rundll32 with elevated privileges",
        details: { "Process": "rundll32.exe", "DLL": "perfc.dat", "Privilege": "SYSTEM" },
        mitreId: "T1218.011", mitreName: "Rundll32",
        beginnerExplanation: "The malware starts running with full control over the computer.",
        technicalExplanation: "NotPetya executes via rundll32.exe loading perfc.dat, immediately running with SYSTEM-level privileges inherited from the update process.",
        processInfo: { name: "rundll32.exe", parent: "ezvit.exe", pid: 2800 },
      },
      {
        id: eid(), time: 4, type: "credential_dump", title: "Mimikatz Credential Dump", severity: "malicious",
        description: "Built-in Mimikatz module extracts Windows credentials from memory",
        details: { "Tool": "Modified Mimikatz", "Target": "LSASS.exe", "Result": "Domain admin credentials" },
        mitreId: "T1003.001", mitreName: "OS Credential Dumping: LSASS Memory",
        beginnerExplanation: "The malware steals administrator passwords directly from the computer's memory.",
        technicalExplanation: "NotPetya contains a custom Mimikatz implementation that dumps credentials from LSASS process memory, targeting NTLM hashes and Kerberos tickets.",
        processInfo: { name: "lsass.exe", parent: "rundll32.exe" },
      },
      {
        id: eid(), time: 6, type: "lateral_movement", title: "EternalBlue + PsExec Spread", severity: "malicious",
        description: "NotPetya spreads across network using multiple methods",
        details: { "Method 1": "EternalBlue (MS17-010)", "Method 2": "PsExec with stolen creds", "Method 3": "WMI remote execution" },
        mitreId: "T1210", mitreName: "Exploitation of Remote Services",
        beginnerExplanation: "The malware spreads to every computer on the network using stolen passwords and security holes.",
        technicalExplanation: "NotPetya uses a combination of EternalBlue/EternalRomance exploits, PsExec with harvested credentials, and WMI for network propagation.",
        networkInfo: { source: "Victim PC", destination: "All network hosts", protocol: "SMB/WMI", port: 445 },
      },
      {
        id: eid(), time: 9, type: "file_delete", title: "MBR Overwritten", severity: "malicious",
        description: "Master Boot Record replaced with custom bootloader",
        details: { "Target": "Physical Drive 0, Sector 0", "Purpose": "Display fake ransom note on boot", "Recovery": "Impossible" },
        mitreId: "T1561.002", mitreName: "Disk Structure Wipe",
        beginnerExplanation: "The malware destroys the part of your hard drive that tells the computer how to start up.",
        technicalExplanation: "NotPetya overwrites the MBR with a custom bootloader that displays a fake ransom screen. Unlike Petya, the encryption key is randomly generated and discarded, making recovery impossible.",
        fileInfo: { path: "\\\\.\\PhysicalDrive0", action: "overwrite" },
      },
      {
        id: eid(), time: 12, type: "file_encrypt", title: "MFT Encryption", severity: "malicious",
        description: "NTFS Master File Table encrypted — filesystem destroyed",
        details: { "Target": "$MFT", "Algorithm": "Salsa20 (key discarded)", "Effect": "Total filesystem destruction" },
        mitreId: "T1486", mitreName: "Data Encrypted for Impact",
        beginnerExplanation: "The malware scrambles the index of all files, making them permanently inaccessible.",
        technicalExplanation: "NotPetya encrypts the NTFS $MFT with Salsa20, but intentionally discards the encryption key. This is destruction masquerading as ransomware — no recovery is possible.",
        fileInfo: { path: "$MFT", action: "destroy" },
      },
      {
        id: eid(), time: 15, type: "ransom_note", title: "Fake Ransom Demand", severity: "malicious",
        description: "System reboots to fake Petya ransom screen — but payment cannot decrypt",
        details: { "Ransom": "$300 Bitcoin", "Reality": "Wiper — decryption impossible", "Email": "wowsmith123456@posteo.net (disabled)" },
        beginnerExplanation: "A message demands money, but it's a trick — even paying won't get your files back. The data is destroyed forever.",
        technicalExplanation: "The ransom screen is a facade. The installation ID is randomly generated (not derived from encryption keys), making decryption mathematically impossible. NotPetya is a wiper, not ransomware.",
      },
    ],
  },
  {
    id: "infostealer",
    name: "Credential Stealer",
    description: "Simulates a modern information stealer that targets browser passwords, crypto wallets, and session tokens.",
    category: "Info Stealer",
    difficulty: "Beginner",
    icon: "🕵️",
    attackChain: ["Fake Download", "Execution", "Anti-Analysis", "Credential Theft", "Crypto Wallet Theft", "Data Packaging", "Exfiltration"],
    events: [
      {
        id: eid(), time: 0, type: "user_action", title: "Fake Software Downloaded", severity: "user",
        description: "User downloads 'cracked' software from untrusted site",
        details: { "File": "PhotoEditor_Pro_Crack.exe", "Source": "free-software-downloads.xyz", "Size": "4.2MB" },
        mitreId: "T1204.002", mitreName: "User Execution: Malicious File",
        beginnerExplanation: "Someone downloaded a fake free program that actually contains malware hidden inside.",
        technicalExplanation: "Trojanized installer distributed via SEO-poisoned search results, common distribution method for commodity stealers like RedLine/Raccoon.",
      },
      {
        id: eid(), time: 2, type: "process_spawn", title: "Stealer Executed", severity: "malicious",
        description: "Packed .NET executable unpacks and runs in memory",
        details: { "Process": "PhotoEditor.exe", "Runtime": ".NET 4.8", "Packer": "ConfuserEx" },
        mitreId: "T1059", mitreName: "Command and Scripting Interpreter",
        beginnerExplanation: "The malware starts running on your computer.",
        technicalExplanation: "Packed .NET binary uses ConfuserEx for obfuscation, unpacks stealer payload in memory using reflection to evade static analysis.",
        processInfo: { name: "PhotoEditor.exe", parent: "explorer.exe", pid: 6200 },
      },
      {
        id: eid(), time: 4, type: "process_spawn", title: "Anti-Analysis Checks", severity: "suspicious",
        description: "Stealer checks for sandbox/VM environment",
        details: { "Checks": "VM detection, debugger, sandboxing", "Method": "WMI queries, timing checks" },
        mitreId: "T1497", mitreName: "Virtualization/Sandbox Evasion",
        beginnerExplanation: "The malware checks if it's being watched by security researchers before doing anything harmful.",
        technicalExplanation: "Performs environment fingerprinting: checks for VM artifacts (VMware tools, VBox), queries WMI for hardware info, uses timing attacks to detect debuggers.",
        processInfo: { name: "PhotoEditor.exe", parent: "explorer.exe" },
      },
      {
        id: eid(), time: 6, type: "credential_dump", title: "Browser Passwords Stolen", severity: "malicious",
        description: "Decrypts and extracts saved passwords from all installed browsers",
        details: { "Chrome": "Login Data (SQLite)", "Firefox": "logins.json + key4.db", "Edge": "Login Data" },
        mitreId: "T1555.003", mitreName: "Credentials from Web Browsers",
        beginnerExplanation: "The malware reads all the passwords you saved in Chrome, Firefox, and other browsers.",
        technicalExplanation: "Accesses browser credential stores: Chrome/Edge use DPAPI-protected SQLite DB, Firefox uses NSS library for key4.db decryption. Extracts URLs, usernames, and plaintext passwords.",
      },
      {
        id: eid(), time: 9, type: "file_create", title: "Crypto Wallets Targeted", severity: "malicious",
        description: "Stealer searches for and copies cryptocurrency wallet files",
        details: { "Targets": "MetaMask, Exodus, Electrum, Phantom", "Data": "Wallet seed phrases, private keys" },
        mitreId: "T1005", mitreName: "Data from Local System",
        beginnerExplanation: "The malware looks for cryptocurrency wallets and steals the secret keys needed to take your crypto.",
        technicalExplanation: "Enumerates known wallet paths (%AppData%\\Exodus, browser extension storage for MetaMask), extracts encrypted wallet data and seed phrases.",
        fileInfo: { path: "%AppData%\\Exodus\\exodus.wallet", action: "copy" },
      },
      {
        id: eid(), time: 12, type: "file_create", title: "Data Packaged for Exfiltration", severity: "malicious",
        description: "Stolen data compressed into encrypted archive",
        details: { "Contents": "Passwords, cookies, wallets, screenshots", "Format": "ZIP with AES encryption", "Size": "~2MB" },
        mitreId: "T1560.001", mitreName: "Archive Collected Data",
        beginnerExplanation: "The malware puts all your stolen information into a single package ready to send to the attacker.",
        technicalExplanation: "Collected data staged in %TEMP%, compressed into AES-encrypted ZIP archive. Includes system fingerprint, browser data, wallet files, Discord tokens, and desktop screenshots.",
        fileInfo: { path: "%TEMP%\\data.zip", action: "create" },
      },
      {
        id: eid(), time: 14, type: "network_exfiltrate", title: "Data Exfiltrated", severity: "malicious",
        description: "Stolen data sent to attacker via Telegram bot API",
        details: { "Method": "Telegram Bot API (HTTPS)", "Fallback": "Discord webhook", "Data": "All collected credentials" },
        mitreId: "T1567.002", mitreName: "Exfiltration to Cloud Storage",
        beginnerExplanation: "All your stolen passwords and data are sent to the attacker through a messaging app.",
        technicalExplanation: "Exfiltrates via Telegram Bot API over HTTPS (legitimate traffic, hard to block). Falls back to Discord webhook or direct HTTP POST to C2 panel.",
        networkInfo: { source: "Victim PC", destination: "api.telegram.org", protocol: "HTTPS", port: 443 },
      },
    ],
  },
  {
    id: "stuxnet",
    name: "Stuxnet",
    description: "Simulates the world's first cyber weapon — a sophisticated worm that targeted Iranian nuclear centrifuges via infected USB drives and multiple zero-day exploits.",
    category: "Cyber Weapon",
    difficulty: "Advanced",
    icon: "☢️",
    attackChain: ["USB Infection", "Zero-Day Exploits", "Network Propagation", "PLC Discovery", "Centrifuge Sabotage", "Stealth"],
    events: [
      {
        id: eid(), time: 0, type: "user_action", title: "Infected USB Inserted", severity: "malicious",
        description: "USB flash drive with Stuxnet introduced to air-gapped network",
        details: { "Vector": "USB autorun + LNK exploit", "Target": "Air-gapped industrial network", "Exploit": "CVE-2010-2568" },
        mitreId: "T1091", mitreName: "Replication Through Removable Media",
        beginnerExplanation: "Someone plugged an infected USB drive into a computer that wasn't connected to the internet.",
        technicalExplanation: "Stuxnet spread via USB using a Windows Shell LNK vulnerability (CVE-2010-2568) that executed code when the drive's folder was merely viewed in Explorer.",
      },
      {
        id: eid(), time: 3, type: "process_spawn", title: "Zero-Day Exploit Chain", severity: "malicious",
        description: "Stuxnet uses 4 zero-day exploits for privilege escalation",
        details: { "Exploits": "CVE-2010-2568, CVE-2010-2729, CVE-2010-3338, CVE-2010-3888", "Privilege": "SYSTEM" },
        mitreId: "T1068", mitreName: "Exploitation for Privilege Escalation",
        beginnerExplanation: "The malware uses 4 previously unknown security holes to gain complete control of the computer.",
        technicalExplanation: "Stuxnet employed an unprecedented 4 zero-day exploits targeting Windows Shell, Print Spooler, Task Scheduler, and Win32k for guaranteed privilege escalation.",
        processInfo: { name: "stuxnet.dll", parent: "explorer.exe", pid: 1840 },
      },
      {
        id: eid(), time: 6, type: "persistence", title: "Rootkit Installed", severity: "malicious",
        description: "Kernel-level rootkit with stolen digital certificates",
        details: { "Certificates": "Realtek & JMicron (stolen)", "Type": "Kernel driver rootkit", "Purpose": "Hide all Stuxnet files" },
        mitreId: "T1014", mitreName: "Rootkit",
        beginnerExplanation: "The malware hides itself deep inside Windows using stolen security certificates that make it look legitimate.",
        technicalExplanation: "Stuxnet installed a kernel-mode rootkit signed with legitimate certificates stolen from Realtek Semiconductor and JMicron Technology, evading driver signature verification.",
        processInfo: { name: "mrxcls.sys", parent: "stuxnet.dll" },
      },
      {
        id: eid(), time: 9, type: "lateral_movement", title: "Network Propagation", severity: "malicious",
        description: "Spreads across internal network via multiple methods",
        details: { "Method 1": "Windows Server Service (MS08-067)", "Method 2": "Network shares", "Method 3": "Siemens WinCC database" },
        mitreId: "T1210", mitreName: "Exploitation of Remote Services",
        beginnerExplanation: "The worm spreads to other computers on the factory network looking for the specific target machines.",
        technicalExplanation: "Propagated via MS08-067 (Conficker vulnerability), network shares with stolen credentials, and Siemens STEP 7 project files shared via WinCC SQL server.",
        networkInfo: { source: "Victim PC", destination: "SCADA Network", protocol: "SMB", port: 445 },
      },
      {
        id: eid(), time: 12, type: "process_spawn", title: "PLC Discovery", severity: "malicious",
        description: "Searches for Siemens S7-315/S7-417 PLCs controlling centrifuges",
        details: { "Target PLC": "Siemens S7-315 & S7-417", "Software": "STEP 7 / WinCC", "Protocol": "Profibus" },
        mitreId: "T0846", mitreName: "Remote System Discovery",
        beginnerExplanation: "The malware searches for the specific industrial computers that control the nuclear centrifuges.",
        technicalExplanation: "Stuxnet intercepts Siemens STEP 7 DLL calls to identify S7-315 PLCs driving variable-frequency drives from specific vendors (Fararo Paya, Vacon) running at 807-1210 Hz.",
        processInfo: { name: "s7otbxdx.dll", parent: "stuxnet.dll" },
      },
      {
        id: eid(), time: 16, type: "file_create", title: "PLC Code Injection", severity: "malicious",
        description: "Malicious code injected into centrifuge PLC controllers",
        details: { "Action": "Modified centrifuge spin speed", "Normal": "1064 Hz", "Attack": "1410 Hz → 2 Hz cycles", "Effect": "Physical destruction" },
        mitreId: "T0831", mitreName: "Manipulation of Control",
        beginnerExplanation: "The malware secretly changes how fast the centrifuges spin, causing them to tear themselves apart over weeks.",
        technicalExplanation: "Stuxnet periodically modified centrifuge rotor speeds from normal 1064 Hz to 1410 Hz (above structural limits) and back to 2 Hz, causing mechanical stress and eventual failure while replaying normal telemetry to operators.",
        fileInfo: { path: "PLC/OB1/OB35", action: "inject" },
      },
      {
        id: eid(), time: 20, type: "process_spawn", title: "MITM on Monitoring", severity: "malicious",
        description: "Replays normal sensor data to operators while attack executes",
        details: { "Technique": "Man-in-the-middle on PLC I/O", "Duration": "21 seconds of recorded data replayed", "Result": "Operators see normal operations" },
        mitreId: "T0856", mitreName: "Spoof Reporting Message",
        beginnerExplanation: "The malware records what 'normal' looks like and plays it back to the monitoring screens, so nobody notices the sabotage.",
        technicalExplanation: "Stuxnet records 21 seconds of legitimate I/O values from the PLC and replays them during attack sequences, creating a man-in-the-middle between the PLC and HMI/SCADA displays.",
        processInfo: { name: "s7otbxdx.dll", parent: "stuxnet.dll" },
      },
    ],
  },
  {
    id: "botnet",
    name: "Mirai Botnet",
    description: "Simulates the Mirai botnet that compromises IoT devices using default credentials to build a massive DDoS army.",
    category: "Botnet",
    difficulty: "Intermediate",
    icon: "🤖",
    attackChain: ["Telnet Scan", "Default Creds", "Payload Download", "Persistence", "C2 Registration", "DDoS Attack"],
    events: [
      {
        id: eid(), time: 0, type: "network_connect", title: "Telnet Port Scan", severity: "malicious",
        description: "Mirai scans random IPs for open Telnet port 23",
        details: { "Port": "23/TCP", "Protocol": "Telnet", "Scan Rate": "~100 IPs/second" },
        mitreId: "T1046", mitreName: "Network Service Discovery",
        beginnerExplanation: "The botnet searches the internet for smart devices (cameras, routers) that have the remote access port open.",
        technicalExplanation: "Mirai performs stateless SYN scanning on port 23 (Telnet) and 2323 across random IP ranges, avoiding certain reserved ranges (DoD, IANA, GE, HP).",
        networkInfo: { source: "Infected Bot", destination: "Random IPs", protocol: "Telnet", port: 23 },
      },
      {
        id: eid(), time: 3, type: "credential_dump", title: "Default Credential Brute Force", severity: "malicious",
        description: "Tries 62 common default username/password combinations",
        details: { "Examples": "admin:admin, root:root, admin:1234", "Total Combos": "62 hardcoded pairs", "Targets": "IP cameras, DVRs, routers" },
        mitreId: "T1110.001", mitreName: "Brute Force: Password Guessing",
        beginnerExplanation: "The malware tries common default passwords like 'admin/admin' that many people never change on their devices.",
        technicalExplanation: "Mirai contains 62 hardcoded credential pairs targeting IoT devices — mostly default factory credentials for Dahua, Hikvision, and various consumer routers.",
      },
      {
        id: eid(), time: 5, type: "network_connect", title: "Report to Loader", severity: "malicious",
        description: "Successful credentials reported to central loader server",
        details: { "Protocol": "Custom binary protocol", "Data": "IP, port, credentials", "Server": "Loader infrastructure" },
        mitreId: "T1071", mitreName: "Application Layer Protocol",
        beginnerExplanation: "When it finds a device with a default password, it tells the attacker's server about it.",
        technicalExplanation: "Compromised device credentials are sent to a separate loader/report server via custom binary protocol, which queues them for infection.",
        networkInfo: { source: "Scanner", destination: "Loader Server", protocol: "TCP", port: 48101 },
      },
      {
        id: eid(), time: 7, type: "process_spawn", title: "Payload Deployed", severity: "malicious",
        description: "Mirai binary downloaded and executed on IoT device",
        details: { "Architectures": "ARM, MIPS, x86, PowerPC, SPARC", "Method": "wget/tftp from loader", "Size": "~100KB" },
        mitreId: "T1059", mitreName: "Command and Scripting Interpreter",
        beginnerExplanation: "The malware installs itself on the smart device.",
        technicalExplanation: "Loader connects via Telnet, identifies CPU architecture, and deploys appropriate cross-compiled binary via wget or echo-based transfer for busybox environments.",
        processInfo: { name: "mirai.bot", parent: "telnetd", pid: 1200 },
      },
      {
        id: eid(), time: 9, type: "persistence", title: "Kill Competing Bots", severity: "malicious",
        description: "Mirai kills other malware and locks Telnet to maintain control",
        details: { "Actions": "Kill rival bots, disable Telnet, bind port 48101", "Purpose": "Exclusive device control" },
        mitreId: "T1489", mitreName: "Service Stop",
        beginnerExplanation: "The malware kicks out any other malware and locks the door so only it controls the device.",
        technicalExplanation: "Mirai kills processes bound to ports 22, 23, 80, and scans /proc for competing bot binaries. It then binds port 48101 as a mutex and disables Telnet to prevent reinfection.",
        processInfo: { name: "mirai.bot", parent: "telnetd" },
      },
      {
        id: eid(), time: 12, type: "network_connect", title: "C2 Registration", severity: "malicious",
        description: "Bot registers with Command & Control server for instructions",
        details: { "Protocol": "Custom encrypted", "Data": "Device capabilities, architecture", "Heartbeat": "Every 60 seconds" },
        mitreId: "T1571", mitreName: "Non-Standard Port",
        beginnerExplanation: "The infected device checks in with the attacker's control server, ready to receive orders.",
        technicalExplanation: "Bot resolves C2 domain, connects via custom binary protocol with XOR-based obfuscation, reports architecture and capabilities, then enters command polling loop.",
        networkInfo: { source: "Victim PC", destination: "C2 Server", protocol: "TCP", port: 23 },
      },
      {
        id: eid(), time: 15, type: "network_exfiltrate", title: "DDoS Attack Launched", severity: "malicious",
        description: "Coordinated DDoS attack from thousands of compromised devices",
        details: { "Attack Types": "UDP flood, SYN flood, ACK flood, GRE, DNS", "Bandwidth": "~1.2 Tbps (Dyn attack)", "Targets": "Dyn DNS → Twitter, Reddit, Netflix" },
        mitreId: "T1498", mitreName: "Network Denial of Service",
        beginnerExplanation: "All the infected devices attack a website at the same time, overwhelming it with so much traffic it goes offline.",
        technicalExplanation: "C2 issues attack command specifying target, duration, and vector. Mirai supports 10 DDoS methods including UDP/VSE floods, SYN floods, ACK floods, GRE floods, and DNS water torture attacks.",
        networkInfo: { source: "Botnet (100K+ devices)", destination: "Target: Dyn DNS", protocol: "UDP", port: 53 },
      },
    ],
  },
  {
    id: "cryptominer",
    name: "Cryptojacker",
    description: "Simulates a cryptocurrency mining trojan that hijacks system resources to mine Monero while evading detection.",
    category: "Cryptominer",
    difficulty: "Beginner",
    icon: "⛏️",
    attackChain: ["Trojanized Download", "Execution", "Evasion", "Persistence", "Mining Config", "Resource Hijack"],
    events: [
      {
        id: eid(), time: 0, type: "user_action", title: "Pirated Software Downloaded", severity: "user",
        description: "User downloads 'free' video editor with hidden cryptominer",
        details: { "File": "VideoEditorPro_v5.2_crack.exe", "Actual Size": "15MB (normal: 2MB)", "Source": "Torrent site" },
        mitreId: "T1204.002", mitreName: "User Execution: Malicious File",
        beginnerExplanation: "Someone downloaded a pirated program that secretly contains a cryptocurrency miner.",
        technicalExplanation: "Trojanized installer bundles legitimate software with XMRig cryptocurrency miner. Larger-than-expected file size is the only visible indicator.",
      },
      {
        id: eid(), time: 2, type: "process_spawn", title: "Dropper Executed", severity: "malicious",
        description: "Installer extracts and runs hidden miner components",
        details: { "Process": "svchost_update.exe", "Location": "%AppData%\\Microsoft\\", "Technique": "DLL sideloading" },
        mitreId: "T1574.002", mitreName: "DLL Side-Loading",
        beginnerExplanation: "The installer secretly places and runs the mining program alongside the real software.",
        technicalExplanation: "Dropper uses DLL sideloading via a legitimate signed binary to load the mining payload, naming it to blend with legitimate Windows services.",
        processInfo: { name: "svchost_update.exe", parent: "installer.exe", pid: 3800 },
      },
      {
        id: eid(), time: 4, type: "process_spawn", title: "Anti-Detection Checks", severity: "suspicious",
        description: "Miner checks for monitoring tools and adjusts behavior",
        details: { "Monitors For": "Task Manager, Process Explorer, Resource Monitor", "Action": "Pause mining when detected" },
        mitreId: "T1497", mitreName: "Virtualization/Sandbox Evasion",
        beginnerExplanation: "The miner watches for monitoring tools — if you open Task Manager, it temporarily stops to avoid being noticed.",
        technicalExplanation: "Enumerates running processes checking for taskmgr.exe, procexp.exe, resmon.exe, perfmon.exe. When detected, suspends mining threads and reduces CPU to baseline.",
        processInfo: { name: "svchost_update.exe", parent: "installer.exe" },
      },
      {
        id: eid(), time: 6, type: "persistence", title: "Scheduled Task Created", severity: "malicious",
        description: "Windows scheduled task ensures miner restarts after reboot",
        details: { "Task Name": "WindowsUpdateCheck", "Trigger": "At logon + every 30 minutes", "Action": "Start miner silently" },
        mitreId: "T1053.005", mitreName: "Scheduled Task",
        beginnerExplanation: "The malware creates a fake 'Windows Update' task that secretly restarts the miner every time you log in.",
        technicalExplanation: "Creates scheduled task 'WindowsUpdateCheck' via schtasks.exe with SYSTEM privileges, triggered at logon and every 30 minutes as a watchdog.",
      },
      {
        id: eid(), time: 9, type: "network_connect", title: "Mining Pool Connection", severity: "malicious",
        description: "XMRig connects to Monero mining pool",
        details: { "Pool": "pool.minexmr.com:4444", "Algorithm": "RandomX", "Wallet": "Attacker's Monero address", "Protocol": "Stratum" },
        mitreId: "T1496", mitreName: "Resource Hijacking",
        beginnerExplanation: "The miner connects to a cryptocurrency network and starts using your computer's power to make money for the attacker.",
        technicalExplanation: "XMRig connects to mining pool via Stratum protocol over TLS, mining Monero (XMR) using RandomX algorithm optimized for CPU mining.",
        networkInfo: { source: "Victim PC", destination: "pool.minexmr.com", protocol: "Stratum/TLS", port: 4444 },
      },
      {
        id: eid(), time: 12, type: "process_spawn", title: "CPU Hijacked at 80%", severity: "malicious",
        description: "Miner consumes most CPU resources, throttles to avoid detection",
        details: { "CPU Usage": "80% (capped)", "Threads": "6 of 8 cores", "Power": "~95W additional", "Effect": "Slow system, high electricity" },
        mitreId: "T1496", mitreName: "Resource Hijacking",
        beginnerExplanation: "Your computer becomes very slow because the miner is using 80% of its processing power to generate cryptocurrency.",
        technicalExplanation: "XMRig configured with max-threads-hint=75, limiting to 80% CPU utilization. Throttles further during user activity detection via GetLastInputInfo() API calls.",
        processInfo: { name: "xmrig.exe", parent: "svchost_update.exe", pid: 4500 },
      },
    ],
  },
  {
    id: "apt",
    name: "APT29 (Cozy Bear)",
    description: "Simulates an Advanced Persistent Threat campaign by Russian state-sponsored group APT29, known for the SolarWinds supply chain attack.",
    category: "APT",
    difficulty: "Advanced",
    icon: "🐻",
    attackChain: ["Supply Chain Compromise", "Backdoor Activation", "C2 via DNS", "Reconnaissance", "Credential Access", "Lateral Movement", "Data Exfiltration"],
    events: [
      {
        id: eid(), time: 0, type: "user_action", title: "Trojanized Update Installed", severity: "malicious",
        description: "SolarWinds Orion update contains SUNBURST backdoor",
        details: { "Software": "SolarWinds Orion Platform", "Version": "2019.4 - 2020.2.1", "Backdoor": "SUNBURST", "Affected": "~18,000 organizations" },
        mitreId: "T1195.002", mitreName: "Supply Chain Compromise",
        beginnerExplanation: "A trusted IT monitoring software was secretly modified to include a hidden backdoor, and thousands of companies installed it through normal updates.",
        technicalExplanation: "APT29 compromised SolarWinds build pipeline, injecting SUNBURST backdoor into SolarWinds.Orion.Core.BusinessLayer.dll, distributed via legitimate digitally-signed updates.",
      },
      {
        id: eid(), time: 4, type: "process_spawn", title: "SUNBURST Dormancy Period", severity: "suspicious",
        description: "Backdoor waits 12-14 days before activating to avoid sandbox detection",
        details: { "Delay": "12-14 days", "Checks": "Domain-joined, non-sandboxed, no security tools", "Anti-Analysis": "Process name hashing, blocklists" },
        mitreId: "T1497.003", mitreName: "Time Based Evasion",
        beginnerExplanation: "The backdoor sleeps for two weeks before doing anything, making it nearly impossible to catch during testing.",
        technicalExplanation: "SUNBURST implements a 12-14 day dormancy period, checks that machine is domain-joined, has real network connectivity, and no security/analysis tools running via FNV1a hash-based process enumeration.",
        processInfo: { name: "SolarWinds.BusinessLayerHost.exe", parent: "svchost.exe", pid: 2100 },
      },
      {
        id: eid(), time: 8, type: "network_dns", title: "C2 via DNS Beacon", severity: "malicious",
        description: "Command and control disguised as legitimate SolarWinds DNS queries",
        details: { "Domain": "avsvmcloud.com", "Subdomain": "Encoded victim info (GUID, domain, hostname)", "Protocol": "DNS CNAME" },
        mitreId: "T1071.004", mitreName: "DNS",
        beginnerExplanation: "The backdoor secretly communicates with the attackers by hiding messages inside normal-looking internet address lookups.",
        technicalExplanation: "SUNBURST uses DNS CNAME queries to avsvmcloud.com with encoded victim identifiers in subdomain labels. C2 selects high-value targets and returns CNAME records pointing to dedicated C2 infrastructure.",
        networkInfo: { source: "Victim PC", destination: "avsvmcloud.com", protocol: "DNS", port: 53 },
      },
      {
        id: eid(), time: 12, type: "process_spawn", title: "TEARDROP Loader Deployed", severity: "malicious",
        description: "Secondary memory-only payload deployed on high-value targets",
        details: { "Payload": "TEARDROP", "Type": "Memory-only dropper", "Final": "Cobalt Strike Beacon" },
        mitreId: "T1059", mitreName: "Command and Scripting Interpreter",
        beginnerExplanation: "The attackers decide this network is valuable and deploy a more powerful hacking tool that runs entirely in memory, leaving no files to detect.",
        technicalExplanation: "TEARDROP is a memory-only dropper that reads from a fake .jpg file, decodes embedded Cobalt Strike Beacon payload, and executes it in-memory without touching disk.",
        processInfo: { name: "TEARDROP.dll", parent: "SolarWinds.BusinessLayerHost.exe", pid: 2400 },
      },
      {
        id: eid(), time: 16, type: "credential_dump", title: "SAML Token Forgery", severity: "malicious",
        description: "Golden SAML attack to forge authentication tokens",
        details: { "Target": "AD FS signing certificate", "Result": "Forge tokens for any user", "Access": "Cloud email, SharePoint, Azure AD" },
        mitreId: "T1606.002", mitreName: "Forge Web Credentials: SAML Tokens",
        beginnerExplanation: "The attackers steal a master key that lets them create fake login tickets, allowing them to access any account in the organization — even cloud email.",
        technicalExplanation: "APT29 extracts AD FS token-signing certificate to forge SAML assertions, enabling authentication as any user to federated services (O365, Azure AD) without leaving on-premises logs.",
      },
      {
        id: eid(), time: 20, type: "lateral_movement", title: "Cloud Infrastructure Access", severity: "malicious",
        description: "Access Azure AD and O365 using forged SAML tokens",
        details: { "Targets": "Email, SharePoint, Teams, Azure resources", "Method": "Forged SAML via stolen signing cert" },
        mitreId: "T1550.001", mitreName: "Use Alternate Authentication Material",
        beginnerExplanation: "Using the fake login tickets, the attackers access emails, documents, and cloud services of key personnel.",
        technicalExplanation: "Forged SAML tokens used to access Microsoft 365 tenant, read executive email via Graph API, access SharePoint/OneDrive, and enumerate Azure AD configurations.",
        networkInfo: { source: "Victim PC", destination: "login.microsoftonline.com", protocol: "HTTPS", port: 443 },
      },
      {
        id: eid(), time: 24, type: "network_exfiltrate", title: "Intelligence Exfiltrated", severity: "malicious",
        description: "Classified and sensitive documents exfiltrated over encrypted channels",
        details: { "Data": "Emails, policy documents, source code", "Method": "Encrypted HTTPS via legitimate cloud APIs", "Duration": "Months of access" },
        mitreId: "T1567", mitreName: "Exfiltration Over Web Service",
        beginnerExplanation: "The attackers quietly copy sensitive emails and documents over months, blending their traffic with normal cloud usage.",
        technicalExplanation: "Data exfiltrated via legitimate Microsoft Graph API calls over HTTPS, indistinguishable from normal O365 traffic. APT29 maintained persistent access for months across multiple government agencies.",
        networkInfo: { source: "Victim PC", destination: "graph.microsoft.com", protocol: "HTTPS", port: 443 },
      },
    ],
  },
  {
    id: "phishing",
    name: "Spear Phishing Campaign",
    description: "Simulates a targeted phishing campaign that uses social engineering, credential harvesting, and MFA bypass to compromise corporate accounts.",
    category: "Social Engineering",
    difficulty: "Beginner",
    icon: "🎣",
    attackChain: ["Recon & Target Selection", "Phishing Site Setup", "Email Delivery", "Credential Harvest", "MFA Bypass", "Account Takeover"],
    events: [
      {
        id: eid(), time: 0, type: "user_action", title: "OSINT Reconnaissance", severity: "suspicious",
        description: "Attacker researches target organization via LinkedIn and social media",
        details: { "Sources": "LinkedIn, Twitter, Company website", "Gathered": "Employee names, roles, email format, tech stack", "Target": "Finance department" },
        mitreId: "T1589", mitreName: "Gather Victim Identity Information",
        beginnerExplanation: "The attacker researches the company online to find out who works there, what their email looks like, and which employees to target.",
        technicalExplanation: "OSINT phase gathers organizational structure, identifies high-value targets (finance, executives), determines email naming convention (first.last@company.com), and maps reporting hierarchy.",
      },
      {
        id: eid(), time: 3, type: "network_connect", title: "Phishing Infrastructure Deployed", severity: "malicious",
        description: "Attacker sets up convincing fake Microsoft login page with SSL",
        details: { "Domain": "micros0ft-login.com (typosquat)", "SSL": "Let's Encrypt certificate", "Framework": "Evilginx2 reverse proxy" },
        mitreId: "T1583.001", mitreName: "Acquire Infrastructure: Domains",
        beginnerExplanation: "The attacker creates a fake login page that looks exactly like Microsoft's real one, with a web address that's almost identical.",
        technicalExplanation: "Evilginx2 reverse proxy configured as transparent MITM between victim and legitimate Microsoft login, capturing both credentials and session cookies in real-time.",
        networkInfo: { source: "Attacker", destination: "micros0ft-login.com", protocol: "HTTPS", port: 443 },
      },
      {
        id: eid(), time: 6, type: "user_action", title: "Phishing Email Delivered", severity: "malicious",
        description: "Targeted email sent appearing to be from IT department about MFA update",
        details: { "From": "it-security@company.com (spoofed)", "Subject": "Urgent: MFA Security Update Required", "Urgency": "24-hour deadline" },
        mitreId: "T1566.002", mitreName: "Phishing: Spearphishing Link",
        beginnerExplanation: "The attacker sends a convincing email pretending to be from the IT department, asking the employee to update their security settings urgently.",
        technicalExplanation: "Spearphishing email with spoofed sender header, DKIM/SPF may pass due to misconfigured email authentication. Email creates urgency to bypass critical thinking.",
      },
      {
        id: eid(), time: 9, type: "credential_dump", title: "Credentials Harvested", severity: "malicious",
        description: "Victim enters username and password on fake login page",
        details: { "Captured": "Username, password, session cookies", "Time to Click": "~4 minutes after delivery", "Page": "Pixel-perfect Microsoft clone" },
        mitreId: "T1056", mitreName: "Input Capture",
        beginnerExplanation: "The employee clicks the link and types their password into the fake website, giving it to the attacker.",
        technicalExplanation: "Evilginx2 transparently proxies the login flow to legitimate Microsoft servers, capturing plaintext credentials and session tokens as they pass through the reverse proxy.",
      },
      {
        id: eid(), time: 11, type: "process_spawn", title: "MFA Token Intercepted", severity: "malicious",
        description: "Reverse proxy captures MFA token in real-time during authentication",
        details: { "MFA Type": "Push notification / TOTP", "Method": "Real-time session hijacking", "Result": "Valid authenticated session cookie" },
        mitreId: "T1111", mitreName: "Multi-Factor Authentication Interception",
        beginnerExplanation: "Even though the employee has two-factor authentication, the fake website captures the second code in real-time as they type it.",
        technicalExplanation: "Evilginx2 captures the authenticated session cookie after MFA completion, bypassing MFA entirely since the reverse proxy participates in the real authentication flow with Microsoft's servers.",
        processInfo: { name: "evilginx2", parent: "attacker" },
      },
      {
        id: eid(), time: 14, type: "network_connect", title: "Account Taken Over", severity: "malicious",
        description: "Attacker uses stolen session to access victim's Microsoft 365 account",
        details: { "Access": "Email, OneDrive, Teams, SharePoint", "Action": "Set up mail forwarding rule", "Persistence": "Registered new MFA device" },
        mitreId: "T1078", mitreName: "Valid Accounts",
        beginnerExplanation: "The attacker logs into the employee's account and sets up hidden email forwarding so they keep receiving copies of all emails.",
        technicalExplanation: "Attacker imports captured session cookie, accesses M365 tenant, creates inbox rule forwarding emails to external address, registers new authenticator app for persistent MFA access.",
        networkInfo: { source: "Attacker", destination: "outlook.office365.com", protocol: "HTTPS", port: 443 },
      },
      {
        id: eid(), time: 17, type: "network_exfiltrate", title: "Business Email Compromise", severity: "malicious",
        description: "Attacker sends fraudulent wire transfer request from compromised account",
        details: { "Target": "CFO / Accounts Payable", "Amount": "$247,000", "Method": "Impersonate CEO via compromised email", "Account": "Attacker-controlled bank" },
        mitreId: "T1534", mitreName: "Internal Spearphishing",
        beginnerExplanation: "Using the stolen email account, the attacker pretends to be a company executive and tricks someone into sending money to the attacker's bank account.",
        technicalExplanation: "Business Email Compromise (BEC) attack using the compromised email account to send an authoritative wire transfer request to finance, leveraging internal trust and executive impersonation.",
        networkInfo: { source: "Compromised Account", destination: "CFO Inbox", protocol: "SMTP", port: 587 },
      },
    ],
  },
];

export const getScenario = (id: string): AttackScenario | undefined =>
  scenarios.find((s) => s.id === id);
