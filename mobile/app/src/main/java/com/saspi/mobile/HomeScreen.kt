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
fun HomeScreen(
    onNavigateToVitals: () -> Unit = {},
    onNavigateToMedications: () -> Unit = {},
    onNavigateToAlerts: () -> Unit = {},
    onNavigateToConsultas: () -> Unit = {}
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
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(text = "Bom dia!", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = textDark)
                Text(text = "Como você está hoje?", fontSize = 14.sp, color = graySub)
            }
            IconButton(onClick = onNavigateToAlerts) {
                Icon(
                    painter = androidx.compose.ui.res.painterResource(id = android.R.drawable.ic_menu_agenda),
                    contentDescription = "Alertas",
                    tint = primaryTeal
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFE0F2F1)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Medicamentos de hoje", fontWeight = FontWeight.Bold, color = textDark, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = "Losartana 50mg - 08:00", fontSize = 14.sp, color = graySub)
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = onNavigateToMedications,
                    colors = ButtonDefaults.buttonColors(containerColor = primaryTeal),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(text = "Confirmar dose", color = Color.White)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        OutlinedButton(
            onClick = onNavigateToVitals,
            modifier = Modifier.fillMaxWidth().height(50.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(text = "Ver Sinais Vitais e Histórico", color = primaryTeal, fontWeight = FontWeight.SemiBold)
        }

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedButton(
            onClick = onNavigateToConsultas,
            modifier = Modifier.fillMaxWidth().height(50.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(text = "Ver Consultas e Exames", color = primaryTeal, fontWeight = FontWeight.SemiBold)
        }
    }
}