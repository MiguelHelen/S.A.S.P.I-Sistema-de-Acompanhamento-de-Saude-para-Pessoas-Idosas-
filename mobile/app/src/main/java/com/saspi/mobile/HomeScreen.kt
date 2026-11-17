
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val SaspiBlue = Color(0xFF247BA0)
private val SaspiDarkBlue = Color(0xFF185B7A)
private val SaspiTeal = Color(0xFF38B6A4)
private val SaspiBackground = Color(0xFFF4F9FB)
private val SaspiText = Color(0xFF263B45)

@Composable
fun HomeScreen(
    elderlyName: String = "Maria Oliveira",
    onVitalsClick: () -> Unit = {},
    onMedicationsClick: () -> Unit = {},
    onAlertsClick: () -> Unit = {},
    onConsultasClick: () -> Unit = {},
    onProfileClick: () -> Unit = {},
    onAddMedicationClick: () -> Unit = {},
    onRegisterVitalsClick: () -> Unit = {},
    onSOSClick: () -> Unit = {},
    onHelpClick: () -> Unit = {},
    onCaregiverDashboardClick: () -> Unit = {},
    onSelectElderlyClick: () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SaspiBackground)
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
    ) {

        // Cabeçalho
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Olá,",
                    fontSize = 18.sp,
                    color = SaspiText
                )

                Text(
                    text = elderlyName,
                    fontSize = 25.sp,
                    fontWeight = FontWeight.Bold,
                    color = SaspiDarkBlue
                )

                Text(
                    text = "Acompanhe sua saúde diariamente.",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }

            TextButton(onClick = onProfileClick) {
                Text(
                    text = "Perfil",
                    color = SaspiBlue,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Cartão de boas-vindas
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(
                containerColor = SaspiBlue
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.horizontalGradient(
                            listOf(SaspiBlue, SaspiTeal)
                        )
                    )
                    .padding(22.dp)
            ) {
                Text(
                    text = "Seu bem-estar em primeiro lugar",
                    fontSize = 21.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Consulte seus registros e mantenha sua rotina de cuidados organizada.",
                    fontSize = 15.sp,
                    color = Color.White
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Resumo de saúde",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = SaspiDarkBlue
        )

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            SummaryCard(
                title = "Indicadores",
                description = "Consulte seus registros",
                modifier = Modifier.weight(1f),
                onClick = onVitalsClick
            )

            SummaryCard(
                title = "Medicamentos",
                description = "Veja sua rotina",
                modifier = Modifier.weight(1f),
                onClick = onMedicationsClick
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            SummaryCard(
                title = "Consultas",
                description = "Exames e compromissos",
                modifier = Modifier.weight(1f),
                onClick = onConsultasClick
            )

            SummaryCard(
                title = "Alertas",
                description = "Avisos importantes",
                modifier = Modifier.weight(1f),
                onClick = onAlertsClick
            )
        }

        Spacer(modifier = Modifier.height(26.dp))

        Text(
            text = "Acessos rápidos",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = SaspiDarkBlue
        )

        Spacer(modifier = Modifier.height(12.dp))

        HomeActionButton(
            text = "Registrar indicador de saúde",
            onClick = onRegisterVitalsClick
        )

        HomeActionButton(
            text = "Adicionar medicamento",
            onClick = onAddMedicationClick
        )

        HomeActionButton(
            text = "Área do cuidador",
            onClick = onCaregiverDashboardClick
        )

        HomeActionButton(
            text = "Selecionar pessoa acompanhada",
            onClick = onSelectElderlyClick
        )

        HomeActionButton(
            text = "Ajuda e suporte",
            onClick = onHelpClick
        )

        Spacer(modifier = Modifier.height(12.dp))

        Button(
            onClick = onSOSClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(55.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFFC94C4C)
            )
        ) {
            Text(
                text = "Emergência / SOS",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
private fun SummaryCard(
    title: String,
    description: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier.height(125.dp),
        onClick = onClick,
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = title,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = SaspiBlue
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = description,
                fontSize = 13.sp,
                color = Color.Gray
            )
        }
    }
}

@Composable
private fun HomeActionButton(
    text: String,
    onClick: () -> Unit
) {
    OutlinedButton(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 9.dp)
            .height(52.dp),
        shape = RoundedCornerShape(14.dp),
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = SaspiDarkBlue
        )
    ) {
        Text(
            text = text,
            fontSize = 15.sp,
            fontWeight = FontWeight.Medium
        )
    }
}
