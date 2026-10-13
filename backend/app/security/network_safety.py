import ipaddress
import re
import socket
from typing import List, Tuple
from app.config import settings

# Disallowed IP Networks (SSRF, Cloud Metadata, Private, Loopback, Link-Local)
DISALLOWED_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),          # Current network (only valid as source address)
    ipaddress.ip_network("10.0.0.0/8"),         # Private-use (RFC 1918)
    ipaddress.ip_network("100.64.0.0/10"),      # Shared Address Space (RFC 6598)
    ipaddress.ip_network("127.0.0.0/8"),        # Loopback
    ipaddress.ip_network("169.254.0.0/16"),     # Link-Local (includes 169.254.169.254 Cloud Metadata)
    ipaddress.ip_network("172.16.0.0/12"),      # Private-use (RFC 1918)
    ipaddress.ip_network("192.0.0.0/24"),       # IETF Protocol Assignments
    ipaddress.ip_network("192.0.2.0/24"),       # TEST-NET-1
    ipaddress.ip_network("192.88.99.0/24"),     # 6to4 Relay Anycast
    ipaddress.ip_network("192.168.0.0/16"),     # Private-use (RFC 1918)
    ipaddress.ip_network("198.18.0.0/15"),      # Network benchmark testing
    ipaddress.ip_network("198.51.100.0/24"),    # TEST-NET-2
    ipaddress.ip_network("203.0.113.0/24"),     # TEST-NET-3
    ipaddress.ip_network("224.0.0.0/4"),        # Multicast
    ipaddress.ip_network("240.0.0.0/4"),        # Reserved
    ipaddress.ip_network("255.255.255.255/32"), # Limited Broadcast
    # IPv6
    ipaddress.ip_network("::1/128"),            # Loopback
    ipaddress.ip_network("::/128"),             # Unspecified
    ipaddress.ip_network("::ffff:0:0/96"),      # IPv4-mapped IPv6
    ipaddress.ip_network("64:ff9b::/96"),       # IPv4/IPv6 translation
    ipaddress.ip_network("100::/64"),           # Discard prefix
    ipaddress.ip_network("2001:db8::/32"),      # Documentation
    ipaddress.ip_network("fc00::/7"),           # Unique Local (ULA)
    ipaddress.ip_network("fe80::/10"),          # Link-Local Unicast
    ipaddress.ip_network("ff00::/8"),           # Multicast
]

def is_ip_prohibited(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """Checks whether an IP falls into private, loopback, link-local, or cloud metadata ranges."""
    for network in DISALLOWED_NETWORKS:
        if ip in network:
            return True
    return ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved

def resolve_and_validate_host(hostname: str) -> Tuple[bool, str, List[str]]:
    """
    Resolves hostname DNS and checks all resulting IPv4/IPv6 addresses against SSRF protections.
    Returns (is_safe, error_message, resolved_ips).
    """
    cleaned_host = hostname.strip().lower()

    # Check developer allowlist override (for local testing e.g. localhost, demo-app.hackfix-labs.dev)
    if cleaned_host in settings.SCAN_ALLOWED_HOSTS:
        return True, "", ["127.0.0.1"]

    try:
        # Resolve all addresses
        addr_info = socket.getaddrinfo(cleaned_host, None)
    except socket.gaierror as e:
        return False, f"DNS resolution failed for host '{cleaned_host}': {e.strerror}", []
    except Exception as e:
        return False, f"DNS resolution error for host '{cleaned_host}': {str(e)}", []

    resolved_ips = []
    for info in addr_info:
        sockaddr = info[4]
        ip_str = sockaddr[0]
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            resolved_ips.append(ip_str)
            if is_ip_prohibited(ip_obj):
                return False, f"Host '{cleaned_host}' resolved to restricted or private IP address ({ip_str}). Scanning internal or cloud metadata networks is strictly prohibited.", []
        except ValueError:
            return False, f"Invalid IP address format resolved: {ip_str}", []

    if not resolved_ips:
        return False, f"Host '{cleaned_host}' did not resolve to any valid IP addresses.", []

    return True, "", resolved_ips

# Regex patterns for redacting sensitive values from headers, parameters, and evidence
SENSITIVE_PATTERNS = [
    (re.compile(r"(?i)(authorization:\s*(?:bearer|basic)\s+)[^\r\n]+"), r"\1[REDACTED]"),
    (re.compile(r"(?i)(cookie:\s*)[^\r\n]+"), r"\1[REDACTED]"),
    (re.compile(r"(?i)(set-cookie:\s*([^=;]+)=)[^;]+"), r"\1[REDACTED]"),
    (re.compile(r"(?i)(api[_-]?key\s*[:=]\s*)[^\s,;&\"']+"), r"\1[REDACTED]"),
    (re.compile(r"(?i)(secret\s*[:=]\s*)[^\s,;&\"']+"), r"\1[REDACTED]"),
    (re.compile(r"(?i)(password\s*[:=]\s*)[^\s,;&\"']+"), r"\1[REDACTED]"),
    (re.compile(r"(?i)(token\s*[:=]\s*)[^\s,;&\"']+"), r"\1[REDACTED]"),
]

def redact_sensitive_evidence(text: str) -> str:
    """Redacts tokens, credentials, cookies, and secret values from evidence strings."""
    if not text:
        return ""
    result = text
    for pattern, replacement in SENSITIVE_PATTERNS:
        result = pattern.sub(replacement, result)
    return result

