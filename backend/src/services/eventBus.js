/**
 * Central application EventEmitter.
 * Demonstrates Node.js Events: controllers emit domain events
 * (booking created, status changed, listing created) and
 * subscribers (notificationService, activityLog) react asynchronously
 * without tightly coupling controllers to side-effect logic.
 */
const { EventEmitter } = require('events');

class AppEventBus extends EventEmitter {}

const eventBus = new AppEventBus();
eventBus.setMaxListeners(20);

module.exports = eventBus;
