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
fun MedicationsScreen(
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
            text = "Medicamentos",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = textDark,
            modifier = Modifier.padding(vertical = 8.dp)
        )
        Text(
            text = "Hoje, 10 de novembro",
            fontSize = 14.sp,
            color = graySub
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Medicamento 1 (Pendente)
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Losartana 50mg", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = textDark)
                    Surface(
                        color = Color(0xFFFFEBEE),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = "Pendente",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            fontSize = 12.sp,
                            color = Color(0xFFD32F2F),
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = "🕒 08:00", fontSize = 14.sp, color = graySub)
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = { /* Ação de confirmar dose */ },
                    colors = ButtonDefaults.buttonColors(containerColor = primaryTeal),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(text = "Confirmar dose", color = Color.White)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Medicamento 2 (Agendado)
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Vitamina D 1.000 UI", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = textDark)
                    Surface(
                        color = Color(0xFFE0F2F1),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = "Agendado",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            fontSize = 12.sp,
                            color = primaryTeal,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = "🕒 20:00", fontSize = 14.sp, color = graySub)
            }
        }
    }
}