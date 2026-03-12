import shutil, os

dirs_to_delete = ['.next', '.swc', 'src/app/api', '.eslintrc.json']
files_to_delete = [
    'next-env.d.ts', 
    'next.config.mjs', 
    'src/middleware.ts', 
    'src/types/next-auth.d.ts', 
    'src/components/AuthProvider.tsx', 
    'src/components/ComponentCard.backup.tsx', 
    'src/app/layout.tsx',
    'delete_script.py'
]

for d in dirs_to_delete:
    shutil.rmtree(d, ignore_errors=True)

for f in files_to_delete:
    if os.path.exists(f):
        os.remove(f)
