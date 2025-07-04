const TEXT_EXTENSION = '.txt';

function downloadTextFile(filename: string, content: string): void {
  if (!filename || filename.length === 0 || !content || content.length === 0) {
    return;
  }

  const textFileName = filename.endsWith(TEXT_EXTENSION) ? filename : filename + TEXT_EXTENSION;

  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', textFileName);
  element.style.display = 'none';

  document.body.appendChild(element);
  element.click();

  document.body.removeChild(element);
}

const DownloadFileService = {
  downloadTextFile,
};

export default DownloadFileService;
