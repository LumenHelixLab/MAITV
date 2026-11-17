package tech.lumenhelix.maitv;

import static org.junit.Assert.*;
import org.junit.Test;

public class GestureMathTest {
    @Test public void swipesMapToPhysicalDpadActions() {
        assertEquals("RIGHT", GestureMath.direction(120, 10, 26));
        assertEquals("LEFT", GestureMath.direction(-120, 10, 26));
        assertEquals("UP", GestureMath.direction(10, -100, 26));
        assertEquals("DOWN", GestureMath.direction(10, 100, 26));
        assertEquals("UP", GestureMath.direction(-20, -40, 26));
    }

    @Test public void smallMovementsBecomeOkNotAccidentalDpad() {
        assertEquals("OK", GestureMath.direction(1, 0, 26));
        assertEquals("OK", GestureMath.direction(25, 25, 26));
        assertEquals("OK", GestureMath.direction(0, 0, 26));
        assertEquals("RIGHT", GestureMath.direction(26, 2, 26));
    }

    @Test public void invalidThresholdOrCoordinatesAreRejected() {
        try {
            GestureMath.direction(5, 5, 0);
            fail("Threshold must be positive");
        } catch (IllegalArgumentException expected) {}
        try {
            GestureMath.direction(Float.NaN, 5, 26);
            fail("NaN must be rejected");
        } catch (IllegalArgumentException expected) {}
    }
}
