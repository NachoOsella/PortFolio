export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadMockArchive(files: Array<{ filename: string; raw: string }>) {
  const content = files.map((file) => `===== ${file.filename} =====\n${file.raw}`).join('\n\n');
  downloadMarkdown('portfolio-content-export.txt', content);
}
