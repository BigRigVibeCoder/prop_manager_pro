import os, sys, yaml, re

error_count = 0

def check_doc(path):
    global error_count
    with open(path, 'r') as f:
        content = f.read()

    print(f'Linting: {path}')
    
    # 1. Frontmatter Check
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        print('  ❌ CRITICAL: Missing or malformed YAML frontmatter')
        error_count += 1
        return
        
    try:
        fm = yaml.safe_load(match.group(1))
    except Exception as e:
        print(f'  ❌ CRITICAL: YAML parse error: {e}')
        error_count += 1
        return

    required_fields = ['id', 'title', 'type', 'status', 'owner', 'tags', 'created', 'updated', 'version']
    for field in required_fields:
        if field not in fm:
            print(f'  ❌ ERROR: Missing required frontmatter field: {field}')
            error_count += 1

    # 2. BLUF Check
    if '> **BLUF:**' not in content:
        print('  ❌ ERROR: Missing "> **BLUF:**" (Bottom Line Up Front) block immediately following frontmatter.')
        error_count += 1

    # 3. ID match check
    basename = os.path.basename(path)
    if not basename.startswith(fm.get('id', 'MISSING')):
        print(f'  ❌ ERROR: Document ID "{fm.get("id")}" does not prefix filename "{basename}"')
        error_count += 1

    print('  ✅ Linting complete.')

print('=== CODEX COMPLIANCE LINTER ===')
for root, dirs, files in os.walk('CODEX'):
    if '_templates' in root: continue
    for file in files:
        if file.endswith('.md') and file != 'README.md':
            check_doc(os.path.join(root, file))

print(f'\n=== SUMMARY ===\nFound {error_count} compliance violations.')
if error_count > 0:
    sys.exit(1)
