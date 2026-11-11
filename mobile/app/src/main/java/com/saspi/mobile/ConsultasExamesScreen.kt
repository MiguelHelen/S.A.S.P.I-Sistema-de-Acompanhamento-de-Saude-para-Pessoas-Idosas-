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
fun ConsultasExamesScreen(
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
            text = "Consultas e exames",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = textDark,
            modifier = Modifier.padding(vertical = 8.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(text = "Próxima consulta", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = textDark)
        Spacer(modifier = Modifier.height(8.dp))

        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Cardiologista", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = primaryTeal)
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = "📅 24/10/2026 • 10:00", fontSize = 13.sp, color = textDark)
                Text(text = "🏥 Hospital São Lucas - São Paulo - SP", fontSize = 13.sp, color = graySub)
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = "Preparo: Jejum de 8 horas", fontSize = 12.sp, color = Color(0xFFD32F2F))
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(text = "Exames", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = textDark)
        Spacer(modifier = Modifier.height(8.dp))

        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Exame de sangue", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = textDark)
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = "Agendado • 28/10/2026", fontSize = 13.sp, color = graySub)
            }
        }
    }
}