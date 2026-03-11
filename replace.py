import os

tgt_dir = r"c:\Ottobon\Code_Components\frontend\src"

def replace_in_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content.replace('process.env.NEXT_PUBLIC_API_URL', 'import.meta.env.VITE_API_URL')
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {path}")

for root, _, files in os.walk(tgt_dir):
    for name in files:
        if name.endswith(('.ts', '.tsx', '.js', '.py')):
            replace_in_file(os.path.join(root, name))
