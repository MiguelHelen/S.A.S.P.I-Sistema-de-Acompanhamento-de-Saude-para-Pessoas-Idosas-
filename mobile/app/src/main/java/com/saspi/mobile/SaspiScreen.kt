
package com.saspi.mobile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ==========================================
// IDENTIDADE VISUAL DO S.A.S.P.I.
// ==========================================

object SaspiColors {
    val blue = Color(0xFF087FAF)
    val teal = Color(0xFF00A99D)
    val dark = Color(0xFF123F65)
    val gray = Color(0xFF718797)

    val background = Color(0xFFF4FAFC)
    val lightBlue = Color(0xFFEAF6FA)
    val lightTeal = Color(0xFFDDF8F2)

    val red = Color(0xFFE75D68)
    val lightRed = Color(0xFFFFEEF0)

    val orange = Color(0xFFF1A64A)
    val lightOrange = Color(0xFFFFF5E8)

    val white = Color.White
}

// ==========================================
// COMPONENTES REUTILIZÁVEIS
// ==========================================

@Composable
fun SaspiButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .height(52.dp),
        shape = RoundedCornerShape(13.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = SaspiColors.teal
        )
    ) {
        Text(
            text = text,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
    }
}

@Composable
fun SaspiOutlinedButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .height(50.dp),
        shape = RoundedCornerShape(13.dp),
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = SaspiColors.teal
        )
    ) {
        Text(
            text = text,
            fontSize = 15.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
fun SaspiCard(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(17.dp),
        colors = CardDefaults.cardColors(
            containerColor = SaspiColors.white
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            content = content
        )
    }
}

@Composable
fun SaspiHeader(
    title: String,
    onBackClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 18.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        TextButton(onClick = onBackClick) {
            Text(
                text = "‹",
                fontSize = 32.sp,
                color = SaspiColors.blue
            )
        }

        Text(
            text = title,
            fontSize = 21.sp,
            fontWeight = FontWeight.Bold,
            color = SaspiColors.dark
        )
    }
}

@Composable
fun SaspiSectionTitle(text: String) {
    Text(
        text = text,
        fontSize = 17.sp,
        fontWeight = FontWeight.Bold,
        color = SaspiColors.dark,
        modifier = Modifier.padding(
            top = 18.dp,
            bottom = 10.dp
        )
    )
}

@Composable
fun SaspiStatus(
    text: String,
    color: Color,
    background: Color
) {
    Surface(
        color = background,
        shape = RoundedCornerShape(20.dp)
    ) {
        Text(
            text = text,
            color = color,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(
                horizontal = 12.dp,
                vertical = 7.dp
            )
        )
    }
}

@Composable
fun SaspiPage(
    content: @Composable ColumnScope.() -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SaspiColors.background)
            .verticalScroll(rememberScrollState())
            .imePadding()
            .padding(
                horizontal = 20.dp,
                vertical = 20.dp
            ),
        content = content
    )
}

// ==========================================
// RECUPERAR ACESSO
// ==========================================

