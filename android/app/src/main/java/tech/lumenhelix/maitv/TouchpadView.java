package tech.lumenhelix.maitv;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.view.HapticFeedbackConstants;
import android.view.MotionEvent;
import android.view.View;

import java.util.function.Consumer;

/**
 * A low-latency remote-style gesture pad: swipe once for one D-pad press,
 * tap for OK. No accessibility service, screen capture or extra permission.
 */
final class TouchpadView extends View {
    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final RectF rect = new RectF();
    private Consumer<String> action;
    private float startX, startY;
    private boolean tracking;

    public TouchpadView(Context ctx) {
        super(ctx);
        init();
    }
    public TouchpadView(Context ctx, android.util.AttributeSet attrs) {
        super(ctx, attrs);
        init();
    }
    void setOnRemoteAction(Consumer<String> next) { this.action = next; }
    private void init() {
        setClickable(true);
        setFocusable(true);
        setContentDescription("TV touchpad: swipe to navigate, tap to select. Buttons below offer the same actions.");
    }

    private float dp(float px) { return px * getResources().getDisplayMetrics().density; }

    @Override protected void onDraw(Canvas c) {
        super.onDraw(c);
        float w = getWidth(), h = getHeight();
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(Color.rgb(9, 24, 47));
        rect.set(dp(2), dp(2), w-dp(2), h-dp(2));
        c.drawRoundRect(rect, dp(23), dp(23), paint);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(dp(1.5f));
        paint.setColor(Color.rgb(34, 93, 128));
        c.drawRoundRect(rect, dp(23), dp(23), paint);

        float cx = w/2f, cy = h/2f, ring = Math.min(w, h) * .29f;
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(dp(2));
        paint.setColor(Color.rgb(40, 104, 140));
        c.drawCircle(cx, cy, ring, paint);
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(Color.rgb(16, 63, 82));
        c.drawCircle(cx, cy, Math.min(w,h) *.142f, paint);
        paint.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        paint.setTextAlign(Paint.Align.CENTER);
        paint.setTextSize(dp(20));
        paint.setColor(Color.rgb(217, 253, 255));
        c.drawText("OK", cx, cy + dp(7), paint);

        paint.setTextSize(dp(25));
        paint.setColor(Color.rgb(61, 221, 239));
        c.drawText("▲", cx, cy - ring - dp(8), paint);
        c.drawText("▼", cx, cy + ring + dp(19), paint);
        c.drawText("◀", cx - ring - dp(21), cy + dp(9), paint);
        c.drawText("▶", cx + ring + dp(21), cy + dp(9), paint);
    }

    @Override public boolean onTouchEvent(MotionEvent event) {
        switch (event.getActionMasked()) {
            case MotionEvent.ACTION_DOWN:
                startX = event.getX();
                startY = event.getY();
                tracking = true;
                return true;
            case MotionEvent.ACTION_UP:
                if (!tracking) return false;
                tracking = false;
                String key = GestureMath.direction(event.getX()-startX, event.getY()-startY, dp(26));
                if ("OK".equals(key)) return performClick();
                performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);
                if (action != null) action.accept(key);
                return true;
            case MotionEvent.ACTION_CANCEL:
                tracking = false;
                return true;
            default:
                return tracking;
        }
    }

    @Override public boolean performClick() {
        super.performClick();
        performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);
        if (action != null) action.accept("OK");
        return true;
    }
}
