package tech.lumenhelix.maitv;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Locale;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

/**
 * Device-scoped SmartCast local HTTPS client, no cloud or Chromecast dependency.
 * Never logs bearer credentials or streams; only allowlisted paths are callable.
 */
final class SmartCastProtocol {
    static final String STREMIO_WEB = "https://web.stremio.com/";
    static final int SMARTCAST_PORT = 7345;

    static final class Challenge {
        final String host;
        final long requestToken;
        final int type;
        final String fingerprint;
        Challenge(String host, long token, int type, String fp) {
            this.host = host; this.requestToken = token; this.type = type; this.fingerprint = fp;
        }
    }

    static final class Reply {
        final JSONObject data;
        final String fingerprint;
        Reply(JSONObject data, String fingerprint) {
            this.data = data; this.fingerprint = fingerprint;
        }
    }

    static final class Key {
        final int codeSet;
        final int code;
        Key(int s, int c) { codeSet = s; code = c; }
    }

    static boolean isPrivateIp(String ip) {
        if (ip == null || !ip.matches("\\d{1,3}(\\.\\d{1,3}){3}")) return false;
        String[] raw = ip.split("\\.");
        int[] octets = new int[4];
        for (int i = 0; i < 4; i++) {
            try {
                octets[i] = Integer.parseInt(raw[i]);
            } catch (NumberFormatException e) {
                return false;
            }
            if (octets[i] < 0 || octets[i] > 255) return false;
        }
        if (octets[3] == 0 || octets[3] == 255) return false;
        return octets[0] == 10 ||
            (octets[0] == 172 && octets[1] >= 16 && octets[1] <= 31) ||
            (octets[0] == 192 && octets[1] == 168);
    }

    static Key keyFor(String name) {
        switch (name) {
            case "UP": return new Key(3, 8);
            case "DOWN": return new Key(3, 0);
            case "LEFT": return new Key(3, 1);
            case "RIGHT": return new Key(3, 7);
            case "OK": return new Key(3, 2);
            case "BACK": return new Key(4, 0);
            case "HOME": return new Key(4, 3);
            case "MENU": return new Key(4, 8); // Legacy ViziOS mapping; 1.8+ may differ
            case "VOL_UP": return new Key(5, 1);
            case "VOL_DOWN": return new Key(5, 0);
            case "MUTE": return new Key(5, 4);
            case "PLAY": return new Key(2, 3);
            case "PAUSE": return new Key(2, 2);
            case "INPUT": return new Key(7, 1);
            default: throw new IllegalArgumentException("Unsupported remote key");
        }
    }

