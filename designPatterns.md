# Design Patterns Implementation Guide
CS305 Course Project

## Overview
This document outlines the architectural **Structural Design Patterns** implemented in our Full-Stack Notes Application. By utilizing these patterns, we ensure that our codebase remains highly maintainable, decoupled, and easily extensible as the application grows.

We have successfully implemented three core Gang of Four (GoF) structural patterns: **Adapter**, **Facade**, and **Bridge**.

---

## 1. The Adapter Pattern (Backend)

### What is it?
The Adapter pattern allows objects with incompatible interfaces to collaborate. It acts as a wrapper, catching calls for one object and transforming them to a format recognizable by another.

### Where we used it
We implemented the Adapter pattern for our backend rate-limiting and caching system (`backend/src/adapters/CacheAdapter.js`). 

### Why we used it
Initially, our rate-limiting middleware was tightly coupled to the `@upstash/ratelimit` SDK. If we wanted to switch to a local Redis server, AWS ElastiCache, or an in-memory cache for testing, we would have had to rewrite our middleware. By introducing a `CacheAdapter`, the application now only speaks to a generic interface.

### Code Example
The Adapter wraps the third-party Upstash logic:

```javascript
// backend/src/adapters/CacheAdapter.js
import { Redis } from '@upstash/redis';

class UpstashRedisAdapter {
  constructor() {
    this.client = Redis.fromEnv(); 
  }

  async increment(key, windowSeconds) {
    const count = await this.client.incr(key);
    if (count === 1) await this.client.expire(key, windowSeconds);
    return count;
  }
}

export const cacheAdapter = new UpstashRedisAdapter();
```

Our middleware now safely relies entirely on the Adapter:
```javascript
// backend/src/middleware/rateLimiter.js
import { cacheAdapter } from "../adapters/CacheAdapter.js";

const rateLimiter = async (req, res, next) => {
    // The middleware knows nothing about Upstash or Redis!
    const currentRequests = await cacheAdapter.increment(`ratelimit:${req.ip}`, 60);
    if (currentRequests > 20) return res.status(429).json({ message: "Too many requests" });
    next();
}
```

---

## 2. The Facade Pattern (Frontend)

### What is it?
The Facade pattern provides a simplified interface to a complex subsystem. It hides the underlying complexity of a system behind a clean, easy-to-use object.

### Where we used it
We implemented this pattern on the React frontend to manage all HTTP communications (`frontend/src/lib/apiFacade.js`).

### Why we used it
React components often get cluttered with HTTP fetching logic, error handling, base URLs, and response parsing (`response.data`). Furthermore, downloading files requires complex Axios configuration (like `responseType: 'blob'`). The Facade hides all this HTTP/Axios complexity so the UI components can focus strictly on rendering.

### Code Example
The Facade handles the ugly Axios configuration and error parsing:

```javascript
// frontend/src/lib/apiFacade.js
import api from "./axios.js";

export const NotesAPI = {
  getAllNotes: async () => {
    const response = await api.get("/notes");
    return response.data; 
  },

  exportNote: async (id, format = 'json') => {
    const response = await api.get(`/notes/${id}/export?format=${format}&method=download`, {
      responseType: 'blob' 
    });
    return response.data;
  }
};
```

React Components simply call the Facade:
```javascript
// frontend/src/components/NoteEditor.jsx
import { NotesAPI } from '../lib/apiFacade.js';

const data = await NotesAPI.getAllNotes();
```

---

## 3. The Bridge Pattern (Backend)

### What is it?
The Bridge pattern decouples an abstraction from its implementation so that the two can vary independently. It prevents a "class explosion" when a feature has two orthogonal dimensions.

### Where we used it
We implemented the Bridge pattern for our powerful "Export Note" feature (`backend/src/services/export/`).

### Why we used it
Our export feature has two dimensions:
1. **Format:** (JSON vs. Markdown)
2. **Delivery Method:** (Download File vs. Log to Console)

Without a Bridge, we would need 4 separate classes (`DownloadJson`, `DownloadMarkdown`, `ConsoleJson`, `ConsoleMarkdown`). If we added a PDF format, we'd need 6 classes. Instead, we bridged **Formatters** (Implementations) and **Exporters** (Abstractions).

### Code Example

**The Implementations (How it looks):**
```javascript
// backend/src/services/export/Formatters.js
export class JsonFormatter {
  format(note) { return JSON.stringify(note, null, 2); }
}

export class MarkdownFormatter {
  format(note) { return `# ${note.title}\n\n${note.content}`; }
}
```

**The Abstractions (How it's delivered):**
```javascript
// backend/src/services/export/Exporters.js
class NoteExporter {
  constructor(formatter) {
    this.formatter = formatter; // THIS IS THE BRIDGE!
  }
}

