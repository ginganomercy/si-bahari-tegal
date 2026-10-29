#!/usr/bin/env python3
"""
scripts/serve.py
----------------
High-performance multithreaded local development server for Tegal 3D WebGIS.
Binds explicitly to 127.0.0.1:8000 to avoid Windows IPv6 dual-stack socket stalls.
"""

import os
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = 8000
HOST = "127.0.0.1"

class TegalWebGISHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable caching during active development
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def log_message(self, format, *args):
        # Clean console log
        sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]} - Status: {args[1]}\n")

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root_dir)
    server_address = (HOST, PORT)
    
    with ThreadingHTTPServer(server_address, TegalWebGISHandler) as httpd:
        print(f"[Tegal 3D WebGIS] Serving HTTP on http://{HOST}:{PORT}/src/ (Root: {root_dir})", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[Tegal 3D WebGIS] Server shutting down.", flush=True)

if __name__ == "__main__":
    main()