    static String fingerprint(X509Certificate cert) throws CertificateException {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(cert.getEncoded());
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format(Locale.US, "%02x", b & 0xff));
            return sb.toString();
        } catch (Exception ex) {
            throw new CertificateException("Unable to verify TV certificate");
        }
    }

    private static final class ScopedTrust implements X509TrustManager {
        final String expected;
        String observed;
        ScopedTrust(String expected) { this.expected = expected; }
        @Override public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
            throw new CertificateException("Client certificate not accepted");
        }
        @Override public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
            if (chain == null || chain.length == 0) throw new CertificateException("Missing TV certificate");
            String got = fingerprint(chain[0]);
            if (expected != null && !expected.equals(got)) throw new CertificateException("TV identity has changed. Re-pair after checking the device.");
            observed = got;
        }
        @Override public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
    }

    private Reply request(String host, String path, JSONObject body, String token, String expectedCertificate) throws Exception {
        if (!isPrivateIp(host)) throw new IllegalArgumentException("Enter your TV's private Wi-Fi IPv4 address");
        if (!(path.equals("/pairing/start") || path.equals("/pairing/pair") ||
              path.equals("/key_command/") || path.equals("/app/launch") ||
              path.equals("/state/device/power_mode") || path.equals("/app/current"))) {
            throw new SecurityException("Unsupported endpoint");
        }
        final boolean pairing = path.startsWith("/pairing/");
        if (!pairing && (token == null || token.isEmpty() || expectedCertificate == null)) {
            throw new SecurityException("Pair with the television first");
        }
        InetAddress address = InetAddress.getByName(host);
        if (!(address instanceof Inet4Address) || !isPrivateIp(address.getHostAddress())) {
            throw new SecurityException("Only local IPv4 televisions are supported");
        }
        ScopedTrust trust = new ScopedTrust(expectedCertificate);
        SSLContext context = SSLContext.getInstance("TLS");
        context.init(null, new TrustManager[] { trust }, new SecureRandom());

        URL url = new URL("https://" + host + ":" + SMARTCAST_PORT + path);
        HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
        conn.setSSLSocketFactory(context.getSocketFactory());
        // Pin the device certificate independently; never relax verification globally.
        conn.setHostnameVerifier((hostname, session) -> hostname.equals(host));
        conn.setConnectTimeout(6500);
        conn.setReadTimeout(7000);
        conn.setUseCaches(false);
        conn.setInstanceFollowRedirects(false);
        conn.setRequestProperty("Accept", "application/json");
        conn.setRequestProperty("Content-Type", "application/json");
        if (!pairing) conn.setRequestProperty("AUTH", token);
        try {
            if (body != null) {
                conn.setRequestMethod("PUT");
                conn.setDoOutput(true);
                byte[] raw = body.toString().getBytes(StandardCharsets.UTF_8);
                if (raw.length > 8192) throw new IllegalArgumentException("Request too large");
                conn.setFixedLengthStreamingMode(raw.length);
                try (OutputStream out = conn.getOutputStream()) { out.write(raw); }
            } else {
                conn.setRequestMethod("GET");
            }
            int code = conn.getResponseCode();
            if (code < 200 || code > 299) throw new IllegalStateException("TV rejected the operation (HTTP " + code + ")");
            byte[] bytes;
            try (InputStream in = conn.getInputStream()) { bytes = readLimited(in); }
            JSONObject json = new JSONObject(new String(bytes, StandardCharsets.UTF_8));
            JSONObject status = json.optJSONObject("STATUS");
            if (status != null && !"SUCCESS".equalsIgnoreCase(status.optString("RESULT", "SUCCESS"))) {
                throw new IllegalStateException("TV rejected the operation: " + safeStatus(status.optString("RESULT")));
            }
            if (trust.observed == null) throw new SecurityException("TV identity could not be verified");
            return new Reply(json, trust.observed);
        } finally {
            conn.disconnect();
        }
    }

    private static byte[] readLimited(InputStream in) throws Exception {
        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
        byte[] buffer = new byte[2048];
        for (int n; (n = in.read(buffer)) != -1;) {
            if (out.size() + n > 65536) throw new IllegalStateException("Oversized TV response");
            out.write(buffer, 0, n);
        }
        return out.toByteArray();
    }

    private static String safeStatus(String raw) {
        return raw != null && raw.matches("[A-Z_]{2,48}") ? raw : "UNKNOWN";
    }

    Challenge startPair(String host, String deviceId) throws Exception {
        JSONObject body = new JSONObject()
            .put("DEVICE_NAME", "MAITV Android Remote")
            .put("DEVICE_ID", deviceId);
        Reply reply = request(host, "/pairing/start", body, null, null);
        JSONObject item = reply.data.optJSONObject("ITEM");
        if (item == null || !item.has("PAIRING_REQ_TOKEN")) throw new IllegalStateException("TV did not start pairing");
        return new Challenge(host, item.getLong("PAIRING_REQ_TOKEN"), item.optInt("CHALLENGE_TYPE", 1), reply.fingerprint);
    }

    String finishPair(Challenge challenge, String deviceId, String pin) throws Exception {
        if (pin == null || !pin.matches("\\d{4}")) throw new IllegalArgumentException("Enter the four-digit TV PIN");
        JSONObject body = new JSONObject()
            .put("DEVICE_NAME", "MAITV Android Remote")
            .put("DEVICE_ID", deviceId)
            .put("CHALLENGE_TYPE", challenge.type)
            .put("PAIRING_REQ_TOKEN", challenge.requestToken)
            .put("RESPONSE_VALUE", pin);
        Reply reply = request(challenge.host, "/pairing/pair", body, null, challenge.fingerprint);
        JSONObject item = reply.data.optJSONObject("ITEM");
        String token = item == null ? "" : item.optString("AUTH_TOKEN");
        if (token.length() < 4) throw new IllegalStateException("TV did not authorize pairing");
        return token;
    }

    void launchStremio(String host, String token, String certPin) throws Exception {
        JSONObject value = new JSONObject()
            .put("NAME_SPACE", 4)
            .put("APP_ID", "17")
            .put("MESSAGE", STREMIO_WEB);
        request(host, "/app/launch", new JSONObject().put("VALUE", value), token, certPin);
    }

    void sendKey(String host, String token, String certPin, String name) throws Exception {
        Key key = keyFor(name);
        JSONArray list = new JSONArray().put(new JSONObject()
            .put("CODESET", key.codeSet).put("CODE", key.code).put("ACTION", "KEYPRESS"));
        request(host, "/key_command/", new JSONObject().put("KEYLIST", list), token, certPin);
    }

    static boolean isAsciiSearchText(String text) {
        if (text == null || text.isEmpty() || text.length() > 60) return false;
        for (int i = 0; i < text.length(); i++) {
            int cp = text.charAt(i);
            if (cp < 32 || cp > 126) return false;
        }
        return true;
    }

    void sendText(String host, String token, String certPin, String text) throws Exception {
        if (!isAsciiSearchText(text)) throw new IllegalArgumentException("Enter 1–60 ASCII characters");
        JSONArray list = new JSONArray();
        for (int i = 0; i < text.length(); i++) {
            int cp = text.charAt(i);
            if (cp < 32 || cp > 126) throw new IllegalArgumentException("Only ASCII text is supported by SmartCast");
            list.put(new JSONObject().put("CODESET", 0).put("CODE", cp).put("ACTION", "KEYPRESS"));
        }
        request(host, "/key_command/", new JSONObject().put("KEYLIST", list), token, certPin);
    }

    boolean isPoweredOn(String host, String token, String certPin) throws Exception {
        Reply r = request(host, "/state/device/power_mode", null, token, certPin);
        JSONArray items = r.data.optJSONArray("ITEMS");
        if (items == null || items.length() == 0) throw new IllegalStateException("Power state unavailable");
        return items.getJSONObject(0).optInt("VALUE", -1) == 1;
    }
}
