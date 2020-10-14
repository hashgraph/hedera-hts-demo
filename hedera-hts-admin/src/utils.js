import { EventBus } from "./eventBus";

export function notifySuccess(message) {
  notify(true, message);
}

export function notifyError(message) {
  notify(false, message);
}

function notify(status, message) {
  EventBus.$emit("notify", {
    status: status,
    message: message
  });
}