export class DownloadExporter extends NoteExporter {
  export(note) {
    return { data: this.formatter.format(note), type: 'download' };
  }
}
```

**Dynamic Composition in the Controller:**
```javascript
// backend/src/controllers/notesController.js
const formatter = new MarkdownFormatter();
const exporter = new DownloadExporter(formatter);

const result = exporter.export(note);
```

## 4. The Factory Pattern (Backend)

### What is it?
The Factory pattern is a Creational design pattern that provides a centralized interface for creating objects. It encapsulates the instantiation logic, ensuring that objects are created in a standardized, consistent way.

### Where we used it
We implemented a **Response Factory** on the backend to standardize every HTTP response sent to the client (`backend/src/utils/ResponseFactory.js`).

### Why we used it
Hardcoding `res.status(...).json(...)` in every controller leads to inconsistent API responses across different routes. The Factory guarantees that every API response (whether a success or an error) shares the exact same shape (e.g., `success`, `message`, `data`). If we ever need to add a standard field like a `timestamp`, we only have to update the Factory, not dozens of controller files.

### Code Example

**The Factory Class:**
```javascript
// backend/src/utils/ResponseFactory.js
class ResponseFactory {
  // Standardizes successful responses
  static createSuccess(res, data = null, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({ 
      success: true, 
      message, 
      data 
    });
  }

  // Standardizes error responses
  static createError(res, message = "An error occurred", statusCode = 500) {
    return res.status(statusCode).json({ 
      success: false, 
      message 
    });
  }
}

export default ResponseFactory;
```

**Using the Factory in a Controller:**
```javascript
// backend/src/controllers/notes/notesController.js
import Note from '../../models/Note.js';
import ResponseFactory from '../../utils/ResponseFactory.js';

export async function getAllNotes(req, res) {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    // Returns a perfectly formatted success object
    return ResponseFactory.createSuccess(res, notes, "Notes retrieved successfully");
  } catch (error) {
    // Returns a perfectly formatted error object
    return ResponseFactory.createError(res, "Internal Server Error", 500);
  }
}
```

---

## 5. The Observer Pattern (Frontend)

### What is it?
The Observer pattern is a Behavioral design pattern that establishes a one-to-many relationship between objects. When the primary object (the Publisher/Subject) changes state, all its dependents (the Subscribers/Observers) are notified automatically.

### Where we used it
We implemented an **Event Bus** system on the React frontend to manage global Toast notifications (`frontend/src/lib/observer.js`).

### Why we used it
Without the Observer pattern, displaying a success message after creating a note would require passing `setToastMessage` props down through multiple layers of React components (prop drilling). 

The Observer pattern solves this by creating an independent Event Bus. Any component can "publish" a notification event, and our root `ToastContainer` listens for these events and renders them automatically. This completely decouples the UI components from the notification logic.

### Code Example

**The Publisher (Event Bus):**
```javascript
// frontend/src/lib/observer.js
class NotificationObserver {
  constructor() {
    this.subscribers = [];
  }

  // Components use this to listen for events
  subscribe(callback) {
    this.subscribers.push(callback);
    // Return cleanup function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Components use this to broadcast events
  notify(message, type = 'success') {
    this.subscribers.forEach(callback => callback({ message, type }));
  }
}

export const notificationBus = new NotificationObserver();
```

**The Subscriber (Toast UI):**
```jsx
// frontend/src/components/ToastContainer.jsx
import { useState, useEffect } from 'react';
import { notificationBus } from '../lib/observer.js';

export default function ToastContainer() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Listen for any published notifications
    const unsubscribe = notificationBus.subscribe((data) => {
      setToast(data);
      setTimeout(() => setToast(null), 3000); // Auto-hide
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  if (!toast) return null;

  return (
    <div className="toast toast-top toast-end z-50">
      <div className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'}`}>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
```

**Publishing an Event (From anywhere in the app):**
```jsx
// frontend/src/pages/CreatePage.jsx
import { notificationBus } from '../lib/observer.js';
import { NotesAPI } from '../lib/apiFacade.js';

const handleCreate = async (e) => {
  e.preventDefault();
  try {
    await NotesAPI.createNote({ title, content });
    
    // Broadcast the success event! The ToastContainer will catch it.
    notificationBus.notify("Note created successfully!", "success");
  } catch (error) {
    // Broadcast an error event!
    notificationBus.notify("Failed to create note", "error");
  }
};
```