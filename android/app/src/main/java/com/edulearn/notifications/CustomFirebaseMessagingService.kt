package com.edulearn.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import android.os.Bundle
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.edulearn.MainActivity
import kotlin.random.Random

class CustomFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // Get notification data
        val title = remoteMessage.notification?.title ?: "EduLearn"
        val body = remoteMessage.notification?.body ?: ""
        val data = remoteMessage.data

        // Analyze notification content for OTP and links
        val content = NotificationContentAnalyzer.analyzeNotificationContent(body)

        // Send notification with actions
        sendNotificationWithActions(title, body, content, data)
    }

    private fun sendNotificationWithActions(
        title: String,
        body: String,
        content: NotificationContent,
        data: Map<String, String>
    ) {
        val notificationId = Random.nextInt(1000, 9999)
        val channelId = "edulearn_notifications"

        // Create notification channel for Android 8+
        createNotificationChannel(channelId)

        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
            .setPriority(NotificationCompat.PRIORITY_HIGH)

        // Add Copy OTP action
        if (content.hasOTP && content.otp != null) {
            val copyOTPIntent = Intent(this, NotificationActionReceiver::class.java).apply {
                action = NotificationActionReceiver.ACTION_COPY_OTP
                putExtra(NotificationActionReceiver.EXTRA_OTP, content.otp)
            }

            val copyOTPPendingIntent = PendingIntent.getBroadcast(
                this,
                notificationId + 1,
                copyOTPIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            notificationBuilder.addAction(
                android.R.drawable.ic_menu_save,
                "Copy OTP",
                copyOTPPendingIntent
            )
        }

        // Add Open Link actions (up to 2 links)
        content.links.take(2).forEachIndexed { index, link ->
            val linkIntent = Intent(this, NotificationActionReceiver::class.java).apply {
                action = NotificationActionReceiver.ACTION_OPEN_LINK
                putExtra(NotificationActionReceiver.EXTRA_LINK, link)
            }

            val linkPendingIntent = PendingIntent.getBroadcast(
                this,
                notificationId + 10 + index,
                linkIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            notificationBuilder.addAction(
                android.R.drawable.ic_menu_view,
                "Open Link",
                linkPendingIntent
            )
        }

        // Create main tap intent
        val mainIntent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            // Convert Map to Bundle
            val bundle = Bundle().apply {
                for ((key, value) in data) {
                    putString(key, value)
                }
            }
            putExtras(bundle)
        }

        val mainPendingIntent = PendingIntent.getActivity(
            this,
            notificationId,
            mainIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        notificationBuilder.setContentIntent(mainPendingIntent)

        // Send notification
        NotificationManagerCompat.from(this).notify(notificationId, notificationBuilder.build())
    }

    private fun createNotificationChannel(channelId: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "EduLearn Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications from EduLearn"
                enableVibration(true)
                enableLights(true)
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Send token to backend
        sendTokenToServer(token)
    }

    private fun sendTokenToServer(token: String) {
        // Implement token sending to backend
        // This is typically handled by React Native Firebase module
    }

    companion object {
        private const val TAG = "CustomFCM"
        private const val CHANNEL_ID = "edulearn_notifications"
    }
}
