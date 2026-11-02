package com.saspi.mobile

import android.animation.Animator
import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.SpannableStringBuilder
import android.text.Spanned
import android.text.style.ForegroundColorSpan
import android.view.View
import android.widget.TextView

class SplashActivity : Activity() {

    private val handler = Handler(Looper.getMainLooper())
    private val animadores = mutableListOf<Animator>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        montarSlogan()
        animarPontos()

        handler.postDelayed({
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }, 2500)
    }

    private fun montarSlogan() {
        val teal = getColor(R.color.saspi_teal)
        val verde = getColor(R.color.saspi_green)

        val texto = SpannableStringBuilder().apply {
            colorir("Mais ", teal)
            colorir("cuidado ", verde)
            colorir("hoje, mais ", teal)
            colorir("independência ", verde)
            colorir("amanhã", teal)
        }
        findViewById<TextView>(R.id.txtSlogan).text = texto
    }

    private fun SpannableStringBuilder.colorir(trecho: String, cor: Int) {
        val inicio = length
        append(trecho)
        setSpan(ForegroundColorSpan(cor), inicio, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
    }

    private fun animarPontos() {
        listOf(R.id.dot1, R.id.dot2, R.id.dot3).forEachIndexed { i, id ->
            val anim = ObjectAnimator.ofFloat(findViewById<View>(id), View.ALPHA, 0.25f, 1f).apply {
                duration = 600
                startDelay = i * 200L
                repeatMode = ValueAnimator.REVERSE
                repeatCount = ValueAnimator.INFINITE
            }
            animadores.add(anim)
            anim.start()
        }
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        animadores.forEach { it.cancel() }
        super.onDestroy()
    }
}