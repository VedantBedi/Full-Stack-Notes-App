// Base Abstraction
class NoteExporter {
  constructor(formatter) {
    this.formatter = formatter; // The Bridge!
  }
  export(note) {
    throw new Error("export method must be implemented");
  }
}

// Refined Abstraction 1: Direct Download (just returns the formatted string for the API response)
export class DownloadExporter extends NoteExporter {
  export(note) {
    const formattedData = this.formatter.format(note);
    return { data: formattedData, type: 'download' };
  }
}

// Refined Abstraction 2: Console Log (e.g., for debugging or internal auditing)
export class ConsoleExporter extends NoteExporter {
  export(note) {
    const formattedData = this.formatter.format(note);
    console.log("--- EXPORTED NOTE ---");
    console.log(formattedData);
    return { data: formattedData, type: 'console' };
  }
}