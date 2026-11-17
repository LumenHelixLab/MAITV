package tech.lumenhelix.maitv;

import android.content.Context;
import android.net.nsd.NsdManager;
import android.net.nsd.NsdServiceInfo;
import android.os.Handler;
import android.os.Looper;

import java.net.InetAddress;
import java.util.ArrayDeque;
import java.util.HashSet;
import java.util.Set;

/**
 * An opt-in, time-limited mDNS search for nearby Chromecast-capable devices.
 * A Cast service alone does NOT prove SmartCast compatibility; users must
 * confirm the correct TV before pairing. No TCP subnet scans are performed.
 */
@SuppressWarnings("deprecation")
final class TvDiscovery {
    interface Callback {
        void onFound(String name, String ip);
        void onFinished(int count);
        void onFailure(String message);
    }

    private final NsdManager nsd;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private final ArrayDeque<NsdServiceInfo> queue = new ArrayDeque<>();
    private final Set<String> seen = new HashSet<>();

    private NsdManager.DiscoveryListener discovery;
    private Callback callback;
    private Runnable timeout;
    private boolean active;
    private boolean resolving;
    private int count;

    TvDiscovery(Context context) {
        nsd = (NsdManager) context.getSystemService(Context.NSD_SERVICE);
    }

    void start(Callback next) {
        stop();
        callback = next;
        if (nsd == null) {
            next.onFailure("Android discovery is unavailable. Enter TV address manually.");
            return;
        }
        active = true;
        timeout = this::finish;
        ui.postDelayed(timeout, 12000);
        discovery = new NsdManager.DiscoveryListener() {
            @Override public void onDiscoveryStarted(String type) {}
            @Override public void onStartDiscoveryFailed(String type, int code) {
                ui.post(() -> fail("TV discovery unavailable. Use manual IP entry."));
            }
            @Override public void onServiceFound(NsdServiceInfo item) {
                ui.post(() -> {
                    if (!active || queue.size() > 24) return;
                    // Another Cast device may be reported: do not assume Vizio identity.
                    if (item.getServiceName() == null || item.getServiceName().isEmpty()) return;
                    queue.add(item);
                    resolveNext();
                });
            }
            @Override public void onServiceLost(NsdServiceInfo item) {}
            @Override public void onDiscoveryStopped(String type) {}
            @Override public void onStopDiscoveryFailed(String type, int code) {}
        };
        try {
            nsd.discoverServices("_googlecast._tcp.", NsdManager.PROTOCOL_DNS_SD, discovery);
        } catch (RuntimeException error) {
            fail("TV discovery cannot start on this network. Enter the address manually.");
        }
    }

    private void resolveNext() {
        if (!active || resolving || queue.isEmpty()) return;
        final NsdServiceInfo item = queue.remove();
        resolving = true;
        try {
            nsd.resolveService(item, new NsdManager.ResolveListener() {
                @Override public void onServiceResolved(NsdServiceInfo resolved) {
                    ui.post(() -> {
                        resolving = false;
                        if (active) {
                            InetAddress addr = resolved.getHost();
                            String ip = addr == null ? "" : addr.getHostAddress();
                            if (SmartCastProtocol.isPrivateIp(ip) && seen.add(ip)) {
                                count++;
                                callback.onFound(resolved.getServiceName(), ip);
                            }
                            resolveNext();
                        }
                    });
                }
                @Override public void onResolveFailed(NsdServiceInfo unresolved, int errorCode) {
                    ui.post(() -> { resolving = false; if (active) resolveNext(); });
                }
            });
        } catch (RuntimeException error) {
            resolving = false;
            ui.post(this::resolveNext);
        }
    }

    private void fail(String message) {
        if (!active) return;
        Callback notify = callback;
        stop();
        if (notify != null) notify.onFailure(message);
    }

    private void finish() {
        if (!active) return;
        Callback notify = callback;
        int total = count;
        stop();
        if (notify != null) notify.onFinished(total);
    }

    void stop() {
        active = false;
        if (timeout != null) ui.removeCallbacks(timeout);
        if (nsd != null && discovery != null) {
            try { nsd.stopServiceDiscovery(discovery); } catch (RuntimeException ignored) {}
        }
        discovery = null;
        callback = null;
        queue.clear();
        seen.clear();
        resolving = false;
        count = 0;
    }
}
