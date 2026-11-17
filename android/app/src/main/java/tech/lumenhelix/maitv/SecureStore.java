package tech.lumenhelix.maitv;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.UUID;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/** App-private profile and Android Keystore encrypted SmartCast AUTH bearer token. */
final class SecureStore {
    static final class SavedTv {
        final String ip;
        final String fingerprint;
        final String token;
        SavedTv(String ip, String fingerprint, String token) {
            this.ip = ip; this.fingerprint = fingerprint; this.token = token;
        }
    }

    private static final String FILE_NAME = "maitv_secure_profile";
    private static final String KEY_ALIAS = "maitv_smartcast_v1";
    private final SharedPreferences prefs;

    SecureStore(Context context) {
        prefs = context.getSharedPreferences(FILE_NAME, Context.MODE_PRIVATE);
    }

    synchronized String deviceId() {
        String id = prefs.getString("device_id", null);
        if (id != null) return id;
        id = "maitv-android-" + UUID.randomUUID();
        if (!prefs.edit().putString("device_id", id).commit()) {
            throw new IllegalStateException("Could not save device identity");
        }
        return id;
    }

    private SecretKey key() throws Exception {
        KeyStore ks = KeyStore.getInstance("AndroidKeyStore");
        ks.load(null);
        KeyStore.Entry entry = ks.getEntry(KEY_ALIAS, null);
        if (entry instanceof KeyStore.SecretKeyEntry) return ((KeyStore.SecretKeyEntry) entry).getSecretKey();
        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder(KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setUserAuthenticationRequired(false)
            .setKeySize(256)
            .build());
        return generator.generateKey();
    }

    synchronized void save(String ip, String fingerprint, String token) throws Exception {
        if (!SmartCastProtocol.isPrivateIp(ip) || fingerprint == null || !fingerprint.matches("[0-9a-f]{64}")
                || token == null || token.length() < 4) {
            throw new IllegalArgumentException("Invalid trusted TV credentials");
        }
        Cipher aes = Cipher.getInstance("AES/GCM/NoPadding");
        aes.init(Cipher.ENCRYPT_MODE, key());
        byte[] ciphertext = aes.doFinal(token.getBytes(StandardCharsets.UTF_8));
        String iv = Base64.encodeToString(aes.getIV(), Base64.NO_WRAP);
        String encoded = Base64.encodeToString(ciphertext, Base64.NO_WRAP);
        if (!prefs.edit()
                .putString("tv_ip", ip)
                .putString("tv_cert_fingerprint", fingerprint)
                .putString("auth_iv", iv)
                .putString("auth_ciphertext", encoded)
                .commit()) {
            throw new IllegalStateException("Could not store paired TV");
        }
    }

    synchronized SavedTv load() throws Exception {
        String ip = prefs.getString("tv_ip", null);
        String fingerprint = prefs.getString("tv_cert_fingerprint", null);
        String cipherText = prefs.getString("auth_ciphertext", null);
        String iv = prefs.getString("auth_iv", null);
        if (ip == null || fingerprint == null || cipherText == null || iv == null) return null;
        if (!SmartCastProtocol.isPrivateIp(ip) || !fingerprint.matches("[0-9a-f]{64}")) {
            throw new SecurityException("Stored device profile is invalid");
        }
        Cipher aes = Cipher.getInstance("AES/GCM/NoPadding");
        aes.init(Cipher.DECRYPT_MODE, key(),
            new GCMParameterSpec(128, Base64.decode(iv, Base64.NO_WRAP)));
        String token = new String(aes.doFinal(Base64.decode(cipherText, Base64.NO_WRAP)), StandardCharsets.UTF_8);
        return new SavedTv(ip, fingerprint, token);
    }

    synchronized void forget() {
        prefs.edit()
            .remove("tv_ip").remove("tv_cert_fingerprint")
            .remove("auth_iv").remove("auth_ciphertext").commit();
    }
}
