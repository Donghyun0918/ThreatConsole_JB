"""Rule-based label fallback for documents the trained model cannot score.

Returns one of: Etc / Recon / Brute Force / Intrusion / Malware
"""
import re

WEB_ATTACK_RE = re.compile(
    r"(?i)("
    r"union\s+select|select\s+.+from|or\s+1\s*=\s*1|and\s+1\s*=\s*1"
    r"|<script|javascript:|onerror=|onload="
    r"|\.\./|\.\.\\|etc/passwd|/proc/"
    r"|cmd=|exec=|system\(|passthru\(|eval\("
    r"|wget\s|curl\s|nc\s|bash\s+-[ci]"
    r"|phpinfo\(\)|base64_decode"
    r")"
)

REVERSE_SHELL_KEYS = ("bash -i", "/dev/tcp", "nc -e", "mkfifo", "ncat")

# Suricata alert categories that map to attack labels
_SURICATA_BRUTE = ("attempted-user", "unsuccessful-user", "policy-violation")
_SURICATA_MALWARE = ("trojan-activity", "malware", "targeted-activity", "exploit-kit")
_SURICATA_INTRUSION = ("shellcode-detect", "successful-admin", "successful-user",
                       "network-scan", "attempted-admin", "web-application-attack")
_SURICATA_RECON = ("network-scan", "information-leak", "attempted-recon",
                   "successful-recon-numeric", "successful-recon-limited")


def _has(text: str, key: str) -> bool:
    return key in text.lower()


def _intval(d: dict, k: str) -> int:
    try:
        return int(d.get(k, 0) or 0)
    except (ValueError, TypeError):
        return 0


def _suricata_label(doc: dict) -> str:
    alert = doc.get("alert") or {}
    if isinstance(alert, str):
        return "Recon"
    category = str(alert.get("category") or "").lower()
    severity = int(alert.get("severity") or 3)

    for cat in _SURICATA_MALWARE:
        if cat in category:
            return "Malware"
    for cat in _SURICATA_INTRUSION:
        if cat in category:
            return "Intrusion"
    for cat in _SURICATA_BRUTE:
        if cat in category:
            return "Brute Force"
    for cat in _SURICATA_RECON:
        if cat in category:
            return "Recon"
    # Fall back on severity: 1=high threat, 2=medium, 3=low
    if severity == 1:
        return "Intrusion"
    if severity == 2:
        return "Malware"
    return "Recon"


def label_from_doc(doc: dict) -> str:
    """T-Pot ES document (logstash-*) → coarse attack label."""
    src_hp = str(doc.get("type") or doc.get("source_honeypot") or "").lower()
    proto = str(doc.get("protocol") or "").upper()
    ev_type = str(doc.get("eventid") or doc.get("event_type") or "").lower()
    cmd = (doc.get("input") or doc.get("command") or doc.get("message") or "")
    if isinstance(cmd, list):
        cmd = " ".join(str(x) for x in cmd)
    cmd = str(cmd)

    # --- Suricata: use alert metadata ---
    if src_hp == "suricata":
        return _suricata_label(doc)

    # --- P0f: passive OS fingerprinting = Recon ---
    if src_hp == "p0f":
        return "Recon"

    # --- Fatt: TLS/network fingerprinting = Recon ---
    if src_hp == "fatt":
        return "Recon"

    # --- Dionaea: malware sample capture ---
    if src_hp == "dionaea":
        return "Malware"

    # --- ConPot / industrial honeypots = Recon ---
    if src_hp in ("conpot", "ipphoney", "dicompot", "medpot", "ciscoasa"):
        return "Recon"

    # --- Sentrypeer / Mailoney: VoIP/mail brute force ---
    if src_hp in ("sentrypeer", "mailoney"):
        return "Brute Force"

    # --- Cowrie: SSH/Telnet honeypot ---
    if "cowrie" in src_hp or src_hp == "cowrie":
        if any(_has(cmd, k) for k in REVERSE_SHELL_KEYS):
            return "Intrusion"
        if "command" in ev_type and (_has(cmd, "wget") or _has(cmd, "curl") or _has(cmd, "chmod")):
            return "Malware"
        if "login" in ev_type or "failed" in ev_type:
            return "Brute Force"
        return "Recon"

    # --- Heralding / H0neytr4p: credential harvesting ---
    if src_hp in ("heralding", "h0neytr4p"):
        return "Brute Force"

    # --- Honeytrap: generic TCP honeypot ---
    if src_hp == "honeytrap":
        if any(_has(cmd, k) for k in REVERSE_SHELL_KEYS):
            return "Intrusion"
        if WEB_ATTACK_RE.search(cmd):
            return "Intrusion"
        return "Recon"

    # --- Snare/Tanner: web honeypot ---
    if src_hp in ("snare", "tanner"):
        if WEB_ATTACK_RE.search(cmd):
            return "Intrusion"
        return "Recon"

    # --- ElasticPot / Redishoneypot: DB honeypots ---
    if src_hp in ("elasticpot", "redishoneypot"):
        return "Intrusion"

    # --- NGINX: web server logs ---
    if src_hp == "nginx":
        if WEB_ATTACK_RE.search(cmd):
            return "Intrusion"
        return "Recon"

    # --- Generic fallbacks ---
    if any(_has(cmd, k) for k in REVERSE_SHELL_KEYS):
        return "Intrusion"
    if "command" in ev_type and (_has(cmd, "wget") or _has(cmd, "curl")):
        return "Malware"
    if "scan" in ev_type or proto == "PORTSCAN":
        return "Recon"
    if proto == "SMTP":
        return "Brute Force"
    if _intval(doc, "login_attempts") >= 3:
        return "Brute Force"
    if "login" in ev_type or "failed" in ev_type:
        return "Brute Force"

    return "Etc"


def is_attack(label: str) -> int:
    # "Normal" comes from NSL-KDD open dataset rows; treated same as Etc (benign)
    return 0 if label in ("Etc", "Normal") else 1
