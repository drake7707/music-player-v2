package com.drake7707.musicplayerv2.data.api

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    private var baseUrl: String = "http://localhost:5000/"
    private var retrofit: Retrofit? = null
    private var apiService: ApiService? = null

    fun configure(url: String) {
        val normalizedUrl = if (url.endsWith("/")) url else "$url/"
        if (normalizedUrl != baseUrl) {
            baseUrl = normalizedUrl
            retrofit = null
            apiService = null
        }
    }

    fun getBaseUrl(): String = baseUrl

    private fun getRetrofit(): Retrofit {
        if (retrofit == null) {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BASIC
            }
            val client = OkHttpClient.Builder()
                .addInterceptor(logging)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build()

            val gson = GsonBuilder()
                .setLenient()
                .create()

            retrofit = Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build()
        }
        return retrofit!!
    }

    fun getApiService(): ApiService {
        if (apiService == null) {
            apiService = getRetrofit().create(ApiService::class.java)
        }
        return apiService!!
    }

    fun loadFromPreferences(context: Context) {
        val prefs: SharedPreferences = context.getSharedPreferences("music_player_prefs", Context.MODE_PRIVATE)
        val url = prefs.getString("server_url", "http://192.168.1.1:5000") ?: "http://192.168.1.1:5000"
        configure(url)
    }

    fun saveToPreferences(context: Context, url: String) {
        val prefs: SharedPreferences = context.getSharedPreferences("music_player_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString("server_url", url).apply()
        configure(url)
    }

    fun getSavedUrl(context: Context): String {
        val prefs: SharedPreferences = context.getSharedPreferences("music_player_prefs", Context.MODE_PRIVATE)
        return prefs.getString("server_url", "http://192.168.1.1:5000") ?: "http://192.168.1.1:5000"
    }
}
