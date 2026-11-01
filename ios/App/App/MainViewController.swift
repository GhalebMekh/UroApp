import Capacitor

/// The app's web view controller (Main.storyboard): registers UroApp's own plugin.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(UroNativePlugin())
    }
}
