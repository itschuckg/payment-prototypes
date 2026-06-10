import { EventEmitter } from "node:events";
import type { PaymentEvent, PaymentRequest } from "./types";

type StoreShape = {
  requests: Map<string, PaymentRequest>;
  events: Map<string, PaymentEvent[]>;
  emitter: EventEmitter;
};

declare global {
  var __paymentsAtlasStore: StoreShape | undefined;
}

function createStore(): StoreShape {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(0);
  return {
    requests: new Map(),
    events: new Map(),
    emitter,
  };
}

export function getStore(): StoreShape {
  if (!globalThis.__paymentsAtlasStore) {
    globalThis.__paymentsAtlasStore = createStore();
  }
  return globalThis.__paymentsAtlasStore;
}

export function recordEvent(event: PaymentEvent) {
  const store = getStore();
  const list = store.events.get(event.requestId) ?? [];
  list.push(event);
  store.events.set(event.requestId, list);
  store.emitter.emit("event", event);
  store.emitter.emit(`event:${event.requestId}`, event);
}

export function subscribeAll(listener: (event: PaymentEvent) => void) {
  const { emitter } = getStore();
  emitter.on("event", listener);
  return () => emitter.off("event", listener);
}

export function subscribeRequest(
  requestId: string,
  listener: (event: PaymentEvent) => void,
) {
  const { emitter } = getStore();
  const channel = `event:${requestId}`;
  emitter.on(channel, listener);
  return () => emitter.off(channel, listener);
}
