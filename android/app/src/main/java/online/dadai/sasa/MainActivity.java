package online.dadai.sasa;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import android.widget.FrameLayout;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

/**
 * SASA_MOBILE_ANDROID_V1
 *
 * The WebView loads the SASA production frontend over server.url, so two
 * behaviors that a browser gives for free have to be added back here.
 *
 * 1. Fullscreen video. Capacitor's stock BridgeWebChromeClient overrides
 *    onShowCustomView() only to call callback.onCustomViewHidden() and then
 *    WebChromeClient's no-op super, so the fullscreen surface a <video>
 *    requests is discarded the instant it is handed over and playback stays
 *    inline. FullscreenVideoChromeClient below actually attaches that view to
 *    the decor view, hides the WebView behind it and hides the system bars,
 *    then reverses all of it on exit. It deliberately does NOT call super for
 *    those two methods — doing so would re-introduce the premature
 *    onCustomViewHidden() callback.
 *
 *    Orientation is intentionally left alone rather than forced to landscape:
 *    SASA plays portrait photos through the same fullscreen path as video,
 *    and the activity already declares configChanges for orientation, so the
 *    user's own rotation is handled without recreating the activity.
 *
 * 2. Back navigation. Capacitor 8's BridgeActivity registers no back handling
 *    at all and @capacitor/app is not installed, so the default behavior is to
 *    finish the activity — pressing Back anywhere in the app would quit it
 *    outright. The callback below exits fullscreen first, then walks WebView
 *    history, and only leaves the app when there is nothing left to go back to.
 */
public class MainActivity extends BridgeActivity {

    private FullscreenVideoChromeClient chromeClient;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final Bridge bridge = getBridge();
        if (bridge == null || bridge.getWebView() == null) {
            // BridgeActivity falls back to the no_webview layout when the
            // System WebView is missing; there is nothing to wire up.
            return;
        }

        chromeClient = new FullscreenVideoChromeClient(bridge);
        bridge.getWebView().setWebChromeClient(chromeClient);

        getOnBackPressedDispatcher()
            .addCallback(
                this,
                new OnBackPressedCallback(true) {
                    @Override
                    public void handleOnBackPressed() {
                        if (chromeClient != null && chromeClient.isFullscreen()) {
                            chromeClient.onHideCustomView();
                            return;
                        }

                        WebView webView = getBridge() == null ? null : getBridge().getWebView();
                        if (webView != null && webView.canGoBack()) {
                            webView.goBack();
                            return;
                        }

                        // Nothing left in history: hand the press back to the
                        // default dispatcher, which finishes the activity.
                        setEnabled(false);
                        getOnBackPressedDispatcher().onBackPressed();
                    }
                }
            );
    }

    private final class FullscreenVideoChromeClient extends BridgeWebChromeClient {

        private View customView;
        private CustomViewCallback customViewCallback;

        FullscreenVideoChromeClient(Bridge bridge) {
            super(bridge);
        }

        boolean isFullscreen() {
            return customView != null;
        }

        @Override
        public void onShowCustomView(View view, CustomViewCallback callback) {
            if (customView != null) {
                // Already fullscreen — reject the second request rather than
                // stacking views.
                callback.onCustomViewHidden();
                return;
            }

            customView = view;
            customViewCallback = callback;

            FrameLayout decorView = (FrameLayout) getWindow().getDecorView();
            decorView.addView(
                customView,
                new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT)
            );

            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.setVisibility(View.GONE);
            }

            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), customView);
            controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            controller.hide(WindowInsetsCompat.Type.systemBars());
        }

        @Override
        public void onHideCustomView() {
            if (customView == null) {
                return;
            }

            FrameLayout decorView = (FrameLayout) getWindow().getDecorView();
            decorView.removeView(customView);
            customView = null;

            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.setVisibility(View.VISIBLE);
            }

            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
            controller.show(WindowInsetsCompat.Type.systemBars());

            if (customViewCallback != null) {
                customViewCallback.onCustomViewHidden();
                customViewCallback = null;
            }
        }
    }
}
