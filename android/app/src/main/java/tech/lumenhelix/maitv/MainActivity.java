package tech.lumenhelix.maitv;

import android.app.Activity;
import android.app.AlertDialog;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.content.Context;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

/**
 * MAITV Android alpha: direct LAN SmartCast control, no screen casting or hub.
 * Native search entry uses documented ASCII codeset but requires a focused TV field.
 */
public final class MainActivity extends Activity {
    private static final int BG = Color.rgb(6, 12, 25);
    private static final int CARD = Color.rgb(16, 30, 53);
    private static final int CYAN = Color.rgb(37, 226, 239);
    private static final int BLUE = Color.rgb(37, 110, 166);
    private static final int TEXT = Color.rgb(235, 245, 255);
    private static final int SUB = Color.rgb(158, 183, 207);
    private static final int GREEN = Color.rgb(105, 238, 182);

    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final Handler main = new Handler(Looper.getMainLooper());
    private final SmartCastProtocol api = new SmartCastProtocol();
    private SecureStore store;
    private TvDiscovery discovery;
    private SecureStore.SavedTv tv;
    private SmartCastProtocol.Challenge challenge;
    private TextView statusLine;
    private LinearLayout root;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);
        store = new SecureStore(this);
        discovery = new TvDiscovery(this);
        showLoading();
        worker.execute(() -> {
            try {
                SecureStore.SavedTv existing = store.load();
                main.post(() -> {
                    if (existing != null) showRemote(existing);
                    else showPair();
                });
            } catch (Exception error) {
                main.post(() -> {
                    showPair();
                    setStatus("Saved pairing needs attention. Use Forget and pair again if necessary.");
                });
            }
        });
    }

    @Override protected void onDestroy() {
        if (discovery != null) discovery.stop();
        worker.shutdownNow();
        super.onDestroy();
    }

    private int dp(float n) { return (int) (n * getResources().getDisplayMetrics().density + 0.5f); }

    private GradientDrawable shape(int fill, int stroke, float radiusDp) {
        GradientDrawable s = new GradientDrawable();
        s.setColor(fill);
        s.setCornerRadius(dp(radiusDp));
        s.setStroke(dp(1), stroke);
        return s;
    }

    private GradientDrawable gradient(int start, int end) {
        GradientDrawable g = new GradientDrawable(GradientDrawable.Orientation.TL_BR, new int[] { start, end });
        g.setCornerRadius(dp(18));
        g.setStroke(dp(1), BLUE);
        return g;
    }

    private TextView text(String label, int size, int color, boolean strong) {
        TextView t = new TextView(this);
        t.setText(label);
        t.setTextSize(size);
        t.setTextColor(color);
        t.setTypeface(Typeface.create(strong ? "sans-serif-medium" : "sans-serif", strong ? Typeface.BOLD : Typeface.NORMAL));
        return t;
    }

    private void base(String subtitle) {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setFitsSystemWindows(true);
        scroll.setBackgroundColor(BG);
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(20), dp(18), dp(20), dp(30));
        scroll.addView(root);
        setContentView(scroll);

        LinearLayout brand = new LinearLayout(this);
        brand.setOrientation(LinearLayout.HORIZONTAL);
        brand.setGravity(Gravity.CENTER_VERTICAL);
        ImageView bulb = new ImageView(this);
        bulb.setImageResource(R.drawable.lumen_helix_bulb);
        bulb.setAdjustViewBounds(true);
        brand.addView(bulb, new LinearLayout.LayoutParams(dp(52), dp(58)));
        LinearLayout labels = new LinearLayout(this);
        labels.setPadding(dp(14), 0, 0, 0);
        labels.setOrientation(LinearLayout.VERTICAL);
        TextView brandWordmark = text("LUMENhelix", 20, CYAN, true);
        android.text.SpannableString styledWordmark = new android.text.SpannableString("LUMENhelix");
        styledWordmark.setSpan(new android.text.style.ForegroundColorSpan(TEXT), 5, 10, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        brandWordmark.setText(styledWordmark);
        labels.addView(brandWordmark);
        TextView small = text("solutions   /   MAITV", 11, GREEN, false);
        small.setLetterSpacing(0.11f);
        labels.addView(small);
        brand.addView(labels);
        root.addView(brand);

        TextView hero = text("Your TV. Your control.", 28, TEXT, true);
        hero.setPadding(0, dp(19), 0, dp(6));
        root.addView(hero);
        TextView caption = text(subtitle, 14, SUB, false);
        caption.setLineSpacing(dp(3), 1f);
        root.addView(caption);

        statusLine = text("Ready", 13, GREEN, false);
        statusLine.setPadding(dp(14), dp(12), dp(14), dp(12));
        statusLine.setBackground(shape(CARD, BLUE, 10));
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, -2);
        p.setMargins(0, dp(18), 0, dp(18));
        root.addView(statusLine, p);
    }

    private LinearLayout group(String heading) {
        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setPadding(dp(16), dp(16), dp(16), dp(16));
        container.setBackground(gradient(CARD, Color.rgb(10, 19, 38)));
        LinearLayout.LayoutParams outer = new LinearLayout.LayoutParams(-1, -2);
        outer.setMargins(0, dp(8), 0, dp(16));
        root.addView(container, outer);
        TextView title = text(heading, 17, TEXT, true);
        title.setPadding(0, 0, 0, dp(12));
        container.addView(title);
        return container;
    }

    private EditText input(String hint, boolean numbersOnly) {
        EditText field = new EditText(this);
        field.setTextColor(TEXT);
        field.setHintTextColor(SUB);
        field.setTextSize(16);
        field.setSingleLine(true);
        field.setPadding(dp(12), dp(10), dp(12), dp(10));
        field.setBackground(shape(Color.rgb(5, 14, 31), BLUE, 10));
        field.setHint(hint);
        if (numbersOnly) field.setInputType(InputType.TYPE_CLASS_NUMBER);
        else field.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, dp(54));
        p.setMargins(0, dp(4), 0, dp(10));
        field.setLayoutParams(p);
        return field;
    }

    private Button action(String caption, int color) {
        Button button = new Button(this);
        button.setText(caption);
        button.setAllCaps(false);
        button.setTextColor(TEXT);
        button.setTextSize(15);
        button.setTypeface(Typeface.DEFAULT_BOLD);
        button.setMinHeight(dp(54));
        button.setBackground(shape(color, BLUE, 14));
        button.setElevation(dp(2));
        return button;
    }

    private void setStatus(String message) {
        if (statusLine != null) statusLine.setText(message);
    }

    private <T> void execute(String working, Callable<T> task, Consumer<T> onSuccess) {
        setStatus(working);
        worker.execute(() -> {
            try {
                T result = task.call();
                main.post(() -> {
                    if (!isFinishing() && !isDestroyed()) onSuccess.accept(result);
                });
            } catch (Exception ex) {
                main.post(() -> {
                    if (!isFinishing() && !isDestroyed()) setStatus(friendlyError(ex));
                });
            }
        });
    }

    private String friendlyError(Exception ex) {
        if (ex instanceof SecurityException || ex instanceof IllegalArgumentException) {
            return ex.getMessage() == null ? "Invalid TV settings" : ex.getMessage();
        }
        if (ex instanceof java.net.SocketTimeoutException) return "TV did not respond. Check Wi-Fi and power.";
        String message = ex.getMessage();
        if (message != null && message.startsWith("TV rejected")) return message;
        return "TV connection failed. Check its IP, pairing and Wi-Fi.";
    }

    private void showLoading() {
        base("Starting the secure local remote.");
    }

    private void showPair() {
        tv = null;
        challenge = null;
        base("A direct Wi-Fi remote for Vizio SmartCast. No Chromecast, no Danu, no cloud.");
        LinearLayout panel = group("Connect your Vizio");
        TextView explain = text("Phone and TV must be on the same home network. Find the TV address under Settings → Network → Network Information.", 13, SUB, false);
        explain.setPadding(0, 0, 0, dp(10));
        panel.addView(explain);

        final EditText ip = input("TV address (for example 192.168.1.50)", false);
        ip.setInputType(InputType.TYPE_CLASS_PHONE);
        panel.addView(ip);

        Button discover = action("Find nearby TVs", Color.rgb(28, 57, 88));
        panel.addView(discover);
        TextView hint = text("Find uses local network discovery for Cast-capable devices. Results can include non-Vizio devices; confirm the correct TV before pairing.", 12, SUB, false);
        hint.setPadding(0, dp(8), 0, dp(10));
        panel.addView(hint);
        LinearLayout discovered = new LinearLayout(this);
        discovered.setOrientation(LinearLayout.VERTICAL);
        panel.addView(discovered);
        discover.setOnClickListener(v -> {
            discovered.removeAllViews();
            discover.setEnabled(false);
            setStatus("Looking for nearby Cast-capable TVs for up to 12 seconds…");
            discovery.start(new TvDiscovery.Callback() {
                @Override public void onFound(String name, String address) {
                    Button choice = action(name + "  ·  " + address, Color.rgb(22, 48, 77));
                    LinearLayout.LayoutParams space = new LinearLayout.LayoutParams(-1, dp(53));
                    space.setMargins(0, dp(4), 0, 0);
                    discovered.addView(choice, space);
                    choice.setContentDescription("Select nearby device " + name + " at " + address);
                    choice.setOnClickListener(tap -> {
                        ip.setText(address);
                        setStatus("Selected " + name + ". Confirm this is your Vizio before pairing.");
                    });
                    setStatus("Found " + name + ". Tap to fill its address.");
                }
                @Override public void onFinished(int count) {
                    discover.setEnabled(true);
                    setStatus(count == 0 ? "No Cast devices found. Check Wi-Fi or enter TV IP manually." :
                        "Found " + count + " device(s). Select your Vizio and tap Start pairing.");
                }
                @Override public void onFailure(String reason) {
                    discover.setEnabled(true);
                    setStatus(reason);
                }
            });
        });

        Button start = action("Start pairing", Color.rgb(18, 84, 117));
        panel.addView(start);
        final LinearLayout pinPanel = new LinearLayout(this);
        pinPanel.setOrientation(LinearLayout.VERTICAL);
        pinPanel.setVisibility(View.GONE);
        TextView instruction = text("Enter the four-digit PIN now displayed on your TV.", 13, SUB, false);
        instruction.setPadding(0, dp(15), 0, dp(6));
        pinPanel.addView(instruction);
        EditText pinInput = input("4-digit TV PIN", true);
        pinInput.setFilters(new android.text.InputFilter[] { new android.text.InputFilter.LengthFilter(4) });
        pinPanel.addView(pinInput);
        Button finish = action("Pair and open remote", Color.rgb(14, 118, 125));
        pinPanel.addView(finish);
        panel.addView(pinPanel);

        start.setOnClickListener(v -> {
            discovery.stop();
            discover.setEnabled(true);
            String host = ip.getText().toString().trim();
            if (!SmartCastProtocol.isPrivateIp(host)) {
                setStatus("Enter the TV's private IPv4 address.");
                return;
            }
            execute("Requesting pairing PIN from the television…",
                () -> api.startPair(host, store.deviceId()), c -> {
                    challenge = c;
                    pinPanel.setVisibility(View.VISIBLE);
                    setStatus("Pairing request sent. Enter the code on the TV.");
                });
        });
        finish.setOnClickListener(v -> {
            if (challenge == null) { setStatus("Start pairing first"); return; }
            String digits = pinInput.getText().toString().trim();
            execute("Verifying your TV pairing PIN…", () -> {
                String token = api.finishPair(challenge, store.deviceId(), digits);
                store.save(challenge.host, challenge.fingerprint, token);
                return store.load();
            }, result -> {
                pinInput.setText("");
                showRemote(result);
                setStatus("Connected securely. Ready to control TV.");
            });
        });
        root.addView(text("1.0 RC1 · Pairing token encrypted in Android Keystore · No account required", 12, SUB, false));
    }

    private void showRemote(SecureStore.SavedTv savedTv) {
        tv = savedTv;
        base("Direct Vizio remote · " + savedTv.ip);
        execute("Checking paired TV…",
            () -> api.isPoweredOn(savedTv.ip, savedTv.token, savedTv.fingerprint),
            on -> setStatus(on ? "TV connected and ready." : "TV paired but in standby."));
        LinearLayout launch = group("Quick launch");
        Button stremio = action("▶  Open Stremio Web on TV", Color.rgb(15, 109, 124));
        stremio.setTextSize(18);
        launch.addView(stremio);
        stremio.setOnClickListener(v -> command("Opening Stremio Web…", () -> api.launchStremio(tv.ip, tv.token, tv.fingerprint), "Stremio Web launch sent"));

        LinearLayout pad = group("Gesture remote");
        TextView padHint = text("Swipe to move • Tap center to select • One command per gesture", 12, SUB, false);
        padHint.setPadding(0, 0, 0, dp(10));
        pad.addView(padHint);
        TouchpadView touch = new TouchpadView(this);
        touch.setOnRemoteAction(key ->
            command("Sending " + key + "…",
                () -> api.sendKey(tv.ip, tv.token, tv.fingerprint, key),
                key + " sent"));
        pad.addView(touch, new LinearLayout.LayoutParams(-1, dp(255)));

        LinearLayout remote = group("Remote control");
        addRemoteRow(remote, new String[] { "", "▲", "" }, new String[] { "", "UP", "" });
        addRemoteRow(remote, new String[] { "◀", "OK", "▶" }, new String[] { "LEFT", "OK", "RIGHT" });
        addRemoteRow(remote, new String[] { "", "▼", "" }, new String[] { "", "DOWN", "" });
        addRemoteRow(remote, new String[] { "Back", "Home", "Menu" }, new String[] { "BACK", "HOME", "MENU" });
        addRemoteRow(remote, new String[] { "Vol −", "Mute", "Vol +" }, new String[] { "VOL_DOWN", "MUTE", "VOL_UP" });
        addRemoteRow(remote, new String[] { "Input", "Pause", "Play" }, new String[] { "INPUT", "PAUSE", "PLAY" });

        LinearLayout search = group("Phone keyboard → TV search");
        TextView searchNote = text("First select the Search field on the TV, even if no TV keyboard appears. Type here using the phone keyboard or microphone, then tap Send. SmartCast ASCII entry is experimental inside Stremio Web.", 13, SUB, false);
        searchNote.setPadding(0, 0, 0, dp(12));
        search.addView(searchNote);
        EditText query = input("Type your search on the phone…", false);
        query.setFilters(new android.text.InputFilter[] { new android.text.InputFilter.LengthFilter(60) });
        query.setImeOptions(EditorInfo.IME_ACTION_SEND);
        search.addView(query);
        Button send = action("⌨  Send text to focused TV field", Color.rgb(44, 68, 104));
        search.addView(send);
        send.setOnClickListener(v -> sendText(query));
        query.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_SEND) { sendText(query); return true; }
            return false;
        });

        LinearLayout settings = group("Connection & privacy");
        Button check = action("Check TV connection", Color.rgb(27, 49, 83));
        settings.addView(check);
        check.setOnClickListener(v -> execute("Checking TV connection…",
            () -> api.isPoweredOn(tv.ip, tv.token, tv.fingerprint),
            on -> setStatus(on ? "TV online and paired." : "TV reachable, currently in standby.")));
        Button forget = action("Forget this TV", Color.rgb(55, 45, 66));
        LinearLayout.LayoutParams forgetParams = new LinearLayout.LayoutParams(-1, dp(52));
        forgetParams.setMargins(0, dp(9), 0, 0);
        settings.addView(forget, forgetParams);
        forget.setOnClickListener(v -> new AlertDialog.Builder(this)
            .setTitle("Forget TV?")
            .setMessage("Remove the saved TV address, pairing token, and certificate identity from this phone. No change is made on the television.")
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Forget", (dialog, id) -> {
                store.forget();
                showPair();
                setStatus("Pairing removed from this phone.");
            }).show());

        TextView foot = text("Independent MAITV research preview. Not affiliated with Vizio or Stremio. No tracking, casting, server install, or firmware changes.", 12, SUB, false);
        foot.setPadding(dp(3), dp(6), dp(3), dp(8));
        root.addView(foot);
    }

    private void sendText(EditText field) {
        if (tv == null) return;
        String s = field.getText().toString();
        if (s.isEmpty()) { setStatus("Type a search phrase first."); return; }
        execute("Sending " + s.length() + " ASCII characters (content not logged)…",
            () -> {
                api.sendText(tv.ip, tv.token, tv.fingerprint, s);
                return true;
            }, ignored -> {
                setStatus("Text command sent. Check whether the TV's focused field accepted it.");
                ((InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE)).hideSoftInputFromWindow(field.getWindowToken(), 0);
            });
    }

    private interface NetworkAction { void run() throws Exception; }
    private void command(String working, NetworkAction operation, String success) {
        if (tv == null) { setStatus("Pair with the TV first"); return; }
        execute(working, () -> { operation.run(); return true; }, result -> setStatus(success));
    }

    private void addRemoteRow(LinearLayout container, String[] captions, String[] keys) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(-1, dp(66));
        rowParams.setMargins(0, dp(3), 0, dp(3));
        container.addView(row, rowParams);
        for (int i = 0; i < captions.length; i++) {
            LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, -1, 1f);
            p.setMargins(dp(3), 0, dp(3), 0);
            if (keys[i].isEmpty()) {
                row.addView(new View(this), p);
            } else {
                String key = keys[i];
                Button button = action(captions[i], key.equals("OK") ? Color.rgb(17, 118, 128) : Color.rgb(24, 46, 74));
                button.setTextSize(key.equals("OK") ? 20 : 15);
                button.setContentDescription(key.equals("UP") ? "Move up" : key.equals("DOWN") ? "Move down" : key.equals("LEFT") ? "Move left" : key.equals("RIGHT") ? "Move right" : key);
                row.addView(button, p);
                button.setOnClickListener(v -> {
                    v.performHapticFeedback(android.view.HapticFeedbackConstants.KEYBOARD_TAP);
                    command("Sending " + key + "…",
                        () -> api.sendKey(tv.ip, tv.token, tv.fingerprint, key),
                        key + " sent");
                });
            }
        }
    }
}
