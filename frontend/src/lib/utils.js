export function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function triggerFileDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  
  window.URL.revokeObjectURL(url);
}