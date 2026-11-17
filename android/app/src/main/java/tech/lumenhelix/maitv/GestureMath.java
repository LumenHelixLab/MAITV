package tech.lumenhelix.maitv;

/** Stateless gesture classifier shared by Android touchpad and JVM unit tests. */
final class GestureMath {
    private GestureMath() {}

    static String direction(float dx, float dy, float minimumDistance) {
        if (minimumDistance <= 0 || Float.isNaN(dx) || Float.isNaN(dy)) {
            throw new IllegalArgumentException("Invalid gesture coordinates");
        }
        if (Math.max(Math.abs(dx), Math.abs(dy)) < minimumDistance) return "OK";
        if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? "RIGHT" : "LEFT";
        return dy > 0 ? "DOWN" : "UP";
    }
}
