package com.edulearn.notifications

import android.content.Context
import android.text.TextUtils
import java.util.regex.Pattern

object NotificationContentAnalyzer {
    /**
     * Detects OTP pattern in text (4-6 digit codes)
     */
    fun extractOTP(text: String?): String? {
        if (text.isNullOrEmpty()) return null

        val patterns = listOf(
            "\\b(\\d{6})\\b",           // 6 digits
            "\\b(\\d{4})\\b",           // 4 digits
            "\\b(\\d{3})-(\\d{3})\\b",  // 3-3 digits
            "\\b(\\d{3})-(\\d{4})\\b"   // 3-4 digits
        )

        for (patternStr in patterns) {
            val pattern = Pattern.compile(patternStr)
            val matcher = pattern.matcher(text)
            if (matcher.find()) {
                var otp = matcher.group(0)?.replace(Regex("[\\s-]"), "") ?: continue
                if (otp.matches(Regex("^\\d{4,6}$"))) {
                    return otp
                }
            }
        }

        return null
    }

    /**
     * Detects URLs/links in text
     */
    fun extractLinks(text: String?): List<String> {
        if (text.isNullOrEmpty()) return emptyList()

        val links = mutableListOf<String>()
        val urls = mutableSetOf<String>()

        // Pattern for URLs starting with http:// or https://
        val httpPattern = Pattern.compile("https?://[^\\s]+")
        var matcher = httpPattern.matcher(text)
        while (matcher.find()) {
            var url = matcher.group(0)?.trim() ?: continue
            if (url.endsWith(".") || url.endsWith(",") || url.endsWith(";")) {
                url = url.dropLast(1)
            }
            if (urls.add(url)) {
                links.add(url)
            }
        }

        // Pattern for www.
        val wwwPattern = Pattern.compile("www\\.[^\\s]+")
        matcher = wwwPattern.matcher(text)
        while (matcher.find()) {
            var url = "https://" + (matcher.group(0)?.trim() ?: continue)
            if (url.endsWith(".") || url.endsWith(",") || url.endsWith(";")) {
                url = url.dropLast(1)
            }
            if (urls.add(url)) {
                links.add(url)
            }
        }

        return links
    }

    /**
     * Analyzes notification content
     */
    fun analyzeNotificationContent(text: String?): NotificationContent {
        val otp = extractOTP(text)
        val links = extractLinks(text)

        return NotificationContent(
            hasOTP = otp != null,
            otp = otp,
            hasLinks = links.isNotEmpty(),
            links = links
        )
    }
}

data class NotificationContent(
    val hasOTP: Boolean = false,
    val otp: String? = null,
    val hasLinks: Boolean = false,
    val links: List<String> = emptyList()
)
