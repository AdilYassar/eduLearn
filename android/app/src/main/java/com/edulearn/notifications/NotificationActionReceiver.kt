package com.edulearn.notifications

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast

class NotificationActionReceiver : BroadcastReceiver() {
    
    companion object {
        const val ACTION_COPY_OTP = "com.edulearn.ACTION_COPY_OTP"
        const val ACTION_OPEN_LINK = "com.edulearn.ACTION_OPEN_LINK"
        const val EXTRA_OTP = "otp"
        const val EXTRA_LINK = "link"
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return

        when (intent.action) {
            ACTION_COPY_OTP -> {
                val otp = intent.getStringExtra(EXTRA_OTP)
                if (!otp.isNullOrEmpty()) {
                    copyToClipboard(context, otp)
                    Toast.makeText(context, "OTP copied to clipboard", Toast.LENGTH_SHORT).show()
                }
            }
            ACTION_OPEN_LINK -> {
                val link = intent.getStringExtra(EXTRA_LINK)
                if (!link.isNullOrEmpty()) {
                    openLink(context, link)
                }
            }
        }
    }

    private fun copyToClipboard(context: Context, text: String) {
        try {
            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("OTP", text)
            clipboard.setPrimaryClip(clip)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun openLink(context: Context, url: String) {
        try {
            var urlToOpen = url
            if (!urlToOpen.startsWith("http://") && !urlToOpen.startsWith("https://")) {
                urlToOpen = "https://$urlToOpen"
            }

            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(urlToOpen))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "Cannot open link", Toast.LENGTH_SHORT).show()
        }
    }
}