@Composable
fun RecoveryScreen(
    onBackClick: () -> Unit = {}
) {
    var email by remember { mutableStateOf("") }
    var sent by remember { mutableStateOf(false) }
    var showError by remember { mutableStateOf(false) }

    SaspiPage {
        SaspiHeader(
            title = "Recuperar acesso",
            onBackClick = onBackClick
        )

        Spacer(modifier = Modifier.height(28.dp))

        Text(
            text = "Esqueceu sua senha?",
            fontSize = 25.sp,
            fontWeight = FontWeight.Bold,
            color = SaspiColors.dark
        )

        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = "Informe o e-mail cadastrado para receber as instruções de recuperação de acesso.",
            fontSize = 15.sp,
            color = SaspiColors.gray,
            lineHeight = 22.sp
        )

        Spacer(modifier = Modifier.height(24.dp))

        OutlinedTextField(
            value = email,
            onValueChange = {
                email = it
                sent = false
                showError = false
            },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("E-mail") },
            placeholder = { Text("Digite seu e-mail") },
            singleLine = true,
            shape = RoundedCornerShape(13.dp),
            isError = showError,
            keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                keyboardType = androidx.compose.ui.text.input.KeyboardType.Email
            )
        )

        if (showError) {
            Text(
                text = "Informe um e-mail válido.",
                color = SaspiColors.red,
                fontSize = 13.sp,
                modifier = Modifier.padding(top = 6.dp)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        SaspiButton(
            text = "Enviar instruções",
            onClick = {
                if (email.isNotBlank() && email.contains("@") && email.contains(".")) {
                    sent = true
                    showError = false
                } else {
                    showError = true
                    sent = false
                }
            }
        )

        if (sent) {
            Spacer(modifier = Modifier.height(18.dp))

            SaspiCard {
                Text(
                    text = "Solicitação registrada nesta demonstração. A recuperação real depende da integração com o servidor.",
                    color = SaspiColors.teal,
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            }
        }
    }
}

// ==========================================
// ACESSIBILIDADE
// ==========================================

@Composable
fun AccessibilityScreen(
    onBackClick: () -> Unit = {}
) {
    var highContrast by remember { mutableStateOf(true) }
    var simpleText by remember { mutableStateOf(true) }
    var voiceReading by remember { mutableStateOf(false) }
    var fontSize by remember { mutableIntStateOf(16) }

    SaspiPage {
        SaspiHeader(
            title = "Acessibilidade",
            onBackClick = onBackClick
        )

        Text(
            text = "Personalize o aplicativo para tornar o uso mais confortável.",
            color = SaspiColors.gray,
            fontSize = 15.sp,
            lineHeight = 22.sp
        )

        SaspiSectionTitle("Tamanho do texto")

        SaspiCard {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(
                    onClick = {
                        fontSize = (fontSize - 2).coerceAtLeast(12)
                    }
                ) {
                    Text(
                        text = "A−",
                        fontSize = 20.sp,
                        color = SaspiColors.blue
                    )
                }

                Text(
                    text = "Aa",
                    fontSize = fontSize.sp,
                    fontWeight = FontWeight.Bold,
                    color = SaspiColors.dark
                )

                TextButton(
                    onClick = {
                        fontSize = (fontSize + 2).coerceAtMost(28)
                    }
                ) {
                    Text(
                        text = "A+",
                        fontSize = 20.sp,
                        color = SaspiColors.blue
                    )
                }
            }

            Text(
                text = "Tamanho atual: $fontSize sp",
                color = SaspiColors.gray,
                fontSize = 12.sp
            )
        }

        SaspiSectionTitle("Preferências")

        AccessibilitySwitch(
            title = "Alto contraste",
            description = "Aumenta a distinção entre textos e elementos.",
            checked = highContrast,
            onCheckedChange = { highContrast = it }
        )

        AccessibilitySwitch(
            title = "Texto simplificado",
            description = "Prioriza informações claras e fáceis de compreender.",
            checked = simpleText,
            onCheckedChange = { simpleText = it }
        )

        AccessibilitySwitch(
            title = "Leitura em voz alta",
            description = "Opção para ouvir os textos do aplicativo.",
            checked = voiceReading,
            onCheckedChange = { voiceReading = it }
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "As alterações desta tela são demonstrativas e ainda não são aplicadas às demais telas do aplicativo.",
            color = SaspiColors.gray,
            fontSize = 12.sp,
            lineHeight = 18.sp
        )
    }
}

// ==========================================
// ITEM DE CONFIGURAÇÃO DE ACESSIBILIDADE
// ==========================================

@Composable
fun AccessibilitySwitch(
    title: String,
    description: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    SaspiCard(
        modifier = Modifier.padding(bottom = 10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = title,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = SaspiColors.dark
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = description,
                    fontSize = 13.sp,
                    color = SaspiColors.gray,
                    lineHeight = 18.sp
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            Switch(
                checked = checked,
                onCheckedChange = onCheckedChange,
                colors = SwitchDefaults.colors(
                    checkedThumbColor = Color.White,
                    checkedTrackColor = SaspiColors.teal
                )
            )
        }
    }
}
