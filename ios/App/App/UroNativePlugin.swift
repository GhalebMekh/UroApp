import Capacitor
import EventKit
import EventKitUI
import UIKit

/// UroApp's own native bridge (JS: registerPlugin('UroNative'), src/lib/native.ts).
///  - htmlToPdf: renders an export's HTML to an A4 PDF in the temp folder.
///  - addEvents: one event opens the system "New Event" sheet, pre-filled; several
///    are saved straight to the default calendar after a write-only permission.
@objc(UroNativePlugin)
public class UroNativePlugin: CAPPlugin, CAPBridgedPlugin, EKEventEditViewDelegate {
    public let identifier = "UroNativePlugin"
    public let jsName = "UroNative"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "htmlToPdf", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addEvents", returnType: CAPPluginReturnPromise),
    ]

    private let store = EKEventStore()
    private var editorCall: CAPPluginCall?

    // MARK: PDF

    @objc func htmlToPdf(_ call: CAPPluginCall) {
        guard let html = call.getString("html"), let fileName = call.getString("fileName") else {
            call.reject("html and fileName are required")
            return
        }
        DispatchQueue.main.async {
            let renderer = UIPrintPageRenderer()
            renderer.addPrintFormatter(UIMarkupTextPrintFormatter(markupText: html), startingAtPageAt: 0)
            let page = CGRect(x: 0, y: 0, width: 595.2, height: 841.8) // A4 in points
            renderer.setValue(page, forKey: "paperRect")
            renderer.setValue(page.insetBy(dx: 28, dy: 36), forKey: "printableRect")

            let data = NSMutableData()
            UIGraphicsBeginPDFContextToData(data, page, nil)
            renderer.prepare(forDrawingPages: NSRange(location: 0, length: renderer.numberOfPages))
            for i in 0..<renderer.numberOfPages {
                UIGraphicsBeginPDFPage()
                renderer.drawPage(at: i, in: UIGraphicsGetPDFContextBounds())
            }
            UIGraphicsEndPDFContext()

            let url = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)
            do {
                try data.write(to: url, options: .atomic)
                call.resolve(["uri": url.absoluteString])
            } catch {
                call.reject("Could not write the PDF", nil, error)
            }
        }
    }

    // MARK: Calendar

    private static let dayFormat: DateFormatter = {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    /// An all-day event from { title, startDate, endDate (inclusive), location?, url?, notes? }.
    private func makeEvent(_ o: JSObject) -> EKEvent? {
        guard let title = o["title"] as? String,
              let startText = o["startDate"] as? String,
              let start = Self.dayFormat.date(from: startText) else { return nil }
        let end = (o["endDate"] as? String).flatMap { Self.dayFormat.date(from: $0) } ?? start
        let e = EKEvent(eventStore: store)
        e.title = title
        e.isAllDay = true
        e.startDate = start
        e.endDate = max(start, end)
        e.location = o["location"] as? String
        e.notes = o["notes"] as? String
        if let u = o["url"] as? String { e.url = URL(string: u) }
        return e
    }

    @objc func addEvents(_ call: CAPPluginCall) {
        let events = (call.getArray("events", JSObject.self) ?? []).compactMap(makeEvent)
        guard !events.isEmpty else {
            call.reject("No valid events")
            return
        }
        if events.count == 1 {
            presentEditor(events[0], call)
        } else {
            saveAll(events, call)
        }
    }

    /// The system sheet needs no calendar permission on iOS 17+; earlier versions ask first.
    private func presentEditor(_ event: EKEvent, _ call: CAPPluginCall) {
        let show = {
            DispatchQueue.main.async {
                let vc = EKEventEditViewController()
                vc.eventStore = self.store
                vc.event = event
                vc.editViewDelegate = self
                self.editorCall = call
                self.bridge?.viewController?.present(vc, animated: true)
            }
        }
        if #available(iOS 17.0, *) {
            show()
        } else {
            store.requestAccess(to: .event) { granted, _ in
                if granted { show() } else { call.reject("Calendar access was not allowed", "DENIED") }
            }
        }
    }

    public func eventEditViewController(_ controller: EKEventEditViewController,
                                        didCompleteWith action: EKEventEditViewAction) {
        controller.dismiss(animated: true)
        editorCall?.resolve(["added": action == .saved ? 1 : 0])
        editorCall = nil
    }

    private func saveAll(_ events: [EKEvent], _ call: CAPPluginCall) {
        let save: (Bool) -> Void = { granted in
            guard granted, let calendar = self.store.defaultCalendarForNewEvents else {
                call.reject("Calendar access was not allowed", "DENIED")
                return
            }
            do {
                for e in events {
                    e.calendar = calendar
                    try self.store.save(e, span: .thisEvent, commit: false)
                }
                try self.store.commit()
                call.resolve(["added": events.count])
            } catch {
                call.reject("Could not save to the calendar", nil, error)
            }
        }
        if #available(iOS 17.0, *) {
            store.requestWriteOnlyAccessToEvents { granted, _ in save(granted) }
        } else {
            store.requestAccess(to: .event) { granted, _ in save(granted) }
        }
    }
}
