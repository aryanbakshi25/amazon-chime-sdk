// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  AudioVideoEventAttributes,
  DeviceEventAttributes,
  EventAttributes,
  EventController,
  EventName,
  EventObserver,
  VideoFXEventAttributes,
} from 'amazon-chime-sdk-js';

/**
 * A minimal EventController for the demo that logs events to the console. It needs no
 * `MeetingSessionConfiguration`, so it can be supplied to `MeetingProvider`'s `eventController` prop
 * to observe device events before a meeting exists.
 */
export default class ConsoleLoggingEventController implements EventController {
  private observers = new Set<EventObserver>();

  addObserver(observer: EventObserver): void {
    this.observers.add(observer);
  }

  removeObserver(observer: EventObserver): void {
    this.observers.delete(observer);
  }

  async publishEvent(
    name: EventName,
    attributes?:
      | AudioVideoEventAttributes
      | DeviceEventAttributes
      | VideoFXEventAttributes
  ): Promise<void> {
    console.log(
      `[ConsoleLoggingEventController] ${name}`,
      attributes ?? {}
    );
    this.observers.forEach((observer) =>
      observer.eventDidReceive(name, (attributes ?? {}) as EventAttributes)
    );
  }
}
