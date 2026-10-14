import urllib.parse
from typing import Tuple, Optional
from app.security.network_safety import resolve_and_validate_host

def validate_target_url(raw_url: str) -> Tuple[bool, str, Optional[str]]:
    """
    Validates a submitted website URL against syntax rules, schemes, credentials,
    and prohibited private/metadata IP addresses.
    Returns (is_valid, error_message, normalized_url).
    """
    if not raw_url or not isinstance(raw_url, str):
        return False, "Target URL must be a non-empty string.", None

    url = raw_url.strip()

    # Reject URLs containing whitespace
    if any(c.isspace() for c in url):
        return False, "Target URL cannot contain whitespace.", None

    # Parse URL
    try:
        parsed = urllib.parse.urlparse(url)
    except Exception as e:
        return False, f"Malformed URL syntax: {str(e)}", None

    # If user provided a domain/host without scheme (e.g. 'youtube.com'), default to https://
    if not parsed.scheme and not url.startswith("//") and ":" not in url.split("/")[0]:
        url = "https://" + url
        try:
            parsed = urllib.parse.urlparse(url)
        except Exception as e:
            return False, f"Malformed URL syntax: {str(e)}", None

    # Scheme check: HTTP and HTTPS only
    scheme = (parsed.scheme or "").lower()
    if scheme not in ("http", "https"):
        return False, f"Unsupported scheme '{scheme}'. Only HTTP and HTTPS are permitted for security scanning.", None

    # Host check
    hostname = parsed.hostname
    if not hostname:
        return False, "Target URL must include a valid domain name or hostname.", None

    # Prohibit embedded credentials (user:pass@host)
    if parsed.username or parsed.password:
        return False, "Target URL cannot contain embedded credentials (user:password@).", None

    # Port check
    if parsed.port is not None:
        if parsed.port < 1 or parsed.port > 65535:
            return False, f"Invalid port number: {parsed.port}", None

    # Resolve hostname & ensure no private/metadata SSRF target
    is_safe, error_msg, resolved_ips = resolve_and_validate_host(hostname)
    if not is_safe:
        return False, error_msg, None

    # Normalize URL (clean path, keep query and port if non-standard)
    path = parsed.path or "/"
    normalized = urllib.parse.urlunparse((
        scheme,
        parsed.netloc.lower(),
        path,
        "",
        parsed.query,
        ""  # Exclude fragment from scanner target
    ))

    return True, "", normalized

def validate_redirect_target(original_url: str, redirect_location: str) -> Tuple[bool, str, Optional[str]]:
    """
    Validates an HTTP redirect target URL to ensure it stays on HTTP/HTTPS
    and does not redirect into loopback/private/metadata networks.
    Returns (is_valid, error_message, resolved_url).
    """
    if not redirect_location:
        return False, "Empty redirect location header.", None

    # Resolve relative redirects
    full_url = urllib.parse.urljoin(original_url, redirect_location)
    is_valid, error_msg, normalized = validate_target_url(full_url)
    if not is_valid:
        return False, f"Disallowed redirect target: {error_msg}", None

    return True, "", normalized

