#!/usr/bin/env python3
"""Scan source, including untracked implementation files; report filenames only."""
from pathlib import Path
import re, subprocess, sys
root=Path(__file__).resolve().parents[1]
patterns=[r'sb_secret_[A-Za-z0-9_-]{12,}',r'gh[pousr]_[A-Za-z0-9_]{20,}',r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',r'postgres(?:ql)?://[^\s:/]+:[^\s@]+@']
files=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=root).decode().split('\0')
failed=[]
for name in files:
    if not name or name=='scripts/check_secrets.py': continue
    p=root/name
    if not p.is_file(): continue
    text=p.read_text(errors='ignore')
    if any(re.search(pattern,text) for pattern in patterns): failed.append(name)
    for token in re.findall(r'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',text):
        import base64,json
        try:
            role=json.loads(base64.urlsafe_b64decode(token.split('.')[1]+'===')).get('role')
            if role=='service_role':failed.append(name)
        except Exception:pass
if failed: print('FAIL: credential pattern in '+', '.join(sorted(set(failed))));sys.exit(1)
print('PASS: tracked and unignored source credential-pattern scan')
