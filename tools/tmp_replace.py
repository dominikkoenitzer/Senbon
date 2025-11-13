from pathlib import Path

patterns = ("*.tsx", "*.ts", "*.jsx", "*.js", "*.mdx")
for pattern in patterns:
  for path in Path("src").rglob(pattern):
    text = path.read_text()
    if "zen." in text:
      path.write_text(text.replace("zen.", "zen-"))

