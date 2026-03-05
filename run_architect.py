import pexpect
import sys

# Read the blueprint
with open('CODEX/20_BLUEPRINTS/BLU-001_PropManageProArchitecture.md', 'r') as f:
    content = f.read()

child = pexpect.spawn('/home/bdavidriggins/Documents/darkgravity/.venv/bin/darkgravity architect', encoding='utf-8')
child.expect('Paste the feature spec.*')
child.sendline(content)
child.sendcontrol('d')

print("Input sent, waiting for output...")
try:
    child.expect(pexpect.EOF, timeout=120)
    print(child.before)
except pexpect.TIMEOUT:
    print("Command timed out.")
    print(child.before)
