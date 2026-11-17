package tech.lumenhelix.maitv;

import static org.junit.Assert.*;
import org.junit.Test;

public class SmartCastProtocolTest {
    @Test public void allowOnlyRoutablePrivateIpv4() {
        assertTrue(SmartCastProtocol.isPrivateIp("192.168.1.67"));
        assertTrue(SmartCastProtocol.isPrivateIp("10.2.3.4"));
        assertTrue(SmartCastProtocol.isPrivateIp("172.16.9.10"));
        assertTrue(SmartCastProtocol.isPrivateIp("172.31.255.42"));
        for (String ip : new String[] {
            null, "", "127.0.0.1", "8.8.8.8", "169.254.1.3",
            "172.32.0.1", "172.15.9.3", "192.168.1.0", "192.168.1.255",
            "192.168.999.1", "192.168.1.3:7345", "example.com", "0.0.0.0"
        }) {
            assertFalse(String.valueOf(ip), SmartCastProtocol.isPrivateIp(ip));
        }
    }

    @Test public void remoteMappingsAgreeWithDocumentedCodesets() {
        SmartCastProtocol.Key up = SmartCastProtocol.keyFor("UP");
        assertEquals(3, up.codeSet);
        assertEquals(8, up.code);
        assertEquals(3, SmartCastProtocol.keyFor("OK").codeSet);
        assertEquals(2, SmartCastProtocol.keyFor("OK").code);
        assertEquals(4, SmartCastProtocol.keyFor("BACK").codeSet);
        assertEquals(0, SmartCastProtocol.keyFor("BACK").code);
        assertEquals(5, SmartCastProtocol.keyFor("VOL_UP").codeSet);
        assertEquals(1, SmartCastProtocol.keyFor("VOL_UP").code);
        try {
            SmartCastProtocol.keyFor("RESET_TV");
            fail("Arbitrary commands must never be accepted");
        } catch (IllegalArgumentException expected) { }
    }

    @Test public void acceptOnlyBoundedAsciiSearchText() {
        assertTrue(SmartCastProtocol.isAsciiSearchText("Studio Ghibli"));
        assertTrue(SmartCastProtocol.isAsciiSearchText("12345 A-Z 4K"));
        assertFalse(SmartCastProtocol.isAsciiSearchText(""));
        assertFalse(SmartCastProtocol.isAsciiSearchText(null));
        assertFalse(SmartCastProtocol.isAsciiSearchText("café"));
        assertFalse(SmartCastProtocol.isAsciiSearchText("a\nb"));
        assertFalse(SmartCastProtocol.isAsciiSearchText("x".repeat(61)));
        assertTrue(SmartCastProtocol.isAsciiSearchText("x".repeat(60)));
    }

    @Test public void stremioLaunchTargetIsFixed() {
        assertEquals("https://web.stremio.com/", SmartCastProtocol.STREMIO_WEB);
    }
}
