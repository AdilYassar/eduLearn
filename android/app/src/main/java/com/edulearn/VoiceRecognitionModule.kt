package com.edulearn

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class VoiceRecognitionModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var speechRecognizer: SpeechRecognizer? = null
  private var isListening = false
  private val recognitionListener = VoiceRecognitionListener()

  inner class VoiceRecognitionListener : RecognitionListener {
    override fun onReadyForSpeech(params: Bundle) {
      sendEvent("onSpeechStart", null)
    }

    override fun onBeginningOfSpeech() {
      sendEvent("onBeginningOfSpeech", null)
    }

    override fun onRmsChanged(rmsdB: Float) {
      val map = Arguments.createMap()
      map.putDouble("value", rmsdB.toDouble())
      sendEvent("onSpeechVolumeChanged", map)
    }

    override fun onBufferReceived(buffer: ByteArray) {
      sendEvent("onBufferReceived", null)
    }

    override fun onEndOfSpeech() {
      sendEvent("onEndOfSpeech", null)
    }

    override fun onError(error: Int) {
      val errorMessage = when (error) {
        SpeechRecognizer.ERROR_AUDIO -> "Audio error"
        SpeechRecognizer.ERROR_CLIENT -> "Client side error"
        SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions"
        SpeechRecognizer.ERROR_NETWORK -> "Network error"
        SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
        SpeechRecognizer.ERROR_NO_MATCH -> "No match found"
        SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognizer busy"
        SpeechRecognizer.ERROR_SERVER -> "Server error"
        SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "Speech timeout"
        else -> "Unknown error"
      }
      val map = Arguments.createMap()
      map.putInt("code", error)
      map.putString("message", errorMessage)
      sendEvent("onSpeechError", map)
    }

    override fun onResults(results: Bundle) {
      val matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
      if (matches != null && matches.isNotEmpty()) {
        val map = Arguments.createMap()
        val resultArray = Arguments.createArray()
        for (match in matches) {
          resultArray.pushString(match)
        }
        map.putArray("results", resultArray)
        map.putString("value", matches[0])
        sendEvent("onSpeechResults", map)
      }
      isListening = false
      sendEvent("onSpeechEnd", null)
    }

    override fun onPartialResults(partialResults: Bundle) {
      val matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
      if (matches != null && matches.isNotEmpty()) {
        val map = Arguments.createMap()
        map.putString("value", matches[0])
        sendEvent("onSpeechPartialResults", map)
      }
    }

    override fun onEvent(eventType: Int, params: Bundle) {
      sendEvent("onEvent", null)
    }
  }

  override fun getName(): String {
    return "VoiceRecognition"
  }

  @ReactMethod
  fun isAvailable(promise: Promise) {
    try {
      val available = SpeechRecognizer.isRecognitionAvailable(reactApplicationContext)
      promise.resolve(available)
    } catch (e: Exception) {
      promise.reject("ERR_VOICE_RECOGNITION", e.message)
    }
  }

  @ReactMethod
  fun startListening(locale: String?, promise: Promise) {
    reactApplicationContext.runOnUiQueueThread {
      try {
        if (isListening) {
          promise.reject("ERR_VOICE_ALREADY_LISTENING", "Already listening")
          return@runOnUiQueueThread
        }

        if (speechRecognizer == null) {
          speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactApplicationContext)
          speechRecognizer?.setRecognitionListener(recognitionListener)
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
        intent.putExtra(
          RecognizerIntent.EXTRA_LANGUAGE_MODEL,
          RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
        )
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale ?: "en-US")
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)

        isListening = true
        speechRecognizer?.startListening(intent)
        promise.resolve(true)
      } catch (e: Exception) {
        isListening = false
        promise.reject("ERR_VOICE_RECOGNITION", e.message)
      }
    }
  }

  @ReactMethod
  fun stopListening(promise: Promise) {
    reactApplicationContext.runOnUiQueueThread {
      try {
        if (speechRecognizer != null && isListening) {
          speechRecognizer?.stopListening()
          isListening = false
        }
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("ERR_VOICE_RECOGNITION", e.message)
      }
    }
  }

  @ReactMethod
  fun cancelListening(promise: Promise) {
    reactApplicationContext.runOnUiQueueThread {
      try {
        if (speechRecognizer != null) {
          speechRecognizer?.cancel()
          isListening = false
        }
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("ERR_VOICE_RECOGNITION", e.message)
      }
    }
  }

  @ReactMethod
  fun destroyRecognizer(promise: Promise) {
    reactApplicationContext.runOnUiQueueThread {
      try {
        if (speechRecognizer != null) {
          speechRecognizer?.destroy()
          speechRecognizer = null
          isListening = false
        }
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("ERR_VOICE_RECOGNITION", e.message)
      }
    }
  }

  private fun sendEvent(eventName: String, params: WritableMap?) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }
}
