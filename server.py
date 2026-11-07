#!/usr/bin/env python3
"""Serve the Trinkgeldrechner as a local static website."""

import argparse
import ipaddress
import socket
import ssl
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


PROJECT_DIR = Path(__file__).resolve().parent


class AppRequestHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".css": "text/css; charset=utf-8",
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".png": "image/png",
        ".svg": "image/svg+xml",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_DIR), **kwargs)


def local_ip_address():
    """Find the address used for outbound local-network traffic without sending data."""
    probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        probe.connect(("192.0.2.1", 1))
        address = probe.getsockname()[0]
        if not ipaddress.ip_address(address).is_loopback:
            return address
    except OSError:
        pass
    finally:
        probe.close()
    return "127.0.0.1"


def parse_args():
    parser = argparse.ArgumentParser(description="Lokaler Webserver für den Trinkgeldrechner.")
    parser.add_argument("--host", default="0.0.0.0", help="Adresse zum Binden (Standard: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port (Standard: 8000)")
    parser.add_argument("--cert", help="Pfad zum TLS-Zertifikat (PEM)")
    parser.add_argument("--key", help="Pfad zum privaten TLS-Schlüssel (PEM)")
    args = parser.parse_args()
    if bool(args.cert) != bool(args.key):
        parser.error("--cert und --key müssen gemeinsam angegeben werden.")
    if args.port < 1 or args.port > 65535:
        parser.error("--port muss zwischen 1 und 65535 liegen.")
    return args


def main():
    args = parse_args()
    protocol = "https" if args.cert else "http"
    server = ThreadingHTTPServer((args.host, args.port), AppRequestHandler)
    if args.cert:
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(certfile=args.cert, keyfile=args.key)
        server.socket = context.wrap_socket(server.socket, server_side=True)

    print(f"Trinkgeldrechner erreichbar unter:")
    print(f"  {protocol}://127.0.0.1:{args.port}")
    if args.host in ("0.0.0.0", "::"):
        print(f"  {protocol}://{local_ip_address()}:{args.port}")
    print("Mit STRG + C beenden.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer wird beendet.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
