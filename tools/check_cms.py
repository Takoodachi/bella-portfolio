"""Check that the editor (admin/config.yml) has a field for every value in _data/*.yml, and that
every required field has a value. Run after adding or renaming content: python tools/check_cms.py
The editor only saves fields it knows about, so a value without a field can be lost on the next save."""
import pathlib, sys
import yaml

ROOT = pathlib.Path(__file__).resolve().parent.parent


def check(fields, data, path):
    names = {x["name"]: x for x in fields}
    problems = []
    for k, v in (data or {}).items():
        if k not in names:
            problems.append(f"{path}.{k}: no field in admin/config.yml")
            continue
        fd = names[k]
        widget = fd.get("widget", "string")
        if widget == "object":
            problems += check(fd["fields"], v, f"{path}.{k}")
        elif widget == "list" and isinstance(v, list):
            for i, item in enumerate(v):
                if "types" in fd:
                    t = next((t for t in fd["types"] if t["name"] == item.get("type")), None)
                    if t is None:
                        problems.append(f"{path}.{k}[{i}]: unknown type {item.get('type')!r}")
                        continue
                    problems += check(t["fields"], {a: b for a, b in item.items() if a != "type"}, f"{path}.{k}[{i}]")
                elif "fields" in fd:
                    problems += check(fd["fields"], item, f"{path}.{k}[{i}]")
        elif v in ("", None, []) and fd.get("required", True) and widget != "boolean":
            problems.append(f"{path}.{k}: empty but required")
    for n, fd in names.items():
        if n not in (data or {}) and fd.get("required", True):
            problems.append(f"{path}.{n}: field has no value in the data file")
    return problems


config = yaml.safe_load((ROOT / "admin" / "config.yml").read_text(encoding="utf-8"))
problems = []
for col in config["collections"]:
    for fl in col["files"]:
        data = yaml.safe_load((ROOT / fl["file"]).read_text(encoding="utf-8"))
        problems += check(fl["fields"], data, fl["file"])
print("\n".join(problems) or "OK: the editor covers all content")
sys.exit(1 if problems else 0)
