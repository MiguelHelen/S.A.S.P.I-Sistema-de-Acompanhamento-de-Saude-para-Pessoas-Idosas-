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
fun AlertsScreen(
    onBackClick: () -> Unit = {}
) {
    val primaryTeal = Color(0xFF00897B)
    val textDark = Color(0xFF0D3B44)
    val graySub = Color(0xFF6C7A89)
    val alertRed = Color(0xFFD32F2F)

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
            text = "Alertas",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = textDark,
            modifier = Modifier.padding(vertical = 8.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Alerta Crítico (Vermelho)
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Frequência cardíaca elevada", fontWeight = FontWeight.Bold, color = alertRed, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = "FC: 128 bpm • 16:42", fontSize = 13.sp, color = textDark)
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = "Verifique o estado do paciente, se necessário, procure atendimento médico.", fontSize = 12.sp, color = graySub)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Alerta de Aviso (Amarelo)
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF8E1)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Dose de medicamento pendente", fontWeight = FontWeight.Bold, color = Color(0xFFF57F17), fontSize = 16.sp)
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = "Losartana 50mg • 13:00", fontSize = 13.sp, color = textDark)
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = "A dose ainda não foi confirmada pelo idoso.", fontSize = 12.sp, color = graySub)
            }
        }
    }
}