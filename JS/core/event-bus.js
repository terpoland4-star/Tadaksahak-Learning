class EventBus {
  constructor() {
    this._listeners = {};
  }
  on(event, callback) {
    (this._listeners[event] ??= []).push(callback);
  }
  off(event, callback) {
    const arr = this._listeners[event];
    if (arr) this._listeners[event] = arr.filter(cb => cb !== callback);
  }
  emit(event, detail) {
    (this._listeners[event] || []).forEach(cb => cb(detail));
  }
}
export const eventBus = new EventBus();
