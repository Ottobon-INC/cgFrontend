import os
import shutil

files_to_delete = [
    r"c:\Ottobon\Code_Components\frontend\src\middleware.ts",
    r"c:\Ottobon\Code_Components\frontend\src\types\next-auth.d.ts",
    r"c:\Ottobon\Code_Components\frontend\src\components\AuthProvider.tsx",
    r"c:\Ottobon\Code_Components\frontend\src\components\ComponentCard.backup.tsx",
    r"c:\Ottobon\Code_Components\frontend\src\components\stitch.js",
    r"c:\Ottobon\Code_Components\frontend\src\components\stitch.py",
    r"c:\Ottobon\Code_Components\frontend\src\components\stitch_v2.py"
]

for f in files_to_delete:
    try:
        if os.path.exists(f):
            os.remove(f)
            print("Deleted", f)
    except Exception as e:
        print("Error deleting", f, e)

dir_to_delete = r"c:\Ottobon\Code_Components\frontend\src\app\api"
try:
    if os.path.exists(dir_to_delete):
        shutil.rmtree(dir_to_delete)
        print("Deleted", dir_to_delete)
except Exception as e:
    print("Error deleting dir", dir_to_delete, e)
