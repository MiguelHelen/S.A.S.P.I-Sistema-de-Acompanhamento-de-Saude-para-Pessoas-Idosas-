package com.saspi.mobile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ProfileScreen(
    onBackClick: () -> Unit = {},
    onLogoutClick: () -> Unit = {}
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
            text = "Perfil e Configurações",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = textDark,
            modifier = Modifier.padding(vertical = 8.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Cabeçalho do Perfil
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFE0F2F1)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(primaryTeal),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "MD", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(text = "Maria das Dores", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = textDark)
                    Text(text = "Idosa • 78 anos", fontSize = 14.sp, color = graySub)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(text = "Opções de Acessibilidade", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = textDark)
        Spacer(modifier = Modifier.height(8.dp))

        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Tamanho da Fonte: Grande", fontSize = 14.sp, color = textDark)
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = "Alto Contraste: Ativado", fontSize = 14.sp, color = textDark)
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = onLogoutClick,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD32F2F)),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth().height(50.dp)
        ) {
            Text(text = "Sair da Conta", color = Color.White, fontWeight = FontWeight.Bold)
        }
    }
}