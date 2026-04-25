export class JsonFormatter {
  format(note) {
    return JSON.stringify(note, null, 2);
  }
}

export class MarkdownFormatter {
  format(note) {
    return `# ${note.title}\n\n${note.content}\n\n*Created: ${note.createdAt}*`;
  }
}