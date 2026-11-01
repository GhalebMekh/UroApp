/**
 * UroApp's own iOS plugin (ios/App/App/UroNativePlugin.swift). Only callable
 * inside the native shell — check Capacitor.isNativePlatform() first.
 */
import { registerPlugin } from '@capacitor/core';

export interface NativeEvent {
  title: string;
  /** yyyy-mm-dd, all-day. */
  startDate: string;
  /** yyyy-mm-dd, inclusive. */
  endDate: string;
  location?: string;
  url?: string;
  notes?: string;
}

interface UroNativePlugin {
  /** Renders HTML to an A4 PDF in the temp folder; resolves its file:// URI. */
  htmlToPdf(o: { html: string; fileName: string }): Promise<{ uri: string }>;
  /** One event: the system "New Event" sheet. Several: saved to the default calendar. */
  addEvents(o: { events: NativeEvent[] }): Promise<{ added: number }>;
}

export const UroNative = registerPlugin<UroNativePlugin>('UroNative');
