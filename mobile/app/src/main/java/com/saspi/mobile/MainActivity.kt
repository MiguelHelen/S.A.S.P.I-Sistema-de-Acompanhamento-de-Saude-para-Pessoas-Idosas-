package com.saspi.mobile

import android.app.Activity
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val mensagem = TextView(this).apply {
            text = "Acompanhamento de saúde para pessoas idosas"
            textSize = 18f
        }

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 64, 48, 48)

            addView(TextView(this@MainActivity).apply {
                text = "S.A.S.P.I."
                textSize = 28f
            })

            addView(mensagem)

            addView(Button(this@MainActivity).apply {
                text = "Ver saúde"
                setOnClickListener {
                    mensagem.text = "Tela de saúde em construção"
                }
            })
        }

        setContentView(layout)
    }
}
