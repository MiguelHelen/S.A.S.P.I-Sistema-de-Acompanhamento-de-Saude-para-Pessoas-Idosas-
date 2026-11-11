package com.saspi.mobile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun VitalsScreen(
    onBackClick: () -> Unit = {}
) {
    val primaryTeal = Color(0xFF00897B)
    val textDark = Color(0xFF0D3B44)
    val graySub = Color(0xFF6C7A89)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .verticalScroll(rememberScrollState())
            .padding(24.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = onBackClick) {
                Text(text = "← Voltar", color = primaryTeal)
            }
        }

        Text(
            text = "Sinais vitais",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = textDark,
            modifier = Modifier.padding(vertical = 8.dp)
        )
        Text(
            text = "Aquí estão as informações de saúde do seu familiar.",
            fontSize = 14.sp,
            color = graySub
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Cards de Métricas (Exemplo: Frequência Cardíaca e SpO2)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Frequência Cardíaca", fontSize = 12.sp, color = graySub)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(text = "72 bpm", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = textDark)
                    Text(text = "Normal", fontSize = 11.sp, color = primaryTeal)
                }
            }

            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "SpO₂", fontSize = 12.sp, color = graySub)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(text = "98%", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = textDark)
                    Text(text = "Normal", fontSize = 11.sp, color = primaryTeal)
                }
            }
        }
    }
}