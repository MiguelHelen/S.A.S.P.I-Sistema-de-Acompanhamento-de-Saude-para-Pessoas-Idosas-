package com.saspi.mobile

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun LoginScreen(
    onLoginClick: (String, String) -> Unit = { _, _ -> },
    onBiometricClick: () -> Unit = {},
    onForgotPasswordClick: () -> Unit = {}
) {
    var emailOrCpf by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var rememberUser by remember { mutableStateOf(false) }

    val primaryTeal = Color(0xFF00897B)
    val textDark = Color(0xFF0D3B44)
    val graySub = Color(0xFF6C7A89)
    val context = LocalContext.current
    val logoResourceId = remember(context) {
        context.resources.getIdentifier("logo_saspi", "drawable", context.packageName)
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .imePadding()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Top
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            if (logoResourceId != 0) {
                Image(
                    painter = painterResource(id = logoResourceId),
                    contentDescription = "Logo SASPI",
                    modifier = Modifier
                        .height(110.dp)
                        .fillMaxWidth(0.7f)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Bem-vindo(a)!",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = textDark
            )
            Text(
                text = "Faça login para continuar",
                fontSize = 14.sp,
                color = graySub,
                modifier = Modifier.padding(top = 4.dp, bottom = 28.dp)
            )

            OutlinedTextField(
                value = emailOrCpf,
                onValueChange = { emailOrCpf = it },
                placeholder = { Text("E-mail ou CPF", color = graySub) },
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = primaryTeal,
                    unfocusedBorderColor = Color.LightGray,
                    unfocusedContainerColor = Color(0xFFFAFAFA),
                    focusedContainerColor = Color.White
                ),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(14.dp))

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                placeholder = { Text("Senha", color = graySub) },
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Done
                ),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = primaryTeal,
                    unfocusedBorderColor = Color.LightGray,
                    unfocusedContainerColor = Color(0xFFFAFAFA),
                    focusedContainerColor = Color.White
                ),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = rememberUser,
                        onCheckedChange = { rememberUser = it },
                        colors = CheckboxDefaults.colors(checkedColor = primaryTeal)
                    )
                    Text(text = "Manter conectado", fontSize = 13.sp, color = textDark)
                }

                TextButton(onClick = onForgotPasswordClick) {
                    Text(
                        text = "Esqueci a senha",
                        fontSize = 13.sp,
                        color = primaryTeal,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            val gradientButton = Brush.horizontalGradient(
                colors = listOf(Color(0xFF0288D1), Color(0xFF00897B))
            )
            Button(
                onClick = { onLoginClick(emailOrCpf, password) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(gradientButton),
                colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent)
            ) {
                Text(
                    text = "Entrar →",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                HorizontalDivider(modifier = Modifier.weight(1f), color = Color.LightGray)
                Text(
                    text = " ou ",
                    fontSize = 12.sp,
                    color = graySub,
                    modifier = Modifier.padding(horizontal = 8.dp)
                )
                HorizontalDivider(modifier = Modifier.weight(1f), color = Color.LightGray)
            }

            Spacer(modifier = Modifier.height(20.dp))

            OutlinedButton(
                onClick = onBiometricClick,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                Text(
                    text = "Entrar com biometria",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = primaryTeal
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            Text(
                text = "Acesso seguro para cuidar melhor.\nEntre com os dados fornecidos pela clínica.\nCuidar hoje, para viver melhor amanhã.",
                fontSize = 11.sp,
                color = graySub,
                textAlign = TextAlign.Center,
                lineHeight = 16.sp
            )
        }
    }
}